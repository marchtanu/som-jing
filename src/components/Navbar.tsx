import React from 'react';
import {
  BadgeCheck,
  BookOpen,
  Gavel,
  Lock,
  LogIn,
  LogOut,
  PlusCircle,
  RotateCcw,
  SearchCode,
  Shield,
  Store,
  UserCheck,
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
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    { id: 'catalog', label: 'ตลาดสินค้า & ประมูล', icon: <Gavel className="w-4 h-4" /> },
    { id: 'sell', label: 'ลงขายสินค้า', icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'verify', label: 'ขอ Verify', icon: <BadgeCheck className="w-4 h-4" /> },
    {
      id: 'wanted',
      label: 'Wanted Board',
      icon: <SearchCode className="w-4 h-4" />,
      badge: openWantedCount,
    },
    {
      id: 'escrow',
      label: 'สถานะ Escrow',
      icon: <Lock className="w-4 h-4" />,
      badge: activeEscrowCount,
    },
    {
      id: 'admin',
      label: 'หน้าแอดมิน',
      icon: <Shield className="w-4 h-4" />,
      badge: adminBadgeCount,
    },
    { id: 'report', label: 'รายงานบทที่ 5', icon: <BookOpen className="w-4 h-4" /> },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setSelectedProductId(null);
    setActiveTab(tab);
  };

  const roles: { role: UserRole; label: string }[] = [
    { role: 'buyer', label: 'ผู้ซื้อ (Buyer)' },
    { role: 'seller', label: 'ผู้ขาย (Seller)' },
    { role: 'admin', label: 'แอดมิน (Admin)' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-stoneBorder">
      {/* Top Demo Control Bar */}
      <div className="bg-ink text-ivory text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-ivory/80 font-medium">
              <UserCheck className="w-3.5 h-3.5 text-vermilion" />
              <span>สลับบทบาทสาธิต (Demo Switcher):</span>
            </span>
            <div className="inline-flex items-center rounded-lg bg-white/10 p-0.5 gap-0.5">
              {roles.map((r) => {
                const isActive = currentUser?.role === r.role;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => switchDemoRole(r.role)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      isActive
                        ? 'bg-vermilion text-white'
                        : 'text-ivory/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetDemoData}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-ivory transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ตข้อมูลตัวอย่าง</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <button
            type="button"
            onClick={() => handleSelectTab('catalog')}
            className="flex items-center gap-2.5 text-left group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-vermilion text-white flex items-center justify-center shadow-sm group-hover:bg-vermilion-hover transition-colors">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold tracking-tight text-ink">SomJing</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-sand text-mutedInk">
                  สมจริง
                </span>
              </div>
              <p className="text-[11px] text-mutedInk hidden sm:block">
                Verified Collectibles &amp; Escrow Auction
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-ink text-white'
                      : 'text-mutedInk hover:text-ink hover:bg-sand'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[11px] font-mono font-semibold ${
                        active ? 'bg-vermilion text-white' : 'bg-vermilion-soft text-vermilion'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Account Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-sand border border-stoneBorder rounded-xl px-3 py-1.5">
                  <div className="w-7 h-7 rounded-lg bg-ink text-white text-xs font-bold flex items-center justify-center">
                    {currentUser.avatarInitials}
                  </div>
                  <div className="hidden sm:block text-left leading-tight">
                    <p className="text-xs font-semibold text-ink max-w-[130px] truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[11px] text-mutedInk uppercase font-mono">
                      {currentUser.role}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logoutUser}
                  className="p-2 rounded-xl border border-stoneBorder text-mutedInk hover:text-ink hover:bg-sand transition-colors"
                  title="ออกจากระบบ"
                  aria-label="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-vermilion hover:bg-vermilion-hover text-white text-sm font-semibold transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบ / สมัครสมาชิก</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile / Tablet Scrollable Navigation */}
        <nav className="flex lg:hidden items-center gap-1.5 pb-3 overflow-x-auto">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-ink text-white'
                    : 'bg-sand text-mutedInk hover:text-ink'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span
                    className={`px-1.5 rounded-full text-[10px] font-mono font-semibold ${
                      active ? 'bg-vermilion text-white' : 'bg-white text-vermilion'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
