import React, { useState } from 'react';
import { CheckCircle2, ImagePlus, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, ProductCategory, ProductOption } from '../types';
import { CATEGORY_LABELS, formatTHB } from '../utils/format';
import { SafeImage, VerificationBadge } from './ui';

const PRESET_IMAGES: { label: string; url: string; secondaryUrl: string; category: ProductCategory }[] = [
  {
    label: 'Art Toy',
    url: 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?auto=format&fit=crop&w=900&q=80',
    secondaryUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=80',
    category: 'art-toys',
  },
  {
    label: 'Sneakers',
    url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80',
    secondaryUrl: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=900&q=80',
    category: 'sneakers',
  },
  {
    label: 'Retro Camera',
    url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
    secondaryUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=900&q=80',
    category: 'gadgets',
  },
  {
    label: 'Watch',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    secondaryUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80',
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
  const [secondaryImageUrl, setSecondaryImageUrl] = useState(PRESET_IMAGES[0].secondaryUrl);
  const [description, setDescription] = useState('');
  const [requestVerify, setRequestVerify] = useState(true);
  const [purchaseProofNote, setPurchaseProofNote] = useState('');
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);

  const [optionInputs, setOptionInputs] = useState<ProductOption[]>([
    {
      id: 'draft-opt-1',
      label: 'Standard Full Set (กล่องครบ)',
      colorHex: '#111111',
      spec: 'อุปกรณ์มาตรฐานจากช็อปครบชุด',
      imageIndex: 0,
    },
    {
      id: 'draft-opt-2',
      label: 'Collector Bundle (+เคสกันรอย)',
      colorHex: '#707072',
      spec: 'เพิ่มเคสป้องกันสำหรับนักสะสม',
      imageIndex: 1,
    },
  ]);

  const handleAddOption = () => {
    setOptionInputs((prev) => [
      ...prev,
      {
        id: `draft-opt-${Date.now()}`,
        label: `ตัวเลือกที่ ${prev.length + 1}`,
        colorHex: '#007d48',
        spec: 'รายละเอียดเพิ่มเติม',
        imageIndex: prev.length % 2,
      },
    ]);
  };

  const handleUpdateOption = (idx: number, patch: Partial<ProductOption>) => {
    setOptionInputs((prev) =>
      prev.map((opt, i) => (i === idx ? { ...opt, ...patch } : opt))
    );
  };

  const handleRemoveOption = (idx: number) => {
    if (optionInputs.length <= 1) return;
    setOptionInputs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedStart = Math.max(100, Number(startPrice) || 1000);
    const cleanedOptions = optionInputs.map((opt, i) => ({
      ...opt,
      id: `opt-${Date.now()}-${i}`,
      label: opt.label.trim() || `ตัวเลือก ${i + 1}`,
      spec: opt.spec.trim() || 'อุปกรณ์ครบตามภาพ',
    }));

    const created = createProduct({
      title: title.trim(),
      category,
      condition,
      description:
        description.trim() ||
        'สินค้าสะสมสภาพดี พร้อมส่งและคุ้มครองผ่านระบบพักเงิน SomJing Escrow',
      imageUrl: imageUrl.trim(),
      secondaryImageUrl: secondaryImageUrl.trim(),
      options: cleanedOptions,
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

    if (created) {
      setCreatedProduct(created);
      setTitle('');
      setSerialNumber('');
      setDescription('');
      setPurchaseProofNote('');
    }
  };

  const myListings = products.filter((p) =>
    currentUser ? p.sellerId === currentUser.id : true
  );

  return (
    <div className="space-y-12 animate-view-in">
      <div className="pb-6 border-b border-hairline">
        <h1 className="text-[32px] font-medium leading-[1.2] text-ink">
          ลงขายสินค้า &amp; เปิดรอบประมูล
        </h1>
        <p className="text-base text-mute mt-1">
          สร้างประกาศขายแบบราคาคงที่หรือเปิดประมูลสด กำหนดตัวเลือกสินค้า และส่งคำขอ Verify ความแท้ได้ทันที
        </p>
      </div>

      {createdProduct && (
        <div className="bg-soft-cloud p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-ink">
                ลงขาย &ldquo;{createdProduct.title}&rdquo; สำเร็จแล้ว
              </p>
              <p className="text-mute mt-0.5">
                {createdProduct.verificationStatus === 'pending'
                  ? 'คำขอ Verify ถูกส่งเข้าคิวผู้ตรวจสอบระบบแล้ว สามารถติดตามผลได้ที่หน้า ขอ Verify'
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
                onClick={() => setActiveTab('verify')}
                className="filter-chip"
              >
                เช็คสถานะ Verify
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
                <label className="block text-sm font-medium text-ink mb-2">ระยะเวลาประมูล</label>
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

          {/* Product Options Editor */}
          <div className="border border-hairline p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-medium text-ink">
                  ตัวเลือกสินค้า (Options / Editions)
                </h2>
                <p className="text-xs text-mute">
                  ตัวเลือกเหล่านี้จะแสดงทั้งบนการ์ดสินค้าและหน้าสินค้าประมูลให้ผู้ซื้อเลือกได้จริง
                </p>
              </div>
              <button type="button" onClick={handleAddOption} className="filter-chip text-xs">
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มตัวเลือก</span>
              </button>
            </div>

            <div className="space-y-3">
              {optionInputs.map((opt, idx) => (
                <div key={opt.id} className="bg-soft-cloud p-3 grid sm:grid-cols-12 gap-2 items-center">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      required
                      value={opt.label}
                      onChange={(e) => handleUpdateOption(idx, { label: e.target.value })}
                      placeholder="ชื่อตัวเลือก เช่น US 9.5 / Full Set"
                      className="hairline-input w-full text-xs py-1.5 bg-canvas"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={opt.spec}
                      onChange={(e) => handleUpdateOption(idx, { spec: e.target.value })}
                      placeholder="รายละเอียดตัวเลือก"
                      className="hairline-input w-full text-xs py-1.5 bg-canvas"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-end gap-2">
                    <input
                      type="color"
                      value={opt.colorHex}
                      onChange={(e) => handleUpdateOption(idx, { colorHex: e.target.value })}
                      className="w-7 h-7 rounded-full border border-hairline cursor-pointer bg-canvas"
                      title="สี Swatch"
                    />
                    {optionInputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="p-1.5 text-mute hover:text-sale"
                        aria-label="ลบตัวเลือก"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

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
                    setSecondaryImageUrl(preset.secondaryUrl);
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
              placeholder="URL ภาพหลัก"
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
                  ทีมตรวจสอบของระบบจะพิจารณาหลักฐานและออกเลข Certificate ID ให้เมื่อผ่านเกณฑ์
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

        {/* Right: 1:1 Card Preview & Listings */}
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
              <div className="pt-3 space-y-2">
                <div className="flex items-center gap-2">
                  {optionInputs.map((opt, idx) => (
                    <span
                      key={opt.id}
                      className={`w-3.5 h-3.5 rounded-full inline-block ${
                        idx === 0
                          ? 'ring-2 ring-ink ring-offset-2 ring-offset-canvas'
                          : 'border border-hairline'
                      }`}
                      style={{ backgroundColor: opt.colorHex }}
                    />
                  ))}
                  <span className="text-xs text-mute">{optionInputs.length} ตัวเลือก</span>
                </div>
                <p className="text-base font-medium text-ink line-clamp-2">
                  {title || 'ชื่อสินค้าของคุณจะแสดงที่นี่'}
                </p>
                <p className="text-sm font-medium text-mute">
                  {optionInputs[0]?.label} · {CATEGORY_LABELS[category]}
                </p>
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
