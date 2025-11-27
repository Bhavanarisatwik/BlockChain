'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, Bell, Moon, Sun, Globe, Wallet,
  Save, Check, Loader2
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { useAccount } from 'wagmi';
import { useAppStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  const { notifications, setNotifications, clearNotifications } = useAppStore();

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    transferAlerts: true,
    recallAlerts: true,
    documentAlerts: false,
    theme: 'dark' as 'dark' | 'light' | 'system',
    language: 'en',
    currency: 'USD',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSelect = (key: keyof typeof settings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaved(true);
    toast.success('Settings saved successfully');
    // In production, save to backend/localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings));
  };

  const handleClearNotifications = () => {
    clearNotifications();
    toast.success('All notifications cleared');
  };

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse saved settings');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <main className="pt-20 pb-12 px-4">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              Settings
            </h1>
            <p className="text-[var(--text-secondary)]">
              Manage your account preferences and notifications
            </p>
          </motion.div>

          {/* Wallet Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-[var(--primary)]" />
              Wallet
            </h2>

            {isConnected ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Status</span>
                  <span className="badge badge-success">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Address</span>
                  <span className="font-mono text-[var(--text-secondary)] text-sm">
                    {address}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-[var(--text-secondary)]">
                Connect your wallet to access all features
              </p>
            )}
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Bell className="h-5 w-5 text-[var(--secondary)]" />
                Notifications
              </h2>
              {notifications.length > 0 && (
                <button
                  onClick={handleClearNotifications}
                  className="text-sm text-[var(--error)] hover:underline"
                >
                  Clear all ({notifications.length})
                </button>
              )}
            </div>

            <div className="space-y-4">
              <ToggleRow
                label="Email Notifications"
                description="Receive updates via email"
                checked={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
              />
              <ToggleRow
                label="Push Notifications"
                description="Browser push notifications"
                checked={settings.pushNotifications}
                onChange={() => handleToggle('pushNotifications')}
              />
              <ToggleRow
                label="Transfer Alerts"
                description="Get notified when batches are transferred"
                checked={settings.transferAlerts}
                onChange={() => handleToggle('transferAlerts')}
              />
              <ToggleRow
                label="Recall Alerts"
                description="Get notified about batch recalls"
                checked={settings.recallAlerts}
                onChange={() => handleToggle('recallAlerts')}
              />
              <ToggleRow
                label="Document Alerts"
                description="Get notified when documents are attached"
                checked={settings.documentAlerts}
                onChange={() => handleToggle('documentAlerts')}
              />
            </div>
          </motion.div>

          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Moon className="h-5 w-5 text-[var(--accent)]" />
              Appearance
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Theme
                </label>
                <div className="flex gap-3">
                  {[
                    { value: 'dark', label: 'Dark', icon: Moon },
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'system', label: 'System', icon: SettingsIcon },
                  ].map((theme) => {
                    const Icon = theme.icon;
                    return (
                      <button
                        key={theme.value}
                        onClick={() => handleSelect('theme', theme.value)}
                        className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${settings.theme === theme.value
                          ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                          : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)]/50'
                          }`}
                      >
                        <Icon className="h-4 w-4" />
                        {theme.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-[var(--primary)]" />
              Preferences
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSelect('language', e.target.value)}
                  className="w-full input-dark"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="zh">中文</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleSelect('currency', e.target.value)}
                  className="w-full input-dark"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="ETH">ETH (Ξ)</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end"
          >
            <button
              onClick={handleSave}
              disabled={isSaving || saved}
              className="btn-primary flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="h-5 w-5" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

// Toggle Row Component
function ToggleRow({
  label,
  description,
  checked,
  onChange
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="font-medium text-[var(--text-primary)]">{label}</p>
        <p className="text-sm text-[var(--text-muted)]">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-all ${checked ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
          }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'left-7' : 'left-1'
            }`}
        />
      </button>
    </div>
  );
}
