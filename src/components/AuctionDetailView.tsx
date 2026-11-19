import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Gavel,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CATEGORY_LABELS, formatTHB, formatThaiDateTime, getCountdownParts } from '../utils/format';
import { SafeImage, VerificationBadge } from './ui';

export const AuctionDetailView: React.FC = () => {
  const {
    products,
    selectedProductId,
    setSelectedProductId,
    watchlistIds,
    toggleWatchlist,
    getSelectedOptionForProduct,
    setProductSelectedOption,
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
  const [openSection, setOpenSection] = useState<'auth' | 'bids' | 'escrow' | null>('auth');

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeOption = product ? getSelectedOptionForProduct(product) : null;

  useEffect(() => {
    if (product) {
      setCustomBid(String(product.currentPrice + product.minBidIncrement));
      setSelectedImageIdx(activeOption?.imageIndex ?? 0);
      setBidError(null);
    }
  }, [product?.id, product?.currentPrice, activeOption?.id]);

  if (!product || !activeOption) return null;

  const countdown = getCountdownParts(product.endTime, nowMs);
  const minNextBid = product.currentPrice + product.minBidIncrement;
  const isSaved = watchlistIds.includes(product.id);
  const isOwnListing = currentUser?.id === product.sellerId;
  const isAdmin = currentUser?.role === 'admin';

  const handleSelectOption = (optionId: string, imageIndex: number) => {
    setProductSelectedOption(product.id, optionId);
    if (product.images[imageIndex]) {
      setSelectedImageIdx(imageIndex);
    }
  };

  const handlePlaceBid = (amount: number) => {
    setBidError(null);
    const res = placeBid(product.id, amount, activeOption.label);
    if (!res.ok && res.error) {
      setBidError(res.error);
    }
  };

  const handleEscrowCheckout = (amount: number, sourceType: 'auction' | 'direct') => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    if (isAdmin || isOwnListing) return;
    setCheckoutTarget({
      sourceType,
      sourceId: product.id,
      productTitle: product.title,
      productImage: product.images[selectedImageIdx] || product.images[0],
      selectedOptionLabel: activeOption.label,
      amount,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      isVerifiedItem: product.verificationStatus === 'verified',
      certificateId: product.certificateId,
    });
  };

  return (
    <div className="space-y-8 animate-view-in">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setSelectedProductId(null)}
            className="btn-icon-circular shrink-0"
            aria-label="กลับหน้ารวมสินค้า"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <p className="text-sm font-medium text-mute truncate">
            Explore &amp; Auctions / {CATEGORY_LABELS[product.category]} /{' '}
            <span className="text-ink">{product.title}</span>
          </p>
        </div>

        {!isAdmin && (
          <button
            type="button"
            onClick={() => toggleWatchlist(product.id)}
            className="filter-chip shrink-0"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-sale text-sale' : 'text-ink'}`} />
            <span>{isSaved ? 'Saved' : 'Save Item'}</span>
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Vertical Thumbnail Rail + 1:1 Studio Image */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-3">
          {product.images.length > 0 && (
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:w-16 shrink-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-16 h-16 bg-soft-cloud rounded-none overflow-hidden border transition-all shrink-0 ${
                    selectedImageIdx === idx
                      ? 'border-ink'
                      : 'border-transparent opacity-65 hover:opacity-100'
                  }`}
                >
                  <SafeImage
                    src={img}
                    alt={`${product.title} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 aspect-square bg-soft-cloud rounded-none overflow-hidden relative">
            <SafeImage
              src={product.images[selectedImageIdx] || product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute top-4 left-4">
              <VerificationBadge
                status={product.verificationStatus}
                certificateId={product.certificateId}
              />
            </div>
          </div>
        </div>

        {/* Right Column: PDP Options, Pricing, Bidding & Stacked Disclosures */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-mute">
              {CATEGORY_LABELS[product.category]} · {product.condition}
            </p>
            <h1 className="text-2xl sm:text-[32px] font-medium leading-[1.2] text-ink">
              {product.title}
            </h1>
            <p className="text-sm font-medium text-mute">ผู้ขาย: {product.sellerName}</p>
          </div>

          {/* Product Options / Edition Selector (Synced 1:1 with Catalog Card) */}
          <div className="space-y-3 pb-4 border-b border-hairline">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-ink">
                ตัวเลือกสินค้า / Edition
              </span>
              <span className="text-xs font-medium text-mute">
                {product.options.length} ตัวเลือก
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.options.map((opt) => {
                const selected = opt.id === activeOption.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id, opt.imageIndex)}
                    className={selected ? 'filter-chip-active' : 'filter-chip'}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-hairline shrink-0"
                      style={{ backgroundColor: opt.colorHex }}
                    />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-charcoal bg-soft-cloud px-3.5 py-2.5">
              รายละเอียดตัวเลือก: <strong className="font-medium text-ink">{activeOption.spec}</strong>
            </p>
          </div>

          {/* Price & Countdown Row */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-mute uppercase tracking-wide">
              {product.saleType === 'auction' ? 'ราคาประมูลปัจจุบัน (Current Bid)' : 'ราคาขายสุทธิ'}
            </p>
            <div className="flex items-baseline flex-wrap gap-4">
              <span className="text-2xl font-medium text-ink font-mono tabular-nums">
                {formatTHB(product.currentPrice)}
              </span>
              {product.saleType === 'auction' && (
                <span className="text-base font-medium text-sale font-mono tabular-nums">
                  {countdown.formatted} ({product.bids.length} บิด)
                </span>
              )}
            </div>
            {product.saleType === 'auction' && (
              <p className="text-xs text-mute">
                ราคาเริ่มต้น {formatTHB(product.startPrice)} · เพิ่มขั้นต่ำ{' '}
                <span className="font-mono text-ink">+{formatTHB(product.minBidIncrement)}</span>
              </p>
            )}
          </div>

          <p className="text-base text-charcoal leading-relaxed">{product.description}</p>

          {/* Role-Consistent Action Controls */}
          {product.status === 'sold' ? (
            <div className="bg-soft-cloud p-5 text-sm font-medium text-success">
              รายการนี้ถูกชำระเงินเข้าบัญชีพักเงิน SomJing Escrow เรียบร้อยแล้ว
            </div>
          ) : isOwnListing ? (
            <div className="bg-soft-cloud p-5 space-y-3 border border-hairline">
              <p className="text-sm font-medium text-ink">
                นี่คือประกาศขายสินค้าของคุณ (ผู้ขายไม่สามารถประมูลหรือซื้อสินค้าตนเองได้)
              </p>
              <div className="flex flex-wrap gap-2">
                {product.verificationStatus === 'unverified' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProductId(null);
                      setActiveTab('verify');
                    }}
                    className="btn-primary h-10 px-5 text-sm"
                  >
                    ส่งขอ Verify ความแท้
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProductId(null);
                    setActiveTab('escrow');
                  }}
                  className="btn-secondary bg-canvas border border-hairline h-10 px-5 text-sm"
                >
                  ดูคำสั่งซื้อ Escrow ของฉัน
                </button>
              </div>
            </div>
          ) : isAdmin ? (
            <div className="bg-soft-cloud p-5 space-y-3 border border-hairline">
              <p className="text-sm font-medium text-ink">
                โหมดผู้ตรวจสอบระบบ (Admin): บัญชีผู้ดูแลระบบไม่สามารถร่วมประมูลหรือสั่งซื้อสินค้าได้
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedProductId(null);
                  setActiveTab('admin');
                }}
                className="btn-primary h-10 px-5 text-sm"
              >
                จัดการคิว Verify และข้อร้องเรียนใน Admin Console
              </button>
            </div>
          ) : product.saleType === 'auction' ? (
            <div className="space-y-4">
              {bidError && <p className="text-sm font-medium text-sale">{bidError}</p>}

              <div className="space-y-2">
                <p className="text-sm font-medium text-ink">เลือกเพิ่มราคาประมูลด่วน</p>
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
                        className="filter-chip disabled:opacity-40 font-mono"
                      >
                        +{formatTHB(inc)} ({formatTHB(targetAmount)})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <input
                  type="number"
                  min={minNextBid}
                  step={100}
                  value={customBid}
                  onChange={(e) => setCustomBid(e.target.value)}
                  className="hairline-input w-full font-mono text-base"
                />
                <button
                  type="button"
                  disabled={countdown.ended}
                  onClick={() => handlePlaceBid(Number(customBid))}
                  className="btn-primary w-full"
                >
                  <Gavel className="w-4 h-4" />
                  <span>บิดประมูลทันที ({activeOption.label})</span>
                </button>
                {product.buyNowPrice && (
                  <button
                    type="button"
                    onClick={() => handleEscrowCheckout(product.buyNowPrice!, 'direct')}
                    className="btn-secondary w-full"
                  >
                    ซื้อทันที {formatTHB(product.buyNowPrice)} (Escrow)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleEscrowCheckout(product.currentPrice, 'auction')}
                  className="btn-secondary w-full"
                >
                  จำลองปิดประมูล &amp; ชำระ Escrow
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleEscrowCheckout(product.currentPrice, 'direct')}
              className="btn-primary w-full"
            >
              ซื้อสินค้า &amp; พักเงิน Escrow ({formatTHB(product.currentPrice)})
            </button>
          )}

          {/* Stacked pdp-disclosure-row Accordions */}
          <div className="border-t border-hairline">
            {/* Row 1: Specs & Authenticity Certificate */}
            <div className="border-b border-hairline">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === 'auth' ? null : 'auth')}
                className="w-full py-6 flex items-center justify-between text-left text-base font-medium text-ink"
              >
                <span>สเปคสินค้าและการรับรองความแท้ (Specs &amp; Verify)</span>
                {openSection === 'auth' ? (
                  <ChevronUp className="w-5 h-5 text-ink" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-ink" />
                )}
              </button>
              {openSection === 'auth' && (
                <div className="pb-6 text-sm text-charcoal space-y-4 animate-fade-in">
                  {product.specs.length > 0 && (
                    <div className="divide-y divide-hairline-soft border-t border-b border-hairline-soft">
                      {product.specs.map((spec) => (
                        <div key={spec.label} className="py-2 flex justify-between gap-4 text-xs">
                          <span className="text-mute">{spec.label}</span>
                          <span className="font-medium text-ink text-right">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {product.verificationStatus === 'verified' ? (
                    <div className="space-y-1.5">
                      <p className="text-success font-medium inline-flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        <span>ผ่านการตรวจสอบความแท้แล้ว ({product.certificateId})</span>
                      </p>
                      <p>ผู้ตรวจสอบ: {product.verifiedBy}</p>
                      <p>
                        Serial Number:{' '}
                        <span className="font-mono text-ink">{product.serialNumber || '-'}</span>
                      </p>
                      {product.authenticityNotes && <p>{product.authenticityNotes}</p>}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p>
                        สถานะปัจจุบัน:{' '}
                        <strong className="text-ink">
                          {product.verificationStatus === 'pending'
                            ? 'อยู่ระหว่างรอทีมแอดมินตรวจสอบ'
                            : 'ยังไม่ได้ส่งขอรับรองความแท้'}
                        </strong>
                      </p>
                      {product.verificationStatus === 'unverified' && isOwnListing && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProductId(null);
                            setActiveTab('verify');
                          }}
                          className="text-sm font-medium text-ink underline underline-offset-4"
                        >
                          ส่งขอ Verify รายการนี้
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Row 2: Bid History */}
            {product.saleType === 'auction' && (
              <div className="border-b border-hairline">
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === 'bids' ? null : 'bids')}
                  className="w-full py-6 flex items-center justify-between text-left text-base font-medium text-ink"
                >
                  <span>ประวัติการเสนอราคา ({product.bids.length})</span>
                  {openSection === 'bids' ? (
                    <ChevronUp className="w-5 h-5 text-ink" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-ink" />
                  )}
                </button>
                {openSection === 'bids' && (
                  <div className="pb-6 space-y-2.5 text-sm animate-fade-in">
                    {product.bids.length === 0 ? (
                      <p className="text-mute">ยังไม่มีผู้เสนอราคา — เป็นคนแรกที่เปิดบิด</p>
                    ) : (
                      product.bids.map((bid, idx) => (
                        <div key={bid.id} className="flex items-center justify-between gap-2">
                          <div>
                            <span className="font-medium text-ink">{bid.bidderName}</span>
                            {idx === 0 && (
                              <span className="ml-2 text-xs font-medium text-success">
                                Leading
                              </span>
                            )}
                            <p className="text-xs text-mute">
                              {bid.selectedOptionLabel ? `${bid.selectedOptionLabel} · ` : ''}
                              {formatThaiDateTime(bid.createdAt)}
                            </p>
                          </div>
                          <span className="font-mono font-medium text-ink tabular-nums">
                            {formatTHB(bid.amount)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Row 3: Escrow Protection */}
            <div className="border-b border-hairline">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === 'escrow' ? null : 'escrow')}
                className="w-full py-6 flex items-center justify-between text-left text-base font-medium text-ink"
              >
                <span>ระบบพักเงิน Escrow &amp; การจัดส่ง</span>
                {openSection === 'escrow' ? (
                  <ChevronUp className="w-5 h-5 text-ink" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-ink" />
                )}
              </button>
              {openSection === 'escrow' && (
                <div className="pb-6 text-sm text-charcoal space-y-2 leading-relaxed animate-fade-in">
                  <p>1. ชำระเงินเข้าบัญชีพักเงินตัวกลาง SomJing Escrow (ค่าบริการคุ้มครอง 2%)</p>
                  <p>2. ผู้ขายจัดส่งสินค้าพร้อมแนบเลขพัสดุ</p>
                  <p>3. ผู้ซื้อตรวจรับสินค้าและกดยืนยันรับของ จึงจะปล่อยเงินให้ผู้ขาย</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
