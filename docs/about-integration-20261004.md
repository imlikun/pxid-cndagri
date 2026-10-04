# About PXID and manufacturing integration — 2026-10-04

The company and manufacturing pages previously repeated capability information and required visitors to move between two long pages. `cn/company.html` now presents company context, design and engineering, six manufacturing processes, quality and digital coordination, qualifications, milestones, and cooperation paths in one page.

Equipment models, machining travel, material and batch ranges, and seven manufacturing questions remain available in native expandable details. Existing company metrics and four award certificates are retained. ISO9001 is described as a quality management system; CE, UL and EEC relate to target-market product certification. Existing site photos are reused and the assembly process uses the assembly-line photo.

The shared navigation links to About chapters. The separate manufacturing navigation item is removed. Links from the homepage, product pages and editorial pages point to `company.html#manufacturing`. Other page body content is preserved. The ODM workflow remains separate.

## Redirect and deployment

`deployment/pxid-about-redirect.conf` contains the exact HTTPS location rule for a 301 from the old manufacturing URL to the new chapter. Apply it inside the appin.site HTTPS server block and run the Nginx configuration test before reloading. `cn/manufacturing.html` also contains a canonical URL and client-side fallback for static previews.

The appin.site live files and the GitHub `main` branch are synchronized using an explicit file allowlist. The release backs up replaced files and the Nginx configuration. Existing shared scripts, unrelated styles and all image assets are preserved. The unrelated untracked `pxid-prodrich-v2.css` is excluded.

## Validation

- Screens at 360, 390, 768, 901, 1024, 1440, 1920 and 3840 pixels.
- Image decoding, horizontal overflow and text clipping.
- Chapter positioning beneath the header, native details by keyboard and pointer, desktop dropdown and mobile menu closing.
- Flat footer and original award certificate links.
- Navigation on the homepage, four product pages and a nested news detail page.
- Unrelated page main content compared against the live baseline, permitting only manufacturing-link destinations to change.
- Public HTTPS file checksums, old URL 301, and matching server/GitHub commits after publication.

The local verification scripts and screenshots are under `work/about-integration` in the task workspace.
