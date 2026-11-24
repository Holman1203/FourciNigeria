// FOURCi static site generator.  Run:  node _build/build.mjs
// Writes the redesigned pages into ./fourci.org, keeping the original URL structure.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'fourci.org');
const UP = 'wp-content/uploads';
const SITE = 'https://fourci.org';
const PHONE = '+234 806 925 2134', PHONE_HREF = 'tel:+2348069252134';
const EMAIL = 'fourcinigeria@gmail.com';
const FB = 'https://web.facebook.com/fourcinigeria', TW = 'https://x.com/fourcinigeria';
const PROFILE = `${UP}/2026/03/FOURCi-Profile-two-1.pdf`;
const VENDOR_FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSeXddFNxUy6IwaFqlwkzoqJxSJ8uJWmliy2vWP85c2IFu1DXw/viewform?usp=header';

/* ------------------------------------------------------------------ images */
function dims(file) {
  const b = fs.readFileSync(file);
  if (b[0] === 0x89 && b[1] === 0x50) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + b.readUInt16BE(i + 2);
  }
  throw new Error('no dims ' + file);
}
const cache = {};
// photo('2026/01/GJT06334')  -> collects GJT06334.jpg|-scaled.jpg|-WxH.jpg
function photo(stem, ext = 'jpg') {
  const key = stem + ext; if (cache[key]) return cache[key];
  const dir = path.join(OUT, UP, path.dirname(stem)), base = path.basename(stem);
  const files = fs.readdirSync(dir).filter(f => {
    const m = f.match(/^(.*?)(?:-(\d+)x(\d+)|-scaled)?\.(jpe?g|png)$/i);
    return m && m[1] === base && !/-150x150|-50x50/.test(f);
  });
  const list = files.map(f => ({ rel: `${UP}/${path.dirname(stem)}/${f}`, ...dims(path.join(dir, f)) })).sort((a, b) => a.w - b.w);
  if (!list.length) throw new Error('missing image ' + stem);
  return (cache[key] = list);
}
// pick(list, minWidth) - smallest variant >= minWidth else largest
const pick = (list, w) => list.find(i => i.w >= w) || list[list.length - 1];
let ROOT = '';
function img(stem, alt, { sizes = '100vw', cls = '', eager = false, max = 2048, src: srcMin = 1024, fetchp = false } = {}) {
  const all = photo(stem);
  const list = all.filter(i => i.w <= max).length ? all.filter(i => i.w <= max) : [all[0]];
  const s = pick(list, srcMin);
  const srcset = list.map(i => `${ROOT}${i.rel} ${i.w}w`).join(', ');
  return `<img src="${ROOT}${s.rel}" srcset="${srcset}" sizes="${sizes}" width="${s.w}" height="${s.h}" alt="${alt}"${cls ? ` class="${cls}"` : ''} ${eager ? `fetchpriority="${fetchp ? 'high' : 'auto'}" decoding="async"` : 'loading="lazy" decoding="async"'}>`;
}
const fileUrl = (stem, w = 1024) => `${pick(photo(stem), w).rel}`;

const P = {
  seedlings: '2026/01/GJT06334', groupPlant: '2026/01/GJT06365', class: '2026/01/f-65', kits: '2025/12/f-9',
  planting: '2025/12/GJT06236', women: '2025/12/GJT07069', wed: '2025/12/WhatsApp-Image-2025-12-27-at-3.58.28-AM1',
  iom: '2025/09/PHI_2200', listen: '2025/09/VAN76651', kids: '2026/01/FB_IMG_1768811057673',
  walk: '2025/09/481216568_647029401019755_5582878030125509921_n', handshake: '2025/07/481905537_647023857686976_6834902301093888971_n',
  vests: '2025/07/474229998_920017766868633_8943130962686971005_n-1', flood: '2020/06/Collapsed-home-FOURCi-Flood-Rapid-Assesment-Michika-Madagali-Sep-2024',
};

