import React, { useState } from 'react';
import { CheckCircle2, Lock, MessageSquarePlus, Plus, Send } from 'lucide-react';
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

  const [offeringForId, setOfferingForId] = useState<string | null>(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerCondition, setOfferCondition] = useState('ของแท้สภาพ 99% ครบกล่อง');
  const [offerVerified, setOfferVerified] = useState(true);
  const [offerMessage, setOfferMessage] = useState('');
  const [offerImage, setOfferImage] = useState(
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=900&q=80'
  );

  const isAdmin = currentUser?.role === 'admin';

  const handleCreateWanted = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const res = createWantedListing({
      title: title.trim(),
      category,
      targetBudget: Math.max(500, Number(targetBudget) || 5000),
      desiredCondition: desiredCondition.trim(),
      description: description.trim() || 'ต้องการสินค้าแท้ พร้อมทำรายการผ่านระบบ Escrow',
      referenceImage: referenceImage.trim(),
    });
    if (res.ok) {
      setTitle('');
      setDescription('');
      setShowCreateForm(false);
    }
  };

  const openOfferForm = (listing: WantedListing) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setOfferingForId(listing.id);
    setOfferPrice(String(Math.max(500, listing.targetBudget - 500)));
    setOfferMessage(`มีสินค้าตรงรุ่นตามที่คุณ ${listing.buyerName} ตามหาครับ พร้อมส่งทันทีผ่าน Escrow`);
  };

  const handleSubmitOffer = (e: React.FormEvent, wantedId: string) => {
    e.preventDefault();
    const res = submitWantedOffer({
      wantedId,
      price: Math.max(100, Number(offerPrice) || 1000),
      condition: offerCondition.trim(),
      isVerifiedItem: offerVerified,
      message: offerMessage.trim(),
      image: offerImage.trim(),
    });
    if (res.ok) {
      setOfferingForId(null);
    }
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
      selectedOptionLabel: offer.condition,
      amount: offer.price,
      sellerId: offer.sellerId,
      sellerName: offer.sellerName,
      isVerifiedItem: offer.isVerifiedItem,
      certificateId: offer.certificateId,
    });
  };

  return (
    <div className="space-y-12 animate-view-in">
      <div className="pb-6 border-b border-hairline flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-medium leading-[1.2] text-ink">
            Wanted Listing &amp; Offers
          </h1>
          <p className="text-base text-mute mt-1">
            สร้างประกาศตามหาของสะสมพร้อมงบประมาณ → ผู้ขายยื่นข้อเสนอ → เจ้าของประกาศเลือกข้อเสนอและชำระเข้า Escrow
          </p>
        </div>
        {!isAdmin && (
          <button
            type="button"
            onClick={() => {
              if (!currentUser) {
                setAuthModalOpen(true);
                return;
              }
              setShowCreateForm((v) => !v);
            }}
            className="btn-primary shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{showCreateForm ? 'ปิดฟอร์ม' : 'สร้าง Wanted Listing'}</span>
          </button>
        )}
      </div>

      {/* Create Wanted Listing Form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateWanted}
          className="bg-soft-cloud p-6 sm:p-8 space-y-5 animate-fade-in"
        >
          <h2 className="text-xl font-medium text-ink">
            สร้างประกาศตามหาสินค้า (Reverse Marketplace)
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                สินค้าที่ต้องการตามหา *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น ตามหา Nike SB Dunk Jarritos US 9.5"
                className="hairline-input w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">หมวดหมู่</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="hairline-input w-full"
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">งบประมาณ (บาท)</label>
                <input
                  type="number"
                  required
                  min={500}
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(e.target.value)}
                  className="hairline-input w-full font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                สภาพที่ต้องการ / ข้อกำหนด
              </label>
              <input
                type="text"
                value={desiredCondition}
                onChange={(e) => setDesiredCondition(e.target.value)}
                className="hairline-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                URL ภาพอ้างอิงสินค้า
              </label>
              <input
                type="url"
                value={referenceImage}
                onChange={(e) => setReferenceImage(e.target.value)}
                className="hairline-input w-full font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">รายละเอียดเพิ่มเติม</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุไซส์ สี อุปกรณ์ที่ต้องการ หรือเงื่อนไขการตรวจ Verify..."
              className="hairline-input w-full"
            />
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="btn-secondary bg-canvas"
            >
              ยกเลิก
            </button>
            <button type="submit" className="btn-primary">
              โพสต์ประกาศตามหา
            </button>
          </div>
        </form>
      )}

      {/* Wanted Listings Feed */}
      <div className="divide-y divide-hairline border-b border-hairline">
        {wantedListings.map((listing) => {
          const isOwner = currentUser?.id === listing.buyerId;
          const canOffer = listing.status === 'open' && !isOwner && !isAdmin;

          return (
            <section key={listing.id} className="py-8 first:pt-0 space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <SafeImage
                  src={listing.referenceImage}
                  alt={listing.title}
                  className="w-full md:w-52 aspect-square bg-soft-cloud object-cover shrink-0 rounded-none"
                />

                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="badge-promo">{CATEGORY_LABELS[listing.category]}</span>
                      <span
                        className={`text-xs font-medium ${
                          listing.status === 'open' ? 'text-success' : 'text-mute'
                        }`}
                      >
                        {listing.status === 'open'
                          ? 'Open for Offers'
                          : 'Offer Selected · Escrow Created'}
                      </span>
                      {isOwner && <span className="badge-promo">ประกาศของคุณ</span>}
                    </div>
                    <span className="text-xs text-mute">
                      {formatThaiDateTime(listing.createdAt)}
                    </span>
                  </div>

                  <h2 className="text-2xl font-medium text-ink leading-[1.2]">{listing.title}</h2>
                  <p className="text-base text-charcoal leading-relaxed">{listing.description}</p>

                  <div className="flex flex-wrap items-end justify-between gap-4 pt-3">
                    <div className="flex flex-wrap gap-8 text-sm">
                      <div>
                        <span className="text-xs text-mute block">Target Budget</span>
                        <span className="text-xl font-medium font-mono text-ink tabular-nums">
                          {formatTHB(listing.targetBudget)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-mute block">Desired Condition</span>
                        <span className="font-medium text-ink">{listing.desiredCondition}</span>
                      </div>
                      <div>
                        <span className="text-xs text-mute block">Buyer</span>
                        <span className="font-medium text-ink">{listing.buyerName}</span>
                      </div>
                    </div>

                    {canOffer && (
                      <button
                        type="button"
                        onClick={() =>
                          offeringForId === listing.id
                            ? setOfferingForId(null)
                            : openOfferForm(listing)
                        }
                        className="btn-secondary"
                      >
                        <MessageSquarePlus className="w-4 h-4" />
                        <span>
                          {offeringForId === listing.id ? 'ปิดฟอร์มข้อเสนอ' : 'ส่งข้อเสนอขาย'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Inline Submit Offer Form */}
              {offeringForId === listing.id && canOffer && (
                <form
                  onSubmit={(e) => handleSubmitOffer(e, listing.id)}
                  className="bg-soft-cloud p-6 space-y-4 animate-fade-in"
                >
                  <p className="text-sm font-medium text-ink">
                    ส่งข้อเสนอของคุณให้ {listing.buyerName}
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-mute mb-1.5">
                        ราคาที่เสนอขาย (บาท)
                      </label>
                      <input
                        type="number"
                        required
                        min={100}
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        className="hairline-input w-full font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-mute mb-1.5">
                        สภาพสินค้าจริง
                      </label>
                      <input
                        type="text"
                        required
                        value={offerCondition}
                        onChange={(e) => setOfferCondition(e.target.value)}
                        className="hairline-input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-mute mb-1.5">
                        URL ภาพสินค้าจริง
                      </label>
                      <input
                        type="url"
                        value={offerImage}
                        onChange={(e) => setOfferImage(e.target.value)}
                        className="hairline-input w-full font-mono text-xs"
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
                      className="hairline-input flex-1"
                    />
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-ink cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={offerVerified}
                        onChange={(e) => setOfferVerified(e.target.checked)}
                        className="accent-ink"
                      />
                      <span>แนบใบรับรอง SomJing Verified</span>
                    </label>
                    <button type="submit" className="btn-primary shrink-0">
                      <Send className="w-4 h-4" />
                      <span>ยืนยันส่งข้อเสนอ</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Competing Offers Grid */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-ink">
                  ข้อเสนอจากผู้ขาย ({listing.offers.length} รายการ)
                </p>

                {listing.offers.length === 0 ? (
                  <div className="bg-soft-cloud p-6 text-sm text-mute text-center">
                    ยังไม่มีผู้ขายยื่นข้อเสนอสำหรับรายการนี้
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {listing.offers.map((offer) => (
                      <div
                        key={offer.id}
                        className={`border p-5 flex flex-col justify-between gap-4 ${
                          offer.status === 'accepted'
                            ? 'border-ink bg-soft-cloud'
                            : 'border-hairline bg-canvas'
                        }`}
                      >
                        <div className="flex gap-4">
                          <SafeImage
                            src={offer.image}
                            alt={offer.sellerName}
                            className="w-20 h-20 bg-soft-cloud object-cover shrink-0 rounded-none"
                          />
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-sm font-medium text-ink">
                                {offer.sellerName}
                              </span>
                              <VerificationBadge
                                status={offer.isVerifiedItem ? 'verified' : 'unverified'}
                                certificateId={offer.certificateId}
                                compact
                              />
                            </div>
                            <p className="text-lg font-medium font-mono text-ink tabular-nums">
                              {formatTHB(offer.price)}
                            </p>
                            <p className="text-xs text-mute">{offer.condition}</p>
                          </div>
                        </div>

                        <p className="text-sm text-charcoal leading-relaxed">{offer.message}</p>

                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-hairline-soft">
                          <span className="text-xs text-mute">
                            {formatThaiDateTime(offer.createdAt)}
                          </span>

                          {offer.status === 'accepted' ? (
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>เลือกข้อเสนอนี้แล้ว</span>
                            </span>
                          ) : offer.status === 'declined' ? (
                            <span className="text-xs text-mute">ไม่ได้รับเลือก</span>
                          ) : isOwner ? (
                            <button
                              type="button"
                              onClick={() => handleAcceptOffer(listing, offer)}
                              className="btn-primary h-10 px-5 text-sm"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>เลือกข้อเสนอ &amp; ชำระ Escrow</span>
                            </button>
                          ) : (
                            <span className="text-xs text-mute">
                              รอ {listing.buyerName} พิจารณาข้อเสนอ
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
