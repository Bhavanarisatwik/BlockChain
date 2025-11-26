import mongoose, { Schema, Document } from 'mongoose';

// Product Model
export interface IProduct extends Document {
  productId: number;
  name: string;
  description: string;
  manufacturer: string;
  metadataURI: string;
  createdAt: Date;
  active: boolean;
  transactionHash: string;
  blockNumber: number;
}

const ProductSchema = new Schema<IProduct>({
  productId: { type: Number, required: true, unique: true, index: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  manufacturer: { type: String, required: true, index: true },
  metadataURI: { type: String },
  createdAt: { type: Date, required: true },
  active: { type: Boolean, default: true },
  transactionHash: { type: String, required: true },
  blockNumber: { type: Number, required: true },
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);

// Batch Model
export interface IBatch extends Document {
  batchId: number;
  productId: number;
  quantity: number;
  currentOwner: string;
  createdAt: Date;
  recalled: boolean;
  recallReason?: string;
  transactionHash: string;
  blockNumber: number;
}

const BatchSchema = new Schema<IBatch>({
  batchId: { type: Number, required: true, unique: true, index: true },
  productId: { type: Number, required: true, index: true },
  quantity: { type: Number, required: true },
  currentOwner: { type: String, required: true, index: true },
  createdAt: { type: Date, required: true },
  recalled: { type: Boolean, default: false },
  recallReason: { type: String },
  transactionHash: { type: String, required: true },
  blockNumber: { type: Number, required: true },
});

export const Batch = mongoose.model<IBatch>('Batch', BatchSchema);

// Transfer Model
export interface ITransfer extends Document {
  batchId: number;
  from: string;
  to: string;
  location: string;
  timestamp: Date;
  transactionHash: string;
  blockNumber: number;
}

const TransferSchema = new Schema<ITransfer>({
  batchId: { type: Number, required: true, index: true },
  from: { type: String, required: true, index: true },
  to: { type: String, required: true, index: true },
  location: { type: String },
  timestamp: { type: Date, required: true },
  transactionHash: { type: String, required: true },
  blockNumber: { type: Number, required: true },
});

export const Transfer = mongoose.model<ITransfer>('Transfer', TransferSchema);

// Document Model
export interface IDocument extends Document {
  batchId: number;
  ipfsCID: string;
  documentType: string;
  attachedBy: string;
  timestamp: Date;
  transactionHash: string;
  blockNumber: number;
}

const DocumentSchema = new Schema<IDocument>({
  batchId: { type: Number, required: true, index: true },
  ipfsCID: { type: String, required: true },
  documentType: { type: String, required: true },
  attachedBy: { type: String, required: true },
  timestamp: { type: Date, required: true },
  transactionHash: { type: String, required: true },
  blockNumber: { type: Number, required: true },
});

export const DocumentRecord = mongoose.model<IDocument>('Document', DocumentSchema);

// Sensor Data Model
export interface ISensorData extends Document {
  batchId: number;
  dataHash: string;
  temperature: number;
  humidity: number;
  location: string;
  timestamp: Date;
  transactionHash: string;
  blockNumber: number;
}

const SensorDataSchema = new Schema<ISensorData>({
  batchId: { type: Number, required: true, index: true },
  dataHash: { type: String, required: true },
  temperature: { type: Number },
  humidity: { type: Number },
  location: { type: String },
  timestamp: { type: Date, required: true },
  transactionHash: { type: String, required: true },
  blockNumber: { type: Number, required: true },
});

export const SensorData = mongoose.model<ISensorData>('SensorData', SensorDataSchema);

// Indexer State Model (to track last indexed block)
export interface IIndexerState extends Document {
  key: string;
  value: number;
  updatedAt: Date;
}

const IndexerStateSchema = new Schema<IIndexerState>({
  key: { type: String, required: true, unique: true },
  value: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now },
});

export const IndexerState = mongoose.model<IIndexerState>('IndexerState', IndexerStateSchema);
