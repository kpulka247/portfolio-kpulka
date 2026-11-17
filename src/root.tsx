import type { ReactNode } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type LinksFunction,
} from "react-router";

import { BEACON_SRC, BEACON_TOKEN } from "./analytics";
import { THEME_SCRIPT } from "./theme";
import "./index.css";

// The icons come from scripts/make-icons.mjs. Browsers that read SVG
// icons use favicon.svg, the rest the PNG sizes below.
export const links: LinksFunction = () => [
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: "/favicon-32x32.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "16x16",
    href: "/favicon-16x16.png",
  },
  { rel: "manifest", href: "/site.webmanifest" },
  { rel: "shortcut icon", href: "/favicon.ico" },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    // The page background lives on <html>: iOS 26 Safari tints its bars
    // from it when no fixed or sticky element sits at the screen edge.
    // THEME_SCRIPT adds the theme attributes before React hydrates.
    <html lang="en" className="bg-sheet" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        {/* Older Safari and Chrome on Android tint their bars from this.
            THEME_SCRIPT, right after it, sets it to the theme's sheet. */}
        <meta name="theme-color" content="#f7f6f4" />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="google" content="notranslate" />
        <Meta />
        <Links />
      </head>
      <body className="notranslate bg-sheet">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
        <ScrollRestoration />
        <Scripts />
        {BEACON_TOKEN && (
          // As in Cloudflare's own snippet. Module scripts run after the
          // page is parsed, like defer.
          <script
            type="module"
            src={BEACON_SRC}
            data-cf-beacon={JSON.stringify({ token: BEACON_TOKEN })}
          />
        )}
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
