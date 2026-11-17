// Cloudflare Web Analytics, which sets no cookies and stores nothing on the
// visitor's device. The release workflow passes the CF_BEACON_TOKEN
// repository variable in as VITE_CF_BEACON_TOKEN. Without it, the build has
// no analytics, and the privacy page says nothing about them.
export const BEACON_TOKEN: string | undefined =
  import.meta.env.VITE_CF_BEACON_TOKEN || undefined;

export const BEACON_SRC = "https://static.cloudflareinsights.com/beacon.min.js";
