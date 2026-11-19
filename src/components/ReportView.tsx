import React from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  ExternalLink,
  FileText,
  Lock,
  Scale,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ReportView: React.FC = () => {
  const { setActiveTab, setSelectedProductId } = useStore();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="rounded-2xl bg-ink text-ivory p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300">
            <BookOpen className="w-4 h-4" />
            <span>เอกสารประกอบรายงานวิชา E-Commerce</span>
          </div>
          <h1 className="text-2xl font-bold">
            บทที่ 5 โปรแกรมต้นแบบระบบ E-Commerce ที่พัฒนา (SomJing - สมจริง)
          </h1>
          <p className="text-sm text-ivory/80">
            สรุปโครงสร้างระบบ หัวข้อ 5.1 – 5.7 พร้อมเชื่อมต่อปุ่มทดลองใช้งานจริงในทุกหัวข้อ (ฉบับสมบูรณ์อ่านได้ในไฟล์ CHAPTER_5_REPORT.md)
          </p>
        </div>
        <a
          href="https://github.com/marchtanu/som-jing"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-vermilion hover:bg-vermilion-hover text-white text-xs font-semibold shrink-0"
        >
          <span>GitHub Repository</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* 5.1 MVP Features */}
      <section className="rounded-2xl bg-paper border border-stoneBorder p-6 space-y-4">
        <h2 className="text-lg font-bold text-ink flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emeraldSeal" />
          <span>5.1 ฟีเจอร์ของโปรแกรมต้นแบบ (Minimum Viable Product: MVP)</span>
        </h2>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          {[
            {
              title: '1. ระบบสมัครสมาชิกและเข้าสู่ระบบ',
              desc: 'รองรับการลงทะเบียนและเข้าสู่ระบบแยกบทบาท (ผู้ซื้อ / ผู้ขาย / แอดมิน) พร้อมระบบสลับบทบาทสาธิต',
              action: () => setActiveTab('catalog'),
            },
            {
              title: '2. หน้ารวมสินค้า + ค้นหาตามหมวดหมู่',
              desc: 'กรองตามหมวดหมู่ (อาร์ตทอย, สนีกเกอร์, แก็ดเจ็ต, นาฬิกา/การ์ด) ค้นหาด้วยชื่อหรือรหัส Certificate',
              action: () => setActiveTab('catalog'),
            },
            {
              title: '3. หน้าสินค้าประมูล (Live Auction)',
              desc: 'แสดงราคาประมูลปัจจุบัน เวลานับถอยหลังแบบเรียลไทม์ ปุ่มบิดประมูลด่วน และตรา Verified Badge',
              action: () => {
                setActiveTab('catalog');
                setSelectedProductId('prod-1');
              },
            },
            {
              title: '4. ระบบลงขายสินค้า (Create Listing)',
              desc: 'ลงขายได้ทั้งแบบเปิดประมูล (ตั้งเวลาและขั้นต่ำ) และซื้อทันที พร้อมติ๊กส่งขอ Verify ในขั้นตอนเดียว',
              action: () => setActiveTab('sell'),
            },
            {
              title: '5. ระบบขอรับรองความแท้ (Request Verify)',
              desc: 'ผู้ขายส่ง Serial Number รูปถ่ายหลักฐาน และใบเสร็จเข้าสู่คิวตรวจสอบของผู้เชี่ยวชาญ',
              action: () => setActiveTab('verify'),
            },
            {
              title: '6. Wanted Listing + ส่งข้อเสนอ + เลือกข้อเสนอ',
              desc: 'ผู้ซื้อโพสต์ตามหาของพร้อมงบประมาณ ผู้ขายยื่นข้อเสนอแข่งกัน และผู้ซื้อกดเลือกเพื่อเข้าสู่การชำระเงิน',
              action: () => setActiveTab('wanted'),
            },
            {
              title: '7. ชำระเงินจำลอง + สถานะ Escrow 4 ขั้นตอน',
              desc: 'รองรับ PromptPay QR / บัตร / Mobile Banking และติดตามสถานะ พักเงิน → จัดส่ง → ยืนยันรับของ → ปล่อยเงิน',
              action: () => setActiveTab('escrow'),
            },
            {
              title: '8. หน้าแอดมิน (Admin Console)',
              desc: 'อนุมัติ/ปฏิเสธคำขอ Verified Badge (ออกรหัส Certificate อัตโนมัติ) และตัดสินข้อร้องเรียนคืนเงินหรือปล่อยเงิน',
              action: () => setActiveTab('admin'),
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl bg-ivory border border-stoneBorder p-4 flex flex-col justify-between gap-2"
            >
              <div>
                <h3 className="font-bold text-ink text-sm">{item.title}</h3>
                <p className="text-mutedInk mt-1 leading-relaxed">{item.desc}</p>
              </div>
              <button
                type="button"
                onClick={item.action}
                className="self-start inline-flex items-center gap-1 text-vermilion font-semibold hover:underline pt-1"
              >
                <span>ทดลองใช้งานหน้านี้</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5.2 User Flow / Sitemap */}
      <section className="rounded-2xl bg-paper border border-stoneBorder p-6 space-y-4">
        <h2 className="text-lg font-bold text-ink flex items-center gap-2">
          <Workflow className="w-5 h-5 text-vermilion" />
          <span>5.2 ผังการใช้งานและแผนผังเว็บไซต์ (User Flow / Sitemap)</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl bg-ivory border border-stoneBorder p-4 space-y-2">
            <p className="font-bold text-ink">Flow A: ประมูล &amp; Escrow</p>
            <ol className="list-decimal list-inside space-y-1 text-mutedInk">
              <li>เข้าสู่ระบบ / ค้นหาสินค้าใน Catalog</li>
              <li>เปิดหน้าสินค้าประมูล ตรวจ Verified Badge</li>
              <li>กดปุ่มบิดประมูล / ชนะประมูล</li>
              <li>ชำระเงินจำลอง (พักเงินใน Escrow)</li>
              <li>ผู้ขายแจ้งจัดส่ง → ผู้ซื้อยืนยันรับของ</li>
              <li>ระบบปล่อยเงินให้ผู้ขายสมบูรณ์</li>
            </ol>
          </div>
          <div className="rounded-xl bg-ivory border border-stoneBorder p-4 space-y-2">
            <p className="font-bold text-ink">Flow B: ขอ Verify &amp; ลงขาย</p>
            <ol className="list-decimal list-inside space-y-1 text-mutedInk">
              <li>ผู้ขายกรอกข้อมูลสินค้าและลงขาย</li>
              <li>ส่งคำขอ Verify พร้อม Serial &amp; ใบเสร็จ</li>
              <li>แอดมินตรวจสอบหลักฐานใน Admin Queue</li>
              <li>อนุมัติ → ออก Certificate ID อัตโนมัติ</li>
              <li>สินค้าแสดงตรา SomJing Verified ทันที</li>
            </ol>
          </div>
          <div className="rounded-xl bg-ivory border border-stoneBorder p-4 space-y-2">
            <p className="font-bold text-ink">Flow C: Wanted Listing &amp; ข้อร้องเรียน</p>
            <ol className="list-decimal list-inside space-y-1 text-mutedInk">
              <li>ผู้ซื้อโพสต์ตามหาสินค้าพร้อมงบเป้าหมาย</li>
              <li>ผู้ขายส่งข้อเสนอราคาและแนบ Verify</li>
              <li>ผู้ซื้อเลือกข้อเสนอ → เข้าสู่ Escrow</li>
              <li>หากมีปัญหา กดร้องเรียนเพื่อระงับเงิน</li>
              <li>แอดมินตัดสินคืนเงินหรือปล่อยเงิน</li>
            </ol>
          </div>
        </div>
      </section>

      {/* 5.3 Tech Stack & 5.4 Screens */}
      <div className="grid md:grid-cols-2 gap-6">
        <section className="rounded-2xl bg-paper border border-stoneBorder p-6 space-y-3">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <Code2 className="w-5 h-5 text-escrowBlue" />
            <span>5.3 เทคโนโลยีและเครื่องมือที่ใช้พัฒนา</span>
          </h2>
          <ul className="space-y-2 text-xs text-mutedInk">
            <li>
              <strong className="text-ink">Frontend Framework:</strong> React 18 + TypeScript 5
              (จัดการ Component และความปลอดภัยของชนิดข้อมูล)
            </li>
            <li>
              <strong className="text-ink">Build Tool:</strong> Vite 5 สำหรับพัฒนาและ Bundle ประสิทธิภาพสูง
            </li>
            <li>
              <strong className="text-ink">Styling &amp; UI:</strong> Tailwind CSS 3 + Lucide React Icons + ฟอนต์ Noto Sans Thai &amp; JetBrains Mono
            </li>
            <li>
              <strong className="text-ink">State &amp; Storage:</strong> React Context API ร่วมกับ Browser LocalStorage (จำลองฐานข้อมูลครบทุก Transaction)
            </li>
            <li>
              <strong className="text-ink">Version Control &amp; Deploy:</strong> Git, GitHub (marchtanu/som-jing), และรองรับการ Deploy บน Vercel
            </li>
          </ul>
        </section>

        <section className="rounded-2xl bg-paper border border-stoneBorder p-6 space-y-3">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <FileText className="w-5 h-5 text-vermilion" />
            <span>5.4 หน้าจอและการใช้งานระบบ</span>
          </h2>
          <p className="text-xs text-mutedInk leading-relaxed">
            ออกแบบด้วยแนวคิด Warm Collector&apos;s Exchange เน้นความน่าเชื่อถือและอ่านง่าย แยกสีสถานะชัดเจน:
          </p>
          <ul className="space-y-1.5 text-xs text-mutedInk">
            <li>• สีเขียว Emerald (#0D7A5F): แสดงสถานะ SomJing Verified Badge และขั้นเสร็จสิ้น</li>
            <li>• สีน้ำเงิน Escrow (#1D4ED8): แสดงความคุ้มครองและการพักเงินตัวกลาง</li>
            <li>• สีส้ม Vermilion (#D94E28): แสดงปุ่ม Action หลัก เช่น ปุ่มบิดประมูลและชำระเงิน</li>
            <li>• มีแถบ Demo Switcher ด้านบนสำหรับสลับบทบาท ผู้ซื้อ/ผู้ขาย/แอดมิน ในคลิกเดียว</li>
          </ul>
        </section>
      </div>

      {/* 5.5 Security & 5.6 Legal */}
      <div className="grid md:grid-cols-2 gap-6">
        <section className="rounded-2xl bg-paper border border-stoneBorder p-6 space-y-3">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <Lock className="w-5 h-5 text-escrowBlue" />
            <span>5.5 ความปลอดภัยและระบบการชำระเงิน</span>
          </h2>
          <ul className="space-y-2 text-xs text-mutedInk leading-relaxed">
            <li>
              <strong className="text-ink">Escrow Protection Architecture:</strong> เงินค่าสินค้าจะถูกพักไว้ที่ตัวกลาง SomJing (สถานะ Held) ป้องกันการโกงโอนเงินแล้วไม่ส่งของ
            </li>
            <li>
              <strong className="text-ink">Multi-Step Verification:</strong> ระบบตรวจรับรองความแท้ก่อนออก Certificate ID ป้องกันสินค้าละเมิดลิขสิทธิ์หรือของปลอม
            </li>
            <li>
              <strong className="text-ink">Audit Log &amp; Dispute Freeze:</strong> บันทึกประวัติการบิดและการเปลี่ยนสถานะ Escrow ทุกขั้นตอน พร้อมระบบระงับการปล่อยเงินเมื่อมีข้อร้องเรียน
            </li>
          </ul>
        </section>

        <section className="rounded-2xl bg-paper border border-stoneBorder p-6 space-y-3">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <Scale className="w-5 h-5 text-emeraldSeal" />
            <span>5.6 กฎหมายและจริยธรรมที่เกี่ยวข้อง</span>
          </h2>
          <ul className="space-y-2 text-xs text-mutedInk leading-relaxed">
            <li>
              <strong className="text-ink">พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA พ.ศ. 2562):</strong> จัดเก็บข้อมูลสมาชิกและหลักฐานเท่าที่จำเป็นในการยืนยันตัวตน
            </li>
            <li>
              <strong className="text-ink">พ.ร.บ. ว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์:</strong> รับรองความสมบูรณ์ของการเสนอราคาประมูลและบันทึกการชำระเงินอิเล็กทรอนิกส์
            </li>
            <li>
              <strong className="text-ink">พ.ร.บ. คุ้มครองผู้บริโภค และ กฎหมายทรัพย์สินทางปัญญา:</strong> คัดกรองของแท้ผ่าน Verified Badge และเปิดช่องทางร้องเรียนเพื่อความเป็นธรรมทั้งสองฝ่าย
            </li>
          </ul>
        </section>
      </div>

      {/* 5.7 Try It Guide */}
      <section className="rounded-2xl bg-emeraldSeal-soft border border-emeraldSeal/25 p-6 space-y-3">
        <h2 className="text-lg font-bold text-ink flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emeraldSeal" />
          <span>5.7 ช่องทางทดลองใช้งานระบบ (Demo Walkthrough)</span>
        </h2>
        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl bg-white p-3.5 border border-emeraldSeal/20">
            <p className="font-bold text-ink">บัญชีผู้ซื้อ (Buyer)</p>
            <p className="font-mono text-mutedInk mt-1">buyer@somjing.com</p>
            <p className="font-mono text-mutedInk">password123</p>
          </div>
          <div className="rounded-xl bg-white p-3.5 border border-emeraldSeal/20">
            <p className="font-bold text-ink">บัญชีผู้ขาย (Seller)</p>
            <p className="font-mono text-mutedInk mt-1">seller@somjing.com</p>
            <p className="font-mono text-mutedInk">password123</p>
          </div>
          <div className="rounded-xl bg-white p-3.5 border border-emeraldSeal/20">
            <p className="font-bold text-ink">บัญชีแอดมิน (Admin)</p>
            <p className="font-mono text-mutedInk mt-1">admin@somjing.com</p>
            <p className="font-mono text-mutedInk">password123</p>
          </div>
        </div>
        <p className="text-xs text-ink/80">
          * หมายเหตุ: สามารถกดสลับบทบาทได้ที่แถบด้านบนสุดได้ทันทีโดยไม่ต้องพิมพ์รหัสผ่านใหม่ และดูเนื้อหาฉบับเต็มสำหรับใส่เล่มรายงานได้ในไฟล์{' '}
          <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emeraldSeal/25">
            CHAPTER_5_REPORT.md
          </code>
        </p>
      </section>
    </div>
  );
};
