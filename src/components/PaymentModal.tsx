import React, { useState } from 'react';
import { Building2, CreditCard, Lock, QrCode, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PaymentMethod } from '../types';
import { formatTHB } from '../utils/format';
import { SafeImage, VerificationBadge } from './ui';

export const PaymentModal: React.FC = () => {
  const { checkoutTarget, setCheckoutTarget, completeSimulatedPayment } = useStore();
  const [method, setMethod] = useState<PaymentMethod>('PromptPay QR');
  const [processing, setProcessing] = useState(false);
  const [selectedBank, setSelectedBank] = useState('K PLUS (กสิกรไทย)');

  if (!checkoutTarget) return null;

  const escrowFee = Math.round(checkoutTarget.amount * 0.02);
  const totalPaid = checkoutTarget.amount + escrowFee;

  const handleConfirmPayment = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      completeSimulatedPayment(checkoutTarget, method);
    }, 650);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 overflow-y-auto">
      <div className="bg-canvas border border-hairline rounded-none max-w-xl w-full my-8 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-hairline">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-ink" />
            <h2 className="text-2xl font-medium text-ink leading-[1.2]">
              ชำระเงินจำลอง &amp; พักเงิน Escrow
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setCheckoutTarget(null)}
            className="btn-icon-circular"
            aria-label="ปิดหน้าชำระเงิน"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Item Summary */}
          <div className="flex items-center gap-4 pb-6 border-b border-hairline">
            <SafeImage
              src={checkoutTarget.productImage}
              alt={checkoutTarget.productTitle}
              className="w-20 h-20 bg-soft-cloud object-cover shrink-0 rounded-none"
            />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <VerificationBadge
                  status={checkoutTarget.isVerifiedItem ? 'verified' : 'unverified'}
                  certificateId={checkoutTarget.certificateId}
                  compact
                />
                <span className="text-xs font-medium text-mute">
                  Seller: {checkoutTarget.sellerName}
                </span>
              </div>
              <p className="text-base font-medium text-ink line-clamp-2">
                {checkoutTarget.productTitle}
              </p>
            </div>
          </div>

          <p className="text-sm text-charcoal bg-soft-cloud p-4 leading-relaxed">
            <strong className="text-ink">SomJing Escrow Protection:</strong>{' '}
            ยอดชำระจะถูกพักไว้ในบัญชีกลางของแพลตฟอร์มและจะไม่โอนให้ผู้ขาย จนกว่าผู้ขายจะจัดส่งและคุณกดยืนยันรับของเรียบร้อยแล้ว
          </p>

          {/* Payment Method Chips */}
          <div className="space-y-2.5">
            <p className="text-sm font-medium text-ink">เลือกช่องทางชำระเงินจำลอง</p>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  id: 'PromptPay QR' as PaymentMethod,
                  label: 'PromptPay QR',
                  icon: <QrCode className="w-4 h-4" />,
                },
                {
                  id: 'Credit Card' as PaymentMethod,
                  label: 'บัตรเครดิต/เดบิต',
                  icon: <CreditCard className="w-4 h-4" />,
                },
                {
                  id: 'Mobile Banking' as PaymentMethod,
                  label: 'แอปธนาคาร',
                  icon: <Building2 className="w-4 h-4" />,
                },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={method === m.id ? 'filter-chip-active' : 'filter-chip'}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Method Details */}
          {method === 'PromptPay QR' && (
            <div className="border border-hairline p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-28 h-28 bg-soft-cloud p-2 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full text-ink">
                  <rect x="6" y="6" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="14" y="14" width="12" height="12" fill="currentColor" />
                  <rect x="66" y="6" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="74" y="14" width="12" height="12" fill="currentColor" />
                  <rect x="6" y="66" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="14" y="74" width="12" height="12" fill="currentColor" />
                  <rect x="44" y="10" width="8" height="8" fill="currentColor" />
                  <rect x="44" y="26" width="12" height="8" fill="currentColor" />
                  <rect x="10" y="44" width="12" height="8" fill="currentColor" />
                  <rect x="30" y="44" width="18" height="12" fill="currentColor" />
                  <rect x="56" y="44" width="10" height="10" fill="currentColor" />
                  <rect x="74" y="44" width="16" height="8" fill="currentColor" />
                  <rect x="46" y="64" width="12" height="12" fill="currentColor" />
                  <rect x="68" y="64" width="22" height="10" fill="currentColor" />
                  <rect x="46" y="82" width="16" height="10" fill="currentColor" />
                  <rect x="72" y="80" width="18" height="12" fill="currentColor" />
                </svg>
              </div>
              <div className="text-sm space-y-1 text-center sm:text-left">
                <p className="font-medium text-ink">Thai QR Payment (Escrow Sandbox)</p>
                <p className="text-mute">
                  ยอดพักเงิน:{' '}
                  <span className="font-mono font-medium text-ink">{formatTHB(totalPaid)}</span>
                </p>
                <p className="text-xs text-success font-medium">
                  * ระบบจำลองสำหรับการสาธิต ไม่มีการตัดเงินจริง
                </p>
              </div>
            </div>
          )}

          {method === 'Credit Card' && (
            <div className="border border-hairline p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink">Visa / Mastercard (Demo)</span>
                <span className="font-mono text-xs text-mute">3D-Secure</span>
              </div>
              <input
                type="text"
                readOnly
                value="4532 •••• •••• 8890"
                className="hairline-input w-full font-mono"
              />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" readOnly value="12 / 29" className="hairline-input font-mono" />
                <input type="text" readOnly value="CVV •••" className="hairline-input font-mono" />
              </div>
            </div>
          )}

          {method === 'Mobile Banking' && (
            <div className="border border-hairline p-4 space-y-2 text-sm">
              <label className="block font-medium text-ink">เลือกธนาคารจำลอง</label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="hairline-input w-full"
              >
                <option>K PLUS (กสิกรไทย)</option>
                <option>SCB EASY (ไทยพาณิชย์)</option>
                <option>Krungthai NEXT (กรุงไทย)</option>
                <option>Bangkok Bank Mobile (กรุงเทพ)</option>
              </select>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="border-t border-hairline pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-mute">
              <span>ราคาสินค้า</span>
              <span className="font-mono text-ink">{formatTHB(checkoutTarget.amount)}</span>
            </div>
            <div className="flex justify-between text-mute">
              <span>ค่าบริการคุ้มครอง Escrow (2%)</span>
              <span className="font-mono text-ink">{formatTHB(escrowFee)}</span>
            </div>
            <div className="pt-3 border-t border-hairline flex justify-between items-baseline">
              <span className="text-base font-medium text-ink">ยอดรวมที่พักใน Escrow</span>
              <span className="text-2xl font-medium font-mono text-ink tabular-nums">
                {formatTHB(totalPaid)}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={processing}
            onClick={handleConfirmPayment}
            className="btn-primary w-full"
          >
            <span>
              {processing
                ? 'กำลังพักเงินเข้าบัญชี Escrow...'
                : `ยืนยันชำระเงินจำลอง ${formatTHB(totalPaid)}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
