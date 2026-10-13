'use client';

import * as React from 'react';

const MapPickerInner = React.lazy(() => import('./map-picker-inner'));

interface MapPickerProps {
  position: [number, number];
  onPositionChange: (pos: [number, number]) => void;
  height?: number;
}

export function MapPicker(props: MapPickerProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        style={{ height: props.height ?? 340, width: '100%' }}
        className="flex items-center justify-center rounded-2xl border border-border bg-muted/30 text-sm text-muted-foreground animate-pulse"
      >
        Loading map...
      </div>
    );
  }

  return (
    <React.Suspense
      fallback={
        <div
          style={{ height: props.height ?? 340, width: '100%' }}
          className="flex items-center justify-center rounded-2xl border border-border bg-muted/30 text-sm text-muted-foreground animate-pulse"
        >
          Loading map...
        </div>
      }
    >
      <MapPickerInner {...props} />
    </React.Suspense>
  );
}
