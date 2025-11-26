'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Boxes, ArrowLeft, ArrowRightLeft, FileText, Upload, AlertTriangle, 
  CheckCircle, Thermometer, ExternalLink, Loader2, Check 
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Timeline } from '@/components/ui/Timeline';
import { QRCode } from '@/components/ui/QRCode';
import { TransactionModal } from '@/components/ui/TransactionModal';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { SupplyChainABI, CONTRACT_ADDRESS } from '@/lib/contracts/SupplyChainABI';
import { formatDateTime, truncateAddress, formatNumber, ipfsToHttp } from '@/lib/utils';
import { uploadToIPFS } from '@/lib/ipfs';
import toast from 'react-hot-toast';

export default function BatchDetailPage() {
  const params = useParams();
  const batchId = params.id as string;
  const { address, isConnected } = useAccount();

  // State for document upload
  const [showDocModal, setShowDocModal] = useState(false);
  const [docType, setDocType] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // State for recall
  const [showRecallModal, setShowRecallModal] = useState(false);
  const [recallReason, setRecallReason] = useState('');

  // Transaction state
  const [showTxModal, setShowTxModal] = useState(false);
  const [txStatus, setTxStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [txHash, setTxHash] = useState<string | undefined>();
  const [txAction, setTxAction] = useState<string>('');

  // Fetch provenance data
  const { data: provenance, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: SupplyChainABI,
    functionName: 'verifyProvenance',
    args: [BigInt(batchId)],
  });

  // Fetch product info
  const productId = provenance?.[0]?.productId;
  const { data: product } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: SupplyChainABI,
    functionName: 'getProduct',
    args: productId ? [productId] : undefined,
    query: {
      enabled: !!productId,
    }
  });

  // Write contracts
  const { writeContract, isPending: isWritePending, data: hash } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    }
  });

  // Update transaction status
  useEffect(() => {
    if (hash && !txHash) {
      setTxHash(hash);
      setShowTxModal(true);
      setTxStatus('pending');
    }
  }, [hash, txHash]);

  useEffect(() => {
    if (isConfirmed && txStatus === 'pending') {
      setTxStatus('success');
      toast.success(`${txAction} successful!`);
      refetch();
      setShowDocModal(false);
      setShowRecallModal(false);
      setTxHash(undefined);
    }
  }, [isConfirmed, txStatus, txAction, refetch]);

  const handleDocumentUpload = async () => {
    if (!docFile || !docType) {
      toast.error('Please select a file and document type');
      return;
    }

    try {
      setIsUploadingDoc(true);
      const { cid } = await uploadToIPFS(docFile);
      setIsUploadingDoc(false);
      setTxAction('Document attachment');

      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: SupplyChainABI,
        functionName: 'attachDocument',
        args: [BigInt(batchId), cid, docType],
      });
    } catch (error: any) {
      setIsUploadingDoc(false);
      toast.error(error.message || 'Failed to upload document');
    }
  };

  const handleRecall = async () => {
    if (!recallReason.trim()) {
      toast.error('Please provide a recall reason');
      return;
    }

    setTxAction('Batch recall');
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: SupplyChainABI,
      functionName: 'recallBatch',
      args: [BigInt(batchId), recallReason],
    });
  };

  const batch = provenance?.[0];
  const transfers = provenance?.[1] || [];
  const documents = provenance?.[2] || [];
  const productInfo = provenance?.[3];

  const isOwner = address && batch?.currentOwner.toLowerCase() === address.toLowerCase();

  // Transform data for timeline
  const timelineEvents = provenance ? [
    {
      type: 'created' as const,
      title: 'Batch Created',
      description: `Batch #${batch?.id.toString()} created with ${formatNumber(batch?.quantity || 0)} units`,
      timestamp: Number(batch?.createdAt || 0),
      actor: productInfo?.manufacturer,
    },
    ...transfers.map((transfer: any) => ({
      type: 'transfer' as const,
      title: 'Custody Transfer',
      description: `Transferred from ${truncateAddress(transfer.from)} to ${truncateAddress(transfer.to)}`,
      timestamp: Number(transfer.timestamp),
      actor: transfer.from,
      location: transfer.location,
    })),
    ...documents.map((doc: any) => ({
      type: 'document' as const,
      title: `Document: ${doc.documentType}`,
      description: `Document attached by ${truncateAddress(doc.attachedBy)}`,
      timestamp: Number(doc.timestamp),
      actor: doc.attachedBy,
      documentCID: doc.ipfsCID,
    })),
    ...(batch?.recalled ? [{
      type: 'recall' as const,
      title: 'Batch Recalled',
      description: batch.recallReason,
      timestamp: Date.now() / 1000,
    }] : []),
  ].sort((a, b) => a.timestamp - b.timestamp) : [];

  const verificationUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify?batch=${batchId}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <main className="pt-20 pb-12 px-4">
          <div className="mx-auto max-w-4xl text-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-[var(--primary)] mx-auto mb-4" />
            <p className="text-[var(--text-secondary)]">Loading batch details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!batch?.exists) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <main className="pt-20 pb-12 px-4">
          <div className="mx-auto max-w-4xl text-center py-20">
            <AlertTriangle className="h-16 w-16 text-[var(--error)] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Batch Not Found
            </h1>
            <p className="text-[var(--text-secondary)] mb-6">
              No batch found with ID #{batchId}
            </p>
            <Link href="/batches" className="btn-primary">
              Back to Batches
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <main className="pt-20 pb-12 px-4">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link 
              href="/batches" 
              className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Batches
            </Link>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
                  Batch #{batchId}
                  {batch.recalled ? (
                    <span className="badge badge-error flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Recalled
                    </span>
                  ) : (
                    <span className="badge badge-success flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </span>
                  )}
                </h1>
                <p className="text-[var(--text-secondary)]">
                  {(product as any)?.name || `Product #${batch.productId.toString()}`}
                </p>
              </div>
              {isOwner && !batch.recalled && (
                <div className="flex gap-2">
                  <Link
                    href={`/transfer?batchId=${batchId}`}
                    className="btn-primary flex items-center gap-2"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                    Transfer
                  </Link>
                  <button
                    onClick={() => setShowDocModal(true)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Add Document
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recall Warning */}
          {batch.recalled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-xl p-6 mb-6"
            >
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-8 w-8 text-[var(--error)] flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-[var(--error)] mb-2">
                    This Batch Has Been Recalled
                  </h3>
                  <p className="text-[var(--text-secondary)]">
                    <strong>Reason:</strong> {batch.recallReason}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Batch Details Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
          >
            <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Boxes className="h-5 w-5 text-[var(--secondary)]" />
                Batch Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Batch ID</p>
                  <p className="font-semibold text-[var(--text-primary)]">#{batchId}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Product ID</p>
                  <p className="font-semibold text-[var(--text-primary)]">
                    #{batch.productId.toString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Quantity</p>
                  <p className="font-semibold text-[var(--text-primary)]">
                    {formatNumber(batch.quantity)} units
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Created</p>
                  <p className="font-semibold text-[var(--text-primary)]">
                    {formatDateTime(batch.createdAt)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-[var(--text-muted)]">Current Owner</p>
                  <p className="font-mono text-[var(--text-primary)] text-sm">
                    {batch.currentOwner}
                    {isOwner && (
                      <span className="ml-2 text-[var(--primary)]">(You)</span>
                    )}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-[var(--text-muted)]">Manufacturer</p>
                  <p className="font-mono text-[var(--text-primary)] text-sm">
                    {productInfo?.manufacturer}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 flex flex-col items-center justify-center">
              <p className="text-sm text-[var(--text-secondary)] mb-4">Verification QR Code</p>
              <QRCode value={verificationUrl} size={150} />
              <p className="text-xs text-[var(--text-muted)] mt-4 text-center">
                Scan to verify authenticity
              </p>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-3 gap-4 mb-6"
          >
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-center">
              <ArrowRightLeft className="h-6 w-6 text-[var(--primary)] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[var(--text-primary)]">{transfers.length}</p>
              <p className="text-sm text-[var(--text-secondary)]">Transfers</p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-center">
              <FileText className="h-6 w-6 text-[var(--secondary)] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[var(--text-primary)]">{documents.length}</p>
              <p className="text-sm text-[var(--text-secondary)]">Documents</p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-center">
              <CheckCircle className="h-6 w-6 text-[var(--accent)] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[var(--text-primary)]">Yes</p>
              <p className="text-sm text-[var(--text-secondary)]">On-Chain</p>
            </div>
          </motion.div>

          {/* Provenance Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
              Provenance Timeline
            </h2>
            <Timeline events={timelineEvents} />
          </motion.div>

          {/* Documents List */}
          {documents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 mb-6"
            >
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--secondary)]" />
                Attached Documents
              </h2>
              <div className="space-y-3">
                {documents.map((doc: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]"
                  >
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{doc.documentType}</p>
                      <p className="text-sm text-[var(--text-muted)]">
                        Added by {truncateAddress(doc.attachedBy)} • {formatDateTime(doc.timestamp)}
                      </p>
                    </div>
                    <a
                      href={ipfsToHttp(doc.ipfsCID)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-sm flex items-center gap-2"
                    >
                      View
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Owner Actions */}
          {isOwner && !batch.recalled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Owner Actions
              </h2>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/transfer?batchId=${batchId}`}
                  className="btn-primary flex items-center gap-2"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Transfer Custody
                </Link>
                <button
                  onClick={() => setShowDocModal(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Attach Document
                </button>
                <button
                  onClick={() => setShowRecallModal(true)}
                  className="px-4 py-2 rounded-lg border border-[var(--error)] text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Recall Batch
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Document Upload Modal */}
      {showDocModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowDocModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
              Attach Document
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Document Type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full input-dark"
                >
                  <option value="">Select type</option>
                  <option value="Certificate">Certificate</option>
                  <option value="Invoice">Invoice</option>
                  <option value="Quality Report">Quality Report</option>
                  <option value="Customs Declaration">Customs Declaration</option>
                  <option value="Lab Test Results">Lab Test Results</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  File
                </label>
                <input
                  type="file"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  className="w-full input-dark"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDocumentUpload}
                disabled={isUploadingDoc || isWritePending}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {isUploadingDoc || isWritePending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {isUploadingDoc ? 'Uploading...' : 'Confirming...'}
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Upload
                  </>
                )}
              </button>
              <button
                onClick={() => setShowDocModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Recall Modal */}
      {showRecallModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowRecallModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-8 w-8 text-[var(--error)]" />
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Recall Batch
              </h2>
            </div>

            <p className="text-[var(--text-secondary)] mb-4">
              Warning: This action cannot be undone. The batch will be permanently marked as recalled.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Recall Reason *
              </label>
              <textarea
                value={recallReason}
                onChange={(e) => setRecallReason(e.target.value)}
                placeholder="Enter the reason for recalling this batch..."
                rows={3}
                className="w-full input-dark resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRecall}
                disabled={isWritePending || !recallReason.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-[var(--error)] text-white hover:bg-[var(--error)]/80 transition-colors flex items-center justify-center gap-2"
              >
                {isWritePending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5" />
                    Confirm Recall
                  </>
                )}
              </button>
              <button
                onClick={() => setShowRecallModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showTxModal}
        status={txStatus}
        hash={txHash}
        title={txAction}
        successMessage={`${txAction} successful!`}
        onClose={() => {
          setShowTxModal(false);
          setTxHash(undefined);
          setTxStatus('pending');
        }}
      />

      <Footer />
    </div>
  );
}
