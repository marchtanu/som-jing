export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone: string;
  defaultAddress?: string;
  verifiedSeller: boolean;
  joinedAt: string;
  avatarInitials: string;
}

export type ProductCategory = 'art-toys' | 'sneakers' | 'gadgets' | 'watches';

export type VerificationStatus = 'verified' | 'pending' | 'unverified' | 'rejected';

export interface ProductOption {
  id: string;
  label: string;
  colorHex: string;
  spec: string;
  imageIndex: number;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Bid {
  id: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  selectedOptionLabel?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  category: ProductCategory;
  condition: 'New / Deadstock' | 'Mint (99%)' | 'Like New (95%)' | 'Vintage Good';
  description: string;
  images: string[];
  options: ProductOption[];
  specs: ProductSpec[];
  saleType: 'auction' | 'fixed';
  currentPrice: number;
  startPrice: number;
  buyNowPrice?: number;
  minBidIncrement: number;
  endTime: string; // ISO string
  bids: Bid[];
  sellerId: string;
  sellerName: string;
  verificationStatus: VerificationStatus;
  certificateId?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  authenticityNotes?: string;
  serialNumber?: string;
  status: 'active' | 'sold';
  createdAt: string;
}

export interface VerificationRequest {
  id: string;
  productId?: string;
  productTitle: string;
  productImage: string;
  category: ProductCategory;
  sellerId: string;
  sellerName: string;
  serialNumber: string;
  purchaseProofNote: string;
  evidenceImages: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewerNote?: string;
  certificateId?: string;
}

export interface WantedOffer {
  id: string;
  wantedId: string;
  sellerId: string;
  sellerName: string;
  price: number;
  condition: string;
  isVerifiedItem: boolean;
  certificateId?: string;
  message: string;
  image: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface WantedListing {
  id: string;
  title: string;
  category: ProductCategory;
  targetBudget: number;
  desiredCondition: string;
  description: string;
  referenceImage: string;
  buyerId: string;
  buyerName: string;
  createdAt: string;
  status: 'open' | 'fulfilled';
  offers: WantedOffer[];
}

export type EscrowStatus = 'held' | 'shipped' | 'received' | 'released' | 'disputed' | 'refunded';

export type PaymentMethod = 'PromptPay QR' | 'Credit Card' | 'Mobile Banking';

export interface EscrowTimelineEvent {
  step: EscrowStatus;
  label: string;
  detail: string;
  timestamp: string;
  actor: string;
}

export interface EscrowOrder {
  id: string;
  orderNumber: string;
  sourceType: 'auction' | 'direct' | 'wanted_offer';
  sourceId: string;
  productTitle: string;
  productImage: string;
  selectedOptionLabel?: string;
  amount: number;
  escrowFee: number;
  totalPaid: number;
  paymentMethod: PaymentMethod;
  shippingAddress?: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  status: EscrowStatus;
  trackingNumber?: string;
  courier?: string;
  isVerifiedItem: boolean;
  certificateId?: string;
  createdAt: string;
  timeline: EscrowTimelineEvent[];
}

export interface Complaint {
  id: string;
  caseNumber: string;
  orderId: string;
  orderNumber: string;
  productTitle: string;
  reporterId: string;
  reporterName: string;
  reporterRole: UserRole;
  accusedName: string;
  reason: string;
  description: string;
  amountInEscrow: number;
  status: 'pending' | 'resolved_refund' | 'resolved_release';
  createdAt: string;
  adminResolutionNote?: string;
  resolvedAt?: string;
}

export type ActiveTab =
  | 'catalog'
  | 'sell'
  | 'verify'
  | 'wanted'
  | 'escrow'
  | 'admin'
  | 'report';

export type PolicyTopic =
  | 'authenticity'
  | 'escrow'
  | 'pdpa'
  | 'etransactions'
  | 'terms';

export interface PaymentCheckoutTarget {
  sourceType: 'auction' | 'direct' | 'wanted_offer';
  sourceId: string;
  productTitle: string;
  productImage: string;
  selectedOptionLabel?: string;
  amount: number;
  sellerId: string;
  sellerName: string;
  isVerifiedItem: boolean;
  certificateId?: string;
  wantedListingId?: string;
}
