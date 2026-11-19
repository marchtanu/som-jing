import React, { createContext, useContext, useEffect, useState } from 'react';
import { buildSeedData } from '../data/seedData';
import {
  ActiveTab,
  Complaint,
  EscrowOrder,
  PaymentCheckoutTarget,
  PaymentMethod,
  Product,
  ProductCategory,
  User,
  UserRole,
  VerificationRequest,
  WantedListing,
} from '../types';

const STORAGE_KEY = 'somjing_prototype_v1';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  detail?: string;
}

interface PersistedState {
  users: User[];
  currentUserId: string | null;
  products: Product[];
  verificationRequests: VerificationRequest[];
  wantedListings: WantedListing[];
  escrowOrders: EscrowOrder[];
  complaints: Complaint[];
}

interface StoreContextValue {
  users: User[];
  currentUser: User | null;
  products: Product[];
  verificationRequests: VerificationRequest[];
  wantedListings: WantedListing[];
  escrowOrders: EscrowOrder[];
  complaints: Complaint[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  checkoutTarget: PaymentCheckoutTarget | null;
  setCheckoutTarget: (target: PaymentCheckoutTarget | null) => void;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  pushToast: (type: ToastMessage['type'], title: string, detail?: string) => void;

  // Auth & Role
  loginUser: (email: string, password: string) => { ok: boolean; error?: string };
  registerUser: (input: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: UserRole;
  }) => { ok: boolean; error?: string };
  logoutUser: () => void;
  switchDemoRole: (role: UserRole) => void;

  // Auctions & Listings
  placeBid: (productId: string, amount: number) => { ok: boolean; error?: string };
  createProduct: (input: {
    title: string;
    category: ProductCategory;
    condition: Product['condition'];
    description: string;
    imageUrl: string;
    saleType: 'auction' | 'fixed';
    startPrice: number;
    buyNowPrice?: number;
    minBidIncrement: number;
    durationHours: number;
    serialNumber: string;
    requestVerify: boolean;
    purchaseProofNote?: string;
  }) => Product;

  // Verification
  submitVerificationRequest: (input: {
    productId?: string;
    productTitle: string;
    productImage: string;
    category: ProductCategory;
    serialNumber: string;
    purchaseProofNote: string;
    evidenceImageUrl?: string;
  }) => void;
  reviewVerificationRequest: (
    requestId: string,
    decision: 'approved' | 'rejected',
    reviewerNote: string
  ) => void;

  // Wanted Listings & Offers
  createWantedListing: (input: {
    title: string;
    category: ProductCategory;
    targetBudget: number;
    desiredCondition: string;
    description: string;
    referenceImage: string;
  }) => void;
  submitWantedOffer: (input: {
    wantedId: string;
    price: number;
    condition: string;
    isVerifiedItem: boolean;
    certificateId?: string;
    message: string;
    image: string;
  }) => void;

  // Simulated Payment & Escrow
  completeSimulatedPayment: (target: PaymentCheckoutTarget, method: PaymentMethod) => EscrowOrder;
  markOrderShipped: (orderId: string, courier: string, trackingNumber: string) => void;
  confirmOrderReceived: (orderId: string) => void;
  releaseEscrowFunds: (orderId: string) => void;

  // Complaints & Admin
  fileComplaint: (input: {
    orderId: string;
    reason: string;
    description: string;
  }) => void;
  resolveComplaint: (
    complaintId: string,
    decision: 'resolved_refund' | 'resolved_release',
    adminNote: string
  ) => void;

