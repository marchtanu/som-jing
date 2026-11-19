import { ProductCategory } from '../types';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  'art-toys': 'อาร์ตทอย & ฟิกเกอร์',
  sneakers: 'สนีกเกอร์ & สตรีทแวร์',
  gadgets: 'แก็ดเจ็ต & กล้องเรโทร',
  watches: 'นาฬิกา & การ์ดสะสมลิมิเต็ด',
};

export function formatTHB(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatThaiDateTime(isoString: string): string {
  try {
    return new Intl.DateTimeFormat('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

export function getCountdownParts(endTimeIso: string, nowMs: number): {
  ended: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  const diff = new Date(endTimeIso).getTime() - nowMs;
  if (diff <= 0) {
    return {
      ended: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: 'ปิดประมูลแล้ว',
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatted =
    days > 0
      ? `${days} วัน ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return { ended: false, days, hours, minutes, seconds, formatted };
}

export function generateFallbackSvgDataUri(label: string, accent = '#D94E28'): string {
  const cleanLabel = label.slice(0, 26).replace(/[<>&"']/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="#F3EFE8"/>
    <rect x="36" y="36" width="728" height="528" rx="20" fill="#FFFFFF" stroke="#E6E1D6" stroke-width="2"/>
    <circle cx="400" cy="255" r="76" fill="${accent}" fill-opacity="0.12"/>
    <path d="M366 255l22 22 46-48" fill="none" stroke="${accent}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="400" y="382" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="700" fill="#141413">SOMJING AUTHENTIC ARCHIVE</text>
    <text x="400" y="420" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#57534E">${cleanLabel}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
