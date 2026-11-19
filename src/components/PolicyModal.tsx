import React from 'react';
import { Scale, ShieldCheck, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PolicyTopic } from '../types';

const POLICY_CONTENT: Record<
  PolicyTopic,
  {
    title: string;
    subtitle: string;
    bullets: string[];
  }
> = {
  authenticity: {
    title: 'SomJing Authenticity Guarantee',
    subtitle: 'มาตรฐานการตรวจรับรองความแท้และรหัสใบรับรอง (Certificate ID)',
    bullets: [
      'สินค้าที่แสดงตรา SomJing Verified Badge ผ่านการตรวจหลักฐานจุดสังเกตเฉพาะรุ่น, Serial Number และใบเสร็จจากผู้ตรวจสอบของแพลตฟอร์ม',
      'ทุกรายการที่ผ่านการอนุมัติจะได้รับรหัสใบรับรองเฉพาะรายการ (เช่น SJ-CERT-2026-xxxx) ซึ่งสามารถค้นหาและตรวจสอบซ้ำได้ในหน้ารวมสินค้า',
      'หากพบว่าสินค้าไม่ตรงตามความแท้ที่ระบุในใบรับรอง ผู้ซื้อสามารถยื่นข้อร้องเรียนเพื่อระงับเงินในระบบ Escrow และรับเงินคืนเต็มจำนวน',
    ],
  },
  escrow: {
    title: 'Escrow Payment Protection Policy',
    subtitle: 'นโยบายคุ้มครองผู้ซื้อและผู้ขายด้วยระบบพักเงินตัวกลาง 4 ขั้นตอน',
    bullets: [
      'ขั้นที่ 1 (Held): เมื่อผู้ซื้อชำระเงิน เงินจะถูกพักไว้ในบัญชีกลาง SomJing และยังไม่โอนให้ผู้ขายทันที',
      'ขั้นที่ 2 (Shipped): ผู้ขายจัดส่งสินค้าพร้อมแนบหลักฐานบริษัทขนส่งและเลขพัสดุที่ตรวจสอบได้',
      'ขั้นที่ 3 (Received): ผู้ซื้อตรวจรับสินค้าและกดยืนยันความถูกต้องภายในระบบ',
      'ขั้นที่ 4 (Released): เมื่อผู้ซื้อยืนยันรับของ ระบบจึงจะปล่อยยอดเงินให้ผู้ขายอย่างสมบูรณ์ หรือระงับเงินไว้หากเกิดข้อร้องเรียน',
    ],
  },
  pdpa: {
    title: 'PDPA พ.ศ. 2562 Compliance',
    subtitle: 'การคุ้มครองข้อมูลส่วนบุคคลของสมาชิก SomJing',
    bullets: [
      'แพลตฟอร์มจัดเก็บข้อมูลส่วนบุคคล (ชื่อ อีเมล เบอร์โทร ที่อยู่จัดส่ง และหลักฐานยืนยันสินค้า) ตามหลักการเก็บข้อมูลเท่าที่จำเป็น (Data Minimization)',
      'ข้อมูลใช้เพื่อวัตถุประสงค์ในการยืนยันตัวตน ทำธุรกรรม การจัดส่งสินค้า และระงับข้อพิพาทเท่านั้น ไม่นำไปจำหน่ายหรือเปิดเผยต่อบุคคลภายนอก',
      'เจ้าของข้อมูลมีสิทธิ์เข้าถึง แก้ไข หรือขอลบข้อมูลบัญชีของตนเองได้ตามกฎหมายคุ้มครองข้อมูลส่วนบุคคล',
    ],
  },
  etransactions: {
    title: 'พ.ร.บ. ธุรกรรมทางอิเล็กทรอนิกส์ & คุ้มครองผู้บริโภค',
    subtitle: 'ความสมบูรณ์ทางกฎหมายของคำเสนอราคาประมูลและสัญญาซื้อขาย',
    bullets: [
      'การเสนอราคาประมูล (Bidding) และการกดยืนยันคำสั่งซื้อถือเป็นข้อมูลอิเล็กทรอนิกส์ที่มีบันทึก Timestamp และผู้ทำรายการใน Audit Log',
      'ระบบแสดงราคาสินค้า ค่าบริการคุ้มครอง Escrow (2%) และเงื่อนไขการรับประกันอย่างโปร่งใสชัดเจนก่อนยืนยันการชำระเงิน',
      'ผู้บริโภคมีสิทธิ์ยื่นข้อร้องเรียนกรณีได้รับสินค้าไม่ตรงปกหรือสินค้าเสียหาย เพื่อเข้าสู่กระบวนการพิจารณาคืนเงินอย่างเป็นธรรม',
    ],
  },
  terms: {
    title: 'Terms of Sale & Platform Ethics',
    subtitle: 'ข้อกำหนดการใช้งานแพลตฟอร์มและจริยธรรมตลาดกลาง',
    bullets: [
      'ห้ามผู้ขายลงจำหน่ายสินค้าละเมิดลิขสิทธิ์ ของปลอม หรือปั่นราคาประมูลหลอกลวง (Shill Bidding) รวมถึงห้ามผู้ขายประมูลสินค้าของตนเอง',
      'บัญชีผู้ดูแลระบบ (Admin) ไม่สามารถเข้าร่วมซื้อหรือประมูลสินค้าได้ เพื่อรักษาความเป็นกลางในการตรวจ Verify และตัดสินข้อพิพาท',
      'ทุกคำตัดสินข้อร้องเรียนยึดตามหลักฐานจริงในระบบ Escrow Audit Log และหลักฐานการจัดส่ง',
    ],
  },
};

export const PolicyModal: React.FC = () => {
  const { policyModalTopic, setPolicyModalTopic } = useStore();
  if (!policyModalTopic) return null;

  const content = POLICY_CONTENT[policyModalTopic];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 animate-fade-in">
      <div className="bg-canvas border border-hairline rounded-none max-w-lg w-full overflow-hidden animate-modal-in">
        <div className="flex items-center justify-between px-6 py-5 border-b border-hairline">
          <div className="flex items-center gap-2">
            {policyModalTopic === 'authenticity' || policyModalTopic === 'escrow' ? (
              <ShieldCheck className="w-5 h-5 text-success" />
            ) : (
              <Scale className="w-5 h-5 text-ink" />
            )}
            <h2 className="text-xl font-medium text-ink">{content.title}</h2>
          </div>
          <button
            type="button"
            onClick={() => setPolicyModalTopic(null)}
            className="btn-icon-circular"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm font-medium text-mute">{content.subtitle}</p>
          <ul className="space-y-3 text-sm text-charcoal leading-relaxed list-disc list-inside">
            {content.bullets.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
          <div className="pt-4">
            <button
              type="button"
              onClick={() => setPolicyModalTopic(null)}
              className="btn-primary w-full h-11 text-sm"
            >
              รับทราบและปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
