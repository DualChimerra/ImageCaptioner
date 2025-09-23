# Image Captioner
A minimal, fast GUI to caption dataset images for LoRA/SDXL training. Export renames images to sequential numbers and writes matching `.txt` files with your prompts.

Made by [DualChimerra](https://github.com/DualChimerra).

## Highlights
- Load an unlimited number of images
- Per‑image caption input with status: Done / Not done
- Delete image or bulk delete/mark as done with multi‑selection (drag to select)
- Lightbox preview (click thumbnail, close on click or ESC)
- Filters and sort by caption presence and Done status
- Option “Export visible only” respects current filters and sorting
- Choose Start Index; numbering is continuous (1..N)
- RU/EN language switch
- Modern, minimalist dark UI (Tailwind)
Supported image formats: `png`, `jpg`, `jpeg`, `webp`, `bmp`, `tiff`, `tif`, `heic`, `heif`.

## Quick start (macOS)
1) Install Node.js LTS from `https://nodejs.org`
2) In Terminal:

```bash
cd /Users/maiyacherriez/image-caption
npm install
npm run start
```

This launches the app.

## Build a distributable (DMG)
```bash
npm run dist
```
The installer will be created in the `dist/` folder (electron-builder).

## Usage
1. Click “Load images” and select files.
2. Click “Choose folder” and set the output directory.
3. Optionally set “Start index”.
4. Enter a caption for each image; toggle status Done/Not done.
5. To select multiple: drag a rectangle across items (Cmd/Ctrl+click toggles single items).
6. Use the bottom bar to Bulk Delete or Mark as done.
7. Use filters/sorting as needed. Check “Export visible only” to export just the current view.
8. Click “Export”.

### Export behavior
- Files are written as `<index>.<original_ext>` and `<index>.txt` with the same index.
- The original image extension is preserved; `.txt` uses UTF‑8.
- Existing numbered files in the output folder are overwritten.
- If “Export visible only” is enabled, export order follows the current list order (after filtering/sorting).

## Roadmap ideas
- Drag & drop import
- CSV/JSON import/export of captions
- Keyboard shortcuts (navigation, mark done, export)
- Autosave session and restore on launch
- Tag presets and autocomplete for common tokens

## License
Custom Non-Commercial License (CNCL)
