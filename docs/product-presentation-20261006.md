# Product page presentation review — 2026-10-06

The motor, controller, meter and IoT pages previously stopped growing at a 2000px reading width, even on 3840px screens. Adjacent chapters lacked a visible gap, decorative borders repeated across cards and tables, and the motor hero and stator chapter shared the same complete hub image.

This release adds scoped presentation styles, separates chapters by 24–66 rendered pixels depending on viewport, and scales each established composition proportionately above 2200px. The 4K content width is now 3000px. Full-width section backgrounds remain. The controller chapter rail grows from 54px to 82px before wide-screen scaling; its link labels are 16px. Card/table decoration is reduced while diagram wiring, selected tabs, keyboard focus and technical hotspots remain.

The motor stator chapter uses a new bare copper-winding / laminated steel core asset and a quiet charcoal studio background. The first chapter continues to show the complete hub motor. Existing motor selection buttons and the meter's distinct scene artwork are retained. The narrow-screen controller artwork clears its hero text and the resource link column accommodates its arrow.

## Validation

- Actual browser screenshots reviewed across all four pages and each desktop chapter.
- Layout and interactions checked at 390, 768, 901, 1024, 1440, 1920, 2560 and 3840 pixels.
- No page overflow, broken visible images or JavaScript errors. Chapter anchors clear the fixed header; controller scene tabs, hardware hotspots, meter day/night/alert switching and FAQ expansion work.
- Resource text clipping detected at intermediate widths was fixed and those widths checked again.
- The motor hero image clears the header and metrics. IoT's three scenario buttons preserve their correct consultation parameters.
- Shared header/footer and existing source styles/scripts are unchanged. Footer edges remain flat.

## Generated artwork

Asset: `assets/pxid/motor-stator-20261006.png` (1254 × 1254, RGBA transparency).
Tool: built-in image generation, with the existing complete hub image as a material/lighting reference.

Final prompt: Create a new independent isolated bare annular electric hub motor stator with densely wound copper coils and thin laminated silicon-steel teeth. Remove the complete motor's outer wheel rim, rotating face plate, bearings and screws. Show a physically plausible three-quarter elevated macro view, an open central hole, precise closely packed copper wires and charcoal steel laminations. Use premium photoreal industrial studio lighting with a restrained warm rim highlight. Center the whole ring with margins on a genuinely transparent background. No floor, external shadow, text, logos, numbers, arrows or diagram lines.

The artwork remains a conceptual product rendering; it does not assert a model-specific construction drawing or new performance values.
