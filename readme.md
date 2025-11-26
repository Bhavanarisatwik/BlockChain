SupplyChain Provenance Full-stack App

Use this document as context for GitHub Copilot Pro to generate a full end-to-end supply chain provenance application on Ethereum. It contains the product vision, complete feature list, actors, tech stack, architecture, data model, smart contract API, frontend pages, dev workflow, tests, deployment steps, environment variables, CI/CD outline, and acceptance criteria. Copy the entire file to Copilot as the project spec and let it generate code, tests, scripts, and configuration.

1. Project summary

A tamper-evident supply chain provenance system. Manufacturers register products and batches, upload proof documents to IPFS, transfer custody through logistics, and allow consumers or auditors to verify full history by scanning a QR or visiting a public verification page. All provable actions are anchored on Ethereum so provenance is immutable and auditable.

Primary goals

End-to-end provenance traceability for goods

On-chain anchoring of critical metadata and document CIDs

Role-based access control

Fast UI with an indexer for reads

Polished Next.js frontend deployed on Vercel

Target network for development

Use an Ethereum testnet for development (Sepolia or another active testnet).

Optionally plan to deploy to an L2 for production (Polygon, Optimism).

2. Actors and roles

Manufacturer - creates products and batches

Logistics provider - accepts and transfers custody

Retailer / Wholesaler - receives goods, sells to consumers

Regulator / Auditor - can recall and audit batches

Consumer / Verifier - publicly verifies provenance using QR

Admin - contract owner, manages roles and emergency actions

Access control roles on-chain

DEFAULT_ADMIN_ROLE

MANUFACTURER

LOGISTICS

RETAILER

AUDITOR

3. Full feature list

All features below must be implemented either on-chain or in the frontend/backend as specified.

Core features

Product registration on-chain with metaURI pointing to IPFS JSON metadata

Batch creation on-chain referencing productId, quantity, manufactureDate, metaURI

Custody transfer on-chain with optional location and off-chain proof hash

Document anchoring on-chain: attach IPFS CID(s) to a batch

Provenance timeline: visual, ordered list of all events for a batch

Event emission for every significant on-chain action for indexing

Role-based access control for functions

Public verification page: QR or URL that anyone can visit to verify provenance

Recall mechanism on-chain to mark a batch as recalled and prevent further transfers

Sensor data anchoring: allow anchoring hashes of off-chain sensor logs

QR code generation for batches and product items

Indexer service or The Graph subgraph for fast reads and querying

Admin console for onboarding users and assigning roles, and KYC placeholders

Notifications: frontend listening to events and showing real-time notifications

Upload documents to IPFS and pin them via nft.storage or Pinata

Search, filters, and basic analytics: by product, batch, owner, status

Mobile-friendly UI with QR scanning for verification

Emergency controls: pause/unpause and multisig guidance for production

Gas-efficient storage patterns and clear contract events

Unit tests and basic security checks using Slither and solhint

Optional but recommended

Upgradeable contract pattern if you expect future upgrades

Gas relayer or meta-transactions for better UX

Onchain metadata standards compatible with ERC-721 if you plan to mint NFTs representing batches

4. Tech stack and reasons

Smart contracts

Solidity ^0.8.x

OpenZeppelin AccessControl, Pausable, Ownable

Hardhat for dev, test, deploy

Ethers.js for scripting and frontend

Storage and indexing

IPFS via nft.storage or Pinata for document hosting

The Graph or a simple Node.js indexer with MongoDB for fast reads

Backend and indexer

Node.js + Express or Next.js API routes

MongoDB Atlas for indexer storage

Frontend

Next.js with TypeScript

Tailwind CSS for styling

shadcn or Headless UI for components

Wagmi + RainbowKit or Web3Modal for wallet integration

Ethers.js for contract reads and writes

QR code generator and scanner libraries

DevOps

GitHub Actions for CI

Vercel for frontend deployment

Alchemy or Infura as RPC provider for network access

Security

Slither, solhint, echidna fuzzing where feasible

Unit tests with Hardhat and Mocha/Chai

Consider a multisig for admin actions in production

