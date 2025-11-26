'use client';

import { useEffect, useRef } from 'react';
import QRCodeLib from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCode({ value, size = 200, className = '' }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCodeLib.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#00d4ff',
          light: '#12141a',
        },
      });
    }
  }, [value, size]);

  return (
    <div className={`inline-block p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] ${className}`}>
      <canvas ref={canvasRef} />
    </div>
  );
}
