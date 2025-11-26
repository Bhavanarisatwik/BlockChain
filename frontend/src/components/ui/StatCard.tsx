'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'secondary' | 'accent' | 'warning';
}

const colorMap = {
  primary: {
    bg: 'rgba(0, 212, 255, 0.1)',
    border: 'rgba(0, 212, 255, 0.3)',
    text: 'var(--primary)',
    glow: 'rgba(0, 212, 255, 0.2)',
  },
  secondary: {
    bg: 'rgba(139, 92, 246, 0.1)',
    border: 'rgba(139, 92, 246, 0.3)',
    text: 'var(--secondary)',
    glow: 'rgba(139, 92, 246, 0.2)',
  },
  accent: {
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.3)',
    text: 'var(--accent)',
    glow: 'rgba(16, 185, 129, 0.2)',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.3)',
    text: 'var(--warning)',
    glow: 'rgba(245, 158, 11, 0.2)',
  },
};

export function StatCard({ title, value, icon: Icon, trend, color = 'primary' }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="relative bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 overflow-hidden card-hover"
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30"
        style={{ background: colors.glow }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[var(--text-secondary)] mb-1">{title}</p>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{value}</p>
          </div>
          <div
            className="p-3 rounded-xl"
            style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
          >
            <Icon className="h-6 w-6" style={{ color: colors.text }} />
          </div>
        </div>

        {trend && (
          <div className="mt-3 flex items-center gap-1">
            <span
              className={`text-sm font-medium ${
                trend.isPositive ? 'text-[var(--accent)]' : 'text-[var(--error)]'
              }`}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-[var(--text-muted)]">from last month</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
