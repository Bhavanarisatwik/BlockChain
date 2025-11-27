# Vercel Deployment Guide - Supply Chain DApp

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step-by-Step Deployment](#step-by-step-deployment)
3. [Environment Configuration](#environment-configuration)
4. [Blockchain Configuration](#blockchain-configuration)
5. [Troubleshooting](#troubleshooting)
6. [Post-Deployment](#post-deployment)

---

## Prerequisites

Before deploying to Vercel, you need:

### 1. GitHub Repository
Your project must be pushed to GitHub (we already did this!)

```bash
# Verify Git is set up
cd c:\Users\satwi\Downloads\BlockChain
git log --oneline
# Should show: a00954f Initial commit - BlockChain DApp
```

### 2. Vercel Account
- Go to https://vercel.com
- Sign up with GitHub account
- Authorize Vercel to access your repositories

### 3. Required Services
- ✅ GitHub account (for repo)
- ✅ Vercel account (for hosting)
- ✅ MetaMask (wallet)
- ✅ RPC endpoints (for blockchain access)
- ✅ NFT.Storage API key (for IPFS)
- ✅ Sepolia testnet ETH (for transactions)

---

## Step-by-Step Deployment

### STEP 1: Push Your Project to GitHub

```bash
# Navigate to project
cd c:\Users\satwi\Downloads\BlockChain

# Check status
git status
# Should show: "working tree clean"

# If there are uncommitted changes
git add .
git commit -m "Prepare for Vercel deployment"

# View commits
git log --oneline
```

If you haven't connected to GitHub remote yet:

```bash
# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/BlockChain.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### STEP 2: Deploy Frontend to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to frontend directory
cd c:\Users\satwi\Downloads\BlockChain\frontend

# Deploy
vercel

# You'll be prompted:
# ✓ Set up and deploy? (Y/n)
# → Yes
#
# ✓ Which scope? 
# → Select your Vercel account
#
# ✓ Link to existing project? (y/N)
# → No (first deployment)
#
# ✓ Project name?
# → supply-chain-dapp (or your choice)
#
# ✓ Which directory to output?
# → .next (press Enter)
#
# ✓ Deployment succeeds!
```

#### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import from Git → Connect GitHub
4. Select your `BlockChain` repository
5. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - Click "Deploy"

### STEP 3: Configure Environment Variables

After deployment starts, go to **Project Settings → Environment Variables** and add:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://gas.api.infura.io/v3/0e6b62eb04f94e76b8f952550d73c2fc
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=5a618e819eec4b9343c215f39dfe4fd7
NEXT_PUBLIC_NFT_STORAGE_KEY=9dd8d07e.fba437665d6d45388918f708e7b58bc9
```


**Where to get these values:**

#### RPC URL (Infura)
```
1. Go to https://infura.io
2. Sign up / Log in
3. Create new project
4. Select Sepolia network
5. Copy API URL: https://sepolia.infura.io/v3/YOUR_KEY
```

#### WalletConnect Project ID
```
1. Go to https://cloud.walletconnect.com
2. Create new project
3. Copy Project ID
4. Use it in environment variables
```

#### NFT.Storage API Key
```
1. Go to https://nft.storage
2. Sign in with GitHub
3. Create API key
4. Use it in environment variables
```

---

## Environment Configuration

### Update Frontend Config for Production

#### 1. Update Wagmi Config for Sepolia

**File:** `frontend/src/lib/wagmi.ts`

```typescript
import { getDefaultConfig } from '@rainbow-me/rainbow-kit';
import { mainnet, sepolia, polygon, optimism } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'Supply Chain DApp',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [sepolia, polygon, optimism, mainnet], // Production chains
    ssr: true,
});
```

#### 2. Update Contract Address Config

**File:** `frontend/.env.local` → `frontend/.env.production`

Create new file: `frontend/.env.production`

```env
# Production Environment Variables

# Sepolia Testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_CHAIN_ID=11155111

# RPC Endpoint (Infura Sepolia)
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Web3Modal / WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# IPFS Storage
NEXT_PUBLIC_NFT_STORAGE_KEY=your_nft_storage_api_key
```

#### 3. Deploy Smart Contract to Sepolia (Recommended)

If not done already, deploy contract to Sepolia:

```bash
# In project root
cd c:\Users\satwi\Downloads\BlockChain

# Set up Sepolia in hardhat.config.ts
# See instructions below

# Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia

# Get contract address and update:
# NEXT_PUBLIC_CONTRACT_ADDRESS
```

**Update hardhat.config.ts for Sepolia:**

```typescript
// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
    solidity: "0.8.20",
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545",
        },
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || "",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        },
    },
};

