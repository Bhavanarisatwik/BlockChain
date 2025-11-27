'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  Plus,
  Trash2,
  Pause,
  Play,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { SupplyChainABI, CONTRACT_ADDRESS, ROLES } from '@/lib/contracts/SupplyChainABI';
import { truncateAddress, isValidAddress } from '@/lib/utils';
import toast from 'react-hot-toast';

type RoleKey = keyof typeof ROLES;

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [selectedRole, setSelectedRole] = useState<RoleKey>('MANUFACTURER_ROLE');
  const [targetAddress, setTargetAddress] = useState('');
  const [activeTab, setActiveTab] = useState<'roles' | 'contract'>('roles');

  // Contract read operations
  const { data: isAdmin, isLoading: isAdminLoading, error: adminError, refetch: checkAdmin } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SupplyChainABI,
    functionName: 'hasRole',
    args: [ROLES.DEFAULT_ADMIN_ROLE, address as `0x${string}`],
    chainId: 11155111,
    query: { enabled: !!address && !!CONTRACT_ADDRESS }
  });

  // Debug logging
  console.log('Admin Page Debug:', {
    connectedAddress: address,
    contractAddress: CONTRACT_ADDRESS,
    isAdmin,
    isAdminLoading,
    adminError,
    expectedAdminRole: ROLES.DEFAULT_ADMIN_ROLE
  });

  const { data: isPaused } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SupplyChainABI,
    functionName: 'paused',
  });

  // Write operations
  const { writeContract: assignRole, data: assignHash, isPending: isAssigning, error: assignError } = useWriteContract();
  const { writeContract: removeRole, data: removeHash, isPending: isRemoving, error: removeError } = useWriteContract();
  const { writeContract: pauseContract, data: pauseHash, isPending: isPausing, error: pauseError } = useWriteContract();
  const { writeContract: unpauseContract, data: unpauseHash, isPending: isUnpausing, error: unpauseError } = useWriteContract();

  // Transaction receipts
  const { isLoading: isAssignConfirming, isSuccess: isAssignSuccess } = useWaitForTransactionReceipt({ hash: assignHash });
  const { isLoading: isRemoveConfirming, isSuccess: isRemoveSuccess } = useWaitForTransactionReceipt({ hash: removeHash });
  const { isLoading: isPauseConfirming, isSuccess: isPauseSuccess } = useWaitForTransactionReceipt({ hash: pauseHash });
  const { isLoading: isUnpauseConfirming, isSuccess: isUnpauseSuccess } = useWaitForTransactionReceipt({ hash: unpauseHash });

  // Handle errors
  useEffect(() => {
    if (assignError) {
      console.error('Assign role error:', assignError);
      toast.error(`Failed to assign role: ${assignError.message}`);
    }
  }, [assignError]);

  useEffect(() => {
    if (removeError) {
      console.error('Remove role error:', removeError);
      toast.error(`Failed to remove role: ${removeError.message}`);
    }
  }, [removeError]);

  useEffect(() => {
    if (pauseError) {
      console.error('Pause error:', pauseError);
      toast.error(`Failed to pause: ${pauseError.message}`);
    }
  }, [pauseError]);

  useEffect(() => {
    if (unpauseError) {
      console.error('Unpause error:', unpauseError);
      toast.error(`Failed to unpause: ${unpauseError.message}`);
    }
  }, [unpauseError]);

  // Handle success
  useEffect(() => {
    if (isAssignSuccess) {
      toast.success('Role assigned successfully!');
      setTargetAddress('');
    }
  }, [isAssignSuccess]);

  useEffect(() => {
    if (isRemoveSuccess) {
      toast.success('Role removed successfully!');
      setTargetAddress('');
    }
  }, [isRemoveSuccess]);

  const handleAssignRole = async () => {
    if (!isValidAddress(targetAddress)) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }

    try {
      console.log('Assigning role:', {
        role: selectedRole,
        roleHash: ROLES[selectedRole],
        targetAddress,
        contractAddress: CONTRACT_ADDRESS,
      });

      assignRole({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: SupplyChainABI,
        functionName: 'assignRole',
        args: [ROLES[selectedRole], targetAddress as `0x${string}`],
      });
      toast.success('Role assignment transaction submitted - check your wallet');
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast.error(error?.message || 'Failed to assign role');
    }
  };

  const handleRemoveRole = async () => {
    if (!isValidAddress(targetAddress)) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }

    try {
      console.log('Removing role:', {
        role: selectedRole,
        roleHash: ROLES[selectedRole],
        targetAddress,
        contractAddress: CONTRACT_ADDRESS,
      });

      removeRole({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: SupplyChainABI,
        functionName: 'removeRole',
        args: [ROLES[selectedRole], targetAddress as `0x${string}`],
      });
      toast.success('Role removal transaction submitted - check your wallet');
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast.error(error?.message || 'Failed to remove role');
    }
  };

  const handlePause = async () => {
    try {
      pauseContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: SupplyChainABI,
        functionName: 'pause',
      });
      toast.success('Pause transaction submitted');
    } catch (error) {
      console.error('Error pausing:', error);
      toast.error('Failed to pause contract');
    }
  };

  const handleUnpause = async () => {
    try {
      unpauseContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: SupplyChainABI,
        functionName: 'unpause',
      });
      toast.success('Unpause transaction submitted');
    } catch (error) {
      console.error('Error unpausing:', error);
      toast.error('Failed to unpause contract');
    }
  };

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    toast.success('Address copied to clipboard');
  };

  const roleOptions: { key: RoleKey; label: string; description: string }[] = [
    { key: 'MANUFACTURER_ROLE', label: 'Manufacturer', description: 'Can create products and batches' },
    { key: 'LOGISTICS_ROLE', label: 'Logistics', description: 'Can transfer batches and record sensor data' },
    { key: 'RETAILER_ROLE', label: 'Retailer', description: 'Can receive batches and sell to consumers' },
    { key: 'AUDITOR_ROLE', label: 'Auditor', description: 'Can attach documents and recall batches' },
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-16">
            <Shield className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
            <p className="text-gray-400">Please connect your wallet to access admin functions</p>
          </div>
        </div>
      </div>
    );
  }

  if (isAdminLoading) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-16">
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
            <h2 className="text-2xl font-bold mb-2">Checking Access</h2>
            <p className="text-gray-400">Verifying admin privileges...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-16">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-400">You do not have admin privileges for this contract</p>
            <p className="text-sm text-gray-500 mt-2">
              Connected: {truncateAddress(address || '')}
            </p>
            <button
              onClick={() => checkAdmin()}
              className="mt-4 px-4 py-2 bg-dark-lighter hover:bg-dark-light rounded-lg text-sm transition-colors"
            >
              Retry Check
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Admin Panel
          </h1>
          <p className="text-gray-400">Manage roles and contract settings</p>
        </motion.div>

        {/* Contract Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Contract Status</h3>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Address:</span>
                <code className="text-xs bg-dark-lighter px-2 py-1 rounded">
                  {truncateAddress(CONTRACT_ADDRESS)}
                </code>
                <button
                  onClick={() => copyAddress(CONTRACT_ADDRESS)}
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <a
                  href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isPaused ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                }`}>
                {isPaused ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Paused</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Active</span>
                  </>
                )}
              </div>
              {isPaused ? (
                <button
                  onClick={handleUnpause}
                  disabled={isUnpausing || isUnpauseConfirming}
                  className="btn-primary flex items-center gap-2"
                >
                  {(isUnpausing || isUnpauseConfirming) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Unpause
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  disabled={isPausing || isPauseConfirming}
                  className="btn-secondary flex items-center gap-2 !border-red-500 !text-red-400 hover:!bg-red-500/20"
                >
                  {(isPausing || isPauseConfirming) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Pause className="w-4 h-4" />
                  )}
                  Pause
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'roles'
              ? 'bg-primary text-white'
              : 'bg-dark-lighter text-gray-400 hover:text-white'
              }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Role Management
          </button>
          <button
            onClick={() => setActiveTab('contract')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'contract'
              ? 'bg-primary text-white'
              : 'bg-dark-lighter text-gray-400 hover:text-white'
              }`}
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Contract Info
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'roles' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Role Selection */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Select Role
              </h3>
              <div className="space-y-3">
                {roleOptions.map((role) => (
                  <button
                    key={role.key}
                    onClick={() => setSelectedRole(role.key)}
                    className={`w-full p-4 rounded-lg text-left transition-all ${selectedRole === role.key
                      ? 'bg-primary/20 border border-primary'
                      : 'bg-dark-lighter border border-transparent hover:border-gray-700'
                      }`}
                  >
                    <div className="font-medium">{role.label}</div>
                    <div className="text-sm text-gray-400">{role.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Role Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Manage Role
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Address
                  </label>
                  <input
                    type="text"
                    value={targetAddress}
                    onChange={(e) => setTargetAddress(e.target.value)}
                    placeholder="0x..."
                    className="input w-full"
                  />
                </div>

                <div className="p-4 bg-dark-lighter rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Selected Role</div>
                  <div className="font-semibold text-primary">
                    {roleOptions.find(r => r.key === selectedRole)?.label}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAssignRole}
                    disabled={!targetAddress || isAssigning || isAssignConfirming}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {(isAssigning || isAssignConfirming) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Assign Role
                  </button>
                  <button
                    onClick={handleRemoveRole}
                    disabled={!targetAddress || isRemoving || isRemoveConfirming}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2 !border-red-500 !text-red-400 hover:!bg-red-500/20"
                  >
                    {(isRemoving || isRemoveConfirming) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Remove Role
                  </button>
                </div>

                {(isAssignSuccess || isRemoveSuccess || isPauseSuccess || isUnpauseSuccess) && (
                  <div className="flex items-center gap-2 text-green-400 bg-green-500/20 p-3 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span>Transaction confirmed successfully!</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'contract' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Contract Information
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-dark-lighter rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Contract Address</div>
                <div className="font-mono text-sm break-all">{CONTRACT_ADDRESS}</div>
              </div>

              <div className="p-4 bg-dark-lighter rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Admin Address</div>
                <div className="font-mono text-sm break-all">{address}</div>
              </div>

              <div className="p-4 bg-dark-lighter rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Network</div>
                <div>Sepolia Testnet / Hardhat Local</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-dark-lighter rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Contract Status</div>
                  <div className={isPaused ? 'text-red-400' : 'text-green-400'}>
                    {isPaused ? 'Paused' : 'Active'}
                  </div>
                </div>
                <div className="p-4 bg-dark-lighter rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Your Role</div>
                  <div className="text-primary">Administrator</div>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-yellow-500">Admin Notice</div>
                    <div className="text-sm text-gray-400 mt-1">
                      As an administrator, you have full control over the contract including
                      pausing operations and managing roles. Use these powers responsibly.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
