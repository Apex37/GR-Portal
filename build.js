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

// Inject environment variables from Render into index.html
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uhlncqrevycxtxtdydav.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const envScript = `  <script>
    window.__SUPABASE_URL__ = ${JSON.stringify(supabaseUrl)};
    window.__SUPABASE_ANON_KEY__ = ${JSON.stringify(supabaseAnonKey)};
  </script>`;

html = html.replace('</head>', `${envScript}\n</head>`);

// Write files to dist
fs.writeFileSync(path.join(distDir, 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(distDir, 'style.css'), css, 'utf8');
fs.writeFileSync(path.join(distDir, 'app.js'), js, 'utf8');

console.log('✓ Successfully built Maharashtra GR Portal into dist/');
