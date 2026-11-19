import React, { createContext, useContext, useEffect, useState } from 'react';
import { buildSeedData } from '../data/seedData';
import {
  ActiveTab,
  Complaint,
  EscrowOrder,
  PaymentCheckoutTarget,
  PaymentMethod,
  PolicyTopic,
  Product,
  ProductCategory,
  ProductOption,
  ProductSpec,
  User,
  UserRole,
  VerificationRequest,
  WantedListing,
} from '../types';

const STORAGE_KEY = 'somjing_prototype_v2';

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
  watchlistIds: string[];
  selectedOptionByProduct: Record<string, string>;
}

interface StoreContextValue {
  users: User[];
  currentUser: User | null;
  products: Product[];
  verificationRequests: VerificationRequest[];
  wantedListings: WantedListing[];
  escrowOrders: EscrowOrder[];
  complaints: Complaint[];
  watchlistIds: string[];
  selectedOptionByProduct: Record<string, string>;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  checkoutTarget: PaymentCheckoutTarget | null;
  setCheckoutTarget: (target: PaymentCheckoutTarget | null) => void;
  policyModalTopic: PolicyTopic | null;
  setPolicyModalTopic: (topic: PolicyTopic | null) => void;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  pushToast: (type: ToastMessage['type'], title: string, detail?: string) => void;

  // Auth
  loginUser: (email: string, password: string) => { ok: boolean; error?: string };
  registerUser: (input: {
    name: string;
    email: string;
    password: string;
    phone: string;
    defaultAddress?: string;
    role: UserRole;
  }) => { ok: boolean; error?: string };
  logoutUser: () => void;

  // Watchlist & Options
  toggleWatchlist: (productId: string) => void;
  setProductSelectedOption: (productId: string, optionId: string) => void;
  getSelectedOptionForProduct: (product: Product) => ProductOption;

  // Auctions & Listings
  placeBid: (
    productId: string,
    amount: number,
    selectedOptionLabel?: string
  ) => { ok: boolean; error?: string };
  createProduct: (input: {
    title: string;
    category: ProductCategory;
    condition: Product['condition'];
    description: string;
    imageUrl: string;
    secondaryImageUrl?: string;
    options?: ProductOption[];
    specs?: ProductSpec[];
    saleType: 'auction' | 'fixed';
    startPrice: number;
    buyNowPrice?: number;
    minBidIncrement: number;
    durationHours: number;
    serialNumber: string;
    requestVerify: boolean;
    purchaseProofNote?: string;
  }) => Product | null;

  // Verification
  submitVerificationRequest: (input: {
    productId?: string;
    productTitle: string;
    productImage: string;
    category: ProductCategory;
    serialNumber: string;
    purchaseProofNote: string;
    evidenceImageUrl?: string;
  }) => { ok: boolean; error?: string };
  reviewVerificationRequest: (
    requestId: string,
    decision: 'approved' | 'rejected',
    reviewerNote: string
  ) => { ok: boolean; error?: string };

  // Wanted Listings & Offers
  createWantedListing: (input: {
    title: string;
    category: ProductCategory;
    targetBudget: number;
    desiredCondition: string;
    description: string;
    referenceImage: string;
  }) => { ok: boolean; error?: string };
  submitWantedOffer: (input: {
    wantedId: string;
    price: number;
    condition: string;
    isVerifiedItem: boolean;
    certificateId?: string;
    message: string;
    image: string;
  }) => { ok: boolean; error?: string };

  // Simulated Payment & Escrow
  completeSimulatedPayment: (
    target: PaymentCheckoutTarget,
    method: PaymentMethod,
    shippingAddress?: string
  ) => EscrowOrder;
  markOrderShipped: (
    orderId: string,
    courier: string,
    trackingNumber: string
  ) => { ok: boolean; error?: string };
  confirmOrderReceived: (orderId: string) => { ok: boolean; error?: string };
  releaseEscrowFunds: (orderId: string) => { ok: boolean; error?: string };

