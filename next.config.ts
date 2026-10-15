import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  images: {
    remotePatterns: [
      // Allow any external URL pasted into the cover image URL field
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "**" },
    ],
  },
  // TEMPORARY: send every request to the Syntrix waitlist.
  // Delete this redirects() block to restore the site.
  async redirects() {
    return [
      {
        source: "/:path*",
        destination: "https://syntrix-whaitlist.vercel.app/",
        // 307, not 308, so browsers don't cache it once removed
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
