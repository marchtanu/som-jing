import React, { useState } from 'react';
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  FileCheck2,
  ShieldAlert,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';
import { CATEGORY_LABELS, formatThaiDateTime } from '../utils/format';
import { SafeImage, VerificationBadge } from './ui';

export const VerifyRequestView: React.FC = () => {
  const {
    products,
    verificationRequests,
    submitVerificationRequest,
    setActiveTab,
    switchDemoRole,
  } = useStore();

  const eligibleProducts = products.filter(
    (p) => p.verificationStatus === 'unverified' || p.verificationStatus === 'rejected'
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            ระบบขอรับรองความแท้ (SomJing Verification)
          </h1>
          <p className="text-sm text-mutedInk mt-1">
            ส่งข้อมูล Serial Number และหลักฐานภาพถ่ายให้ผู้เชี่ยวชาญตรวจสอบเพื่อรับตรา SomJing Verified Badge
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            switchDemoRole('admin');
            setActiveTab('admin');
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink text-white text-xs font-semibold hover:bg-ink/90 shrink-0"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>สลับเป็นแอดมินเพื่อกดอนุมัติ Verify</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Submission Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 rounded-2xl bg-paper border border-stoneBorder p-6 space-y-5"
        >
          <h2 className="text-base font-bold text-ink inline-flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-emeraldSeal" />
            <span>ส่งคำขอ Verify สินค้า</span>
          </h2>

          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-sand">
            <button
              type="button"
              onClick={() => setMode('existing')}
              className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                mode === 'existing' ? 'bg-paper text-ink shadow-sm' : 'text-mutedInk'
              }`}
            >
              เลือกจากสินค้าที่ลงขาย
            </button>
            <button
              type="button"
              onClick={() => setMode('standalone')}
              className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                mode === 'standalone' ? 'bg-paper text-ink shadow-sm' : 'text-mutedInk'
              }`}
            >
              ระบุสินค้าใหม่ (ทั่วไป)
            </button>
          </div>

          {mode === 'existing' ? (
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                เลือกสินค้าที่ยังไม่มี Verified Badge
              </label>
              {eligibleProducts.length === 0 ? (
                <div className="rounded-xl bg-sand p-3 text-xs text-mutedInk">
                  สินค้าทั้งหมดถูกส่งตรวจหรือผ่าน Verify แล้ว — คุณสามารถเลือกโหมด &ldquo;ระบุสินค้าใหม่&rdquo; เพื่อทดสอบเพิ่มเติมได้
                </div>
              ) : (
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 text-sm"
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
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  ชื่อสินค้าที่ต้องการตรวจความแท้ *
                </label>
                <input
                  type="text"
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="เช่น Rolex Datejust 36 Blue Dial / Labubu Secret"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">หมวดหมู่</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-stoneBorder bg-ivory/70 text-xs"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">URL ภาพสินค้า</label>
                  <input
                    type="url"
                    value={customImage}
                    onChange={(e) => setCustomImage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stoneBorder bg-ivory/70 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Serial Number / รหัสอ้างอิงบนสินค้า *
            </label>
            <input
              type="text"
              required
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              URL ภาพหลักฐานจุดสังเกต / ใบเสร็จ (จำลองการอัปโหลด)
            </label>
            <div className="relative">
              <Upload className="w-4 h-4 text-mutedInk absolute left-3 top-3" />
              <input
                type="url"
                value={evidenceImageUrl}
                onChange={(e) => setEvidenceImageUrl(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              คำอธิบายหลักฐานและแหล่งที่มา
            </label>
            <textarea
              rows={3}
              required
              value={purchaseProofNote}
              onChange={(e) => setPurchaseProofNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={mode === 'existing' && eligibleProducts.length === 0}
            className="w-full py-3 rounded-xl bg-emeraldSeal hover:opacity-95 disabled:opacity-50 text-white font-semibold text-sm transition-opacity inline-flex items-center justify-center gap-2"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>ส่งคำขอรับรองความแท้ (Submit Verification)</span>
          </button>
        </form>

        {/* Verification Status History */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-base font-bold text-ink">
            สถานะคำขอ Verify ทั้งหมด ({verificationRequests.length})
          </h2>

          <div className="space-y-3">
            {verificationRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl bg-paper border border-stoneBorder p-4 sm:p-5 flex flex-col sm:flex-row gap-4"
              >
                <SafeImage
                  src={req.productImage}
                  alt={req.productTitle}
                  className="w-full sm:w-28 h-28 rounded-xl object-cover shrink-0 border border-stoneBorder"
                />

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <span className="text-[11px] font-semibold text-mutedInk">
                        {CATEGORY_LABELS[req.category]} • ผู้ส่ง: {req.sellerName}
                      </span>
                      <h3 className="text-sm font-bold text-ink">{req.productTitle}</h3>
                    </div>

                    {req.status === 'approved' ? (
                      <VerificationBadge status="verified" certificateId={req.certificateId} />
                    ) : req.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-800">
                        <Clock className="w-3.5 h-3.5" />
                        <span>รอแอดมินตรวจสอบ</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-700">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>ไม่ผ่านการตรวจ</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-mutedInk leading-relaxed">{req.purchaseProofNote}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-mutedInk pt-1">
                    <span>
                      Serial: <strong className="font-mono text-ink">{req.serialNumber}</strong>
                    </span>
                    <span>ส่งเมื่อ: {formatThaiDateTime(req.submittedAt)}</span>
                  </div>

                  {req.reviewerNote && (
                    <div className="rounded-xl bg-ivory border border-stoneBorder px-3 py-2 text-xs flex items-start gap-2">
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          req.status === 'approved' ? 'text-emeraldSeal' : 'text-rose-600'
                        }`}
                      />
                      <span className="text-ink">
                        <strong>ความเห็นผู้ตรวจสอบ:</strong> {req.reviewerNote}
                      </span>
                    </div>
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
