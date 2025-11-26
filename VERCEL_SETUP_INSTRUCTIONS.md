# Vercel Deployment - Complete Setup Instructions

## Current Status

Your GitHub repository is fully set up and pushed with all the latest code including:
- ✅ Supply Chain DApp smart contract code
- ✅ Next.js frontend with Tailwind CSS
- ✅ All dependencies configured
- ✅ Production environment config
- ✅ Webpack configuration for Next.js 16

**GitHub Repository:** https://github.com/Bhavanarisatwik/BlockChain

## Next Steps: Deploy via Vercel Dashboard

### Step 1: Go to Vercel Dashboard

1. Visit https://vercel.com/dashboard
2. Look for your project named "frontend" or "block-chain"

### Step 2: Create New Project (if needed)

If you don't see your project:

1. Click **"Add New..."** → **"Project"**
2. Click **"Import Git Repository"**
3. Search for and select **"BlockChain"** repository
4. Click **"Import"**

### Step 3: Configure Project Settings

After importing, Vercel will show **Project Settings**:

#### Framework & Build
- **Framework Preset:** Next.js (auto-detected)
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

#### Root Directory
- **Root Directory:** `frontend`

Click **"Deploy"** to start the initial build.

### Step 4: Add Environment Variables

Once the project is created:

1. Go to **Settings** → **Environment Variables**
2. Click **"Add Environment Variable"**

Add these variables:

```
Name: NEXT_PUBLIC_CONTRACT_ADDRESS
Value: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Environment: Production, Preview, Development
```

```
Name: NEXT_PUBLIC_CHAIN_ID
Value: 11155111
Environment: Production, Preview, Development
```

```
Name: NEXT_PUBLIC_RPC_URL
Value: https://ethereum-sepolia-rpc.publicnode.com
Environment: Production, Preview, Development
```

```
Name: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
Value: 5a618e819eec4b9343c215f39dfe4fd7
Environment: Production, Preview, Development
```

```
Name: NEXT_PUBLIC_NFT_STORAGE_API_KEY
Value: 9dd8d07e.fba437665d6d45388918f708e7b58bc9
Environment: Production, Preview, Development
```

**Click "Save"** after adding each variable.

### Step 5: Trigger Redeployment

After adding environment variables:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **"..." menu** → **"Redeploy"**
4. Click **"Redeploy"**

Vercel will rebuild with the new environment variables.

### Step 6: Monitor Deployment

1. Watch the build progress
2. If build fails, check the build logs for errors
3. Once successful, you'll get a production URL

### Step 7: Test Your Deployment

Once deployed:

1. Open the Vercel-provided URL
2. Connect MetaMask wallet
3. Switch network to **Sepolia Testnet**
4. Test the app features:
   - Create a product
   - Create a batch
   - Transfer ownership
   - Verify product history

---

## Troubleshooting

### Build Fails with "thread-stream" Error

**Solution:** The `next.config.ts` is already configured to handle this. If it persists:
1. Go to **Settings** → **Build & Development Settings**
2. Add to **Build Environment Variables**:
   ```
   NODE_OPTIONS=--openssl-legacy-provider
   ```

### "Cannot find module" Errors

**Solution:** Clear Vercel cache and redeploy:
1. Go to **Settings** → **General**
2. Scroll down and click **"Clear Build Cache"**
3. Go to **Deployments** and redeploy

### Website Loads but Features Don't Work

**Solution:** Check environment variables
1. Open browser DevTools (F12)
2. Check Console for errors
3. Go to Vercel **Settings** → **Environment Variables**
4. Verify all variables are set correctly
5. Redeploy if needed

### MetaMask Connection Issues

**Solution:** Verify WalletConnect ID
1. Go to https://cloud.walletconnect.com
2. Verify your Project ID matches `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
3. If mismatch, update in Vercel environment variables
4. Redeploy

---

## Testing Checklist After Deployment

- [ ] App loads and displays correctly
- [ ] MetaMask connects successfully
- [ ] Can switch to Sepolia testnet
- [ ] Admin panel accessible
- [ ] Can create new products
- [ ] Can create new batches
- [ ] Can view product details
- [ ] Can transfer batch ownership
- [ ] Can verify product history

---

## Production Blockchain Configuration

### Current Setup
- **Network:** Sepolia Testnet (Chain ID: 11155111)
- **RPC URL:** https://ethereum-sepolia-rpc.publicnode.com
- **Smart Contract:** Already deployed at `0x5FbDB2315678afecb367f032d93F642f64180aa3`

### To Deploy to Mainnet (Future)

1. Get Mainnet Infura RPC key from https://infura.io
2. Deploy smart contract to mainnet:
   ```bash
   npx hardhat run scripts/deploy.ts --network mainnet
   ```
3. Update `NEXT_PUBLIC_CONTRACT_ADDRESS` in Vercel environment variables
4. Update `NEXT_PUBLIC_CHAIN_ID` to `1`
5. Redeploy on Vercel

---

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Smart Contract Address:** https://sepolia.etherscan.io/address/0x5FbDB2315678afecb367f032d93F642f64180aa3
- **GitHub Repo:** https://github.com/Bhavanarisatwik/BlockChain

---

**Your DApp is ready to deploy! Follow the steps above and you'll have a live supply chain application within minutes.**