/* ------------------------------------------------------------------- icons */
const ICONS = {
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>', chev: '<path d="m6 9 6 6 6-6"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  drop: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  sprout: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  mega: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  flask: '<path d="M10 2v7.5a2 2 0 0 1-.2.9L4.7 20.5a1 1 0 0 0 .9 1.5h12.8a1 1 0 0 0 .9-1.5L14.2 10.4a2 2 0 0 1-.2-.9V2"/><path d="M8.5 2h7M7 16h10"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  venus: '<circle cx="12" cy="9" r="5"/><path d="M12 14v8M9 19h6"/>',
  pulse: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  buoy: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24"/>',
  quote: '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.76-2.02-2-2H4c-1.25 0-2 .75-2 1.97V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .01-1 1.03V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.76-2.02-2-2h-4c-1.25 0-2 .75-2 1.97V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>',
  fb: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  tw: '<path d="M4 4l16 16M20 4 4 20"/>',
  down: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  cal: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  handshake: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  up: '<path d="m18 15-6-6-6 6"/>', left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>',
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  tree: '<path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/><path d="M7 16v6M13 19v3"/><path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5"/>',
};
const icon = (n, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[n]}</svg>`;

/* ----------------------------------------------------------------- content */
const PILLARS = [
  { t: 'Environmental Sustainability & Afforestation', ic: 'tree', img: P.seedlings, alt: 'Pupils holding tree seedlings during a FOURCi planting day in Adamawa State', d: 'Restoring ecosystems and creating new carbon sinks through tree planting, soil restoration and community green zones.' },
  { t: 'WASH & Protection Services', ic: 'drop', img: P.iom, alt: 'FOURCi staff and partners handing out supplies to a woman at a community distribution', d: 'Safe water, sanitation and hygiene, linked with protection and climate resilience for vulnerable households.' },
  { t: 'Sustainable Livelihoods & Climate-Smart Agriculture', ic: 'sprout', img: P.handshake, alt: 'A FOURCi officer and a community elder together holding a young tree seedling', d: 'Drought-resistant crops, agroforestry and regenerative farming that raise productivity while protecting the land.' },
  { t: 'Climate Change Education & Awareness', ic: 'book', img: P.class, alt: 'A FOURCi facilitator leading a climate education session in a classroom', d: 'Training farmers, local leaders, schools and youth to become champions of environmental stewardship.' },
];
const THEMES = [
  ['Climate Change Mitigation & Adaptation', 'leaf', 'Strengthening community resilience through climate-smart practices, awareness campaigns, nature-based solutions, and policies that reduce climate risks.'],
  ['Climate-Smart Agriculture & Food Security', 'sprout', 'Empowering farmers with sustainable agricultural techniques, improved seed varieties, soil management, irrigation solutions, and sustainable land-use systems that enhance productivity and food sovereignty.'],
  ['Renewable Energy & Green Technology', 'sun', 'Promoting clean, affordable, and sustainable energy alternatives such as solar solutions, energy-efficient technologies, and green innovation for homes and communities.'],
  ['Gender and Climate Change', 'venus', 'Analysing the disproportionate impacts of climate change on women and marginalised genders, recognising their heightened vulnerability due to systemic inequalities.'],
  ['Environmental Conservation & Ecosystem Restoration', 'tree', 'Supporting reforestation, land rehabilitation, biodiversity protection, and the restoration of degraded ecosystems to promote a healthier environment.'],
  ['Water, Sanitation & Hygiene (WASH)', 'drop', 'Improving access to safe water, sanitation facilities, hygiene promotion, and community-led initiatives that prevent waterborne diseases and enhance public health.'],
  ['Disaster Risk Reduction & Emergency Preparedness', 'buoy', 'Building community capacity to anticipate, prevent, and respond to climate-related disasters such as floods, erosion, drought, and environmental hazards.'],
  ['Communicable Disease and Climate', 'pulse', 'Examining the relationship between shifting climate patterns and the expanding geographic spread of communicable diseases, including vector-borne, waterborne, and airborne infections.'],
];
const WHAT_WE_DO = ['Environmental Sustainability and Afforestation', 'WASH and Protection Services', 'Sustainable Livelihoods and Climate-Smart Agriculture', 'Climate Change Education and Awareness', 'Advocacy and Policy Engagement', 'Research and Development', 'Disaster Response and Resilience Building', 'Capacity Building and Community Empowerment'];
const WWD_ICONS = ['tree', 'drop', 'sprout', 'book', 'mega', 'flask', 'buoy', 'users'];
// Impact figures as published on the original homepage.
const STATS = [[45, 'Projects delivered'], [60, 'Locations of implementation'], [4469, 'Beneficiaries reached'], [350, 'Volunteers']];
const SERVICE_STATS = [[4500, 'Women & Youth Empowered in Climate Action'], [2800, 'Farmers Trained on Climate-Smart Agriculture'], [18000, 'People Reached Through WASH Programs'], [35000, 'Trees Planted & Land Restored']];
const PROJECTS = [
  { t: 'Whole School Approach for Sustainable Development in Adamawa State', tag: 'Education', img: P.planting, alt: 'Students and FOURCi staff planting a tree in a school compound' },
  { t: 'Enhancing the Resilience of Conflict Affected Population in Adamawa', tag: 'Resilience', img: P.walk, alt: 'FOURCi team and partners walking through farmland with community members in Adamawa State' },
  { t: 'World Environment Day, Maiduguri 2025', tag: 'Advocacy', img: P.wed, alt: 'Participants at the World Environment Day 2025 event in Maiduguri' },
  { t: 'Empowering Women in Peace-Building through Climate Action', tag: 'Gender & Peace', img: P.women, alt: 'Women leaders at a community forum on women in governance and climate action' },
  { t: 'Strengthening the Resilience of Crisis Affected Population in Adamawa', tag: 'Humanitarian', img: P.iom, alt: 'A community member receiving supplies from FOURCi and partner staff' },
  { t: 'Greening Adamawa State, FOURCi x ACReSAL', tag: 'Greening', img: P.listen, alt: 'A FOURCi facilitator addressing women gathered for a community session' },
  { t: 'Humanitarian Development & Peace Nexus Pilot Project', tag: 'Nexus pilot', img: P.kids, alt: 'Children wearing “I am an Advocate” shirts at a training session' },
];
const FAQS = [
  ['Why should I choose FOURCi?', `<p>FOURCi stands at the intersection of proven environmental action and sustainable community empowerment. We are chosen by partners and communities because of our integrated approach: we believe climate resilience and human development are inseparable. Our projects are designed with scientific rigour, deep community engagement, and a commitment to long-term, measurable impact. We don’t just implement projects; we build local capacity and create adaptive systems that endure. Our track record of transparent reporting, certified methodologies, and collaborative partnerships ensures your trust and investment leads to tangible, positive change for both the planet and its people.</p>`],
  ['What types of environmental and climate-related programmes does FOURCi implement?', `<p>Our programmes are organised across three interconnected pillars.</p>
    <h4>Climate Mitigation &amp; Carbon Projects</h4><ul><li><strong>Reforestation &amp; Afforestation:</strong> restoring native ecosystems and creating new carbon sinks.</li><li><strong>Renewable Energy Access:</strong> deploying solar, wind, and micro-hydro solutions for off-grid communities.</li><li><strong>Clean Cookstove Distribution:</strong> reducing emissions and improving health by replacing open-fire cooking.</li><li><strong>Agricultural Carbon:</strong> promoting regenerative farming and soil carbon sequestration practices.</li></ul>
    <h4>Climate Adaptation &amp; Community Resilience</h4><ul><li><strong>Water Security:</strong> building rainwater harvesting systems, protecting watersheds, and promoting efficient irrigation.</li><li><strong>Sustainable Agriculture &amp; Food Security:</strong> introducing drought-resistant crops and agroforestry systems.</li><li><strong>Disaster Risk Reduction:</strong> strengthening early warning systems and building climate-smart infrastructure.</li><li><strong>Ecosystem-based Adaptation:</strong> protecting mangroves, wetlands, and forests as natural shields against climate impacts.</li></ul>
    <h4>Integrated Community Development</h4><ul><li><strong>Biodiversity &amp; Livelihoods:</strong> community-managed conservation areas linked to sustainable income (e.g., eco-tourism, non-timber forest products).</li><li><strong>Climate Education &amp; Capacity Building:</strong> training for farmers, local leaders, and youth on environmental stewardship.</li><li><strong>Health &amp; Sanitation:</strong> linking WASH (Water, Sanitation, and Hygiene) projects with climate resilience.</li></ul>`],
  ['Are FOURCi’s staff, experts, and volunteers trained and certified in their fields?', `<p>Absolutely. The competence and professionalism of our team are the foundation of our credibility and success.</p>
    <ul><li><strong>Core Staff &amp; Project Managers</strong> hold advanced degrees in environmental science, forestry, sustainable development, and related fields. They maintain certifications in project management (e.g., PMP, PRINCE2) and specialised standards like the Gold Standard or VERRA for carbon projects.</li><li><strong>Technical Experts:</strong> our network includes certified agroecologists, licensed forest engineers, accredited auditors, and GIS specialists. They undergo continuous professional development to stay at the forefront of climate science and methodology.</li><li><strong>Field Officers &amp; Community Facilitators</strong> are locally recruited and extensively trained in participatory methods, monitoring &amp; evaluation (M&amp;E), and specific technical skills (e.g., nursery management, stove installation). They often hold national vocational certifications.</li><li><strong>Volunteers</strong> complete a mandatory induction programme covering our code of conduct, safety protocols, and the specific context of their assignment. Skilled volunteers are matched to roles that fit their verified qualifications and experience.</li></ul><p>We invest heavily in ongoing training and ensure all our operations adhere to international best practices and verification standards.</p>`],
];
const TESTIMONIALS = [
  ['Before FOURCi came to our community, many of us were struggling with low crop yield due to drought. Their climate-smart farming training changed everything. Today, I harvest twice as much as last year. FOURCi has given us hope and the confidence to face climate challenges.', 'Fidelis Musa', 'Farmer – Njoboliyo Community'],
  ['The land restoration project by FOURCi has transformed our environment and our livelihood. What used to be dry, degraded land is now fertile again. Women in my community can now grow vegetables all year. FOURCi truly empowers women.', 'Grace Patrick', 'Women Leader – Yola South'],
  ['FOURCi opened my eyes to the reality of climate change. Through their awareness campaigns, I learned how simple actions like tree planting and proper waste disposal can protect our future. I now lead weekly clean-ups in my community. FOURCi turned me into an environmental champion.', 'Musa Adamu', 'Youth Volunteer – Girei LGA'],
  ['FOURCi’s approach is not just about projects—it is about people. Their team listens to us, involves us, and works with transparency. They helped us understand flood preparedness and even supported us with early warning tools. Our community now feels safer and more informed.', 'Samuel J', 'Community Leader – Numan'],
];
// slug = file name looked up in assets/partners/<slug>.(svg|png|webp); falls back to a name card when no logo file exists.
const PARTNERS = [
  { slug: 'nrc', name: 'Norwegian Refugee Council', note: 'NRC' },
  { slug: 'norway', name: 'Norway', note: 'Funding support' },
  { slug: 'un-women', name: 'UN Women', note: 'Women’s peacebuilding' },
  { slug: 'wphf', name: 'Women’s Peace & Humanitarian Fund', note: 'WPHF' },
  { slug: 'iom', name: 'IOM – UN Migration', note: 'Community protection' },
  { slug: 'save-the-children', name: 'Save the Children', note: 'HDP Nexus pilot' },
  { slug: 'acresal', name: 'ACReSAL', note: 'Greening Adamawa' },
  { slug: 'drpc', name: 'DRPC – 30 Years of Supporting Inclusive Development', note: 'DRPC' },
  { slug: 'nhf', name: 'Nigeria Humanitarian Fund (NHF)', note: 'NHF' },
  { slug: 'fao', name: 'Food and Agriculture Organization (FAO)', note: 'FAO' },
];
const POSTS = [
  { slug: 'humanitarian/standing-strong-in-crisis-how-community-volunteers-led-our-flood-needs-assessment', title: 'Standing Strong in Crisis: How Community Volunteers Led Our Flood Needs Assessment', date: '2024-09-29', author: 'Rinji Kwarkas', cats: ['climate', 'humanitarian'], img: P.flood, imgAlt: 'Collapsed homes after the September 2024 flood in Michika and Madagali, Adamawa State', excerpt: 'When disaster struck Madagali and Michika LGAs in Adamawa State in September 2024, the devastation was overwhelming. Homes, farmlands, and vital infrastructure were washed away… FOURCi mobilised quickly to conduct a rapid needs assessment, led on the ground by community volunteers.' },
  { slug: 'blog/join-our-vendor-community-register-pre-qualify-now', title: 'Join Our Vendor Community – Register & Pre-Qualify Now!', date: '2025-10-30', author: 'FOURCi', cats: ['blog'], img: null, excerpt: 'Are you ready to partner with FOURCi and contribute to meaningful change? We’re inviting suppliers and service providers to register and pre-qualify with us for upcoming opportunities in agricultural kits, tree seedlings, printing, media and catering services.' },
];
const CATS = { blog: 'Blog', climate: 'Climate', humanitarian: 'Humanitarian' };
const fmtDate = d => new Date(d + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

const GALLERY = [
  [P.seedlings, 'Pupils with tree seedlings', 'environment', 'Pupils hold up tree seedlings during a school planting day supported with funding from Norway.'],
  [P.groupPlant, 'Seedling distribution in schools', 'environment education', 'Distribution of seedlings in schools, delivered in partnership with the Norwegian Refugee Council.'],
  [P.class, 'Climate education session', 'education', 'A facilitator leads a climate change education session in a school classroom.'],
  [P.kits, 'Climate club kits', 'environment education', 'Waste bins, watering cans and wheelbarrows prepared for school climate clubs.'],
  [P.planting, 'Planting a tree with students', 'environment education', 'Students and FOURCi volunteers plant a tree together in a school compound.'],
  [P.women, 'Women in governance forum', 'women', 'Community forum for women in governance: empowering women in peacebuilding through climate action.'],
  [P.wed, 'World Environment Day 2025', 'advocacy', 'FOURCi members, partners and student volunteers mark World Environment Day 2025 in Maiduguri.'],
  [P.iom, 'Community distribution', 'resilience', 'FOURCi and partner staff hand supplies to a community member in a crisis-affected area.'],
  [P.listen, 'Community conversation', 'women resilience', 'A FOURCi facilitator speaks with women gathered for a community session.'],
  [P.kids, '“I am an Advocate” children’s training', 'education', 'Children raise four fingers for FOURCi at a Humanitarian–Development–Peace Nexus pilot training.'],
  [P.walk, 'Field visit with partners', 'resilience', 'FOURCi, partners and community leaders on a field visit to farmland in Adamawa State.'],
  [P.handshake, 'Handing over a seedling', 'environment resilience', 'A FOURCi officer and a community elder with tree seedlings, supporting sustainable livelihoods.'],
  [P.vests, 'Volunteers planting', 'environment', 'FOURCi volunteers in their green vests plant trees at a school in north-east Nigeria.'],
  [P.flood, 'Flood damage, Michika & Madagali', 'resilience', 'Collapsed homes after the September 2024 floods in Michika and Madagali, Adamawa State.'],
];

/* ------------------------------------------------------------------ layout */
const NAV = [
  { key: 'home', label: 'Home', href: 'index.html' },
  { key: 'about', label: 'About', href: 'about/index.html', dd: [['Who we are', 'about/index.html#who', 'Our story and coalition'], ['Mission & vision', 'about/index.html#mission', 'What guides us'], ['What we do', 'about/index.html#what-we-do', 'Eight areas of work']] },
  { key: 'services', label: 'Services', href: 'services/index.html', dd: [['Thematic areas', 'services/index.html#themes', 'Where we work'], ['Voices from communities', 'services/index.html#voices', 'Testimonials']] },
  { key: 'resources', label: 'Resources', href: 'resources/index.html', dd: [['Projects', 'resources/index.html#projects', 'Programmes & events'], ['Gallery', 'gallery/index.html', 'Photos from the field'], ['Organisation profile (PDF)', PROFILE, 'Download, 32 MB']] },
  { key: 'blog', label: 'Blog', href: 'blog/index.html', dd: [['All stories', 'blog/index.html', ''], ['Climate', 'category/climate/index.html', ''], ['Humanitarian', 'category/humanitarian/index.html', '']] },
  { key: 'contact', label: 'Contact', href: 'contact/index.html' },
];

function layout({ page, depth, title, desc, path: urlPath, body, ogImage, jsonld, bodyClass = '' }) {
  ROOT = '../'.repeat(depth);
  const r = ROOT;
  body = typeof body === 'function' ? body() : body;
  const nav = NAV.map(n => {
    const cur = n.key === page ? ' aria-current="page"' : '';
    if (!n.dd) return `<li><a class="nav-link" href="${r}${n.href}"${cur}>${n.label}</a></li>`;
    return `<li class="has-dd"><button class="nav-link" type="button" aria-expanded="false" aria-haspopup="true">${n.label}${icon('chev', 'chev')}</button>` +
      `<ul class="dropdown"><li><a href="${r}${n.href}">Overview</a></li>${n.dd.map(d => `<li><a href="${/^https?:/.test(d[1]) ? d[1] : r + d[1]}">${d[0]}</a></li>`).join('')}</ul></li>`;
  }).join('');
  const url = SITE + '/' + urlPath;
  const og = ogImage || fileUrl(P.groupPlant, 1024);
  const org = {
    '@context': 'https://schema.org', '@type': 'NGO', name: 'Concern on Climate Change for the Community Initiative (FOURCi)', alternateName: 'FOURCi', url: SITE + '/',
    logo: `${SITE}/${UP}/2025/08/cropped-FOURCi-Watermark-colored-scaled-1.png`, email: EMAIL, telephone: PHONE,
    sameAs: [FB, TW], address: { '@type': 'PostalAddress', streetAddress: 'No. 10 Flat B, Behind Federal High Court Polo', addressLocality: 'Maiduguri', addressRegion: 'Borno State', addressCountry: 'NG' },
  };
  return `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#07301F">
