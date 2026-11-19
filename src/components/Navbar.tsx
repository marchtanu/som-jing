import React, { useState } from 'react';
import {
  LogOut,
  Menu,
  RotateCcw,
  Shield,
  ShoppingBag,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ActiveTab, UserRole } from '../types';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    setAuthModalOpen,
    logoutUser,
    switchDemoRole,
    resetDemoData,
    verificationRequests,
    complaints,
    escrowOrders,
    wantedListings,
    setSelectedProductId,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingVerifyCount = verificationRequests.filter((r) => r.status === 'pending').length;
  const pendingComplaintCount = complaints.filter((c) => c.status === 'pending').length;
  const adminBadgeCount = pendingVerifyCount + pendingComplaintCount;
  const activeEscrowCount = escrowOrders.filter(
    (o) => o.status !== 'released' && o.status !== 'refunded'
  ).length;
  const openWantedCount = wantedListings.filter((w) => w.status === 'open').length;

  const navItems: {
    id: ActiveTab;
    label: string;
    badge?: number;
  }[] = [
    { id: 'catalog', label: 'Explore & Auctions' },
    { id: 'sell', label: 'ลงขายสินค้า' },
    { id: 'verify', label: 'ขอ Verify' },
    { id: 'wanted', label: 'Wanted', badge: openWantedCount },
    { id: 'escrow', label: 'Escrow', badge: activeEscrowCount },
    { id: 'admin', label: 'Admin', badge: adminBadgeCount },
    { id: 'report', label: 'บทที่ 5' },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setSelectedProductId(null);
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const roles: { role: UserRole; label: string }[] = [
    { role: 'buyer', label: 'ผู้ซื้อ' },
    { role: 'seller', label: 'ผู้ขาย' },
    { role: 'admin', label: 'แอดมิน' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-canvas">
      {/* Utility Bar: #f5f5f5 soft-cloud, 36px height, right-aligned cluster */}
      <div className="bg-soft-cloud text-ink text-xs font-medium h-9">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 xl:px-14 h-full flex items-center justify-between gap-4">
          <div className="hidden md:flex items-center gap-2 text-mute">
            <span>Demo Role:</span>
            <div className="inline-flex items-center gap-2">
              {roles.map((r, idx) => {
                const isActive = currentUser?.role === r.role;
                return (
                  <React.Fragment key={r.role}>
                    {idx > 0 && <span className="text-hairline">|</span>}
                    <button
                      type="button"
                      onClick={() => switchDemoRole(r.role)}
                      className={`transition-colors ${
                        isActive
                          ? 'text-ink font-semibold underline underline-offset-4'
                          : 'text-mute hover:text-ink'
                      }`}
                    >
                      {r.label}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto text-xs font-medium text-ink">
            <button
              type="button"
              onClick={resetDemoData}
              className="inline-flex items-center gap-1 hover:text-mute transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>รีเซ็ตข้อมูล</span>
            </button>
            <span className="text-hairline">|</span>
            <button
              type="button"
              onClick={() => handleSelectTab('report')}
              className="hover:text-mute transition-colors"
            >
              Report Ch.5
            </button>
            <span className="text-hairline">|</span>
            {currentUser ? (
              <div className="inline-flex items-center gap-2">
                <span className="truncate max-w-[140px]">
                  Hi, {currentUser.name}
                </span>
                <button
                  type="button"
                  onClick={logoutUser}
                  className="text-mute hover:text-ink inline-flex items-center gap-1"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">Sign Out</span>
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

      {/* Primary Nav: #ffffff canvas, 64px height, 1px inset hairline-soft bottom edge */}
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

          {/* Left: Brand Emblem (32x32) */}
          <button
            type="button"
            onClick={() => handleSelectTab('catalog')}
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

          {/* Center: Nav Links with 2px solid #111111 bottom underline on active */}
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

          {/* Right: Circular Utility Icon Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleSelectTab('escrow')}
              className="btn-icon-circular relative"
              title="Escrow Orders"
              aria-label="Escrow Orders"
            >
              <ShoppingBag className="w-5 h-5" />
              {activeEscrowCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-ink text-canvas text-[10px] font-mono flex items-center justify-center">
                  {activeEscrowCount}
                </span>
              )}
            </button>
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
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="btn-icon-circular"
              title="บัญชีผู้ใช้"
              aria-label="บัญชีผู้ใช้"
            >
              <UserIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Full-Height Left Slide Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
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
              <p className="text-xs text-mute font-medium">Demo Role Switcher</p>
              <div className="flex flex-wrap gap-2">
                {roles.map((r) => (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => {
                      switchDemoRole(r.role);
                      setMobileMenuOpen(false);
                    }}
                    className={
                      currentUser?.role === r.role ? 'filter-chip-active' : 'filter-chip'
                    }
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
};
