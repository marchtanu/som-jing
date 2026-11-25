import React, { useEffect, useState } from 'react';
import { Building2, CreditCard, Lock, QrCode, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PaymentMethod } from '../types';
import { formatTHB } from '../utils/format';
import { SafeImage, VerificationBadge } from './ui';

export const PaymentModal: React.FC = () => {
  const { checkoutTarget, setCheckoutTarget, completeSimulatedPayment, currentUser } = useStore();
  const [method, setMethod] = useState<PaymentMethod>('PromptPay QR');
  const [processing, setProcessing] = useState(false);

  // Editable Real Form Fields
  const [shippingAddress, setShippingAddress] = useState('');
  const [selectedBank, setSelectedBank] = useState('K PLUS (กสิกรไทย)');
  const [bankAccountRef, setBankAccountRef] = useState('089-412-8890');
  const [promptPayRef, setPromptPayRef] = useState('8841');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('4532 8810 4490 8890');
  const [cardExpiry, setCardExpiry] = useState('12/29');
  const [cardCvv, setCardCvv] = useState('842');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (checkoutTarget) {
      setShippingAddress(
        currentUser?.defaultAddress ||
          '99/14 ถนนพุทธมณฑลสาย 4 ต.ศาลายา อ.พุทธมณฑล จ.นครปฐม 73170'
      );
      setCardHolder(currentUser?.name || 'THANAPHAT MARCH');
      setBankAccountRef(currentUser?.phone || '089-412-8890');
      setFormError(null);
    }
  }, [checkoutTarget, currentUser]);

  if (!checkoutTarget) return null;

  const totalPaid = checkoutTarget.amount;

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!shippingAddress.trim()) {
      setFormError('กรุณากรอกที่อยู่สำหรับจัดส่งสินค้า');
      return;
    }

    if (method === 'Credit Card') {
      if (!cardHolder.trim() || cardNumber.replace(/\s+/g, '').length < 12 || !cardExpiry.trim() || cardCvv.trim().length < 3) {
        setFormError('กรุณากรอกข้อมูลบัตรเครดิต/เดบิตให้ครบถ้วน');
        return;
      }
    }

    if (method === 'PromptPay QR' && promptPayRef.trim().length < 4) {
      setFormError('กรุณากรอกเลขท้ายอ้างอิงสลิป 4 หลัก');
      return;
    }

    if (method === 'Mobile Banking' && !bankAccountRef.trim()) {
      setFormError('กรุณากรอกเบอร์โทร/เลขที่อ้างอิงแอปธนาคาร');
      return;
    }

    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      completeSimulatedPayment(checkoutTarget, method, shippingAddress.trim());
    }, 550);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 overflow-y-auto animate-fade-in">
      <div className="bg-canvas border border-hairline rounded-none max-w-xl w-full my-8 overflow-hidden animate-modal-in">
        <div className="flex items-center justify-between px-6 py-5 border-b border-hairline">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-ink" />
            <h2 className="text-2xl font-medium text-ink leading-[1.2]">
              ชำระเงิน &amp; พักเงินในระบบ Escrow
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

        <form onSubmit={handleConfirmPayment} className="p-6 space-y-5">
          {/* Item Summary */}
          <div className="flex items-center gap-4 pb-5 border-b border-hairline">
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
                  ผู้ขาย: {checkoutTarget.sellerName}
                </span>
              </div>
              <p className="text-base font-medium text-ink line-clamp-2">
                {checkoutTarget.productTitle}
              </p>
              {checkoutTarget.selectedOptionLabel && (
                <p className="text-xs font-medium text-charcoal">
                  ตัวเลือก: {checkoutTarget.selectedOptionLabel}
                </p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              ที่อยู่จัดส่งสินค้า &amp; เบอร์ผู้รับ *
            </label>
            <textarea
              rows={2}
              required
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="กรอกชื่อผู้รับ บ้านเลขที่ ถนน ตำบล/แขวง อำเภอ/เขต จังหวัด รหัสไปรษณีย์"
              className="hairline-input w-full text-sm"
            />
          </div>

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

          {/* Editable Method Details */}
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
              <div className="flex-1 text-sm space-y-2 w-full">
                <p className="font-medium text-ink">Thai QR Payment (SomJing Escrow)</p>
                <p className="text-xs text-mute">
                  ยอดโอน:{' '}
                  <span className="font-mono font-medium text-ink">{formatTHB(totalPaid)}</span>
                </p>
                <div>
                  <label className="block text-xs font-medium text-mute mb-1">
                    เลขท้ายอ้างอิงสลิป (4 หลัก)
                  </label>
                  <input
                    type="text"
                    maxLength={8}
                    value={promptPayRef}
                    onChange={(e) => setPromptPayRef(e.target.value)}
                    className="hairline-input w-full font-mono text-xs py-1.5"
                  />
                </div>
              </div>
            </div>
          )}

          {method === 'Credit Card' && (
            <div className="border border-hairline p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink">Visa / Mastercard</span>
                <span className="font-mono text-xs text-mute">3D-Secure Escrow</span>
              </div>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="ชื่อบนบัตร (Cardholder Name)"
                className="hairline-input w-full text-sm"
              />
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="หมายเลขบัตร 16 หลัก"
                className="hairline-input w-full font-mono"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="hairline-input font-mono"
                />
                <input
                  type="password"
                  maxLength={4}
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  placeholder="CVV"
                  className="hairline-input font-mono"
                />
              </div>
            </div>
          )}

          {method === 'Mobile Banking' && (
            <div className="border border-hairline p-4 space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-mute mb-1">เลือกธนาคาร</label>
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
              <div>
                <label className="block text-xs font-medium text-mute mb-1">
                  เบอร์โทรศัพท์ที่ผูกกับแอปธนาคาร
                </label>
                <input
                  type="text"
                  value={bankAccountRef}
                  onChange={(e) => setBankAccountRef(e.target.value)}
                  placeholder="08x-xxx-xxxx"
                  className="hairline-input w-full font-mono"
                />
              </div>
            </div>
          )}

          {formError && <p className="text-sm font-medium text-sale">{formError}</p>}

          {/* Price Breakdown */}
          <div className="border-t border-hairline pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-mute">
              <span>ราคาสินค้า</span>
              <span className="font-mono text-ink">{formatTHB(checkoutTarget.amount)}</span>
            </div>
            <div className="pt-3 border-t border-hairline flex justify-between items-baseline">
              <span className="text-base font-medium text-ink">ยอดรวมที่พักใน Escrow</span>
              <span className="text-2xl font-medium font-mono text-ink tabular-nums">
                {formatTHB(totalPaid)}
              </span>
            </div>
          </div>

          <button type="submit" disabled={processing} className="btn-primary w-full">
            <span>
              {processing
                ? 'กำลังพักเงินเข้าบัญชี Escrow...'
                : `ยืนยันชำระเงินจำลอง ${formatTHB(totalPaid)}`}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
