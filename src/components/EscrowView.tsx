import React, { useMemo, useState } from 'react';
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
import { EscrowOrder, EscrowStatus, UserRole } from '../types';
import { formatTHB, formatThaiDateTime } from '../utils/format';
import { SafeImage, VerificationBadge } from './ui';

const ESCROW_STEPS: { key: EscrowStatus; label: string; sub: string }[] = [
  { key: 'held', label: '1. พักเงินในระบบ', sub: 'Funds Held in Escrow' },
  { key: 'shipped', label: '2. จัดส่งสินค้า', sub: 'Shipped with Tracking' },
  { key: 'received', label: '3. ยืนยันรับของ', sub: 'Buyer Confirmed Receipt' },
  { key: 'released', label: '4. ปล่อยเงินสำเร็จ', sub: 'Funds Released to Seller' },
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
    currentUser,
    markOrderShipped,
    confirmOrderReceived,
    releaseEscrowFunds,
    fileComplaint,
    setActiveTab,
    setAuthModalOpen,
  } = useStore();

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disputed' | 'done'>('all');

  const isAdmin = currentUser?.role === 'admin';
  const isSeller = currentUser?.role === 'seller';
  const isBuyer = currentUser?.role === 'buyer';

  const roleOrders = useMemo(() => {
    if (!currentUser) return [];
    return escrowOrders.filter((o) => {
      if (isAdmin) return true;
      if (isBuyer) return o.buyerId === currentUser.id;
      if (isSeller) return o.sellerId === currentUser.id;
      return false;
    });
  }, [escrowOrders, currentUser, isAdmin, isBuyer, isSeller]);

  const visibleOrders = useMemo(() => {
    return roleOrders.filter((o) => {
      if (statusFilter === 'active') {
        return o.status === 'held' || o.status === 'shipped' || o.status === 'received';
      }
      if (statusFilter === 'disputed') {
        return o.status === 'disputed';
      }
      if (statusFilter === 'done') {
        return o.status === 'released' || o.status === 'refunded';
      }
      return true;
    });
  }, [roleOrders, statusFilter]);

  const totalHeldAmount = roleOrders
    .filter(
      (o) =>
        o.status === 'held' ||
        o.status === 'shipped' ||
        o.status === 'received' ||
        o.status === 'disputed'
    )
    .reduce((sum, o) => sum + o.totalPaid, 0);

  const totalReleasedAmount = roleOrders
    .filter((o) => o.status === 'released')
    .reduce((sum, o) => sum + o.amount, 0);

  const headingTitle = isAdmin
    ? 'ตรวจสอบธุรกรรม Escrow ทั้งระบบ'
    : isSeller
      ? 'รายการขาย & จัดส่ง Escrow (Seller)'
      : 'คำสั่งซื้อ Escrow ของฉัน (Customer)';

  const headingSubtitle = isAdmin
    ? 'ติดตามยอดพักเงินและการจัดส่งทุกคำสั่งซื้อในแพลตฟอร์ม'
    : isSeller
      ? 'แจ้งเลขพัสดุจัดส่งสินค้าและติดตามยอดเงินที่กำลังรอผู้ซื้อยืนยันรับของ'
      : 'ติดตามสถานะ 4 ขั้นตอน: พักเงิน → จัดส่ง → ยืนยันรับของ → ปล่อยเงิน หรือแจ้งข้อร้องเรียน';

  return (
    <div className="space-y-12 animate-view-in">
      <div className="pb-6 border-b border-hairline flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-[32px] font-medium leading-[1.2] text-ink">{headingTitle}</h1>
          <p className="text-base text-mute mt-1">{headingSubtitle}</p>
        </div>

        <div className="flex flex-wrap gap-8">
          <div>
            <p className="text-xs font-medium text-mute">Funds Held in Escrow</p>
            <p className="text-2xl font-medium font-mono text-ink tabular-nums mt-0.5">
              {formatTHB(totalHeldAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-mute">Total Released</p>
            <p className="text-2xl font-medium font-mono text-success tabular-nums mt-0.5">
              {formatTHB(totalReleasedAmount)}
            </p>
          </div>
        </div>
      </div>

      {!currentUser ? (
        <div className="bg-soft-cloud p-12 text-center space-y-4">
          <p className="text-base font-medium text-ink">
            กรุณาเข้าสู่ระบบเพื่อดูคำสั่งซื้อและสถานะการพักเงิน Escrow ของคุณ
          </p>
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="btn-primary"
          >
            เข้าสู่ระบบ
          </button>
        </div>
      ) : (
        <>
          {/* Role-Appropriate Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={statusFilter === 'all' ? 'filter-chip-active' : 'filter-chip'}
            >
              ทั้งหมด ({roleOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={statusFilter === 'active' ? 'filter-chip-active' : 'filter-chip'}
            >
              {isSeller ? 'รอจัดส่ง / รอผู้ซื้อรับของ' : 'กำลังดำเนินการ'}
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setStatusFilter('disputed')}
                className={statusFilter === 'disputed' ? 'filter-chip-active' : 'filter-chip'}
              >
                มีข้อร้องเรียน (Disputed)
              </button>
            )}
            <button
              type="button"
              onClick={() => setStatusFilter('done')}
              className={statusFilter === 'done' ? 'filter-chip-active' : 'filter-chip'}
            >
              เสร็จสมบูรณ์ (Released / Refunded)
            </button>
          </div>

          {visibleOrders.length === 0 ? (
            <div className="bg-soft-cloud p-12 text-center space-y-4">
              <p className="text-base font-medium text-ink">ยังไม่มีรายการในหมวดนี้</p>
              <button
                type="button"
                onClick={() => setActiveTab(isAdmin ? 'admin' : 'catalog')}
                className="btn-primary"
              >
                {isAdmin ? 'กลับไปหน้า Admin Console' : 'กลับหน้ารวมสินค้า'}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-hairline border-b border-hairline">
              {visibleOrders.map((order) => (
                <EscrowOrderCard
                  key={order.id}
                  order={order}
                  currentUserId={currentUser.id}
                  currentUserRole={currentUser.role}
                  onShip={markOrderShipped}
                  onConfirmReceive={confirmOrderReceived}
                  onRelease={releaseEscrowFunds}
                  onDispute={fileComplaint}
                  onGoAdmin={() => setActiveTab('admin')}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const EscrowOrderCard: React.FC<{
  order: EscrowOrder;
  currentUserId: string;
  currentUserRole: UserRole;
  onShip: (orderId: string, courier: string, tracking: string) => void;
  onConfirmReceive: (orderId: string) => void;
  onRelease: (orderId: string) => void;
  onDispute: (input: { orderId: string; reason: string; description: string }) => void;
  onGoAdmin: () => void;
}> = ({
  order,
  currentUserId,
  currentUserRole,
  onShip,
  onConfirmReceive,
  onRelease,
  onDispute,
  onGoAdmin,
}) => {
  const [courier, setCourier] = useState('Kerry Express (Insured)');
  const [tracking, setTracking] = useState(`SJTH${String(Date.now()).slice(-7)}`);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('สินค้าไม่ตรงตามรูป / ตำหนิไม่ได้แจ้ง');
  const [disputeDesc, setDisputeDesc] = useState('');

  const stepIndex = getStepIndex(order.status);
  const isBuyer = currentUserId === order.buyerId;
  const isSeller = currentUserId === order.sellerId;
  const isAdmin = currentUserRole === 'admin';

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
    <article className="py-8 first:pt-0 space-y-6">
      {/* Top Order Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <SafeImage
            src={order.productImage}
            alt={order.productTitle}
            className="w-24 h-24 bg-soft-cloud object-cover shrink-0 rounded-none"
          />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-medium text-ink border border-hairline px-2.5 py-0.5 rounded-lg">
                {order.orderNumber}
              </span>
              <span className="badge-promo">
                {isBuyer ? 'ผู้ซื้อ (Buying)' : isSeller ? 'ผู้ขาย (Selling)' : 'Admin View'}
              </span>
              <VerificationBadge
                status={order.isVerifiedItem ? 'verified' : 'unverified'}
                certificateId={order.certificateId}
                compact
              />
              <span className="text-xs text-mute">{order.paymentMethod}</span>
            </div>
            <h2 className="text-lg font-medium text-ink">{order.productTitle}</h2>
            {order.selectedOptionLabel && (
              <p className="text-xs font-medium text-charcoal">
                ตัวเลือก: {order.selectedOptionLabel}
              </p>
            )}
            <p className="text-sm text-mute">
              ผู้ซื้อ: <span className="text-ink">{order.buyerName}</span> · ผู้ขาย:{' '}
              <span className="text-ink">{order.sellerName}</span>
            </p>
            {order.shippingAddress && (
              <p className="text-xs text-mute">
                ที่อยู่จัดส่ง: <span className="text-charcoal">{order.shippingAddress}</span>
              </p>
            )}
          </div>
        </div>

        <div className="md:text-right shrink-0">
          <p className="text-xs text-mute">ยอดรวมที่พักใน Escrow</p>
          <p className="text-2xl font-medium font-mono text-ink tabular-nums">
            {formatTHB(order.totalPaid)}
          </p>
          <p className="text-xs text-mute">
            สินค้า {formatTHB(order.amount)} + ค่าคุ้มครอง {formatTHB(order.escrowFee)}
          </p>
        </div>
      </div>

      {/* 4-Step Mechanical Stepper */}
      {order.status === 'disputed' || order.status === 'refunded' ? (
        <div className="bg-soft-cloud p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-hairline">
          <div className="flex items-start gap-3">
            <ShieldAlert
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                order.status === 'disputed' ? 'text-sale' : 'text-ink'
              }`}
            />
            <div className="text-sm space-y-0.5">
              <p className="font-medium text-ink">
                {order.status === 'disputed'
                  ? 'เงินในระบบ Escrow ถูกระงับชั่วคราว (มีข้อร้องเรียนรอแอดมินตัดสิน)'
                  : 'ปิดเคสข้อร้องเรียน: คืนเงินให้ผู้ซื้อเต็มจำนวนแล้ว'}
              </p>
              <p className="text-mute">ผู้ดูแลระบบกำลังตรวจสอบหลักฐานระหว่างผู้ซื้อและผู้ขาย</p>
            </div>
          </div>
          {order.status === 'disputed' && isAdmin && (
            <button type="button" onClick={onGoAdmin} className="btn-primary h-10 px-5 text-sm shrink-0">
              ตัดสินข้อร้องเรียนใน Admin Console
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {ESCROW_STEPS.map((step, idx) => {
            const done = idx <= stepIndex;
            const current = idx === stepIndex;
            return (
              <div
                key={step.key}
                className={`p-4 border transition-colors ${
                  done
                    ? current && order.status !== 'released'
                      ? 'border-ink bg-ink text-canvas'
                      : 'border-hairline bg-soft-cloud text-ink'
                    : 'border-hairline-soft bg-canvas text-mute opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {idx === 0 && <Lock className="w-4 h-4" />}
                  {idx === 1 && <Truck className="w-4 h-4" />}
                  {idx === 2 && <PackageCheck className="w-4 h-4" />}
                  {idx === 3 && <Banknote className="w-4 h-4" />}
                  <span className="text-sm font-medium">{step.label}</span>
                </div>
                <p
                  className={`text-xs ${
                    done && current && order.status !== 'released' ? 'text-stone' : 'text-mute'
                  }`}
                >
                  {step.sub}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {order.trackingNumber && (
        <div className="bg-soft-cloud px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-mute">
            Courier: <strong className="text-ink font-medium">{order.courier}</strong>
          </span>
          <span className="text-mute">
            Tracking Number:{' '}
            <strong className="font-mono text-ink">{order.trackingNumber}</strong>
          </span>
        </div>
      )}

      {/* Role-Enforced Action Controls */}
      {order.status === 'held' &&
        (isSeller || isAdmin ? (
          <form
            onSubmit={handleShipSubmit}
            className="bg-soft-cloud p-5 flex flex-col sm:flex-row items-stretch sm:items-end gap-3"
          >
            <div className="flex-1">
              <label className="block text-xs font-medium text-mute mb-1.5">บริษัทขนส่ง</label>
              <select
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                className="hairline-input w-full bg-canvas"
              >
                <option>Kerry Express (Insured)</option>
                <option>Flash Express (Insured)</option>
                <option>Thailand Post EMS</option>
                <option>SomJing Messenger (กทม.)</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-mute mb-1.5">เลขพัสดุ (Tracking)</label>
              <input
                type="text"
                required
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                className="hairline-input w-full font-mono bg-canvas"
              />
            </div>
            <button type="submit" className="btn-primary shrink-0">
              <Truck className="w-4 h-4" />
              <span>ยืนยันการจัดส่งสินค้า</span>
            </button>
          </form>
        ) : (
          <div className="bg-soft-cloud p-4 text-sm text-charcoal flex items-center gap-3">
            <Clock className="w-4 h-4 text-ink shrink-0" />
            <span>
              พักเงินใน Escrow เรียบร้อยแล้ว — กำลังรอผู้ขาย (
              <strong className="text-ink">{order.sellerName}</strong>) แพ็กสินค้าและกรอกเลขพัสดุ
            </span>
          </div>
        ))}

      {order.status === 'shipped' &&
        (isBuyer || isAdmin ? (
          <div className="bg-soft-cloud p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-charcoal">
                สินค้าอยู่ระหว่างจัดส่ง — กดยืนยันรับของเมื่อตรวจสภาพถูกต้อง หรือยื่นข้อร้องเรียนหากพบปัญหา
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeForm((v) => !v)}
                  className="btn-secondary bg-canvas border border-hairline"
                >
                  <AlertTriangle className="w-4 h-4 text-sale" />
                  <span>แจ้งปัญหา / ร้องเรียน</span>
                </button>
                <button
                  type="button"
                  onClick={() => onConfirmReceive(order.id)}
                  className="btn-primary"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>ยืนยันรับของถูกต้อง</span>
                </button>
              </div>
            </div>

            {showDisputeForm && (
              <form onSubmit={handleDisputeSubmit} className="pt-4 border-t border-hairline space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <select
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="hairline-input bg-canvas"
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
                    className="hairline-input bg-canvas"
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="btn-primary">
                    ส่งคำร้องเรียน &amp; ระงับเงิน Escrow
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="bg-soft-cloud p-4 text-sm text-charcoal flex items-center gap-3">
            <Truck className="w-4 h-4 text-ink shrink-0" />
            <span>
              จัดส่งสินค้าเรียบร้อยแล้ว — กำลังรอผู้ซื้อ (
              <strong className="text-ink">{order.buyerName}</strong>) ตรวจรับสินค้าเพื่อปล่อยเงิน
            </span>
          </div>
        ))}

      {order.status === 'received' &&
        (isBuyer || isAdmin ? (
          <div className="bg-soft-cloud p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm">
              <p className="font-medium text-ink">ผู้ซื้อยืนยันรับสินค้าเรียบร้อยแล้ว</p>
              <p className="text-mute">
                พร้อมโอนยอดสุทธิ <span className="font-mono text-ink">{formatTHB(order.amount)}</span>{' '}
                ออกจากบัญชีพักเงินให้ผู้ขาย
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRelease(order.id)}
              className="btn-primary shrink-0"
            >
              <Banknote className="w-4 h-4" />
              <span>อนุมัติปล่อยเงินให้ผู้ขาย</span>
            </button>
          </div>
        ) : (
          <div className="bg-soft-cloud p-4 text-sm text-charcoal flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <span>ผู้ซื้อยืนยันรับของแล้ว — กำลังรอระบบดำเนินการปล่อยเงิน</span>
          </div>
        ))}

      {/* Audit Log */}
      <div className="space-y-2.5 pt-2">
        <p className="text-xs font-medium text-mute uppercase tracking-wide inline-flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>Escrow Audit Log</span>
        </p>
        <div className="space-y-2 border-l border-hairline pl-4 ml-1">
          {order.timeline.map((event, i) => (
            <div key={i} className="text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                <span className="font-medium text-ink">{event.label}</span>
                <span className="text-mute font-mono">
                  ({formatThaiDateTime(event.timestamp)})
                </span>
              </div>
              <p className="text-charcoal pl-5 mt-0.5">
                {event.detail} — <em>โดย {event.actor}</em>
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
};
