'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { SupplyChainABI, CONTRACT_ADDRESS } from './contracts/SupplyChainABI';
import { keccak256, toBytes } from 'viem';

// Role constants - must match keccak256 of role names in contract (without _ROLE suffix)
export const ROLES = {
  ADMIN: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
  MANUFACTURER: keccak256(toBytes('MANUFACTURER')) as `0x${string}`,
  LOGISTICS: keccak256(toBytes('LOGISTICS')) as `0x${string}`,
  RETAILER: keccak256(toBytes('RETAILER')) as `0x${string}`,
  AUDITOR: keccak256(toBytes('AUDITOR')) as `0x${string}`,
};

// Contract address
const contractAddress = CONTRACT_ADDRESS as `0x${string}`;

// Hook: Get network statistics
export function useStats() {
  return useReadContract({
    address: contractAddress,
    abi: SupplyChainABI,
    functionName: 'getStats',
  });
}

// Hook: Get product by ID
export function useProduct(productId: bigint | undefined) {
  return useReadContract({
    address: contractAddress,
    abi: SupplyChainABI,
    functionName: 'getProduct',
    args: productId ? [productId] : undefined,
    query: {
      enabled: !!productId,
    },
  });
}

// Hook: Get batch by ID
export function useBatch(batchId: bigint | undefined) {
  return useReadContract({
    address: contractAddress,
    abi: SupplyChainABI,
    functionName: 'getBatch',
    args: batchId ? [batchId] : undefined,
    query: {
      enabled: !!batchId,
    },
  });
}

// Hook: Get full provenance for a batch
export function useProvenance(batchId: bigint | undefined) {
  return useReadContract({
    address: contractAddress,
    abi: SupplyChainABI,
    functionName: 'verifyProvenance',
    args: batchId ? [batchId] : undefined,
    query: {
      enabled: !!batchId,
    },
  });
}

// Hook: Get batches owned by an address
export function useBatchesByOwner(owner: `0x${string}` | undefined) {
  return useReadContract({
    address: contractAddress,
    abi: SupplyChainABI,
    functionName: 'getBatchesByOwner',
    args: owner ? [owner] : undefined,
    query: {
      enabled: !!owner,
    },
  });
}

// Hook: Check if user has a specific role
export function useHasRole(role: `0x${string}`, account: `0x${string}` | undefined) {
  return useReadContract({
    address: contractAddress,
    abi: SupplyChainABI,
    functionName: 'hasRole',
    args: account ? [role, account] : undefined,
    query: {
      enabled: !!account,
    },
  });
}

// Hook: Check all roles for current user
export function useUserRoles() {
  const { address } = useAccount();

  const { data: isAdmin } = useHasRole(ROLES.ADMIN, address);
  const { data: isManufacturer } = useHasRole(ROLES.MANUFACTURER, address);
  const { data: isLogistics } = useHasRole(ROLES.LOGISTICS, address);
  const { data: isRetailer } = useHasRole(ROLES.RETAILER, address);
  const { data: isAuditor } = useHasRole(ROLES.AUDITOR, address);

  return {
    isAdmin: !!isAdmin,
    isManufacturer: !!isManufacturer,
    isLogistics: !!isLogistics,
    isRetailer: !!isRetailer,
    isAuditor: !!isAuditor,
    hasAnyRole: !!isAdmin || !!isManufacturer || !!isLogistics || !!isRetailer || !!isAuditor,
  };
}

// Hook: Check if contract is paused
export function useIsPaused() {
  return useReadContract({
    address: contractAddress,
    abi: SupplyChainABI,
    functionName: 'paused',
  });
}

// Hook: Create product
export function useCreateProduct() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createProduct = (productId: bigint, metadataURI: string) => {
    writeContract({
      address: contractAddress,
      abi: SupplyChainABI,
      functionName: 'createProduct',
      args: [productId, metadataURI],
    });
  };

  return {
    createProduct,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}

// Hook: Create batch
export function useCreateBatch() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createBatch = (
    batchId: bigint, 
    productId: bigint, 
    quantity: bigint, 
    manufactureDate: bigint,
    metaURI: string
  ) => {
    writeContract({
      address: contractAddress,
      abi: SupplyChainABI,
      functionName: 'createBatch',
      args: [batchId, productId, quantity, manufactureDate, metaURI],
    });
  };

  return {
    createBatch,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}

// Hook: Transfer batch
export function useTransferBatch() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const transferBatch = (batchId: bigint, to: `0x${string}`, location: string, proof: string = '') => {
    writeContract({
      address: contractAddress,
      abi: SupplyChainABI,
      functionName: 'transferBatch',
      args: [batchId, to, location, proof],
    });
  };

  return {
    transferBatch,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}

// Hook: Attach document
export function useAttachDocument() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const attachDocument = (batchId: bigint, ipfsCID: string, documentType: string) => {
    writeContract({
      address: contractAddress,
      abi: SupplyChainABI,
      functionName: 'attachDocument',
      args: [batchId, ipfsCID, documentType],
    });
  };

  return {
    attachDocument,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}

// Hook: Recall batch
export function useRecallBatch() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const recallBatch = (batchId: bigint, reason: string) => {
    writeContract({
      address: contractAddress,
      abi: SupplyChainABI,
      functionName: 'recallBatch',
      args: [batchId, reason],
    });
  };

  return {
    recallBatch,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}

// Hook: Assign role
export function useAssignRole() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const assignRole = (role: `0x${string}`, account: `0x${string}`) => {
    writeContract({
      address: contractAddress,
      abi: SupplyChainABI,
      functionName: 'assignRole',
      args: [role, account],
    });
  };

  return {
    assignRole,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}

// Hook: Remove role
export function useRemoveRole() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const removeRole = (role: `0x${string}`, account: `0x${string}`) => {
    writeContract({
      address: contractAddress,
      abi: SupplyChainABI,
      functionName: 'removeRole',
      args: [role, account],
    });
  };

  return {
    removeRole,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}
