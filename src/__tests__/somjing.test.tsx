import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { StoreProvider, useStore } from '../context/StoreContext';

function createWrapper() {
  return ({ children }: { children: React.ReactNode }) => (
    <StoreProvider>{children}</StoreProvider>
  );
}

describe('SomJing (สมจริง) E-Commerce Prototype Test Suite (TC-01 to TC-14)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('TC-01: registers a new buyer account and rejects public admin registration', () => {
    const { result } = renderHook(() => useStore(), { wrapper: createWrapper() });

    let blockedAdmin: { ok: boolean; error?: string } = { ok: true };
    act(() => {
      blockedAdmin = result.current.registerUser({
        name: 'Fake Admin',
        email: 'fakeadmin@somjing.com',
        password: 'password123',
        phone: '080-000-0000',
        role: 'admin',
      });
    });
    expect(blockedAdmin.ok).toBe(false);

    let response: { ok: boolean; error?: string } = { ok: false };
    act(() => {
      response = result.current.registerUser({
        name: 'พิมพ์ชนก นักสะสม',
        email: 'collector@somjing.com',
        password: 'secret123',
        phone: '089-999-1234',
        defaultAddress: 'กรุงเทพมหานคร',
        role: 'buyer',
      });
    });

    expect(response.ok).toBe(true);
    expect(result.current.currentUser?.email).toBe('collector@somjing.com');
    expect(result.current.currentUser?.role).toBe('buyer');
  });

  it('TC-02: enforces real authentication and hides admin console from non-admin users', () => {
    const { result } = renderHook(() => useStore(), { wrapper: createWrapper() });

    // Buyer cannot switch directly to admin tab
    expect(result.current.currentUser?.role).toBe('buyer');
    act(() => {
      result.current.setActiveTab('admin');
    });
    expect(result.current.activeTab).toBe('catalog');

    // Logging in as Admin unlocks Admin tab
    let loginRes: { ok: boolean; error?: string } = { ok: false };
    act(() => {
      loginRes = result.current.loginUser('admin@somjing.com', 'password123');
    });
    expect(loginRes.ok).toBe(true);
    expect(result.current.currentUser?.role).toBe('admin');

    act(() => {
      result.current.setActiveTab('admin');
    });
    expect(result.current.activeTab).toBe('admin');
  });

  it('TC-03: renders catalog and syncs selected product option between card and detail page', () => {
    render(<App />);

    expect(screen.getByText(/ALL COLLECTIBLES/i)).toBeInTheDocument();
    const kawsTitle = screen.getByText(/BE@RBRICK 1000% KAWS Companion Tension/i);
    expect(kawsTitle).toBeInTheDocument();

    // Select second option swatch dot on card before opening PDP
    const secondOptionBtn = screen.getByLabelText(
      /เลือกตัวเลือก 1000% \+ เคสอะคริลิกกัน UV/i
    );
    fireEvent.click(secondOptionBtn);

    // Card subtitle updates to selected option
    expect(
      screen.getByText(/1000% \+ เคสอะคริลิกกัน UV · อาร์ตทอย & ฟิกเกอร์/i)
    ).toBeInTheDocument();

    // Open PDP and confirm same option is active
    fireEvent.click(kawsTitle);
    expect(
      screen.getByText(/พร้อมตู้โชว์อะคริลิกหนา 5mm สั่งตัดพอดีตัว/i)
    ).toBeInTheDocument();
  });

  it('TC-04: accepts a valid auction bid and updates current price, bid history, and selected option', () => {
    const { result } = renderHook(() => useStore(), { wrapper: createWrapper() });
    const target = result.current.products.find((p) => p.id === 'prod-1')!;
    const validBid = target.currentPrice + target.minBidIncrement;

    let bidRes: { ok: boolean; error?: string } = { ok: false };
    act(() => {
      bidRes = result.current.placeBid('prod-1', validBid, '1000% + เคสอะคริลิกกัน UV');
    });

    expect(bidRes.ok).toBe(true);
    const updated = result.current.products.find((p) => p.id === 'prod-1')!;
    expect(updated.currentPrice).toBe(validBid);
    expect(updated.bids[0].amount).toBe(validBid);
    expect(updated.bids[0].selectedOptionLabel).toBe('1000% + เคสอะคริลิกกัน UV');
  });

  it('TC-05: rejects bids below minimum increment and forbids seller from bidding on own item', () => {
    const { result } = renderHook(() => useStore(), { wrapper: createWrapper() });
    const target = result.current.products.find((p) => p.id === 'prod-1')!;
    const tooLowBid = target.currentPrice + target.minBidIncrement - 100;

    let lowRes: { ok: boolean; error?: string } = { ok: true };
    act(() => {
      lowRes = result.current.placeBid('prod-1', tooLowBid);
    });
    expect(lowRes.ok).toBe(false);

    // Sign in as seller of prod-1 and attempt self-bidding
    act(() => {
      result.current.loginUser('seller@somjing.com', 'password123');
    });
    let selfBidRes: { ok: boolean; error?: string } = { ok: true };
    act(() => {
      selfBidRes = result.current.placeBid('prod-1', target.currentPrice + 2000);
    });
    expect(selfBidRes.ok).toBe(false);
  });

  it('TC-06: creates a new product listing with custom options and queues pending verification', () => {
    const { result } = renderHook(() => useStore(), { wrapper: createWrapper() });
    act(() => {
      result.current.loginUser('seller@somjing.com', 'password123');
    });

    const initialProductCount = result.current.products.length;
    const initialVerifyCount = result.current.verificationRequests.length;

    let createdId = '';
    act(() => {
      const prod = result.current.createProduct({
        title: 'BE@RBRICK 400% Sorayama Gold',
        category: 'art-toys',
        condition: 'New / Deadstock',
        description: 'กล่องซีลแท้จากโตเกียว',
        imageUrl: 'https://example.com/sorayama.jpg',
        options: [
          {
            id: 'opt-s1',
            label: '400% Gold Edition',
            colorHex: '#111111',
            spec: 'กล่องซีลโรงงาน',
            imageIndex: 0,
          },
        ],
        saleType: 'auction',
        startPrice: 15000,
        buyNowPrice: 22000,
        minBidIncrement: 500,
        durationHours: 24,
        serialNumber: 'MED-SORA-400-01',
        requestVerify: true,
        purchaseProofNote: 'มีใบเสร็จร้านทางการ',
      });
      createdId = prod?.id ?? '';
    });

    expect(result.current.products.length).toBe(initialProductCount + 1);
    expect(result.current.verificationRequests.length).toBe(initialVerifyCount + 1);
    const createdProduct = result.current.products.find((p) => p.id === createdId)!;
    expect(createdProduct.verificationStatus).toBe('pending');
    expect(createdProduct.options[0].label).toBe('400% Gold Edition');
  });

  it('TC-07: submits a standalone verification request into pending queue', () => {
    const { result } = renderHook(() => useStore(), { wrapper: createWrapper() });
    const initialCount = result.current.verificationRequests.length;

    act(() => {
      result.current.submitVerificationRequest({
        productTitle: 'Rolex Datejust 36 Blue Dial',
        productImage: 'https://example.com/rolex.jpg',
        category: 'watches',
        serialNumber: 'RLX-36-99102',
        purchaseProofNote: 'ใบรับประกันลงวันที่และกล่องแท้ครบชุด',
      });
    });

    expect(result.current.verificationRequests.length).toBe(initialCount + 1);
    expect(result.current.verificationRequests[0].status).toBe('pending');
    expect(result.current.verificationRequests[0].serialNumber).toBe('RLX-36-99102');
  });

  it('TC-08: creates a new Wanted Listing in open state', () => {
    const { result } = renderHook(() => useStore(), { wrapper: createWrapper() });
    const initialCount = result.current.wantedListings.length;

    act(() => {
      result.current.createWantedListing({
        title: 'ตามหา Nike SB Dunk Jarritos US 9.5',
        category: 'sneakers',
        targetBudget: 32000,
        desiredCondition: 'New / Deadstock',
        description: 'ต้องการคู่แท้กล่องครบ',
        referenceImage: 'https://example.com/jarritos.jpg',
      });
    });

    expect(result.current.wantedListings.length).toBe(initialCount + 1);
    expect(result.current.wantedListings[0].status).toBe('open');
    expect(result.current.wantedListings[0].targetBudget).toBe(32000);
  });

  it('TC-09: seller submits offer to buyer Wanted Listing and buyer accepts it into Escrow', () => {
    const { result } = renderHook(() => useStore(), { wrapper: createWrapper() });
    const openListing = result.current.wantedListings.find((w) => w.id === 'want-1')!;

    // Switch to seller account properly to submit offer
    act(() => {
      result.current.loginUser('seller@somjing.com', 'password123');
    });

    act(() => {
      result.current.submitWantedOffer({
        wantedId: openListing.id,
        price: 58000,
        condition: 'Mint 99%',
        isVerifiedItem: true,
        message: 'มีของพร้อมส่งครับ',
        image: 'https://example.com/offer.jpg',
      });
    });

    const updatedListing = result.current.wantedListings.find((w) => w.id === openListing.id)!;
    const newestOffer = updatedListing.offers[0];
    expect(newestOffer.price).toBe(58000);

    // Buyer logs back in to accept offer & pay into Escrow
    act(() => {
      result.current.loginUser('buyer@somjing.com', 'password123');
    });

    act(() => {
      result.current.completeSimulatedPayment(
        {
          sourceType: 'wanted_offer',
          sourceId: newestOffer.id,
          wantedListingId: updatedListing.id,
          productTitle: updatedListing.title,
          productImage: newestOffer.image,
          selectedOptionLabel: newestOffer.condition,
          amount: newestOffer.price,
          sellerId: newestOffer.sellerId,
          sellerName: newestOffer.sellerName,
          isVerifiedItem: newestOffer.isVerifiedItem,
          certificateId: newestOffer.certificateId,
        },
        'PromptPay QR',
        '123 ถนนพระราม 4 กทม.'
      );
    });

    const fulfilledListing = result.current.wantedListings.find((w) => w.id === openListing.id)!;
    expect(fulfilledListing.status).toBe('fulfilled');
    expect(fulfilledListing.offers[0].status).toBe('accepted');
    expect(result.current.escrowOrders[0].status).toBe('held');
    expect(result.current.escrowOrders[0].shippingAddress).toBe('123 ถนนพระราม 4 กทม.');
  });

  it('TC-10: enforces buyer/seller permissions across 4-step Escrow lifecycle', () => {
    const { result } = renderHook(() => useStore(), { wrapper: createWrapper() });

    let orderId = '';
    act(() => {
      const order = result.current.completeSimulatedPayment(
        {
          sourceType: 'direct',
          sourceId: 'prod-7',
          productTitle: 'Air Jordan 1 Lost & Found',
          productImage: 'https://example.com/aj1.jpg',
          selectedOptionLabel: 'US 10 / 44 EUR',
          amount: 15800,
          sellerId: 'user-seller-1',
          sellerName: 'กิตติพงศ์ (Kitti Collectibles)',
          isVerifiedItem: false,
        },
        'Credit Card'
      );
      orderId = order.id;
    });

    // Buyer cannot mark order as shipped
    let buyerShipAttempt: { ok: boolean; error?: string } = { ok: true };
    act(() => {
      buyerShipAttempt = result.current.markOrderShipped(orderId, 'Kerry', 'FAKE123');
    });
    expect(buyerShipAttempt.ok).toBe(false);

    // Seller logs in and marks order shipped
    act(() => {
      result.current.loginUser('seller@somjing.com', 'password123');
    });
    act(() => {
      result.current.markOrderShipped(orderId, 'Kerry Express', 'KER99887766TH');
    });
    expect(result.current.escrowOrders.find((o) => o.id === orderId)?.status).toBe('shipped');

    // Seller cannot confirm buyer receipt
    let sellerConfirmAttempt: { ok: boolean; error?: string } = { ok: true };
    act(() => {
      sellerConfirmAttempt = result.current.confirmOrderReceived(orderId);
    });
    expect(sellerConfirmAttempt.ok).toBe(false);

    // Buyer logs back in, confirms receipt, and releases funds
    act(() => {
      result.current.loginUser('buyer@somjing.com', 'password123');
    });
    act(() => {
      result.current.confirmOrderReceived(orderId);
      result.current.releaseEscrowFunds(orderId);
    });
    const completedOrder = result.current.escrowOrders.find((o) => o.id === orderId)!;
    expect(completedOrder.status).toBe('released');
    expect(completedOrder.timeline.length).toBe(4);
  });

  it('TC-11: blocks non-admin from approving verify requests; admin approval issues Verified Badge', () => {
    const { result } = renderHook(() => useStore(), { wrapper: createWrapper() });
    const pendingReq = result.current.verificationRequests.find((r) => r.status === 'pending')!;

    // Buyer cannot approve verification
    let unauthorizedRes: { ok: boolean; error?: string } = { ok: true };
    act(() => {
      unauthorizedRes = result.current.reviewVerificationRequest(
        pendingReq.id,
        'approved',
        'unauthorized'
      );
    });
    expect(unauthorizedRes.ok).toBe(false);

    // Admin signs in and approves
    act(() => {
      result.current.loginUser('admin@somjing.com', 'password123');
    });
    act(() => {
      result.current.reviewVerificationRequest(
        pendingReq.id,
        'approved',
        'ตรวจสอบความแท้ผ่านครบทุกจุด'
      );
    });

    const reviewed = result.current.verificationRequests.find((r) => r.id === pendingReq.id)!;
    expect(reviewed.status).toBe('approved');
    expect(reviewed.certificateId).toMatch(/^SJ-CERT-2026-/);

    if (pendingReq.productId) {
      const linkedProduct = result.current.products.find((p) => p.id === pendingReq.productId)!;
      expect(linkedProduct.verificationStatus).toBe('verified');
      expect(linkedProduct.certificateId).toBe(reviewed.certificateId);
    }
  });

  it('TC-12: filing a complaint freezes Escrow to disputed and admin resolution refunds buyer', () => {
    const { result } = renderHook(() => useStore(), { wrapper: createWrapper() });
    const targetOrder = result.current.escrowOrders.find((o) => o.status === 'held')!;

    act(() => {
      result.current.fileComplaint({
        orderId: targetOrder.id,
        reason: 'สินค้าไม่ตรงปก',
        description: 'พบตำหนิไม่ได้ระบุในรายละเอียด',
      });
    });

    expect(result.current.escrowOrders.find((o) => o.id === targetOrder.id)?.status).toBe(
      'disputed'
    );
    const newestComplaint = result.current.complaints[0];
    expect(newestComplaint.status).toBe('pending');

    act(() => {
      result.current.loginUser('admin@somjing.com', 'password123');
    });
    act(() => {
      result.current.resolveComplaint(
        newestComplaint.id,
        'resolved_refund',
        'ตรวจสอบหลักฐานแล้วอนุมัติคืนเงินเต็มจำนวน'
      );
    });

    expect(
      result.current.complaints.find((c) => c.id === newestComplaint.id)?.status
    ).toBe('resolved_refund');
    expect(result.current.escrowOrders.find((o) => o.id === targetOrder.id)?.status).toBe(
      'refunded'
    );
  });

  it('TC-13: toggles product in Watchlist (Saved items)', () => {
    const { result } = renderHook(() => useStore(), { wrapper: createWrapper() });
    expect(result.current.watchlistIds.includes('prod-3')).toBe(false);

    act(() => {
      result.current.toggleWatchlist('prod-3');
    });
    expect(result.current.watchlistIds.includes('prod-3')).toBe(true);

    act(() => {
      result.current.toggleWatchlist('prod-3');
    });
    expect(result.current.watchlistIds.includes('prod-3')).toBe(false);
  });
});
