import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, ProductCategory } from '../types';
import { CATEGORY_LABELS, formatTHB, getCountdownParts } from '../utils/format';
import { SafeImage } from './ui';

const SWATCH_PALETTES: Record<ProductCategory, string[]> = {
  'art-toys': ['#111111', '#707072', '#beaffd'],
  sneakers: ['#111111', '#d30005', '#f5f5f5'],
  gadgets: ['#111111', '#9e9ea0', '#0a7281'],
  watches: ['#111111', '#007d48', '#4c012d'],
};

export const CatalogView: React.FC = () => {
  const { products, setSelectedProductId, setActiveTab } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [saleFilter, setSaleFilter] = useState<'all' | 'auction' | 'fixed'>('all');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState<'ending-soon' | 'price-asc' | 'price-desc'>('ending-soon');
  const [showFilters, setShowFilters] = useState(true);
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
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'art-toys', label: CATEGORY_LABELS['art-toys'] },
    { id: 'sneakers', label: CATEGORY_LABELS.sneakers },
    { id: 'gadgets', label: CATEGORY_LABELS.gadgets },
    { id: 'watches', label: CATEGORY_LABELS.watches },
  ];

  const getCategoryCount = (id: ProductCategory | 'all') =>
    id === 'all' ? products.length : products.filter((p) => p.category === id).length;

  return (
    <div className="space-y-12">
      {/* Editorial Campaign Tile: Full-bleed image with towering Futura/Bebas Neue headline */}
      <section className="relative w-full aspect-[4/5] sm:aspect-[16/7] bg-ink overflow-hidden rounded-none">
        <SafeImage
          src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1600&q=85"
          alt="SomJing Verified Archive Campaign"
          className="w-full h-full object-cover opacity-80"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(17,17,17,0.12) 0%, rgba(17,17,17,0.72) 100%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-12 flex flex-col items-start gap-4 max-w-4xl">
          <h1 className="display-campaign text-[48px] sm:text-[64px] lg:text-[96px] text-canvas">
            AUTHENTIC ONLY.
            <br />
            ESCROW PROTECTED.
          </h1>
          <p className="text-sm sm:text-base text-canvas/90 max-w-xl leading-relaxed">
            ตลาดกลางซื้อขายและประมูลของสะสมแรร์ SomJing (สมจริง) ตรวจรับรองความแท้ด้วย Verified Badge
            และพักเงินตัวกลาง 4 ขั้นตอนจนกว่าจะรับของจริง
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('wanted')}
              className="btn-outline-on-image"
            >
              <span>เปิดกระดาน Wanted</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sell')}
              className="btn-outline-on-image"
            >
              <span>ลงขายสินค้า</span>
            </button>
          </div>
        </div>
      </section>

      {/* PLP Sub-Nav Strip */}
      <section className="space-y-6">
        <div className="bg-canvas shadow-inset-hairline pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-mute">
              SomJing / Rare Collectibles &amp; Live Auctions
            </p>
            <h2 className="text-[24px] sm:text-[32px] font-medium leading-[1.2] text-ink mt-1">
              ALL COLLECTIBLES ({filteredProducts.length})
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Pill */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-ink absolute left-4 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items, Cert ID..."
                className="search-pill w-full pl-10 pr-4 text-sm"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="inline-flex items-center gap-2 text-base font-medium text-ink px-2 py-2 hover:text-charcoal"
            >
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'ending-soon' | 'price-asc' | 'price-desc')
              }
              aria-label="Sort By"
              className="bg-canvas text-ink text-base font-medium border-none focus:outline-none cursor-pointer pr-2"
            >
              <option value="ending-soon">Sort By: Ending Soon</option>
              <option value="price-asc">Sort By: Price Low-High</option>
              <option value="price-desc">Sort By: Price High-Low</option>
            </select>
          </div>
        </div>

        {/* Mobile Quick Filter Chips */}
        <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={selectedCategory === cat.id ? 'filter-chip-active' : 'filter-chip'}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main PLP Layout: 220px Filter Sidebar + 3-up Product Grid (8px gutter) */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {showFilters && (
            <aside className="hidden lg:block w-[220px] shrink-0 space-y-6">
              {/* Category Group */}
              <div className="pb-6 border-b border-hairline space-y-3">
                <h3 className="text-base font-medium text-ink">หมวดหมู่สินค้า</h3>
                <ul className="space-y-2.5 text-sm font-medium">
                  {categories.map((cat) => {
                    const active = selectedCategory === cat.id;
                    return (
                      <li key={cat.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`text-left transition-colors ${
                            active
                              ? 'text-ink underline underline-offset-4'
                              : 'text-charcoal hover:text-ink'
                          }`}
                        >
                          {cat.label}{' '}
                          <span className="text-mute">({getCategoryCount(cat.id)})</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Sale Mode Group */}
              <div className="pb-6 border-b border-hairline space-y-3">
                <h3 className="text-base font-medium text-ink">รูปแบบการขาย</h3>
                <ul className="space-y-2.5 text-sm font-medium">
                  {[
                    { id: 'all' as const, label: 'ทั้งหมด' },
                    { id: 'auction' as const, label: 'ประมูลสด (Live Auction)' },
                    { id: 'fixed' as const, label: 'ซื้อทันที (Buy Now)' },
                  ].map((mode) => (
                    <li key={mode.id}>
                      <button
                        type="button"
                        onClick={() => setSaleFilter(mode.id)}
                        className={`text-left ${
                          saleFilter === mode.id
                            ? 'text-ink underline underline-offset-4'
                            : 'text-charcoal hover:text-ink'
                        }`}
                      >
                        {mode.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Authenticity Group */}
              <div className="pb-6 border-b border-hairline space-y-3">
                <h3 className="text-base font-medium text-ink">การรับรองความแท้</h3>
                <button
                  type="button"
                  onClick={() => setOnlyVerified((v) => !v)}
                  className={onlyVerified ? 'filter-chip-active' : 'filter-chip'}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Only</span>
                </button>
              </div>
            </aside>
          )}

          {/* 3-up Product Grid with 8px gutter (gap-2) */}
          <div className="flex-1 w-full">
            {filteredProducts.length === 0 ? (
              <div className="bg-soft-cloud p-12 text-center space-y-4">
                <p className="text-base font-medium text-ink">
                  ไม่พบสินค้าที่ตรงกับตัวกรองในขณะนี้
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSaleFilter('all');
                      setOnlyVerified(false);
                    }}
                    className="btn-secondary"
                  >
                    ล้างตัวกรองทั้งหมด
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('wanted')}
                    className="btn-primary"
                  >
                    สร้างประกาศ Wanted
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
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
        </div>
      </section>
    </div>
  );
};

const ProductCard: React.FC<{
  product: Product;
  nowMs: number;
  onSelect: () => void;
}> = ({ product, nowMs, onSelect }) => {
  const countdown = getCountdownParts(product.endTime, nowMs);
  const swatches = SWATCH_PALETTES[product.category];

  return (
    <article
      onClick={onSelect}
      className="group cursor-pointer bg-canvas rounded-none p-0 flex flex-col"
    >
      {/* 1:1 Full-bleed photo on #f5f5f5 soft-cloud stage */}
      <div className="relative aspect-square w-full bg-soft-cloud overflow-hidden rounded-none">
        <SafeImage
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover"
        />

        {/* Promo Badge Top-Left */}
        <div className="absolute top-3 left-3">
          {product.verificationStatus === 'verified' ? (
            <span className="badge-promo">
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              <span>SomJing Verified</span>
            </span>
          ) : product.verificationStatus === 'pending' ? (
            <span className="badge-promo">Pending Verify</span>
          ) : (
            <span className="badge-promo">Just In</span>
          )}
        </div>

        {product.status === 'sold' && (
          <div className="absolute inset-0 bg-ink/55 flex items-center justify-center">
            <span className="badge-promo">Escrow Locked</span>
          </div>
        )}
      </div>

      {/* Zero card horizontal padding; 8px vertical spacing between metadata rows */}
      <div className="pt-3 pb-8 space-y-2">
        {/* Swatch Dots Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {swatches.map((hex, i) => (
              <span
                key={hex + i}
                className={`w-3 h-3 rounded-full inline-block ${
                  i === 0
                    ? 'ring-2 ring-ink ring-offset-2 ring-offset-canvas'
                    : 'border border-hairline'
                }`}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
          {product.verificationStatus === 'verified' && (
            <span className="text-xs font-medium text-success font-mono">
              {product.certificateId}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-medium text-ink leading-[1.5] line-clamp-2">
          {product.title}
        </h3>

        {/* Subtitle */}
        <p className="text-sm font-medium text-mute leading-[1.5]">
          {CATEGORY_LABELS[product.category]} · {product.condition}
        </p>

        {/* Price + Inline Sale/Auction Countdown (no badge background) */}
        <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1 pt-0.5">
          <span className="text-base font-medium text-ink font-mono tabular-nums">
            {formatTHB(product.currentPrice)}
          </span>
          {product.saleType === 'auction' ? (
            <span className="text-sm font-medium text-sale font-mono tabular-nums">
              {countdown.formatted} · {product.bids.length} bids
            </span>
          ) : (
            <span className="text-sm font-medium text-mute">Buy Now</span>
          )}
        </div>
      </div>
    </article>
  );
};