  // Demo Reset
  resetDemoData: () => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState;
      if (parsed && Array.isArray(parsed.products) && Array.isArray(parsed.users)) {
        return parsed;
      }
    }
  } catch {
    // Fallback to clean seed data if storage is unavailable or corrupted
  }
  const seed = buildSeedData();
  return {
    ...seed,
    currentUserId: seed.users[0].id,
  };
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedState>(() => loadInitialState());
  const [activeTab, setActiveTab] = useState<ActiveTab>('catalog');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [checkoutTarget, setCheckoutTarget] = useState<PaymentCheckoutTarget | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors in private browsing
    }
  }, [state]);

  const currentUser = state.users.find((u) => u.id === state.currentUserId) ?? null;

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const pushToast = (type: ToastMessage['type'], title: string, detail?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, detail }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const loginUser = (email: string, password: string) => {
    const found = state.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!found) {
      return { ok: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง (ลองใช้บัญชีทดสอบที่มีให้ได้)' };
    }
    setState((prev) => ({ ...prev, currentUserId: found.id }));
    setAuthModalOpen(false);
    pushToast('success', `เข้าสู่ระบบสำเร็จ: ${found.name}`);
    return { ok: true };
  };

  const registerUser = (input: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: UserRole;
  }) => {
    const exists = state.users.some(
      (u) => u.email.toLowerCase() === input.email.trim().toLowerCase()
    );
    if (exists) {
      return { ok: false, error: 'อีเมลนี้ถูกใช้งานในระบบแล้ว' };
    }
    const initials = input.name.trim().slice(0, 2).toUpperCase() || 'SJ';
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
      phone: input.phone.trim() || '080-000-0000',
      role: input.role,
      verifiedSeller: false,
      joinedAt: new Date().toISOString(),
      avatarInitials: initials,
    };
    setState((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
      currentUserId: newUser.id,
    }));
    setAuthModalOpen(false);
    pushToast('success', 'สมัครสมาชิกและเข้าสู่ระบบสำเร็จ', `ยินดีต้อนรับคุณ ${newUser.name}`);
    return { ok: true };
  };

  const logoutUser = () => {
    setState((prev) => ({ ...prev, currentUserId: null }));
    pushToast('info', 'ออกจากระบบแล้ว', 'กรุณาเข้าสู่ระบบเพื่อทำการประมูลหรือลงขาย');
  };

  const switchDemoRole = (role: UserRole) => {
    const target = state.users.find((u) => u.role === role);
    if (!target) return;
    setState((prev) => ({ ...prev, currentUserId: target.id }));
    const roleLabel =
      role === 'buyer' ? 'ผู้ซื้อ (Buyer)' : role === 'seller' ? 'ผู้ขาย (Seller)' : 'แอดมิน (Admin)';
    pushToast('info', `สลับบทบาทเป็น ${roleLabel}`, `กำลังใช้งานในชื่อ ${target.name}`);
  };

  const placeBid = (productId: string, amount: number) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return { ok: false, error: 'กรุณาเข้าสู่ระบบก่อนทำการบิดประมูล' };
    }
    const product = state.products.find((p) => p.id === productId);
    if (!product) return { ok: false, error: 'ไม่พบสินค้านี้' };
    if (new Date(product.endTime).getTime() <= Date.now()) {
      return { ok: false, error: 'รายการประมูลนี้ปิดเวลาไปแล้ว' };
    }
    const minRequired = product.currentPrice + product.minBidIncrement;
    if (amount < minRequired) {
      return {
        ok: false,
        error: `ราคาบิดขั้นต่ำถัดไปต้องไม่น้อยกว่า ฿${minRequired.toLocaleString('th-TH')}`,
      };
    }

    const newBid = {
      id: `bid-${Date.now()}`,
      bidderId: currentUser.id,
      bidderName: currentUser.name,
      amount,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId
          ? {
              ...p,
              currentPrice: amount,
              bids: [newBid, ...p.bids],
            }
          : p
      ),
    }));

    pushToast(
      'success',
      `เสนอราคาประมูลสำเร็จ ฿${amount.toLocaleString('th-TH')}`,
      `คุณเป็นผู้เสนอราคาสูงสุดสำหรับ ${product.title}`
    );
    return { ok: true };
  };

  const createProduct: StoreContextValue['createProduct'] = (input) => {
    const actor = currentUser ?? state.users[1];
    const nowIso = new Date().toISOString();
    const productId = `prod-${Date.now()}`;
    const newProduct: Product = {
      id: productId,
      title: input.title,
      category: input.category,
      condition: input.condition,
      description: input.description,
      images: [
        input.imageUrl ||
          'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?auto=format&fit=crop&w=900&q=80',
      ],
      saleType: input.saleType,
      currentPrice: input.startPrice,
      startPrice: input.startPrice,
      buyNowPrice: input.buyNowPrice,
      minBidIncrement: input.minBidIncrement,
      endTime: new Date(Date.now() + input.durationHours * 3600 * 1000).toISOString(),
      bids: [],
      sellerId: actor.id,
      sellerName: actor.name,
      verificationStatus: input.requestVerify ? 'pending' : 'unverified',
      serialNumber: input.serialNumber || `SN-${Date.now().toString().slice(-6)}`,
      status: 'active',
      createdAt: nowIso,
    };

    let newVerificationReq: VerificationRequest | null = null;
    if (input.requestVerify) {
      newVerificationReq = {
        id: `ver-${Date.now()}`,
        productId,
        productTitle: newProduct.title,
        productImage: newProduct.images[0],
        category: newProduct.category,
        sellerId: actor.id,
        sellerName: actor.name,
        serialNumber: newProduct.serialNumber || '-',
        purchaseProofNote:
          input.purchaseProofNote || 'ส่งคำขอตรวจความแท้พร้อมใบเสร็จและภาพถ่ายซีเรียลนัมเบอร์',
        evidenceImages: newProduct.images,
        status: 'pending',
        submittedAt: nowIso,
      };
    }

    setState((prev) => ({
      ...prev,
      products: [newProduct, ...prev.products],
      verificationRequests: newVerificationReq
        ? [newVerificationReq, ...prev.verificationRequests]
        : prev.verificationRequests,
    }));

    pushToast(
      'success',
      'ลงขายสินค้าสำเร็จ!',
      input.requestVerify
        ? 'ประกาศสินค้าและส่งคำขอ Verify เข้าคิวผู้ดูแลระบบแล้ว'
        : 'สินค้าของคุณแสดงบนหน้าตลาดกลางเรียบร้อย'
    );
    return newProduct;
  };

  const submitVerificationRequest: StoreContextValue['submitVerificationRequest'] = (input) => {
    const actor = currentUser ?? state.users[1];
    const nowIso = new Date().toISOString();
    const matchedProduct = input.productId
      ? state.products.find((p) => p.id === input.productId)
      : undefined;

    const newReq: VerificationRequest = {
      id: `ver-${Date.now()}`,
      productId: input.productId,
      productTitle: matchedProduct ? matchedProduct.title : input.productTitle,
      productImage:
        matchedProduct?.images[0] ||
        input.productImage ||
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
      category: matchedProduct ? matchedProduct.category : input.category,
      sellerId: actor.id,
      sellerName: actor.name,
      serialNumber: input.serialNumber,
      purchaseProofNote: input.purchaseProofNote,
      evidenceImages: [
        matchedProduct?.images[0] || input.productImage,
        input.evidenceImageUrl || '',
      ].filter(Boolean),
      status: 'pending',
      submittedAt: nowIso,
    };

    setState((prev) => ({
      ...prev,
      verificationRequests: [newReq, ...prev.verificationRequests],
      products: input.productId
        ? prev.products.map((p) =>
            p.id === input.productId
              ? { ...p, verificationStatus: 'pending', serialNumber: input.serialNumber }
              : p
          )
        : prev.products,
    }));

    pushToast(
      'success',
      'ส่งคำขอ SomJing Verify แล้ว',
      'สามารถสลับไปหน้าแอดมินเพื่อทดสอบกดอนุมัติ Verified Badge ได้ทันที'
    );
  };

  const reviewVerificationRequest = (
    requestId: string,
    decision: 'approved' | 'rejected',
    reviewerNote: string
  ) => {
    const req = state.verificationRequests.find((r) => r.id === requestId);
    if (!req) return;
    const nowIso = new Date().toISOString();
    const certId =
      decision === 'approved'
        ? `SJ-CERT-2026-${Math.floor(1000 + Math.random() * 8999)}`
        : undefined;
    const reviewerName = currentUser?.name || 'SomJing Specialist';

    setState((prev) => ({
      ...prev,
      verificationRequests: prev.verificationRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: decision,
              reviewedAt: nowIso,
              reviewerNote:
                reviewerNote ||
                (decision === 'approved'
                  ? 'ตรวจสอบหลักฐานความแท้ครบถ้วน อนุมัติตราสัญลักษณ์ Verified Badge'
                  : 'หลักฐานภาพถ่ายยังไม่ชัดเจน กรุณาส่งเอกสารเพิ่มเติม'),
              certificateId: certId,
            }
          : r
      ),
      products: req.productId
        ? prev.products.map((p) =>
            p.id === req.productId
              ? {
                  ...p,
                  verificationStatus: decision === 'approved' ? 'verified' : 'rejected',
                  certificateId: certId,
                  verifiedBy: decision === 'approved' ? reviewerName : undefined,
                  verifiedAt: decision === 'approved' ? nowIso : undefined,
                  authenticityNotes:
                    decision === 'approved'
                      ? reviewerNote || 'ผ่านการตรวจรับรองความแท้โดยผู้เชี่ยวชาญ SomJing'
                      : undefined,
                }
              : p
          )
        : prev.products,
    }));

    pushToast(
      decision === 'approved' ? 'success' : 'info',
      decision === 'approved'
        ? `อนุมัติ Verified Badge สำเร็จ (${certId})`
        : 'ปฏิเสธคำขอรับรองความแท้แล้ว',
      req.productTitle
    );
  };

  const createWantedListing: StoreContextValue['createWantedListing'] = (input) => {
    const actor = currentUser ?? state.users[0];
    const newListing: WantedListing = {
      id: `want-${Date.now()}`,
      title: input.title,
      category: input.category,
      targetBudget: input.targetBudget,
      desiredCondition: input.desiredCondition,
      description: input.description,
      referenceImage:
        input.referenceImage ||
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80',
      buyerId: actor.id,
      buyerName: actor.name,
      createdAt: new Date().toISOString(),
      status: 'open',
      offers: [],
    };
    setState((prev) => ({
      ...prev,
      wantedListings: [newListing, ...prev.wantedListings],
    }));
    pushToast('success', 'สร้างประกาศตามหาสินค้า (Wanted) สำเร็จ', input.title);
  };

  const submitWantedOffer: StoreContextValue['submitWantedOffer'] = (input) => {
    const actor = currentUser ?? state.users[1];
    const newOffer = {
      id: `offer-${Date.now()}`,
      wantedId: input.wantedId,
      sellerId: actor.id,
      sellerName: actor.name,
      price: input.price,
      condition: input.condition,
      isVerifiedItem: input.isVerifiedItem,
      certificateId: input.isVerifiedItem
        ? input.certificateId || `SJ-CERT-2026-${Math.floor(1000 + Math.random() * 8999)}`
        : undefined,
      message: input.message,
      image:
        input.image ||
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
      createdAt: new Date().toISOString(),
      status: 'pending' as const,
    };

    setState((prev) => ({
      ...prev,
      wantedListings: prev.wantedListings.map((w) =>
        w.id === input.wantedId ? { ...w, offers: [newOffer, ...w.offers] } : w
      ),
    }));
    pushToast('success', 'ส่งข้อเสนอขายให้ผู้ตามหาแล้ว', `ราคาที่เสนอ ฿${input.price.toLocaleString('th-TH')}`);
  };

  const completeSimulatedPayment = (
    target: PaymentCheckoutTarget,
    method: PaymentMethod
  ): EscrowOrder => {
    const buyer = currentUser ?? state.users[0];
    const nowIso = new Date().toISOString();
    const escrowFee = Math.round(target.amount * 0.02);
    const totalPaid = target.amount + escrowFee;
    const orderNumber = `SJ-ESC-${String(Date.now()).slice(-6)}`;

    const newOrder: EscrowOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      sourceType: target.sourceType,
      sourceId: target.sourceId,
      productTitle: target.productTitle,
      productImage: target.productImage,
      amount: target.amount,
      escrowFee,
      totalPaid,
      paymentMethod: method,
      buyerId: buyer.id,
      buyerName: buyer.name,
      sellerId: target.sellerId,
      sellerName: target.sellerName,
      status: 'held',
      isVerifiedItem: target.isVerifiedItem,
      certificateId: target.certificateId,
      createdAt: nowIso,
      timeline: [
        {
          step: 'held',
          label: 'ชำระเงินจำลอง & พักเงินในระบบ Escrow',
          detail: `ชำระผ่าน ${method} ยอดรวม ฿${totalPaid.toLocaleString('th-TH')} (รวมค่าคุ้มครอง 2%) เงินถูกพักไว้ที่ SomJing อย่างปลอดภัย`,
          timestamp: nowIso,
          actor: buyer.name,
        },
      ],
    };

    setState((prev) => ({
      ...prev,
      escrowOrders: [newOrder, ...prev.escrowOrders],
      products:
        target.sourceType === 'auction' || target.sourceType === 'direct'
          ? prev.products.map((p) => (p.id === target.sourceId ? { ...p, status: 'sold' } : p))
          : prev.products,
      wantedListings:
        target.sourceType === 'wanted_offer' && target.wantedListingId
          ? prev.wantedListings.map((w) =>
              w.id === target.wantedListingId
                ? {
                    ...w,
                    status: 'fulfilled',
                    offers: w.offers.map((o) =>
                      o.id === target.sourceId
                        ? { ...o, status: 'accepted' }
                        : { ...o, status: 'declined' }
                    ),
                  }
                : w
            )
          : prev.wantedListings,
    }));

    setCheckoutTarget(null);
    setSelectedProductId(null);
    setActiveTab('escrow');
    pushToast(
      'success',
      `ชำระเงินจำลองสำเร็จ (${orderNumber})`,
      'เงินถูกพักไว้ในบัญชี Escrow เรียบร้อย ติดตามขั้นตอนจัดส่งได้ในหน้า Escrow'
    );
    return newOrder;
  };

  const markOrderShipped = (orderId: string, courier: string, trackingNumber: string) => {
    const actorName = currentUser?.name || 'ผู้ขาย';
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      escrowOrders: prev.escrowOrders.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status: 'shipped',
              courier,
              trackingNumber,
              timeline: [
                ...ord.timeline,
                {
                  step: 'shipped',
                  label: 'ผู้ขายจัดส่งสินค้าแล้ว',
                  detail: `จัดส่งผ่าน ${courier} เลขพัสดุ ${trackingNumber}`,
                  timestamp: nowIso,
                  actor: actorName,
                },
              ],
            }
          : ord
      ),
    }));
    pushToast('success', 'อัปเดตสถานะจัดส่งสินค้าแล้ว', `เลขพัสดุ: ${trackingNumber}`);
  };

  const confirmOrderReceived = (orderId: string) => {
    const actorName = currentUser?.name || 'ผู้ซื้อ';
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      escrowOrders: prev.escrowOrders.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status: 'received',
              timeline: [
                ...ord.timeline,
                {
                  step: 'received',
                  label: 'ผู้ซื้อยืนยันได้รับสินค้าถูกต้อง',
                  detail: 'ผู้ซื้อตรวจสอบความแท้และสภาพสินค้าเรียบร้อย พร้อมเข้าสู่ขั้นตอนปล่อยเงิน',
                  timestamp: nowIso,
                  actor: actorName,
                },
              ],
            }
          : ord
      ),
    }));
    pushToast('success', 'ยืนยันรับสินค้าเรียบร้อย', 'ขั้นตอนสุดท้าย: กดปล่อยเงินจาก Escrow ให้ผู้ขาย');
  };

  const releaseEscrowFunds = (orderId: string) => {
    const nowIso = new Date().toISOString();
    const order = state.escrowOrders.find((o) => o.id === orderId);
    setState((prev) => ({
      ...prev,
      escrowOrders: prev.escrowOrders.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status: 'released',
              timeline: [
                ...ord.timeline,
                {
                  step: 'released',
                  label: 'ปล่อยเงินให้ผู้ขายแล้ว (Escrow Released)',
                  detail: `โอนยอดสุทธิ ฿${ord.amount.toLocaleString('th-TH')} เข้าบัญชีผู้ขาย ${ord.sellerName} เสร็จสมบูรณ์`,
                  timestamp: nowIso,
                  actor: 'ระบบ SomJing Escrow',
                },
              ],
            }
          : ord
      ),
    }));
    pushToast(
      'success',
      'ปล่อยเงินให้ผู้ขายสำเร็จ!',
      order ? `โอน ฿${order.amount.toLocaleString('th-TH')} ให้ ${order.sellerName} เรียบร้อย` : undefined
    );
  };

  const fileComplaint: StoreContextValue['fileComplaint'] = (input) => {
    const order = state.escrowOrders.find((o) => o.id === input.orderId);
    if (!order) return;
    const actor = currentUser ?? state.users[0];
    const nowIso = new Date().toISOString();
    const caseNumber = `CMP-2026-${String(Date.now()).slice(-3)}`;

    const newComplaint: Complaint = {
      id: `cmp-${Date.now()}`,
      caseNumber,
      orderId: order.id,
      orderNumber: order.orderNumber,
      productTitle: order.productTitle,
      reporterId: actor.id,
      reporterName: actor.name,
      reporterRole: actor.role,
      accusedName: actor.id === order.buyerId ? order.sellerName : order.buyerName,
      reason: input.reason,
      description: input.description,
      amountInEscrow: order.totalPaid,
      status: 'pending',
      createdAt: nowIso,
    };

    setState((prev) => ({
      ...prev,
      complaints: [newComplaint, ...prev.complaints],
      escrowOrders: prev.escrowOrders.map((ord) =>
        ord.id === order.id
          ? {
              ...ord,
              status: 'disputed',
              timeline: [
                ...ord.timeline,
                {
                  step: 'disputed',
                  label: `ระงับเงินชั่วคราว — มีข้อร้องเรียน (${caseNumber})`,
                  detail: `${input.reason}: ${input.description}`,
                  timestamp: nowIso,
                  actor: actor.name,
                },
              ],
            }
          : ord
      ),
    }));

    pushToast(
      'info',
      `ยื่นข้อร้องเรียนสำเร็จ (${caseNumber})`,
      'เงินในระบบ Escrow ถูกระงับไว้ชั่วคราวเพื่อให้แอดมินตรวจสอบ'
    );
  };

  const resolveComplaint = (
    complaintId: string,
    decision: 'resolved_refund' | 'resolved_release',
    adminNote: string
  ) => {
    const cmp = state.complaints.find((c) => c.id === complaintId);
    if (!cmp) return;
    const nowIso = new Date().toISOString();
    const adminName = currentUser?.name || 'แอดมิน SomJing';

    setState((prev) => ({
      ...prev,
      complaints: prev.complaints.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              status: decision,
              adminResolutionNote:
                adminNote ||
                (decision === 'resolved_refund'
                  ? 'แอดมินตรวจสอบแล้ว อนุมัติคืนเงินจากบัญชี Escrow ให้ผู้ซื้อเต็มจำนวน'
                  : 'แอดมินตรวจสอบแล้ว หลักฐานผู้ขายครบถ้วน อนุมัติปล่อยเงินให้ผู้ขาย'),
              resolvedAt: nowIso,
            }
          : c
      ),
      escrowOrders: prev.escrowOrders.map((ord) =>
        ord.id === cmp.orderId
          ? {
              ...ord,
              status: decision === 'resolved_refund' ? 'refunded' : 'released',
              timeline: [
                ...ord.timeline,
                {
                  step: decision === 'resolved_refund' ? 'refunded' : 'released',
                  label:
                    decision === 'resolved_refund'
                      ? 'แอดมินตัดสินคืนเงินผู้ซื้อ'
                      : 'แอดมินตัดสินปล่อยเงินให้ผู้ขาย',
                  detail: adminNote || 'ปิดเคสข้อร้องเรียนเรียบร้อย',
                  timestamp: nowIso,
                  actor: adminName,
                },
              ],
            }
          : ord
      ),
    }));

    pushToast(
      'success',
      decision === 'resolved_refund'
        ? `ปิดเคส ${cmp.caseNumber}: คืนเงินผู้ซื้อแล้ว`
        : `ปิดเคส ${cmp.caseNumber}: ปล่อยเงินผู้ขายแล้ว`
    );
  };

  const resetDemoData = () => {
    const seed = buildSeedData();
    const nextState: PersistedState = {
      ...seed,
      currentUserId: seed.users[0].id,
    };
    setState(nextState);
    setSelectedProductId(null);
    setCheckoutTarget(null);
    pushToast('info', 'รีเซ็ตข้อมูลตัวอย่างทั้งหมดแล้ว', 'ข้อมูลประมูล Verify, Wanted, Escrow และข้อร้องเรียนกลับมาเป็นค่าเริ่มต้น');
  };

  return (
    <StoreContext.Provider
      value={{
        users: state.users,
        currentUser,
        products: state.products,
        verificationRequests: state.verificationRequests,
        wantedListings: state.wantedListings,
        escrowOrders: state.escrowOrders,
        complaints: state.complaints,
        activeTab,
        setActiveTab,
        selectedProductId,
        setSelectedProductId,
        authModalOpen,
        setAuthModalOpen,
        checkoutTarget,
        setCheckoutTarget,
        toasts,
        dismissToast,
        pushToast,
        loginUser,
        registerUser,
        logoutUser,
        switchDemoRole,
        placeBid,
        createProduct,
        submitVerificationRequest,
        reviewVerificationRequest,
        createWantedListing,
        submitWantedOffer,
        completeSimulatedPayment,
        markOrderShipped,
        confirmOrderReceived,
        releaseEscrowFunds,
        fileComplaint,
        resolveComplaint,
        resetDemoData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
