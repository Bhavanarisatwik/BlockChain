# Supply Chain DApp - Complete Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Smart Contract Logic](#smart-contract-logic)
3. [Key Functions & Workflows](#key-functions--workflows)
4. [Blockchain Mechanics](#blockchain-mechanics)
5. [Frontend Integration](#frontend-integration)
6. [IPFS Integration](#ipfs-integration)
7. [Complete User Journey](#complete-user-journey)
8. [Why Blockchain is Needed](#why-blockchain-is-needed)
9. [Security Features](#security-features)
10. [Deployment Flow](#deployment-flow)

---

## Architecture Overview

### System Architecture Diagram

```
User (Browser)
    ↓
Frontend (Next.js + React + TypeScript)
    ↓
Wagmi + RainbowKit (Web3 Wallet Connection)
    ↓
MetaMask (User Signs Transactions)
    ↓
Smart Contract (Solidity ^0.8.20)
    ↓
Ethereum Blockchain (Hardhat Local Network)
    ↓
IPFS (Store Metadata & Documents)
    ↓
Indexer (Node.js - Watch Events)
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16, React, TypeScript, Tailwind CSS | User interface |
| **Web3** | Wagmi v2, RainbowKit, Ethers v6, Viem | Blockchain interaction |
| **Smart Contract** | Solidity ^0.8.20, OpenZeppelin | Business logic |
| **Blockchain** | Hardhat (Local), Ethereum | Transaction settlement |
| **Storage** | IPFS + NFT.Storage | Distributed file storage |
| **Database** | MongoDB (Indexer) | Event tracking & analytics |
| **Build** | TypeScript, ESLint | Development tooling |

---

## Smart Contract Logic

### Contract Details

**Address (Local):** `0x5FbDB2315678afecb367f032d93F642f64180aa3`  
**Chain:** Hardhat Local Network (Chain ID: 31337)  
**RPC:** `http://127.0.0.1:8545`

### Core Data Structures

#### 1. Product Struct
```solidity
struct Product {
    uint256 id;           // Unique identifier (timestamp-based)
    string metaURI;       // IPFS URI pointing to product metadata JSON
    address manufacturer; // Address of the manufacturer who created it
    uint256 createdAt;    // Block timestamp when created
    bool exists;          // Flag indicating if the product exists
}
```

**Example:**
```
Product ID: 1764179520
Manufacturer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
MetaURI: https://ipfs.io/ipfs/Qm5e121b1a19ac13f4145MockCID
Created: 2025-11-26 18:30:45
```

#### 2. Batch Struct
```solidity
struct Batch {
    uint256 id;              // Unique identifier (timestamp-based)
    uint256 productId;       // Reference to the product this batch contains
    uint256 quantity;        // Number of items in the batch
    uint256 manufactureDate; // Unix timestamp of manufacture date
    string metaURI;          // IPFS URI pointing to batch metadata
    address currentOwner;    // Current owner/custodian of the batch
    bool recalled;           // Flag indicating if batch has been recalled
    string recallReason;     // Reason for recall if recalled
    uint256 createdAt;       // Timestamp when batch was created
    bool exists;             // Flag indicating if the batch exists
}
```

**Example:**
```
Batch ID: 1764179895
Product ID: 1764179520
Quantity: 2 units
Current Owner: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (Logistics)
Recalled: false
Created: 2025-11-26 18:31:15
```

#### 3. Transfer Record Struct
```solidity
struct TransferRecord {
    uint256 batchId;      // Reference to the batch being transferred
    address from;         // Previous owner/sender
    address to;           // New owner/recipient
    string location;      // Location where transfer occurred
    string offchainProof; // IPFS CID of off-chain proof document
    uint256 timestamp;    // When the transfer occurred
}
```

#### 4. Document Record Struct
```solidity
struct DocumentRecord {
    uint256 batchId;      // Reference to which batch
    string ipfsCID;       // IPFS CID of the document
    string documentType;  // Type of document (certificate, inspection, etc.)
    address attachedBy;   // Address of who attached the document
    uint256 timestamp;    // When the document was attached
}
```

#### 5. Sensor Record Struct
```solidity
struct SensorRecord {
    uint256 batchId;      // Reference to which batch
    bytes32 dataHash;     // Hash of the sensor data
    string sensorType;    // Type of sensor (temperature, humidity, etc.)
    uint256 timestamp;    // When the data was recorded
}
```

### Role-Based Access Control

The contract uses OpenZeppelin's `AccessControl` to define 4 roles:

```solidity
bytes32 public constant MANUFACTURER = keccak256("MANUFACTURER");
bytes32 public constant LOGISTICS = keccak256("LOGISTICS");
bytes32 public constant RETAILER = keccak256("RETAILER");
bytes32 public constant AUDITOR = keccak256("AUDITOR");
```

#### Role Hashes (For Frontend)
```typescript
MANUFACTURER_ROLE: "0x6659d833875b88922d2576dad6c137a09ba676496bb2010bf8a72397792167a0"
LOGISTICS_ROLE: "0x11043802fd8271b7e5b035cd5159fb955ce81e402c7d652c5d92694eacc6f163"
RETAILER_ROLE: "0x27d5ccc46db01bfa5691ce092fe276221c6cd0aa6d05765b52c3ddecfa70421a"
AUDITOR_ROLE: "0xd8994f6d76f930dc5ea8c60e38e6334a87bb8539cc3082ac6828681c33316e3d"
```

#### Role Permissions

| Role | Permissions |
|------|------------|
| **MANUFACTURER** | Create products, Create batches |
| **LOGISTICS** | Transfer batches, Record sensor data, View batches |
| **RETAILER** | Receive batches, View provenance |
| **AUDITOR** | Attach documents, Recall batches, Verify data |
| **DEFAULT_ADMIN** | Assign/revoke roles, Pause/unpause contract |

---

## Key Functions & Workflows

### WORKFLOW 1: Create a Product

**Function Signature:**
```solidity
function createProduct(string memory _metaURI) 
    external 
    onlyRole(MANUFACTURER) 
    whenNotPaused
```

**Flow:**
```
1. Manufacturer prepares product metadata:
   {
       "name": "Organic Chocolate Bar",
       "origin": "Ghana",
       "ingredients": ["cocoa", "sugar", "milk"],
       "certifications": ["fair-trade", "organic"],
       "batchSize": 1000,
       "expiryDate": "2026-11-27"
   }

2. Upload to IPFS → Get hash: Qm5e121b1a19ac13f4145...

3. Call createProduct(ipfsHash)

4. Smart Contract:
   - Verifies caller has MANUFACTURER role
   - Creates productId = current timestamp
   - Stores: products[productId] = new Product(...)
   - Emits: ProductCreated event
   - Returns: productId

5. Frontend:
   - Listens to ProductCreated event
   - Updates UI to show new product
```

**Code Implementation:**
```solidity
function createProduct(string memory _metaURI) 
    external 
    onlyRole(MANUFACTURER) 
    whenNotPaused
{
    uint256 productId = block.timestamp;
    
    products[productId] = Product({
        id: productId,
        metaURI: _metaURI,
        manufacturer: msg.sender,
        createdAt: block.timestamp,
        exists: true
    });
    
    productIds.push(productId);
    totalProducts++;
    
    emit ProductCreated(
        productId, 
        msg.sender, 
        _metaURI, 
        block.timestamp
    );
}
```

---

### WORKFLOW 2: Create a Batch

**Function Signature:**
```solidity
function createBatch(
    uint256 _productId,
    uint256 _quantity,
    uint256 _manufactureDate,
    string memory _metaURI
) 
    external 
    onlyRole(MANUFACTURER) 
    whenNotPaused
```

**Flow:**
```
1. Manufacturer selects:
   - Product ID: 1764179520
   - Quantity: 1000 units
   - Manufacture Date: 2025-11-26
   - Batch Metadata IPFS: QmAbc123...

2. Call createBatch(1764179520, 1000, timestamp, QmAbc123...)

3. Smart Contract:
   - Verifies product exists
   - Verifies MANUFACTURER role
   - Creates batchId = current timestamp (e.g., 1764179895)
   - Stores: batches[batchId] = new Batch(...)
   - Tracks: ownerBatches[manufacturer].push(batchId)
   - Increments: totalBatches++
   - Emits: BatchCreated event

4. Frontend:
   - Adds batch to UI
   - Shows batch in products list
```

**Code Implementation:**
```solidity
function createBatch(
    uint256 _productId,
    uint256 _quantity,
    uint256 _manufactureDate,
    string memory _metaURI
) 
    external 
    onlyRole(MANUFACTURER) 
    whenNotPaused
{
    require(products[_productId].exists, "ProductDoesNotExist");
    require(_quantity > 0, "InvalidQuantity");
    require(bytes(_metaURI).length > 0, "EmptyMetaURI");
    
    uint256 batchId = block.timestamp;
    
    batches[batchId] = Batch({
        id: batchId,
        productId: _productId,
        quantity: _quantity,
        manufactureDate: _manufactureDate,
        metaURI: _metaURI,
        currentOwner: msg.sender,
        recalled: false,
        recallReason: "",
        createdAt: block.timestamp,
        exists: true
    });
    
    batchIds.push(batchId);
    ownerBatches[msg.sender].push(batchId);
    totalBatches++;
    
    emit BatchCreated(
        batchId,
        _productId,
        msg.sender,
        _quantity,
        _metaURI,
        block.timestamp
    );
}
```

---

### WORKFLOW 3: Transfer Batch (Logistics)

**Function Signature:**
```solidity
function transferBatch(
    uint256 _batchId,
    address _newOwner,
    string memory _location,
    string memory _offchainProof
) 
    external 
    onlyRole(LOGISTICS) 
    nonReentrant
    whenNotPaused
```

**Flow:**
```
1. Logistics worker prepares:
   - Batch ID: 1764179895
   - New Owner: 0x70997970... (Distributor)
   - Location: "Port of Hamburg"
   - Proof Document: Qm8d9e2... (bill of lading)

2. Call transferBatch(1764179895, 0x70997970..., "Port of Hamburg", Qm8d9e2...)

3. Smart Contract:
   - Verifies batch exists & not recalled
   - Records old owner
   - Updates: batches[batchId].currentOwner = _newOwner
   - Stores transfer record:
     TransferRecord {
       batchId: 1764179895,
       from: previousOwner,
       to: _newOwner,
       location: "Port of Hamburg",
       offchainProof: Qm8d9e2...,
       timestamp: block.timestamp
     }
   - Adds to: batchTransfers[batchId][]
   - Increments: totalTransfers++
   - Emits: BatchTransferred event

4. Immutable History Created:
   ✓ Cannot be edited
   ✓ Cannot be deleted
   ✓ Timestamp proves when it happened
```

**Code Implementation:**
```solidity
function transferBatch(
    uint256 _batchId,
    address _newOwner,
    string memory _location,
    string memory _offchainProof
) 
    external 
    onlyRole(LOGISTICS) 
    nonReentrant
    whenNotPaused
{
    require(batches[_batchId].exists, "BatchDoesNotExist");
    require(!batches[_batchId].recalled, "BatchIsRecalled");
    require(_newOwner != address(0), "InvalidAddress");
    
    address previousOwner = batches[_batchId].currentOwner;
    batches[_batchId].currentOwner = _newOwner;
    
    batchTransfers[_batchId].push(TransferRecord({
        batchId: _batchId,
        from: previousOwner,
        to: _newOwner,
        location: _location,
        offchainProof: _offchainProof,
        timestamp: block.timestamp
    }));
    
    totalTransfers++;
    
    emit BatchTransferred(
        _batchId,
        previousOwner,
        _newOwner,
        _location,
        _offchainProof,
        block.timestamp
    );
}
```

---

### WORKFLOW 4: Attach Document (Auditor)

**Function Signature:**
```solidity
function attachDocument(
    uint256 _batchId,
    string memory _ipfsCID,
    string memory _documentType
) 
    external 
    onlyRole(AUDITOR) 
    whenNotPaused
```

**Flow:**
```
1. Auditor prepares:
   - Batch ID: 1764179895
   - Document: inspection_certificate.pdf
   - Upload to IPFS → QmXxYyZz2a3b4c5d...
   - Type: "quality_inspection"

2. Call attachDocument(1764179895, QmXxYyZz2a3b4c5d..., "quality_inspection")

3. Smart Contract:
   - Verifies batch exists
   - Verifies AUDITOR role
   - Creates DocumentRecord:
     {
       batchId: 1764179895,
       ipfsCID: QmXxYyZz2a3b4c5d...,
       documentType: "quality_inspection",
       attachedBy: auditorAddress,
       timestamp: block.timestamp
     }
   - Adds to: batchDocuments[batchId][]
   - Increments: totalDocuments++
   - Emits: DocumentAttached event

4. Result:
   ✓ Document permanently linked to batch
   ✓ Cannot be removed or modified
   ✓ Auditor's address proves who attached it
   ✓ Timestamp proves when it was attached
```

---

### WORKFLOW 5: Anchor Sensor Data

**Function Signature:**
```solidity
function anchorSensorData(
    uint256 _batchId,
    bytes32 _dataHash,
    string memory _sensorType
) 
    external 
    onlyRole(LOGISTICS) 
    whenNotPaused
```

**Flow:**
```
1. IoT Sensor reads:
   - Temperature: 2°C
   - Humidity: 45%
   - Location: Truck near Munich
   - Timestamp: 2025-11-26 19:30:00

2. Data is hashed:
   keccak256(abi.encode(temperature, humidity, location, time))
   = 0xABC123DEF456...

3. Logistics calls:
   anchorSensorData(1764179895, 0xABC123DEF456..., "temperature")

4. Smart Contract:
   - Verifies batch exists
   - Verifies LOGISTICS role
   - Creates SensorRecord:
     {
       batchId: 1764179895,
       dataHash: 0xABC123DEF456...,
       sensorType: "temperature",
       timestamp: block.timestamp
     }
   - Adds to: batchSensorRecords[batchId][]
   - Emits: SensorDataAnchored event

5. Cryptographic Proof Created:
   ✓ Hash proves sensor data existed at this timestamp
   ✓ Full data stored off-chain on IPFS
   ✓ If hash doesn't match, data was tampered with
```

---

### WORKFLOW 6: Recall Batch (Auditor)

**Function Signature:**
```solidity
function recallBatch(uint256 _batchId, string memory _reason) 
    external 
    onlyRole(AUDITOR) 
    whenNotPaused
```

**Flow:**
```
1. Auditor detects contamination and prepares:
   - Batch ID: 1764179895
   - Reason: "Contamination found - possible salmonella"

2. Call recallBatch(1764179895, "Contamination found - possible salmonella")

3. Smart Contract:
   - Verifies batch exists
   - Verifies AUDITOR role
   - Sets: batches[batchId].recalled = true
   - Sets: batches[batchId].recallReason = reason
   - Emits: BatchRecalled event (HIGH PRIORITY!)

4. Immediate Effects:
   ✓ Batch marked as recalled on blockchain
   ✓ transferBatch() will reject transfers (because recalled == true)
   ✓ All retailers and distributors can see it
   ✓ Cannot be undone (immutable history)
   ✓ Complete transparency to prevent harm
```

---

### WORKFLOW 7: Verify Provenance (Read-Only)

**Function Signature:**
```solidity
function verifyProvenance(uint256 _batchId) 
    external 
    view 
    returns (
        Batch memory batch,
        TransferRecord[] memory transfers,
        DocumentRecord[] memory documents,
        Product memory product
    )
```

**Flow:**
```
1. Consumer scans QR code on product package

2. Frontend gets batch ID from QR code: 1764179895

3. Call verifyProvenance(1764179895)

4. Smart Contract returns:
   {
     batch: {
       id: 1764179895,
       productId: 1764179520,
       quantity: 1000,
       currentOwner: 0x8aAe5d7...,
       recalled: false,
       createdAt: 2025-11-26 18:31:15,
       exists: true
     },
     transfers: [
       { from: manufacturer, to: logistics, location: "Port A", timestamp: ... },
       { from: logistics, to: distributor, location: "Warehouse B", timestamp: ... },
       { from: distributor, to: retail, location: "Store C", timestamp: ... }
     ],
     documents: [
       { type: "quality_inspection", ipfsCID: QmXxYyZz..., attachedBy: auditor, timestamp: ... },
       { type: "shipping_manifest", ipfsCID: QmAaBbCc..., attachedBy: logistics, timestamp: ... }
     ],
     product: {
       id: 1764179520,
       name: "Organic Chocolate Bar",
       origin: "Ghana",
       manufacturer: manufacturerAddress,
       createdAt: 2025-11-26 18:30:45
     }
   }

5. Frontend displays:
   ✓ Product origin and details
   ✓ Complete supply chain journey
   ✓ All certifications and documents
   ✓ Temperature & humidity records
   ✓ Everyone who handled it
   ✓ Timestamps proving when each step happened
   ✓ Auditor verification: PASSED ✓

6. Consumer sees:
   "This chocolate was made by XYZ in Ghana on Nov 26.
    It was inspected by SafeCheck (certified auditor).
    Temperature maintained at 2°C throughout journey.
    Arrived in store on Nov 27.
    100% Authentic & Verified!"
```

---

## Blockchain Mechanics

### How Data Gets Stored

#### On-Chain Storage (Ethereum Blockchain)

```
State Variables (Immutable, Decentralized, Public):
├── products[productId] → Product struct
│   └─ Stored in smart contract storage
│   └─ Accessible by anyone
│   └─ Cannot be deleted or modified
│
├── batches[batchId] → Batch struct
│   └─ Current state of each batch
│   └─ Who owns it now
│   └─ If it's recalled
│
├── batchTransfers[batchId][] → Array of TransferRecords
│   └─ Complete transfer history
│   └─ Who transferred to whom, when, where
│   └─ Immutable record of chain of custody
│
├── batchDocuments[batchId][] → Array of DocumentRecords
│   └─ All certificates and documents
│   └─ Who attached them and when
│
├── batchSensorRecords[batchId][] → Array of SensorRecords
│   └─ Hashes of all sensor data
│   └─ Proof of temperature/humidity readings
│
└── ownerBatches[address][] → Array of batch IDs
    └─ Tracks which batches each user owns/owned
```

#### Off-Chain Storage (IPFS)

```
IPFS Hashes Stored in Blockchain:
├── Product Metadata
│   └─ Qm5e121b1a19ac13f4145...
│   └─ Contains: name, origin, ingredients, certifications
│   └─ File size: ~2KB
│   └─ Blockchain cost: $0.0001
│   └─ Full file storage cost: $0.001 (on IPFS)
│
├── Batch Metadata
│   └─ QmAbc123...
│   └─ Contains: batch details, photos
│   └─ File size: ~5KB
│
├── Documents
│   └─ QmXxYyZz... (certification PDF)
│   └─ QmDoc456... (inspection report)
│   └─ File size: ~500KB each
│   └─ Would cost $5000+ to store on blockchain
│   └─ Costs $0.10 to store on IPFS
│
└── Sensor Data
    └─ QmSensor789...
    └─ Contains: full temperature logs, humidity readings
    └─ File size: ~1MB
    └─ Blockchain storage impossible (too expensive)
    └─ IPFS makes it practical
```

### Transaction Costs (Gas)

```
Action                          Gas Used    Cost (Localhost)    Cost (Mainnet Eth)
─────────────────────────────────────────────────────────────────────────────────
Create Product                  ~150,000    Free (localhost)    ~$50
Create Batch                    ~200,000    Free                ~$67
Transfer Batch                  ~180,000    Free                ~$60
Attach Document                 ~120,000    Free                ~$40
Anchor Sensor Data              ~100,000    Free                ~$33
Recall Batch                    ~80,000     Free                ~$27
Verify Provenance (Read)        0           Free                Free (view function)
```

### Transaction Flow

```
User Action in Frontend
    ↓
Frontend Code:
    writeContract({
        address: CONTRACT_ADDRESS,
        functionName: 'createBatch',
        args: [productId, quantity, date, metaURI],
        account: userAddress
    })
    ↓
Wagmi Library:
    - Detects function call needed
    - Prepares transaction data
    - Requests user signature
    ↓
MetaMask Popup Appears:
    - User reviews: "Allow this transaction?"
    - Shows estimated gas cost
    - Shows function details
    - User clicks "Approve"
    ↓
Signed Transaction Created:
    {
        from: userAddress,
        to: contractAddress,
        data: encodedFunctionCall,
        gas: 200000,
        gasPrice: 2000000000,
        nonce: 42,
        signature: 0x... (user's signature)
    }
    ↓
Transaction Sent to Hardhat Node (localhost:8545)
    ↓
Hardhat Validation:
    - ✓ Signature valid (user signed it)
    - ✓ Nonce correct (prevents replay)
    - ✓ Gas sufficient
    - ✓ Not paused
    - ✓ Has MANUFACTURER role
    ↓
Smart Contract Executes:
    - Verify product exists
    - Create new Batch struct
    - Store in batches[batchId]
    - Push to batchIds[]
    - Push to ownerBatches[sender]
    - Increment totalBatches
    - Emit BatchCreated event
    ↓
State Updated on Blockchain:
    - New batch now in permanent ledger
    - Cannot be changed or deleted
    - Every node has a copy
    ↓
Transaction Confirmed:
    {
        transactionHash: 0xABC123DEF456...,
        blockNumber: 42,
        blockHash: 0xXYZ789...,
        gasUsed: 185000,
        status: "success"
    }
    ↓
Frontend Receives Confirmation:
    - useWaitForTransactionReceipt triggers
    - isSuccess becomes true
    - Shows "Batch created successfully!"
    - Refetches data with useReadContract
    - Updates UI with new batch
    ↓
User Sees Result:
    "Batch #1764179895 created! ✓"
```

---

## Frontend Integration

### Wagmi Configuration

```typescript
// frontend/src/lib/wagmi.ts
import { getDefaultConfig } from '@rainbow-me/rainbow-kit';
import { mainnet, sepolia, polygon, optimism, hardhat } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'Supply Chain DApp',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [hardhat, sepolia, mainnet, polygon, optimism],
    ssr: true,
});
```

### Reading Contract Data

```typescript
// Reading product (no gas cost, just query)
const { data: product, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: SupplyChainABI,
    functionName: 'getProduct',
    args: [BigInt(productId)],
});

// Returns: Product struct from blockchain
console.log(product);
// {
//   id: 1764179520n,
//   metaURI: "https://ipfs.io/ipfs/Qm5e121...",
//   manufacturer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
//   createdAt: 1732634445n,
//   exists: true
// }
```

### Writing to Contract

```typescript
// Writing (costs gas, requires user signature)
const { writeContract, isPending } = useWriteContract();

const handleCreateBatch = () => {
    writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: SupplyChainABI,
        functionName: 'createBatch',
        args: [
            BigInt(productId),
            BigInt(quantity),
            BigInt(Math.floor(Date.now() / 1000)),
            metaURI
        ],
    });
};
```

### Listening to Events

```typescript
// Watch for new batches created
useEffect(() => {
    const unwatch = watchContractEvent({
        address: CONTRACT_ADDRESS,
        abi: SupplyChainABI,
        eventName: 'BatchCreated',
        onLogs: (logs) => {
            console.log('New batch created:', logs);
            // Refetch data
            refetch();
        },
    });
    
    return () => unwatch();
}, []);
```

---

## IPFS Integration

### Why IPFS?

| Aspect | Blockchain | IPFS |
|--------|-----------|------|
| **Storage Model** | Every node stores everything | Distributed, content-addressed |
| **Cost per MB** | $10,000+ | $0.10 (pinned) |
| **Speed** | Slow (consensus needed) | Very fast (local cache) |
| **Best For** | State & logic | Large files & media |
| **Immutability** | Perfect (consensus) | Perfect (content hash) |

### Storage Architecture

```
Metadata Flow:
1. Create product data:
   {
     "name": "Organic Coffee",
     "origin": "Ethiopia",
     "certifications": ["fair-trade", "organic"]
   }

2. Upload to IPFS:
   NFT.Storage.store(JSON.stringify(data))
   ↓
   Returns: Qm5e121b1a19ac13f4145...

3. Store hash on blockchain:
   createProduct("Qm5e121b1a19ac13f4145...")
   ↓
   Blockchain stores: products[1764179520] = {
     metaURI: "Qm5e121b1a19ac13f4145...",
     ...
   }

4. Retrieve:
   Frontend calls: getProduct(1764179520)
   Returns metaURI: "Qm5e121b1a19ac13f4145..."
   Frontend fetches: https://ipfs.io/ipfs/Qm5e121...
   IPFS returns: Original JSON data

5. Cost Analysis:
   - Blockchain: 32 bytes (hash) = $0.0001
   - IPFS: Entire file = $0.10
   - Total: $0.10001 (vs $10,000+ if stored on blockchain)
```

### Development Fallback

```typescript
// frontend/src/lib/ipfs.ts
export async function uploadToIPFS(file: File): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY;
    
    if (!apiKey) {
        // Development mode: generate mock CID
        console.warn('NFT.Storage key missing, using mock CID');
        const mockCID = 'Qm' + 
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
        
        // Store metadata in localStorage for demo
        localStorage.setItem(`metadata_${mockCID}`, JSON.stringify({
            name: file.name,
            size: file.size,
            timestamp: Date.now()
        }));
        
        return `https://ipfs.io/ipfs/${mockCID}`;
    }
    
    // Production: use real NFT.Storage
    const nftStorage = new NFTStorage({ token: apiKey });
    const cid = await nftStorage.store({
        name: file.name,
        description: 'Product metadata',
        image: file,
    });
    
    return `https://ipfs.io/ipfs/${cid}`;
}
```

---

## Complete User Journey

### Scenario: Organic Coffee Supply Chain

```
┌──────────────────────────────────────────────────────────────────┐
│ DAY 1: MANUFACTURING (ETHIOPIA)                                   │
└──────────────────────────────────────────────────────────────────┘

ACTOR: FarmCo Cooperatives (MANUFACTURER)
ACCOUNT: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

STEP 1: Create Product
────────────────────────
Prepare metadata:
{
  "name": "Ethiopian Arabica Coffee",
  "origin": "Sidamo, Ethiopia",
  "altitude": "1800-2200m",
  "harvest": "Nov 2025",
  "certifications": ["Fair Trade", "Organic", "Rainforest Alliance"],
  "flavor_notes": "Floral, Berry, Caramel",
  "producer": "FarmCo Cooperatives",
  "contact": "info@farmco.eth"
}

Upload to IPFS → Get hash: Qm5e121b1a19ac13f4145MockCID

Call: createProduct(Qm5e121b1a19ac13f4145MockCID)

Blockchain records:
✓ Product ID: 1764179520
✓ Manufacturer: 0xf39Fd6...
✓ MetaURI: Qm5e121...
✓ Created: 2025-11-26 10:00:00 UTC
✓ Status: ACTIVE

Event emitted: ProductCreated(1764179520, 0xf39Fd6..., ...)

STEP 2: Create First Batch
────────────────────────────
Prepare batch metadata with shipping info:
{
  "batch_number": "FARM-001-2025",
  "quality_grade": "AA",
  "weight_kg": 50000,
  "packaging": "60kg jute bags",
  "quantity_bags": 833,
  "manufacturing_date": "2025-11-15"
}

Upload to IPFS → Get hash: QmAbc123Def456...

Call: createBatch(
  productId: 1764179520,
  quantity: 833,
  manufactureDate: 1731638400,
  metaURI: QmAbc123Def456...
)

Blockchain records:
✓ Batch ID: 1764179895
✓ Product ID: 1764179520
✓ Quantity: 833 bags
✓ Current Owner: 0xf39Fd6... (FarmCo)
✓ Status: ACTIVE
✓ Created: 2025-11-26 10:30:00 UTC

Event emitted: BatchCreated(1764179895, ...)

├─ Attaches Document: Harvest Certificate
│  └─ Auditor: 0xAuditAddress... (AUDITOR role)
│  └─ Document: harvest_certificate.pdf
│  └─ IPFS: QmCert001...
│  └─ Type: "harvest_certificate"
│  └─ Blockchain records: batchDocuments[1764179895].push({
│      ipfsCID: QmCert001...,
│      documentType: "harvest_certificate",
│      attachedBy: 0xAuditAddress...,
│      timestamp: 2025-11-26 10:35:00
│    })

└─ Anchors First Sensor Reading (Pre-shipment)
   └─ Temperature sensor at farm: 22°C
   └─ Humidity: 65%
   └─ Data hashed: 0xHashABC...
   └─ Blockchain records: batchSensorRecords[1764179895].push({
       dataHash: 0xHashABC...,
       sensorType: "temperature",
       timestamp: 2025-11-26 10:40:00
     })


┌──────────────────────────────────────────────────────────────────┐
│ DAY 2: LOGISTICS - PORT HANDLING (DJIBOUTI)                      │
└──────────────────────────────────────────────────────────────────┘

ACTOR: LogiCorp Shipping (LOGISTICS role)
ACCOUNT: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8

STEP 3: First Transfer (Farm → Port)
─────────────────────────────────────
Prepare transfer proof:
{
  "bill_of_lading": "BOL-2025-11-26-001",
  "pickup_location": "FarmCo Warehouse, Sidamo",
  "delivery_location": "Port of Djibouti",
  "temperature_maintained": "20°C",
  "journey_time": "18 hours",
  "seals": "Intact",
  "damage": "None"
}

Upload to IPFS → QmTransfer001...

Call: transferBatch(
  batchId: 1764179895,
  newOwner: 0x70997970... (LogiCorp),
  location: "Port of Djibouti",
  offchainProof: QmTransfer001...
)

Blockchain records:
✓ New Owner: 0x70997970...
✓ Transfer Record: {
    from: 0xf39Fd6... (FarmCo),
    to: 0x70997970... (LogiCorp),
    location: "Port of Djibouti",
    offchainProof: QmTransfer001...,
    timestamp: 2025-11-27 05:00:00
  }
✓ Status: IN_TRANSIT

Transfer History Now Shows:
├─ Origin: FarmCo, Sidamo
└─ Current: LogiCorp, Port of Djibouti

├─ Anchors Temperature Data During Transport
│  └─ Container IoT Sensor: 18°C (optimal for coffee)
│  └─ Data Hash: 0xTransportTemp...
│  └─ Blockchain: Recorded at each checkpoint

└─ Attaches Shipping Documentation
   └─ Auditor attaches: bill_of_lading.pdf
   └─ IPFS: QmShipping001...
   └─ Blockchain: Document attached & verified


┌──────────────────────────────────────────────────────────────────┐
│ DAY 3: QUALITY INSPECTION (PORT)                                 │
└──────────────────────────────────────────────────────────────────┘

ACTOR: QualityCheck Labs (AUDITOR role)
ACCOUNT: 0xAuditorAddress...

STEP 4: Attach Quality Inspection
──────────────────────────────────
Inspection results:
{
  "test_date": "2025-11-27 06:00:00",
  "moisture_content": "10.5%",
  "defect_rate": "0.2%",
  "cupping_score": "87/100",
  "aroma": "Excellent",
  "acidity": "High",
  "body": "Medium",
  "finish": "Clean",
  "verdict": "APPROVED - Premium Grade"
}

Upload to IPFS → QmInspection001...

Call: attachDocument(
  batchId: 1764179895,
  ipfsCID: QmInspection001...,
  documentType: "quality_inspection"
)

Blockchain records:
✓ Document attached to batch 1764179895
✓ Verified by: 0xAuditorAddress... (QualityCheck Labs)
✓ Timestamp: 2025-11-27 06:15:00 UTC
✓ Status: VERIFIED ✓


┌──────────────────────────────────────────────────────────────────┐
│ DAY 4-7: OCEAN FREIGHT                                           │
└──────────────────────────────────────────────────────────────────┘

ACTOR: Cargo Handlers, Shipping Lines
ROLE: LOGISTICS

Continuous Actions:
├─ Container loaded on cargo ship
├─ Sensor data anchored every 6 hours:
│  ├─ Temperature: 18-20°C ✓
│  ├─ Humidity: 60-65% ✓
│  └─ No spoilage detected ✓
├─ Documentation uploaded at each port:
│  ├─ Container manifest
│  ├─ Customs clearance
│  └─ Port authority stamps
└─ Transfer records created for:
   ├─ Port of Djibouti → Ship departure
   ├─ Ship En Route (checkpoint 1, 2, 3...)
   └─ Singapore Port Arrival


┌──────────────────────────────────────────────────────────────────┐
│ DAY 8: IMPORTER WAREHOUSE (SINGAPORE)                            │
└──────────────────────────────────────────────────────────────────┘

ACTOR: AromaImports Distribution (RETAILER role)
ACCOUNT: 0xRetailerAddress...

STEP 5: Final Transfer to Retail
─────────────────────────────────
Batch 1764179895 transferred from:
- From: LogiCorp (Shipping)
- To: AromaImports (Retail)
- Location: Singapore Distribution Center
- Proof: QmRetailTransfer...

Blockchain records:
✓ New Owner: 0xRetailerAddress...
✓ Final Destination: Singapore
✓ Goods ready for retail sale


┌──────────────────────────────────────────────────────────────────┐
│ DAY 10: CONSUMER VERIFICATION                                    │
└──────────────────────────────────────────────────────────────────┘

CONSUMER: John (Regular Coffee Drinker)
ACTION: Scans QR code on coffee bag at store

Frontend calls: verifyProvenance(1764179895)

Blockchain returns complete record:

BATCH DETAILS:
├─ Batch ID: 1764179895
├─ Product: Ethiopian Arabica Coffee
├─ Quantity: 833 bags (50,000 kg)
├─ Created: 2025-11-26 10:30 UTC
└─ Status: ACTIVE ✓

SUPPLY CHAIN JOURNEY:
├─ [NOV 26 10:00] ORIGIN
│  ├─ FarmCo Cooperatives, Sidamo, Ethiopia
│  ├─ Altitude: 1800-2200m
│  ├─ Harvest: November 2025
│  └─ Certifications: Fair Trade, Organic, Rainforest Alliance
│
├─ [NOV 26 10:40] PRE-SHIPMENT CHECK
│  ├─ Temperature: 22°C
│  ├─ Status: Optimal
│  └─ Auditor: QualityCheck Labs ✓
│
├─ [NOV 27 05:00] TRANSFER TO PORT
│  ├─ Location: Port of Djibouti
│  ├─ Bill of Lading: Intact
│  ├─ Temperature Maintained: 20°C ✓
│  └─ Logistics: LogiCorp Shipping
│
├─ [NOV 27 06:15] QUALITY INSPECTION COMPLETED
│  ├─ Grade: Premium AA
│  ├─ Cupping Score: 87/100
│  ├─ Verdict: APPROVED ✓
│  ├─ Inspector: QualityCheck Labs
│  └─ Documents: inspection_report.pdf
│
├─ [NOV 27-DEC 1] OCEAN FREIGHT
│  ├─ Container maintained at 18-20°C ✓
│  ├─ Humidity: 60-65% ✓
│  ├─ Sensor checkpoints: 15 readings ✓
│  ├─ All within specification
│  └─ No spoilage detected ✓
│
└─ [DEC 2] ARRIVED AT RETAIL
   ├─ Location: Singapore Distribution Center
   ├─ Final Owner: AromaImports
   ├─ Ready for sale
   └─ Complete provenance verified ✓

VERIFICATION RESULT:
✅ 100% AUTHENTIC & VERIFIED
✅ Chain of custody: Unbroken
✅ Quality: Premium Grade (87/100)
✅ Fair Trade: Certified
✅ Temperature: Perfect (18-22°C throughout)
✅ No contamination detected
✅ All documents attached and verified
✅ Complete transparency from farm to table

CONSUMER'S BENEFIT:
"I can verify this coffee is:
 - Genuinely from Ethiopia
 - Fair Trade certified
 - Properly handled throughout journey
 - High quality (premium grade)
 - Purchased from ethical source"

COFFEE COMPANY'S BENEFIT:
"We can prove:
 - No counterfeit goods
 - Quality maintained
 - All regulations followed
 - Fair pricing justified"

AUDITOR'S BENEFIT:
"Complete compliance:
 - All checkpoints verified
 - Documentation complete
 - No regulatory violations
 - Sustainable practices confirmed"
```

---

## Why Blockchain is Needed

### Problems Blockchain Solves

| Problem | Without Blockchain | With Blockchain |
|---------|-------------------|-----------------|
| **Counterfeiting** | Easy to fake records | Cryptographically impossible to forge |
| **Tampering** | Records can be edited/deleted | Immutable - any change detected |
| **Trust** | Must trust company | Verified by network consensus |
| **Transparency** | Only company knows | Everyone can verify |
| **Single Point of Failure** | If server hacked, all data compromised | Distributed across thousands of nodes |
| **Audit Trail** | Can be modified retroactively | Complete, unchangeable history |
| **Recall Speed** | Delayed notification | Instant, blockchain-wide alert |

### Real-World Scenario

**Scenario: Contaminated Coffee Batch**

```
WITHOUT BLOCKCHAIN:
─────────────────────
1. FarmCo says: "Our batch was fine"
2. LogiCorp says: "We handled it properly"
3. Auditor says: "We found contamination"
4. Question: Who's lying?
5. Investigation: 6-12 months of legal battles
6. Problem: Meanwhile, contaminated product sells to consumers
7. Result: Lawsuits, lost trust, possible illness

WITH BLOCKCHAIN:
────────────────
1. All temperature readings anchored on blockchain
2. If temperature rose above 20°C, it's recorded and permanent
3. Exact timestamp: 2025-11-27 14:30:15 UTC
4. Culprit identified immediately:
   - LogiCorp was responsible at that time
   - Their delivery truck had a refrigerator failure
5. LogiCorp pays for contamination
6. Batch recalled within 2 hours (blockchain alert)
7. Consumers protected
8. No legal ambiguity - data is proof

COST OF BLOCKCHAIN:
─ Extra cost per batch: $0.50
COST WITHOUT BLOCKCHAIN:
─ Legal battle: $2-5 million
─ Recalled products: $10+ million
─ Lost reputation: Priceless
```

---

## Security Features

### 1. Role-Based Access Control

```solidity
// Only MANUFACTURER can create products
modifier onlyRole(bytes32 role) {
    require(hasRole(role, msg.sender), "AccessControl: access denied");
    _;
}

function createProduct(string memory _metaURI) 
    external 
    onlyRole(MANUFACTURER) 
{
    // Only MANUFACTURER can execute
}
```

**Security Benefit:** Unauthorized users cannot perform actions they're not meant to.

### 2. Pausable Contract

```solidity
// Admin can pause contract if bug found
modifier whenNotPaused() {
    require(!paused(), "Contract is paused");
    _;
}

function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
    _pause();
}
```

**Security Benefit:** Can instantly stop all operations during emergency.

### 3. Reentrancy Guard

```solidity
modifier nonReentrant {
    require(!locked, "No reentrancy");
    locked = true;
    _;
    locked = false;
}

function transferBatch(...) 
    external 
    nonReentrant 
{
    // Protected against reentrancy attacks
}
```

**Security Benefit:** Prevents attackers from exploiting function re-entry vulnerabilities.

### 4. Input Validation

```solidity
require(_newOwner != address(0), "InvalidAddress");
require(batches[_batchId].exists, "BatchDoesNotExist");
require(!batches[_batchId].recalled, "BatchIsRecalled");
require(bytes(_metaURI).length > 0, "EmptyMetaURI");
```

**Security Benefit:** Prevents invalid data from being stored.

### 5. Event Logging

```solidity
event BatchCreated(
    uint256 indexed batchId,
    address indexed owner,
    string metaURI,
    uint256 timestamp
);

// Emitted when batch created
emit BatchCreated(batchId, msg.sender, _metaURI, block.timestamp);
```

**Security Benefit:** Complete audit trail of all actions.

### 6. Immutability

```
Once written to blockchain:
✓ Cannot be deleted
✓ Cannot be modified
✓ Cannot be hidden
✓ Any attempt creates new transaction (detectable)
✓ Hash-linked chain (breaking one link breaks all)
```

---

## Deployment Flow

### Local Development Deployment

```bash
# 1. Start Hardhat Local Node
npx hardhat node
# Starts at http://127.0.0.1:8545
# Generates 20 test accounts with 10,000 ETH each

# 2. Compile Smart Contract
npx hardhat compile
# Outputs: artifacts/contracts/SupplyChain.sol/SupplyChain.json
# Contains: ABI, Bytecode, Metadata

# 3. Deploy Contract
npx hardhat run scripts/deploy.ts --network localhost
# Deploys to local node
# Outputs: Contract address, Admin address, Next steps

# 4. Contract is Live
# Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
# Ready for transactions
```

### Deployment Script Details

```typescript
// scripts/deploy.ts
async function main() {
    // Get signer (the account that deploys)
    const [deployer] = await ethers.getSigners();
    
    // Deploy contract
    const SupplyChain = await ethers.getContractFactory("SupplyChain");
    const contract = await SupplyChain.deploy(deployer.address);
    
    // Wait for deployment
    await contract.waitForDeployment();
    
    // Get contract address
    const contractAddress = await contract.getAddress();
    
    // Save deployment info
    const deployment = {
        contractAddress,
        deployer: deployer.address,
        adminRole: ethers.ZeroHash, // DEFAULT_ADMIN_ROLE
        manufacturerRole: ethers.id("MANUFACTURER"),
        logisticsRole: ethers.id("LOGISTICS"),
        retailerRole: ethers.id("RETAILER"),
        auditorRole: ethers.id("AUDITOR"),
        timestamp: Date.now(),
        network: "localhost",
        chainId: 31337
    };
    
    // Write to file
    fs.writeFileSync(
        'deployments/localhost.json',
        JSON.stringify(deployment, null, 2)
    );
    
    // Copy ABI to frontend
    const abi = require('../artifacts/contracts/SupplyChain.sol/SupplyChain.json').abi;
    fs.writeFileSync(
        'frontend/src/lib/contracts/SupplyChainABI.ts',
        `export const SupplyChainABI = ${JSON.stringify(abi, null, 2)};`
    );
    
    console.log(`Contract deployed at: ${contractAddress}`);
}

main();
```

### Frontend Configuration

```typescript
// frontend/src/lib/contracts/SupplyChainABI.ts
export const SupplyChainABI = [
    // Function definitions
    {
        name: "createProduct",
        type: "function",
        inputs: [{ name: "_metaURI", type: "string" }],
        outputs: [],
        stateMutability: "nonpayable"
    },
    // ... more functions
];

export const CONTRACT_ADDRESS = 
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export const ROLES = {
    DEFAULT_ADMIN_ROLE: "0x0000000000000000000000000000000000000000000000000000000000000000",
    MANUFACTURER_ROLE: "0x6659d833875b88922d2576dad6c137a09ba676496bb2010bf8a72397792167a0",
    // ... more roles
};
```

---

## Summary

### Key Concepts

1. **Smart Contracts** - Self-executing code that enforces business rules
2. **Blockchain** - Immutable, decentralized ledger of transactions
3. **IPFS** - Efficient off-chain storage for large files
4. **Roles** - Permission system for different supply chain participants
5. **Events** - Notifications that something happened on-chain
6. **Gas** - Cost to execute transactions (free on localhost, costs money on mainnet)
7. **Wagmi** - Library that connects React frontend to blockchain
8. **MetaMask** - User's wallet that stores private keys and signs transactions

### Files Structure

```
BlockChain/
├── contracts/
│   └── SupplyChain.sol          # Smart contract
├── scripts/
│   ├── deploy.ts                # Deployment script
│   └── verify.ts                # Verification script
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/page.tsx   # Role management
│   │   │   ├── products/        # Product pages
│   │   │   ├── batches/         # Batch pages
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── contracts/
│   │   │   │   └── SupplyChainABI.ts
│   │   │   ├── hooks.ts         # Contract interactions
│   │   │   ├── wagmi.ts         # Web3 config
│   │   │   └── ipfs.ts          # IPFS upload
│   │   └── components/
│   └── package.json
├── indexer/
│   └── src/
│       ├── indexer.ts           # Event listener
│       └── api.ts               # Data API
├── deployments/
│   └── localhost.json           # Deployment info
├── test/
│   └── supplychain.test.ts      # Unit tests
├── hardhat.config.ts            # Hardhat config
└── package.json
```

---

**Last Updated:** November 27, 2025  
**Version:** 1.0  
**Status:** Production Ready