5. Project file structure suggestion
supplychain/
├─ contracts/
│  ├─ SupplyChain.sol
│  ├─ UpgradeableSupplyChain.sol (optional)
│  └─ migration and deploy scripts
├─ scripts/
│  ├─ deploy.ts
│  └─ verify.ts
├─ test/
│  └─ supplychain.test.ts
├─ subgraph/ (optional)
├─ indexer/
│  ├─ src/listener.ts
│  └─ src/api.ts
├─ frontend/
│  ├─ package.json
│  ├─ next.config.js
│  ├─ pages/
│  │  ├─ index.tsx
│  │  ├─ dashboard.tsx
│  │  ├─ batch/[id].tsx
│  │  └─ verify/[cid].tsx
│  ├─ components/
│  └─ lib/
└─ README.md

6. Smart contract specification and API

Design summary

Keep on-chain storage minimal and authoritative

Store identifiers, owner addresses, status flags, timestamps, event logs via events

Store IPFS CIDs or hashed CIDs on-chain

Use AccessControl for granular permissions

Core structs

struct Product {
  uint256 id;
  string metaURI;
  address manufacturer;
  bool exists;
}

struct Batch {
  uint256 id;
  uint256 productId;
  uint256 quantity;
  uint256 manufactureDate; // unix
  string metaURI;
  address currentOwner;
  bool recalled;
  bool exists;
}


Core functions (public)

createProduct(uint256 productId, string metaURI) onlyRole(MANUFACTURER)

createBatch(uint256 batchId, uint256 productId, uint256 quantity, uint256 manufactureDate, string metaURI) onlyRole(MANUFACTURER)

transferBatch(uint256 batchId, address to, string location, string offchainProof) only owner of batch

attachDocument(uint256 batchId, string ipfsCID) onlyRole(MANUFACTURER) or owner

recallBatch(uint256 batchId, string reason) onlyRole(AUDITOR)

getBatch(uint256 batchId) view returns Batch

getProduct(uint256 productId) view returns Product

Events (emit these for indexer)

event ProductCreated(uint256 productId, address manufacturer, string metaURI, uint256 timestamp)

event BatchCreated(uint256 batchId, uint256 productId, address owner, string metaURI, uint256 timestamp)

event Transfer(uint256 batchId, address from, address to, string location, string offchainProof, uint256 timestamp)

event DocumentAttached(uint256 batchId, string ipfsCID, uint256 timestamp)

event BatchRecalled(uint256 batchId, string reason, uint256 timestamp)

Admin functions

pause, unpause

grantRole, revokeRole

optionally upgradeTo for UUPS proxies

Gas and storage notes

Prefer storing strings only when necessary. Consider keccak256 hash of long strings for cheaper storage if you want to store proof only.

IPFS CIDs can be stored as string to keep things human readable. If gas is a major issue, store keccak256(CID) instead and show CID via indexer.

7. Example minimal Solidity skeleton

