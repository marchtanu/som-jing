import React, { useState } from 'react';
import { Shield, ShieldCheck } from 'lucide-react';
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
    <div className="space-y-12">
      {/* Header */}
      <div className="pb-6 border-b border-hairline flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-medium leading-[1.2] text-ink">
            Admin Console · Verification &amp; Disputes
          </h1>
          <p className="text-base text-mute mt-1">
            ตรวจสอบหลักฐานเพื่ออนุมัติ Verified Badge และตัดสินข้อร้องเรียนในระบบ Escrow
          </p>
        </div>

        {currentUser?.role !== 'admin' && (
          <button
            type="button"
            onClick={() => switchDemoRole('admin')}
            className="btn-primary shrink-0"
          >
            <Shield className="w-4 h-4" />
            <span>สลับบัญชีเป็น Admin</span>
          </button>
        )}
      </div>

      {/* Flat 3-up Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border border-hairline divide-y sm:divide-y-0 sm:divide-x divide-hairline">
        <div className="p-6">
          <p className="text-xs font-medium text-mute">Pending Verifications</p>
          <p className="text-3xl font-medium font-mono text-ink mt-1 tabular-nums">
            {pendingVerifications.length}
          </p>
          <p className="text-xs text-success mt-1">
            Approved: {reviewedVerifications.filter((r) => r.status === 'approved').length}
          </p>
        </div>

        <div className="p-6">
          <p className="text-xs font-medium text-mute">Open Complaints</p>
          <p className="text-3xl font-medium font-mono text-sale mt-1 tabular-nums">
            {pendingComplaints.length}
          </p>
          <p className="text-xs text-mute mt-1">Resolved: {resolvedComplaints.length}</p>
        </div>

        <div className="p-6">
          <p className="text-xs font-medium text-mute">Active Escrow Volume</p>
          <p className="text-3xl font-medium font-mono text-ink mt-1 tabular-nums">
            {formatTHB(activeEscrowVolume)}
          </p>
          <p className="text-xs text-mute mt-1">Across {escrowOrders.length} orders</p>
        </div>
      </div>

      {/* Section 1: Verification Approval Queue */}
      <section className="space-y-6">
        <h2 className="text-2xl font-medium text-ink">
          คิวอนุมัติ Verified Badge ({pendingVerifications.length})
        </h2>

        {pendingVerifications.length === 0 ? (
          <div className="bg-soft-cloud p-8 text-center text-sm text-mute">
            ไม่มีคำขอ Verify ที่ค้างอยู่ — ส่งคำขอใหม่ได้จากหน้า &ldquo;ขอ Verify&rdquo; หรือ &ldquo;ลงขายสินค้า&rdquo;
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {pendingVerifications.map((req) => (
              <div key={req.id} className="border border-hairline p-6 space-y-4">
                <div className="flex gap-4">
                  <SafeImage
                    src={req.productImage}
                    alt={req.productTitle}
                    className="w-24 h-24 bg-soft-cloud object-cover shrink-0 rounded-none"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs font-medium text-mute">
                      {CATEGORY_LABELS[req.category]} · {req.sellerName}
                    </p>
                    <h3 className="text-base font-medium text-ink leading-snug">
                      {req.productTitle}
                    </h3>
                    <p className="text-xs text-mute">
                      Serial: <span className="font-mono text-ink">{req.serialNumber}</span>
                    </p>
                    <p className="text-xs text-mute">{formatThaiDateTime(req.submittedAt)}</p>
                  </div>
                </div>

                <p className="text-sm text-charcoal bg-soft-cloud p-3.5 leading-relaxed">
                  <strong>หลักฐาน:</strong> {req.purchaseProofNote}
                </p>

                <input
                  type="text"
                  value={verifyNotes[req.id] ?? ''}
                  onChange={(e) =>
                    setVerifyNotes((prev) => ({ ...prev, [req.id]: e.target.value }))
                  }
                  placeholder="บันทึกความเห็นผู้ตรวจสอบ (แสดงในใบรับรอง)..."
                  className="hairline-input w-full text-xs"
                />

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      reviewVerificationRequest(req.id, 'approved', verifyNotes[req.id] ?? '')
                    }
                    className="btn-primary flex-1 h-11 text-sm"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>อนุมัติ Verified Badge</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      reviewVerificationRequest(req.id, 'rejected', verifyNotes[req.id] ?? '')
                    }
                    className="btn-secondary h-11 px-6 text-sm"
                  >
                    ไม่อนุมัติ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {reviewedVerifications.length > 0 && (
          <div className="border-t border-hairline pt-6 space-y-3">
            <h3 className="text-base font-medium text-ink">ประวัติการตรวจ Verify ล่าสุด</h3>
            <div className="divide-y divide-hairline-soft">
              {reviewedVerifications.map((req) => (
                <div
                  key={req.id}
                  className="py-3 flex flex-wrap items-center justify-between gap-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-ink">{req.productTitle}</p>
                    <p className="text-xs text-mute">
                      {req.sellerName} · {req.reviewerNote}
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
      <section className="space-y-6 border-t border-hairline pt-10">
        <h2 className="text-2xl font-medium text-ink">
          ข้อร้องเรียนและข้อพิพาท Escrow ({pendingComplaints.length} เปิดอยู่)
        </h2>

        <div className="divide-y divide-hairline border-t border-b border-hairline">
          {complaints.map((cmp) => (
            <div key={cmp.id} className="py-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs font-medium text-canvas bg-ink px-2.5 py-0.5 rounded-lg">
                    {cmp.caseNumber}
                  </span>
                  <span className="font-mono text-xs text-mute">Order: {cmp.orderNumber}</span>
                  <span
                    className={`text-xs font-medium ${
                      cmp.status === 'pending' ? 'text-sale' : 'text-success'
                    }`}
                  >
                    {cmp.status === 'pending'
                      ? 'Pending Review'
                      : cmp.status === 'resolved_refund'
                        ? 'Resolved: Refunded Buyer'
                        : 'Resolved: Released to Seller'}
                  </span>
                </div>

                <span className="text-base font-mono font-medium text-ink tabular-nums">
                  Escrow: {formatTHB(cmp.amountInEscrow)}
                </span>
              </div>

              <div className="space-y-1.5 text-sm">
                <p className="text-base font-medium text-ink">{cmp.productTitle}</p>
                <p className="text-xs text-mute">
                  ผู้ร้องเรียน: <span className="text-ink">{cmp.reporterName}</span> · คู่กรณี:{' '}
                  <span className="text-ink">{cmp.accusedName}</span> ·{' '}
                  {formatThaiDateTime(cmp.createdAt)}
                </p>
                <div className="bg-soft-cloud p-4 mt-2 space-y-1">
                  <p className="font-medium text-sale">หัวข้อ: {cmp.reason}</p>
                  <p className="text-charcoal leading-relaxed">{cmp.description}</p>
                </div>
              </div>

              {cmp.status === 'pending' ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={complaintNotes[cmp.id] ?? ''}
                    onChange={(e) =>
                      setComplaintNotes((prev) => ({ ...prev, [cmp.id]: e.target.value }))
                    }
                    placeholder="บันทึกผลการพิจารณาของแอดมิน..."
                    className="hairline-input w-full text-xs"
                  />
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        resolveComplaint(cmp.id, 'resolved_refund', complaintNotes[cmp.id] ?? '')
                      }
                      className="btn-primary h-11 px-6 text-sm"
                    >
                      ตัดสินคืนเงินผู้ซื้อ (Refund Buyer)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        resolveComplaint(cmp.id, 'resolved_release', complaintNotes[cmp.id] ?? '')
                      }
                      className="btn-secondary h-11 px-6 text-sm"
                    >
                      ตัดสินปล่อยเงินให้ผู้ขาย (Release Funds)
                    </button>
                  </div>
                </div>
              ) : (
                cmp.adminResolutionNote && (
                  <p className="text-xs text-ink bg-soft-cloud p-3.5">
                    <strong>คำตัดสินแอดมิน:</strong> {cmp.adminResolutionNote}
                  </p>
                )
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
