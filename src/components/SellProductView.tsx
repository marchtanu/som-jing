import React, { useState } from 'react';
import { CheckCircle2, ImagePlus, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, ProductCategory } from '../types';
import { CATEGORY_LABELS, formatTHB } from '../utils/format';
import { SafeImage, VerificationBadge } from './ui';

const PRESET_IMAGES: { label: string; url: string; category: ProductCategory }[] = [
  {
    label: 'Art Toy',
    url: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?auto=format&fit=crop&w=900&q=80',
    category: 'art-toys',
  },
  {
    label: 'Sneakers',
    url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80',
    category: 'sneakers',
  },
  {
    label: 'Retro Camera',
    url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
    category: 'gadgets',
  },
  {
    label: 'Watch',
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
    <div className="space-y-12">
      <div className="pb-6 border-b border-hairline">
        <h1 className="text-[32px] font-medium leading-[1.2] text-ink">
          ลงขายสินค้า &amp; เปิดรอบประมูล
        </h1>
        <p className="text-base text-mute mt-1">
          สร้างประกาศขายแบบราคาคงที่หรือเปิดประมูลสด พร้อมส่งคำขอรับรองความแท้ (Verified Badge) ได้ทันที
        </p>
      </div>

      {createdProduct && (
        <div className="bg-soft-cloud p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-ink">
                ลงขาย &ldquo;{createdProduct.title}&rdquo; สำเร็จแล้ว
              </p>
              <p className="text-mute mt-0.5">
                {createdProduct.verificationStatus === 'pending'
                  ? 'คำขอ Verify ถูกส่งไปยังหน้าแอดมินแล้ว สามารถสลับไปหน้าแอดมินเพื่อกดอนุมัติได้ทันที'
                  : 'สินค้าแสดงบนหน้าตลาดกลางเรียบร้อย'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('catalog');
                setSelectedProductId(createdProduct.id);
              }}
              className="filter-chip-active"
            >
              ดูหน้าสินค้า
            </button>
            {createdProduct.verificationStatus === 'pending' && (
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className="filter-chip"
              >
                ไปหน้าแอดมินอนุมัติ Verify
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              ชื่อสินค้า / รุ่น / Edition *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น BE@RBRICK 400% Sorayama Gold, Nike Travis Scott Olive US 9"
              className="hairline-input w-full"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">หมวดหมู่สินค้า</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="hairline-input w-full"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">สภาพสินค้า</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as Product['condition'])}
                className="hairline-input w-full"
              >
                <option value="New / Deadstock">New / Deadstock (ของใหม่มือ 1)</option>
                <option value="Mint (99%)">Mint (99% แกะเช็คสะสม)</option>
                <option value="Like New (95%)">Like New (95% มือสองสภาพดีมาก)</option>
                <option value="Vintage Good">Vintage Good (ของสะสมวินเทจ)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink">รูปแบบการขาย</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSaleType('auction')}
                className={saleType === 'auction' ? 'filter-chip-active' : 'filter-chip'}
              >
                เปิดประมูลสด (Live Auction)
              </button>
              <button
                type="button"
                onClick={() => setSaleType('fixed')}
                className={saleType === 'fixed' ? 'filter-chip-active' : 'filter-chip'}
              >
                ขายราคาคงที่ (Fixed Price)
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                {saleType === 'auction' ? 'ราคาเริ่มต้นประมูล (บาท)' : 'ราคาขาย (บาท)'}
              </label>
              <input
                type="number"
                required
                min={100}
                value={startPrice}
                onChange={(e) => setStartPrice(e.target.value)}
                className="hairline-input w-full font-mono"
              />
            </div>

            {saleType === 'auction' && (
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  ราคาซื้อทันที Buy Now (ไม่บังคับ)
                </label>
                <input
                  type="number"
                  value={buyNowPrice}
                  onChange={(e) => setBuyNowPrice(e.target.value)}
                  className="hairline-input w-full font-mono"
                />
              </div>
            )}
          </div>

          {saleType === 'auction' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  บิดเพิ่มขั้นต่ำต่อครั้ง (บาท)
                </label>
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={minBidIncrement}
                  onChange={(e) => setMinBidIncrement(e.target.value)}
                  className="hairline-input w-full font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  ระยะเวลาประมูล
                </label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="hairline-input w-full"
                >
                  <option value="2">2 ชั่วโมง</option>
                  <option value="12">12 ชั่วโมง</option>
                  <option value="24">24 ชั่วโมง</option>
                  <option value="72">72 ชั่วโมง</option>
                </select>
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            <label className="block text-sm font-medium text-ink">
              ภาพถ่ายสินค้า (เลือกภาพตัวอย่างหรือวาง URL)
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
                  className={imageUrl === preset.url ? 'filter-chip-active' : 'filter-chip'}
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
              className="hairline-input w-full font-mono text-xs"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Serial Number / รหัสสินค้า
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="เช่น MED-400-8812"
                className="hairline-input w-full font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                รายละเอียดและอุปกรณ์ที่มีให้
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="เช่น กล่องครบ ใบเสร็จแท้"
                className="hairline-input w-full"
              />
            </div>
          </div>

          {/* Request Verify Checkbox */}
          <div className="bg-soft-cloud p-5 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={requestVerify}
                onChange={(e) => setRequestVerify(e.target.checked)}
                className="mt-1 h-4 w-4 accent-ink"
              />
              <div>
                <p className="text-sm font-medium text-ink inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-success" />
                  <span>ส่งคำขอตรวจรับรองความแท้ (SomJing Verified Badge) ทันที</span>
                </p>
                <p className="text-xs text-mute mt-0.5">
                  สินค้าที่ผ่าน Verify จะได้รับตรารับรองและเลข Certificate ID เมื่อแอดมินอนุมัติ
                </p>
              </div>
            </label>

            {requestVerify && (
              <input
                type="text"
                value={purchaseProofNote}
                onChange={(e) => setPurchaseProofNote(e.target.value)}
                placeholder="ระบุหลักฐานเพิ่มเติม เช่น ซื้อจากช็อปสยามพารากอน มีใบเสร็จและโฮโลแกรม"
                className="hairline-input w-full text-xs"
              />
            )}
          </div>

          <button type="submit" className="btn-primary w-full sm:w-auto">
            เผยแพร่ประกาศขายสินค้า
          </button>
        </form>

        {/* Right: Nike-style 1:1 Card Preview & Recent Listings */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-3">
            <h2 className="text-base font-medium text-ink">ตัวอย่างการ์ดสินค้า (Live Preview)</h2>
            <div className="max-w-sm">
              <div className="aspect-square bg-soft-cloud relative overflow-hidden">
                <SafeImage
                  src={imageUrl}
                  alt={title || 'ตัวอย่างสินค้า'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <VerificationBadge status={requestVerify ? 'pending' : 'unverified'} compact />
                </div>
              </div>
              <div className="pt-3 space-y-1.5">
                <p className="text-base font-medium text-ink line-clamp-2">
                  {title || 'ชื่อสินค้าของคุณจะแสดงที่นี่'}
                </p>
                <p className="text-sm font-medium text-mute">{CATEGORY_LABELS[category]}</p>
                <p className="text-base font-medium font-mono text-ink">
                  {formatTHB(Number(startPrice) || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-hairline pt-6 space-y-4">
            <h3 className="text-base font-medium text-ink">
              รายการสินค้าในบัญชี ({myListings.length})
            </h3>
            <div className="divide-y divide-hairline-soft">
              {myListings.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveTab('catalog');
                    setSelectedProductId(item.id);
                  }}
                  className="cursor-pointer py-3 flex items-center gap-3 hover:opacity-75 transition-opacity"
                >
                  <SafeImage
                    src={item.images[0]}
                    alt={item.title}
                    className="w-14 h-14 bg-soft-cloud object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{item.title}</p>
                    <p className="text-xs font-mono text-mute mt-0.5">
                      {formatTHB(item.currentPrice)} · {item.verificationStatus}
                    </p>
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
