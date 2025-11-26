'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Boxes, ArrowLeft, Loader2, Check, Package } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TransactionModal } from '@/components/ui/TransactionModal';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi';
import { SupplyChainABI, CONTRACT_ADDRESS } from '@/lib/contracts/SupplyChainABI';
import { readContract } from '@wagmi/core';
import { config } from '@/lib/wagmi';
import toast from 'react-hot-toast';

interface Product {
  id: bigint;
  metaURI: string;
  manufacturer: string;
  createdAt: bigint;
  exists: boolean;
}

export default function NewBatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProductId = searchParams.get('productId');
  
  const { address, isConnected } = useAccount();
  
  const [formData, setFormData] = useState({
    batchId: '',
    productId: preselectedProductId || '',
    quantity: '',
    manufactureDate: new Date().toISOString().split('T')[0],
    location: '',
    notes: '',
  });
  
  const [showTxModal, setShowTxModal] = useState(false);
  const [txStatus, setTxStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [txHash, setTxHash] = useState<string | undefined>();
  const [products, setProducts] = useState<{ id: string; metaURI: string }[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Fetch all product IDs
  const { data: allProductIds, isLoading: isLoadingIds } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: SupplyChainABI,
    functionName: 'getAllProductIds',
  });

  // Fetch products when IDs are loaded
  useEffect(() => {
    async function fetchProducts() {
      if (!allProductIds || (allProductIds as bigint[]).length === 0) {
        setProducts([]);
        setIsLoadingProducts(false);
        return;
      }

      setIsLoadingProducts(true);
      const productPromises = (allProductIds as bigint[]).map(async (id) => {
        try {
          const product = await readContract(config, {
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: SupplyChainABI,
            functionName: 'getProduct',
            args: [id],
          });
          const p = product as Product;
          if (p.exists) {
            return { id: id.toString(), metaURI: p.metaURI };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching product ${id}:`, error);
          return null;
        }
      });

      const fetchedProducts = await Promise.all(productPromises);
      setProducts(fetchedProducts.filter((p): p is { id: string; metaURI: string } => p !== null));
      setIsLoadingProducts(false);
    }

    if (!isLoadingIds) {
      fetchProducts();
    }
  }, [allProductIds, isLoadingIds]);

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
      toast.success('Batch created successfully!');
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

    if (!formData.productId || !formData.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Quantity must be a positive number');
      return;
    }

    try {
      // Generate batch ID if not provided
      const batchId = formData.batchId 
        ? BigInt(formData.batchId) 
        : BigInt(Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000));
      
      // Convert manufacture date to timestamp
      const manufactureDate = formData.manufactureDate 
        ? BigInt(Math.floor(new Date(formData.manufactureDate).getTime() / 1000))
        : BigInt(0);

      // Create metadata for IPFS (or use location as simple metaURI for now)
      const metaURI = formData.notes || formData.location || '';

      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: SupplyChainABI,
        functionName: 'createBatch',
        args: [batchId, BigInt(formData.productId), BigInt(quantity), manufactureDate, metaURI],
      });
    } catch (error: any) {
      console.error('Error creating batch:', error);
      toast.error(error.message || 'Failed to create batch');
    }
  };

  const isSubmitting = isWritePending || isConfirming;

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
              Create New Batch
            </h1>
            <p className="text-[var(--text-secondary)]">
              Create a new batch from an existing product
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
            {/* Batch Info */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Boxes className="h-5 w-5 text-[var(--secondary)]" />
                Batch Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Product *
                  </label>
                  {isLoadingProducts ? (
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading products...
                    </div>
                  ) : (
                    <>
                      <select
                        name="productId"
                        value={formData.productId}
                        onChange={handleInputChange}
                        className="w-full input-dark"
                        required
                      >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            Product #{product.id}
                          </option>
                        ))}
                      </select>
                      {products.length === 0 && (
                        <p className="mt-2 text-sm text-[var(--text-muted)]">
                          No products available.{' '}
                          <Link href="/products/new" className="text-[var(--primary)] hover:underline">
                            Register a product first
                          </Link>
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="Enter quantity (units)"
                    min="1"
                    className="w-full input-dark"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Initial Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Warehouse A, Factory Floor"
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
                    placeholder="Any additional notes about this batch..."
                    rows={3}
                    className="w-full input-dark resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[var(--primary)] mb-2">
                What happens next?
              </h3>
              <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                <li>• A new batch will be created on the blockchain</li>
                <li>• You will be assigned as the initial owner</li>
                <li>• The batch can be transferred to other parties</li>
                <li>• Documents and sensor data can be attached</li>
              </ul>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting || !isConnected || products.length === 0}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Create Batch
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
        title="Creating Batch"
        successMessage="Batch created successfully!"
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
