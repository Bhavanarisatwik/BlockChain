export const SupplyChainABI = [
  {
    "inputs": [{ "internalType": "address", "name": "admin", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "batchId", "type": "uint256" }],
    "name": "BatchAlreadyExists",
    "type": "error"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "batchId", "type": "uint256" }],
    "name": "BatchDoesNotExist",
    "type": "error"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "batchId", "type": "uint256" }],
    "name": "BatchIsRecalled",
    "type": "error"
  },
  { "inputs": [], "name": "EmptyMetaURI", "type": "error" },
  { "inputs": [], "name": "InvalidAddress", "type": "error" },
  { "inputs": [], "name": "InvalidQuantity", "type": "error" },
  {
    "inputs": [
      { "internalType": "uint256", "name": "batchId", "type": "uint256" },
      { "internalType": "address", "name": "caller", "type": "address" }
    ],
    "name": "NotBatchOwner",
    "type": "error"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "productId", "type": "uint256" }],
    "name": "ProductAlreadyExists",
    "type": "error"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "productId", "type": "uint256" }],
    "name": "ProductDoesNotExist",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "batchId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "productId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "quantity", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "metaURI", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "BatchCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "batchId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "reason", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "recalledBy", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "BatchRecalled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "batchId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "location", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "offchainProof", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "BatchTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "batchId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "ipfsCID", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "documentType", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "attachedBy", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "DocumentAttached",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "productId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "manufacturer", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "metaURI", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "ProductCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "account", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "grantedBy", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "RoleAssigned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "account", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "revokedBy", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "batchId", "type": "uint256" },
      { "indexed": false, "internalType": "bytes32", "name": "dataHash", "type": "bytes32" },
      { "indexed": false, "internalType": "string", "name": "sensorType", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "SensorDataAnchored",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "AUDITOR",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "LOGISTICS",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MANUFACTURER",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "RETAILER",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_batchId", "type": "uint256" },
      { "internalType": "bytes32", "name": "_dataHash", "type": "bytes32" },
      { "internalType": "string", "name": "_sensorType", "type": "string" }
    ],
    "name": "anchorSensorData",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "role", "type": "bytes32" },
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "assignRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_batchId", "type": "uint256" },
      { "internalType": "string", "name": "_ipfsCID", "type": "string" },
      { "internalType": "string", "name": "_documentType", "type": "string" }
    ],
    "name": "attachDocument",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "role", "type": "bytes32" },
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "checkRole",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_batchId", "type": "uint256" },
      { "internalType": "uint256", "name": "_productId", "type": "uint256" },
      { "internalType": "uint256", "name": "_quantity", "type": "uint256" },
      { "internalType": "uint256", "name": "_manufactureDate", "type": "uint256" },
      { "internalType": "string", "name": "_metaURI", "type": "string" }
    ],
    "name": "createBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_id", "type": "uint256" },
      { "internalType": "string", "name": "_metaURI", "type": "string" }
    ],
    "name": "createProduct",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllBatchIds",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllProductIds",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_batchId", "type": "uint256" }],
    "name": "getBatch",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "uint256", "name": "productId", "type": "uint256" },
          { "internalType": "uint256", "name": "quantity", "type": "uint256" },
          { "internalType": "uint256", "name": "manufactureDate", "type": "uint256" },
          { "internalType": "string", "name": "metaURI", "type": "string" },
          { "internalType": "address", "name": "currentOwner", "type": "address" },
          { "internalType": "bool", "name": "recalled", "type": "bool" },
          { "internalType": "string", "name": "recallReason", "type": "string" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
          { "internalType": "bool", "name": "exists", "type": "bool" }
        ],
        "internalType": "struct SupplyChain.Batch",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_batchId", "type": "uint256" }],
    "name": "getBatchDocuments",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "batchId", "type": "uint256" },
          { "internalType": "string", "name": "ipfsCID", "type": "string" },
          { "internalType": "string", "name": "documentType", "type": "string" },
          { "internalType": "address", "name": "attachedBy", "type": "address" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct SupplyChain.DocumentRecord[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_batchId", "type": "uint256" }],
    "name": "getBatchSensorRecords",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "batchId", "type": "uint256" },
          { "internalType": "bytes32", "name": "dataHash", "type": "bytes32" },
          { "internalType": "string", "name": "sensorType", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct SupplyChain.SensorRecord[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_batchId", "type": "uint256" }],
    "name": "getBatchTransfers",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "batchId", "type": "uint256" },
          { "internalType": "address", "name": "from", "type": "address" },
          { "internalType": "address", "name": "to", "type": "address" },
          { "internalType": "string", "name": "location", "type": "string" },
          { "internalType": "string", "name": "offchainProof", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct SupplyChain.TransferRecord[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_owner", "type": "address" }],
    "name": "getBatchesByOwner",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_productId", "type": "uint256" }],
    "name": "getProduct",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "string", "name": "metaURI", "type": "string" },
          { "internalType": "address", "name": "manufacturer", "type": "address" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
          { "internalType": "bool", "name": "exists", "type": "bool" }
        ],
        "internalType": "struct SupplyChain.Product",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getStats",
    "outputs": [
      { "internalType": "uint256", "name": "_totalProducts", "type": "uint256" },
      { "internalType": "uint256", "name": "_totalBatches", "type": "uint256" },
      { "internalType": "uint256", "name": "_totalTransfers", "type": "uint256" },
      { "internalType": "uint256", "name": "_totalDocuments", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "role", "type": "bytes32" },
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "hasRole",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_batchId", "type": "uint256" },
      { "internalType": "string", "name": "_reason", "type": "string" }
    ],
    "name": "recallBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "role", "type": "bytes32" },
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "removeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalBatches",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalDocuments",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalProducts",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalTransfers",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_batchId", "type": "uint256" },
      { "internalType": "address", "name": "_to", "type": "address" },
      { "internalType": "string", "name": "_location", "type": "string" },
      { "internalType": "string", "name": "_offchainProof", "type": "string" }
    ],
    "name": "transferBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_batchId", "type": "uint256" }],
    "name": "verifyProvenance",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "uint256", "name": "productId", "type": "uint256" },
          { "internalType": "uint256", "name": "quantity", "type": "uint256" },
          { "internalType": "uint256", "name": "manufactureDate", "type": "uint256" },
          { "internalType": "string", "name": "metaURI", "type": "string" },
          { "internalType": "address", "name": "currentOwner", "type": "address" },
          { "internalType": "bool", "name": "recalled", "type": "bool" },
          { "internalType": "string", "name": "recallReason", "type": "string" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
          { "internalType": "bool", "name": "exists", "type": "bool" }
        ],
        "internalType": "struct SupplyChain.Batch",
        "name": "batch",
        "type": "tuple"
      },
      {
        "components": [
          { "internalType": "uint256", "name": "batchId", "type": "uint256" },
          { "internalType": "address", "name": "from", "type": "address" },
          { "internalType": "address", "name": "to", "type": "address" },
          { "internalType": "string", "name": "location", "type": "string" },
          { "internalType": "string", "name": "offchainProof", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct SupplyChain.TransferRecord[]",
        "name": "transfers",
        "type": "tuple[]"
      },
      {
        "components": [
          { "internalType": "uint256", "name": "batchId", "type": "uint256" },
          { "internalType": "string", "name": "ipfsCID", "type": "string" },
          { "internalType": "string", "name": "documentType", "type": "string" },
          { "internalType": "address", "name": "attachedBy", "type": "address" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct SupplyChain.DocumentRecord[]",
        "name": "documents",
        "type": "tuple[]"
      },
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "string", "name": "metaURI", "type": "string" },
          { "internalType": "address", "name": "manufacturer", "type": "address" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
          { "internalType": "bool", "name": "exists", "type": "bool" }
        ],
        "internalType": "struct SupplyChain.Product",
        "name": "product",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "") as `0x${string}`;

// Role hashes - must match keccak256 of role names in contract
export const ROLES = {
  DEFAULT_ADMIN_ROLE: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
  MANUFACTURER_ROLE: "0x6659d833875b88922d2576dad6c137a09ba676496bb2010bf8a72397792167a0" as `0x${string}`,
  LOGISTICS_ROLE: "0x11043802fd8271b7e5b035cd5159fb955ce81e402c7d652c5d92694eacc6f163" as `0x${string}`,
  RETAILER_ROLE: "0x27d5ccc46db01bfa5691ce092fe276221c6cd0aa6d05765b52c3ddecfa70421a" as `0x${string}`,
  AUDITOR_ROLE: "0xd8994f6d76f930dc5ea8c60e38e6334a87bb8539cc3082ac6828681c33316e3d" as `0x${string}`,
} as const;
