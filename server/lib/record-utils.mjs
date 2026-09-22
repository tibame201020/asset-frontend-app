import crypto from 'node:crypto';

export function toDay(value, timezone = 'Asia/Taipei') {
  const s = String(value || '');
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  if (typeof value === 'number' || /^\d+$/.test(s)) {
    const n = Number(value);
    const d = new Date(n < 1e12 ? n * 1000 : n);
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(d);
  }

  const d = new Date(s);
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date: ${value}`);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(d);
}

export function daysInclusive(start, end) {
  const out = [];
  let d = new Date(start + 'T00:00:00Z');
  const last = new Date(end + 'T00:00:00Z');
  while (d <= last) {
    out.push(d.toISOString().slice(0, 10));
    d = new Date(d.getTime() + 86400000);
  }
  return out;
}

export function stableHashId(value) {
  return crypto.createHash('sha1').update(String(value)).digest('hex').slice(0, 16);
}

export function stripMigrationNote(note) {
  return String(note || '')
    .replace(/\s*\|?\s*Asset ID:\s*\d+\s*/gi, ' ')
    .replace(/\s*\|\s*$/g, '')
    .trim();
}

export function syntheticLocalIso(day, time = '12:00:00') {
  return `${day}T${time}+08:00`;
}

export function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}
