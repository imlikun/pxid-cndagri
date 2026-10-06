# Motor gear hover preview — 2026-10-06

Scope: only the motor artwork in `cn/motor.html#advantages` (精密结构 强劲内核). The section heading, description, four advantage cards and parameter table remain verbatim. All other sections, pages and the original motor PNG remain unchanged. The only other HTML edits load the two narrowly scoped assets.

The section uses a photo-based 2.5D Canvas rotor. The slanted projection, toothed contour and visible axial surfaces rotate while the casing, screws, bearing, studio reflections and concentric lathe finish stay fixed. Photographic metal textures come from the existing image; no new image or external rendering library is downloaded. Rounded tooth roots, restrained metallic highlights and approximately ten RPM make the motion readable. This is an interaction prototype, not a CAD model or engineering simulation; tooth shape and projection are visual approximations.

Fine-pointer hover smoothly accelerates the wheel. Leaving it decelerates to a stationary frame. Clicking or pressing Enter/Space also controls play/pause; Escape requests a stop. Touch screens show a click/tap cue. Offscreen and hidden-tab motion stop immediately. A reduced-motion preference suppresses hover autoplay; deliberate play remains available. The original image stays visible until the renderer is ready, and remains the fallback if loading or canvas setup fails.

Validation: actual moving and stopped screenshots at 390, 1920 and 3840px. Eight screen widths checked (390, 768, 901, 1024, 1440, 1920, 2560, 3840). Canvas pixel hashes prove that the casing remains fixed while the rotor changes. Hover, touch, native keyboard controls, reduced-motion behavior, deceleration and offscreen stopping are exercised. Four advantage cards, five parameter rows and lack of horizontal overflow are checked. Publication protects the other five pages, existing styles/scripts and original image by checksum.

Observed animation frame rate in local headless browser: 20.7–23.1 FPS. This is a preview measurement, not a cross-device benchmark.
