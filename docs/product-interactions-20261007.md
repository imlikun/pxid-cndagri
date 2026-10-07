# Product interaction previews — 2026-10-07

Add appropriate, user-triggered interactions to three product pages while retaining the existing imagery, composition, hero and other sections.

- Meter information hierarchy: live glass UI stays inside the photographed instrument housing. Play or hover to preview preparation, acceleration, cruise, deceleration and parking; pause and replay controls work on touch and keyboard.
- Meter connection: phone route position, instrument distance and turn prompt share one progress value. The instruction changes at the actual route corner. The device frame and surrounding photograph stay static.
- Controller system diagram: hover, focus or click a component to highlight the relevant energy and signal paths. Flow pulses follow the existing paths as the diagram resizes; the complete diagram can be restored.
- Controller protection: select monitoring, judgment, handling or recovery directly, or play a single four-step protection story. Recovery explains that the fault must clear and the recovery conditions must be satisfied.
- IoT platform: select among five fixed example vehicles on a schematic map. Filter operating, charging, low-battery and offline vehicles; selected state and battery details stay consistent. Offline battery is explicitly marked as the last record.

All interactions are labeled concept demonstrations and use example values. No actual vehicle, fleet, API, remote command or background network connection is added. Playback pauses offscreen and when the document is hidden; reduced motion uses manually selected states. Original meter scene tabs, controller experience tabs/hardware hotspots and IoT project routes are retained.

Validation: actual browser interaction checks at 390, 768, 901, 1024, 1440, 1920, 2560 and 3840px (24 page/width cases); no page errors or horizontal overflow. Visually inspected mobile, 1920 and 3840 captures for screen placement, UI readability and layout. Additional checks cover keyboard activation, mouse hover, pause/replay, offscreen pause, route attachment after resizing, reduced motion, IoT cloud anchors and the actual scenario consultation destination.

Release contains three HTML reference additions, six scoped CSS/JS assets and this note. Existing photographs are unchanged. Checksums protect the referenced instrument/dashboard photographs, previously released scene images and unrelated page/style/script dependencies. Published HTTPS files and real production interactions are checked before syncing GitHub main.
