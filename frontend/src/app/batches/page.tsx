
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Boxes, Plus, Search, Filter, Eye, AlertTriangle, CheckCircle, ArrowRightLeft } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { useReadContract, useAccount } from 'wagmi';
import { readContract } from '@wagmi/core';
import { config } from '@/lib/wagmi';
import { SupplyChainABI, CONTRACT_ADDRESS } from '@/lib/contracts/SupplyChainABI';
import { formatDateTime, truncateAddress, formatNumber } from '@/lib/utils';

interface Batch {
  id: bigint;
  productId: bigint;
  quantity: bigint;
  currentOwner: string;
  createdAt: bigint;
  exists: boolean;
  recalled: boolean;
  recallReason: string;
}

export default function BatchesPage() {
  const { address } = useAccount();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'mine' | 'recalled'>('all');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch total batches
  const { data: stats } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: SupplyChainABI,
    functionName: 'getStats',
  });

  // Fetch user's batches
  const { data: userBatchIds } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: SupplyChainABI,
    functionName: 'getBatchesByOwner',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  const totalBatches = stats ? Number(stats[1]) : 0;

  const { data: allBatchIds, isLoading: isLoadingIds } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: SupplyChainABI,
    functionName: 'getAllBatchIds',
  });

  useEffect(() => {
    async function fetchBatches() {
      const ids = (allBatchIds as bigint[]) || [];
      if (!ids.length) {
        setBatches([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const results = await Promise.all(ids.map(async (id) => {
        try {
          const batch = await readContract(config, {
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: SupplyChainABI,
            functionName: 'getBatch',
            args: [id],
          });
          const b = batch as Batch;
          return b.exists ? b : null;
        } catch (err) {
          console.error('Error fetching batch', id.toString(), err);
          return null;
        }
      }));
      setBatches(results.filter((b): b is Batch => b !== null));
      setIsLoading(false);
    }
    if (!isLoadingIds) {
      fetchBatches();
    }
  }, [allBatchIds, isLoadingIds]);

  // Get product names for display
  const productIds = [...new Set(batches.map(b => b.productId.toString()))];
  const [productNames, setProductNames] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchProducts() {
      if (productIds.length === 0) {
        setProductNames({});
        return;
      }
      const entries = await Promise.all(productIds.map(async (id) => {
        try {
          const product = await readContract(config, {
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: SupplyChainABI,
            functionName: 'getProduct',
            args: [BigInt(id)],
          });
          const p = product as any;
          const label = p?.name ?? (p?.metaURI ? String(p.metaURI).slice(0, 24) : `Product ${id}`);
          return [id, label] as const;
        } catch {
          return [id, `Product ${id}`] as const;
        }
      }));
      setProductNames(Object.fromEntries(entries));
    }
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIds.join(',')]);

  // Filter batches
  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      batch.id.toString().includes(searchQuery) ||
      productNames[batch.productId.toString()]?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (filter === 'mine' && address) {
      matchesFilter = batch.currentOwner.toLowerCase() === address.toLowerCase();
    } else if (filter === 'recalled') {
      matchesFilter = batch.recalled;
    }

    return matchesSearch && matchesFilter;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <main className="pt-20 pb-12 px-4">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                Batches
              </h1>
              <p className="text-[var(--text-secondary)]">
                Track and manage product batches
              </p>
            </div>
            <Link href="/batches/new" className="btn-primary flex items-center gap-2 w-fit">
              <Plus className="h-4 w-4" />
              Create Batch
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-sm text-[var(--text-muted)]">Total Batches</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{totalBatches}</p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-sm text-[var(--text-muted)]">My Batches</p>
              <p className="text-2xl font-bold text-[var(--primary)]">
                {userBatchIds ? (userBatchIds as bigint[]).length : 0}
              </p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-sm text-[var(--text-muted)]">Active</p>
              <p className="text-2xl font-bold text-[var(--accent)]">
                {batches.filter(b => !b.recalled).length}
              </p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-sm text-[var(--text-muted)]">Recalled</p>
              <p className="text-2xl font-bold text-[var(--error)]">
                {batches.filter(b => b.recalled).length}
              </p>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-6"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search batches by ID or product name..."
                className="w-full input-dark pl-12"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'mine', 'recalled'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                      ? 'bg-[var(--primary)] text-black'
                      : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
                    }`}
                >
                  {f === 'mine' ? 'My Batches' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Batches Grid */}
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Boxes className="h-16 w-16 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)]">Loading batches...</p>
            </motion.div>
          ) : filteredBatches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Boxes className="h-16 w-16 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)] mb-4">
                {searchQuery || filter !== 'all'
                  ? 'No batches match your criteria'
                  : 'No batches created yet'
                }
              </p>
              <Link href="/batches/new" className="btn-primary inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create First Batch
              </Link>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredBatches.map((batch) => (
                <motion.div
                  key={batch.id.toString()}
                  variants={itemVariants}
                  className={`bg-[var(--surface)] border rounded-xl p-6 transition-all group hover:border-[var(--primary)]/50 ${batch.recalled
                      ? 'border-[var(--error)]/50'
                      : 'border-[var(--border)]'
                    }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-[var(--secondary)]/10">
                      <Boxes className="h-6 w-6 text-[var(--secondary)]" />
                    </div>
                    <div className="flex items-center gap-2">
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
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1 group-hover:text-[var(--primary)] transition-colors">
                    Batch #{batch.id.toString()}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    {productNames[batch.productId.toString()] || `Product #${batch.productId.toString()}`}
                  </p>

                  {batch.recalled && batch.recallReason && (
                    <div className="mb-4 p-3 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/30">
                      <p className="text-sm text-[var(--error)]">
                        <strong>Recall Reason:</strong> {batch.recallReason}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Quantity</span>
                      <span className="text-[var(--text-secondary)]">
                        {formatNumber(batch.quantity)} units
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Owner</span>
                      <span className="text-[var(--text-secondary)] font-mono">
                        {truncateAddress(batch.currentOwner)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Created</span>
                      <span className="text-[var(--text-secondary)]">
                        {formatDateTime(batch.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/batch/${batch.id.toString()}`}
                      className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>
                    {address?.toLowerCase() === batch.currentOwner.toLowerCase() && !batch.recalled && (
                      <Link
                        href={`/transfer?batchId=${batch.id.toString()}`}
                        className="p-2 btn-primary"
                        title="Transfer Batch"
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
