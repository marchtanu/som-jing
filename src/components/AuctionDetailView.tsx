import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  Gavel,
  History,
  Lock,
  ShieldCheck,
  ShoppingBag,
  UserCheck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CATEGORY_LABELS, formatTHB, formatThaiDateTime, getCountdownParts } from '../utils/format';
import { SafeImage, VerificationBadge } from './ui';

export const AuctionDetailView: React.FC = () => {
  const {
    products,
    selectedProductId,
    setSelectedProductId,
    placeBid,
    setCheckoutTarget,
    setActiveTab,
    currentUser,
    setAuthModalOpen,
  } = useStore();

  const product = products.find((p) => p.id === selectedProductId);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [customBid, setCustomBid] = useState('');
  const [bidError, setBidError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (product) {
      setCustomBid(String(product.currentPrice + product.minBidIncrement));
      setSelectedImageIdx(0);
      setBidError(null);
    }
  }, [product?.id, product?.currentPrice]);

  if (!product) return null;

  const countdown = getCountdownParts(product.endTime, nowMs);
  const minNextBid = product.currentPrice + product.minBidIncrement;

  const handlePlaceBid = (amount: number) => {
    setBidError(null);
    const res = placeBid(product.id, amount);
    if (!res.ok && res.error) {
      setBidError(res.error);
    }
  };

  const handleEscrowCheckout = (amount: number, sourceType: 'auction' | 'direct') => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setCheckoutTarget({
      sourceType,
      sourceId: product.id,
      productTitle: product.title,
      productImage: product.images[0],
      amount,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      isVerifiedItem: product.verificationStatus === 'verified',
      certificateId: product.certificateId,
    });
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => setSelectedProductId(null)}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-paper border border-stoneBorder text-sm font-semibold text-ink hover:bg-sand transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>กลับหน้ารวมสินค้า</span>
      </button>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Images & Certificate */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl bg-paper border border-stoneBorder overflow-hidden aspect-[4/3]">
            <SafeImage
              src={product.images[selectedImageIdx] || product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImageIdx === idx
                      ? 'border-vermilion'
                      : 'border-stoneBorder opacity-70 hover:opacity-100'
                  }`}
                >
                  <SafeImage src={img} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Authenticity Verification Details */}
          <div className="rounded-2xl bg-paper border border-stoneBorder p-5 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h2 className="text-base font-bold text-ink inline-flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-emeraldSeal" />
                <span>สถานะการรับรองความแท้ (Authenticity)</span>
              </h2>
              <VerificationBadge
                status={product.verificationStatus}
                certificateId={product.certificateId}
              />
            </div>

            {product.verificationStatus === 'verified' ? (
              <div className="rounded-xl bg-emeraldSeal-soft border border-emeraldSeal/20 p-4 text-xs space-y-1.5 text-ink">
                <p>
                  <span className="font-semibold">เลขที่ใบรับรอง:</span>{' '}
                  <span className="font-mono font-bold text-emeraldSeal">
                    {product.certificateId}
                  </span>
                </p>
                <p>
                  <span className="font-semibold">ผู้ตรวจสอบ:</span> {product.verifiedBy}
                </p>
                <p>
                  <span className="font-semibold">รหัสสินค้า / Serial:</span>{' '}
                  <span className="font-mono">{product.serialNumber || '-'}</span>
                </p>
                {product.authenticityNotes && (
                  <p className="text-emeraldSeal font-medium pt-1">
                    หมายเหตุผู้เชี่ยวชาญ: {product.authenticityNotes}
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-xl bg-sand p-4 text-xs text-mutedInk flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">
                    {product.verificationStatus === 'pending'
                      ? 'รายการนี้อยู่ระหว่างรอทีมแอดมินตรวจสอบความแท้'
                      : 'สินค้านี้ยังไม่ได้รับการตรวจรับรองความแท้ (Verified Badge)'}
                  </p>
                  <p className="mt-0.5">
                    รหัสซีเรียล: <span className="font-mono">{product.serialNumber || 'ไม่ระบุ'}</span>
                  </p>
                </div>
                {product.verificationStatus === 'unverified' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProductId(null);
                      setActiveTab('verify');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-ink text-white font-semibold shrink-0 hover:bg-ink/90"
                  >
                    ส่งขอ Verify
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Bidding / Purchase & History */}
        <div className="lg:col-span-6 space-y-5">
          <div className="rounded-2xl bg-paper border border-stoneBorder p-6 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full bg-sand text-xs font-semibold text-mutedInk">
                  {CATEGORY_LABELS[product.category]}
                </span>
                <span className="text-xs font-medium text-mutedInk">
                  สภาพ: <strong className="text-ink">{product.condition}</strong>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-ink leading-snug">
                {product.title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-mutedInk">
                <UserCheck className="w-4 h-4 text-ink" />
                <span>ผู้ขาย: <strong className="text-ink">{product.sellerName}</strong></span>
              </div>
            </div>

            <p className="text-sm text-mutedInk leading-relaxed">{product.description}</p>

            {/* Price & Countdown Panel */}
            <div className="rounded-2xl bg-ivory border border-stoneBorder p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <p className="text-xs text-mutedInk font-medium">
                    {product.saleType === 'auction' ? 'ราคาประมูลปัจจุบัน' : 'ราคาขายทันที'}
                  </p>
                  <p className="text-3xl font-bold font-mono text-vermilion tabular-nums mt-0.5">
                    {formatTHB(product.currentPrice)}
                  </p>
                  {product.saleType === 'auction' && (
                    <p className="text-xs text-mutedInk mt-1">
                      ราคาเริ่มต้น {formatTHB(product.startPrice)} • บิดเพิ่มขั้นต่ำ{' '}
                      <span className="font-mono font-semibold text-ink">
                        +{formatTHB(product.minBidIncrement)}
                      </span>
                    </p>
                  )}
                </div>

                {product.saleType === 'auction' && (
                  <div className="sm:text-right rounded-xl bg-ink text-ivory p-3.5">
                    <p className="text-[11px] text-ivory/75 inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-vermilion" />
                      <span>เวลานับถอยหลังปิดประมูล</span>
                    </p>
                    <p className="text-xl font-bold font-mono tabular-nums mt-0.5">
                      {countdown.formatted}
                    </p>
                  </div>
                )}
              </div>

              {product.status === 'sold' ? (
                <div className="rounded-xl bg-emeraldSeal-soft border border-emeraldSeal/25 p-4 text-sm font-semibold text-emeraldSeal text-center">
                  สินค้านี้ถูกซื้อและพักเงินในระบบ Escrow เรียบร้อยแล้ว
                </div>
              ) : product.saleType === 'auction' ? (
                <div className="space-y-3 pt-2 border-t border-stoneBorder">
                  {bidError && (
                    <div className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-medium text-rose-700">
                      {bidError}
                    </div>
                  )}

                  {/* Quick Bid Chips */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      product.minBidIncrement,
                      product.minBidIncrement * 2,
                      product.minBidIncrement * 4,
                    ].map((inc) => {
                      const targetAmount = product.currentPrice + inc;
                      return (
                        <button
                          key={inc}
                          type="button"
                          disabled={countdown.ended}
                          onClick={() => handlePlaceBid(targetAmount)}
                          className="px-3 py-2 rounded-xl bg-paper border border-stoneBorder hover:border-vermilion hover:text-vermilion text-xs font-mono font-semibold transition-colors disabled:opacity-50"
                        >
                          บิด +{formatTHB(inc)} ({formatTHB(targetAmount)})
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Bid Form */}
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={minNextBid}
                      step={100}
                      value={customBid}
                      onChange={(e) => setCustomBid(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-stoneBorder bg-paper font-mono text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-vermilion/25 focus:border-vermilion"
                    />
                    <button
                      type="button"
                      disabled={countdown.ended}
                      onClick={() => handlePlaceBid(Number(customBid))}
                      className="px-5 py-2.5 rounded-xl bg-vermilion hover:bg-vermilion-hover disabled:opacity-50 text-white text-sm font-semibold transition-colors inline-flex items-center gap-2 shrink-0"
                    >
                      <Gavel className="w-4 h-4" />
                      <span>ปุ่มบิดประมูล</span>
                    </button>
                  </div>

                  {/* Buy Now / Demo Checkout Button */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    {product.buyNowPrice && (
                      <button
                        type="button"
                        onClick={() => handleEscrowCheckout(product.buyNowPrice!, 'direct')}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-ink hover:bg-ink/90 text-white text-xs font-semibold transition-colors inline-flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>ซื้อทันที {formatTHB(product.buyNowPrice)} (ผ่าน Escrow)</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleEscrowCheckout(product.currentPrice, 'auction')}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-escrowBlue-soft border border-escrowBlue/25 hover:bg-escrowBlue hover:text-white text-escrowBlue text-xs font-semibold transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>จำลองชนะประมูล &amp; ชำระ Escrow</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleEscrowCheckout(product.currentPrice, 'direct')}
                    className="w-full py-3 rounded-xl bg-vermilion hover:bg-vermilion-hover text-white text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>ซื้อสินค้า &amp; ชำระเงินเข้า Escrow ({formatTHB(product.currentPrice)})</span>
                  </button>
                </div>
              )}
            </div>

            {/* Escrow Guarantee Summary */}
            <div className="rounded-xl bg-escrowBlue-soft/70 border border-escrowBlue/15 p-3.5 flex items-center gap-3 text-xs text-ink">
              <ShieldCheck className="w-5 h-5 text-escrowBlue shrink-0" />
              <span>
                ทุกคำสั่งซื้อคุ้มครองด้วยระบบ <strong className="text-escrowBlue">SomJing Escrow</strong>{' '}
                (พักเงิน → จัดส่ง → ยืนยันรับของ → ปล่อยเงิน)
              </span>
            </div>
          </div>

          {/* Bid History */}
          {product.saleType === 'auction' && (
            <div className="rounded-2xl bg-paper border border-stoneBorder p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-ink inline-flex items-center gap-2">
                  <History className="w-4 h-4 text-vermilion" />
                  <span>ประวัติการเสนอราคา ({product.bids.length} ครั้ง)</span>
                </h2>
                <span className="text-xs text-mutedInk">อัปเดตแบบ Real-time</span>
              </div>

              {product.bids.length === 0 ? (
                <p className="text-xs text-mutedInk py-4 text-center bg-ivory rounded-xl">
                  ยังไม่มีผู้เสนอราคา — เป็นคนแรกที่เปิดบิดรายการนี้!
                </p>
              ) : (
                <div className="divide-y divide-stoneBorder">
                  {product.bids.map((bid, index) => (
                    <div
                      key={bid.id}
                      className="py-2.5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold ${
                            index === 0
                              ? 'bg-vermilion-soft text-vermilion'
                              : 'bg-sand text-mutedInk'
                          }`}
                        >
                          {index === 0 ? 'นำสูงสุด' : `#${product.bids.length - index}`}
                        </span>
                        <span className="font-semibold text-ink">{bid.bidderName}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-ink tabular-nums">
                          {formatTHB(bid.amount)}
                        </p>
                        <p className="text-[11px] text-mutedInk">
                          {formatThaiDateTime(bid.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