<meta property="og:type" content="website"><meta property="og:site_name" content="FOURCi">
<meta property="og:title" content="${title}"><meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}"><meta property="og:image" content="${SITE}/${og}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${r}${UP}/2025/07/cropped-453011896_505268121862551_4719573384039909840_n-1-50x50.jpg" sizes="32x32">
<link rel="apple-touch-icon" href="${r}${UP}/2025/07/cropped-453011896_505268121862551_4719573384039909840_n-1-300x300.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="${r}assets/site.css">
<script type="application/ld+json">${JSON.stringify(org)}</script>${jsonld ? `\n<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ''}
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
<div class="topbar"><div class="container">
  <div class="group"><a href="${PHONE_HREF}">${icon('phone')}${PHONE}</a><a href="mailto:${EMAIL}">${icon('mail')}${EMAIL}</a></div>
  <div class="group right"><span>Maiduguri · Yola · Jos, Nigeria</span><a href="${FB}" rel="noopener" target="_blank" aria-label="FOURCi on Facebook">${icon('fb')}</a><a href="${TW}" rel="noopener" target="_blank" aria-label="FOURCi on X">${icon('tw')}</a></div>
</div></div>
<header class="header"><div class="container">
  <a class="brand" href="${r}index.html" aria-label="FOURCi – home"><img src="${r}${UP}/2025/08/cropped-FOURCi-Watermark-colored-scaled-1-200x51.png" srcset="${r}${UP}/2025/08/cropped-FOURCi-Watermark-colored-scaled-1-200x51.png 1x, ${r}${UP}/2025/08/cropped-FOURCi-Watermark-colored-scaled-1.png 2x" width="181" height="46" alt="FOURCi – Concern on Climate Change for the Community Initiative"></a>
  <nav class="nav" id="site-nav" aria-label="Main">
    <ul id="nav-list">${nav}</ul>
    <div class="nav-cta"><a class="btn btn--sm" href="${r}contact/index.html?subject=Partnership">Partner with us ${icon('arrow', 'icon-arrow')}</a></div>
  </nav>
  <button class="menu-btn" type="button" aria-controls="site-nav" aria-expanded="false" aria-label="Open menu">${icon('menu')}</button>
</div></header>
<main id="main">
${body}
</main>
<footer class="footer">
  <div class="container footer__top">
    <div class="brand-block"><img src="${r}${UP}/2025/08/cropped-FOURCi-Watermark-colored-scaled-1-200x51.png" srcset="${r}${UP}/2025/08/cropped-FOURCi-Watermark-colored-scaled-1-200x51.png 1x, ${r}${UP}/2025/08/cropped-FOURCi-Watermark-colored-scaled-1.png 2x" width="181" height="46" alt="FOURCi" loading="lazy">
      <p>Trees are nature’s lifeline — they clean our air, cool our planet, and fight climate change. Join the movement. Plant a tree today for a greener tomorrow.</p>
      <div class="social"><a href="${FB}" target="_blank" rel="noopener" aria-label="Facebook">${icon('fb')}</a><a href="${TW}" target="_blank" rel="noopener" aria-label="X (Twitter)">${icon('tw')}</a></div></div>
    <div><h4>Explore</h4><ul><li><a href="${r}index.html">Home</a></li><li><a href="${r}about/index.html">About FOURCi</a></li><li><a href="${r}services/index.html">Services</a></li><li><a href="${r}resources/index.html">Resources &amp; projects</a></li><li><a href="${r}gallery/index.html">Gallery</a></li><li><a href="${r}blog/index.html">Blog</a></li><li><a href="${r}contact/index.html">Contact</a></li></ul></div>
    <div><h4>Get involved</h4><ul><li><a href="${r}contact/index.html?subject=Volunteer">Volunteer</a></li><li><a href="${r}contact/index.html?subject=Partnership">Partner with us</a></li><li><a href="${VENDOR_FORM}" target="_blank" rel="noopener">Vendor registration</a></li><li><a href="${r}${PROFILE}">Download our profile</a></li></ul></div>
    <div class="contact"><h4>Contact</h4><ul>
      <li>${icon('pin')}<span><strong>Head office:</strong> No. 10 Flat B, Behind Federal High Court Polo, Maiduguri, Borno State, Nigeria.</span></li>
      <li>${icon('pin')}<span><strong>Sub-office:</strong> No 7, Gambia Crescent, Bekaji Housing Estate, Jimeta, Yola, Adamawa State.</span></li>
      <li>${icon('pin')}<span>CRADI complex, 42 JCMI lane, off Lamingo Road, Katon Rikkos, Jos 930105, Plateau State.</span></li>
      <li>${icon('phone')}<a href="${PHONE_HREF}">${PHONE}</a></li><li>${icon('mail')}<a href="mailto:${EMAIL}">${EMAIL}</a></li></ul></div>
  </div>
  <div class="container footer__bottom"><span>Copyright © <span data-year>2026</span> FOURCi. All rights reserved.</span><span>Concern on Climate Change for the Community Initiative</span></div>
</footer>
<button class="to-top" type="button" aria-label="Back to top">${icon('up')}</button>
<script src="${r}assets/site.js" defer></script>
</body>
</html>`;
}

