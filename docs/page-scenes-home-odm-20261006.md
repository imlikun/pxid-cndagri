# Homepage ODM variant and chapter backgrounds — 2026-10-06

The first homepage section below the hero retains its original version and switch. Its existing ODM process variant (`#pxidS2`, version a) now follows the supplied reference: a left summary with large red ODM lettering, three existing facts (10 / 23 / 6), and a red pill CTA; a wide product-design card; four middle cards; and five bottom cards. All ten real photographs are preserved. Each card has a consistent red 01–10 badge, title, short description and readable lower gradient. The later homepage ODM section, hero and all subsequent content remain byte-for-byte unchanged.

The previous variant switch hid the original layer only with visibility, which child styles overrode. It now removes that layer from layout while the variant is active. Switching back restores the original section. The frame follows its rendered content height, preventing mobile clipping. The CTA navigates the whole page to the existing ODM process page instead of nesting it inside the preview frame. The original version remains the default; `?odm=a#pxidS2` opens the optimized variant directly for review.

The controller, meter and IoT pages were audited for repeated chapter backgrounds. Controller interfaces and applications both repeated the hero's smoke artwork. Interfaces now use a quiet teal/graphite background supporting the wiring diagram; applications use a blue-hour city scene. This scene reuses the already-published motor mobility asset. Product cutouts, text, diagrams, links and interactions are preserved. Meter and IoT chapter illustrations were already distinct and remain unchanged.

Validation:

- Homepage: 390, 768, 901, 1024, 1440, 1920, 2560 and 3840px; an additional final 3840px check after refining wide-screen row spacing. Ten photos decode, captions fit, data and CTA do not overlap, frame contains all cards, original/ODM switching works, and the real CTA opens the full ODM page. No horizontal overflow or page errors.
- Controller, meter and IoT: each checked at 390, 768, 1024, 1920 and 3840px, including chapter screenshots. Controller driving tabs, meter day/night/alert tabs, IoT anchor scrolling and real scenario-contact navigation work. No horizontal overflow or page errors.
- Release contains only two HTML pages, two narrowly scoped stylesheets and this note. Baseline checksums protect all other pages, existing shared CSS/JS, original process photographs and the reused mobility image.

No new images were generated for this release. The previously generated motor scenes, their saved asset paths, built-in image-generation mode and full prompt set are documented in `motor-section-scenes-20261006.md`.
