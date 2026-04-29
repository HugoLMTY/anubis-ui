const fs = require('fs');
const path = require('path');

const srcConfigDir = path.join(__dirname, '..', 'src', 'config');
const distConfigDir = path.join(__dirname, '..', 'dist', 'config');

if (!fs.existsSync(srcConfigDir)) {
  console.warn(`☯︎ [ANUBIS - Config] src/config not found, skipping.`);
  process.exit(0);
}

if (!fs.existsSync(path.join(__dirname, '..', 'dist'))) {
  console.warn(`☯︎ [ANUBIS - Config] dist/ not found, run tsc first.`);
  process.exit(1);
}

fs.mkdirSync(distConfigDir, { recursive: true });

const files = fs.readdirSync(srcConfigDir).filter((f) => f.endsWith('.json'));
for (const file of files) {
  const src = path.join(srcConfigDir, file);
  const dest = path.join(distConfigDir, file);
  fs.copyFileSync(src, dest);
}