/* ---------------------------------------------------------- shared blocks */
const R = (i = 0) => `class="reveal" style="--d:${(i * 0.08).toFixed(2)}s"`;
function pageHero({ title, lead, crumbs, imgStem, imgAlt, kicker }) {
  const trail = crumbs.map((c, i) => i === crumbs.length - 1 ? `<li aria-current="page">${c[0]}</li>` : `<li><a href="${ROOT}${c[1]}">${c[0]}</a></li>`).join('');
  return `<section class="page-hero"><div class="page-hero__media">${img(imgStem, imgAlt, { eager: true, fetchp: true, max: 1536, src: 1536, sizes: '100vw' }).replace(/alt="[^"]*"/, 'alt=""')}</div>
  <div class="container page-hero__inner"><nav class="crumbs" aria-label="Breadcrumb"><ol>${trail}</ol></nav>${kicker ? `<span class="kicker">${kicker}</span>` : ''}<h1>${title}</h1>${lead ? `<p>${lead}</p>` : ''}</div></section>`;
}
const cta = ({ title = 'Join forces with us to save our planet.', text = 'Whether you’re looking to volunteer, partner, or just learn more, we’re here for you.', stem = P.groupPlant } = {}) => `
<div class="cta-wrap"><div class="container"><section class="cta ${'reveal'}" aria-labelledby="cta-h">
  <div class="cta__bg">${img(stem, '', { max: 1536, src: 1536, sizes: '1200px' }).replace(/alt="[^"]*"/, 'alt=""')}</div>
  <span class="kicker" style="color:var(--sun)">Get involved</span><h2 id="cta-h">${title}</h2><p>${text}</p>
  <div class="row"><a class="btn btn--sun" href="${ROOT}contact/index.html?subject=Volunteer">Become a volunteer ${icon('arrow', 'icon-arrow')}</a><a class="btn btn--ghost" href="${ROOT}contact/index.html?subject=Partnership">Partner with us</a><a class="btn btn--ghost" href="${PHONE_HREF}">${icon('phone')} ${PHONE}</a></div>
</section></div></div>`;
const statsBlock = (rows, light = false) => `<div class="stats${light ? ' stats--light' : ''}">${rows.map((s, i) => `<div class="stat reveal" style="--d:${i * .1}s"><b data-count="${s[0]}">0</b><span>${s[1]}</span></div>`).join('')}</div>`;
const partnerLogo = p => ['svg', 'png', 'webp'].map(e => `assets/partners/${p.slug}.${e}`).find(f => fs.existsSync(path.join(OUT, f)));
const partnerCard = p => { const f = partnerLogo(p); return `<li class="plogo">${f ? `<img src="${ROOT}${f}" alt="${p.name}" loading="lazy" decoding="async">` : `<span class="pname"><b>${p.name}</b><small>${p.note}</small></span>`}</li>`; };
const marqueeRow = (items, dir) => { const group = [...items, ...items].map(partnerCard).join(''); return `<div class="marquee marquee--${dir}"><div class="marquee__track"><ul class="marquee__group">${group}</ul><ul class="marquee__group" aria-hidden="true">${group}</ul></div></div>`; };
const partnersBlock = () => `<div class="marquees" role="group" aria-label="Partners and funders">${marqueeRow(PARTNERS, 'left')}${marqueeRow([...PARTNERS.slice(3), ...PARTNERS.slice(0, 3)], 'right')}</div>
<p class="note">Organisations featured in FOURCi programme materials. We also work with government agencies, civil society organisations, traditional institutions and local communities.</p>`;
const projectCard = (p, i) => `<article class="project reveal" style="--d:${i * .08}s"><div class="project__img">${img(p.img, p.alt, { sizes: '(min-width:900px) 380px, 100vw', src: 768 })}<span class="tag">${p.tag}</span></div><div class="project__body"><h3>${p.t}</h3><a class="link-arrow" href="${ROOT}contact/index.html?subject=Projects&amp;about=${encodeURIComponent(p.t)}">Ask about this project ${icon('arrow')}</a></div></article>`;
const postCard = (p, i = 0) => {
  const href = `${ROOT}${p.slug}/index.html`;
  const media = p.img ? img(p.img, '', { sizes: '(min-width:700px) 360px, 100vw', src: 768, max: 768 }).replace(/alt="[^"]*"/, 'alt=""') : `<div class="post-art">${icon('leaf')}</div>`;
  return `<article class="post-card reveal" style="--d:${i * .1}s"><a class="post-card__img" href="${href}" tabindex="-1" aria-hidden="true">${media}</a><div class="post-card__body"><div class="meta"><span>${icon('cal')} </span><time datetime="${p.date}">${fmtDate(p.date)}</time>${p.cats.map(c => `<a class="pill" href="${ROOT}category/${c}/index.html">${CATS[c]}</a>`).join('')}</div><h3><a href="${href}">${p.title}</a></h3><p>${p.excerpt}</p><a class="link-arrow" href="${href}">Read the story ${icon('arrow')}</a></div></article>`;
};
const heading = (kicker, h, p, center = false) => `<div class="section-head ${center ? 'center ' : ''}reveal"><span class="kicker">${kicker}</span><h2>${h}</h2>${p ? `<p>${p}</p>` : ''}</div>`;

/* ------------------------------------------------------------------- pages */
const pages = [];
const add = (urlPath, html) => pages.push([urlPath, html]);

