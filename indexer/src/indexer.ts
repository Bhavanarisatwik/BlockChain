import { ethers } from 'ethers';
import { SupplyChainABI } from './abi';
import {
  Product,
  Batch,
  Transfer,
  DocumentRecord,
  SensorData,
  IndexerState,
} from './models';
import { logger } from './utils/logger';

export class EventIndexer {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private isRunning: boolean = false;
  private pollingInterval: number;
  private batchSize: number;

  constructor(
    rpcUrl: string,
    contractAddress: string,
    pollingInterval: number = 5000,
    batchSize: number = 1000
  ) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contract = new ethers.Contract(contractAddress, SupplyChainABI, this.provider);
    this.pollingInterval = pollingInterval;
    this.batchSize = batchSize;
  }

  async start(startBlock?: number): Promise<void> {
    if (this.isRunning) {
      logger.warn('Indexer is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting event indexer...');

    // Get last indexed block from database
    let fromBlock = startBlock ?? 0;
    const state = await IndexerState.findOne({ key: 'lastIndexedBlock' });
    if (state) {
      fromBlock = state.value + 1;
    }

    // Start polling loop
    this.pollEvents(fromBlock);
  }

  stop(): void {
    this.isRunning = false;
    logger.info('Stopping event indexer...');
  }

  private async pollEvents(fromBlock: number): Promise<void> {
    while (this.isRunning) {
      try {
        const currentBlock = await this.provider.getBlockNumber();
        
        if (fromBlock <= currentBlock) {
          const toBlock = Math.min(fromBlock + this.batchSize - 1, currentBlock);
          
          logger.debug(`Indexing blocks ${fromBlock} to ${toBlock}`);
          
          await this.indexBlockRange(fromBlock, toBlock);
          
          // Update last indexed block
          await IndexerState.findOneAndUpdate(
            { key: 'lastIndexedBlock' },
            { value: toBlock, updatedAt: new Date() },
            { upsert: true }
          );
          
          fromBlock = toBlock + 1;
        } else {
          // Wait for new blocks
          await this.sleep(this.pollingInterval);
        }
      } catch (error) {
        logger.error('Error in polling loop:', error);
        await this.sleep(this.pollingInterval);
      }
    }
  }

  private async indexBlockRange(fromBlock: number, toBlock: number): Promise<void> {
    // Query all events in parallel
    const [
      productEvents,
      batchEvents,
      transferEvents,
      documentEvents,
      sensorEvents,
      recallEvents,
    ] = await Promise.all([
      this.contract.queryFilter(this.contract.filters.ProductCreated(), fromBlock, toBlock),
      this.contract.queryFilter(this.contract.filters.BatchCreated(), fromBlock, toBlock),
      this.contract.queryFilter(this.contract.filters.BatchTransferred(), fromBlock, toBlock),
      this.contract.queryFilter(this.contract.filters.DocumentAttached(), fromBlock, toBlock),
      this.contract.queryFilter(this.contract.filters.SensorDataAnchored(), fromBlock, toBlock),
      this.contract.queryFilter(this.contract.filters.BatchRecalled(), fromBlock, toBlock),
    ]);

    // Process events
    for (const event of productEvents) {
      await this.handleProductCreated(event);
    }

    for (const event of batchEvents) {
      await this.handleBatchCreated(event);
    }

    for (const event of transferEvents) {
      await this.handleBatchTransferred(event);
    }

    for (const event of documentEvents) {
      await this.handleDocumentAttached(event);
    }

    for (const event of sensorEvents) {
      await this.handleSensorDataAnchored(event);
    }

    for (const event of recallEvents) {
      await this.handleBatchRecalled(event);
    }

    const totalEvents = 
      productEvents.length + batchEvents.length + transferEvents.length + 
      documentEvents.length + sensorEvents.length + recallEvents.length;
    
    if (totalEvents > 0) {
      logger.info(`Processed ${totalEvents} events from blocks ${fromBlock}-${toBlock}`);
    }
  }

  private async handleProductCreated(event: ethers.EventLog | ethers.Log): Promise<void> {
    try {
      const log = event as ethers.EventLog;
      const productId = Number(log.args[0]);
      const name = log.args[1];
      const manufacturer = log.args[2];

      // Get full product details from contract
      const productData = await this.contract.getProduct(productId);
      const block = await event.getBlock();

      await Product.findOneAndUpdate(
        { productId },
        {
          productId,
          name: productData.name,
          description: productData.description,
          manufacturer: productData.manufacturer,
          metadataURI: productData.metadataURI,
          createdAt: new Date(Number(productData.createdAt) * 1000),
          active: productData.active,
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
        },
        { upsert: true }
      );

      logger.debug(`Indexed ProductCreated: ${productId} - ${name}`);
    } catch (error) {
      logger.error('Error handling ProductCreated:', error);
    }
  }

  private async handleBatchCreated(event: ethers.EventLog | ethers.Log): Promise<void> {
    try {
      const log = event as ethers.EventLog;
      const batchId = Number(log.args[0]);
      const productId = Number(log.args[1]);
      const owner = log.args[2];
      const quantity = Number(log.args[3]);

      const block = await event.getBlock();

      await Batch.findOneAndUpdate(
        { batchId },
        {
          batchId,
          productId,
          quantity,
          currentOwner: owner,
          createdAt: new Date(block.timestamp * 1000),
          recalled: false,
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
        },
        { upsert: true }
      );

      logger.debug(`Indexed BatchCreated: ${batchId}`);
    } catch (error) {
      logger.error('Error handling BatchCreated:', error);
    }
  }

  private async handleBatchTransferred(event: ethers.EventLog | ethers.Log): Promise<void> {
    try {
      const log = event as ethers.EventLog;
      const batchId = Number(log.args[0]);
      const from = log.args[1];
      const to = log.args[2];
      const location = log.args[3];

      const block = await event.getBlock();

      // Create transfer record
      await Transfer.create({
        batchId,
        from,
        to,
        location,
        timestamp: new Date(block.timestamp * 1000),
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
      });

      // Update batch owner
      await Batch.findOneAndUpdate(
        { batchId },
        { currentOwner: to }
      );

      logger.debug(`Indexed BatchTransferred: ${batchId} from ${from} to ${to}`);
    } catch (error) {
      logger.error('Error handling BatchTransferred:', error);
    }
  }

  private async handleDocumentAttached(event: ethers.EventLog | ethers.Log): Promise<void> {
    try {
      const log = event as ethers.EventLog;
      const batchId = Number(log.args[0]);
      const ipfsCID = log.args[1];
      const documentType = log.args[2];
      const attachedBy = log.args[3];

      const block = await event.getBlock();

      await DocumentRecord.create({
        batchId,
        ipfsCID,
        documentType,
        attachedBy,
        timestamp: new Date(block.timestamp * 1000),
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
      });

      logger.debug(`Indexed DocumentAttached: ${batchId} - ${documentType}`);
    } catch (error) {
      logger.error('Error handling DocumentAttached:', error);
    }
  }

  private async handleSensorDataAnchored(event: ethers.EventLog | ethers.Log): Promise<void> {
    try {
      const log = event as ethers.EventLog;
      const batchId = Number(log.args[0]);
      const dataHash = log.args[1];
      const temperature = Number(log.args[2]);
      const humidity = Number(log.args[3]);
      const location = log.args[4];

      const block = await event.getBlock();

      await SensorData.create({
        batchId,
        dataHash,
        temperature,
        humidity,
        location,
        timestamp: new Date(block.timestamp * 1000),
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
      });

      logger.debug(`Indexed SensorDataAnchored: ${batchId}`);
    } catch (error) {
      logger.error('Error handling SensorDataAnchored:', error);
    }
  }

  private async handleBatchRecalled(event: ethers.EventLog | ethers.Log): Promise<void> {
    try {
      const log = event as ethers.EventLog;
      const batchId = Number(log.args[0]);
      const reason = log.args[1];

      await Batch.findOneAndUpdate(
        { batchId },
        { recalled: true, recallReason: reason }
      );

      logger.debug(`Indexed BatchRecalled: ${batchId} - ${reason}`);
    } catch (error) {
      logger.error('Error handling BatchRecalled:', error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
