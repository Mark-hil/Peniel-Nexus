'use client';

import * as React from 'react';

// Re-export a dynamically-loaded map that skips SSR (Leaflet needs `window`)
const DeliveryMapInner = React.lazy(() => import('./delivery-map-inner'));

interface DeliveryMapProps {
  destination: [number, number];
  destinationLabel?: string;
  riderPosition?: [number, number];
  className?: string;
  height?: number;
  zoom?: number;
}

export function DeliveryMap(props: DeliveryMapProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={props.className}
        style={{
          height: props.height ?? 300,
          width: '100%',
          background: 'hsl(var(--muted))',
          borderRadius: '0.75rem',
        }}
      />
    );
  }

  return (
    <React.Suspense
      fallback={
        <div
          className={props.className}
          style={{
            height: props.height ?? 300,
            width: '100%',
            background: 'hsl(var(--muted))',
            borderRadius: '0.75rem',
          }}
        />
      }
    >
      <DeliveryMapInner {...props} />
    </React.Suspense>
  );
}
