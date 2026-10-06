import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// SVG with Graduation Cap icon matching Google Stitch
const svgStandard = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="112" fill="#2563eb"/>
  <g transform="translate(64, 76) scale(0.75)" stroke="#ffffff" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Mortarboard cap -->
    <path d="M256 70 L480 180 L256 290 L32 180 Z" fill="#ffffff" stroke="#ffffff"/>
    <!-- Cap underband -->
    <path d="M100 216 V340 C100 370 170 410 256 410 C342 410 412 370 412 340 V216" fill="#1d4ed8" stroke="#ffffff"/>
    <!-- Tassel with orange highlight -->
    <path d="M424 200 V330" stroke="#ea580c" stroke-width="20"/>
    <circle cx="424" cy="345" r="16" fill="#ea580c" stroke="#ea580c"/>
  </g>
</svg>`;

const svgMaskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Full-bleed background for maskable safe-zone -->
  <rect width="512" height="512" fill="#2563eb"/>
  <g transform="translate(100, 110) scale(0.61)" stroke="#ffffff" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- Mortarboard cap inside 80% safe zone -->
    <path d="M256 70 L480 180 L256 290 L32 180 Z" fill="#ffffff" stroke="#ffffff"/>
    <path d="M100 216 V340 C100 370 170 410 256 410 C342 410 412 370 412 340 V216" fill="#1d4ed8" stroke="#ffffff"/>
    <path d="M424 200 V330" stroke="#ea580c" stroke-width="22"/>
    <circle cx="424" cy="345" r="18" fill="#ea580c" stroke="#ea580c"/>
  </g>
</svg>`;

async function run() {
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgStandard);
  console.log('Wrote icon.svg');

  // Generate 192x192
  await sharp(Buffer.from(svgStandard))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Wrote pwa-192x192.png');

  // Generate 512x512
  await sharp(Buffer.from(svgStandard))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Wrote pwa-512x512.png');

  // Generate Maskable 512x512
  await sharp(Buffer.from(svgMaskable))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Wrote pwa-maskable-512x512.png');

  // Generate Apple Touch Icon (180x180)
  await sharp(Buffer.from(svgStandard))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Wrote apple-touch-icon.png');

  // Generate favicon.png and favicon.ico
  await sharp(Buffer.from(svgStandard))
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Wrote favicon.ico');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
