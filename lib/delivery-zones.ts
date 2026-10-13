export interface DeliveryZone {
  name: string;
  center: [number, number];
  radiusKm: number;
}

export const deliveryZones: DeliveryZone[] = [
  { name: 'Accra', center: [5.6017, -0.1879], radiusKm: 30 },
  { name: 'Kumasi', center: [6.6885, -1.6244], radiusKm: 25 },
  { name: 'Tema', center: [5.6698, -0.0166], radiusKm: 20 },
];

export interface NeighborhoodLocation {
  name: string;
  city: 'Accra' | 'Kumasi' | 'Tema';
  coords: [number, number];
  digitalAddress?: string;
}

export const POPULAR_NEIGHBORHOODS: NeighborhoodLocation[] = [
  // Kumasi Hubs (Primary)
  { name: 'Adum', city: 'Kumasi', coords: [6.6900, -1.6250], digitalAddress: 'AK-039-5028' },
  { name: 'KNUST Campus', city: 'Kumasi', coords: [6.6750, -1.5650], digitalAddress: 'AK-480-1120' },
  { name: 'Bantama', city: 'Kumasi', coords: [6.7050, -1.6350], digitalAddress: 'AK-110-3301' },
  { name: 'Ahodwo', city: 'Kumasi', coords: [6.6700, -1.6200], digitalAddress: 'AK-220-4019' },
  { name: 'Nhyiaeso', city: 'Kumasi', coords: [6.6750, -1.6350], digitalAddress: 'AK-090-8812' },
  { name: 'Kejetia Market', city: 'Kumasi', coords: [6.6950, -1.6200], digitalAddress: 'AK-010-0044' },
  { name: 'Asokwa', city: 'Kumasi', coords: [6.6650, -1.6000], digitalAddress: 'AS-040-5510' },
  { name: 'Suame', city: 'Kumasi', coords: [6.7200, -1.6300], digitalAddress: 'AK-310-8822' },
  { name: 'Ayigya', city: 'Kumasi', coords: [6.6800, -1.5750], digitalAddress: 'AK-450-2010' },
  { name: 'Tafo', city: 'Kumasi', coords: [6.7350, -1.6150], digitalAddress: 'AK-280-9901' },
  { name: 'Oforikrom', city: 'Kumasi', coords: [6.6850, -1.5900], digitalAddress: 'AH-120-4411' },
  { name: 'Kwadaso', city: 'Kumasi', coords: [6.6900, -1.6600], digitalAddress: 'AN-080-6620' },
  { name: 'Asafo', city: 'Kumasi', coords: [6.6850, -1.6150], digitalAddress: 'AK-140-7712' },
  { name: 'Tanoso', city: 'Kumasi', coords: [6.7000, -1.6800], digitalAddress: 'AK-510-3300' },
  { name: 'Santasi', city: 'Kumasi', coords: [6.6600, -1.6450], digitalAddress: 'AK-360-1209' },
  { name: 'Atonsu', city: 'Kumasi', coords: [6.6500, -1.5900], digitalAddress: 'AS-180-2210' },

  // Accra Hubs
  { name: 'East Legon', city: 'Accra', coords: [5.6358, -0.1558], digitalAddress: 'GA-382-9014' },
  { name: 'Osu / Oxford St', city: 'Accra', coords: [5.5560, -0.1830], digitalAddress: 'GA-082-1234' },
  { name: 'Spintex Road', city: 'Accra', coords: [5.6300, -0.0980], digitalAddress: 'GZ-189-5502' },
  { name: 'Airport Residential', city: 'Accra', coords: [5.6050, -0.1800], digitalAddress: 'GA-112-4091' },
  { name: 'Cantonments', city: 'Accra', coords: [5.5750, -0.1700], digitalAddress: 'GA-044-8821' },
  { name: 'Ridge', city: 'Accra', coords: [5.5650, -0.1950], digitalAddress: 'GA-030-7719' },
  { name: 'Dansoman', city: 'Accra', coords: [5.5450, -0.2600], digitalAddress: 'GA-510-2384' },
  { name: 'Madina', city: 'Accra', coords: [5.6800, -0.1650], digitalAddress: 'GM-012-9903' },
  { name: 'Dzorwulu', city: 'Accra', coords: [5.6100, -0.1980], digitalAddress: 'GA-155-4011' },
  { name: 'Labone', city: 'Accra', coords: [5.5650, -0.1650], digitalAddress: 'GA-050-6102' },
  { name: 'Legon (UG Campus)', city: 'Accra', coords: [5.6500, -0.1850], digitalAddress: 'GA-420-1000' },
  { name: 'Achimota', city: 'Accra', coords: [5.6150, -0.2300], digitalAddress: 'GW-018-4420' },
  { name: 'Adenta', city: 'Accra', coords: [5.7100, -0.1600], digitalAddress: 'GD-009-3381' },
  { name: 'Makola / Central', city: 'Accra', coords: [5.5450, -0.2050], digitalAddress: 'GA-183-9125' },
  { name: 'Lapaz', city: 'Accra', coords: [5.6050, -0.2450], digitalAddress: 'GW-022-7711' },
  { name: 'Kaneshie', city: 'Accra', coords: [5.5650, -0.2350], digitalAddress: 'GA-215-3340' },

  // Tema Hubs
  { name: 'Tema Community 1', city: 'Tema', coords: [5.6698, -0.0166], digitalAddress: 'GT-001-2004' },
  { name: 'Tema Community 25', city: 'Tema', coords: [5.7300, 0.0350], digitalAddress: 'GT-250-9941' },
  { name: 'Sakumono', city: 'Tema', coords: [5.6300, -0.0550], digitalAddress: 'GT-312-5100' },
  { name: 'Lashibi', city: 'Tema', coords: [5.6400, -0.0750], digitalAddress: 'GT-410-6020' },
  { name: 'Tema Community 6', city: 'Tema', coords: [5.6850, -0.0050], digitalAddress: 'GT-060-1200' },
];

