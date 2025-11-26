'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  ArrowRight, 
  Shield, 
  Boxes, 
  QrCode, 
  Globe,
  Cpu,
  ChevronRight
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Immutable Records',
    description: 'All transactions are permanently recorded on the Ethereum blockchain, ensuring tamper-proof provenance.',
  },
  {
    icon: Boxes,
    title: 'Batch Tracking',
    description: 'Track products from manufacturing to retail with complete custody chain visibility.',
  },
  {
    icon: QrCode,
    title: 'QR Verification',
    description: 'Instant verification of product authenticity with a simple QR code scan.',
  },
  {
    icon: Globe,
    title: 'Global Transparency',
    description: 'Access provenance data from anywhere in the world with decentralized storage.',
  },
];

const stats = [
  { label: 'Products Tracked', value: '10K+' },
  { label: 'Verified Batches', value: '50K+' },
  { label: 'Active Users', value: '1K+' },
  { label: 'Countries', value: '25+' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen gradient-bg blockchain-pattern">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-8 w-8 text-[var(--primary)]" />
              <span className="text-xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                SupplyChain
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/verify" 
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Verify Product
              </Link>
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/30 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
              <span className="text-sm text-[var(--primary)]">Powered by Ethereum</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              <span className="text-[var(--text-primary)]">Blockchain-Powered</span>
              <br />
              <span className="bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent">
                Supply Chain Provenance
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10"
            >
              Track, verify, and ensure transparency across your entire supply chain with 
              immutable blockchain records and decentralized document storage.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/dashboard" className="btn-primary flex items-center gap-2">
                Launch App
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/verify" className="btn-secondary flex items-center gap-2">
                Verify Product
                <QrCode className="h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, type: 'spring' }}
                  className="text-4xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent"
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-[var(--text-secondary)] mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              Built on cutting-edge blockchain technology to provide unmatched transparency and security.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="gradient-border p-6 card-hover"
              >
                <div className="p-3 rounded-xl bg-[var(--primary)]/10 w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-[var(--surface)]/50">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              How It Works
            </h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              Simple steps to track and verify your products on the blockchain.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Register Products',
                description: 'Manufacturers register products and batches with metadata stored on IPFS.',
              },
              {
                step: '02',
                title: 'Track Transfers',
                description: 'Each custody transfer is recorded on-chain with location and proof documents.',
              },
              {
                step: '03',
                title: 'Verify Authenticity',
                description: 'Consumers scan QR codes to instantly verify complete product provenance.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="text-6xl font-bold text-[var(--primary)]/20 mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                  {item.title}
                </h3>
                <p className="text-[var(--text-secondary)]">{item.description}</p>
                {index < 2 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-4 h-8 w-8 text-[var(--primary)]" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--primary)]/20 to-[var(--secondary)]/20 border border-[var(--border)] p-8 md:p-12 text-center"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-[var(--text-secondary)] max-w-xl mx-auto mb-8">
                Connect your wallet and start tracking your supply chain with blockchain-powered transparency.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <ConnectButton />
                <Link href="/dashboard" className="btn-secondary flex items-center gap-2">
                  Explore Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 px-4">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-6 w-6 text-[var(--primary)]" />
            <span className="font-semibold text-[var(--text-primary)]">SupplyChain</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            © {new Date().getFullYear()} SupplyChain Provenance. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
