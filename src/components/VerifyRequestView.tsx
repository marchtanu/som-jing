import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';
import { CATEGORY_LABELS, formatThaiDateTime } from '../utils/format';
import { SafeImage, VerificationBadge } from './ui';

export const VerifyRequestView: React.FC = () => {
  const {
    products,
    verificationRequests,
    submitVerificationRequest,
    currentUser,
    setAuthModalOpen,
  } = useStore();

  const eligibleProducts = products.filter(
    (p) =>
      (p.verificationStatus === 'unverified' || p.verificationStatus === 'rejected') &&
      (!currentUser || p.sellerId === currentUser.id)
  );

  const [mode, setMode] = useState<'existing' | 'standalone'>(
    eligibleProducts.length > 0 ? 'existing' : 'standalone'
  );
  const [selectedProductId, setSelectedProductId] = useState<string>(
    eligibleProducts[0]?.id ?? ''
  );
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState<ProductCategory>('sneakers');
  const [customImage, setCustomImage] = useState(
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80'
  );
  const [serialNumber, setSerialNumber] = useState('SN-AUTH-2026-441');
  const [purchaseProofNote, setPurchaseProofNote] = useState(
    'แนบภาพถ่ายจุดสังเกตความแท้ (Tag, Stitch, กล่อง, ใบเสร็จร้านตัวแทนจำหน่ายทางการ)'
  );
  const [evidenceImageUrl, setEvidenceImageUrl] = useState(
    'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=900&q=80'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'existing' && selectedProductId) {
      const target = products.find((p) => p.id === selectedProductId);
      if (!target) return;
      submitVerificationRequest({
        productId: target.id,
        productTitle: target.title,
        productImage: target.images[0],
        category: target.category,
        serialNumber: serialNumber.trim(),
        purchaseProofNote: purchaseProofNote.trim(),
        evidenceImageUrl: evidenceImageUrl.trim(),
      });
    } else {
      if (!customTitle.trim()) return;
      submitVerificationRequest({
        productTitle: customTitle.trim(),
        productImage: customImage.trim(),
        category: customCategory,
        serialNumber: serialNumber.trim(),
        purchaseProofNote: purchaseProofNote.trim(),
        evidenceImageUrl: evidenceImageUrl.trim(),
      });
      setCustomTitle('');
    }
  };

  if (currentUser?.role !== 'seller') {
    return (
      <div className="bg-soft-cloud border border-hairline p-12 text-center space-y-4 max-w-xl mx-auto my-8 animate-view-in">
        <h1 className="text-2xl font-medium text-ink">
          สำหรับบัญชีผู้ขายเท่านั้น (Seller Account Only)
        </h1>
        <p className="text-sm text-charcoal leading-relaxed">
          เฉพาะผู้ขายเท่านั้นที่สามารถส่งคำขอตรวจรับรองความแท้ (Verify) ให้สินค้าของตนเองได้
          กรุณาเข้าสู่ระบบด้วยบัญชีผู้ขาย (`seller@somjing.com`)
        </p>
        <button
          type="button"
          onClick={() => setAuthModalOpen(true)}
          className="btn-primary h-11 px-6 text-sm"
        >
          เปิดหน้าจัดการบัญชี / Sign In
        </button>
      </div>
    );
  }

  const myRequests = verificationRequests.filter((r) => r.sellerId === currentUser.id);

  return (
    <div className="space-y-12 animate-view-in">
      <div className="pb-6 border-b border-hairline">
        <h1 className="text-[32px] font-medium leading-[1.2] text-ink">
          ขอรับรองความแท้ (SomJing Verification)
        </h1>
        <p className="text-base text-mute mt-1">
          ส่ง Serial Number และหลักฐานภาพถ่ายให้ผู้เชี่ยวชาญตรวจสอบเพื่อรับตรา SomJing Verified Badge
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        <form onSubmit={handleSubmit} className="lg:col-span-5 space-y-5">
          <h2 className="text-xl font-medium text-ink">ส่งคำขอ Verify สินค้า</h2>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('existing')}
              className={
                mode === 'existing'
                  ? 'filter-chip-active flex-1 justify-center'
                  : 'filter-chip flex-1 justify-center'
              }
            >
              จากสินค้าที่ลงขาย
            </button>
            <button
              type="button"
              onClick={() => setMode('standalone')}
              className={
                mode === 'standalone'
                  ? 'filter-chip-active flex-1 justify-center'
                  : 'filter-chip flex-1 justify-center'
              }
            >
              ระบุสินค้าใหม่
            </button>
          </div>

          {mode === 'existing' ? (
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                เลือกสินค้าที่ยังไม่มี Verified Badge
              </label>
              {eligibleProducts.length === 0 ? (
                <div className="bg-soft-cloud p-4 text-sm text-mute">
                  ไม่มีสินค้าของคุณที่รอ Verify — คุณสามารถเลือกโหมด &ldquo;ระบุสินค้าใหม่&rdquo; เพื่อส่งคำขอได้
                </div>
              ) : (
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="hairline-input w-full"
                >
                  {eligibleProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  ชื่อสินค้าที่ต้องการตรวจความแท้ *
                </label>
                <input
                  type="text"
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="เช่น Rolex Datejust 36 Blue Dial / Labubu Secret"
                  className="hairline-input w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-mute mb-1.5">หมวดหมู่</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as ProductCategory)}
                    className="hairline-input w-full text-xs"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-mute mb-1.5">URL ภาพสินค้า</label>
                  <input
                    type="url"
                    value={customImage}
                    onChange={(e) => setCustomImage(e.target.value)}
                    className="hairline-input w-full font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Serial Number / รหัสอ้างอิง *
            </label>
            <input
              type="text"
              required
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className="hairline-input w-full font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              URL ภาพหลักฐานจุดสังเกต / ใบเสร็จ
            </label>
            <input
              type="url"
              value={evidenceImageUrl}
              onChange={(e) => setEvidenceImageUrl(e.target.value)}
              className="hairline-input w-full font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              คำอธิบายหลักฐานและแหล่งที่มา
            </label>
            <textarea
              rows={3}
              required
              value={purchaseProofNote}
              onChange={(e) => setPurchaseProofNote(e.target.value)}
              className="hairline-input w-full"
            />
          </div>

          <button
            type="submit"
            disabled={mode === 'existing' && eligibleProducts.length === 0}
            className="btn-primary w-full"
          >
            ส่งคำขอรับรองความแท้ (Submit Verification)
          </button>
        </form>

        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xl font-medium text-ink">
            คำขอ Verify ของฉัน ({myRequests.length})
          </h2>

          <div className="divide-y divide-hairline border-t border-b border-hairline">
            {myRequests.map((req) => (
              <div key={req.id} className="py-6 flex flex-col sm:flex-row gap-5">
                <SafeImage
                  src={req.productImage}
                  alt={req.productTitle}
                  className="w-28 h-28 bg-soft-cloud object-cover shrink-0 rounded-none"
                />

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-xs font-medium text-mute">
                        {CATEGORY_LABELS[req.category]} · {req.sellerName}
                      </p>
                      <h3 className="text-base font-medium text-ink mt-0.5">{req.productTitle}</h3>
                    </div>

                    <VerificationBadge
                      status={
                        req.status === 'approved'
                          ? 'verified'
                          : req.status === 'pending'
                            ? 'pending'
                            : 'rejected'
                      }
                      certificateId={req.certificateId}
                    />
                  </div>

                  <p className="text-sm text-charcoal leading-relaxed">{req.purchaseProofNote}</p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-mute">
                    <span>
                      Serial: <strong className="font-mono text-ink">{req.serialNumber}</strong>
                    </span>
                    <span>ส่งเมื่อ: {formatThaiDateTime(req.submittedAt)}</span>
                  </div>

                  {req.reviewerNote && (
                    <p className="text-xs text-ink bg-soft-cloud p-3 flex items-start gap-2">
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          req.status === 'approved' ? 'text-success' : 'text-sale'
                        }`}
                      />
                      <span>
                        <strong>ความเห็นผู้ตรวจสอบ:</strong> {req.reviewerNote}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
