# PLATES

**[Live Demo](https://thikeyeman.github.io/PLATES/)**

PLATES (Profile Layering And Telop Editing System) is a browser-based editor for live-stream graphics and captions.

![PLATES with Japanese telop layers over the optional city video preview](assets/plates-screenshot.png)

## Features

- Text captions with Japanese support, font choices, and 12 style presets
- Rectangles, image uploads, and layer controls
- Animations and a separate output window for capture
- Local profiles and JSON import/export

Built with JavaScript, HTML, CSS, and Fabric.js.

## Run locally

From the project folder, run:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open [localhost:8765](http://localhost:8765). Edit the starter scene or use **Clear canvas** to start fresh. **Load example** restores it. The muted city video starts automatically and can be toggled off; it never enters saved projects or output.

Use **Open output**, then **Take Live** to publish a complete Preview snapshot. Edits stay private until the next Take Live. **Clear Live** clears Program without deleting Preview and turns realtime off. **Realtime output** broadcasts edits immediately; switching it off freezes Program. Output defaults to **Chroma green**; choose **Transparent (alpha)** for browser-source compositing. Play an animation in Preview and Take Live while it runs to continue it in Program. OBS is optional.

Text layers have font, size, alignment, and preset controls. Select a layer on the canvas to duplicate or align it; Cmd/Ctrl+D duplicates, Delete/Backspace removes, and Escape deselects. Profiles and JSON retain typography and opacity. Fonts use local system fallbacks, so appearance can vary between devices.

Python 3 is required for this command. There is no build step or package installation. Export JSON to keep a portable backup; local profiles stay in the current browser.

Third-party notices and licensing questions are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
