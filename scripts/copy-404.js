import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const src = path.join(__dirname, '..', 'dist', 'index.html');
const dest = path.join(__dirname, '..', 'dist', '404.html');

try {
    fs.copyFileSync(src, dest);
    console.log('Copied: dist/index.html -> dist/404.html');
} catch (err) {
    console.error('Failed to copy index.html to dist/404.html', err);
    process.exit(1);
}