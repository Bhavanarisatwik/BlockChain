'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose?: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'qr-reader';

  const startScanning = async () => {
    try {
      setError(null);
      const html5QrCode = new Html5Qrcode(containerId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanning();
        },
        () => {} // Ignore errors during scanning
      );
      setIsScanning(true);
    } catch (err) {
      setError('Unable to access camera. Please ensure camera permissions are granted.');
      console.error('QR Scanner error:', err);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning]);

  return (
    <div className="relative bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
      {onClose && (
        <button
          onClick={() => {
            stopScanning();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[var(--surface-light)] transition-colors"
        >
          <X className="h-5 w-5 text-[var(--text-secondary)]" />
        </button>
      )}

      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Scan QR Code</h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Point your camera at a batch QR code to verify
        </p>
      </div>

      <div 
        id={containerId} 
        className="w-full max-w-sm mx-auto rounded-lg overflow-hidden bg-black"
        style={{ minHeight: isScanning ? '300px' : '0' }}
      />

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/30 text-[var(--error)] text-sm">
          {error}
        </div>
      )}

      {!isScanning && (
        <button
          onClick={startScanning}
          className="mt-4 w-full btn-primary flex items-center justify-center gap-2"
        >
          <Camera className="h-5 w-5" />
          Start Scanning
        </button>
      )}

      {isScanning && (
        <button
          onClick={stopScanning}
          className="mt-4 w-full btn-secondary flex items-center justify-center gap-2"
        >
          Stop Scanning
        </button>
      )}
    </div>
  );
}
