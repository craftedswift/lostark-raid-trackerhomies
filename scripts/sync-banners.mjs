// Regenerates the BANNER_IMAGES array in index.html (and docs/index.html, if
// present) from whatever image files actually exist in assets/banners/ — so
// adding new art means dropping the file in and re-running this, not
// hand-editing the array. Weight overrides (e.g. a deliberately rare pull)
// live in WEIGHT_OVERRIDES below; anything else defaults to weight 1.
import { readdirSync } from 'fs';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');
const bannersDir = path.join(repoRoot, 'assets', 'banners');

const WEIGHT_OVERRIDES = {
  'echidna.jpg': 0.08,
};

const IMAGE_EXTENSIONS = new Set(['.webp', '.jpg', '.jpeg', '.png']);

function buildBannerImagesBlock() {
  const files = readdirSync(bannersDir)
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort();

  const lines = files.map((file) => {
    const weight = WEIGHT_OVERRIDES[file] ?? 1;
    return `    { file: '${file}', weight: ${weight} },`;
  });

  return `const BANNER_IMAGES = [\n${lines.join('\n')}\n  ];`;
}

function updateFile(filePath, block) {
  const html = readFileSync(filePath, 'utf8');
  const updated = html.replace(/const BANNER_IMAGES = \[[\s\S]*?\];/, block);
  if (updated === html) {
    console.log(`[unchanged] ${path.relative(repoRoot, filePath)}`);
    return;
  }
  writeFileSync(filePath, updated);
  console.log(`[updated] ${path.relative(repoRoot, filePath)}`);
}

const block = buildBannerImagesBlock();

for (const relPath of ['index.html', 'docs/index.html']) {
  const filePath = path.join(repoRoot, relPath);
  try {
    updateFile(filePath, block);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}
