import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Clock,
  Filter,
  Gavel,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, ProductCategory } from '../types';
import { CATEGORY_LABELS, formatTHB, getCountdownParts } from '../utils/format';
import { SafeImage, VerificationBadge } from './ui';

export const CatalogView: React.FC = () => {
  const { products, setSelectedProductId, setActiveTab } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [saleFilter, setSaleFilter] = useState<'all' | 'auction' | 'fixed'>('all');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState<'ending-soon' | 'price-asc' | 'price-desc'>('ending-soon');
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products
      .filter((p) => {
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        if (saleFilter !== 'all' && p.saleType !== saleFilter) return false;
        if (onlyVerified && p.verificationStatus !== 'verified') return false;
        if (q) {
          const haystack = `${p.title} ${p.description} ${p.sellerName} ${p.certificateId ?? ''} ${p.serialNumber ?? ''}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.currentPrice - b.currentPrice;
        if (sortBy === 'price-desc') return b.currentPrice - a.currentPrice;
        return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
      });
  }, [products, searchQuery, selectedCategory, saleFilter, onlyVerified, sortBy]);

  const categories: { id: ProductCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'ทุกหมวดหมู่' },
    { id: 'art-toys', label: CATEGORY_LABELS['art-toys'] },
    { id: 'sneakers', label: CATEGORY_LABELS.sneakers },
    { id: 'gadgets', label: CATEGORY_LABELS.gadgets },
    { id: 'watches', label: CATEGORY_LABELS.watches },
  ];

  const verifiedCount = products.filter((p) => p.verificationStatus === 'verified').length;
  const activeAuctionsCount = products.filter(
    (p) => p.saleType === 'auction' && p.status === 'active'
  ).length;

  return (
    <div className="space-y-8">
      {/* Editorial Hero */}
      <section className="rounded-2xl bg-ink text-ivory p-6 sm:p-10 relative overflow-hidden">
        <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight leading-snug">
              ตลาดกลางซื้อขายและประมูลของสะสมแรร์ การันตีของแท้ด้วย{' '}
              <span className="text-vermilion">Verified Badge</span> และระบบพักเงิน{' '}
              <span className="text-emerald-300">Escrow</span>
            </h1>
            <p className="text-sm sm:text-base text-ivory/80 max-w-2xl leading-relaxed">
              SomJing (สมจริง) ช่วยให้นักสะสมประมูลสินค้าหายาก ลงประกาศตามหาสินค้าที่ต้องการ
              (Wanted Listing) และทำธุรกรรมอย่างมั่นใจด้วยบัญชีพักเงินกลางจนกว่าผู้ซื้อจะยืนยันรับของ
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('wanted')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-vermilion hover:bg-vermilion-hover text-white text-sm font-semibold transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>เปิดกระดานตามหาสินค้า (Wanted)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sell')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-ivory text-sm font-semibold transition-colors"
              >
                <span>ลงขาย / เปิดประมูลสินค้า</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
            <div className="rounded-xl bg-white/10 border border-white/10 p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emeraldSeal/20 text-emerald-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-ivory/70">ผ่านการตรวจความแท้แล้ว</p>
                <p className="text-base font-bold font-mono tabular-nums">
                  {verifiedCount} รายการ Verified
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/10 p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-vermilion/25 text-orange-300 flex items-center justify-center shrink-0">
                <Gavel className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-ivory/70">ห้องประมูลที่กำลังเปิดอยู่</p>
                <p className="text-base font-bold font-mono tabular-nums">
                  {activeAuctionsCount} Live Auctions
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/10 p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-escrowBlue/30 text-blue-300 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-ivory/70">คุ้มครองทุกคำสั่งซื้อ</p>
                <p className="text-base font-bold">พักเงิน → ส่ง → รับของ → ปล่อยเงิน</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Toolbar */}
      <section className="rounded-2xl bg-paper border border-stoneBorder p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-mutedInk absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อสินค้า รุ่น ซีเรียลนัมเบอร์ หรือเลข Certificate (เช่น KAWS, Leica, SJ-CERT)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 text-sm focus:outline-none focus:ring-2 focus:ring-vermilion/25 focus:border-vermilion"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={saleFilter}
              onChange={(e) => setSaleFilter(e.target.value as 'all' | 'auction' | 'fixed')}
              className="px-3 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-vermilion/25"
              aria-label="รูปแบบการขาย"
            >
              <option value="all">ทุกรูปแบบการขาย</option>
              <option value="auction">ประมูลสด (Auction)</option>
              <option value="fixed">ซื้อทันที (Fixed Price)</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'ending-soon' | 'price-asc' | 'price-desc')
              }
              className="px-3 py-2.5 rounded-xl border border-stoneBorder bg-ivory/70 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-vermilion/25"
              aria-label="เรียงลำดับ"
            >
              <option value="ending-soon">ใกล้ปิดประมูลที่สุด</option>
              <option value="price-asc">ราคา: ต่ำ → สูง</option>
              <option value="price-desc">ราคา: สูง → ต่ำ</option>
            </select>

            <button
              type="button"
              onClick={() => setOnlyVerified((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                onlyVerified
                  ? 'bg-emeraldSeal-soft border-emeraldSeal text-emeraldSeal'
                  : 'bg-ivory/70 border-stoneBorder text-mutedInk hover:text-ink'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verified เท่านั้น</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-mutedInk shrink-0 mr-1" />
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-ink text-white'
                    : 'bg-sand text-mutedInk hover:text-ink hover:bg-stoneBorder/50'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl bg-paper border border-stoneBorder p-12 text-center space-y-3">
          <p className="text-base font-bold text-ink">ไม่พบสินค้าที่ตรงกับเงื่อนไขการค้นหา</p>
          <p className="text-sm text-mutedInk">
            ลองเปลี่ยนคำค้นหา หมวดหมู่ หรือสร้างประกาศตามหา (Wanted Listing) เพื่อให้ผู้ขายเสนอของให้คุณ
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSaleFilter('all');
                setOnlyVerified(false);
              }}
              className="px-4 py-2 rounded-xl border border-stoneBorder text-sm font-semibold text-ink hover:bg-sand"
            >
              ล้างตัวกรอง
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('wanted')}
              className="px-4 py-2 rounded-xl bg-vermilion text-white text-sm font-semibold hover:bg-vermilion-hover"
            >
              ไปหน้า Wanted Listing
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              nowMs={nowMs}
              onSelect={() => setSelectedProductId(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ProductCard: React.FC<{
  product: Product;
  nowMs: number;
  onSelect: () => void;
}> = ({ product, nowMs, onSelect }) => {
  const countdown = getCountdownParts(product.endTime, nowMs);

  return (
    <article
      onClick={onSelect}
      className="group cursor-pointer rounded-2xl bg-paper border border-stoneBorder overflow-hidden flex flex-col transition-all hover:border-ink/40 hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] bg-sand overflow-hidden">
        <SafeImage
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top Left Sale Mode & Timer */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.saleType === 'auction' ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-ink/85 backdrop-blur-sm text-white px-2.5 py-1 text-[11px] font-mono font-semibold tabular-nums">
              <Clock className="w-3 h-3 text-vermilion" />
              {countdown.formatted}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-ink/85 backdrop-blur-sm text-white px-2.5 py-1 text-[11px] font-semibold">
              <Tag className="w-3 h-3 text-emerald-300" />
              ซื้อทันที
            </span>
          )}
        </div>

        {/* Top Right Sold overlay */}
        {product.status === 'sold' && (
          <div className="absolute inset-0 bg-ink/60 flex items-center justify-center">
            <span className="px-3.5 py-1.5 rounded-full bg-white text-ink text-xs font-bold">
              ชำระเข้า Escrow แล้ว
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-mutedInk">
              {CATEGORY_LABELS[product.category]}
            </span>
            <VerificationBadge
              status={product.verificationStatus}
              certificateId={product.certificateId}
              compact
            />
          </div>

          <h3 className="text-sm font-bold text-ink leading-snug line-clamp-2 group-hover:text-vermilion transition-colors">
            {product.title}
          </h3>
        </div>

        <div className="pt-3 border-t border-stoneBorder space-y-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[11px] text-mutedInk">
                {product.saleType === 'auction' ? 'ราคาประมูลปัจจุบัน' : 'ราคาขายสุทธิ'}
              </p>
              <p className="text-lg font-bold font-mono text-ink tabular-nums">
                {formatTHB(product.currentPrice)}
              </p>
            </div>
            {product.saleType === 'auction' && (
              <span className="text-xs font-medium text-mutedInk font-mono">
                {product.bids.length} บิด
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="w-full py-2 rounded-xl bg-sand hover:bg-ink hover:text-white text-ink text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5"
          >
            {product.saleType === 'auction' ? (
              <>
                <Gavel className="w-3.5 h-3.5" />
                <span>ดูรายละเอียด &amp; บิดประมูล</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>ดูรายละเอียด &amp; ซื้อผ่าน Escrow</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
