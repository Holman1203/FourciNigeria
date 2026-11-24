# FOURCi redesign – how it is organised

- `fourci.org/` – the site. Redesigned pages replace the old mirrored ones at the **same URLs**
  (`/`, `about/`, `services/`, `resources/`, `contact/`, `category/*`, both blog posts). New: `gallery/`, `blog/`, `404.html`, `sitemap.xml`, `robots.txt`.
- `fourci.org/assets/site.css`, `site.js` – design system and behaviour (no dependencies).
- `_build/build.mjs` – generator holding all page content. Edit text/images there, then run `node _build/build.mjs`.
- `_build/check.mjs` – link, asset, anchor, alt-text and heading checker (`node _build/check.mjs`).
- `_build/serve.mjs` – local preview at http://localhost:4173.
- `_original-pages/` – untouched copies of the 10 original mirrored HTML pages.

The old WordPress/Elementor files (`wp-content`, `wp-includes`, `cdn.elementor.com`, `websitedemos.net`, `hts-cache`) were left in place and are no longer referenced by the new pages.