export default config;
```

**Create `.env` for deployment:**

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
```

---

## Blockchain Configuration

### Option 1: Use Testnet (Sepolia) - Recommended for Testing

#### Deploy Contract to Sepolia

```bash
# 1. Get Sepolia RPC from Infura
# https://infura.io → Create project → Select Sepolia

# 2. Get testnet ETH (free from faucet)
# https://sepolia-faucet.pk910.de/ → Enter your address

# 3. Export private key from MetaMask
# MetaMask → Account details → Export private key

# 4. Create .env
echo "SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY" >> .env
echo "PRIVATE_KEY=your_private_key" >> .env

# 5. Deploy
npx hardhat run scripts/deploy.ts --network sepolia

# 6. Update contract address in frontend environment
```

### Option 2: Use Public RPC for Read-Only Access

If you only want to read data from existing contract (no deployments):

```env
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

### Option 3: Use Alchemy Instead of Infura

Alternative RPC provider:

```bash
# 1. Go to https://alchemy.com
# 2. Sign up → Create app → Select Sepolia
# 3. Copy API key
# 4. Use in environment: https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
```

---

## Vercel Deployment Commands

### Deploy with Custom Build

**File:** `vercel.json` (create in root)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "frontend/.next",
  "env": {
    "NEXT_PUBLIC_CONTRACT_ADDRESS": "@next_public_contract_address",
    "NEXT_PUBLIC_CHAIN_ID": "@next_public_chain_id",
    "NEXT_PUBLIC_RPC_URL": "@next_public_rpc_url",
    "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID": "@next_public_walletconnect_project_id",
    "NEXT_PUBLIC_NFT_STORAGE_KEY": "@next_public_nft_storage_key"
  }
}
```

### Deploy Frontend Only

```bash
# Navigate to frontend
cd frontend

# Deploy directly
vercel --prod

# Or via CLI with environment
vercel --prod --env NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2...
```

---

## Environment Variables Complete Reference

### Vercel Dashboard Setup

Go to: **Project Settings → Environment Variables**

Add each variable:

| Variable | Value | Example |
|----------|-------|---------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Sepolia contract address | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| `NEXT_PUBLIC_CHAIN_ID` | Sepolia chain ID | `11155111` |
| `NEXT_PUBLIC_RPC_URL` | Infura/Alchemy Sepolia RPC | `https://sepolia.infura.io/v3/YOUR_KEY` |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | `abc123def456...` |
| `NEXT_PUBLIC_NFT_STORAGE_KEY` | NFT.Storage API key | `eyJhbGc...` |

### Set for Environments

- **Environment:** Production
- **Targets:** Vercel Production

---

## Verification Checklist

After deployment, verify:

```bash
# 1. Check Vercel deployment
curl https://your-project.vercel.app/
# Should return HTML

# 2. Check if frontend loads
# Open: https://your-project.vercel.app in browser
# Should show: Supply Chain DApp

# 3. Check MetaMask connection
# Click Connect Wallet
# Should show MetaMask popup

# 4. Verify contract connection
# Go to Admin page
# Should show admin status or request connection

# 5. Check network
# MetaMask should show: Sepolia (or your testnet)
```

---

## Troubleshooting

### Issue 1: "Contract Address Not Found"

**Problem:** App shows error about contract address

**Solution:**
```
1. Check NEXT_PUBLIC_CONTRACT_ADDRESS is set in Vercel
2. Make sure it's the Sepolia address, not localhost
3. Verify address format: 0x... (42 characters)
4. Redeploy after changing env variables
```

### Issue 2: "Cannot Read from RPC"

**Problem:** App can't connect to blockchain

**Solution:**
```
1. Verify NEXT_PUBLIC_RPC_URL is correct
2. Check Infura project is active
3. Verify Infura is set to Sepolia network
4. Test RPC manually: 
   curl -X POST NEXT_PUBLIC_RPC_URL \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
5. Should return: "result":"0xaa36a7" (Sepolia)
```

