'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Package, 
  Boxes, 
  ArrowRightLeft, 
  FileText,
  Plus,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StatCard } from '@/components/ui/StatCard';
import { SupplyChainABI, CONTRACT_ADDRESS } from '@/lib/contracts/SupplyChainABI';
import { formatNumber, formatRelativeTime } from '@/lib/utils';

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Read contract stats
  const { data: stats } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: SupplyChainABI,
    functionName: 'getStats',
  });

  // Read user's batches
  const { data: userBatches } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: SupplyChainABI,
    functionName: 'getBatchesByOwner',
    args: address ? [address] : undefined,
  });

  const totalProducts = stats ? Number(stats[0]) : 0;
  const totalBatches = stats ? Number(stats[1]) : 0;
  const totalTransfers = stats ? Number(stats[2]) : 0;
  const totalDocuments = stats ? Number(stats[3]) : 0;
  const myBatches = userBatches ? userBatches.length : 0;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      
      <main className="pt-20 pb-12 px-4">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Dashboard</h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Overview of your supply chain operations
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <StatCard
              title="Total Products"
              value={formatNumber(totalProducts)}
              icon={Package}
              color="primary"
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Total Batches"
              value={formatNumber(totalBatches)}
              icon={Boxes}
              color="secondary"
              trend={{ value: 8, isPositive: true }}
            />
            <StatCard
              title="Total Transfers"
              value={formatNumber(totalTransfers)}
              icon={ArrowRightLeft}
              color="accent"
              trend={{ value: 23, isPositive: true }}
            />
            <StatCard
              title="Documents"
              value={formatNumber(totalDocuments)}
              icon={FileText}
              color="warning"
              trend={{ value: 5, isPositive: true }}
            />
          </motion.div>

          {/* My Batches & Quick Actions */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* My Batches */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  My Batches
                </h2>
                <span className="badge badge-info">{myBatches} batches</span>
              </div>

              {!isConnected ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
                  <p className="text-[var(--text-secondary)]">
                    Connect your wallet to view your batches
                  </p>
                </div>
              ) : myBatches === 0 ? (
                <div className="text-center py-12">
                  <Boxes className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
                  <p className="text-[var(--text-secondary)] mb-4">
                    You don&apos;t have any batches yet
                  </p>
                  <Link href="/batches/new" className="btn-primary inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Batch
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userBatches?.slice(0, 5).map((batchId: bigint) => (
                    <Link
                      key={batchId.toString()}
                      href={`/batch/${batchId.toString()}`}
                      className="flex items-center justify-between p-4 rounded-lg bg-[var(--surface-light)] hover:bg-[var(--surface-lighter)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                          <Boxes className="h-5 w-5 text-[var(--primary)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            Batch #{batchId.toString()}
                          </p>
                          <p className="text-sm text-[var(--text-secondary)]">
                            Click to view details
                          </p>
                        </div>
                      </div>
                      <span className="badge badge-success">Active</span>
                    </Link>
                  ))}
                  {myBatches > 5 && (
                    <Link
                      href="/batches"
                      className="block text-center text-[var(--primary)] hover:underline text-sm"
                    >
                      View all {myBatches} batches
                    </Link>
                  )}
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  href="/products/new"
                  className="flex items-center gap-3 p-4 rounded-lg bg-[var(--surface-light)] hover:bg-[var(--surface-lighter)] transition-colors"
                >
                  <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                    <Package className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">New Product</p>
                    <p className="text-sm text-[var(--text-secondary)]">Register a product</p>
                  </div>
                </Link>
                <Link
                  href="/batches/new"
                  className="flex items-center gap-3 p-4 rounded-lg bg-[var(--surface-light)] hover:bg-[var(--surface-lighter)] transition-colors"
                >
                  <div className="p-2 rounded-lg bg-[var(--secondary)]/10">
                    <Boxes className="h-5 w-5 text-[var(--secondary)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">New Batch</p>
                    <p className="text-sm text-[var(--text-secondary)]">Create a batch</p>
                  </div>
                </Link>
                <Link
                  href="/transfer"
                  className="flex items-center gap-3 p-4 rounded-lg bg-[var(--surface-light)] hover:bg-[var(--surface-lighter)] transition-colors"
                >
                  <div className="p-2 rounded-lg bg-[var(--accent)]/10">
                    <ArrowRightLeft className="h-5 w-5 text-[var(--accent)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Transfer Batch</p>
                    <p className="text-sm text-[var(--text-secondary)]">Transfer custody</p>
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Network Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Network Activity
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-lg bg-[var(--surface-light)]">
                <p className="text-2xl font-bold text-[var(--primary)]">{totalProducts}</p>
                <p className="text-sm text-[var(--text-secondary)]">Products</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-[var(--surface-light)]">
                <p className="text-2xl font-bold text-[var(--secondary)]">{totalBatches}</p>
                <p className="text-sm text-[var(--text-secondary)]">Batches</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-[var(--surface-light)]">
                <p className="text-2xl font-bold text-[var(--accent)]">{totalTransfers}</p>
                <p className="text-sm text-[var(--text-secondary)]">Transfers</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-[var(--surface-light)]">
                <p className="text-2xl font-bold text-[var(--warning)]">{totalDocuments}</p>
                <p className="text-sm text-[var(--text-secondary)]">Documents</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
