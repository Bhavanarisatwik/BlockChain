'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, ArrowLeft, Upload, Loader2, Check, X } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TransactionModal } from '@/components/ui/TransactionModal';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { SupplyChainABI, CONTRACT_ADDRESS } from '@/lib/contracts/SupplyChainABI';
import { uploadToIPFS, uploadJSONToIPFS } from '@/lib/ipfs';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface ProductMetadata {
  name: string;
  description: string;
  category: string;
  specifications: Record<string, string>;
  images: string[];
  certifications: string[];
  origin: string;
  manufacturer: {
    name: string;
    address: string;
    contact: string;
  };
}

export default function NewProductPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    description: '',
    category: '',
    origin: '',
    manufacturerName: '',
    manufacturerContact: '',
    specifications: [{ key: '', value: '' }],
    certifications: [''],
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [isUploadingMetadata, setIsUploadingMetadata] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [txStatus, setTxStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [txHash, setTxHash] = useState<string | undefined>();

  const { writeContract, isPending: isWritePending, data: hash } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    }
  });

  // Update transaction status using useEffect to avoid setState during render
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
      toast.success('Product registered successfully!');
      setTimeout(() => router.push('/products'), 2000);
    }
  }, [isConfirmed, txStatus, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpecificationChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData((prev) => ({ ...prev, specifications: newSpecs }));
  };

  const addSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }]
    }));
  };

  const removeSpecification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  const handleCertificationChange = (index: number, value: string) => {
    const newCerts = [...formData.certifications];
    newCerts[index] = value;
    setFormData((prev) => ({ ...prev, certifications: newCerts }));
  };

  const addCertification = () => {
    setFormData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, '']
    }));
  };

  const removeCertification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!formData.name || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsUploadingMetadata(true);

      // Upload images to IPFS
      const imageUrls: string[] = [];
      for (const image of images) {
        const { url } = await uploadToIPFS(image);
        imageUrls.push(url);
      }

      // Create metadata object
      const metadata: ProductMetadata = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        origin: formData.origin,
        specifications: formData.specifications.reduce((acc, spec) => {
          if (spec.key && spec.value) {
            acc[spec.key] = spec.value;
          }
          return acc;
        }, {} as Record<string, string>),
        images: imageUrls,
        certifications: formData.certifications.filter(Boolean),
        manufacturer: {
          name: formData.manufacturerName,
          address: address || '',
          contact: formData.manufacturerContact,
        },
      };

      // Upload metadata to IPFS
      const { url: metadataUri } = await uploadJSONToIPFS(metadata as unknown as Record<string, unknown>);
      setIsUploadingMetadata(false);

      // Generate product ID if not provided
      const productId = formData.productId 
        ? BigInt(formData.productId) 
        : BigInt(Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000));

      // Call smart contract
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: SupplyChainABI,
        functionName: 'createProduct',
        args: [productId, metadataUri],
      });

    } catch (error: any) {
      setIsUploadingMetadata(false);
      console.error('Error creating product:', error);
      toast.error(error.message || 'Failed to create product');
    }
  };

  const isSubmitting = isUploadingMetadata || isWritePending || isConfirming;

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
              href="/products" 
              className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Link>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              Register New Product
            </h1>
            <p className="text-[var(--text-secondary)]">
              Add a new product to the blockchain registry
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
            {/* Basic Info */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-[var(--primary)]" />
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    className="w-full input-dark"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                    rows={4}
                    className="w-full input-dark resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full input-dark"
                    >
                      <option value="">Select category</option>
                      <option value="electronics">Electronics</option>
                      <option value="food">Food & Beverages</option>
                      <option value="pharmaceuticals">Pharmaceuticals</option>
                      <option value="automotive">Automotive</option>
                      <option value="textiles">Textiles</option>
                      <option value="chemicals">Chemicals</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Origin
                    </label>
                    <input
                      type="text"
                      name="origin"
                      value={formData.origin}
                      onChange={handleInputChange}
                      placeholder="e.g., USA, China"
                      className="w-full input-dark"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Manufacturer Info */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Manufacturer Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="manufacturerName"
                    value={formData.manufacturerName}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                    className="w-full input-dark"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="manufacturerContact"
                    value={formData.manufacturerContact}
                    onChange={handleInputChange}
                    placeholder="contact@company.com"
                    className="w-full input-dark"
                  />
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Specifications
              </h2>

              <div className="space-y-3">
                {formData.specifications.map((spec, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                      placeholder="Property name"
                      className="flex-1 input-dark"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1 input-dark"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="p-2 text-[var(--error)] hover:bg-[var(--error)]/10 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSpecification}
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  + Add Specification
                </button>
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Certifications
              </h2>

              <div className="space-y-3">
                {formData.certifications.map((cert, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={cert}
                      onChange={(e) => handleCertificationChange(index, e.target.value)}
                      placeholder="e.g., ISO 9001, FDA Approved"
                      className="flex-1 input-dark"
                    />
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="p-2 text-[var(--error)] hover:bg-[var(--error)]/10 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCertification}
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  + Add Certification
                </button>
              </div>
            </div>

            {/* Images */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Product Images
              </h2>

              <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-4" />
                <p className="text-[var(--text-secondary)] mb-2">
                  Drag and drop images here, or click to select
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="images"
                />
                <label
                  htmlFor="images"
                  className="btn-secondary inline-flex items-center gap-2 cursor-pointer"
                >
                  Select Images
                </label>
                {images.length > 0 && (
                  <p className="mt-4 text-sm text-[var(--text-muted)]">
                    {images.length} file(s) selected
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting || !isConnected}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {isUploadingMetadata ? 'Uploading to IPFS...' : 'Confirming...'}
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Register Product
                  </>
                )}
              </button>
              <Link href="/products" className="btn-secondary">
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
        title="Registering Product"
        successMessage="Product registered successfully!"
        onClose={() => {
          setShowTxModal(false);
          if (txStatus === 'success') {
            router.push('/products');
          }
        }}
      />

      <Footer />
    </div>
  );
}
