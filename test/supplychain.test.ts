import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { SupplyChain } from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("SupplyChain", function () {
  let supplyChain: SupplyChain;
  let admin: SignerWithAddress;
  let manufacturer: SignerWithAddress;
  let logistics: SignerWithAddress;
  let retailer: SignerWithAddress;
  let auditor: SignerWithAddress;
  let consumer: SignerWithAddress;

  // Role constants
  let DEFAULT_ADMIN_ROLE: string;
  let MANUFACTURER_ROLE: string;
  let LOGISTICS_ROLE: string;
  let RETAILER_ROLE: string;
  let AUDITOR_ROLE: string;

  // Test data
  const PRODUCT_ID = 1;
  const BATCH_ID = 100;
  const PRODUCT_META_URI = "ipfs://QmProductMetadata123";
  const BATCH_META_URI = "ipfs://QmBatchMetadata456";
  const DOCUMENT_CID = "QmDocumentCID789";
  const QUANTITY = 1000;

  beforeEach(async function () {
    // Get signers
    [admin, manufacturer, logistics, retailer, auditor, consumer] = await ethers.getSigners();

    // Deploy contract
    const SupplyChainFactory = await ethers.getContractFactory("SupplyChain");
    supplyChain = await SupplyChainFactory.deploy(admin.address);
    await supplyChain.waitForDeployment();

    // Get role hashes
    DEFAULT_ADMIN_ROLE = await supplyChain.DEFAULT_ADMIN_ROLE();
    MANUFACTURER_ROLE = await supplyChain.MANUFACTURER();
    LOGISTICS_ROLE = await supplyChain.LOGISTICS();
    RETAILER_ROLE = await supplyChain.RETAILER();
    AUDITOR_ROLE = await supplyChain.AUDITOR();

    // Setup roles
    await supplyChain.connect(admin).assignRole(MANUFACTURER_ROLE, manufacturer.address);
    await supplyChain.connect(admin).assignRole(LOGISTICS_ROLE, logistics.address);
    await supplyChain.connect(admin).assignRole(RETAILER_ROLE, retailer.address);
    await supplyChain.connect(admin).assignRole(AUDITOR_ROLE, auditor.address);
  });

  describe("Deployment", function () {
    it("Should set the correct admin", async function () {
      expect(await supplyChain.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
    });

    it("Should grant manufacturer role to admin", async function () {
      expect(await supplyChain.hasRole(MANUFACTURER_ROLE, admin.address)).to.be.true;
    });

    it("Should grant auditor role to admin", async function () {
      expect(await supplyChain.hasRole(AUDITOR_ROLE, admin.address)).to.be.true;
    });

    it("Should revert deployment with zero address", async function () {
      const SupplyChainFactory = await ethers.getContractFactory("SupplyChain");
      await expect(
        SupplyChainFactory.deploy(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(supplyChain, "InvalidAddress");
    });
  });

  describe("Product Creation", function () {
    it("Should create a product successfully", async function () {
      const tx = await supplyChain.connect(manufacturer).createProduct(PRODUCT_ID, PRODUCT_META_URI);
      await expect(tx).to.emit(supplyChain, "ProductCreated");

      const product = await supplyChain.getProduct(PRODUCT_ID);
      expect(product.id).to.equal(PRODUCT_ID);
      expect(product.metaURI).to.equal(PRODUCT_META_URI);
      expect(product.manufacturer).to.equal(manufacturer.address);
      expect(product.exists).to.be.true;
    });

    it("Should revert if non-manufacturer creates product", async function () {
      await expect(
        supplyChain.connect(consumer).createProduct(PRODUCT_ID, PRODUCT_META_URI)
      ).to.be.reverted;
    });

    it("Should revert if product already exists", async function () {
      await supplyChain.connect(manufacturer).createProduct(PRODUCT_ID, PRODUCT_META_URI);
      await expect(
        supplyChain.connect(manufacturer).createProduct(PRODUCT_ID, PRODUCT_META_URI)
      ).to.be.revertedWithCustomError(supplyChain, "ProductAlreadyExists");
    });

    it("Should revert with empty metaURI", async function () {
      await expect(
        supplyChain.connect(manufacturer).createProduct(PRODUCT_ID, "")
      ).to.be.revertedWithCustomError(supplyChain, "EmptyMetaURI");
    });

    it("Should increment total products", async function () {
      await supplyChain.connect(manufacturer).createProduct(PRODUCT_ID, PRODUCT_META_URI);
      const stats = await supplyChain.getStats();
      expect(stats._totalProducts).to.equal(1);
    });

    it("Should track product IDs", async function () {
      await supplyChain.connect(manufacturer).createProduct(1, PRODUCT_META_URI);
      await supplyChain.connect(manufacturer).createProduct(2, PRODUCT_META_URI);
      
      const productIds = await supplyChain.getAllProductIds();
      expect(productIds.length).to.equal(2);
      expect(productIds[0]).to.equal(1);
      expect(productIds[1]).to.equal(2);
    });
  });

  describe("Batch Creation", function () {
    beforeEach(async function () {
      await supplyChain.connect(manufacturer).createProduct(PRODUCT_ID, PRODUCT_META_URI);
    });

    it("Should create a batch successfully", async function () {
      const manufactureDate = Math.floor(Date.now() / 1000);
      
      await expect(
        supplyChain.connect(manufacturer).createBatch(
          BATCH_ID,
          PRODUCT_ID,
          QUANTITY,
          manufactureDate,
          BATCH_META_URI
        )
      ).to.emit(supplyChain, "BatchCreated");

      const batch = await supplyChain.getBatch(BATCH_ID);
      expect(batch.id).to.equal(BATCH_ID);
      expect(batch.productId).to.equal(PRODUCT_ID);
      expect(batch.quantity).to.equal(QUANTITY);
      expect(batch.metaURI).to.equal(BATCH_META_URI);
      expect(batch.currentOwner).to.equal(manufacturer.address);
      expect(batch.recalled).to.be.false;
      expect(batch.exists).to.be.true;
    });

    it("Should revert if non-manufacturer creates batch", async function () {
      await expect(
        supplyChain.connect(consumer).createBatch(BATCH_ID, PRODUCT_ID, QUANTITY, 0, BATCH_META_URI)
      ).to.be.reverted;
    });

    it("Should revert if product doesn't exist", async function () {
      await expect(
        supplyChain.connect(manufacturer).createBatch(BATCH_ID, 999, QUANTITY, 0, BATCH_META_URI)
      ).to.be.revertedWithCustomError(supplyChain, "ProductDoesNotExist");
    });

    it("Should revert if batch already exists", async function () {
      await supplyChain.connect(manufacturer).createBatch(BATCH_ID, PRODUCT_ID, QUANTITY, 0, BATCH_META_URI);
      await expect(
        supplyChain.connect(manufacturer).createBatch(BATCH_ID, PRODUCT_ID, QUANTITY, 0, BATCH_META_URI)
      ).to.be.revertedWithCustomError(supplyChain, "BatchAlreadyExists");
    });

    it("Should revert with zero quantity", async function () {
      await expect(
        supplyChain.connect(manufacturer).createBatch(BATCH_ID, PRODUCT_ID, 0, 0, BATCH_META_URI)
      ).to.be.revertedWithCustomError(supplyChain, "InvalidQuantity");
    });

    it("Should track batches by owner", async function () {
      await supplyChain.connect(manufacturer).createBatch(BATCH_ID, PRODUCT_ID, QUANTITY, 0, BATCH_META_URI);
      
      const ownerBatches = await supplyChain.getBatchesByOwner(manufacturer.address);
      expect(ownerBatches.length).to.equal(1);
      expect(ownerBatches[0]).to.equal(BATCH_ID);
    });
  });

  describe("Batch Transfer", function () {
    beforeEach(async function () {
      await supplyChain.connect(manufacturer).createProduct(PRODUCT_ID, PRODUCT_META_URI);
      await supplyChain.connect(manufacturer).createBatch(BATCH_ID, PRODUCT_ID, QUANTITY, 0, BATCH_META_URI);
    });

    it("Should transfer batch successfully", async function () {
      const location = "Warehouse A, Mumbai";
      const proof = "ipfs://QmTransferProof123";

      const tx = await supplyChain.connect(manufacturer).transferBatch(BATCH_ID, logistics.address, location, proof);
      await expect(tx).to.emit(supplyChain, "BatchTransferred");

      const batch = await supplyChain.getBatch(BATCH_ID);
      expect(batch.currentOwner).to.equal(logistics.address);
    });

    it("Should record transfer history", async function () {
      await supplyChain.connect(manufacturer).transferBatch(BATCH_ID, logistics.address, "Location 1", "Proof 1");
      await supplyChain.connect(logistics).transferBatch(BATCH_ID, retailer.address, "Location 2", "Proof 2");

      const transfers = await supplyChain.getBatchTransfers(BATCH_ID);
      expect(transfers.length).to.equal(2);
      expect(transfers[0].from).to.equal(manufacturer.address);
      expect(transfers[0].to).to.equal(logistics.address);
      expect(transfers[1].from).to.equal(logistics.address);
      expect(transfers[1].to).to.equal(retailer.address);
    });

    it("Should revert if not batch owner", async function () {
      await expect(
        supplyChain.connect(logistics).transferBatch(BATCH_ID, retailer.address, "", "")
      ).to.be.revertedWithCustomError(supplyChain, "NotBatchOwner");
    });

    it("Should revert transfer to zero address", async function () {
      await expect(
        supplyChain.connect(manufacturer).transferBatch(BATCH_ID, ethers.ZeroAddress, "", "")
      ).to.be.revertedWithCustomError(supplyChain, "InvalidAddress");
    });

    it("Should revert transfer of non-existent batch", async function () {
      await expect(
        supplyChain.connect(manufacturer).transferBatch(999, logistics.address, "", "")
      ).to.be.revertedWithCustomError(supplyChain, "BatchDoesNotExist");
    });

    it("Should revert transfer of recalled batch", async function () {
      await supplyChain.connect(auditor).recallBatch(BATCH_ID, "Contamination");
      await expect(
        supplyChain.connect(manufacturer).transferBatch(BATCH_ID, logistics.address, "", "")
      ).to.be.revertedWithCustomError(supplyChain, "BatchIsRecalled");
    });

    it("Should increment total transfers", async function () {
      await supplyChain.connect(manufacturer).transferBatch(BATCH_ID, logistics.address, "", "");
      const stats = await supplyChain.getStats();
      expect(stats._totalTransfers).to.equal(1);
    });
  });

  describe("Document Attachment", function () {
    beforeEach(async function () {
      await supplyChain.connect(manufacturer).createProduct(PRODUCT_ID, PRODUCT_META_URI);
      await supplyChain.connect(manufacturer).createBatch(BATCH_ID, PRODUCT_ID, QUANTITY, 0, BATCH_META_URI);
    });

    it("Should attach document by manufacturer", async function () {
      await expect(
        supplyChain.connect(manufacturer).attachDocument(BATCH_ID, DOCUMENT_CID, "Certificate")
      ).to.emit(supplyChain, "DocumentAttached");

      const docs = await supplyChain.getBatchDocuments(BATCH_ID);
      expect(docs.length).to.equal(1);
      expect(docs[0].ipfsCID).to.equal(DOCUMENT_CID);
      expect(docs[0].documentType).to.equal("Certificate");
      expect(docs[0].attachedBy).to.equal(manufacturer.address);
    });

    it("Should attach document by current owner", async function () {
      await supplyChain.connect(manufacturer).transferBatch(BATCH_ID, logistics.address, "", "");
      
      await expect(
        supplyChain.connect(logistics).attachDocument(BATCH_ID, DOCUMENT_CID, "Transit Doc")
      ).to.emit(supplyChain, "DocumentAttached");
    });

    it("Should attach document by auditor", async function () {
      await expect(
        supplyChain.connect(auditor).attachDocument(BATCH_ID, DOCUMENT_CID, "Inspection Report")
      ).to.emit(supplyChain, "DocumentAttached");
    });

    it("Should revert attachment by unauthorized user", async function () {
      await expect(
        supplyChain.connect(consumer).attachDocument(BATCH_ID, DOCUMENT_CID, "Fake Doc")
      ).to.be.revertedWith("Not authorized to attach documents");
    });

    it("Should attach multiple documents", async function () {
      await supplyChain.connect(manufacturer).attachDocument(BATCH_ID, "CID1", "Type1");
      await supplyChain.connect(manufacturer).attachDocument(BATCH_ID, "CID2", "Type2");
      await supplyChain.connect(manufacturer).attachDocument(BATCH_ID, "CID3", "Type3");

      const docs = await supplyChain.getBatchDocuments(BATCH_ID);
      expect(docs.length).to.equal(3);
    });
  });

  describe("Sensor Data Anchoring", function () {
    beforeEach(async function () {
      await supplyChain.connect(manufacturer).createProduct(PRODUCT_ID, PRODUCT_META_URI);
      await supplyChain.connect(manufacturer).createBatch(BATCH_ID, PRODUCT_ID, QUANTITY, 0, BATCH_META_URI);
    });

    it("Should anchor sensor data by manufacturer", async function () {
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("temperature:25C,humidity:60%"));
      
      await expect(
        supplyChain.connect(manufacturer).anchorSensorData(BATCH_ID, dataHash, "Temperature")
      ).to.emit(supplyChain, "SensorDataAnchored");

      const records = await supplyChain.getBatchSensorRecords(BATCH_ID);
      expect(records.length).to.equal(1);
      expect(records[0].dataHash).to.equal(dataHash);
      expect(records[0].sensorType).to.equal("Temperature");
    });

    it("Should anchor sensor data by logistics", async function () {
      await supplyChain.connect(manufacturer).transferBatch(BATCH_ID, logistics.address, "", "");
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes("location:GPS123"));
      
      await expect(
        supplyChain.connect(logistics).anchorSensorData(BATCH_ID, dataHash, "GPS")
      ).to.emit(supplyChain, "SensorDataAnchored");
    });
  });

  describe("Batch Recall", function () {
    beforeEach(async function () {
      await supplyChain.connect(manufacturer).createProduct(PRODUCT_ID, PRODUCT_META_URI);
      await supplyChain.connect(manufacturer).createBatch(BATCH_ID, PRODUCT_ID, QUANTITY, 0, BATCH_META_URI);
    });

    it("Should recall batch successfully", async function () {
      const reason = "Contamination detected";
      
      const tx = await supplyChain.connect(auditor).recallBatch(BATCH_ID, reason);
      await expect(tx).to.emit(supplyChain, "BatchRecalled");

      const batch = await supplyChain.getBatch(BATCH_ID);
      expect(batch.recalled).to.be.true;
      expect(batch.recallReason).to.equal(reason);
    });

    it("Should revert if non-auditor recalls", async function () {
      await expect(
        supplyChain.connect(manufacturer).recallBatch(BATCH_ID, "reason")
      ).to.be.reverted;
    });

    it("Should revert recall of non-existent batch", async function () {
      await expect(
        supplyChain.connect(auditor).recallBatch(999, "reason")
      ).to.be.revertedWithCustomError(supplyChain, "BatchDoesNotExist");
    });
  });

  describe("Role Management", function () {
    it("Should assign role successfully", async function () {
      await expect(
        supplyChain.connect(admin).assignRole(MANUFACTURER_ROLE, consumer.address)
      ).to.emit(supplyChain, "RoleAssigned");

      expect(await supplyChain.hasRole(MANUFACTURER_ROLE, consumer.address)).to.be.true;
    });

    it("Should remove role successfully", async function () {
      await supplyChain.connect(admin).assignRole(MANUFACTURER_ROLE, consumer.address);
      
      // Just verify the transaction succeeds (not checking event due to OpenZeppelin overload)
      await supplyChain.connect(admin).removeRole(MANUFACTURER_ROLE, consumer.address);

      expect(await supplyChain.hasRole(MANUFACTURER_ROLE, consumer.address)).to.be.false;
    });

    it("Should revert role assignment by non-admin", async function () {
      await expect(
        supplyChain.connect(manufacturer).assignRole(LOGISTICS_ROLE, consumer.address)
      ).to.be.reverted;
    });

    it("Should revert assigning role to zero address", async function () {
      await expect(
        supplyChain.connect(admin).assignRole(MANUFACTURER_ROLE, ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(supplyChain, "InvalidAddress");
    });

    it("Should check role correctly", async function () {
      expect(await supplyChain.checkRole(MANUFACTURER_ROLE, manufacturer.address)).to.be.true;
      expect(await supplyChain.checkRole(MANUFACTURER_ROLE, consumer.address)).to.be.false;
    });
  });

  describe("Pause Functionality", function () {
    it("Should pause contract", async function () {
      await supplyChain.connect(admin).pause();
      expect(await supplyChain.paused()).to.be.true;
    });

    it("Should unpause contract", async function () {
      await supplyChain.connect(admin).pause();
      await supplyChain.connect(admin).unpause();
      expect(await supplyChain.paused()).to.be.false;
    });

    it("Should revert operations when paused", async function () {
      await supplyChain.connect(admin).pause();
      
      await expect(
        supplyChain.connect(manufacturer).createProduct(PRODUCT_ID, PRODUCT_META_URI)
      ).to.be.reverted;
    });

    it("Should revert pause by non-admin", async function () {
      await expect(
        supplyChain.connect(manufacturer).pause()
      ).to.be.reverted;
    });
  });

  describe("Provenance Verification", function () {
    beforeEach(async function () {
      await supplyChain.connect(manufacturer).createProduct(PRODUCT_ID, PRODUCT_META_URI);
      await supplyChain.connect(manufacturer).createBatch(BATCH_ID, PRODUCT_ID, QUANTITY, 0, BATCH_META_URI);
      await supplyChain.connect(manufacturer).attachDocument(BATCH_ID, DOCUMENT_CID, "Certificate");
      await supplyChain.connect(manufacturer).transferBatch(BATCH_ID, logistics.address, "Mumbai", "Proof1");
      await supplyChain.connect(logistics).transferBatch(BATCH_ID, retailer.address, "Delhi", "Proof2");
    });

    it("Should return complete provenance", async function () {
      const [batch, transfers, documents, product] = await supplyChain.verifyProvenance(BATCH_ID);

      expect(batch.id).to.equal(BATCH_ID);
      expect(batch.productId).to.equal(PRODUCT_ID);
      expect(batch.currentOwner).to.equal(retailer.address);
      
      expect(transfers.length).to.equal(2);
      expect(transfers[0].from).to.equal(manufacturer.address);
      expect(transfers[1].to).to.equal(retailer.address);
      
      expect(documents.length).to.equal(1);
      expect(documents[0].ipfsCID).to.equal(DOCUMENT_CID);
      
      expect(product.id).to.equal(PRODUCT_ID);
      expect(product.metaURI).to.equal(PRODUCT_META_URI);
    });

    it("Should be callable by anyone (public verification)", async function () {
      const [batch, , , ] = await supplyChain.connect(consumer).verifyProvenance(BATCH_ID);
      expect(batch.exists).to.be.true;
    });
  });

  describe("Statistics", function () {
    it("Should return correct stats", async function () {
      await supplyChain.connect(manufacturer).createProduct(1, PRODUCT_META_URI);
      await supplyChain.connect(manufacturer).createProduct(2, PRODUCT_META_URI);
      await supplyChain.connect(manufacturer).createBatch(100, 1, QUANTITY, 0, BATCH_META_URI);
      await supplyChain.connect(manufacturer).createBatch(101, 2, QUANTITY, 0, BATCH_META_URI);
      await supplyChain.connect(manufacturer).transferBatch(100, logistics.address, "", "");
      await supplyChain.connect(manufacturer).attachDocument(101, DOCUMENT_CID, "Doc");

      const stats = await supplyChain.getStats();
      expect(stats._totalProducts).to.equal(2);
      expect(stats._totalBatches).to.equal(2);
      expect(stats._totalTransfers).to.equal(1);
      expect(stats._totalDocuments).to.equal(1);
    });
  });

  describe("Full Supply Chain Flow Integration", function () {
    it("Should complete entire supply chain journey", async function () {
      // 1. Manufacturer creates product
      await supplyChain.connect(manufacturer).createProduct(1, "ipfs://QmProduct");
      
      // 2. Manufacturer creates batch
      const manufactureDate = Math.floor(Date.now() / 1000);
      await supplyChain.connect(manufacturer).createBatch(100, 1, 500, manufactureDate, "ipfs://QmBatch");
      
      // 3. Attach quality certificate
      await supplyChain.connect(manufacturer).attachDocument(100, "QmQualityCert", "Quality Certificate");
      
      // 4. Anchor sensor data (temperature during storage)
      const tempHash = ethers.keccak256(ethers.toUtf8Bytes("temp:4C,humidity:50%"));
      await supplyChain.connect(manufacturer).anchorSensorData(100, tempHash, "Cold Storage");
      
      // 5. Transfer to logistics
      await supplyChain.connect(manufacturer).transferBatch(100, logistics.address, "Factory, Bangalore", "QmFactoryProof");
      
      // 6. Logistics attaches transit document
      await supplyChain.connect(logistics).attachDocument(100, "QmTransitDoc", "Transit Document");
      
      // 7. Transfer to retailer
      await supplyChain.connect(logistics).transferBatch(100, retailer.address, "Distribution Center, Mumbai", "QmDistributionProof");
      
      // 8. Verify complete provenance
      const [batch, transfers, documents, product] = await supplyChain.connect(consumer).verifyProvenance(100);
      
      // Assertions
      expect(product.metaURI).to.equal("ipfs://QmProduct");
      expect(batch.quantity).to.equal(500);
      expect(batch.currentOwner).to.equal(retailer.address);
      expect(batch.recalled).to.be.false;
      expect(transfers.length).to.equal(2);
      expect(documents.length).to.equal(2);
      
      // 9. Auditor initiates recall (simulating quality issue found)
      await supplyChain.connect(auditor).recallBatch(100, "Contamination found in batch");
      
      // 10. Verify batch is recalled
      const recalledBatch = await supplyChain.getBatch(100);
      expect(recalledBatch.recalled).to.be.true;
      expect(recalledBatch.recallReason).to.equal("Contamination found in batch");
      
      // 11. Verify no more transfers possible
      await expect(
        supplyChain.connect(retailer).transferBatch(100, consumer.address, "Store", "")
      ).to.be.revertedWithCustomError(supplyChain, "BatchIsRecalled");
    });
  });
});
