import React, { useState } from 'react';
import {
  CheckCircle2,
  Lock,
  MessageSquarePlus,
  Plus,
  SearchCode,
  Send,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCategory, WantedListing, WantedOffer } from '../types';
import { CATEGORY_LABELS, formatTHB, formatThaiDateTime } from '../utils/format';
import { SafeImage, VerificationBadge } from './ui';

export const WantedBoardView: React.FC = () => {
  const {
    wantedListings,
    createWantedListing,
    submitWantedOffer,
    setCheckoutTarget,
    currentUser,
    setAuthModalOpen,
  } = useStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProductCategory>('gadgets');
  const [targetBudget, setTargetBudget] = useState('25000');
  const [desiredCondition, setDesiredCondition] = useState('Mint (99%) หรือของใหม่ครบกล่อง');
  const [description, setDescription] = useState('');
  const [referenceImage, setReferenceImage] = useState(
    'https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=900&q=80'
  );

  // Active offer form modal/card state
  const [offeringForId, setOfferingForId] = useState<string | null>(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerCondition, setOfferCondition] = useState('ของแท้สภาพ 99% ครบกล่อง');
  const [offerVerified, setOfferVerified] = useState(true);
  const [offerMessage, setOfferMessage] = useState('');
  const [offerImage, setOfferImage] = useState(
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=900&q=80'
  );

  const handleCreateWanted = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createWantedListing({
      title: title.trim(),
      category,
      targetBudget: Math.max(500, Number(targetBudget) || 5000),
      desiredCondition: desiredCondition.trim(),
      description: description.trim() || 'ต้องการสินค้าแท้ พร้อมทำรายการผ่านระบบ Escrow',
      referenceImage: referenceImage.trim(),
    });
    setTitle('');
    setDescription('');
    setShowCreateForm(false);
  };

  const openOfferForm = (listing: WantedListing) => {
    setOfferingForId(listing.id);
    setOfferPrice(String(Math.max(500, listing.targetBudget - 500)));
    setOfferMessage(`มีสินค้าตรงรุ่นตามที่คุณ ${listing.buyerName} ตามหาครับ พร้อมส่งทันทีผ่าน Escrow`);
  };

  const handleSubmitOffer = (e: React.FormEvent, wantedId: string) => {
    e.preventDefault();
    submitWantedOffer({
      wantedId,
      price: Math.max(100, Number(offerPrice) || 1000),
      condition: offerCondition.trim(),
      isVerifiedItem: offerVerified,
      message: offerMessage.trim(),
      image: offerImage.trim(),
    });
    setOfferingForId(null);
  };

  const handleAcceptOffer = (listing: WantedListing, offer: WantedOffer) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setCheckoutTarget({
      sourceType: 'wanted_offer',
      sourceId: offer.id,
      wantedListingId: listing.id,
      productTitle: `${listing.title} (ข้อเสนอจาก ${offer.sellerName})`,
      productImage: offer.image || listing.referenceImage,
      amount: offer.price,
      sellerId: offer.sellerId,
      sellerName: offer.sellerName,
      isVerifiedItem: offer.isVerifiedItem,
      certificateId: offer.certificateId,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            กระดานตามหาสินค้า (Wanted Listing &amp; Offers)
          </h1>
          <p className="text-sm text-mutedInk mt-1">
            ผู้ซื้อสร้างประกาศตามหาของสะสมพร้อมงบประมาณ → ผู้ขายส่งข้อเสนอแข่งกัน → ผู้ซื้อเลือกข้อเสนอที่ถูกใจและชำระเข้า Escrow
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateForm((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-vermilion hover:bg-vermilion-hover text-white text-sm font-semibold transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{showCreateForm ? 'ซ่อนฟอร์มประกาศ' : 'สร้าง Wanted Listing'}</span>
        </button>
      </div>

      {/* Create Wanted Listing Form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateWanted}
          className="rounded-2xl bg-paper border border-vermilion/40 p-6 space-y-4 shadow-card"
        >
          <h2 className="text-base font-bold text-ink inline-flex items-center gap-2">
            <SearchCode className="w-5 h-5 text-vermilion" />
            <span>สร้างประกาศตามหาสินค้า (Reverse Marketplace)</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                สินค้าที่ต้องการตามหา *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น ตามหา Nike SB Dunk Jarritos US 9.5"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">หมวดหมู่</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 text-sm"
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">งบประมาณ (บาท)</label>
                <input
                  type="number"
                  required
                  min={500}
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                สภาพที่ต้องการ / ข้อกำหนด
              </label>
              <input
                type="text"
                value={desiredCondition}
                onChange={(e) => setDesiredCondition(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                URL ภาพอ้างอิงสินค้า
              </label>
              <input
                type="url"
                value={referenceImage}
                onChange={(e) => setReferenceImage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">รายละเอียดเพิ่มเติม</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุไซส์ สี อุปกรณ์ที่ต้องการ หรือเงื่อนไขการตรวจ Verify..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 rounded-xl border border-stoneBorder text-sm font-semibold text-mutedInk hover:text-ink"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-vermilion hover:bg-vermilion-hover text-white text-sm font-semibold"
            >
              โพสต์ประกาศตามหา
            </button>
          </div>
        </form>
      )}

      {/* Wanted Listings Feed */}
      <div className="space-y-6">
        {wantedListings.map((listing) => (
          <section
            key={listing.id}
            className="rounded-2xl bg-paper border border-stoneBorder p-5 sm:p-6 space-y-5"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-5">
              <SafeImage
                src={listing.referenceImage}
                alt={listing.title}
                className="w-full md:w-44 h-36 rounded-xl object-cover shrink-0 border border-stoneBorder"
              />

              <div className="flex-1 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full bg-sand text-xs font-semibold text-mutedInk">
                      {CATEGORY_LABELS[listing.category]}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        listing.status === 'open'
                          ? 'bg-emeraldSeal-soft text-emeraldSeal'
                          : 'bg-escrowBlue-soft text-escrowBlue'
                      }`}
                    >
                      {listing.status === 'open' ? 'เปิดรับข้อเสนอ' : 'เลือกข้อเสนอแล้ว (เข้า Escrow)'}
                    </span>
                  </div>
                  <span className="text-xs text-mutedInk">
                    โพสต์เมื่อ {formatThaiDateTime(listing.createdAt)}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-ink">{listing.title}</h2>
                <p className="text-sm text-mutedInk leading-relaxed">{listing.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stoneBorder">
                  <div className="flex flex-wrap gap-6 text-xs">
                    <div>
                      <span className="text-mutedInk block">งบประมาณตั้งเป้า</span>
                      <span className="text-base font-bold font-mono text-vermilion">
                        {formatTHB(listing.targetBudget)}
                      </span>
                    </div>
                    <div>
                      <span className="text-mutedInk block">สภาพที่ต้องการ</span>
                      <span className="font-semibold text-ink">{listing.desiredCondition}</span>
                    </div>
                    <div>
                      <span className="text-mutedInk block">ผู้ตามหา</span>
                      <span className="font-semibold text-ink">{listing.buyerName}</span>
                    </div>
                  </div>

                  {listing.status === 'open' && (
                    <button
                      type="button"
                      onClick={() =>
                        offeringForId === listing.id
                          ? setOfferingForId(null)
                          : openOfferForm(listing)
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-ink hover:bg-ink/90 text-white text-xs font-semibold transition-colors"
                    >
                      <MessageSquarePlus className="w-4 h-4" />
                      <span>
                        {offeringForId === listing.id ? 'ปิดฟอร์มข้อเสนอ' : 'ส่งข้อเสนอขายสินค้า'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Inline Submit Offer Form */}
            {offeringForId === listing.id && listing.status === 'open' && (
              <form
                onSubmit={(e) => handleSubmitOffer(e, listing.id)}
                className="rounded-xl bg-ivory border border-stoneBorder p-4 space-y-3"
              >
                <p className="text-xs font-bold text-ink">
                  ส่งข้อเสนอของคุณให้ {listing.buyerName}
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-mutedInk mb-1">
                      ราคาที่เสนอขาย (บาท)
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stoneBorder bg-white font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-mutedInk mb-1">
                      สภาพสินค้าจริง
                    </label>
                    <input
                      type="text"
                      required
                      value={offerCondition}
                      onChange={(e) => setOfferCondition(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stoneBorder bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-mutedInk mb-1">
                      URL ภาพสินค้าจริง
                    </label>
                    <input
                      type="url"
                      value={offerImage}
                      onChange={(e) => setOfferImage(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stoneBorder bg-white font-mono text-xs"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <input
                    type="text"
                    required
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    placeholder="ข้อความถึงผู้ซื้อ..."
                    className="flex-1 px-3 py-2 rounded-lg border border-stoneBorder bg-white text-xs"
                  />
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-emeraldSeal cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={offerVerified}
                      onChange={(e) => setOfferVerified(e.target.checked)}
                      className="accent-emeraldSeal"
                    />
                    <span>แนบใบรับรอง SomJing Verified</span>
                  </label>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-vermilion hover:bg-vermilion-hover text-white text-xs font-semibold shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ยืนยันส่งข้อเสนอ</span>
                  </button>
                </div>
              </form>
            )}

            {/* Competing Offers List */}
            <div className="space-y-3 pt-2 border-t border-stoneBorder">
              <p className="text-xs font-bold text-ink">
                ข้อเสนอจากผู้ขาย ({listing.offers.length} รายการ)
              </p>

              {listing.offers.length === 0 ? (
                <div className="rounded-xl bg-ivory p-4 text-xs text-mutedInk text-center">
                  ยังไม่มีผู้ขายยื่นข้อเสนอ — กดปุ่ม &ldquo;ส่งข้อเสนอขายสินค้า&rdquo; ด้านบนเพื่อทดสอบยื่นข้อเสนอแรก
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {listing.offers.map((offer) => (
                    <div
                      key={offer.id}
                      className={`rounded-xl border p-4 flex flex-col justify-between gap-3 ${
                        offer.status === 'accepted'
                          ? 'border-emeraldSeal bg-emeraldSeal-soft/40'
                          : 'border-stoneBorder bg-ivory/60'
                      }`}
                    >
                      <div className="flex gap-3">
                        <SafeImage
                          src={offer.image}
                          alt={offer.sellerName}
                          className="w-16 h-16 rounded-lg object-cover shrink-0 border border-stoneBorder"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-xs font-bold text-ink">{offer.sellerName}</span>
                            <VerificationBadge
                              status={offer.isVerifiedItem ? 'verified' : 'unverified'}
                              certificateId={offer.certificateId}
                              compact
                            />
                          </div>
                          <p className="text-base font-bold font-mono text-vermilion">
                            {formatTHB(offer.price)}
                          </p>
                          <p className="text-[11px] font-medium text-ink">{offer.condition}</p>
                        </div>
                      </div>

                      <p className="text-xs text-mutedInk leading-relaxed">{offer.message}</p>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-stoneBorder/70">
                        <span className="text-[11px] text-mutedInk">
                          {formatThaiDateTime(offer.createdAt)}
                        </span>

                        {offer.status === 'accepted' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emeraldSeal">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>เลือกข้อเสนอนี้แล้ว</span>
                          </span>
                        ) : offer.status === 'declined' ? (
                          <span className="text-xs text-mutedInk">ไม่ได้รับเลือก</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAcceptOffer(listing, offer)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-vermilion hover:bg-vermilion-hover text-white text-xs font-semibold transition-colors"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>เลือกข้อเสนอ &amp; ชำระ Escrow</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
