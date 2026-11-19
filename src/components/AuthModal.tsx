import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { UserRole } from '../types';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, loginUser, registerUser } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('buyer@somjing.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
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
    const res = registerUser({ name, email, password, phone, role });
    if (!res.ok) setError(res.error ?? 'สมัครสมาชิกไม่สำเร็จ');
  };

  const quickFill = (targetEmail: string) => {
    setMode('login');
    setEmail(targetEmail);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
      <div className="bg-canvas border border-hairline rounded-none max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-hairline">
          <h2 className="text-2xl font-medium text-ink leading-[1.2]">
            {mode === 'login' ? 'Sign In to SomJing' : 'Join SomJing'}
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

        <div className="p-6 space-y-5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={mode === 'login' ? 'filter-chip-active flex-1 justify-center' : 'filter-chip flex-1 justify-center'}
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={mode === 'register' ? 'filter-chip-active flex-1 justify-center' : 'filter-chip flex-1 justify-center'}
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
                    ชื่อ-นามสกุล / ชื่อร้านค้า
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น พิมพ์ชนก ใจดี"
                    className="hairline-input w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-mute mb-1.5">เบอร์โทรศัพท์</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08x-xxx-xxxx"
                      className="hairline-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-mute mb-1.5">ประเภทบัญชี</label>
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

          {/* Demo Accounts Helper */}
          <div className="pt-4 border-t border-hairline space-y-2.5">
            <p className="text-xs font-medium text-mute">
              บัญชีทดสอบสำเร็จรูป (รหัสผ่าน: <span className="font-mono text-ink">password123</span>)
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => quickFill('buyer@somjing.com')}
                className="filter-chip text-xs"
              >
                ผู้ซื้อ (Buyer)
              </button>
              <button
                type="button"
                onClick={() => quickFill('seller@somjing.com')}
                className="filter-chip text-xs"
              >
                ผู้ขาย (Seller)
              </button>
              <button
                type="button"
                onClick={() => quickFill('admin@somjing.com')}
                className="filter-chip text-xs"
              >
                แอดมิน (Admin)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
