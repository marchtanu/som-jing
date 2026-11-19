import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Info,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { VerificationStatus } from '../types';
import { generateFallbackSvgDataUri } from '../utils/format';

export const SafeImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => {
  const [failed, setFailed] = useState(false);
  const fallback = generateFallbackSvgDataUri(alt);

  return (
    <img
      src={failed || !src ? fallback : src}
      alt={alt}
      onError={() => setFailed(true)}
      className={className}
      loading="lazy"
    />
  );
};

export const VerificationBadge: React.FC<{
  status: VerificationStatus;
  certificateId?: string;
  compact?: boolean;
}> = ({ status, certificateId, compact = false }) => {
  if (status === 'verified') {
    return (
      <span
        title={certificateId ? `Certificate: ${certificateId}` : 'SomJing Verified Authentic'}
        className="badge-promo"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" />
        <span>{compact ? 'Verified' : 'SomJing Verified'}</span>
        {!compact && certificateId && (
          <span className="font-mono text-[11px] text-mute border-l border-hairline pl-1.5">
            {certificateId}
          </span>
        )}
      </span>
    );
  }

  if (status === 'pending') {
    return (
      <span className="badge-promo text-charcoal">
        <Clock className="w-3.5 h-3.5 text-ink shrink-0" />
        <span>Pending Verify</span>
      </span>
    );
  }

  if (status === 'rejected') {
    return (
      <span className="badge-promo text-sale">
        <ShieldAlert className="w-3.5 h-3.5 text-sale shrink-0" />
        <span>Verify Rejected</span>
      </span>
    );
  }

  return (
    <span className="badge-promo text-mute">
      <span>Unverified</span>
    </span>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useStore();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 rounded-none bg-ink text-canvas border border-ink p-4 text-sm"
        >
          {toast.type === 'success' && (
            <CheckCircle2 className="w-5 h-5 text-success-bright shrink-0 mt-0.5" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className="w-5 h-5 text-sale shrink-0 mt-0.5" />
          )}
          {toast.type === 'info' && (
            <Info className="w-5 h-5 text-canvas shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-canvas">{toast.title}</p>
            {toast.detail && (
              <p className="text-xs text-stone mt-1 leading-relaxed">{toast.detail}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="text-stone hover:text-canvas p-0.5"
            aria-label="ปิดการแจ้งเตือน"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