// ---- HOME
{
  const body = () => `
<section class="hero" aria-labelledby="hero-h">
  <div class="hero__media">${img(P.seedlings, '', { eager: true, fetchp: true, max: 2048, src: 1536, sizes: '100vw' }).replace(/alt="[^"]*"/, 'alt=""')}</div>
  <div class="container hero__inner">
    <span class="kicker">Let’s save our planet</span>
    <h1 id="hero-h">Think Climate.<br><em>Think FOURCi.</em></h1>
    <p class="lead">Trees are nature’s lifeline — they clean our air, cool our planet, and fight climate change. Join the movement: plant a tree today for a greener tomorrow.</p>
    <div class="hero__cta"><a class="btn btn--sun" href="${ROOT}resources/index.html">Explore our work ${icon('arrow', 'icon-arrow')}</a><a class="btn btn--ghost" href="${ROOT}contact/index.html?subject=Volunteer">Get involved</a><a class="btn btn--ghost" href="${ROOT}${PROFILE}" download>${icon('down')} Download profile</a></div>
    <div class="hero__meta"><span>${icon('pin')} Maiduguri · Yola · Jos</span><span>${icon('users')} Led by communities, women and youth</span><span>${icon('phone')} <a href="${PHONE_HREF}" style="color:inherit">${PHONE}</a></span></div>
  </div><div class="hero__scroll" aria-hidden="true">Scroll</div>
</section>

<section class="section" id="who" aria-labelledby="about-h"><div class="container split">
  <div class="collage reveal">
    <div class="main">${img(P.planting, 'FOURCi volunteers and students planting a tree together at a school', { sizes: '(min-width:900px) 560px, 100vw', src: 1024 })}</div>
    <div class="inset">${img(P.kits, 'School climate club kits: bins, watering cans and wheelbarrows', { sizes: '260px', src: 768 })}</div>
    <div class="badge"><b>One vision</b><span>Academics, environmentalists, health &amp; agriculture experts and volunteers, united.</span></div>
  </div>
  <div>
    <div class="reveal"><span class="kicker">Who we are</span><h2 id="about-h">Concern on Climate Change for the Community Initiative</h2></div>
    <p class="reveal">FOURCi is a leading non-profit organisation committed to safeguarding the environment and empowering communities to adapt, respond, and thrive in the face of climate change. We are a coalition of Academics, Environmentalists, Agricultural Experts, Health Professionals, Building and Construction Specialists, and passionate community volunteers, united in one vision: to protect our planet and secure a sustainable future for all.</p>
    <p class="reveal">We believe climate action begins within communities. Through research-driven initiatives, community-based programmes and strategic partnerships, we strengthen resilience, promote sustainable livelihoods and restore ecosystems — especially for women, youth, farmers and rural dwellers.</p>
    <div class="mv reveal"><div class="mv-card"><h3>${icon('target')} Our mission</h3><p>To empower individuals, communities and institutions to combat climate change and disasters through sustainable practices, with a focus on involving women, young girls and children.</p></div><div class="mv-card"><h3>${icon('eye')} Our vision</h3><p>A world free from climate change through sustainable practices.</p></div></div>
    <p class="reveal" style="margin-top:1.8rem"><a class="btn btn--outline" href="${ROOT}about/index.html">More about FOURCi ${icon('arrow', 'icon-arrow')}</a></p>
  </div>
</div></section>

<section class="section section--sand" aria-labelledby="values-h"><div class="container">
  ${heading('Core values', 'How we work, every time', 'Every project, partnership and intervention is designed to create measurable impact for the communities we serve.')}
  <div class="values">
    ${[['users', 'Community-led', 'Climate action begins within communities. We build local ownership and capacity that endures.'], ['flask', 'Evidence-driven', 'Scientific rigour and research guide how we design, deliver and measure our programmes.'], ['heart', 'Inclusive', 'Women, young girls, youth, farmers and rural dwellers are at the centre of our work.'], ['shield', 'Transparent', 'Open, accountable reporting so partners and communities can trust the results.'], ['handshake', 'Collaborative', 'We work with government, development partners, civil society and traditional institutions.']].map((v, i) => `<div class="value reveal" style="--d:${i * .08}s"><div class="ico">${icon(v[0])}</div><h3>${v[1]}</h3><p>${v[2]}</p></div>`).join('')}
  </div>
</div></section>

<section class="section" id="programmes" aria-labelledby="prog-h"><div class="container">
  <div class="split" style="margin-bottom:2.5rem;align-items:end"><div class="reveal"><span class="kicker">What we do</span><h2 id="prog-h">Our programmes and areas of focus</h2></div><p class="reveal" style="margin:0">From climate-smart agriculture and land restoration to WASH, advocacy, environmental education, disaster preparedness and green innovation, FOURCi drives climate justice and ensures no one is left behind.</p></div>
  <div class="grid grid--4">${PILLARS.map((p, i) => `<a class="pillar reveal" style="--d:${i * .08}s" href="${ROOT}services/index.html#themes"><div class="pillar__media"><div class="pillar__img">${img(p.img, p.alt, { sizes: '(min-width:1100px) 280px, (min-width:640px) 45vw, 100vw', src: 768 })}</div><span class="pillar__ico">${icon(p.ic, '')}</span></div><div class="pillar__body"><h3>${p.t}</h3><p>${p.d}</p><span class="link-arrow">Explore ${icon('arrow')}</span></div></a>`).join('')}</div>
  <p class="reveal" style="text-align:center;margin-top:2.5rem"><a class="btn" href="${ROOT}services/index.html">All thematic areas ${icon('arrow', 'icon-arrow')}</a></p>
</div></section>

<section class="section section--dark impact" id="impact" aria-labelledby="impact-h"><div class="container">
  <div class="impact-story">
    <div class="reveal"><span class="kicker" style="color:var(--sun)">Our impact</span><h2 id="impact-h">Measured in people, places and trees.</h2>
      <p>Behind every number is a community that chose to act. When floods struck Madagali and Michika in 2024, FOURCi’s trained volunteers became first-line responders — surfacing the data that guided relief.</p>
      <blockquote>Over 32,000 hectares of farmland destroyed and more than 5,000 people sheltering in temporary locations — captured by community volunteers through phone calls, WhatsApp and SMS.<cite>From “Standing Strong in Crisis”, September 2024 flood needs assessment</cite></blockquote>
      <p style="margin-top:1.5rem"><a class="btn btn--sun" href="${ROOT}${POSTS[0].slug}/index.html">Read the story ${icon('arrow', 'icon-arrow')}</a></p></div>
    <figure class="reveal">${img(P.flood, 'Collapsed homes after the 2024 floods in Michika and Madagali, Adamawa State', { sizes: '(min-width:900px) 540px, 100vw', src: 768, max: 768 })}</figure>
  </div>
  ${statsBlock(STATS)}
</div></section>

<section class="section" id="projects" aria-labelledby="proj-h"><div class="container">
  <div class="split" style="margin-bottom:2.5rem;align-items:end"><div class="reveal"><span class="kicker">Featured projects &amp; activities</span><h2 id="proj-h">Work happening on the ground</h2></div><p class="reveal" style="margin:0;text-align:right"><a class="link-arrow" href="${ROOT}resources/index.html">See all projects ${icon('arrow')}</a></p></div>
  <div class="grid grid--3">${[PROJECTS[0], PROJECTS[3], PROJECTS[2]].map(projectCard).join('')}</div>
</div></section>

<section class="section section--sand" id="news" aria-labelledby="news-h"><div class="container">
  <div class="split" style="margin-bottom:2.5rem;align-items:end"><div class="reveal"><span class="kicker">News &amp; updates</span><h2 id="news-h">Stories from the field</h2></div><p class="reveal" style="margin:0;text-align:right"><a class="link-arrow" href="${ROOT}blog/index.html">All stories ${icon('arrow')}</a></p></div>
  <div class="grid grid--2">${POSTS.map(postCard).join('')}</div>
</div></section>

<section class="section" id="faq" aria-labelledby="faq-h"><div class="container">
  ${heading('Frequently asked questions', 'Good to know before we work together', '', true)}
  <div class="faq reveal">${FAQS.map(f => `<details><summary>${f[0]}<span class="plus" aria-hidden="true">${icon('plus')}</span></summary><div class="answer">${f[1]}</div></details>`).join('')}</div>
</div></section>

<section class="section section--mint" id="partners" aria-labelledby="partners-h"><div class="container">
  ${heading('Partners &amp; collaborators', 'Strength in partnership', 'We collaborate with development partners, government agencies and communities to design solutions that last.', true)}
  ${partnersBlock()}
</div></section>
${cta()}`;
  add('index.html', layout({ page: 'home', depth: 0, path: '', title: 'FOURCi – Concern on Climate Change for the Community Initiative | Nigeria', desc: 'FOURCi is a non-profit coalition empowering communities across north-east Nigeria to adapt to climate change through afforestation, WASH, climate-smart agriculture and education.', body }));
}

