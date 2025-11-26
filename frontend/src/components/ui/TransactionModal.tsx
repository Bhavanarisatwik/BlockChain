'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { getBlockExplorerUrl } from '@/lib/wagmi';

export interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'pending' | 'confirming' | 'success' | 'error';
  title: string;
  txHash?: string;
  hash?: string;
  chainId?: number;
  error?: string;
  successMessage?: string;
}

export function TransactionModal({
  isOpen,
  onClose,
  status,
  title,
  txHash,
  hash,
  chainId = 11155111,
  error,
  successMessage,
}: TransactionModalProps) {
  const transactionHash = txHash || hash;
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={status !== 'pending' && status !== 'confirming' ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 shadow-2xl">
              {/* Close button */}
              {(status === 'success' || status === 'error') && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[var(--surface-light)] transition-colors"
                >
                  <X className="h-5 w-5 text-[var(--text-secondary)]" />
                </button>
              )}

              {/* Content */}
              <div className="text-center">
                {/* Icon */}
                <div className="mb-4 flex justify-center">
                  {(status === 'pending' || status === 'confirming') && (
                    <div className="relative">
                      <Loader2 className="h-16 w-16 text-[var(--primary)] animate-spin" />
                      <div className="absolute inset-0 blur-xl bg-[var(--primary)] opacity-30" />
                    </div>
                  )}
                  {status === 'success' && (
                    <div className="relative">
                      <CheckCircle className="h-16 w-16 text-[var(--accent)]" />
                      <div className="absolute inset-0 blur-xl bg-[var(--accent)] opacity-30" />
                    </div>
                  )}
                  {status === 'error' && (
                    <div className="relative">
                      <XCircle className="h-16 w-16 text-[var(--error)]" />
                      <div className="absolute inset-0 blur-xl bg-[var(--error)] opacity-30" />
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                  {status === 'pending' && 'Confirm Transaction'}
                  {status === 'confirming' && 'Processing Transaction'}
                  {status === 'success' && 'Transaction Successful'}
                  {status === 'error' && 'Transaction Failed'}
                </h3>

                {/* Description */}
                <p className="text-[var(--text-secondary)] mb-4">
                  {status === 'pending' && `Please confirm "${title}" in your wallet`}
                  {status === 'confirming' && 'Waiting for blockchain confirmation...'}
                  {status === 'success' && (successMessage || `"${title}" completed successfully`)}
                  {status === 'error' && (error || 'Something went wrong. Please try again.')}
                </p>

                {/* Transaction hash */}
                {transactionHash && (
                  <a
                    href={getBlockExplorerUrl(chainId, transactionHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--surface-light)] text-[var(--primary)] hover:bg-[var(--surface-lighter)] transition-colors text-sm"
                  >
                    View on Explorer
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}

                {/* Actions */}
                {(status === 'success' || status === 'error') && (
                  <button
                    onClick={onClose}
                    className="mt-4 w-full btn-primary"
                  >
                    {status === 'success' ? 'Done' : 'Close'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
