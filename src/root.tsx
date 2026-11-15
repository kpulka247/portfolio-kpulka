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
import "./index.css";

export const links: LinksFunction = () => [
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
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="google" content="notranslate" />
        <Meta />
        <Links />
      </head>
      <body style={{ backgroundColor: "#000000" }} className="notranslate">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
        <ScrollRestoration />
        <Scripts />
        {BEACON_TOKEN && (
          <script
            defer
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