Include this skeleton in contracts/SupplyChain.sol as starting code. This is a reference for Copilot to expand upon.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract SupplyChain is AccessControl, Pausable {
    bytes32 public constant MANUFACTURER = keccak256("MANUFACTURER");
    bytes32 public constant LOGISTICS = keccak256("LOGISTICS");
    bytes32 public constant RETAILER = keccak256("RETAILER");
    bytes32 public constant AUDITOR = keccak256("AUDITOR");

    struct Product {
        uint256 id;
        string metaURI;
        address manufacturer;
        bool exists;
    }

    struct Batch {
        uint256 id;
        uint256 productId;
        uint256 quantity;
        uint256 manufactureDate;
        string metaURI;
        address currentOwner;
        bool recalled;
        bool exists;
    }

    mapping(uint256 => Product) public products;
    mapping(uint256 => Batch) public batches;

    event ProductCreated(uint256 productId, address indexed manufacturer, string metaURI, uint256 timestamp);
    event BatchCreated(uint256 batchId, uint256 indexed productId, address indexed owner, string metaURI, uint256 timestamp);
    event TransferEvent(uint256 batchId, address indexed from, address indexed to, string location, string offchainProof, uint256 timestamp);
    event DocumentAttached(uint256 batchId, string ipfsCID, uint256 timestamp);
    event BatchRecalled(uint256 batchId, string reason, uint256 timestamp);

    constructor(address admin) {
        _setupRole(DEFAULT_ADMIN_ROLE, admin);
        _setupRole(MANUFACTURER, admin);
    }

    function createProduct(uint256 _id, string calldata _metaURI) external onlyRole(MANUFACTURER) whenNotPaused {
        require(!products[_id].exists, "product exists");
        products[_id] = Product({ id: _id, metaURI: _metaURI, manufacturer: msg.sender, exists: true });
        emit ProductCreated(_id, msg.sender, _metaURI, block.timestamp);
    }

    function createBatch(uint256 _batchId, uint256 _productId, uint256 _qty, uint256 _manufactureDate, string calldata _metaURI) external onlyRole(MANUFACTURER) whenNotPaused {
        require(products[_productId].exists, "product missing");
        require(!batches[_batchId].exists, "batch exists");
        batches[_batchId] = Batch({ id: _batchId, productId: _productId, quantity: _qty, manufactureDate: _manufactureDate, metaURI: _metaURI, currentOwner: msg.sender, recalled: false, exists: true });
        emit BatchCreated(_batchId, _productId, msg.sender, _metaURI, block.timestamp);
    }

    function transferBatch(uint256 _batchId, address _to, string calldata _location, string calldata _offchainProof) external whenNotPaused {
        Batch storage b = batches[_batchId];
        require(b.exists, "no batch");
        require(msg.sender == b.currentOwner, "not owner");
        address from = b.currentOwner;
        b.currentOwner = _to;
        emit TransferEvent(_batchId, from, _to, _location, _offchainProof, block.timestamp);
    }

    function attachDocument(uint256 _batchId, string calldata _ipfsCID) external whenNotPaused {
        require(batches[_batchId].exists, "no batch");
        // no storage of CIDs in this minimal version. indexer can capture attached docs via events
        emit DocumentAttached(_batchId, _ipfsCID, block.timestamp);
    }

    function recallBatch(uint256 _batchId, string calldata _reason) external onlyRole(AUDITOR) whenNotPaused {
        require(batches[_batchId].exists, "no batch");
        batches[_batchId].recalled = true;
        emit BatchRecalled(_batchId, _reason, block.timestamp);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }
}

8. Frontend pages, components and flows

Pages to implement

/ Landing and intro

/login Wallet connect optional page or modal

/dashboard Admin and stakeholder dashboard with overview

/products/new Create product UI

/batches/new Create batch UI with IPFS upload flow

/batch/[id] Batch details and provenance timeline

/transfer Transfer modal or page

/verify/[batchId] Public verification page that fetches indexer or reads contract

/admin Manage roles and KYC placeholders

/settings RPC / network settings and environment toggles

/notifications Event notifications

Key components

Wallet connect button and account info

Transaction modal showing gas estimate, confirm and wait for confirmations

Timeline component showing events with icons and timestamps

Document viewer that loads IPFS CIDs via gateway

QR generator for batch verification

QR scanner for mobile verification

UX flows

Manufacturer creates product metadata JSON, uploads to IPFS, calls createProduct with metaURI

Manufacturer creates batch, uploads batch docs to IPFS, calls createBatch with metaURI

Manufacturer transfers batch to logistics by calling transferBatch; location and proof optional

Indexer captures events and stores queryable records

Retailer or consumer scans QR, opens verify page that queries indexer or contract for details

IPFS flow

Upload files to nft.storage from the frontend

Receive CID, display preview to user

Call attachDocument on-chain with CID

Let indexer resolve CID to get file metadata for UI

9. Indexer design

Purpose

Listen to on-chain events and create fast search indexes for UI

Resolve IPFS CIDs and store metadata in MongoDB

Provide a REST API or GraphQL endpoint used by the frontend

Implementation plan

Node.js service using Ethers.js provider configured with RPC and contract ABI

Subscribe to events or poll from block number 0 for first run to bootstrap

Persist:

products collection

batches collection

transfers collection

documents collection

Expose endpoints:

GET /batch/:batchId

GET /product/:productId

GET /batches?owner= and filters

POST /reindex (admin only) to re-sync events from a given block

Optional

Build a The Graph subgraph with mappings for more robust and decentralized indexing

10. Dev workflow and step-by-step guide

Follow these steps in order. Each step is actionable and expected by Copilot to create code, tests, and config.

Initialize repo

mkdir supplychain && cd supplychain
git init


