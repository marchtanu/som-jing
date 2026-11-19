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

export function generateFallbackSvgDataUri(label: string, accent = '#111111'): string {
  const cleanLabel = label.slice(0, 26).replace(/[<>&"']/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <rect width="800" height="800" fill="#f5f5f5"/>
    <circle cx="400" cy="350" r="64" fill="none" stroke="${accent}" stroke-width="6"/>
    <path d="M372 350l20 20 38-40" fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="400" y="468" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="600" fill="#111111">SOMJING AUTHENTIC ARCHIVE</text>
    <text x="400" y="502" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#707072">${cleanLabel}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
