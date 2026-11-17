/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Cloudflare Web Analytics token. See src/analytics.ts.
  readonly VITE_CF_BEACON_TOKEN?: string;
}