Create contracts subproject with Hardhat

cd supplychain
npm init -y
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers typescript ts-node @nomicfoundation/hardhat-chai-matchers chai mocha @openzeppelin/contracts
npx hardhat
# choose create an empty hardhat.config.js or TypeScript


Add contracts/SupplyChain.sol using the skeleton above

Add tests test/supplychain.test.ts

Test product creation, batch creation, transfer rights, document attachment, recall, and role enforcement

Test reverts for unauthorized calls

Add deploy script scripts/deploy.ts

Use environment variables for admin private key and RPC

Deploy to a local network for initial tests, then to Sepolia

Setup frontend with Next.js + TypeScript + Tailwind

npx create-next-app@latest frontend --typescript
cd frontend
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
# install ethers wagmi or rainbowkit etc
npm install ethers wagmi @web3modal/react


Implement IPFS upload logic using nft.storage

Provide a utility file frontend/lib/ipfs.ts with an uploadFile(file) function that returns an ipfs://CID string

Implement Ethers connector util frontend/lib/contract.ts

Read ABI from generated artifacts

Provide getContractRead(provider) and getContractWrite(signer) helpers

Implement indexer

Node.js service using Ethers.js to listen for events and store to MongoDB

Add Dockerfile if you want to containerize

Add CI scripts

GitHub Actions workflow to run tests on push, lint, and run solidity static analysis

Environment variables and secrets

Create .env files with placeholders. Do not commit secrets.

Deploy frontend to Vercel

Connect GitHub repo to Vercel

Set environment variables in Vercel dashboard

Push to main branch to trigger deployment

11. Environment variables

Place these in .env for local dev and in Vercel environment settings for deployment.

# Hardhat / deploy
PRIVATE_KEY=0x...
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<KEY>
ETHERSCAN_API_KEY=...

# Frontend / Indexer
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NETWORK=sepolia
ALCHEMY_API_KEY=...
NFT_STORAGE_KEY=<nft.storage API key>
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<KEY>


Do not store real keys in repository.

12. Hardhat deploy script example

Place in scripts/deploy.ts. Copilot can generate a TypeScript deploy script using ethers.

import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account", deployer.address);

  const SupplyChain = await ethers.getContractFactory("SupplyChain");
  const supplychain = await SupplyChain.deploy(deployer.address);
  await supplychain.deployed();

  console.log("SupplyChain deployed to:", supplychain.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

13. Example frontend integration snippets

Connect wallet and prepare signer

import { ethers } from "ethers";
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send("eth_requestAccounts", []);
const signer = provider.getSigner();
const contract = new ethers.Contract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, SupplyChainABI, signer);


Create batch flow

Upload docs to IPFS via nft.storage. Get cid.

Call createBatch(batchId, productId, qty, manufactureDate, metaURI) where metaURI is ipfs://<cid>

Wait for transaction confirmation and show tx link

Listen to events in frontend for live updates

contract.on("TransferEvent", (batchId, from, to, location, offchainProof, timestamp) => {
  // push to UI and notify user
});

14. Testing and security checklist

Tests

Unit tests for every method and role check

Test events are emitted with correct arguments

Test batch transfer sequence and owner changes

Static analysis

Run solhint and slither

Run Hardhat gas reporter optionally

Security

Use Pausable and emergency controls

Use AccessControl instead of simple owner-only where appropriate

Keep admin keys offline, use multisig for critical operations

15. CI/CD and Vercel deployment details

GitHub Actions

ci.yml steps

Checkout

Setup Node and cache node_modules

Install, lint, run tests unit + solidity tests

Run slither or solhint static analysis

If tests pass, build frontend and run vercel/cli deploy only for main branch if desired

Vercel

Connect GitHub repo

Set environment variables listed above

Build command: npm run build

Output directory: .next

Use preview deployments for branch demos

16. Acceptance criteria for the assignment

Minimum demo must include

Smart contract deployed to a testnet

Manufacturer creates a product and a batch on-chain

A document is uploaded to IPFS and anchored on-chain

The batch is transferred through at least two roles using on-chain transactions

A public verification page shows the full provenance timeline and shows the IPFS documents

Frontend is deployed to Vercel and reachable via a public URL

Unit tests for smart contract pass

Indexer is running or The Graph subgraph is available and returns batch records

