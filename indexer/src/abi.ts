// Contract ABI - Events only for indexer
export const SupplyChainABI = [
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'productId', type: 'uint256' },
      { indexed: false, name: 'name', type: 'string' },
      { indexed: true, name: 'manufacturer', type: 'address' },
    ],
    name: 'ProductCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'batchId', type: 'uint256' },
      { indexed: true, name: 'productId', type: 'uint256' },
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: false, name: 'quantity', type: 'uint256' },
    ],
    name: 'BatchCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'batchId', type: 'uint256' },
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'location', type: 'string' },
    ],
    name: 'BatchTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'batchId', type: 'uint256' },
      { indexed: false, name: 'ipfsCID', type: 'string' },
      { indexed: false, name: 'documentType', type: 'string' },
      { indexed: true, name: 'attachedBy', type: 'address' },
    ],
    name: 'DocumentAttached',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'batchId', type: 'uint256' },
      { indexed: false, name: 'dataHash', type: 'bytes32' },
      { indexed: false, name: 'temperature', type: 'int256' },
      { indexed: false, name: 'humidity', type: 'uint256' },
      { indexed: false, name: 'location', type: 'string' },
    ],
    name: 'SensorDataAnchored',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'batchId', type: 'uint256' },
      { indexed: false, name: 'reason', type: 'string' },
      { indexed: true, name: 'initiator', type: 'address' },
    ],
    name: 'BatchRecalled',
    type: 'event',
  },
  // Read functions for initial sync
  {
    inputs: [{ name: '_productId', type: 'uint256' }],
    name: 'getProduct',
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'name', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'manufacturer', type: 'address' },
          { name: 'metadataURI', type: 'string' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'active', type: 'bool' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_batchId', type: 'uint256' }],
    name: 'getBatch',
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'productId', type: 'uint256' },
          { name: 'quantity', type: 'uint256' },
          { name: 'currentOwner', type: 'address' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'exists', type: 'bool' },
          { name: 'recalled', type: 'bool' },
          { name: 'recallReason', type: 'string' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getStats',
    outputs: [
      { name: 'totalProducts', type: 'uint256' },
      { name: 'totalBatches', type: 'uint256' },
      { name: 'totalTransfers', type: 'uint256' },
      { name: 'totalDocuments', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
