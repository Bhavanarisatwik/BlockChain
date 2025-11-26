import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import {
  Product,
  Batch,
  Transfer,
  DocumentRecord,
  SensorData,
} from './models';
import { logger } from './utils/logger';

export function createApiServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Request logging
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Stats endpoint
  app.get('/api/stats', async (req: Request, res: Response) => {
    try {
      const [products, batches, transfers, documents] = await Promise.all([
        Product.countDocuments(),
        Batch.countDocuments(),
        Transfer.countDocuments(),
        DocumentRecord.countDocuments(),
      ]);

      res.json({
        totalProducts: products,
        totalBatches: batches,
        totalTransfers: transfers,
        totalDocuments: documents,
      });
    } catch (error) {
      logger.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Products endpoints
  app.get('/api/products', async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 20, manufacturer, active } = req.query;
      
      const query: any = {};
      if (manufacturer) query.manufacturer = manufacturer;
      if (active !== undefined) query.active = active === 'true';

      const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const total = await Product.countDocuments(query);

      res.json({
        data: products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('Error fetching products:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/products/:productId', async (req: Request, res: Response) => {
    try {
      const product = await Product.findOne({ productId: Number(req.params.productId) });
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      logger.error('Error fetching product:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Batches endpoints
  app.get('/api/batches', async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 20, productId, owner, recalled } = req.query;
      
      const query: any = {};
      if (productId) query.productId = Number(productId);
      if (owner) query.currentOwner = owner;
      if (recalled !== undefined) query.recalled = recalled === 'true';

      const batches = await Batch.find(query)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const total = await Batch.countDocuments(query);

      res.json({
        data: batches,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('Error fetching batches:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/batches/:batchId', async (req: Request, res: Response) => {
    try {
      const batchId = Number(req.params.batchId);
      
      const [batch, transfers, documents, sensorData] = await Promise.all([
        Batch.findOne({ batchId }),
        Transfer.find({ batchId }).sort({ timestamp: 1 }),
        DocumentRecord.find({ batchId }).sort({ timestamp: -1 }),
        SensorData.find({ batchId }).sort({ timestamp: -1 }),
      ]);

      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }

      // Get product info
      const product = await Product.findOne({ productId: batch.productId });

      res.json({
        batch,
        product,
        transfers,
        documents,
        sensorData,
      });
    } catch (error) {
      logger.error('Error fetching batch:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Provenance endpoint (full history)
  app.get('/api/provenance/:batchId', async (req: Request, res: Response) => {
    try {
      const batchId = Number(req.params.batchId);
      
      const batch = await Batch.findOne({ batchId });
      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }

      const product = await Product.findOne({ productId: batch.productId });
      const transfers = await Transfer.find({ batchId }).sort({ timestamp: 1 });
      const documents = await DocumentRecord.find({ batchId }).sort({ timestamp: 1 });
      const sensorData = await SensorData.find({ batchId }).sort({ timestamp: 1 });

      // Build provenance timeline
      const timeline = [
        {
          type: 'created',
          title: 'Batch Created',
          timestamp: batch.createdAt,
          data: {
            productId: batch.productId,
            productName: product?.name,
            quantity: batch.quantity,
            manufacturer: product?.manufacturer,
          },
        },
        ...transfers.map(t => ({
          type: 'transfer',
          title: 'Custody Transfer',
          timestamp: t.timestamp,
          data: {
            from: t.from,
            to: t.to,
            location: t.location,
          },
        })),
        ...documents.map(d => ({
          type: 'document',
          title: `Document: ${d.documentType}`,
          timestamp: d.timestamp,
          data: {
            ipfsCID: d.ipfsCID,
            documentType: d.documentType,
            attachedBy: d.attachedBy,
          },
        })),
        ...sensorData.map(s => ({
          type: 'sensor',
          title: 'Sensor Data',
          timestamp: s.timestamp,
          data: {
            temperature: s.temperature,
            humidity: s.humidity,
            location: s.location,
          },
        })),
      ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      if (batch.recalled) {
        timeline.push({
          type: 'recall',
          title: 'Batch Recalled',
          timestamp: new Date(),
          data: {
            recallReason: batch.recallReason,
            recalledBy: 'auditor',
          },
        } as any);
      }

      res.json({
        batch,
        product,
        timeline,
        verified: true,
        totalTransfers: transfers.length,
        totalDocuments: documents.length,
      });
    } catch (error) {
      logger.error('Error fetching provenance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Transfers endpoints
  app.get('/api/transfers', async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 20, batchId, from, to } = req.query;
      
      const query: any = {};
      if (batchId) query.batchId = Number(batchId);
      if (from) query.from = from;
      if (to) query.to = to;

      const transfers = await Transfer.find(query)
        .sort({ timestamp: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const total = await Transfer.countDocuments(query);

      res.json({
        data: transfers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('Error fetching transfers:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Search endpoint
  app.get('/api/search', async (req: Request, res: Response) => {
    try {
      const { q, type } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: 'Search query required' });
      }

      const searchRegex = new RegExp(q as string, 'i');
      const results: any = {};

      if (!type || type === 'products') {
        results.products = await Product.find({
          $or: [
            { name: searchRegex },
            { description: searchRegex },
          ],
        }).limit(10);
      }

      if (!type || type === 'batches') {
        // Search by batch ID or product name
        const matchingProducts = await Product.find({ name: searchRegex });
        const productIds = matchingProducts.map(p => p.productId);
        
        results.batches = await Batch.find({
          $or: [
            { batchId: isNaN(Number(q)) ? undefined : Number(q) },
            { productId: { $in: productIds } },
          ].filter(Boolean),
        }).limit(10);
      }

      res.json(results);
    } catch (error) {
      logger.error('Error searching:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Error handling middleware
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
