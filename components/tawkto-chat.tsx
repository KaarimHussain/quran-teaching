"use client";

import Script from "next/script";

// Replace TAWKTO_PROPERTY_ID and TAWKTO_WIDGET_ID with your Tawk.to credentials
// from https://dashboard.tawk.to — Settings → Chat Widget → Direct Chat Link
const PROPERTY_ID = process.env.NEXT_PUBLIC_TAWKTO_PROPERTY_ID ?? "";
const WIDGET_ID = process.env.NEXT_PUBLIC_TAWKTO_WIDGET_ID ?? "default";

export function TawkToChat() {
  if (!PROPERTY_ID) return null;

  const src = `https://embed.tawk.to/${PROPERTY_ID}/${WIDGET_ID}`;

  return (
    <Script
      id="tawkto-chat"
      strategy="lazyOnload"
      src={src}
      crossOrigin="anonymous"
    />
  );
}
