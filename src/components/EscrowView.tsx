import React, { useState } from 'react';
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Clock,
  Lock,
  PackageCheck,
  ShieldAlert,
  Truck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { EscrowOrder, EscrowStatus } from '../types';
import { formatTHB, formatThaiDateTime } from '../utils/format';
import { SafeImage, VerificationBadge } from './ui';

const ESCROW_STEPS: { key: EscrowStatus; label: string; sub: string }[] = [
  { key: 'held', label: '1. พักเงินในระบบ', sub: 'ชำระเข้า Escrow แล้ว' },
  { key: 'shipped', label: '2. จัดส่งสินค้า', sub: 'แจ้งเลขพัสดุแล้ว' },
  { key: 'received', label: '3. ยืนยันรับของ', sub: 'ผู้ซื้อตรวจสภาพผ่าน' },
  { key: 'released', label: '4. ปล่อยเงินสำเร็จ', sub: 'โอนเงินให้ผู้ขายแล้ว' },
];

function getStepIndex(status: EscrowStatus): number {
  if (status === 'held') return 0;
  if (status === 'shipped') return 1;
  if (status === 'received') return 2;
  if (status === 'released') return 3;
  return 1;
}

export const EscrowView: React.FC = () => {
  const {
    escrowOrders,
    markOrderShipped,
    confirmOrderReceived,
    releaseEscrowFunds,
    fileComplaint,
    setActiveTab,
  } = useStore();

  const totalHeldAmount = escrowOrders
    .filter((o) => o.status === 'held' || o.status === 'shipped' || o.status === 'received' || o.status === 'disputed')
    .reduce((sum, o) => sum + o.totalPaid, 0);

  const totalReleasedAmount = escrowOrders
    .filter((o) => o.status === 'released')
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            ระบบพักเงินกลางและติดตามสถานะ (Escrow Tracker)
          </h1>
          <p className="text-sm text-mutedInk mt-1">
            จำลองวงจรความปลอดภัย 4 ขั้นตอน: พักเงิน → จัดส่ง → ยืนยันรับของ → ปล่อยเงิน หรือยื่นข้อร้องเรียนให้แอดมินตัดสิน
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl bg-escrowBlue-soft border border-escrowBlue/20 px-4 py-2.5">
            <p className="text-[11px] font-semibold text-escrowBlue">เงินที่กำลังพักในบัญชี Escrow</p>
            <p className="text-lg font-bold font-mono text-ink tabular-nums">
              {formatTHB(totalHeldAmount)}
            </p>
          </div>
          <div className="rounded-xl bg-emeraldSeal-soft border border-emeraldSeal/20 px-4 py-2.5">
            <p className="text-[11px] font-semibold text-emeraldSeal">ปล่อยเงินสำเร็จแล้ว</p>
            <p className="text-lg font-bold font-mono text-ink tabular-nums">
              {formatTHB(totalReleasedAmount)}
            </p>
          </div>
        </div>
      </div>

      {escrowOrders.length === 0 ? (
        <div className="rounded-2xl bg-paper border border-stoneBorder p-10 text-center space-y-3">
          <p className="text-base font-bold text-ink">ยังไม่มีคำสั่งซื้อในระบบ Escrow</p>
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className="px-4 py-2 rounded-xl bg-vermilion text-white text-sm font-semibold"
          >
            เลือกสินค้าเพื่อทดสอบชำระเงิน Escrow
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {escrowOrders.map((order) => (
            <EscrowOrderCard
              key={order.id}
              order={order}
              onShip={markOrderShipped}
              onConfirmReceive={confirmOrderReceived}
              onRelease={releaseEscrowFunds}
              onDispute={fileComplaint}
              onGoAdmin={() => setActiveTab('admin')}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const EscrowOrderCard: React.FC<{
  order: EscrowOrder;
  onShip: (orderId: string, courier: string, tracking: string) => void;
  onConfirmReceive: (orderId: string) => void;
  onRelease: (orderId: string) => void;
  onDispute: (input: { orderId: string; reason: string; description: string }) => void;
  onGoAdmin: () => void;
}> = ({ order, onShip, onConfirmReceive, onRelease, onDispute, onGoAdmin }) => {
  const [courier, setCourier] = useState('Kerry Express (Insured)');
  const [tracking, setTracking] = useState(`SJTH${String(Date.now()).slice(-7)}`);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('สินค้าไม่ตรงตามรูป / ตำหนิไม่ได้แจ้ง');
  const [disputeDesc, setDisputeDesc] = useState('');

  const stepIndex = getStepIndex(order.status);

  const handleShipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tracking.trim()) return;
    onShip(order.id, courier, tracking.trim());
  };

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDispute({
      orderId: order.id,
      reason: disputeReason,
      description:
        disputeDesc.trim() || 'ผู้ซื้อขอยื่นตรวจสอบสินค้าและชะลอการปล่อยเงินในระบบ Escrow',
    });
    setShowDisputeForm(false);
    setDisputeDesc('');
  };

  return (
    <article className="rounded-2xl bg-paper border border-stoneBorder p-5 sm:p-6 space-y-5">
      {/* Top Order Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stoneBorder">
        <div className="flex items-start gap-4">
          <SafeImage
            src={order.productImage}
            alt={order.productTitle}
            className="w-20 h-20 rounded-xl object-cover shrink-0 border border-stoneBorder"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-sand text-ink">
                {order.orderNumber}
              </span>
              <VerificationBadge
                status={order.isVerifiedItem ? 'verified' : 'unverified'}
                certificateId={order.certificateId}
                compact
              />
              <span className="text-xs text-mutedInk">
                ช่องทาง: <strong className="text-ink">{order.paymentMethod}</strong>
              </span>
            </div>
            <h2 className="text-base font-bold text-ink">{order.productTitle}</h2>
            <p className="text-xs text-mutedInk">
              ผู้ซื้อ: <strong className="text-ink">{order.buyerName}</strong> • ผู้ขาย:{' '}
              <strong className="text-ink">{order.sellerName}</strong>
            </p>
          </div>
        </div>

        <div className="md:text-right shrink-0">
          <p className="text-xs text-mutedInk">ยอดที่ชำระเข้า Escrow</p>
          <p className="text-2xl font-bold font-mono text-vermilion tabular-nums">
            {formatTHB(order.totalPaid)}
          </p>
          <p className="text-[11px] text-mutedInk">
            ราคาสินค้า {formatTHB(order.amount)} + ค่าคุ้มครอง {formatTHB(order.escrowFee)}
          </p>
        </div>
      </div>

      {/* 4-Step Visual Stepper */}
      {order.status === 'disputed' || order.status === 'refunded' ? (
        <div
          className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            order.status === 'disputed'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-sm">
                {order.status === 'disputed'
                  ? 'เงินในระบบ Escrow ถูกระงับชั่วคราว (มีข้อร้องเรียนรอแอดมินตัดสิน)'
                  : 'ปิดเคสข้อร้องเรียน: ระบบคืนเงินให้ผู้ซื้อเต็มจำนวนแล้ว'}
              </p>
              <p>ผู้ดูแลระบบกำลังตรวจสอบหลักฐานระหว่างผู้ซื้อและผู้ขาย</p>
            </div>
          </div>
          {order.status === 'disputed' && (
            <button
              type="button"
              onClick={onGoAdmin}
              className="px-3.5 py-2 rounded-xl bg-ink text-white text-xs font-semibold shrink-0 hover:bg-ink/90"
            >
              ไปหน้าแอดมินตัดสินข้อร้องเรียน
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ESCROW_STEPS.map((step, idx) => {
            const done = idx <= stepIndex;
            const current = idx === stepIndex;
            return (
              <div
                key={step.key}
                className={`rounded-xl border p-3 transition-colors ${
                  done
                    ? current && order.status !== 'released'
                      ? 'border-escrowBlue bg-escrowBlue-soft'
                      : 'border-emeraldSeal/35 bg-emeraldSeal-soft/70'
                    : 'border-stoneBorder bg-ivory/60 opacity-65'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {idx === 0 && (
                    <Lock
                      className={`w-4 h-4 ${done ? 'text-escrowBlue' : 'text-mutedInk'}`}
                    />
                  )}
                  {idx === 1 && (
                    <Truck
                      className={`w-4 h-4 ${done ? 'text-escrowBlue' : 'text-mutedInk'}`}
                    />
                  )}
                  {idx === 2 && (
                    <PackageCheck
                      className={`w-4 h-4 ${done ? 'text-emeraldSeal' : 'text-mutedInk'}`}
                    />
                  )}
                  {idx === 3 && (
                    <Banknote
                      className={`w-4 h-4 ${done ? 'text-emeraldSeal' : 'text-mutedInk'}`}
                    />
                  )}
                  <span className="text-xs font-bold text-ink">{step.label}</span>
                </div>
                <p className="text-[11px] text-mutedInk">{step.sub}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Tracking Banner if shipped */}
      {order.trackingNumber && (
        <div className="rounded-xl bg-ivory border border-stoneBorder px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-mutedInk">
            บริษัทขนส่ง: <strong className="text-ink">{order.courier}</strong>
          </span>
          <span className="text-mutedInk">
            เลขพัสดุ:{' '}
            <strong className="font-mono text-ink bg-white px-2 py-0.5 rounded border border-stoneBorder">
              {order.trackingNumber}
            </strong>
          </span>
        </div>
      )}

      {/* Interactive Action Controls based on current Escrow state */}
      {order.status === 'held' && (
        <form
          onSubmit={handleShipSubmit}
          className="rounded-xl bg-escrowBlue-soft/60 border border-escrowBlue/20 p-4 flex flex-col sm:flex-row items-stretch sm:items-end gap-3"
        >
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-ink mb-1">บริษัทขนส่ง</label>
            <select
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stoneBorder bg-white text-xs"
            >
              <option>Kerry Express (Insured)</option>
              <option>Flash Express (Insured)</option>
              <option>Thailand Post EMS</option>
              <option>SomJing Messenger (กทม.)</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-ink mb-1">เลขพัสดุ (Tracking)</label>
            <input
              type="text"
              required
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stoneBorder bg-white font-mono text-xs"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-escrowBlue hover:opacity-95 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shrink-0"
          >
            <Truck className="w-4 h-4" />
            <span>ขั้นที่ 2: แจ้งจัดส่งสินค้า</span>
          </button>
        </form>
      )}

      {order.status === 'shipped' && (
        <div className="rounded-xl bg-ivory border border-stoneBorder p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-mutedInk">
              สินค้าอยู่ระหว่างจัดส่ง เมื่อผู้ซื้อตรวจรับของถูกต้องให้กดปุ่มยืนยันรับของ หรือแจ้งร้องเรียนหากพบปัญหา
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowDisputeForm((v) => !v)}
                className="px-3.5 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>แจ้งปัญหา / ร้องเรียน</span>
              </button>
              <button
                type="button"
                onClick={() => onConfirmReceive(order.id)}
                className="px-4 py-2 rounded-xl bg-emeraldSeal hover:opacity-95 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <PackageCheck className="w-4 h-4" />
                <span>ขั้นที่ 3: ยืนยันรับของถูกต้อง</span>
              </button>
            </div>
          </div>

          {showDisputeForm && (
            <form
              onSubmit={handleDisputeSubmit}
              className="pt-3 border-t border-stoneBorder space-y-2.5"
            >
              <div className="grid sm:grid-cols-2 gap-2.5">
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-stoneBorder bg-white text-xs"
                >
                  <option>สินค้าไม่ตรงตามรูป / ตำหนิไม่ได้แจ้ง</option>
                  <option>สงสัยว่าไม่ใช่ของแท้ (ต้องการให้ทีมตรวจซ้ำ)</option>
                  <option>พัสดุเสียหายระหว่างขนส่ง</option>
                  <option>ไม่ได้รับสินค้าตามกำหนด</option>
                </select>
                <input
                  type="text"
                  required
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  placeholder="อธิบายรายละเอียดปัญหาที่พบ..."
                  className="px-3 py-2 rounded-lg border border-stoneBorder bg-white text-xs"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold"
                >
                  ส่งคำร้องเรียน &amp; ระงับเงินใน Escrow
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {order.status === 'received' && (
        <div className="rounded-xl bg-emeraldSeal-soft border border-emeraldSeal/25 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs">
            <p className="font-bold text-ink">ผู้ซื้อยืนยันรับสินค้าเรียบร้อยแล้ว</p>
            <p className="text-mutedInk">
              พร้อมโอนยอดสุทธิ <span className="font-mono font-bold text-ink">{formatTHB(order.amount)}</span>{' '}
              ออกจากบัญชีพักเงิน Escrow ให้ผู้ขาย
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRelease(order.id)}
            className="px-4 py-2.5 rounded-xl bg-emeraldSeal hover:opacity-95 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Banknote className="w-4 h-4" />
            <span>ขั้นที่ 4: ปล่อยเงินให้ผู้ขาย</span>
          </button>
        </div>
      )}

      {/* Timeline Log */}
      <div className="pt-2">
        <p className="text-xs font-bold text-ink mb-2 inline-flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-mutedInk" />
          <span>บันทึกสถานะธุรกรรม (Escrow Audit Log)</span>
        </p>
        <div className="space-y-2 border-l-2 border-stoneBorder pl-4 ml-1.5">
          {order.timeline.map((event, i) => (
            <div key={i} className="text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emeraldSeal shrink-0" />
                <span className="font-semibold text-ink">{event.label}</span>
                <span className="text-[11px] text-mutedInk font-mono">
                  ({formatThaiDateTime(event.timestamp)})
                </span>
              </div>
              <p className="text-mutedInk pl-5 mt-0.5">
                {event.detail} — <em>โดย {event.actor}</em>
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
};
