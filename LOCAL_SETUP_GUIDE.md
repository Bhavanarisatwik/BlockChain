# 🚀 Local Development Setup Guide

This guide is for setting up the Supply Chain DApp on your local machine. You do **NOT** need any real Ethereum or API keys for this.

## 1. Prerequisites

Make sure you have these installed:
- **Node.js** (v18 or higher)
- **Git**
- **MetaMask** (Browser Extension)

## 2. Install Project

Open your terminal (Command Prompt or PowerShell) and run:

```bash
# 1. Clone the repo
git clone <repository-url>
cd BlockChain

# 2. Install root dependencies
npm install

# 3. Install frontend dependencies
cd frontend
npm install
cd ..
```

## 3. Configure Environment

You need to create the environment files.

**Root Folder:**
```bash
# Copy example file
cp .env.example .env
```
*You don't need to edit `.env` for local testing.*

**Frontend Folder:**
```bash
cd frontend
# Create .env.local
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=" > .env.local
cd ..
```

## 4. Start the Local Blockchain

You need **3 separate terminals** for this project.

**Terminal 1: The Blockchain Node**
```bash
npx hardhat node
```
*🛑 DO NOT CLOSE THIS TERMINAL.*
It will show a list of 20 accounts with private keys. Scroll to the top and find **Account #0**.

## 5. Deploy Smart Contract

**Terminal 2: Deployment**
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

**Copy the Contract Address** from the output (e.g., `0x5FbDB...`) and update your `frontend/.env.local` file:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```
*(Replace with your actual address if different)*

## 6. Configure MetaMask (Crucial Step!)

You need to connect MetaMask to your local blockchain.

1.  **Open MetaMask** -> Click the Network dropdown (top-left).
2.  **Add Network** -> **Add a network manually**.
    - **Network Name:** `Localhost 8545`
    - **RPC URL:** `http://127.0.0.1:8545`
    - **Chain ID:** `31337`
    - **Currency Symbol:** `ETH`
3.  **Save** and switch to this network.

### Import Test Account
You need money to test! Import a "Hardhat Account".

1.  Go to **Terminal 1** (where `npx hardhat node` is running).
2.  Copy the **Private Key** for **Account #0**.
    - It looks like: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
3.  In MetaMask: Click the Circle Icon (top-right) -> **Import Account**.
4.  Paste the private key and click **Import**.
    - You should now see **10,000 ETH**.

## 7. Start the Frontend

**Terminal 3: The Website**
```bash
cd frontend
npm run dev
```

Open `http://localhost:3000` in your browser.
Connect your MetaMask (Account #0). You should have **Admin Access**.

---

## ⚠️ Troubleshooting

### "Nonce too high" Error in MetaMask
This happens when you restart the blockchain node. MetaMask gets confused about the transaction count.
**Fix:**
1.  Open MetaMask.
2.  Go to **Settings** -> **Advanced**.
3.  Click **Clear activity tab data**.

### "Access Denied" on Admin Page
1.  Make sure you are connected with **Account #0** (the deployer).
2.  Make sure `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local` matches the address in **Terminal 2**.
3.  If you redeployed, **Restart the Frontend** (Ctrl+C and `npm run dev` again).
