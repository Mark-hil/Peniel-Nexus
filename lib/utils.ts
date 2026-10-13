import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUUID(str: string | null | undefined): boolean {
  if (!str || typeof str !== 'string') return false;
  return UUID_REGEX.test(str.trim());
}

export function getDeliveryPin(orderIdOrNumber: string | null | undefined): string {
  if (!orderIdOrNumber || typeof orderIdOrNumber !== 'string') return '4286';
  // Deterministic 4-digit PIN based on ID / order number
  let hash = 0;
  for (let i = 0; i < orderIdOrNumber.length; i++) {
    hash = (hash << 5) - hash + orderIdOrNumber.charCodeAt(i);
    hash |= 0;
  }
  const pin = Math.abs(hash % 9000) + 1000;
  return pin.toString();
}

export function verifyDeliveryPin(orderIdOrNumber: string | null | undefined, inputPin: string): boolean {
  if (!inputPin) return false;
  const cleanInput = inputPin.trim();
  const expectedPin = getDeliveryPin(orderIdOrNumber);
  // Support universal master demo pin 1234 or exact matching PIN
  return cleanInput === expectedPin || cleanInput === '1234';
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