### Issue 3: "MetaMask Not Connecting"

**Problem:** WalletConnect not working

**Solution:**
```
1. Verify NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is set
2. Check project is active on https://cloud.walletconnect.com
3. Make sure domain is added to whitelist:
   - Go to Cloud → Project Settings
   - Add: your-project.vercel.app
4. Clear browser cache and localStorage
5. Try different browser
```

### Issue 4: "Build Fails on Vercel"

**Problem:** Deployment fails with error

**Solution:**
```
1. Check build logs in Vercel dashboard
2. Common issues:
   a) TypeScript errors → npm run build locally to test
   b) Missing env variables → Add to Vercel
   c) Dependencies not installed → Check package.json
3. Run locally: npm run build
4. Fix any errors
5. Push to GitHub
6. Vercel redeploys automatically
```

### Issue 5: "CORS Errors"

**Problem:** Browser console shows CORS errors

**Solution:**
```
1. Verify RPC provider supports CORS
2. Infura: Generally supports CORS
3. Alchemy: Add domain to whitelist
4. Use CORS proxy if needed:
   NEXT_PUBLIC_RPC_URL=https://cors-anywhere.herokuapp.com/YOUR_RPC
5. Or deploy your own RPC relay
```

---

## Post-Deployment

### 1. Domain Configuration

Connect custom domain:

```
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Domains
4. Add your domain: supply-chain.com
5. Follow DNS setup instructions
```

### 2. Analytics & Monitoring

```
1. Go to Analytics tab
2. Monitor:
   - Page views
   - Error rates
   - Performance metrics
3. Set up notifications for errors
```

### 3. Continuous Deployment

Every time you push to GitHub:

```bash
git add .
git commit -m "Update: feature"
git push origin main
# Vercel automatically deploys!
```

### 4. Environment Updates

To update environment variables:

```
1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Edit variables
4. Redeploy (or wait for next push)
```

### 5. Smart Contract Updates

If you update the contract:

```bash
# 1. Update contract code
# contracts/SupplyChain.sol

# 2. Compile
npx hardhat compile

# 3. Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia

# 4. Get new address
# 0xNEW_ADDRESS_HERE

# 5. Update Vercel environment
# NEXT_PUBLIC_CONTRACT_ADDRESS=0xNEW_ADDRESS_HERE

# 6. Redeploy frontend
vercel --prod
```

---

## Complete Deployment Checklist

```
PRE-DEPLOYMENT:
☐ Code pushed to GitHub
☐ All tests passing locally (npm run build)
☐ No TypeScript errors
☐ .env variables configured locally

VERCEL SETUP:
☐ Vercel account created
☐ Project imported from GitHub
☐ Framework set to Next.js
☐ Root directory: frontend

ENVIRONMENT VARIABLES:
☐ NEXT_PUBLIC_CONTRACT_ADDRESS added
☐ NEXT_PUBLIC_CHAIN_ID added
☐ NEXT_PUBLIC_RPC_URL added
☐ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID added
☐ NEXT_PUBLIC_NFT_STORAGE_KEY added

BLOCKCHAIN SETUP:
☐ Contract deployed to Sepolia
☐ Infura account created & key obtained
☐ WalletConnect project ID created
☐ NFT.Storage API key created

POST-DEPLOYMENT:
☐ App loads at vercel.app URL
☐ MetaMask connects
☐ Admin page shows status
☐ Can read contract data
☐ Transaction functions work
☐ IPFS upload works
```

---

## Summary

Your deployment is complete when:

✅ Frontend deployed to Vercel  
✅ All environment variables configured  
✅ Smart contract on Sepolia testnet  
✅ MetaMask connects successfully  
✅ Contract functions accessible  
✅ IPFS storage working  
✅ Admin panel functional  

**Your live app will be at:** `https://your-project.vercel.app`

---

## Quick Reference Commands

```bash
# Deploy new version
vercel --prod

# Check deployment status
vercel logs

# Rollback to previous version
vercel rollback

# Delete deployment
vercel rm

# List all deployments
vercel ls

# Set environment variable
vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS

# View environment variables
vercel env ls
```

---

**Questions?** Check the troubleshooting section or test locally first:
```bash
cd frontend
npm run dev
# Test at http://localhost:3001
```
