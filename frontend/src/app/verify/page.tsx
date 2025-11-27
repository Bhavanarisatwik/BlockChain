'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, QrCode, ArrowRight, CheckCircle, AlertTriangle, Boxes, FileText, ArrowRightLeft } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { QRScanner } from '@/components/ui/QRScanner';
import { QRCode } from '@/components/ui/QRCode';
import { Timeline } from '@/components/ui/Timeline';
import { useReadContract } from 'wagmi';
import { SupplyChainABI, CONTRACT_ADDRESS } from '@/lib/contracts/SupplyChainABI';
import { formatDateTime, truncateAddress, formatNumber, ipfsToHttp } from '@/lib/utils';

export default function VerifyPage() {
  const router = useRouter();
  const [batchId, setBatchId] = useState('');
  const [searchedBatchId, setSearchedBatchId] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  // Fetch provenance data
  const { data: provenance, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: SupplyChainABI,
    functionName: 'verifyProvenance',
    args: searchedBatchId ? [BigInt(searchedBatchId)] : undefined,
    query: {
      enabled: !!searchedBatchId,
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchId.trim()) {
      setSearchedBatchId(batchId.trim());
    }
  };

  const handleScan = (result: string) => {
    // Extract batch ID from QR code (could be URL or just ID)
    const match = result.match(/batch\/(\d+)|^(\d+)$/);
    if (match) {
      const id = match[1] || match[2];
      setBatchId(id);
      setSearchedBatchId(id);
    }
    setShowScanner(false);
  };

  // Transform data for timeline
  const timelineEvents = provenance ? [
    {
      type: 'created' as const,
      title: 'Batch Created',
      description: `Batch #${provenance[0].id.toString()} created with ${formatNumber(provenance[0].quantity)} units`,
      timestamp: Number(provenance[0].createdAt),
      actor: provenance[3].manufacturer,
    },
    ...provenance[1].map((transfer: any) => ({
      type: 'transfer' as const,
      title: 'Custody Transfer',
      description: `Transferred from ${truncateAddress(transfer.from)} to ${truncateAddress(transfer.to)}`,
      timestamp: Number(transfer.timestamp),
      actor: transfer.from,
      location: transfer.location,
    })),
    ...provenance[2].map((doc: any) => ({
      type: 'document' as const,
      title: `Document: ${doc.documentType}`,
      description: `Document attached by ${truncateAddress(doc.attachedBy)}`,
      timestamp: Number(doc.timestamp),
      actor: doc.attachedBy,
      documentCID: doc.ipfsCID,
    })),
    ...(provenance[0].recalled ? [{
      type: 'recall' as const,
      title: 'Batch Recalled',
      description: provenance[0].recallReason,
      timestamp: Number(provenance[0].createdAt) + 1000, // Approximate
    }] : []),
  ].sort((a, b) => a.timestamp - b.timestamp) : [];

  const verificationUrl = searchedBatchId
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/verify?batch=${searchedBatchId}`
    : '';

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <main className="pt-20 pb-12 px-4">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              Verify Product Provenance
            </h1>
            <p className="text-[var(--text-secondary)]">
              Enter a batch ID or scan a QR code to verify authenticity
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 mb-8"
          >
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  placeholder="Enter Batch ID (e.g., 12345)"
                  className="w-full input-dark pl-12"
                />
              </div>
              <button type="submit" className="btn-primary flex items-center gap-2">
                Verify
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <QrCode className="h-4 w-4" />
                Scan
              </button>
            </form>
          </motion.div>

          {/* QR Scanner Modal */}
          {showScanner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
              <div className="w-full max-w-md">
                <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--primary)] border-t-transparent mx-auto mb-4" />
              <p className="text-[var(--text-secondary)]">Fetching provenance data...</p>
            </div>
          )}

          {/* Error State */}
          {error && searchedBatchId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-xl p-6 text-center"
            >
              <AlertTriangle className="h-12 w-12 text-[var(--error)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--error)] mb-2">
                Batch Not Found
              </h3>
              <p className="text-[var(--text-secondary)]">
                No batch found with ID #{searchedBatchId}. Please check the ID and try again.
              </p>
            </motion.div>
          )}

          {/* Provenance Results */}
          {provenance && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Verification Status */}
              <div className={`rounded-xl p-6 border ${provenance[0].recalled
                ? 'bg-[var(--error)]/10 border-[var(--error)]/30'
                : 'bg-[var(--accent)]/10 border-[var(--accent)]/30'
                }`}>
                <div className="flex items-center gap-4">
                  {provenance[0].recalled ? (
                    <AlertTriangle className="h-10 w-10 text-[var(--error)]" />
                  ) : (
                    <CheckCircle className="h-10 w-10 text-[var(--accent)]" />
                  )}
                  <div>
                    <h3 className={`text-xl font-bold ${provenance[0].recalled ? 'text-[var(--error)]' : 'text-[var(--accent)]'
                      }`}>
                      {provenance[0].recalled ? 'RECALLED' : 'VERIFIED AUTHENTIC'}
                    </h3>
                    <p className="text-[var(--text-secondary)]">
                      {provenance[0].recalled
                        ? `This batch has been recalled: ${provenance[0].recallReason}`
                        : 'This batch has been verified on the blockchain'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Batch Details */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Boxes className="h-5 w-5 text-[var(--primary)]" />
                  Batch Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Batch ID</p>
                    <p className="font-semibold text-[var(--text-primary)]">
                      #{provenance[0].id.toString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Product ID</p>
                    <p className="font-semibold text-[var(--text-primary)]">
                      #{provenance[0].productId.toString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Quantity</p>
                    <p className="font-semibold text-[var(--text-primary)]">
                      {formatNumber(provenance[0].quantity)} units
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Created</p>
                    <p className="font-semibold text-[var(--text-primary)]">
                      {formatDateTime(provenance[0].createdAt)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-[var(--text-secondary)]">Current Owner</p>
                    <p className="font-mono text-[var(--text-primary)]">
                      {provenance[0].currentOwner}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-[var(--text-secondary)]">Manufacturer</p>
                    <p className="font-mono text-[var(--text-primary)]">
                      {provenance[3].manufacturer}
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-center">
                  <ArrowRightLeft className="h-6 w-6 text-[var(--primary)] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {provenance[1].length}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">Transfers</p>
                </div>
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-center">
                  <FileText className="h-6 w-6 text-[var(--secondary)] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {provenance[2].length}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">Documents</p>
                </div>
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 text-center">
                  <CheckCircle className="h-6 w-6 text-[var(--accent)] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {provenance[0].exists ? 'Yes' : 'No'}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">On-Chain</p>
                </div>
              </div>

              {/* Provenance Timeline */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
                  Provenance Timeline
                </h3>
                <Timeline events={timelineEvents} />
              </div>

              {/* QR Code for sharing */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                  Share Verification
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  Scan this QR code to verify this batch
                </p>
                <div className="flex justify-center">
                  <QRCode value={verificationUrl} size={180} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Initial State */}
          {!searchedBatchId && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center py-16"
            >
              <QrCode className="h-16 w-16 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)] mb-2">
                Enter a batch ID or scan a QR code to verify product authenticity
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                All verification data is fetched directly from the Ethereum blockchain
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