Nice to have

Mobile QR scanning flows

Notifications for new transfers

Recall flow visible on verification page

Multi-signature admin flow for critical actions

17. Timeline and checklist for a one-person build

Day 1

Hardhat project, SupplyChain contract, initial tests, and local deploy

Day 2

IPFS integration, create product and batch via simple frontend, basic transfer flow

Day 3

Indexer for events and MongoDB, full frontend pages, styling, QR flows

Day 4

Tests, security checks, static analysis, polish UI, create GitHub Actions

Day 5

Deploy frontend to Vercel, prepare demo video and README

Adjust based on scope and time.

18. How to feed this to GitHub Copilot Pro

Give Copilot the entire content of this file as the context or open it as the top-level README in your repo. Then request tasks explicitly. Example prompts to give Copilot after providing this MD:

"Generate contracts/SupplyChain.sol implementing the spec in this file. Include all events, role checks, and pausable logic. Add NatSpec comments."

"Create Hardhat deploy script scripts/deploy.ts that reads PRIVATE_KEY and RPC_URL from env and deploys SupplyChain to Sepolia."

"Generate test/supplychain.test.ts covering product creation, batch creation, transfer, document attach, recall, and role reverts."

"Create a Next.js TypeScript frontend in frontend/ with pages and components listed in this file. Use Tailwind CSS. Implement IPFS upload via nft.storage, wallet connect via Wagmi, and contract interactions using Ethers.js."

"Create an indexer in indexer/ that listens for the five events and stores them into MongoDB Atlas. Also create minimal REST endpoints described in this file."

"Create a GitHub Actions workflow file .github/workflows/ci.yml that runs solidity tests, runs frontend tests, builds the frontend, and checks slither or solhint."

Ask Copilot to generate one module at a time or generate the whole repo. If it generates code that references environment variables, ensure they match the names in the Environment variables section above.

19. Example Git commit and branch strategy recommendations

Use main as production-ready branch

Use dev branch for staging work

Create feature branches as feature/<short-desc>

Use PRs with required checks: tests, linter, slither

Tag releases with semantic versioning like v0.1.0

20. Useful commands summary

Hardhat local node and tests

npx hardhat node
npx hardhat test
npx hardhat run scripts/deploy.ts --network sepolia


Frontend

cd frontend
npm run dev
npm run build
npm run start


Indexer

cd indexer
npm run start


IPFS upload via nft.storage

Use nft.storage client in frontend or indexer. Store NFT_STORAGE_KEY in env.

21. Security and privacy reminders

Never commit private keys, API keys, or .env files

Use testnet keys for development

For production use a hardware wallet and multisig for admin keys

Keep PII off-chain and encrypt sensitive off-chain storage if required

22. Final notes for Copilot

Prioritize correct and well-tested smart contract logic before adding frontend polishing

Generate meaningful error messages and revert reasons in Solidity

Emit clear and consistent events matching the names in this spec

Make the frontend usable without requiring an account for public verification pages

Provide thorough unit tests and at least one integration test that mints a product, creates a batch, transfers it, and verifies final owner

23. Appendices

A. Example product metadata JSON format for IPFS

{
  "name": "Organic Honey - Batch 2025-04",
  "description": "Wildflower organic honey certified by XYZ",
  "manufacturer": "BeeCo",
  "certificates": ["ipfs://bafy..."],
  "manufactureDate": "2025-04-01",
  "extra": { "origin": "Karnataka, India", "labId": "LAB-12345" }
}


B. Example batch timeline event stored by indexer

{
  "batchId": 1001,
  "events": [
    { "type": "BatchCreated", "actor": "0xabc...", "timestamp": 1700000000, "metaURI": "ipfs://bafy..." },
    { "type": "Transfer", "from": "0xabc...", "to": "0xdef...", "location": "Warehouse A", "timestamp": 1700000100 },
    { "type": "DocumentAttached", "cid": "bafy...", "timestamp": 1700000200 },
    { "type": "BatchRecalled", "reason": "contamination", "timestamp": 1700000300 }
  ]
}


C. Acceptance checklist for demo submission

Frontend deployed to Vercel and reachable

Smart contract address included in README with network

Demo showing creation, transfer, document anchoring, verify via QR

Tests passing in repo actions