import React, { useState } from 'react';
import { LogOut, RotateCcw, Shield, UserCheck, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { UserRole } from '../types';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    currentUser,
    loginUser,
    registerUser,
    logoutUser,
    upgradeToSeller,
    resetDemoData,
    escrowOrders,
    watchlistIds,
    setActiveTab,
  } = useStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('buyer@somjing.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<UserRole>('buyer');
  const [error, setError] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === 'login') {
      const res = loginUser(email, password);
      if (!res.ok) setError(res.error ?? 'เข้าสู่ระบบไม่สำเร็จ');
      return;
    }

    if (!name.trim() || !email.trim() || password.length < 6) {
      setError('กรุณากรอกชื่อ อีเมล และรหัสผ่านอย่างน้อย 6 ตัวอักษร');
      return;
    }
    const res = registerUser({
      name,
      email,
      password,
      phone,
      defaultAddress: address,
      role,
    });
    if (!res.ok) setError(res.error ?? 'สมัครสมาชิกไม่สำเร็จ');
  };

  const quickFill = (targetEmail: string) => {
    setMode('login');
    setEmail(targetEmail);
    setPassword('password123');
    setError(null);
  };

  const myOrdersCount = currentUser
    ? escrowOrders.filter(
        (o) =>
          currentUser.role === 'admin' ||
          o.buyerId === currentUser.id ||
          o.sellerId === currentUser.id
      ).length
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 animate-fade-in">
      <div className="bg-canvas border border-hairline rounded-none max-w-md w-full overflow-hidden animate-modal-in">
        <div className="flex items-center justify-between px-6 py-5 border-b border-hairline">
          <h2 className="text-2xl font-medium text-ink leading-[1.2]">
            {currentUser
              ? 'บัญชีผู้ใช้ของคุณ'
              : mode === 'login'
                ? 'Sign In to SomJing'
                : 'Join SomJing'}
          </h2>
          <button
            type="button"
            onClick={() => setAuthModalOpen(false)}
            className="btn-icon-circular"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentUser ? (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4 pb-5 border-b border-hairline">
              <div className="w-14 h-14 bg-ink text-canvas font-medium text-lg flex items-center justify-center shrink-0">
                {currentUser.avatarInitials}
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="text-lg font-medium text-ink truncate">{currentUser.name}</p>
                <p className="text-xs font-mono text-mute">{currentUser.email}</p>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-success pt-0.5">
                  {currentUser.role === 'admin' ? (
                    <Shield className="w-3.5 h-3.5" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5" />
                  )}
                  <span className="uppercase">{currentUser.role} ACCOUNT</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-soft-cloud p-4">
                <p className="text-xs text-mute">รายการที่บันทึกไว้</p>
                <p className="text-xl font-mono font-medium text-ink mt-0.5">
                  {watchlistIds.length}
                </p>
              </div>
              <div className="bg-soft-cloud p-4">
                <p className="text-xs text-mute">คำสั่งซื้อ Escrow</p>
                <p className="text-xl font-mono font-medium text-ink mt-0.5">
                  {myOrdersCount}
                </p>
              </div>
            </div>

            <div className="text-xs text-charcoal space-y-1">
              <p>
                <strong className="text-ink">เบอร์โทร:</strong> {currentUser.phone}
              </p>
              <p>
                <strong className="text-ink">ที่อยู่จัดส่งเริ่มต้น:</strong>{' '}
                {currentUser.defaultAddress || '-'}
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {currentUser.role === 'buyer' && (
                <button
                  type="button"
                  onClick={() => {
                    upgradeToSeller();
                    setAuthModalOpen(false);
                    setActiveTab('sell');
                  }}
                  className="btn-secondary w-full h-11 text-sm border border-ink"
                >
                  เปิดสิทธิ์ลงขายสินค้า (Activate Seller Mode)
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setAuthModalOpen(false);
                  setActiveTab('escrow');
                }}
                className="btn-secondary w-full h-11 text-sm"
              >
                ไปยังคำสั่งซื้อ Escrow ของฉัน
              </button>

              <button
                type="button"
                onClick={() => logoutUser()}
                className="btn-primary w-full h-11 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>ออกจากระบบ (เพื่อเข้าใช้อีกบัญชี)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  resetDemoData();
                  setAuthModalOpen(false);
                }}
                className="w-full py-2 text-xs font-medium text-mute hover:text-ink inline-flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเซ็ตข้อมูลจำลองทั้งหมดเป็นค่าเริ่มต้น</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={
                  mode === 'login'
                    ? 'filter-chip-active flex-1 justify-center'
                    : 'filter-chip flex-1 justify-center'
                }
              >
                เข้าสู่ระบบ
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className={
                  mode === 'register'
                    ? 'filter-chip-active flex-1 justify-center'
                    : 'filter-chip flex-1 justify-center'
                }
              >
                สมัครสมาชิก
              </button>
            </div>

            {error && <p className="text-sm font-medium text-sale">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-mute mb-1.5">
                      ชื่อ-นามสกุล / ชื่อร้านค้า *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="เช่น พิมพ์ชนก ใจดี"
                      className="hairline-input w-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-mute mb-1.5">
                        เบอร์โทรศัพท์
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="08x-xxx-xxxx"
                        className="hairline-input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-mute mb-1.5">
                        ประเภทบัญชี
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="hairline-input w-full"
                      >
                        <option value="buyer">ผู้ซื้อ / นักสะสม</option>
                        <option value="seller">ผู้ขายสินค้า</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-mute mb-1.5">
                      ที่อยู่จัดส่ง (ไม่บังคับ)
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="บ้านเลขที่ ถนน เขต จังหวัด รหัสไปรษณีย์"
                      className="hairline-input w-full"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-mute mb-1.5">อีเมล</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="hairline-input w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-mute mb-1.5">รหัสผ่าน</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="hairline-input w-full"
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              </button>
            </form>

            {/* Test Account Credentials Helper */}
            <div className="pt-4 border-t border-hairline space-y-2.5">
              <p className="text-xs font-medium text-mute">
                เติมข้อมูลบัญชีทดสอบเพื่อเข้าสู่ระบบ (รหัสผ่าน:{' '}
                <span className="font-mono text-ink">password123</span>)
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => quickFill('buyer@somjing.com')}
                  className="filter-chip text-xs"
                >
                  ผู้ซื้อ (buyer@somjing.com)
                </button>
                <button
                  type="button"
                  onClick={() => quickFill('seller@somjing.com')}
                  className="filter-chip text-xs"
                >
                  ผู้ขาย (seller@somjing.com)
                </button>
                <button
                  type="button"
                  onClick={() => quickFill('admin@somjing.com')}
                  className="filter-chip text-xs"
                >
                  แอดมิน (admin@somjing.com)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
