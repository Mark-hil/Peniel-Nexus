import { resolveLocation } from './delivery-zones';

export function formatGHS(amount: number): string {
  return `GHS ${amount.toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-GH');
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-GH', {
    hour: 'numeric',
    minute: '2-digit',
  });
}


export function parseGPS(gps: string): [number, number] {
  if (!gps || !gps.trim()) return [5.6037, -0.1870];
  const resolved = resolveLocation(gps);
  if (resolved) {
    return resolved.coords;
  }
  const parts = gps.split(',').map((s) => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return [parts[0], parts[1]];
  }
  return [5.6037, -0.1870];
}
