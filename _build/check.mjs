// Link/asset/anchor checker for the generated pages:  node _build/check.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'fourci.org');
const pages = ['index.html', 'about/index.html', 'services/index.html', 'resources/index.html', 'gallery/index.html', 'blog/index.html', 'contact/index.html', '404.html',
  'category/blog/index.html', 'category/climate/index.html', 'category/humanitarian/index.html',
  'humanitarian/standing-strong-in-crisis-how-community-volunteers-led-our-flood-needs-assessment/index.html', 'blog/join-our-vendor-community-register-pre-qualify-now/index.html'];
let bad = 0, count = 0;
const ids = {};
const idsOf = f => ids[f] ||= new Set([...fs.readFileSync(f, 'utf8').matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
for (const p of pages) {
  const file = path.join(OUT, p), html = fs.readFileSync(file, 'utf8');
  const refs = [...html.matchAll(/(?:href|src|data-full)="([^"]+)"/g)].map(m => m[1]);
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) m[1].split(',').forEach(s => refs.push(s.trim().split(' ')[0]));
  for (let r of new Set(refs)) {
    if (/^(https?:|mailto:|tel:|#$|data:)/.test(r)) continue;
    count++;
    let [u, hash] = r.split('#'); u = u.split('?')[0];
    let target = u ? path.resolve(path.dirname(file), decodeURIComponent(u)) : file;
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) { console.log('MISSING', p, '->', r); bad++; continue; }
    if (hash && target.endsWith('.html') && !idsOf(target).has(hash)) { console.log('NO ANCHOR', p, '->', r); bad++; }
  }
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) { console.log('H1 count', h1, p); bad++; }
  if (/<img(?![^>]*\balt=)/.test(html)) { console.log('IMG w/o alt', p); bad++; }
}
console.log(`checked ${count} local refs across ${pages.length} pages — ${bad} problem(s)`);
process.exit(bad ? 1 : 0);
