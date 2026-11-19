import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, renderHook, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { StoreProvider, useStore } from '../context/StoreContext';

function createWrapper() {
  return ({ children }: { children: React.ReactNode }) => (
    <StoreProvider>{children}</StoreProvider>
  );
}

describe('SomJing (สมจริง) E-Commerce Prototype Test Suite (TC-01 to TC-12)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('TC-01: registers a new user account and signs them in automatically', () => {
    const { result } = renderHook(() => useStore(), { wrapper: createWrapper() });

    let response: { ok: boolean; error?: string } = { ok: false };
    act(() => {
      response = result.current.registerUser({
        name: 'พิมพ์ชนก นักสะสม',
        email: 'collector@somjing.com',
        password: 'secret123',
        phone: '089-999-1234',
        role: 'buyer',
      });
    });

    expect(response.ok).toBe(true);
    expect(result.current.currentUser?.email).toBe('collector@somjing.com');
    expect(result.current.currentUser?.role).toBe('buyer');
  });

  it('TC-02: logs in with demo seller credentials and switches role to admin', () => {
    const { result } = renderHook(() => useStore(), { wrapper: createWrapper() });

    let loginRes: { ok: boolean; error?: string } = { ok: false };
    act(() => {
      loginRes = result.current.loginUser('seller@somjing.com', 'password123');
    });

    expect(loginRes.ok).toBe(true);
    expect(result.current.currentUser?.role).toBe('seller');

    act(() => {
      result.current.switchDemoRole('admin');
    });

    expect(result.current.currentUser?.role).toBe('admin');
  });

  it('TC-03: renders catalog with search, categories, and verified filter UI', () => {
    render(<App />);

    expect(screen.getByText(/ALL COLLECTIBLES/i)).toBeInTheDocument();
    expect(
      screen.getByText(/BE@RBRICK 1000% KAWS Companion Tension/i)
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search items, Cert ID/i)).toBeInTheDocument();
    expect(screen.getByText(/Verified Only/i)).toBeInTheDocument();
  });

  it('TC-04: accepts a valid auction bid and updates current price and bid history', () => {
    const { result } = renderHook(() => useStore(), { wrapper: createWrapper() });
    const target = result.current.products.find((p) => p.id === 'prod-1')!;
    const validBid = target.currentPrice + target.minBidIncrement;

    let bidRes: { ok: boolean; error?: string } = { ok: false };
    act(() => {
      bidRes = result.current.placeBid('prod-1', validBid);
    });

    expect(bidRes.ok).toBe(true);
    const updated = result.current.products.find((p) => p.id === 'prod-1')!;
    expect(updated.currentPrice).toBe(validBid);
    expect(updated.bids[0].amount).toBe(validBid);
  });

  it('TC-05: rejects an auction bid below currentPrice + minBidIncrement', () => {
    const { result } = renderHook(() => useStore(), { wrapper: createWrapper() });
    const target = result.current.products.find((p) => p.id === 'prod-1')!;
    const tooLowBid = target.currentPrice + target.minBidIncrement - 100;

    let bidRes: { ok: boolean; error?: string } = { ok: true };
    act(() => {
      bidRes = result.current.placeBid('prod-1', tooLowBid);
    });

    expect(bidRes.ok).toBe(false);
    expect(bidRes.error).toBeTruthy();
    const unchanged = result.current.products.find((p) => p.id === 'prod-1')!;
    expect(unchanged.currentPrice).toBe(target.currentPrice);
  });

  it('TC-06: creates a new product listing and queues a pending verification request', () => {
    const { result } = renderHook(() => useStore(), { wrapper: createWrapper() });
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
        saleType: 'auction',
        startPrice: 15000,
        buyNowPrice: 22000,
        minBidIncrement: 500,
        durationHours: 24,
        serialNumber: 'MED-SORA-400-01',
        requestVerify: true,
        purchaseProofNote: 'มีใบเสร็จร้านทางการ',
      });
      createdId = prod.id;
    });

    expect(result.current.products.length).toBe(initialProductCount + 1);
    expect(result.current.verificationRequests.length).toBe(initialVerifyCount + 1);
    const createdProduct = result.current.products.find((p) => p.id === createdId)!;
    expect(createdProduct.verificationStatus).toBe('pending');
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

  it('TC-09: submits an offer to Wanted Listing and accepts it into Escrow', () => {
    const { result } = renderHook(() => useStore(), { wrapper: createWrapper() });
    const openListing = result.current.wantedListings.find((w) => w.status === 'open')!;

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

    act(() => {
      result.current.completeSimulatedPayment(
        {
          sourceType: 'wanted_offer',
          sourceId: newestOffer.id,
          wantedListingId: updatedListing.id,
          productTitle: updatedListing.title,
          productImage: newestOffer.image,
          amount: newestOffer.price,
          sellerId: newestOffer.sellerId,
          sellerName: newestOffer.sellerName,
          isVerifiedItem: newestOffer.isVerifiedItem,
          certificateId: newestOffer.certificateId,
        },
        'PromptPay QR'
      );
    });

    const fulfilledListing = result.current.wantedListings.find((w) => w.id === openListing.id)!;
    expect(fulfilledListing.status).toBe('fulfilled');
    expect(fulfilledListing.offers[0].status).toBe('accepted');
    expect(result.current.escrowOrders[0].status).toBe('held');
  });

  it('TC-10: executes full 4-step Escrow lifecycle (held -> shipped -> received -> released)', () => {
    const { result } = renderHook(() => useStore(), { wrapper: createWrapper() });

    let orderId = '';
    act(() => {
      const order = result.current.completeSimulatedPayment(
        {
          sourceType: 'direct',
          sourceId: 'prod-6',
          productTitle: 'Nintendo Game Boy Micro Famicom',
          productImage: 'https://example.com/gbm.jpg',
          amount: 9200,
          sellerId: 'user-seller-2',
          sellerName: 'Siam Analog Vault',
          isVerifiedItem: true,
          certificateId: 'SJ-CERT-2026-8799',
        },
        'Credit Card'
      );
      orderId = order.id;
    });

    expect(result.current.escrowOrders.find((o) => o.id === orderId)?.status).toBe('held');

    act(() => {
      result.current.markOrderShipped(orderId, 'Kerry Express', 'KER99887766TH');
    });
    expect(result.current.escrowOrders.find((o) => o.id === orderId)?.status).toBe('shipped');

    act(() => {
      result.current.confirmOrderReceived(orderId);
    });
    expect(result.current.escrowOrders.find((o) => o.id === orderId)?.status).toBe('received');

    act(() => {
      result.current.releaseEscrowFunds(orderId);
    });
    const completedOrder = result.current.escrowOrders.find((o) => o.id === orderId)!;
    expect(completedOrder.status).toBe('released');
    expect(completedOrder.timeline.length).toBe(4);
  });

  it('TC-11: admin approves pending verification request and issues Verified Badge + Certificate ID', () => {
    const { result } = renderHook(() => useStore(), { wrapper: createWrapper() });
    const pendingReq = result.current.verificationRequests.find((r) => r.status === 'pending')!;

    act(() => {
      result.current.switchDemoRole('admin');
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
      result.current.switchDemoRole('admin');
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
});