// ---- ABOUT
{
  const body = () => `${pageHero({ title: 'About FOURCi', lead: 'A coalition of experts and community volunteers protecting the environment and building resilience in the face of climate change.', crumbs: [['Home', 'index.html'], ['About']], imgStem: P.groupPlant, imgAlt: '', kicker: 'Who we are' })}
<section class="section" id="who" aria-labelledby="who-h"><div class="container split split--wide-left">
  <div><div class="reveal"><span class="kicker">Our story</span><h2 id="who-h">Climate action begins within communities</h2></div>
    <p class="reveal">Concern on Climate Change for the Community Initiative (FOURCi) is a leading non-profit organisation committed to safeguarding the environment and empowering communities to adapt, respond, and thrive in the face of climate change.</p>
    <p class="reveal">Established as a coalition of Academics, Environmentalists, Agricultural Experts, Health Professionals, Building and Construction Specialists, and passionate community volunteers, FOURCi brings together a diverse range of expertise under one united vision — to protect our planet and secure a sustainable future for all.</p>
    <p class="reveal">Through research-driven initiatives, community-based programmes, and strategic partnerships, we address the environmental challenges affecting vulnerable populations, especially women, youth, farmers, and rural dwellers. We collaborate with government agencies, development partners, civil society organisations, traditional institutions, and local communities to design and implement solutions that make a lasting impact.</p></div>
  <div class="reveal" style="border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow)">${img(P.women, 'Women leaders at a FOURCi community forum on women in governance', { sizes: '(min-width:900px) 520px, 100vw', src: 1024 })}</div>
</div></section>

<section class="section section--sand" id="mission" aria-labelledby="mission-h"><div class="container">
  ${heading('Mission &amp; vision', 'What guides everything we do', '', true)}
  <div class="mv mv--lg reveal"><div class="mv-card"><h3>${icon('target')} Mission</h3><p>To empower individuals, communities, and institutions to combat climate change and disasters by promoting sustainable practices and interventions at local, national, and international levels, with a focus on uplifting and involving women, young girls, and children in these efforts.</p></div><div class="mv-card"><h3>${icon('eye')} Vision</h3><p>Aiming for a world free from climate change through sustainable practices.</p></div></div>
</div></section>

<section class="section" id="commitment" aria-labelledby="commit-h"><div class="container split">
  <div class="reveal" style="border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow)">${img(P.kits, 'School climate club kits prepared by FOURCi', { sizes: '(min-width:900px) 520px, 100vw', src: 1024 })}</div>
  <div><div class="reveal"><span class="kicker">Our commitment</span><h2 id="commit-h">More than guiding principles</h2></div>
    <p class="reveal">At FOURCi, our vision and mission are more than just guiding principles — they are the foundation of our commitment to action. Every project, partnership, and intervention is designed to create a measurable impact that aligns with our goals of addressing climate change, fostering resilience, and empowering communities.</p>
    <p class="reveal">We are dedicated to addressing the growing challenges of climate change and its impact on vulnerable communities. Our work revolves around delivering targeted solutions, promoting awareness, and building resilience through sustainable practices and community-driven initiatives.</p></div>
</div></section>

<section class="section section--mint" id="coalition" aria-labelledby="coal-h"><div class="container">
  ${heading('Our coalition', 'Many disciplines, one united vision', 'FOURCi brings together the expertise needed to tackle climate change from every angle.', true)}
  <div class="values">${[['book', 'Academics'], ['leaf', 'Environmentalists'], ['sprout', 'Agricultural experts'], ['pulse', 'Health professionals'], ['globe', 'Building & construction specialists'], ['users', 'Community volunteers']].map((v, i) => `<div class="value reveal" style="--d:${i * .07}s"><div class="ico">${icon(v[0])}</div><h3>${v[1]}</h3></div>`).join('')}</div>
</div></section>

<section class="section" id="what-we-do" aria-labelledby="wwd-h"><div class="container">
  ${heading('What we do', 'Eight areas of work', 'Integrated programmes that connect climate resilience with human development.')}
  <div class="grid grid--4">${WHAT_WE_DO.map((w, i) => `<div class="theme reveal" style="--d:${(i % 4) * .08}s"><span class="num">0${i + 1}</span><div class="ico">${icon(WWD_ICONS[i])}</div><h3>${w}</h3></div>`).join('')}</div>
</div></section>

<section class="section section--dark impact" aria-labelledby="ab-impact"><div class="container">
  <div class="section-head reveal"><span class="kicker" style="color:var(--sun)">By the numbers</span><h2 id="ab-impact">Our reach so far</h2></div>
  ${statsBlock(STATS)}
</div></section>
${cta({ stem: P.seedlings })}`;
  add('about/index.html', layout({ page: 'about', depth: 1, path: 'about/', title: 'About FOURCi – Mission, Vision & Coalition', desc: 'Learn about FOURCi: a coalition of academics, environmentalists, agricultural and health experts and volunteers building climate resilience in Nigeria. Our mission, vision and commitment.', body }));
}

// ---- SERVICES
{
  const body = () => `${pageHero({ title: 'Thematic areas', lead: 'FOURCi works across key thematic areas that strengthen climate resilience, protect ecosystems, and empower communities with sustainable solutions.', crumbs: [['Home', 'index.html'], ['Services']], imgStem: P.planting, imgAlt: '', kicker: 'What we offer' })}
<section class="section" id="themes" aria-labelledby="th-h"><div class="container">
  <div class="split" style="margin-bottom:2.5rem;align-items:end"><div class="reveal"><span class="kicker">Our focus</span><h2 id="th-h">Eight themes that drive lasting climate action</h2></div><p class="reveal" style="margin:0">Our focus spans climate-smart agriculture, land restoration, WASH, renewable energy, waste management, and disaster risk reduction. We also prioritise environmental education, advocacy, and inclusive empowerment of women and youth.</p></div>
  <div class="grid grid--4">${THEMES.map((t, i) => `<article class="theme reveal" style="--d:${(i % 4) * .08}s"><span class="num">0${i + 1}</span><div class="ico">${icon(t[1])}</div><h3>${t[0]}</h3><p>${t[2]}</p></article>`).join('')}</div>
</div></section>

<section class="section section--dark impact" aria-labelledby="sv-impact"><div class="container">
  <div class="section-head reveal"><span class="kicker" style="color:var(--sun)">Programme reach</span><h2 id="sv-impact">Results that communities can feel</h2></div>
  ${statsBlock(SERVICE_STATS)}
</div></section>

<section class="section section--sand" id="voices" aria-labelledby="voices-h"><div class="container">
  ${heading('What communities say', 'In their own words', 'Real experiences from the farmers, women leaders, youth and community leaders we work with.', true)}
  <div class="quote-grid">${TESTIMONIALS.map((q, i) => `<figure class="quote reveal" style="--d:${(i % 2) * .1}s;margin:0">${icon('quote', 'qi fill')}<p>“${q[0]}”</p><footer><span class="av" aria-hidden="true">${q[1][0]}</span><span><b>${q[1]}</b><span>${q[2]}</span></span></footer></figure>`).join('')}</div>
</div></section>
${cta({ title: 'Let’s bring nature into your communities.', text: 'We rehabilitate degraded environments through tree planting, soil restoration, and community green zones that improve biodiversity and ecosystem health — and empower community members, especially women and youth, with sustainable agricultural skills that increase productivity while protecting the environment.', stem: P.handshake })}`;
  add('services/index.html', layout({ page: 'services', depth: 1, path: 'services/', title: 'Services & Thematic Areas – FOURCi', desc: 'FOURCi’s eight thematic areas: climate adaptation, climate-smart agriculture, renewable energy, gender, ecosystem restoration, WASH, disaster risk reduction and climate-linked disease.', body }));
}

// ---- RESOURCES
{
  const body = () => `${pageHero({ title: 'Resources & projects', lead: 'Programmes, events and initiatives that bring FOURCi’s mission to life across north-east Nigeria.', crumbs: [['Home', 'index.html'], ['Resources']], imgStem: P.walk, imgAlt: '', kicker: 'Our work' })}
<section class="section" id="projects" aria-labelledby="rp-h"><div class="container">
  ${heading('Projects &amp; activities', 'Seven initiatives, one mission', 'Ask us about any project and our team will share details, reports and ways to take part.')}
  <div class="grid grid--3">${PROJECTS.map(projectCard).join('')}</div>
</div></section>
<section class="section section--sand"><div class="container">
  <div class="download reveal"><div><h3>FOURCi organisation profile</h3><p>Our full profile with programmes, approach and track record (PDF, about 32 MB).</p></div><a class="btn btn--sun" href="${ROOT}${PROFILE}" download>${icon('down')} Download profile</a></div>
  <div class="split" style="margin-top:3rem;align-items:center"><div class="reveal"><span class="kicker">Procurement</span><h2>Become a FOURCi-qualified vendor</h2><p>We’re inviting suppliers and service providers to register and pre-qualify for upcoming opportunities, from agricultural kits and tree seedlings to printing, media and catering services.</p><a class="btn" href="${ROOT}${POSTS[1].slug}/index.html">How to register ${icon('arrow', 'icon-arrow')}</a></div><div class="reveal" style="border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow)">${img(P.vests, 'FOURCi volunteers in green vests planting a tree', { sizes: '(min-width:900px) 520px, 100vw', src: 1024 })}</div></div>
</div></section>
${cta({ title: 'Have a project in mind?', text: 'We welcome partnerships with institutions, donors and communities that share our commitment to climate resilience.', stem: P.kids })}`;
  add('resources/index.html', layout({ page: 'resources', depth: 1, path: 'resources/', title: 'Resources & Projects – FOURCi', desc: 'Explore FOURCi projects and resources: whole-school sustainability, women in peacebuilding, World Environment Day 2025, resilience programmes in Adamawa State and more.', body }));
}

