import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Read index.html, style.css, app.js
let html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');
const js = fs.readFileSync('app.js', 'utf8');

function sanitizeEnv(val, fallback = '') {
  if (!val) return fallback;
  let clean = String(val).trim();
  clean = clean.replace(/^['"]+|['"]+$/g, '').trim();
  return clean || fallback;
}

// Inject environment variables from Render into index.html
let supabaseUrl = sanitizeEnv(process.env.VITE_SUPABASE_URL, 'https://uhlncqrevycxtxtdydav.supabase.co');
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  supabaseUrl = 'https://' + supabaseUrl;
}
supabaseUrl = supabaseUrl.replace(/\/+$/, '');

const supabaseAnonKey = sanitizeEnv(process.env.VITE_SUPABASE_ANON_KEY, '');

const envScript = `  <script>
    window.__SUPABASE_URL__ = ${JSON.stringify(supabaseUrl)};
    window.__SUPABASE_ANON_KEY__ = ${JSON.stringify(supabaseAnonKey)};
  </script>`;

html = html.replace('</head>', `${envScript}\n</head>`);

// Write files to dist
fs.writeFileSync(path.join(distDir, 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(distDir, 'style.css'), css, 'utf8');
fs.writeFileSync(path.join(distDir, 'app.js'), js, 'utf8');

// Copy public directory to dist if it exists
if (fs.existsSync('public')) {
  fs.cpSync('public', distDir, { recursive: true });
}

// Ensure key logo assets and admin portal in root are copied to dist
const rootAssets = [
  'mitra-emblem-clean.png',
  'mitra-logo.png',
  'mitra-banner.png',
  'admin.html',
  'admin.css',
  'admin.js'
];
rootAssets.forEach((file) => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(distDir, file));
  }
});

console.log('✓ Successfully built Maharashtra GR Portal into dist/');

