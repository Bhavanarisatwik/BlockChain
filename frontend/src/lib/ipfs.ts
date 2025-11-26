const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
const NFT_STORAGE_API = 'https://api.nft.storage';

// Check if we're in development mode without API key
const isDevelopment = process.env.NODE_ENV === 'development';

export interface IPFSUploadResult {
  cid: string;
  url: string;
  ipfsUrl: string;
}

export interface ProductMetadata {
  name: string;
  description: string;
  manufacturer: string;
  certificates?: string[];
  manufactureDate?: string;
  extra?: Record<string, unknown>;
}

export interface BatchMetadata {
  name: string;
  description: string;
  productId: number;
  quantity: number;
  manufactureDate: string;
  origin?: string;
  certificates?: string[];
  extra?: Record<string, unknown>;
}

/**
 * Generate a mock CID for development
 */
function generateMockCID(data: string): string {
  // Create a simple hash-like string for development
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const mockHash = Math.abs(hash).toString(16).padStart(8, '0');
  return `Qm${mockHash}${Date.now().toString(16)}MockCID`;
}

/**
 * Upload a file to IPFS via NFT.Storage
 */
export async function uploadToIPFS(file: File): Promise<IPFSUploadResult> {
  const apiKey = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY;
  
  // Development fallback - generate mock CID
  if (!apiKey && isDevelopment) {
    console.warn('⚠️ IPFS: Using mock CID (no API key configured)');
    const mockCID = generateMockCID(file.name + file.size);
    return {
      cid: mockCID,
      url: `${IPFS_GATEWAY}${mockCID}`,
      ipfsUrl: `ipfs://${mockCID}`,
    };
  }

  if (!apiKey) {
    throw new Error('NFT.Storage API key not configured');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${NFT_STORAGE_API}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  const cid = data.value.cid;

  return {
    cid,
    url: `${IPFS_GATEWAY}${cid}`,
    ipfsUrl: `ipfs://${cid}`,
  };
}

/**
 * Upload JSON metadata to IPFS
 */
export async function uploadJSONToIPFS(
  metadata: ProductMetadata | BatchMetadata | Record<string, unknown>
): Promise<IPFSUploadResult> {
  const apiKey = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY;
  
  // Development fallback - generate mock CID
  if (!apiKey && isDevelopment) {
    console.warn('⚠️ IPFS: Using mock CID (no API key configured)');
    const mockCID = generateMockCID(JSON.stringify(metadata));
    // Store in localStorage for development retrieval
    if (typeof window !== 'undefined') {
      localStorage.setItem(`ipfs:${mockCID}`, JSON.stringify(metadata));
    }
    return {
      cid: mockCID,
      url: `${IPFS_GATEWAY}${mockCID}`,
      ipfsUrl: `ipfs://${mockCID}`,
    };
  }

  if (!apiKey) {
    throw new Error('NFT.Storage API key not configured');
  }

  const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });

  const response = await fetch(`${NFT_STORAGE_API}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: blob,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  const cid = data.value.cid;

  return {
    cid,
    url: `${IPFS_GATEWAY}${cid}`,
    ipfsUrl: `ipfs://${cid}`,
  };
}

/**
 * Fetch content from IPFS
 */
export async function fetchFromIPFS<T>(cidOrUrl: string): Promise<T> {
  let url = cidOrUrl;
  
  if (cidOrUrl.startsWith('ipfs://')) {
    url = `${IPFS_GATEWAY}${cidOrUrl.replace('ipfs://', '')}`;
  } else if (!cidOrUrl.startsWith('http')) {
    url = `${IPFS_GATEWAY}${cidOrUrl}`;
  }

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Convert IPFS URL to HTTP gateway URL
 */
export function ipfsToHttp(ipfsUrl: string): string {
  if (ipfsUrl.startsWith('ipfs://')) {
    return `${IPFS_GATEWAY}${ipfsUrl.replace('ipfs://', '')}`;
  }
  if (!ipfsUrl.startsWith('http')) {
    return `${IPFS_GATEWAY}${ipfsUrl}`;
  }
  return ipfsUrl;
}

/**
 * Check if a string is a valid CID
 */
export function isValidCID(str: string): boolean {
  // Basic CID validation - starts with Qm (CIDv0) or ba (CIDv1)
  return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|ba[a-z2-7]{57})$/.test(str);
}
