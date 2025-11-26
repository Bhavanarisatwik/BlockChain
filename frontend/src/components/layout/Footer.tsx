'use client';

import Link from 'next/link';
import { Github, Twitter, Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-secondary)] text-sm">
              © {new Date().getFullYear()} SupplyChain Provenance. All rights reserved.
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link 
              href="/docs" 
              className="text-[var(--text-secondary)] hover:text-[var(--primary)] text-sm transition-colors"
            >
              Documentation
            </Link>
            <Link 
              href="/privacy" 
              className="text-[var(--text-secondary)] hover:text-[var(--primary)] text-sm transition-colors"
            >
              Privacy
            </Link>
            <Link 
              href="/terms" 
              className="text-[var(--text-secondary)] hover:text-[var(--primary)] text-sm transition-colors"
            >
              Terms
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://ethereum.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
            >
              <Globe className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
