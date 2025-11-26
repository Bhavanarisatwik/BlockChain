'use client';

import { motion } from 'framer-motion';
import { 
  Package, 
  Truck, 
  FileCheck, 
  AlertTriangle, 
  ArrowRightLeft,
  Plus
} from 'lucide-react';
import { formatDateTime, truncateAddress } from '@/lib/utils';

interface TimelineEvent {
  type: 'created' | 'transfer' | 'document' | 'recall' | 'sensor';
  title: string;
  description?: string;
  timestamp: number;
  actor?: string;
  location?: string;
  documentCID?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

const eventIcons = {
  created: Plus,
  transfer: ArrowRightLeft,
  document: FileCheck,
  recall: AlertTriangle,
  sensor: Package,
};

const eventColors = {
  created: 'var(--accent)',
  transfer: 'var(--primary)',
  document: 'var(--secondary)',
  recall: 'var(--error)',
  sensor: 'var(--warning)',
};

export function Timeline({ events }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        No events recorded yet
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)]" />

      <div className="space-y-6">
        {events.map((event, index) => {
          const Icon = eventIcons[event.type];
          const color = eventColors[event.type];

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex gap-4"
            >
              {/* Icon */}
              <div
                className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2"
                style={{ 
                  borderColor: color,
                  backgroundColor: 'var(--surface)',
                  boxShadow: `0 0 12px ${color}40`
                }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="bg-[var(--surface-light)] rounded-lg p-4 border border-[var(--border)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-[var(--text-primary)]">
                        {event.title}
                      </h4>
                      {event.description && (
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                      {formatDateTime(event.timestamp)}
                    </span>
                  </div>

                  {/* Additional info */}
                  <div className="mt-3 flex flex-wrap gap-3 text-xs">
                    {event.actor && (
                      <span className="px-2 py-1 rounded bg-[var(--surface)] text-[var(--text-secondary)]">
                        By: {truncateAddress(event.actor)}
                      </span>
                    )}
                    {event.location && (
                      <span className="px-2 py-1 rounded bg-[var(--surface)] text-[var(--text-secondary)]">
                        📍 {event.location}
                      </span>
                    )}
                    {event.documentCID && (
                      <a
                        href={`https://ipfs.io/ipfs/${event.documentCID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors"
                      >
                        View Document
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
