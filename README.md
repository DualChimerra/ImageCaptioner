![Screenshot](https://github.com/DualChimerra/ImageCaptioner/blob/main/assets/scr.png)
# Image Captioner (MacOS)
A focused GUI to caption dataset images for LoRA/SDXL training. It streamlines annotation, guarantees consistent file naming, and exports images and captions in the exact format most LoRA pipelines expect: sequentially numbered images plus same‑named `.txt` files with prompts.
Tested only on `macOS Sequoia 15.5`

## Why this speeds up LoRA training
- **Zero manual file management**: the app renames images to `1..N` and writes `1..N.txt` automatically. No more hand‑renaming or misaligned captions.
- **Fast per‑image editing**: thumbnail + caption field per image, with a clear Done/Not done status. You always know progress.
- **Batch operations**: drag to select a group, then bulk Delete or Mark as done to clean or finalize quickly.
- **Filter/sort and export only what you need**: focus on items without captions or not done; export only the visible subset to iterate in small batches.
- **Fewer mistakes**: the tool guarantees matching names for images and captions, consistent encoding (UTF‑8), and preserves original extensions.
- **LoRA‑friendly conventions**: numbering and sidecar `.txt` files align with common SDXL LoRA scripts, so training can start right away.

## Features
- Load an unlimited number of images
- Per‑image caption input with status: Done / Not done
- Delete per image + bulk delete or bulk mark done (drag‑select)
- Lightbox preview (click thumbnail; close on click outside or ESC)
- Filters and sorting by caption presence and status
- “Export visible only” respects current filters/sorting
- Choose Start Index; numbering is continuous (1..N)
- Language switch: EN / RU
- Minimalist, modern dark UI

Supported image formats: `png`, `jpg`, `jpeg`, `webp`, `bmp`, `tiff`, `tif`, `heic`, `heif`.

## Installation (macOS)
Prerequisites: Node.js LTS (18+ recommended). Install from `https://nodejs.org`.

1) Download or clone this repository to any folder on your Mac, for example `~/image-caption`.
2) To run Electron app open Terminal and run in target repository:
```bash
git clone https://github.com/DualChimerra/ImageCaptioner.git
cd ~/ImageCaptioner
npm install
npm run start
```

To build a DMG installer:
```bash
npm run dist
```
The installer will be generated in the `dist/` folder (electron‑builder).

## Usage
1. Click “Load images” and choose your dataset images.
2. Click “Choose folder” and set the output directory.
3. Optionally set “Start index” (default 1).
4. For each image, write a caption prompt; toggle status Done/Not done.
5. Select multiple items by dragging a selection rectangle (Cmd/Ctrl+click toggles individual items).
6. Use the bottom bar to Bulk Delete or Mark as done.
7. Use filters/sorting to focus work (e.g., “without caption”).
8. If you need to iterate, enable “Export visible only” to export just the current view.
9. Click “Export”. A modal will confirm how many files were exported and let you open the folder.

## Roadmap ideas
- Windows support
- Drag & drop import
- CSV/JSON import/export of captions
- Autosave session and restore on launch
- Tag presets and autocomplete for common tokens

## License
Custom Non-Commercial License (CNCL)
