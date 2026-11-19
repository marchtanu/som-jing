import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Lock,
  QrCode,
  ShieldCheck,
  X,
} from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-paper border border-stoneBorder rounded-2xl max-w-xl w-full shadow-elevated overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stoneBorder bg-sand/60">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-escrowBlue" />
            <h2 className="text-lg font-bold text-ink">
              ชำระเงินจำลอง &amp; พักเงินในระบบ Escrow
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setCheckoutTarget(null)}
            className="p-1.5 rounded-lg text-mutedInk hover:text-ink hover:bg-sand"
            aria-label="ปิดหน้าชำระเงิน"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Item Summary */}
          <div className="flex items-center gap-4 p-3.5 rounded-xl bg-ivory border border-stoneBorder">
            <SafeImage
              src={checkoutTarget.productImage}
              alt={checkoutTarget.productTitle}
              className="w-16 h-16 rounded-lg object-cover shrink-0 border border-stoneBorder"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <VerificationBadge
                  status={checkoutTarget.isVerifiedItem ? 'verified' : 'unverified'}
                  certificateId={checkoutTarget.certificateId}
                  compact
                />
                <span className="text-[11px] font-medium text-mutedInk">
                  ผู้ขาย: {checkoutTarget.sellerName}
                </span>
              </div>
              <p className="text-sm font-semibold text-ink line-clamp-2">
                {checkoutTarget.productTitle}
              </p>
            </div>
          </div>

          {/* Escrow Explanation Banner */}
          <div className="rounded-xl bg-escrowBlue-soft border border-escrowBlue/20 p-3.5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-escrowBlue shrink-0 mt-0.5" />
            <div className="text-xs text-ink/90 leading-relaxed">
              <p className="font-semibold text-escrowBlue mb-0.5">
                เงินของคุณจะถูกพักไว้ที่ตัวกลาง SomJing Escrow ก่อน
              </p>
              <p>
                ระบบจะยังไม่โอนเงินให้ผู้ขายทันที จนกว่าผู้ขายจะจัดส่งสินค้าและคุณกด
                &ldquo;ยืนยันรับของถูกต้อง&rdquo; เรียบร้อยแล้ว
              </p>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <p className="text-xs font-semibold text-ink mb-2.5">เลือกช่องทางชำระเงินจำลอง</p>
            <div className="grid grid-cols-3 gap-2.5">
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
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                    method === m.id
                      ? 'border-vermilion bg-vermilion-soft text-vermilion'
                      : 'border-stoneBorder bg-paper text-mutedInk hover:text-ink hover:bg-sand/50'
                  }`}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Method Details */}
          {method === 'PromptPay QR' && (
            <div className="rounded-xl border border-stoneBorder bg-ivory/70 p-4 flex flex-col sm:flex-row items-center gap-4">
              {/* Crisp Geometric QR Placeholder */}
              <div className="w-28 h-28 bg-white p-2 rounded-xl border border-stoneBorder shrink-0 flex items-center justify-center">
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
              <div className="text-xs space-y-1 text-center sm:text-left">
                <p className="font-bold text-ink">Thai QR Payment (SomJing Escrow Account)</p>
                <p className="text-mutedInk">
                  ยอดชำระเข้าบัญชีพักเงินกลาง:{' '}
                  <span className="font-mono font-bold text-ink">{formatTHB(totalPaid)}</span>
                </p>
                <p className="text-[11px] text-emeraldSeal font-medium">
                  * ระบบจำลองสำหรับการสาธิต ไม่มีการตัดเงินจริง
                </p>
              </div>
            </div>
          )}

          {method === 'Credit Card' && (
            <div className="rounded-xl border border-stoneBorder bg-ivory/70 p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink">Visa / Mastercard (Demo Sandbox)</span>
                <span className="font-mono text-mutedInk">3D-Secure Protected</span>
              </div>
              <input
                type="text"
                readOnly
                value="4532 •••• •••• 8890"
                className="w-full px-3 py-2 rounded-lg border border-stoneBorder bg-white font-mono text-ink"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  readOnly
                  value="12 / 29"
                  className="px-3 py-2 rounded-lg border border-stoneBorder bg-white font-mono text-ink"
                />
                <input
                  type="text"
                  readOnly
                  value="CVV •••"
                  className="px-3 py-2 rounded-lg border border-stoneBorder bg-white font-mono text-ink"
                />
              </div>
            </div>
          )}

          {method === 'Mobile Banking' && (
            <div className="rounded-xl border border-stoneBorder bg-ivory/70 p-4 space-y-2 text-xs">
              <label className="block font-semibold text-ink">เลือกธนาคารสำหรับจำลองการโอน</label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stoneBorder bg-white text-ink font-medium"
              >
                <option>K PLUS (กสิกรไทย)</option>
                <option>SCB EASY (ไทยพาณิชย์)</option>
                <option>Krungthai NEXT (กรุงไทย)</option>
                <option>Bangkok Bank Mobile (กรุงเทพ)</option>
              </select>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="rounded-xl bg-sand/70 p-4 space-y-2 text-sm">
            <div className="flex justify-between text-mutedInk">
              <span>ราคาสินค้า</span>
              <span className="font-mono font-medium text-ink">
                {formatTHB(checkoutTarget.amount)}
              </span>
            </div>
            <div className="flex justify-between text-mutedInk">
              <span>ค่าบริการคุ้มครองตัวกลาง Escrow (2%)</span>
              <span className="font-mono font-medium text-ink">{formatTHB(escrowFee)}</span>
            </div>
            <div className="pt-2 border-t border-stoneBorder flex justify-between items-baseline">
              <span className="font-bold text-ink">ยอดรวมที่พักในระบบ Escrow</span>
              <span className="text-xl font-bold font-mono text-vermilion tabular-nums">
                {formatTHB(totalPaid)}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={processing}
            onClick={handleConfirmPayment}
            className="w-full py-3 rounded-xl bg-vermilion hover:bg-vermilion-hover disabled:opacity-60 text-white font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {processing
                ? 'กำลังประมวลผลการพักเงินเข้าบัญชี Escrow...'
                : `ยืนยันชำระเงินจำลอง ${formatTHB(totalPaid)}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
