import React, { useState } from 'react';
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Scale,
  Shield,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CATEGORY_LABELS, formatTHB, formatThaiDateTime } from '../utils/format';
import { SafeImage, VerificationBadge } from './ui';

export const AdminView: React.FC = () => {
  const {
    verificationRequests,
    reviewVerificationRequest,
    complaints,
    resolveComplaint,
    escrowOrders,
    currentUser,
    switchDemoRole,
  } = useStore();

  const [verifyNotes, setVerifyNotes] = useState<Record<string, string>>({});
  const [complaintNotes, setComplaintNotes] = useState<Record<string, string>>({});

  const pendingVerifications = verificationRequests.filter((r) => r.status === 'pending');
  const reviewedVerifications = verificationRequests.filter((r) => r.status !== 'pending');
  const pendingComplaints = complaints.filter((c) => c.status === 'pending');
  const resolvedComplaints = complaints.filter((c) => c.status !== 'pending');

  const activeEscrowVolume = escrowOrders
    .filter((o) => o.status !== 'released' && o.status !== 'refunded')
    .reduce((acc, o) => acc + o.totalPaid, 0);

  return (
    <div className="space-y-8">
      {/* Header & Role Notice */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            ศูนย์ควบคุมผู้ดูแลระบบ (Admin Verification &amp; Disputes)
          </h1>
          <p className="text-sm text-mutedInk mt-1">
            ตรวจสอบหลักฐานและอนุมัติ Verified Badge พร้อมพิจารณาข้อร้องเรียนเพื่อตัดสินปล่อยเงินหรือคืนเงินจากบัญชี Escrow
          </p>
        </div>

        {currentUser?.role !== 'admin' && (
          <button
            type="button"
            onClick={() => switchDemoRole('admin')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-vermilion text-white text-xs font-semibold hover:bg-vermilion-hover shrink-0"
          >
            <Shield className="w-4 h-4" />
            <span>สลับบัญชีเป็น Admin (ปัจจุบัน: {currentUser?.role ?? 'Guest'})</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-paper border border-stoneBorder p-5">
          <p className="text-xs font-semibold text-mutedInk">คำขอ Verify รออนุมัติ</p>
          <p className="text-3xl font-bold font-mono text-ink mt-1 tabular-nums">
            {pendingVerifications.length}
          </p>
          <p className="text-xs text-emeraldSeal mt-1">
            อนุมัติแล้วทั้งหมด {reviewedVerifications.filter((r) => r.status === 'approved').length} รายการ
          </p>
        </div>

        <div className="rounded-2xl bg-paper border border-stoneBorder p-5">
          <p className="text-xs font-semibold text-mutedInk">ข้อร้องเรียนรอดำเนินการ</p>
          <p className="text-3xl font-bold font-mono text-vermilion mt-1 tabular-nums">
            {pendingComplaints.length}
          </p>
          <p className="text-xs text-mutedInk mt-1">
            ปิดเคสแล้ว {resolvedComplaints.length} เคส
          </p>
        </div>

        <div className="rounded-2xl bg-paper border border-stoneBorder p-5">
          <p className="text-xs font-semibold text-mutedInk">มูลค่าเงินที่พักในระบบ Escrow</p>
          <p className="text-3xl font-bold font-mono text-escrowBlue mt-1 tabular-nums">
            {formatTHB(activeEscrowVolume)}
          </p>
          <p className="text-xs text-mutedInk mt-1">คุ้มครองคำสั่งซื้อทั้งหมด {escrowOrders.length} รายการ</p>
        </div>
      </div>

      {/* Section 1: Verification Approval Queue */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink inline-flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-emeraldSeal" />
            <span>คิวตรวจสอบและอนุมัติ Verified Badge ({pendingVerifications.length} รอตรวจ)</span>
          </h2>
        </div>

        {pendingVerifications.length === 0 ? (
          <div className="rounded-2xl bg-paper border border-stoneBorder p-8 text-center text-sm text-mutedInk">
            ไม่มีคำขอ Verify ที่ค้างอยู่ — คุณสามารถส่งคำขอใหม่ได้จากหน้า &ldquo;ขอ Verify&rdquo; หรือ &ldquo;ลงขายสินค้า&rdquo;
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {pendingVerifications.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl bg-paper border border-stoneBorder p-5 space-y-4"
              >
                <div className="flex gap-4">
                  <SafeImage
                    src={req.productImage}
                    alt={req.productTitle}
                    className="w-24 h-24 rounded-xl object-cover shrink-0 border border-stoneBorder"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[11px] font-semibold text-mutedInk">
                      {CATEGORY_LABELS[req.category]} • ผู้ยื่น: {req.sellerName}
                    </span>
                    <h3 className="text-sm font-bold text-ink leading-snug">{req.productTitle}</h3>
                    <p className="text-xs text-mutedInk">
                      Serial: <strong className="font-mono text-ink">{req.serialNumber}</strong>
                    </p>
                    <p className="text-[11px] text-mutedInk">
                      ยื่นเมื่อ: {formatThaiDateTime(req.submittedAt)}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-ivory border border-stoneBorder p-3 text-xs text-ink leading-relaxed">
                  <strong>หลักฐานจากผู้ขาย:</strong> {req.purchaseProofNote}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-mutedInk mb-1">
                    บันทึกความเห็นผู้ตรวจสอบ (แสดงในใบรับรอง)
                  </label>
                  <input
                    type="text"
                    value={verifyNotes[req.id] ?? ''}
                    onChange={(e) =>
                      setVerifyNotes((prev) => ({ ...prev, [req.id]: e.target.value }))
                    }
                    placeholder="เช่น ตรวจเลข Serial ตรงฐานข้อมูลและจุดสังเกตของแท้ครบถ้วน"
                    className="w-full px-3 py-2 rounded-lg border border-stoneBorder bg-ivory/70 text-xs"
                  />
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      reviewVerificationRequest(req.id, 'approved', verifyNotes[req.id] ?? '')
                    }
                    className="flex-1 py-2.5 rounded-xl bg-emeraldSeal hover:opacity-95 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>อนุมัติ Verified Badge</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      reviewVerificationRequest(req.id, 'rejected', verifyNotes[req.id] ?? '')
                    }
                    className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>ไม่อนุมัติ</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {reviewedVerifications.length > 0 && (
          <div className="rounded-2xl bg-paper border border-stoneBorder p-5 space-y-3">
            <h3 className="text-sm font-bold text-ink">ประวัติการตรวจ Verify ล่าสุด</h3>
            <div className="divide-y divide-stoneBorder">
              {reviewedVerifications.map((req) => (
                <div
                  key={req.id}
                  className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <p className="font-semibold text-ink">{req.productTitle}</p>
                    <p className="text-[11px] text-mutedInk">
                      ผู้ยื่น: {req.sellerName} • {req.reviewerNote}
                    </p>
                  </div>
                  <VerificationBadge
                    status={req.status === 'approved' ? 'verified' : 'rejected'}
                    certificateId={req.certificateId}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Section 2: Complaints & Disputes */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-ink inline-flex items-center gap-2">
          <Scale className="w-5 h-5 text-vermilion" />
          <span>ข้อร้องเรียนและข้อพิพาท Escrow ({pendingComplaints.length} เคสเปิดอยู่)</span>
        </h2>

        <div className="space-y-4">
          {complaints.map((cmp) => (
            <div
              key={cmp.id}
              className="rounded-2xl bg-paper border border-stoneBorder p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stoneBorder">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-ink text-white">
                    {cmp.caseNumber}
                  </span>
                  <span className="font-mono text-xs text-mutedInk">
                    Order: {cmp.orderNumber}
                  </span>
                  {cmp.status === 'pending' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>รอแอดมินพิจารณา</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emeraldSeal-soft border border-emeraldSeal/25 text-emeraldSeal text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {cmp.status === 'resolved_refund'
                          ? 'ปิดเคส: คืนเงินผู้ซื้อแล้ว'
                          : 'ปิดเคส: ปล่อยเงินให้ผู้ขายแล้ว'}
                      </span>
                    </span>
                  )}
                </div>

                <span className="text-sm font-mono font-bold text-vermilion">
                  ยอดพักใน Escrow: {formatTHB(cmp.amountInEscrow)}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <p className="text-sm font-bold text-ink">{cmp.productTitle}</p>
                <p className="text-mutedInk">
                  ผู้ร้องเรียน: <strong className="text-ink">{cmp.reporterName}</strong> • คู่กรณี:{' '}
                  <strong className="text-ink">{cmp.accusedName}</strong> • แจ้งเมื่อ{' '}
                  {formatThaiDateTime(cmp.createdAt)}
                </p>
                <div className="rounded-xl bg-ivory border border-stoneBorder p-3.5 mt-2 space-y-1">
                  <p className="font-bold text-rose-700">หัวข้อ: {cmp.reason}</p>
                  <p className="text-ink leading-relaxed">{cmp.description}</p>
                </div>
              </div>

              {cmp.status === 'pending' ? (
                <div className="space-y-3 pt-2">
                  <input
                    type="text"
                    value={complaintNotes[cmp.id] ?? ''}
                    onChange={(e) =>
                      setComplaintNotes((prev) => ({ ...prev, [cmp.id]: e.target.value }))
                    }
                    placeholder="บันทึกผลการพิจารณาของแอดมิน (เช่น ตรวจหลักฐานแล้วคืนเงิน / ปล่อยเงิน)..."
                    className="w-full px-3.5 py-2 rounded-xl border border-stoneBorder bg-ivory/70 text-xs"
                  />
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        resolveComplaint(
                          cmp.id,
                          'resolved_refund',
                          complaintNotes[cmp.id] ?? ''
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                    >
                      ตัดสินคืนเงินผู้ซื้อเต็มจำนวน (Refund Buyer)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        resolveComplaint(
                          cmp.id,
                          'resolved_release',
                          complaintNotes[cmp.id] ?? ''
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-emeraldSeal hover:opacity-95 text-white text-xs font-semibold"
                    >
                      ตัดสินปล่อยเงินให้ผู้ขาย (Release Funds)
                    </button>
                  </div>
                </div>
              ) : (
                cmp.adminResolutionNote && (
                  <div className="rounded-xl bg-emeraldSeal-soft/60 border border-emeraldSeal/20 p-3 text-xs text-ink">
                    <strong>คำตัดสินแอดมิน:</strong> {cmp.adminResolutionNote}
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
