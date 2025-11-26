'use client';

import { motion } from 'framer-motion';
import { Bell, Check, Trash2, ArrowRightLeft, FileText, AlertTriangle, Package, CheckCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAppStore } from '@/lib/store';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';

export default function NotificationsPage() {
  const { notifications, markAsRead, clearNotifications } = useAppStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'transfer':
        return <ArrowRightLeft className="h-5 w-5 text-[var(--primary)]" />;
      case 'document':
        return <FileText className="h-5 w-5 text-[var(--secondary)]" />;
      case 'recall':
        return <AlertTriangle className="h-5 w-5 text-[var(--error)]" />;
      case 'product':
        return <Package className="h-5 w-5 text-[var(--accent)]" />;
      default:
        return <Bell className="h-5 w-5 text-[var(--text-muted)]" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <main className="pt-20 pb-12 px-4">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                Notifications
              </h1>
              <p className="text-[var(--text-secondary)]">
                {unreadCount > 0 
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : 'All caught up!'
                }
              </p>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="btn-secondary flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </button>
            )}
          </motion.div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Bell className="h-16 w-16 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)] mb-2">
                No notifications yet
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                You'll be notified about important supply chain events
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-[var(--surface)] border rounded-xl p-4 transition-all ${
                    notification.read 
                      ? 'border-[var(--border)]' 
                      : 'border-[var(--primary)]/50 bg-[var(--primary)]/5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-[var(--background)]">
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className={`font-semibold ${
                            notification.read 
                              ? 'text-[var(--text-secondary)]' 
                              : 'text-[var(--text-primary)]'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-[var(--text-muted)] mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] mt-2">
                            {formatDateTime(notification.timestamp / 1000)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 rounded-lg hover:bg-[var(--background)] transition-colors"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4 text-[var(--accent)]" />
                            </button>
                          )}
                          {notification.link && (
                            <Link
                              href={notification.link}
                              className="text-sm text-[var(--primary)] hover:underline"
                            >
                              View
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Notification Types
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-[var(--primary)]" />
                <span className="text-sm text-[var(--text-secondary)]">Transfers</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[var(--secondary)]" />
                <span className="text-sm text-[var(--text-secondary)]">Documents</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--error)]" />
                <span className="text-sm text-[var(--text-secondary)]">Recalls</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-[var(--accent)]" />
                <span className="text-sm text-[var(--text-secondary)]">Products</span>
              </div>
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-4">
              Configure your notification preferences in{' '}
              <Link href="/settings" className="text-[var(--primary)] hover:underline">
                Settings
              </Link>
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
