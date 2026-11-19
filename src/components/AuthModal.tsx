import React, { useState } from 'react';
import { Lock, Mail, Phone, UserPlus, User as UserIcon, X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
      <div className="bg-paper border border-stoneBorder rounded-2xl max-w-md w-full shadow-elevated overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stoneBorder bg-sand/50">
          <h2 className="text-lg font-bold text-ink">
            {mode === 'login' ? 'เข้าสู่ระบบ SomJing' : 'สมัครสมาชิกใหม่'}
          </h2>
          <button
            type="button"
            onClick={() => setAuthModalOpen(false)}
            className="p-1.5 rounded-lg text-mutedInk hover:text-ink hover:bg-sand"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-sand mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                mode === 'login' ? 'bg-paper text-ink shadow-sm' : 'text-mutedInk hover:text-ink'
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                mode === 'register'
                  ? 'bg-paper text-ink shadow-sm'
                  : 'text-mutedInk hover:text-ink'
              }`}
            >
              สมัครสมาชิก
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    ชื่อ-นามสกุล / ชื่อร้านค้า
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-mutedInk absolute left-3 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="เช่น พิมพ์ชนก ใจดี"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stoneBorder bg-ivory/60 text-sm focus:outline-none focus:ring-2 focus:ring-vermilion/30 focus:border-vermilion"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">เบอร์โทรศัพท์</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-mutedInk absolute left-3 top-3" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="08x-xxx-xxxx"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stoneBorder bg-ivory/60 text-sm focus:outline-none focus:ring-2 focus:ring-vermilion/30 focus:border-vermilion"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">ประเภทบัญชี</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stoneBorder bg-ivory/60 text-sm focus:outline-none focus:ring-2 focus:ring-vermilion/30 focus:border-vermilion"
                    >
                      <option value="buyer">ผู้ซื้อ / นักสะสม</option>
                      <option value="seller">ผู้ขายสินค้า</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">อีเมล</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-mutedInk absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stoneBorder bg-ivory/60 text-sm focus:outline-none focus:ring-2 focus:ring-vermilion/30 focus:border-vermilion"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-mutedInk absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stoneBorder bg-ivory/60 text-sm focus:outline-none focus:ring-2 focus:ring-vermilion/30 focus:border-vermilion"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-vermilion hover:bg-vermilion-hover text-white font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2"
            >
              {mode === 'register' && <UserPlus className="w-4 h-4" />}
              <span>{mode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชี SomJing'}</span>
            </button>
          </form>

          {/* Demo Accounts Helper */}
          <div className="mt-5 pt-4 border-t border-stoneBorder">
            <p className="text-xs font-semibold text-mutedInk mb-2">
              บัญชีทดสอบสำเร็จรูป (รหัสผ่าน: <span className="font-mono">password123</span>)
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => quickFill('buyer@somjing.com')}
                className="px-2.5 py-2 rounded-lg border border-stoneBorder hover:bg-sand text-ink font-medium"
              >
                ผู้ซื้อ (Buyer)
              </button>
              <button
                type="button"
                onClick={() => quickFill('seller@somjing.com')}
                className="px-2.5 py-2 rounded-lg border border-stoneBorder hover:bg-sand text-ink font-medium"
              >
                ผู้ขาย (Seller)
              </button>
              <button
                type="button"
                onClick={() => quickFill('admin@somjing.com')}
                className="px-2.5 py-2 rounded-lg border border-stoneBorder hover:bg-sand text-ink font-medium"
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
