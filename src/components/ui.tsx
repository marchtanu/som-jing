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
        title={certificateId ? `เลขที่ใบรับรอง: ${certificateId}` : 'ผ่านการตรวจรับรองความแท้โดย SomJing'}
        className="inline-flex items-center gap-1.5 rounded-full bg-emeraldSeal-soft border border-emeraldSeal/25 px-2.5 py-1 text-xs font-semibold text-emeraldSeal"
      >
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
        <span>{compact ? 'Verified' : 'SomJing Verified'}</span>
        {!compact && certificateId && (
          <span className="font-mono text-[11px] opacity-85 border-l border-emeraldSeal/25 pl-1.5">
            {certificateId}
          </span>
        )}
      </span>
    );
  }

  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-800">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span>รอแอดมินตรวจ Verify</span>
      </span>
    );
  }

  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-700">
        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
        <span>ไม่ผ่าน Verify</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sand border border-stoneBorder px-2.5 py-1 text-xs font-medium text-mutedInk">
      <span>ยังไม่ส่ง Verify</span>
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
          className="pointer-events-auto flex items-start gap-3 rounded-xl bg-paper border border-stoneBorder shadow-elevated p-3.5 text-sm animate-in fade-in slide-in-from-bottom-2"
        >
          {toast.type === 'success' && (
            <CheckCircle2 className="w-5 h-5 text-emeraldSeal shrink-0 mt-0.5" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          {toast.type === 'info' && (
            <Info className="w-5 h-5 text-escrowBlue shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-ink">{toast.title}</p>
            {toast.detail && (
              <p className="text-xs text-mutedInk mt-0.5 leading-relaxed">{toast.detail}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="text-mutedInk hover:text-ink p-0.5 rounded-md"
            aria-label="ปิดการแจ้งเตือน"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