export function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Parses GhanaPostGPS digital addresses (e.g. GA-183-9125, AK-039-5028)
 */
export function parseGhanaPostAddress(code: string): { valid: boolean; region?: string; coords?: [number, number] } {
  const match = code.trim().toUpperCase().match(/^([A-Z]{2,3})[\s-]?(\d{3,4})[\s-]?(\d{3,4})$/);
  if (!match) return { valid: false };

  const prefix = match[1];

  // Tema Prefix (GT, GB)
  if (['GT', 'GB'].includes(prefix)) {
    return { valid: true, region: 'Tema', coords: [5.6698, -0.0166] };
  }
  // Ashanti / Kumasi Prefix (AK, AS, AA, AE, AN, AH, AB, AO)
  if (['AK', 'AS', 'AA', 'AE', 'AN', 'AH', 'AB', 'AO'].includes(prefix)) {
    return { valid: true, region: 'Kumasi', coords: [6.6885, -1.6244] };
  }
  // Greater Accra Prefix (GA, GW, GE, GS, GM, GN, GD, GZ, GR)
  if (['GA', 'GW', 'GE', 'GS', 'GM', 'GN', 'GD', 'GZ', 'GR'].includes(prefix)) {
    return { valid: true, region: 'Accra', coords: [5.6037, -0.1870] };
  }

  return { valid: true, region: 'Accra', coords: [5.6017, -0.1879] };
}

/**
 * Intelligent location resolver:
 * Handles:
 * 1. Decimal coordinates ("5.6037, -0.1870")
 * 2. GhanaPost Digital Addresses ("GA-183-9125", "AK-039-5028")
 * 3. Neighborhood names ("East Legon", "Osu", "Adum", etc.)
 */
export function resolveLocation(input: string): {
  coords: [number, number];
  label: string;
  zone: string;
  source: 'coords' | 'ghanapost' | 'neighborhood' | 'fallback';
} | null {
  if (!input || !input.trim()) return null;
  const clean = input.trim();

  // 1. Raw Coordinates
  if (clean.includes(',')) {
    const parts = clean.split(',').map((s) => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const zoneCheck = checkDeliveryZoneByCoords(parts[0], parts[1]);
      return {
        coords: [parts[0], parts[1]],
        label: `${parts[0].toFixed(4)}, ${parts[1].toFixed(4)}`,
        zone: zoneCheck.zone || 'Accra',
        source: 'coords',
      };
    }
  }

  // 2. GhanaPost Digital Address
  const ghanaPost = parseGhanaPostAddress(clean);
  if (ghanaPost.valid && ghanaPost.coords) {
    return {
      coords: ghanaPost.coords,
      label: clean.toUpperCase(),
      zone: ghanaPost.region || 'Accra',
      source: 'ghanapost',
    };
  }

  // 3. Neighborhood / Area name matching
  const queryLower = clean.toLowerCase();
  const matchedNeighborhood = POPULAR_NEIGHBORHOODS.find(
    (n) =>
      queryLower.includes(n.name.toLowerCase()) ||
      n.name.toLowerCase().includes(queryLower) ||
      (n.digitalAddress && queryLower.includes(n.digitalAddress.toLowerCase()))
  );

  if (matchedNeighborhood) {
    return {
      coords: matchedNeighborhood.coords,
      label: `${matchedNeighborhood.name}, ${matchedNeighborhood.city}`,
      zone: matchedNeighborhood.city,
      source: 'neighborhood',
    };
  }

  return null;
}

export function checkDeliveryZoneByCoords(
  lat: number,
  lng: number
): { inZone: boolean; zone?: string; distanceKm?: number } {
  for (const zone of deliveryZones) {
    const dist = haversineKm([lat, lng], zone.center);
    if (dist <= zone.radiusKm) {
      return { inZone: true, zone: zone.name, distanceKm: dist };
    }
  }

  const nearest = deliveryZones.reduce(
    (min, z) => {
      const d = haversineKm([lat, lng], z.center);
      return d < min.dist ? { zone: z, dist: d } : min;
    },
    { zone: deliveryZones[0], dist: Infinity }
  );

  return { inZone: false, zone: nearest.zone.name, distanceKm: nearest.dist };
}

/**
 * Universal delivery zone checker accepting any input (coords, GhanaPost code, neighborhood)
 */
export function checkDeliveryZone(locationInput: string): {
  inZone: boolean;
  zone?: string;
  distanceKm?: number;
  coords?: [number, number];
  resolvedLabel?: string;
} {
  const resolved = resolveLocation(locationInput);

  if (resolved) {
    const check = checkDeliveryZoneByCoords(resolved.coords[0], resolved.coords[1]);
    return {
      inZone: check.inZone,
      zone: check.zone || resolved.zone,
      distanceKm: check.distanceKm,
      coords: resolved.coords,
      resolvedLabel: resolved.label,
    };
  }

  // If raw coordinates with NaN
  const [lat, lng] = locationInput.split(',').map((s) => parseFloat(s.trim()));
  if (!isNaN(lat) && !isNaN(lng)) {
    return checkDeliveryZoneByCoords(lat, lng);
  }

  return { inZone: false };
}
