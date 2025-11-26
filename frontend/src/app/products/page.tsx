'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, Plus, Search, Filter, ExternalLink, Eye, Trash2, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useReadContract, useAccount } from 'wagmi';
import { SupplyChainABI, CONTRACT_ADDRESS } from '@/lib/contracts/SupplyChainABI';
import { formatDateTime, truncateAddress, ipfsToHttp } from '@/lib/utils';
import { readContract } from '@wagmi/core';
import { config } from '@/lib/wagmi';

interface Product {
  id: bigint;
  metaURI: string;
  manufacturer: string;
  createdAt: bigint;
  exists: boolean;
}

export default function ProductsPage() {
  const { address } = useAccount();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const productPromises = (allProductIds as bigint[]).map(async (id) => {
        try {
          const product = await readContract(config, {
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: SupplyChainABI,
            functionName: 'getProduct',
            args: [id],
          });
          return product as Product;
        } catch (error) {
          console.error(`Error fetching product ${id}:`, error);
          return null;
        }
      });

      const fetchedProducts = await Promise.all(productPromises);
      setProducts(fetchedProducts.filter((p): p is Product => p !== null && p.exists));
      setIsLoading(false);
    }

    if (!isLoadingIds) {
      fetchProducts();
    }
  }, [allProductIds, isLoadingIds]);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.metaURI.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
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
                Products
              </h1>
              <p className="text-[var(--text-secondary)]">
                Manage and view all registered products
              </p>
            </div>
            <Link href="/products/new" className="btn-primary flex items-center gap-2 w-fit">
              <Plus className="h-4 w-4" />
              Register Product
            </Link>
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
                placeholder="Search products..."
                className="w-full input-dark pl-12"
              />
            </div>
          </motion.div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
              <span className="ml-3 text-[var(--text-secondary)]">Loading products...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Package className="h-16 w-16 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)] mb-4">
                {searchQuery 
                  ? 'No products match your search'
                  : 'No products registered yet'}
              </p>
              <Link href="/products/new" className="btn-primary inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Register First Product
              </Link>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id.toString()}
                  variants={itemVariants}
                  className="card hover:border-[var(--primary)] transition-colors"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--primary)]/20 rounded-lg">
                          <Package className="h-6 w-6 text-[var(--primary)]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[var(--text-primary)]">
                            Product #{product.id.toString()}
                          </h3>
                          <p className="text-sm text-[var(--text-muted)]">
                            {truncateAddress(product.manufacturer)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Created:</span>
                        <span className="text-[var(--text-secondary)]">
                          {formatDateTime(Number(product.createdAt) * 1000)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Metadata:</span>
                        <span className="text-[var(--text-secondary)] truncate max-w-[150px]">
                          {product.metaURI.substring(0, 20)}...
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[var(--border)] flex gap-2">
                      <Link 
                        href={`/products/${product.id}`}
                        className="btn-secondary flex-1 text-center text-sm"
                      >
                        <Eye className="h-4 w-4 inline mr-1" />
                        View
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
