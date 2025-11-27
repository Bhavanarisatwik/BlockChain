# 🔗 Supply Chain Provenance DApp

A full-stack blockchain-based supply chain traceability system built on Ethereum. Track products from manufacturer to consumer with immutable on-chain records.

![Supply Chain Banner](https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=400&fit=crop)

## ✨ Features

- **Product Registration** - Register products with IPFS metadata
- **Batch Management** - Create and track product batches
- **Custody Transfer** - Transfer batches through the supply chain
- **Document Anchoring** - Attach certificates, invoices, and quality reports
- **Sensor Data** - Anchor IoT sensor data (temperature, humidity)
- **Recall Management** - Issue recalls with on-chain audit trail
- **Public Verification** - QR code scanning for authenticity verification
- **Role-Based Access** - Manufacturer, Logistics, Retailer, Auditor roles
- **Real-time Indexing** - MongoDB-backed event indexer for fast queries

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Next.js        │────▶│  Smart Contract │────▶│  Ethereum       │
│  Frontend       │     │  (Solidity)     │     │  Network        │
│                 │     │                 │     │                 │
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │                       │
         │                       │ Events
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  IPFS           │     │  Event Indexer  │────▶ MongoDB
│  (nft.storage)  │     │  (Node.js)      │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
```

## 📁 Project Structure

```
supply-chain/
├── contracts/              # Solidity smart contracts
│   └── SupplyChain.sol
├── scripts/                # Deployment scripts
│   ├── deploy.ts
│   └── verify.ts
├── test/                   # Contract tests
│   └── supplychain.test.ts
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities & config
│   └── public/
├── indexer/                # Event indexer service
│   └── src/
├── hardhat.config.ts       # Hardhat configuration
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB (local or Atlas)
- MetaMask wallet

### 1. Clone and Install

```bash
git clone <repository-url>
cd supply-chain

# Install root dependencies (Hardhat)
npm install

# Install frontend dependencies
cd frontend && npm install

# Install indexer dependencies
cd ../indexer && npm install
```

### 2. Environment Setup

```bash
# Root .env
cp .env.example .env

# Frontend .env
cp frontend/.env.example frontend/.env.local

# Indexer .env
cp indexer/.env.example indexer/.env
```

Update the `.env` files with your:
- RPC URLs (Infura/Alchemy)
- Private key (for deployment)
- WalletConnect Project ID
- MongoDB connection string
- NFT.Storage API key

### 3. Local Development Setup

#### Step A: Start Local Blockchain
Open a terminal and run:
```bash
npx hardhat node
```
*Keep this terminal running!* It will show you a list of 20 accounts with 10,000 ETH each.

#### Step B: Deploy Smart Contract
Open a **second terminal** and run:
```bash
npx hardhat run scripts/deploy.ts --network localhost
```
Copy the deployed **Contract Address** from the output and update your `frontend/.env.local` file:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_address_here
```

#### Step C: Configure MetaMask
1.  **Add Network:**
    - Network Name: `Localhost 8545`
    - RPC URL: `http://127.0.0.1:8545`
    - Chain ID: `31337`
    - Currency Symbol: `ETH`
2.  **Import Account:**
    - Copy the **Private Key** of Account #0 from the `npx hardhat node` terminal.
    - In MetaMask: Click Circle Icon -> Import Account -> Paste Private Key.
3.  **Reset Account (Important):**
    - If you restart the node, you must reset your MetaMask account to clear old transaction history.
    - Settings -> Advanced -> Clear activity tab data.

#### Step D: Start Frontend
Open a **third terminal** and run:
```bash
cd frontend
npm run dev
```
Visit `http://localhost:3000` and connect your imported wallet.

#### Step E: Start Indexer (Optional)
If you want to track events in a database:
```bash
# Start MongoDB
mongod

# Start Indexer
cd indexer
npm run dev
```

## 📜 Smart Contract

### Key Functions

| Function | Role Required | Description |
|----------|--------------|-------------|
| `createProduct` | MANUFACTURER | Register a new product |
| `createBatch` | MANUFACTURER | Create a batch from a product |
| `transferBatch` | Any role | Transfer custody |
| `attachDocument` | Any role | Attach IPFS document |
| `anchorSensorData` | Any role | Anchor IoT data hash |
| `recallBatch` | MANUFACTURER/AUDITOR | Issue a recall |
| `verifyProvenance` | Public | Get full provenance |

### Events

```solidity
event ProductCreated(uint256 indexed productId, string name, address indexed manufacturer);
event BatchCreated(uint256 indexed batchId, uint256 indexed productId, address indexed owner, uint256 quantity);
event BatchTransferred(uint256 indexed batchId, address indexed from, address indexed to, string location);
event DocumentAttached(uint256 indexed batchId, string ipfsCID, string documentType, address indexed attachedBy);
event SensorDataAnchored(uint256 indexed batchId, bytes32 dataHash, int256 temperature, uint256 humidity, string location);
event BatchRecalled(uint256 indexed batchId, string reason, address indexed initiator);
```

## 🧪 Testing

```bash
# Run all tests
npx hardhat test

# Run with coverage
npx hardhat coverage

# Run specific test file
npx hardhat test test/supplychain.test.ts
```

## 🌐 API Endpoints (Indexer)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stats` | GET | Get network statistics |
| `/api/products` | GET | List all products |
| `/api/products/:id` | GET | Get product details |
| `/api/batches` | GET | List all batches |
| `/api/batches/:id` | GET | Get batch with provenance |
| `/api/provenance/:batchId` | GET | Full provenance timeline |
| `/api/transfers` | GET | List all transfers |
| `/api/search` | GET | Search products/batches |

## 🎨 Frontend Pages

| Page | Path | Description |
|------|------|-------------|
| Landing | `/` | Public homepage |
| Dashboard | `/dashboard` | User dashboard |
| Products | `/products` | Product list |
| New Product | `/products/new` | Register product |
| Batches | `/batches` | Batch list |
| New Batch | `/batches/new` | Create batch |
| Batch Detail | `/batch/[id]` | Batch provenance |
| Transfer | `/transfer` | Transfer custody |
| Verify | `/verify` | Public verification |
| Admin | `/admin` | Role management |
| Settings | `/settings` | User settings |
| Notifications | `/notifications` | User notifications |

## 🔐 Security

- Role-based access control (OpenZeppelin)
- ReentrancyGuard on all state-changing functions
- Pausable for emergency stops
- Input validation on all public functions
- Event emission for audit trail

## 🚢 Deployment

### Testnet (Sepolia)

```bash
# Deploy
npx hardhat run scripts/deploy.ts --network sepolia

# Verify
npx hardhat run scripts/verify.ts --network sepolia
```

### Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

### Indexer (Railway/Render)

Deploy the indexer to any Node.js hosting platform with MongoDB support.

## 🔧 Environment Variables

### Root (Hardhat)
```
SEPOLIA_RPC_URL=
PRIVATE_KEY=
ETHERSCAN_API_KEY=
```

### Frontend
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_CHAIN_ID=
NEXT_PUBLIC_NFT_STORAGE_KEY=
```

### Indexer
```
MONGODB_URI=
RPC_URL=
CONTRACT_ADDRESS=
PORT=4000
```

## 📚 Tech Stack

- **Blockchain**: Ethereum, Solidity ^0.8.20
- **Smart Contract**: Hardhat, OpenZeppelin
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Web3**: ethers.js v6, wagmi v2, RainbowKit v2
- **State**: Zustand
- **Animations**: Framer Motion
- **Storage**: IPFS (nft.storage)
- **Database**: MongoDB
- **Indexer**: Node.js, Express

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ for supply chain transparency
