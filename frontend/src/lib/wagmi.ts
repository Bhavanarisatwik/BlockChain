'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, mainnet, polygon, optimism } from 'wagmi/chains';

import { http } from 'wagmi';

// Use wagmi's built-in hardhat chain
export const config = getDefaultConfig({
  appName: 'SupplyChain Provenance',
  projectId: "5a618e819eec4b9343c215f39dfe4fd7",
  chains: [sepolia, mainnet, polygon, optimism],
  transports: {
    [sepolia.id]: http("https://1rpc.io/sepolia"),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
  },
  ssr: true,
});

export const SUPPORTED_CHAINS = {
  sepolia: {
    id: 11155111,
    name: 'Sepolia',
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.org',
    blockExplorer: 'https://sepolia.etherscan.io',
  },
  localhost: {
    id: 31337,
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: '',
  },
};

export const getBlockExplorerUrl = (chainId: number, txHash: string) => {
  switch (chainId) {
    case 11155111:
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    case 1:
      return `https://etherscan.io/tx/${txHash}`;
    case 137:
      return `https://polygonscan.com/tx/${txHash}`;
    case 10:
      return `https://optimistic.etherscan.io/tx/${txHash}`;
    default:
      return '';
  }
};

export const getBlockExplorerAddressUrl = (chainId: number, address: string) => {
  switch (chainId) {
    case 11155111:
      return `https://sepolia.etherscan.io/address/${address}`;
    case 1:
      return `https://etherscan.io/address/${address}`;
    case 137:
      return `https://polygonscan.com/address/${address}`;
    case 10:
      return `https://optimistic.etherscan.io/address/${address}`;
    default:
      return '';
  }
};
