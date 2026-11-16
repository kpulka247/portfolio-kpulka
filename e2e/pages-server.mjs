import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = join(import.meta.dirname, "..", "dist", "client");
const port = Number(process.env.PORT ?? 4173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function send(res, status, path) {
  res.writeHead(status, {
    "content-type": types[extname(path)] ?? "application/octet-stream",
  });
  res.end(await readFile(path));
}

// Mirrors how GitHub Pages resolves a path: an existing file, then a
// directory index (redirecting to add the trailing slash), then 404.html.
createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const target = normalize(join(root, pathname));
  if (!target.startsWith(root)) return send(res, 404, join(root, "404.html"));

  if (await isFile(target)) return send(res, 200, target);

  const index = join(target, "index.html");
  if (await isFile(index)) {
    if (!pathname.endsWith("/")) {
      res.writeHead(301, { location: `${pathname}/` });
      return res.end();
    }
    return send(res, 200, index);
  }

  return send(res, 404, join(root, "404.html"));
}).listen(port, () =>
  console.log(`GitHub Pages mirror on http://localhost:${port}`),
);