// ---- GALLERY
{
  const body = () => `${pageHero({ title: 'Gallery', lead: 'Moments from our work with schools, women, youth and communities across Borno, Adamawa and beyond.', crumbs: [['Home', 'index.html'], ['Resources', 'resources/index.html'], ['Gallery']], imgStem: P.seedlings, imgAlt: '', kicker: 'In pictures' })}
<section class="section"><div class="container">
  <div class="filters" role="group" aria-label="Filter photos">${[['all', 'All'], ['environment', 'Environment'], ['education', 'Education'], ['women', 'Women'], ['resilience', 'Resilience'], ['advocacy', 'Advocacy']].map((c, i) => `<button class="chip" type="button" data-filter="${c[0]}" aria-pressed="${i === 0}">${c[1]}</button>`).join('')}</div>
  <div class="gallery">${GALLERY.map(g => { const full = pick(photo(g[0]), 1536); return `<button class="shot" type="button" data-cat="${g[2]}" data-full="${ROOT}${full.rel}" data-caption="${g[3]}">${img(g[0], g[3], { sizes: '(min-width:1000px) 380px, (min-width:600px) 45vw, 100vw', src: 768, max: 1024 })}<figcaption>${g[3]}</figcaption></button>`; }).join('')}</div>
</div></section>
<dialog class="lightbox" id="lightbox" aria-label="Photo viewer"><button class="lb-close" type="button" aria-label="Close">${icon('x')}</button><button class="lb-btn lb-prev" type="button" aria-label="Previous photo">${icon('left')}</button><button class="lb-btn lb-next" type="button" aria-label="Next photo">${icon('right')}</button><figure><img src="" alt=""><figcaption></figcaption></figure></dialog>
${cta()}`;
  add('gallery/index.html', layout({ page: 'resources', depth: 1, path: 'gallery/', title: 'Photo Gallery – FOURCi in the field', desc: 'Photos from FOURCi’s work: tree planting in schools, climate education, women’s forums, World Environment Day and flood response in north-east Nigeria.', body }));
}

// ---- BLOG index + categories
function listing(key, title, lead, urlPath, depth) {
  const list = key === 'all' ? POSTS : POSTS.filter(p => p.cats.includes(key));
  const chips = [['all', 'All stories', 'blog/index.html'], ...Object.entries(CATS).map(([k, v]) => [k, v, `category/${k}/index.html`])].map(c => `<a class="chip" style="text-decoration:none" href="${ROOT}${c[2]}" ${c[0] === key ? 'aria-current="page"' : ''}>${c[1]}</a>`).join('');
  const crumbs = key === 'all' ? [['Home', 'index.html'], ['Blog']] : [['Home', 'index.html'], ['Blog', 'blog/index.html'], [title]];
  return `${pageHero({ title, lead, crumbs, imgStem: P.class, imgAlt: '', kicker: 'News & updates' })}
<section class="section"><div class="container"><div class="filters" role="navigation" aria-label="Story categories">${chips}</div>
<div class="post-list" style="max-width:960px">${list.map(postCard).join('') || '<p>No stories yet.</p>'}</div></div></section>${cta()}`;
}
{
  ROOT = '../';
  add('blog/index.html', layout({ page: 'blog', depth: 1, path: 'blog/', title: 'Blog – News & Stories | FOURCi', desc: 'News, field stories and opportunities from FOURCi: climate action, humanitarian response and community resilience in Nigeria.', body: () => listing('all', 'Blog', 'News, field stories and opportunities from the FOURCi community.') }));
  for (const k of Object.keys(CATS)) {
    add(`category/${k}/index.html`, layout({ page: 'blog', depth: 2, path: `category/${k}/`, title: `${CATS[k]} – FOURCi Blog`, desc: `FOURCi stories filed under ${CATS[k]}.`, body: () => listing(k, CATS[k], `Stories filed under ${CATS[k]}.`) }));
  }
}

// ---- POSTS
{
  const side = (cur) => `<aside class="aside"><div class="box"><h4>More stories</h4><ul>${POSTS.filter(p => p !== cur).map(p => `<li><a href="${ROOT}${p.slug}/index.html">${p.title}</a></li>`).join('')}</ul></div><div class="box"><h4>Categories</h4><ul>${Object.entries(CATS).map(([k, v]) => `<li><a href="${ROOT}category/${k}/index.html">${v}</a></li>`).join('')}</ul></div><div class="box"><h4>Questions?</h4><p style="font-size:.95rem">Write to <a href="mailto:${EMAIL}">${EMAIL}</a> or use our <a href="${ROOT}contact/index.html">contact form</a>.</p></div></aside>`;
  const meta = p => `<div class="meta" style="color:#cfe3d6"><time datetime="${p.date}">${fmtDate(p.date)}</time><span>By ${p.author}</span>${p.cats.map(c => `<a class="pill" href="${ROOT}category/${c}/index.html">${CATS[c]}</a>`).join('')}</div>`;
  const ld = p => ({ '@context': 'https://schema.org', '@type': 'Article', headline: p.title, datePublished: p.date, author: { '@type': 'Person', name: p.author }, publisher: { '@type': 'Organization', name: 'FOURCi' }, mainEntityOfPage: `${SITE}/${p.slug}/` });
  const nxt = cur => { const o = POSTS.find(p => p !== cur); return `<div class="post-nav"><a class="link-arrow" href="${ROOT}blog/index.html">${icon('left')} All stories</a><a class="link-arrow" href="${ROOT}${o.slug}/index.html">${o.title.length > 48 ? o.title.slice(0, 46) + '…' : o.title} ${icon('arrow')}</a></div>`; };
  const hero = (p, stem) => `<section class="page-hero"><div class="page-hero__media">${img(stem, '', { eager: true, fetchp: true, max: 1536, src: 1536 }).replace(/alt="[^"]*"/, 'alt=""')}</div><div class="container page-hero__inner"><nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="${ROOT}index.html">Home</a></li><li><a href="${ROOT}blog/index.html">Blog</a></li><li aria-current="page">${p.cats.map(c => CATS[c]).join(', ')}</li></ol></nav><h1 style="font-size:clamp(2rem,4.4vw,3.2rem)">${p.title}</h1>${meta(p)}</div></section>`;

  // flood story
  {
    const p = POSTS[0]; ROOT = '../../';
    const body = () => `${hero(p, P.flood)}
<section class="section"><div class="container article"><article class="prose">
<p>When disaster struck Madagali and Michika LGAs in Adamawa State in September 2024, the devastation was overwhelming. Homes, farmlands, and vital infrastructure were washed away by floods, leaving thousands displaced and struggling to access food, clean water, and shelter. In this moment of uncertainty, Concern on Climate Change for the Community Initiative (FOURCi) mobilised quickly to conduct a rapid needs assessment. But behind the data and findings lies an untold story; one of resilience, sacrifice, and the unwavering commitment of community volunteers.</p>
<figure>${img(P.flood, p.imgAlt, { sizes: '(min-width:1000px) 700px, 100vw', src: 768, max: 768 })}<figcaption>Collapsed homes in Michika and Madagali after the September 2024 floods.</figcaption></figure>
<p>In the difficulty of this time, when physical access was restricted and communities were cut off, our volunteers became the first line responders. They worked with us through the simplest yet most powerful tools at their disposal (phone calls, WhatsApp messages, and SMS). These channels became lifelines, connecting our teams to real-time voices and experiences from the ground. Volunteers gathered critical information from families, leaders, and internally displaced persons, often while managing the same hardships themselves. Their responsiveness, despite the tight complexities, was nothing short of heroic.</p>
<p>The information they provided enabled us to paint a clear picture of the crisis: over 32,000 hectares of farmland destroyed, more than 5,000 people sheltering in temporary locations, and widespread contamination of water sources that heightened the risk of cholera outbreaks. Their input also revealed urgent priorities (access to healthcare, household non-food items, and agricultural support). Without their commitment, this assessment would not have been possible, and the delivery of relief would have been delayed.</p>
<div class="pull">“Since the flood, my health has deteriorated because of the poor living conditions and lack of medical care. … I have chronic illnesses and need regular medication, which I can no longer afford or access.”<cite>— Elderly woman from Anguwan Sarki, Madagali L.G.A.</cite></div>
<div class="crisis" role="group" aria-labelledby="crisis-h"><span class="alert-title">Alert</span><strong id="crisis-h" style="font-family:var(--font-display);font-size:1.15rem;color:var(--ink)">Estimated impact of flooding on livelihoods and displacement</strong>
<div class="grid grid--4" style="margin-top:1.3rem">${[[3350, '# of households in need of immediate food assistance'], [2750, 'Households in need of non-food items (NFIs)'], [835, 'People injured'], [5280, '# of people currently in shelters']].map(n => `<div class="n"><b data-count="${n[0]}">0</b><span>${n[1]}</span></div>`).join('')}</div></div>
<p>These community volunteers were not just data collectors; they were protectors of their neighbours’ dignity, advocates for their communities, and bridges between vulnerability and response. They ensured that every voice was captured and amplified; whether from a widow in Madagali, a farmer in Michika, or a child displaced from their home.</p>
<p>At FOURCi, we recognise that community-led action is not only effective but essential. The courage of these volunteers reminds us that humanitarian response is strongest when built on local ownership. As we move from immediate relief to long-term recovery which will include rehabilitating water systems, promoting climate-smart agriculture, and supporting resilient housing, we carry with us the lesson that sustainable solutions must always start with those closest to the challenge.</p>
<p><em>This article is dedicated to the community volunteers who stood with us in crisis. In their persistence, we find hope. In their voices, we hear the path forward.</em></p>
${nxt(p)}</article>${side(p)}</div></section>`;
    add(p.slug + '/index.html', layout({ page: 'blog', depth: 2, path: p.slug + '/', title: `${p.title} | FOURCi`, desc: 'How community volunteers led FOURCi’s rapid flood needs assessment in Madagali and Michika, Adamawa State, September 2024: over 32,000 hectares of farmland destroyed and 5,000+ people sheltering.', body, ogImage: fileUrl(P.flood, 768), jsonld: ld(p) }));
  }
  // vendor post (depth 3: blog/slug/)
  {
    const p = POSTS[1]; ROOT = '../../';
    const body = () => `${hero(p, P.groupPlant)}
<section class="section"><div class="container article"><article class="prose">
<p>Are you ready to partner with FOURCi and contribute to meaningful change? We’re inviting suppliers and service providers to register and pre-qualify with us for upcoming opportunities in:</p>
<ul><li>Resilient agricultural kits</li><li>Poultry chicks &amp; feeds</li><li>Fertilizers &amp; agro-chemicals</li><li>Tree seedlings</li><li>Printing &amp; IEC material production</li><li>Media services (radio, video, photography)</li><li>Catering services &amp; food demonstration supplies</li></ul>
<p>By completing our Vendor Registration &amp; Pre-Qualification Form, you’ll join a vetted pool of vendors eligible for future procurement invitations and projects.</p>
<h2>Why become a FOURCi-qualified vendor?</h2>
<ul><li>Be considered for contracts in high-impact climate resilience programmes</li><li>Gain visibility and credibility with FOURCi’s procurement team</li><li>Secure access to timely opportunities aligned with your expertise</li><li>Demonstrate your compliance, capacity and track record to stand out</li></ul>
<h2>What we’re looking for</h2><p>We welcome vendors who can demonstrate:</p>
<ul><li>Legal standing (CAC registration, TIN, relevant licences)</li><li>Minimum number of years of experience in their category</li><li>Technical capability and sufficient staffing or equipment</li><li>Proven past performance with references or work orders</li><li>Financial capacity to supply and deliver quality goods/services on time</li></ul>
<h2>How to get started</h2>
<ol><li>Click the link below to access the form.</li><li>Provide your business details, category of interest, and upload required documents.</li><li>Submit your registration and wait for our evaluation.</li><li>If pre-qualified, you’ll receive a vendor code and be eligible for FOURCi procurement events.</li></ol>
<div class="callout"><h3>Complete the Vendor Registration &amp; Pre-Qualification Form</h3><p>The form opens in Google Forms in a new tab.</p><a class="btn btn--sun" href="${VENDOR_FORM}" target="_blank" rel="noopener">Open the registration form ${icon('arrow', 'icon-arrow')}</a></div>
<p>Questions about the process? Email <a href="mailto:${EMAIL}?subject=Vendor%20registration">${EMAIL}</a>.</p>
${nxt(p)}</article>${side(p)}</div></section>`;
    add(p.slug + '/index.html', layout({ page: 'blog', depth: 2, path: p.slug + '/', title: `${p.title} | FOURCi`, desc: 'Register and pre-qualify as a FOURCi vendor for agricultural kits, seedlings, printing, media and catering opportunities.', body, jsonld: ld(p) }));
  }
}

