'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightLeft, ArrowLeft, Loader2, Check, AlertTriangle, Boxes, User } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TransactionModal } from '@/components/ui/TransactionModal';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi';
import { SupplyChainABI, CONTRACT_ADDRESS } from '@/lib/contracts/SupplyChainABI';
import { isAddress } from 'viem';
import toast from 'react-hot-toast';
import { formatNumber, truncateAddress } from '@/lib/utils';

function TransferContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedBatchId = searchParams.get('batchId');
  
  const { address, isConnected } = useAccount();
  
  const [formData, setFormData] = useState({
    batchId: preselectedBatchId || '',
    recipient: '',
    location: '',
    notes: '',
    proof: '',
  });
  
  const [showTxModal, setShowTxModal] = useState(false);
  const [txStatus, setTxStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [txHash, setTxHash] = useState<string | undefined>();

  // Fetch user's batches for dropdown
  const { data: userBatchIds } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: SupplyChainABI,
    functionName: 'getBatchesByOwner',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Fetch each batch the user owns
  const userBatches = (userBatchIds as bigint[] || []).map((id) => {
    const { data } = useReadContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: SupplyChainABI,
      functionName: 'getBatch',
      args: [id],
    });
    return { id: id.toString(), data };
  });

  const activeBatches = userBatches.filter(
    ({ data }) => data && (data as any).exists && !(data as any).recalled
  );

  // Fetch selected batch details
  const { data: selectedBatch } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: SupplyChainABI,
    functionName: 'getBatch',
    args: formData.batchId ? [BigInt(formData.batchId)] : undefined,
    query: {
      enabled: !!formData.batchId,
    }
  });

  // Fetch product for selected batch
  const productId = selectedBatch ? (selectedBatch as any).productId : null;
  const { data: product } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: SupplyChainABI,
    functionName: 'getProduct',
    args: productId ? [productId] : undefined,
    query: {
      enabled: !!productId,
    }
  });

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
      toast.success('Batch transferred successfully!');
      setTimeout(() => router.push('/batches'), 2000);
    }
  }, [isConfirmed, txStatus, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!formData.batchId || !formData.recipient) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!isAddress(formData.recipient)) {
      toast.error('Invalid recipient address');
      return;
    }

    if (formData.recipient.toLowerCase() === address?.toLowerCase()) {
      toast.error('Cannot transfer to yourself');
      return;
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: SupplyChainABI,
        functionName: 'transferBatch',
        args: [BigInt(formData.batchId), formData.recipient as `0x${string}`, formData.location, formData.proof || ''],
      });
    } catch (error: any) {
      console.error('Error transferring batch:', error);
      toast.error(error.message || 'Failed to transfer batch');
    }
  };

  const isSubmitting = isWritePending || isConfirming;
  const cannotTransfer = selectedBatch && (selectedBatch as any).recalled;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <main className="pt-20 pb-12 px-4">
        <div className="mx-auto max-w-2xl">
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
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              Transfer Custody
            </h1>
            <p className="text-[var(--text-secondary)]">
              Transfer a batch to another address in the supply chain
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Transfer Info */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-[var(--primary)]" />
                Transfer Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Select Batch *
                  </label>
                  <select
                    name="batchId"
                    value={formData.batchId}
                    onChange={handleInputChange}
                    className="w-full input-dark"
                    required
                  >
                    <option value="">Select a batch to transfer</option>
                    {activeBatches.map(({ id, data }) => (
                      <option key={id} value={id}>
                        Batch #{id} - {formatNumber((data as any)?.quantity)} units
                      </option>
                    ))}
                  </select>
                  {activeBatches.length === 0 && (
                    <p className="mt-2 text-sm text-[var(--text-muted)]">
                      You don't own any batches.{' '}
                      <Link href="/batches/new" className="text-[var(--primary)] hover:underline">
                        Create a batch first
                      </Link>
                    </p>
                  )}
                </div>

                {/* Selected Batch Info */}
                {selectedBatch && (
                  <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                    <div className="flex items-center gap-3 mb-3">
                      <Boxes className="h-5 w-5 text-[var(--secondary)]" />
                      <span className="font-semibold text-[var(--text-primary)]">
                        Batch #{formData.batchId}
                      </span>
                      {(selectedBatch as any).recalled && (
                        <span className="badge badge-error">Recalled</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-[var(--text-muted)]">Product:</span>
                        <span className="ml-2 text-[var(--text-secondary)]">
                          {(product as any)?.name || `#${productId?.toString()}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)]">Quantity:</span>
                        <span className="ml-2 text-[var(--text-secondary)]">
                          {formatNumber((selectedBatch as any).quantity)} units
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {cannotTransfer && (
                  <div className="p-4 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/30 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-[var(--error)]" />
                    <p className="text-sm text-[var(--error)]">
                      This batch has been recalled and cannot be transferred.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Recipient Address *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      name="recipient"
                      value={formData.recipient}
                      onChange={handleInputChange}
                      placeholder="0x..."
                      className="w-full input-dark pl-12 font-mono"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Enter the Ethereum address of the recipient
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Current Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Distribution Center B, Port of Shanghai"
                    className="w-full input-dark"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any additional notes about this transfer..."
                    rows={3}
                    className="w-full input-dark resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[var(--primary)] mb-2">
                What happens when you transfer?
              </h3>
              <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                <li>• Ownership of the batch will change to the recipient</li>
                <li>• You will no longer be able to modify this batch</li>
                <li>• The transfer will be recorded on the blockchain</li>
                <li>• The complete provenance history is preserved</li>
              </ul>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting || !isConnected || activeBatches.length === 0 || cannotTransfer}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="h-5 w-5" />
                    Transfer Batch
                  </>
                )}
              </button>
              <Link href="/batches" className="btn-secondary">
                Cancel
              </Link>
            </div>
          </motion.form>
        </div>
      </main>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showTxModal}
        status={txStatus}
        hash={txHash}
        title="Transferring Batch"
        successMessage="Batch transferred successfully!"
        onClose={() => {
          setShowTxModal(false);
          if (txStatus === 'success') {
            router.push('/batches');
          }
        }}
      />

      <Footer />
    </div>
  );
}

// Loading fallback
function TransferLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="mx-auto max-w-2xl flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Export with Suspense wrapper
export default function TransferPage() {
  return (
    <Suspense fallback={<TransferLoading />}>
      <TransferContent />
    </Suspense>
  );
}
