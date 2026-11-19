import React from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ReportView: React.FC = () => {
  const { setActiveTab, setSelectedProductId } = useStore();

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-hairline flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-[32px] font-medium leading-[1.2] text-ink">
            บทที่ 5 โปรแกรมต้นแบบระบบ E-Commerce ที่พัฒนา
          </h1>
          <p className="text-base text-mute">
            สรุปโครงสร้างระบบ SomJing (สมจริง) หัวข้อ 5.1 – 5.7 (ฉบับเต็มในไฟล์ CHAPTER_5_REPORT.md)
          </p>
        </div>
        <a
          href="https://github.com/marchtanu/som-jing"
          target="_blank"
          rel="noreferrer"
          className="btn-primary shrink-0 h-11 px-6 text-sm"
        >
          <span>GitHub Repo</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* 5.1 MVP Features */}
      <section className="space-y-4">
        <h2 className="text-2xl font-medium text-ink">
          5.1 ฟีเจอร์ของโปรแกรมต้นแบบ (Minimum Viable Product: MVP)
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            {
              title: '1. สมัครสมาชิกและเข้าสู่ระบบ',
              desc: 'ลงทะเบียนและเข้าสู่ระบบแยกบทบาท (ผู้ซื้อ / ผู้ขาย / แอดมิน) พร้อมแถบ Demo Role Switcher',
              action: () => setActiveTab('catalog'),
            },
            {
              title: '2. หน้ารวมสินค้า + ค้นหาตามหมวดหมู่',
              desc: 'กรอง 4 หมวดหมู่ ค้นหาชื่อ/เลข Certificate ID และตัวกรองเฉพาะสินค้า Verified',
              action: () => setActiveTab('catalog'),
            },
            {
              title: '3. หน้าสินค้าประมูล (Live Auction)',
              desc: 'แสดงราคาปัจจุบัน เวลานับถอยหลังแบบเรียลไทม์ ปุ่มบิดประมูล และ Verified Badge',
              action: () => {
                setActiveTab('catalog');
                setSelectedProductId('prod-1');
              },
            },
            {
              title: '4. ลงขายสินค้า (Create Listing)',
              desc: 'ลงขายได้ทั้งแบบเปิดประมูลและราคาคงที่ พร้อมส่งคำขอ Verify ทันที',
              action: () => setActiveTab('sell'),
            },
            {
              title: '5. ขอ Verify ความแท้',
              desc: 'ส่ง Serial Number และภาพถ่ายหลักฐานเข้าคิวตรวจสอบของแอดมิน',
              action: () => setActiveTab('verify'),
            },
            {
              title: '6. Wanted Listing + ข้อเสนอ + เลือกข้อเสนอ',
              desc: 'สร้างประกาศตามหาสินค้าพร้อมงบประมาณ ผู้ขายยื่นข้อเสนอ และผู้ซื้อเลือกชำระเข้า Escrow',
              action: () => setActiveTab('wanted'),
            },
            {
              title: '7. ชำระเงินจำลอง + สถานะ Escrow 4 ขั้นตอน',
              desc: 'จำลอง PromptPay QR / บัตร / Mobile Banking และติดตาม พักเงิน → จัดส่ง → ยืนยันรับของ → ปล่อยเงิน',
              action: () => setActiveTab('escrow'),
            },
            {
              title: '8. หน้าแอดมิน (Admin Console)',
              desc: 'อนุมัติ Verified Badge (ออก Certificate ID) และตัดสินข้อร้องเรียนคืนเงินหรือปล่อยเงิน',
              action: () => setActiveTab('admin'),
            },
          ].map((item) => (
            <div
              key={item.title}
              className="border border-hairline p-5 flex flex-col justify-between gap-3"
            >
              <div>
                <h3 className="text-base font-medium text-ink">{item.title}</h3>
                <p className="text-sm text-charcoal mt-1 leading-relaxed">{item.desc}</p>
              </div>
              <button
                type="button"
                onClick={item.action}
                className="self-start inline-flex items-center gap-1.5 text-sm font-medium text-ink underline underline-offset-4"
              >
                <span>เปิดหน้านี้</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5.2 User Flow */}
      <section className="space-y-4 border-t border-hairline pt-8">
        <h2 className="text-2xl font-medium text-ink">
          5.2 ผังการใช้งาน (User Flow / Sitemap)
        </h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-soft-cloud p-5 space-y-2">
            <p className="font-medium text-ink">Flow A: ประมูล &amp; Escrow</p>
            <ol className="list-decimal list-inside space-y-1 text-charcoal">
              <li>ค้นหาและเลือกสินค้าประมูล</li>
              <li>ตรวจ Verified Badge และกดปุ่มบิด</li>
              <li>ชำระเงินจำลอง (พักเงินใน Escrow)</li>
              <li>ผู้ขายจัดส่ง → ผู้ซื้อยืนยันรับของ</li>
              <li>ปล่อยเงินให้ผู้ขายสมบูรณ์</li>
            </ol>
          </div>
          <div className="bg-soft-cloud p-5 space-y-2">
            <p className="font-medium text-ink">Flow B: ขอ Verify &amp; ลงขาย</p>
            <ol className="list-decimal list-inside space-y-1 text-charcoal">
              <li>ผู้ขายกรอกรายละเอียดลงขาย</li>
              <li>ส่งคำขอ Verify พร้อม Serial &amp; ใบเสร็จ</li>
              <li>แอดมินตรวจสอบและกดอนุมัติ</li>
              <li>ออก Certificate ID อัตโนมัติ</li>
              <li>ตรา Verified แสดงบนสินค้าทันที</li>
            </ol>
          </div>
          <div className="bg-soft-cloud p-5 space-y-2">
            <p className="font-medium text-ink">Flow C: Wanted &amp; ร้องเรียน</p>
            <ol className="list-decimal list-inside space-y-1 text-charcoal">
              <li>ผู้ซื้อสร้าง Wanted พร้อมงบประมาณ</li>
              <li>ผู้ขายส่งข้อเสนอราคาและสภาพ</li>
              <li>ผู้ซื้อเลือกข้อเสนอ → เข้า Escrow</li>
              <li>หากมีปัญหา กดร้องเรียนเพื่อระงับเงิน</li>
              <li>แอดมินตัดสินคืนเงินหรือปล่อยเงิน</li>
            </ol>
          </div>
        </div>
      </section>

      {/* 5.3 - 5.6 Two-column summary */}
      <div className="grid md:grid-cols-2 gap-8 border-t border-hairline pt-8">
        <section className="space-y-2">
          <h2 className="text-xl font-medium text-ink">5.3 เทคโนโลยีและเครื่องมือที่ใช้พัฒนา</h2>
          <p className="text-sm text-charcoal leading-relaxed">
            React 18, TypeScript 5, Vite 5, Tailwind CSS 3, Lucide React, Google Fonts (Bebas Neue, Inter, Noto Sans Thai, JetBrains Mono), React Context + LocalStorage Persistence, GitHub และ Vercel
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium text-ink">5.4 หน้าจอและการออกแบบ Design System</h2>
          <p className="text-sm text-charcoal leading-relaxed">
            ใช้ระบบการออกแบบ High-Contrast Editorial Commerce (#111111 Ink, #FFFFFF Canvas, #F5F5F5 Soft Cloud) ภาพถ่าย 1:1 ไร้กรอบ ปุ่มทรง Pill 30px และเส้นแบ่ง Hairline 1px เพื่อความชัดเจนและน่าเชื่อถือ
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium text-ink">5.5 ความปลอดภัยและระบบการชำระเงิน</h2>
          <p className="text-sm text-charcoal leading-relaxed">
            ระบบพักเงินตัวกลาง Escrow (Held → Shipped → Received → Released), การออก Certificate ID ป้องกันสินค้าปลอม และระบบระงับเงินชั่วคราว (Dispute Freeze) พร้อมบันทึก Audit Log ทุกขั้นตอน
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-medium text-ink">5.6 กฎหมายและจริยธรรมที่เกี่ยวข้อง</h2>
          <p className="text-sm text-charcoal leading-relaxed">
            สอดคล้องตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA), พ.ร.บ. ธุรกรรมทางอิเล็กทรอนิกส์, พ.ร.บ. คุ้มครองผู้บริโภค, กฎหมายทรัพย์สินทางปัญญา และจริยธรรมแพลตฟอร์มตัวกลางที่เป็นธรรม
          </p>
        </section>
      </div>

      {/* 5.7 Demo Accounts */}
      <section className="bg-soft-cloud p-6 space-y-3">
        <h2 className="text-xl font-medium text-ink">5.7 ช่องทางทดลองใช้งานระบบ</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-canvas border border-hairline p-4">
            <p className="font-medium text-ink">Buyer</p>
            <p className="font-mono text-xs text-mute mt-1">buyer@somjing.com / password123</p>
          </div>
          <div className="bg-canvas border border-hairline p-4">
            <p className="font-medium text-ink">Seller</p>
            <p className="font-mono text-xs text-mute mt-1">seller@somjing.com / password123</p>
          </div>
          <div className="bg-canvas border border-hairline p-4">
            <p className="font-medium text-ink">Admin</p>
            <p className="font-mono text-xs text-mute mt-1">admin@somjing.com / password123</p>
          </div>
        </div>
      </section>
    </div>
  );
};