  // Complaints & Admin
  fileComplaint: (input: {
    orderId: string;
    reason: string;
    description: string;
  }) => { ok: boolean; error?: string };
  resolveComplaint: (
    complaintId: string,
    decision: 'resolved_refund' | 'resolved_release',
    adminNote: string
  ) => { ok: boolean; error?: string };

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
        return {
          ...parsed,
          watchlistIds: Array.isArray(parsed.watchlistIds) ? parsed.watchlistIds : ['prod-1'],
          selectedOptionByProduct: parsed.selectedOptionByProduct ?? {},
        };
      }
    }
  } catch {
    // Fallback to clean seed data if storage is unavailable or corrupted
  }
  const seed = buildSeedData();
  return {
    ...seed,
    currentUserId: seed.users[0].id,
    watchlistIds: ['prod-1', 'prod-2'],
    selectedOptionByProduct: {},
  };
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedState>(() => loadInitialState());
  const [activeTab, setActiveTabState] = useState<ActiveTab>('catalog');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [checkoutTarget, setCheckoutTarget] = useState<PaymentCheckoutTarget | null>(null);
  const [policyModalTopic, setPolicyModalTopic] = useState<PolicyTopic | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors in private browsing
    }
  }, [state]);

  const currentUser = state.users.find((u) => u.id === state.currentUserId) ?? null;

  const setActiveTab = (tab: ActiveTab) => {
    if (tab === 'admin' && currentUser?.role !== 'admin') {
      pushToast(
        'error',
        'ไม่มีสิทธิ์เข้าถึงหน้าผู้ดูแลระบบ',
        'กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ (Admin) เพื่อจัดการ Verify และข้อร้องเรียน'
      );
      setAuthModalOpen(true);
      return;
    }
    setActiveTabState(tab);
  };

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
      return { ok: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
    }
    setState((prev) => ({ ...prev, currentUserId: found.id }));
    setAuthModalOpen(false);
    if (activeTab === 'admin' && found.role !== 'admin') {
      setActiveTabState('catalog');
    }
    pushToast('success', `เข้าสู่ระบบสำเร็จ: ${found.name}`);
    return { ok: true };
  };

  const registerUser = (input: {
    name: string;
    email: string;
    password: string;
    phone: string;
    defaultAddress?: string;
    role: UserRole;
  }) => {
    if (input.role === 'admin') {
      return { ok: false, error: 'ไม่สามารถสมัครบัญชีผู้ดูแลระบบจากหน้าสาธารณะได้' };
    }
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
      defaultAddress:
        input.defaultAddress?.trim() || 'กรุงเทพมหานคร (สามารถแก้ไขที่อยู่จัดส่งได้ในขั้นตอนชำระเงิน)',
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
    if (activeTab === 'admin') {
      setActiveTabState('catalog');
    }
    pushToast('success', 'สมัครสมาชิกและเข้าสู่ระบบสำเร็จ', `ยินดีต้อนรับคุณ ${newUser.name}`);
    return { ok: true };
  };

  const logoutUser = () => {
    setState((prev) => ({ ...prev, currentUserId: null }));
    if (activeTab === 'admin') {
      setActiveTabState('catalog');
    }
    pushToast('info', 'ออกจากระบบแล้ว', 'กรุณาเข้าสู่ระบบเพื่อใช้งานต่อ');
  };

  const toggleWatchlist = (productId: string) => {
    const exists = state.watchlistIds.includes(productId);
    setState((prev) => ({
      ...prev,
      watchlistIds: exists
        ? prev.watchlistIds.filter((id) => id !== productId)
        : [...prev.watchlistIds, productId],
    }));
    const product = state.products.find((p) => p.id === productId);
    pushToast(
      'info',
      exists ? 'นำออกจากรายการที่บันทึกแล้ว' : 'บันทึกในรายการโปรดแล้ว',
      product?.title
    );
  };

  const setProductSelectedOption = (productId: string, optionId: string) => {
    setState((prev) => ({
      ...prev,
      selectedOptionByProduct: {
        ...prev.selectedOptionByProduct,
        [productId]: optionId,
      },
    }));
  };

  const getSelectedOptionForProduct = (product: Product): ProductOption => {
    const selectedId = state.selectedOptionByProduct[product.id];
    return (
      product.options.find((opt) => opt.id === selectedId) ??
      product.options[0] ?? {
        id: 'default',
        label: product.condition,
        colorHex: '#111111',
        spec: product.condition,
        imageIndex: 0,
      }
    );
  };

  const placeBid = (productId: string, amount: number, selectedOptionLabel?: string) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return { ok: false, error: 'กรุณาเข้าสู่ระบบก่อนทำการบิดประมูล' };
    }
    if (currentUser.role === 'admin') {
      return {
        ok: false,
        error: 'บัญชีผู้ดูแลระบบ (Admin) ไม่สามารถเข้าร่วมบิดประมูลได้เพื่อความเป็นกลาง',
      };
    }
    const product = state.products.find((p) => p.id === productId);
    if (!product) return { ok: false, error: 'ไม่พบสินค้านี้' };
    if (product.sellerId === currentUser.id) {
      return { ok: false, error: 'ผู้ขายไม่สามารถบิดประมูลสินค้าที่ตนเองลงขายได้' };
    }
    if (product.status === 'sold') {
      return { ok: false, error: 'สินค้านี้ถูกปิดการขายเรียบร้อยแล้ว' };
    }
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

    const activeOpt = getSelectedOptionForProduct(product);
    const newBid = {
      id: `bid-${Date.now()}`,
      bidderId: currentUser.id,
      bidderName: currentUser.name,
      amount,
      selectedOptionLabel: selectedOptionLabel || activeOpt.label,
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
      `ตัวเลือก: ${newBid.selectedOptionLabel}`
    );
    return { ok: true };
  };

  const createProduct: StoreContextValue['createProduct'] = (input) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      pushToast('error', 'กรุณาเข้าสู่ระบบก่อนลงขายสินค้า');
      return null;
    }
    if (currentUser.role === 'admin') {
      pushToast('error', 'บัญชี Admin ไม่สามารถลงขายสินค้าได้');
      return null;
    }

    const nowIso = new Date().toISOString();
    const productId = `prod-${Date.now()}`;
    const images = [
      input.imageUrl ||
        'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?auto=format&fit=crop&w=900&q=80',
      input.secondaryImageUrl ||
        input.imageUrl ||
        'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=80',
    ];

    const options: ProductOption[] =
      input.options && input.options.length > 0
        ? input.options
        : [
            {
              id: `${productId}-opt-1`,
              label: `${input.condition} (Standard Set)`,
              colorHex: '#111111',
              spec: input.description || 'อุปกรณ์ครบตามมาตรฐาน',
              imageIndex: 0,
            },
          ];

    const specs: ProductSpec[] =
      input.specs && input.specs.length > 0
        ? input.specs
        : [
            { label: 'สภาพสินค้า', value: input.condition },
            { label: 'Serial / รหัสอ้างอิง', value: input.serialNumber || '-' },
            { label: 'การคุ้มครอง', value: 'SomJing Escrow 4 ขั้นตอน' },
          ];

    const newProduct: Product = {
      id: productId,
      title: input.title,
      category: input.category,
      condition: input.condition,
      description: input.description,
      images,
      options,
      specs,
      saleType: input.saleType,
      currentPrice: input.startPrice,
      startPrice: input.startPrice,
      buyNowPrice: input.buyNowPrice,
      minBidIncrement: input.minBidIncrement,
      endTime: new Date(Date.now() + input.durationHours * 3600 * 1000).toISOString(),
      bids: [],
      sellerId: currentUser.id,
      sellerName: currentUser.name,
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
        sellerId: currentUser.id,
        sellerName: currentUser.name,
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
        ? 'ประกาศสินค้าและส่งคำขอ Verify เข้าคิวผู้ตรวจสอบแล้ว'
        : 'สินค้าของคุณแสดงบนหน้าตลาดกลางเรียบร้อย'
    );
    return newProduct;
  };

  const submitVerificationRequest: StoreContextValue['submitVerificationRequest'] = (input) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return { ok: false, error: 'กรุณาเข้าสู่ระบบก่อนส่งคำขอ Verify' };
    }
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
      sellerId: currentUser.id,
      sellerName: currentUser.name,
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
      'คำขอถูกส่งเข้าสู่คิวการตรวจสอบของทีมผู้เชี่ยวชาญเรียบร้อย'
    );
    return { ok: true };
  };

  const reviewVerificationRequest = (
    requestId: string,
    decision: 'approved' | 'rejected',
    reviewerNote: string
  ) => {
    if (currentUser?.role !== 'admin') {
      pushToast('error', 'เฉพาะบัญชีแอดมินเท่านั้นที่อนุมัติ Verify ได้');
      return { ok: false, error: 'ต้องใช้งานในสิทธิ์ผู้ดูแลระบบ (Admin)' };
    }
    const req = state.verificationRequests.find((r) => r.id === requestId);
    if (!req) return { ok: false, error: 'ไม่พบคำขอ Verify นี้' };
    const nowIso = new Date().toISOString();
    const certId =
      decision === 'approved'
        ? `SJ-CERT-2026-${Math.floor(1000 + Math.random() * 8999)}`
        : undefined;
    const reviewerName = currentUser.name;

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
    return { ok: true };
  };

  const createWantedListing: StoreContextValue['createWantedListing'] = (input) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return { ok: false, error: 'กรุณาเข้าสู่ระบบก่อนสร้าง Wanted Listing' };
    }
    if (currentUser.role === 'admin') {
      pushToast('error', 'บัญชี Admin ไม่สามารถโพสต์ Wanted Listing ได้');
      return { ok: false, error: 'บัญชี Admin ไม่สามารถโพสต์ Wanted Listing ได้' };
    }
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
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      createdAt: new Date().toISOString(),
      status: 'open',
      offers: [],
    };
    setState((prev) => ({
      ...prev,
      wantedListings: [newListing, ...prev.wantedListings],
    }));
    pushToast('success', 'สร้างประกาศตามหาสินค้า (Wanted) สำเร็จ', input.title);
    return { ok: true };
  };

  const submitWantedOffer: StoreContextValue['submitWantedOffer'] = (input) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return { ok: false, error: 'กรุณาเข้าสู่ระบบก่อนส่งข้อเสนอ' };
    }
    if (currentUser.role === 'admin') {
      pushToast('error', 'บัญชี Admin ไม่สามารถส่งข้อเสนอขายได้');
      return { ok: false, error: 'บัญชี Admin ไม่สามารถส่งข้อเสนอขายได้' };
    }
    const listing = state.wantedListings.find((w) => w.id === input.wantedId);
    if (listing && listing.buyerId === currentUser.id) {
      pushToast('error', 'ไม่สามารถส่งข้อเสนอในประกาศของตนเองได้');
      return { ok: false, error: 'ไม่สามารถส่งข้อเสนอในประกาศของตนเองได้' };
    }

    const newOffer = {
      id: `offer-${Date.now()}`,
      wantedId: input.wantedId,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
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
    pushToast(
      'success',
      'ส่งข้อเสนอขายให้ผู้ตามหาแล้ว',
      `ราคาที่เสนอ ฿${input.price.toLocaleString('th-TH')}`
    );
    return { ok: true };
  };

  const completeSimulatedPayment = (
    target: PaymentCheckoutTarget,
    method: PaymentMethod,
    shippingAddress?: string
  ): EscrowOrder => {
    const buyer = currentUser ?? state.users[0];
    const nowIso = new Date().toISOString();
    const escrowFee = Math.round(target.amount * 0.02);
    const totalPaid = target.amount + escrowFee;
    const orderNumber = `SJ-ESC-${String(Date.now()).slice(-6)}`;
    const address =
      shippingAddress?.trim() ||
      buyer.defaultAddress ||
      '99/14 ถนนพุทธมณฑลสาย 4 จ.นครปฐม 73170';

    const newOrder: EscrowOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      sourceType: target.sourceType,
      sourceId: target.sourceId,
      productTitle: target.productTitle,
      productImage: target.productImage,
      selectedOptionLabel: target.selectedOptionLabel,
      amount: target.amount,
      escrowFee,
      totalPaid,
      paymentMethod: method,
      shippingAddress: address,
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
          detail: `ชำระผ่าน ${method} ยอดรวม ฿${totalPaid.toLocaleString('th-TH')} (รวมค่าคุ้มครอง 2%) · จัดส่งที่: ${address}`,
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
    setActiveTabState('escrow');
    pushToast(
      'success',
      `ชำระเงินจำลองสำเร็จ (${orderNumber})`,
      'เงินถูกพักไว้ในบัญชี Escrow เรียบร้อย ติดตามขั้นตอนจัดส่งได้ในหน้า Escrow'
    );
    return newOrder;
  };

  const markOrderShipped = (orderId: string, courier: string, trackingNumber: string) => {
    const order = state.escrowOrders.find((o) => o.id === orderId);
    if (!order) return { ok: false, error: 'ไม่พบคำสั่งซื้อ' };
    if (!currentUser || (currentUser.id !== order.sellerId && currentUser.role !== 'admin')) {
      const msg = `เฉพาะผู้ขาย (${order.sellerName}) เท่านั้นที่สามารถแจ้งจัดส่งสินค้าได้`;
      pushToast('error', 'ไม่มีสิทธิ์ดำเนินการ', msg);
      return { ok: false, error: msg };
    }
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
                  actor: currentUser.name,
                },
              ],
            }
          : ord
      ),
    }));
    pushToast('success', 'อัปเดตสถานะจัดส่งสินค้าแล้ว', `เลขพัสดุ: ${trackingNumber}`);
    return { ok: true };
  };

  const confirmOrderReceived = (orderId: string) => {
    const order = state.escrowOrders.find((o) => o.id === orderId);
    if (!order) return { ok: false, error: 'ไม่พบคำสั่งซื้อ' };
    if (!currentUser || (currentUser.id !== order.buyerId && currentUser.role !== 'admin')) {
      const msg = `เฉพาะผู้ซื้อ (${order.buyerName}) เท่านั้นที่สามารถกดยืนยันรับสินค้าได้`;
      pushToast('error', 'ไม่มีสิทธิ์ดำเนินการ', msg);
      return { ok: false, error: msg };
    }
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
                  actor: currentUser.name,
                },
              ],
            }
          : ord
      ),
    }));
    pushToast('success', 'ยืนยันรับสินค้าเรียบร้อย', 'ขั้นตอนสุดท้าย: ปล่อยเงินจาก Escrow ให้ผู้ขาย');
    return { ok: true };
  };

  const releaseEscrowFunds = (orderId: string) => {
    const order = state.escrowOrders.find((o) => o.id === orderId);
    if (!order) return { ok: false, error: 'ไม่พบคำสั่งซื้อ' };
    if (!currentUser || (currentUser.id !== order.buyerId && currentUser.role !== 'admin')) {
      const msg = 'เฉพาะผู้ซื้อหรือผู้ดูแลระบบเท่านั้นที่สามารถอนุมัติปล่อยเงินได้';
      pushToast('error', 'ไม่มีสิทธิ์ดำเนินการ', msg);
      return { ok: false, error: msg };
    }
    const nowIso = new Date().toISOString();
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
                  actor: currentUser.role === 'admin' ? currentUser.name : 'ระบบ SomJing Escrow',
                },
              ],
            }
          : ord
      ),
    }));
    pushToast(
      'success',
      'ปล่อยเงินให้ผู้ขายสำเร็จ!',
      `โอน ฿${order.amount.toLocaleString('th-TH')} ให้ ${order.sellerName} เรียบร้อย`
    );
    return { ok: true };
  };

  const fileComplaint: StoreContextValue['fileComplaint'] = (input) => {
    const order = state.escrowOrders.find((o) => o.id === input.orderId);
    if (!order) return { ok: false, error: 'ไม่พบคำสั่งซื้อ' };
    if (!currentUser) {
      setAuthModalOpen(true);
      return { ok: false, error: 'กรุณาเข้าสู่ระบบก่อนยื่นข้อร้องเรียน' };
    }
    const nowIso = new Date().toISOString();
    const caseNumber = `CMP-2026-${String(Date.now()).slice(-3)}`;

    const newComplaint: Complaint = {
      id: `cmp-${Date.now()}`,
      caseNumber,
      orderId: order.id,
      orderNumber: order.orderNumber,
      productTitle: order.productTitle,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterRole: currentUser.role,
      accusedName: currentUser.id === order.buyerId ? order.sellerName : order.buyerName,
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
                  actor: currentUser.name,
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
    return { ok: true };
  };

  const resolveComplaint = (
    complaintId: string,
    decision: 'resolved_refund' | 'resolved_release',
    adminNote: string
  ) => {
    if (currentUser?.role !== 'admin') {
      pushToast('error', 'เฉพาะบัญชีแอดมินเท่านั้นที่ตัดสินข้อร้องเรียนได้');
      return { ok: false, error: 'ต้องใช้งานในสิทธิ์ผู้ดูแลระบบ (Admin)' };
    }
    const cmp = state.complaints.find((c) => c.id === complaintId);
    if (!cmp) return { ok: false, error: 'ไม่พบข้อร้องเรียนนี้' };
    const nowIso = new Date().toISOString();
    const adminName = currentUser.name;

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
    return { ok: true };
  };

  const resetDemoData = () => {
    const seed = buildSeedData();
    const nextState: PersistedState = {
      ...seed,
      currentUserId: seed.users[0].id,
      watchlistIds: ['prod-1', 'prod-2'],
      selectedOptionByProduct: {},
    };
    setState(nextState);
    setSelectedProductId(null);
    setCheckoutTarget(null);
    setActiveTabState('catalog');
    pushToast(
      'info',
      'รีเซ็ตข้อมูลระบบทั้งหมดแล้ว',
      'ข้อมูลสินค้า ประมูล Verify, Wanted และ Escrow กลับมาเป็นค่าเริ่มต้น (บัญชีผู้ซื้อ)'
    );
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
        watchlistIds: state.watchlistIds,
        selectedOptionByProduct: state.selectedOptionByProduct,
        activeTab,
        setActiveTab,
        selectedProductId,
        setSelectedProductId,
        authModalOpen,
        setAuthModalOpen,
        checkoutTarget,
        setCheckoutTarget,
        policyModalTopic,
        setPolicyModalTopic,
        toasts,
        dismissToast,
        pushToast,
        loginUser,
        registerUser,
        logoutUser,
        toggleWatchlist,
        setProductSelectedOption,
        getSelectedOptionForProduct,
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