// ---- CONTACT
{
  const body = () => `${pageHero({ title: 'Getting in touch is easy', lead: 'Whether you’re looking to volunteer, partner, or just learn more, we’re here for you.', crumbs: [['Home', 'index.html'], ['Contact']], imgStem: P.listen, imgAlt: '', kicker: 'We are available' })}
<section class="section"><div class="container contact-grid">
  <div>
    <div class="info-card reveal"><div class="ico">${icon('pin')}</div><div><h3>Head office</h3><p>No. 10 Flat B, Behind Federal High Court Polo, Maiduguri, Borno State, Nigeria.</p></div></div>
    <div class="info-card reveal"><div class="ico">${icon('mail')}</div><div><h3>Mail us</h3><p><a href="mailto:${EMAIL}">${EMAIL}</a></p></div></div>
    <div class="info-card reveal"><div class="ico">${icon('phone')}</div><div><h3>Call us</h3><p><a href="${PHONE_HREF}">${PHONE}</a></p></div></div>
    <div class="info-card reveal"><div class="ico">${icon('globe')}</div><div><h3>Follow us</h3><p><a href="${FB}" target="_blank" rel="noopener">Facebook</a> · <a href="${TW}" target="_blank" rel="noopener">X (Twitter)</a></p></div></div>
  </div>
  <div class="form-card reveal"><h2>Send us a message</h2><p>Tell us how you’d like to get involved. Submitting opens your email app with your message ready to send to our team.</p>
    <form class="form" id="contact-form" data-to="${EMAIL}" novalidate>
      <div class="field"><label for="name">Full name <i aria-hidden="true">*</i></label><input id="name" name="name" autocomplete="name" required><span class="err">Please enter your name.</span></div>
      <div class="field"><label for="email">Email <i aria-hidden="true">*</i></label><input id="email" name="email" type="email" autocomplete="email" required><span class="err">Please enter a valid email address.</span></div>
      <div class="field"><label for="phone">Phone (optional)</label><input id="phone" name="phone" type="tel" autocomplete="tel"></div>
      <div class="field"><label for="subject">I’m writing about <i aria-hidden="true">*</i></label><select id="subject" name="subject" required><option>General enquiry</option><option>Volunteer</option><option>Partnership</option><option>Projects</option><option>Vendor registration</option><option>Media</option></select><span class="err">Please choose a topic.</span></div>
      <div class="field full"><label for="message">Message <i aria-hidden="true">*</i></label><textarea id="message" name="message" required></textarea><span class="err">Please write a short message.</span></div>
      <div class="hp" aria-hidden="true"><label>Leave blank<input tabindex="-1" autocomplete="off" name="website"></label></div>
      <div class="actions"><button class="btn" type="submit">Send message ${icon('arrow', 'icon-arrow')}</button><span class="hint">We reply as soon as we can. Prefer to talk? Call <a href="${PHONE_HREF}">${PHONE}</a>.</span></div>
      <div class="form-status" id="form-status" role="status" aria-live="polite"></div>
    </form></div>
</div></section>
<section class="section section--sand"><div class="container">${heading('Our offices', 'Find us across north-east and central Nigeria', '', true)}
  <div class="offices"><div class="office reveal"><span class="label">Head office</span><h3>Maiduguri</h3><p>No. 10 Flat B, Behind Federal High Court Polo, Maiduguri, Borno State, Nigeria.</p></div>
  <div class="office reveal" style="--d:.1s"><span class="label">Sub-office</span><h3>Yola</h3><p>No 7, Gambia Crescent, Bekaji Housing Estate, Jimeta, Yola, Adamawa State, Nigeria.</p></div>
  <div class="office reveal" style="--d:.2s"><span class="label">Office</span><h3>Jos</h3><p>CRADI complex, 42 JCMI lane, off Lamingo Road, Katon Rikkos, Jos 930105, Plateau State.</p></div></div></div></section>`;
  add('contact/index.html', layout({ page: 'contact', depth: 1, path: 'contact/', title: 'Contact FOURCi – Maiduguri, Yola & Jos', desc: 'Contact FOURCi to volunteer, partner or learn more. Offices in Maiduguri, Yola and Jos, Nigeria. Call +234 806 925 2134 or email fourcinigeria@gmail.com.', body }));
}

// ---- 404
{
  ROOT = '';
  const body = () => `<section class="section"><div class="container" style="text-align:center;max-width:640px"><span class="kicker" style="justify-content:center">Error 404</span><h1>This page has wandered off.</h1><p>The page you’re looking for doesn’t exist or has moved. Try one of these instead.</p><p><a class="btn" href="index.html">Back to home</a> <a class="btn btn--outline" href="contact/index.html">Contact us</a></p></div></section>`;
  add('404.html', layout({ page: '', depth: 0, path: '404.html', title: 'Page not found – FOURCi', desc: 'Page not found.', body }));
}

/* ------------------------------------------------------------------- write */
for (const [p, html] of pages) {
  const f = path.join(OUT, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html);
}
const urls = pages.map(p => p[0]).filter(p => p !== '404.html').map(p => SITE + '/' + p.replace(/index\.html$/, ''));
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log('Built', pages.length, 'pages');







