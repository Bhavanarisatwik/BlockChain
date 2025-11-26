import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format a Unix timestamp to a readable date string
 */
export function formatDate(timestamp: number | bigint): string {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  return format(new Date(ts * 1000), 'PPP');
}

/**
 * Format a Unix timestamp to a readable date and time string
 */
export function formatDateTime(timestamp: number | bigint): string {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  return format(new Date(ts * 1000), 'PPpp');
}

/**
 * Format a Unix timestamp to relative time
 */
export function formatRelativeTime(timestamp: number | bigint): string {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  return formatDistanceToNow(new Date(ts * 1000), { addSuffix: true });
}

/**
 * Truncate an Ethereum address
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format a large number with commas
 */
export function formatNumber(num: number | bigint): string {
  return Number(num).toLocaleString();
}

/**
 * Generate a unique ID for batches/products
 */
export function generateId(): number {
  return Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Get role name from role hash
 */
export function getRoleName(roleHash: string): string {
  const roles: Record<string, string> = {
    '0x0000000000000000000000000000000000000000000000000000000000000000': 'Admin',
  };
  
  // Check if it's a known role or derive from hash
  if (roles[roleHash]) return roles[roleHash];
  
  // Common role identifiers
  if (roleHash.toLowerCase().includes('manufacturer')) return 'Manufacturer';
  if (roleHash.toLowerCase().includes('logistics')) return 'Logistics';
  if (roleHash.toLowerCase().includes('retailer')) return 'Retailer';
  if (roleHash.toLowerCase().includes('auditor')) return 'Auditor';
  
  return 'Unknown Role';
}

/**
 * Get status badge class based on batch status
 */
export function getStatusBadgeClass(recalled: boolean): string {
  return recalled ? 'badge-error' : 'badge-success';
}

/**
 * Get status text
 */
export function getStatusText(recalled: boolean): string {
  return recalled ? 'Recalled' : 'Active';
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Convert IPFS URI to HTTP gateway URL
 */
export function ipfsToHttp(uri: string): string {
  if (!uri) return '';
  
  // Handle ipfs:// protocol
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', 'https://nftstorage.link/ipfs/');
  }
  
  // Handle /ipfs/ paths
  if (uri.startsWith('/ipfs/')) {
    return `https://nftstorage.link${uri}`;
  }
  
  // Handle CID directly
  if (uri.startsWith('Qm') || uri.startsWith('bafy')) {
    return `https://nftstorage.link/ipfs/${uri}`;
  }
  
  // Return as-is if already HTTP(S)
  return uri;
}

/**
 * Parse metadata from IPFS
 */
export async function fetchIPFSMetadata(uri: string): Promise<Record<string, unknown> | null> {
  try {
    const httpUrl = ipfsToHttp(uri);
    const response = await fetch(httpUrl);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
