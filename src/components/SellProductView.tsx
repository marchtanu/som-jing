import React, { useState } from 'react';
import {
  BadgeCheck,
  CheckCircle2,
  Gavel,
  ImagePlus,
  PlusCircle,
  Tag,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, ProductCategory } from '../types';
import { CATEGORY_LABELS, formatTHB } from '../utils/format';
import { SafeImage, VerificationBadge } from './ui';

const PRESET_IMAGES: { label: string; url: string; category: ProductCategory }[] = [
  {
    label: 'Bearbrick / Art Toy',
    url: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?auto=format&fit=crop&w=900&q=80',
    category: 'art-toys',
  },
  {
    label: 'Sneakers Limited',
    url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80',
    category: 'sneakers',
  },
  {
    label: 'Retro Camera',
    url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
    category: 'gadgets',
  },
  {
    label: 'Collector Watch',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    category: 'watches',
  },
];

export const SellProductView: React.FC = () => {
  const { createProduct, products, currentUser, setActiveTab, setSelectedProductId } = useStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProductCategory>('art-toys');
  const [condition, setCondition] = useState<Product['condition']>('New / Deadstock');
  const [saleType, setSaleType] = useState<'auction' | 'fixed'>('auction');
  const [startPrice, setStartPrice] = useState('12000');
  const [buyNowPrice, setBuyNowPrice] = useState('18500');
  const [minBidIncrement, setMinBidIncrement] = useState('500');
  const [durationHours, setDurationHours] = useState('24');
  const [serialNumber, setSerialNumber] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [description, setDescription] = useState('');
  const [requestVerify, setRequestVerify] = useState(true);
  const [purchaseProofNote, setPurchaseProofNote] = useState('');
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedStart = Math.max(100, Number(startPrice) || 1000);
    const created = createProduct({
      title: title.trim(),
      category,
      condition,
      description:
        description.trim() ||
        'สินค้าสะสมสภาพดี พร้อมส่งและคุ้มครองผ่านระบบพักเงิน SomJing Escrow',
      imageUrl: imageUrl.trim(),
      saleType,
      startPrice: parsedStart,
      buyNowPrice:
        saleType === 'auction' && Number(buyNowPrice) > parsedStart
          ? Number(buyNowPrice)
          : undefined,
      minBidIncrement: Math.max(100, Number(minBidIncrement) || 200),
      durationHours: Number(durationHours) || 24,
      serialNumber: serialNumber.trim(),
      requestVerify,
      purchaseProofNote: purchaseProofNote.trim(),
    });

    setCreatedProduct(created);
    setTitle('');
    setSerialNumber('');
    setDescription('');
    setPurchaseProofNote('');
  };

  const myListings = products.filter((p) =>
    currentUser ? p.sellerId === currentUser.id : true
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">ลงขายสินค้า &amp; เปิดรอบประมูล</h1>
          <p className="text-sm text-mutedInk mt-1">
            สร้างประกาศขายแบบราคาคงที่หรือเปิดประมูลสด พร้อมส่งคำขอรับรองความแท้ (Verified Badge) ได้ทันที
          </p>
        </div>
      </div>

      {createdProduct && (
        <div className="rounded-2xl bg-emeraldSeal-soft border border-emeraldSeal/25 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emeraldSeal shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-ink">
                ลงขาย &ldquo;{createdProduct.title}&rdquo; สำเร็จแล้ว!
              </p>
              <p className="text-xs text-mutedInk mt-0.5">
                {createdProduct.verificationStatus === 'pending'
                  ? 'คำขอ Verify ถูกส่งไปยังหน้าแอดมินแล้ว สามารถสลับไปหน้าแอดมินเพื่อกดอนุมัติได้ทันที'
                  : 'สินค้าแสดงบนหน้าหน้ารวมสินค้าเรียบร้อยแล้ว'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('catalog');
                setSelectedProductId(createdProduct.id);
              }}
              className="px-3.5 py-2 rounded-xl bg-ink text-white text-xs font-semibold hover:bg-ink/90"
            >
              ดูหน้าสินค้า
            </button>
            {createdProduct.verificationStatus === 'pending' && (
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className="px-3.5 py-2 rounded-xl bg-emeraldSeal text-white text-xs font-semibold hover:opacity-90"
              >
                ไปหน้าแอดมินอนุมัติ Verify
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 rounded-2xl bg-paper border border-stoneBorder p-6 space-y-5"
        >
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-vermilion" />
            <span>กรอกรายละเอียดสินค้า</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              ชื่อสินค้า / รุ่น / Edition *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น BE@RBRICK 400% Sorayama Gold, Nike Travis Scott Olive US 9"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 text-sm focus:outline-none focus:ring-2 focus:ring-vermilion/25 focus:border-vermilion"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">หมวดหมู่สินค้า</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 text-sm focus:outline-none focus:ring-2 focus:ring-vermilion/25"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">สภาพสินค้า</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as Product['condition'])}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 text-sm focus:outline-none focus:ring-2 focus:ring-vermilion/25"
              >
                <option value="New / Deadstock">New / Deadstock (ของใหม่มือ 1)</option>
                <option value="Mint (99%)">Mint (99% แกะเช็คสะสม)</option>
                <option value="Like New (95%)">Like New (95% มือสองสภาพดีมาก)</option>
                <option value="Vintage Good">Vintage Good (ของสะสมวินเทจ)</option>
              </select>
            </div>
          </div>

          {/* Sale Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">รูปแบบการขาย</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSaleType('auction')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  saleType === 'auction'
                    ? 'border-vermilion bg-vermilion-soft text-ink'
                    : 'border-stoneBorder bg-ivory/40 text-mutedInk hover:text-ink'
                }`}
              >
                <Gavel className="w-5 h-5 text-vermilion shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold">เปิดประมูลสด (Auction)</p>
                  <p className="text-[11px] opacity-80">ตั้งราคาเริ่มต้นและเวลานับถอยหลัง</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSaleType('fixed')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  saleType === 'fixed'
                    ? 'border-vermilion bg-vermilion-soft text-ink'
                    : 'border-stoneBorder bg-ivory/40 text-mutedInk hover:text-ink'
                }`}
              >
                <Tag className="w-5 h-5 text-vermilion shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold">ขายราคาคงที่ (Fixed Price)</p>
                  <p className="text-[11px] opacity-80">ผู้ซื้อกดสั่งซื้อและพักเงิน Escrow ทันที</p>
                </div>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                {saleType === 'auction' ? 'ราคาเริ่มต้นประมูล (บาท)' : 'ราคาขาย (บาท)'}
              </label>
              <input
                type="number"
                required
                min={100}
                value={startPrice}
                onChange={(e) => setStartPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-vermilion/25"
              />
            </div>

            {saleType === 'auction' && (
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  ราคาซื้อทันที Buy Now (ไม่บังคับ)
                </label>
                <input
                  type="number"
                  value={buyNowPrice}
                  onChange={(e) => setBuyNowPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-vermilion/25"
                />
              </div>
            )}
          </div>

          {saleType === 'auction' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  บิดเพิ่มขั้นต่ำต่อครั้ง (บาท)
                </label>
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={minBidIncrement}
                  onChange={(e) => setMinBidIncrement(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-vermilion/25"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  ระยะเวลาประมูล
                </label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 text-sm focus:outline-none focus:ring-2 focus:ring-vermilion/25"
                >
                  <option value="2">2 ชั่วโมง (ประมูลด่วน)</option>
                  <option value="12">12 ชั่วโมง</option>
                  <option value="24">24 ชั่วโมง (1 วัน)</option>
                  <option value="72">72 ชั่วโมง (3 วัน)</option>
                </select>
              </div>
            </div>
          )}

          {/* Image & Serial */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-ink">
              ภาพถ่ายสินค้า (เลือกตัวอย่างด่วนหรือวาง URL ภาพ)
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setImageUrl(preset.url);
                    setCategory(preset.category);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors inline-flex items-center gap-1.5 ${
                    imageUrl === preset.url
                      ? 'border-ink bg-ink text-white'
                      : 'border-stoneBorder bg-ivory text-mutedInk hover:text-ink'
                  }`}
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-vermilion/25"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Serial Number / รหัสสินค้า
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="เช่น MED-400-8812"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-vermilion/25"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                รายละเอียดและอุปกรณ์ที่มีให้
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="เช่น กล่องครบ ใบเสร็จแท้ ไม่เคยแกะซีล"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 text-sm focus:outline-none focus:ring-2 focus:ring-vermilion/25"
              />
            </div>
          </div>

          {/* Request Verify Checkbox */}
          <div className="rounded-xl bg-emeraldSeal-soft/70 border border-emeraldSeal/25 p-4 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={requestVerify}
                onChange={(e) => setRequestVerify(e.target.checked)}
                className="mt-1 h-4 w-4 accent-emeraldSeal rounded"
              />
              <div>
                <p className="text-sm font-bold text-ink inline-flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-emeraldSeal" />
                  <span>ส่งคำขอตรวจรับรองความแท้ (SomJing Verified Badge) ทันที</span>
                </p>
                <p className="text-xs text-mutedInk mt-0.5">
                  สินค้าที่ผ่านการ Verify จะได้รับตรารับรองสีเขียวและขายออกไวขึ้นเฉลี่ย 3 เท่า
                </p>
              </div>
            </label>

            {requestVerify && (
              <input
                type="text"
                value={purchaseProofNote}
                onChange={(e) => setPurchaseProofNote(e.target.value)}
                placeholder="ระบุหลักฐานเพิ่มเติม เช่น ซื้อจากช็อปสยามพารากอน มีใบเสร็จและโฮโลแกรม"
                className="w-full px-3 py-2 rounded-lg border border-emeraldSeal/30 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emeraldSeal/30"
              />
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-vermilion hover:bg-vermilion-hover text-white font-semibold text-sm transition-colors"
          >
            เผยแพร่ประกาศขายสินค้า
          </button>
        </form>

        {/* Preview & Seller's Recent Listings */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl bg-paper border border-stoneBorder p-5 space-y-3">
            <h3 className="text-sm font-bold text-ink">ตัวอย่างภาพการ์ดสินค้า</h3>
            <div className="rounded-xl border border-stoneBorder overflow-hidden bg-ivory">
              <div className="aspect-[4/3] bg-sand">
                <SafeImage
                  src={imageUrl}
                  alt={title || 'ตัวอย่างสินค้า'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-mutedInk">
                    {CATEGORY_LABELS[category]}
                  </span>
                  <VerificationBadge status={requestVerify ? 'pending' : 'unverified'} compact />
                </div>
                <p className="text-sm font-bold text-ink line-clamp-2">
                  {title || 'ชื่อสินค้าของคุณจะแสดงที่นี่...'}
                </p>
                <p className="text-base font-mono font-bold text-vermilion">
                  {formatTHB(Number(startPrice) || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-paper border border-stoneBorder p-5 space-y-3">
            <h3 className="text-sm font-bold text-ink">
              รายการสินค้าในบัญชี ({myListings.length})
            </h3>
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {myListings.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveTab('catalog');
                    setSelectedProductId(item.id);
                  }}
                  className="cursor-pointer flex items-center gap-3 p-2.5 rounded-xl border border-stoneBorder hover:bg-sand/50 transition-colors"
                >
                  <SafeImage
                    src={item.images[0]}
                    alt={item.title}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono font-bold text-vermilion">
                        {formatTHB(item.currentPrice)}
                      </span>
                      <VerificationBadge status={item.verificationStatus} compact />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
