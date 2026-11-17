import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const client = path.join(__dirname, "..", "dist", "client");
const src = path.join(client, "404", "index.html");
const dest = path.join(client, "404.html");

try {
  fs.copyFileSync(src, dest);
  console.log("Copied: dist/client/404/index.html -> dist/client/404.html");
} catch (err) {
  console.error("Failed to copy the 404 page to dist/client/404.html", err);
  process.exit(1);
}
