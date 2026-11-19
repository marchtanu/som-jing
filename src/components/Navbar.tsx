import React, { useState } from 'react';
import {
  Heart,
  LogOut,
  Menu,
  Shield,
  ShoppingBag,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ActiveTab } from '../types';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    setAuthModalOpen,
    logoutUser,
    verificationRequests,
    complaints,
    escrowOrders,
    wantedListings,
    watchlistIds,
    setSelectedProductId,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = currentUser?.role ?? 'guest';
  const isBuyer = role === 'buyer';
  const isSeller = role === 'seller';
  const isAdmin = role === 'admin';

  const pendingVerifyCount = verificationRequests.filter((r) => r.status === 'pending').length;
  const pendingComplaintCount = complaints.filter((c) => c.status === 'pending').length;
  const adminBadgeCount = pendingVerifyCount + pendingComplaintCount;

  const myActiveEscrowCount = currentUser
    ? escrowOrders.filter((o) => {
        const isActive = o.status !== 'released' && o.status !== 'refunded';
        if (!isActive) return false;
        if (isAdmin) return true;
        if (isBuyer) return o.buyerId === currentUser.id;
        if (isSeller) return o.sellerId === currentUser.id;
        return false;
      }).length
    : 0;
  const openWantedCount = wantedListings.filter((w) => w.status === 'open').length;

  const navItems: {
    id: ActiveTab;
    label: string;
    badge?: number;
  }[] = (() => {
    if (isAdmin) {
      return [
        { id: 'admin', label: 'Admin Console', badge: adminBadgeCount },
        { id: 'catalog', label: 'Explore & Auctions' },
        { id: 'wanted', label: 'Wanted', badge: openWantedCount },
        { id: 'escrow', label: 'Escrow ทั้งระบบ', badge: myActiveEscrowCount },
        { id: 'report', label: 'บทที่ 5' },
      ];
    }
    if (isSeller) {
      return [
        { id: 'catalog', label: 'Explore & Auctions' },
        { id: 'sell', label: 'ลงขายสินค้า' },
        { id: 'verify', label: 'ขอ Verify' },
        { id: 'wanted', label: 'Wanted (เสนอขาย)', badge: openWantedCount },
        { id: 'escrow', label: 'รายการขาย Escrow', badge: myActiveEscrowCount },
        { id: 'report', label: 'บทที่ 5' },
      ];
    }
    if (isBuyer) {
      return [
        { id: 'catalog', label: 'Explore & Auctions' },
        { id: 'wanted', label: 'Wanted', badge: openWantedCount },
        { id: 'escrow', label: 'คำสั่งซื้อ Escrow', badge: myActiveEscrowCount },
        { id: 'report', label: 'บทที่ 5' },
      ];
    }
    // Guest
    return [
      { id: 'catalog', label: 'Explore & Auctions' },
      { id: 'wanted', label: 'Wanted', badge: openWantedCount },
      { id: 'report', label: 'บทที่ 5' },
    ];
  })();

  const handleSelectTab = (tab: ActiveTab) => {
    setSelectedProductId(null);
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const roleBadgeLabel =
    isAdmin ? 'Admin' : isSeller ? 'Seller' : 'Customer';

  return (
    <header className="sticky top-0 z-40 bg-canvas">
      {/* Real Commerce Utility Bar (#f5f5f5 soft-cloud, 36px height) */}
      <div className="bg-soft-cloud text-ink text-xs font-medium h-9">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 xl:px-14 h-full flex items-center justify-between gap-4">
          <p className="hidden md:block text-mute truncate">
            {isAdmin
              ? 'SomJing Trust & Verification Center · Administrator Workspace'
              : isSeller
                ? 'SomJing Seller Hub · ตรวจรับรองความแท้ & รับเงินปลอดภัยผ่าน Escrow'
                : 'SomJing Authenticity Guarantee · 100% Escrow Protected Transactions'}
          </p>

          <div className="flex items-center gap-3 ml-auto text-xs font-medium text-ink">
            <button
              type="button"
              onClick={() => handleSelectTab('report')}
              className="hover:text-mute transition-colors"
            >
              คู่มือ &amp; รายงานบทที่ 5
            </button>
            <span className="text-hairline">|</span>
            {currentUser ? (
              <div className="inline-flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="hover:underline underline-offset-4 truncate max-w-[200px]"
                >
                  {currentUser.name} ({roleBadgeLabel})
                </button>
                <span className="text-hairline">|</span>
                <button
                  type="button"
                  onClick={logoutUser}
                  className="text-mute hover:text-ink inline-flex items-center gap-1"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="hover:text-mute transition-colors"
              >
                Join Us / Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary Nav */}
      <div className="bg-canvas shadow-inset-hairline">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 xl:px-14 h-16 flex items-center justify-between gap-4">
          {/* Mobile Hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="btn-icon-circular"
              aria-label="เปิดเมนู"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Left: Brand Emblem */}
          <button
            type="button"
            onClick={() => handleSelectTab(isAdmin ? 'admin' : 'catalog')}
            className="flex items-center gap-2.5 shrink-0"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect width="32" height="32" fill="#111111" />
              <path
                d="M9 19.5L13.8 11H18.5L13.7 19.5H9ZM14.8 21L19.6 12.5H23L18.2 21H14.8Z"
                fill="#FFFFFF"
              />
            </svg>
            <span className="font-display text-2xl tracking-wide text-ink leading-none pt-0.5">
              SOMJING
            </span>
          </button>

          {/* Center: Role-Specific Nav Links */}
          <nav className="hidden lg:flex items-center justify-center gap-6 h-full">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  className={`relative h-full inline-flex items-center gap-1.5 text-base font-medium transition-colors whitespace-nowrap ${
                    active ? 'text-ink' : 'text-ink/80 hover:text-ink'
                  }`}
                >
                  <span>{item.label}</span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="font-mono text-[11px] font-semibold text-mute">
                      ({item.badge})
                    </span>
                  )}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-ink" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Role-Fitted Circular Icon Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {(isBuyer || role === 'guest') && (
              <button
                type="button"
                onClick={() => handleSelectTab('catalog')}
                className="btn-icon-circular relative"
                title="รายการที่บันทึกไว้ (Watchlist)"
                aria-label="รายการที่บันทึกไว้"
              >
                <Heart className="w-5 h-5" />
                {watchlistIds.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-ink text-canvas text-[10px] font-mono flex items-center justify-center">
                    {watchlistIds.length}
                  </span>
                )}
              </button>
            )}

            {currentUser && (
              <button
                type="button"
                onClick={() => handleSelectTab('escrow')}
                className="btn-icon-circular relative"
                title={isSeller ? 'รายการขาย Escrow' : isAdmin ? 'Escrow ทั้งระบบ' : 'คำสั่งซื้อ Escrow'}
                aria-label="คำสั่งซื้อ Escrow"
              >
                <ShoppingBag className="w-5 h-5" />
                {myActiveEscrowCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-ink text-canvas text-[10px] font-mono flex items-center justify-center">
                    {myActiveEscrowCount}
                  </span>
                )}
              </button>
            )}

            {isAdmin && (
              <button
                type="button"
                onClick={() => handleSelectTab('admin')}
                className="btn-icon-circular relative hidden sm:inline-flex"
                title="Admin Console"
                aria-label="Admin Console"
              >
                <Shield className="w-5 h-5" />
                {adminBadgeCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-sale text-canvas text-[10px] font-mono flex items-center justify-center">
                    {adminBadgeCount}
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="btn-icon-circular"
              title={currentUser ? `บัญชีของ ${currentUser.name}` : 'เข้าสู่ระบบ / สมัครสมาชิก'}
              aria-label="บัญชีผู้ใช้"
            >
              <UserIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Full-Height Left Slide Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex animate-fade-in">
          <div
            className="fixed inset-0 bg-ink/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-80 max-w-[85vw] bg-canvas h-full flex flex-col justify-between p-6 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-hairline">
                <span className="font-display text-2xl text-ink">SOMJING</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-icon-circular"
                  aria-label="ปิดเมนู"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="divide-y divide-hairline-soft">
                {navItems.map((item) => {
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full py-5 flex items-center justify-between text-left text-base font-medium ${
                        active ? 'text-ink font-semibold underline underline-offset-4' : 'text-charcoal'
                      }`}
                    >
                      <span>{item.label}</span>
                      {typeof item.badge === 'number' && item.badge > 0 && (
                        <span className="font-mono text-xs text-mute">({item.badge})</span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-hairline space-y-3">
              {currentUser ? (
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium text-ink">{currentUser.name}</p>
                    <p className="text-xs text-mute uppercase font-mono">{currentUser.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalOpen(true);
                    }}
                    className="btn-secondary w-full h-10 text-sm"
                  >
                    จัดการบัญชี / ออกจากระบบ
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="btn-primary w-full h-10 text-sm"
                >
                  Join Us / Sign In
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
};
