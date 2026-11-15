# ABUUR Digital: brand kit

Everything for the ABUUR brand: logos, icons, app icons, favicon, social image and the brand guidelines.
All SVGs are pure vector shapes: the text is converted to outlines, so no font is needed.

Start with `brand/ABUUR-Brand-Guidelines.pdf`. It shows how to use everything below.

## Folders

| Folder | What's inside |
|---|---|
| `brand/` | `ABUUR-Brand-Guidelines.pdf` (9 pages) and each page as a PNG in `brand/pages/` |
| `svg/logos/`, `png/logos/` | 18 logos (PNG at 800, 1600 and 3200 px wide, transparent background) |
| `svg/icons/`, `png/icons/` | The sprout on its own: 3D tile, 3D blue, 3D white, flat and single colour |
| `png/app-icons/` | App icons from 16 to 1024 px, including the iPhone icon (180 px) |
| `favicon/` | `favicon.ico`, `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` |
| `png/social/` | Link preview image, 1200 × 630 |

## Logos

Every logo comes in `-light` (for white or light backgrounds) and `-dark` (for dark or blue backgrounds).

| File | Use it for |
|---|---|
| `logo-horizontal` | **Primary logo.** Website header, documents, most places |
| `logo-horizontal-3d` | Same layout with the 3D sprout: landing pages, slides |
| `logo-horizontal-3d-tile` | With the 3D app-icon tile: hero sections, posters, app stores |
| `logo-stacked`, `-3d`, `-3d-tile` | Square-ish spaces: social posts, business cards, signage |
| `logo-compact`, `logo-compact-3d-tile` | Icon + ABUUR only, for tight spaces such as a mobile header |
| `wordmark` | The name only, when the sprout already appears nearby |

### How the logos are built

- DIGITAL is centred under ABUUR, with thin rules running out to the exact width of ABUUR.
- The icon and the text block are centred on each other.
- Every file includes the clear space (x = the height of the gem) on all sides, so files can be placed edge to edge.
- All sizes come from the height of the ABUUR letters, so every version has the same proportions.

Minimum sizes: logo 160 px wide (35 mm in print); icon 24 px (8 mm).

## Colours

| Name | Hex | Use |
|---|---|---|
| ABUUR Blue | `#0D6EFD` | Primary colour, buttons, highlights |
| Deep Blue | `#0646C4` | Gradients, hover states |
| Ink Blue | `#0A1F44` | Text, dark backgrounds |
| Bright Blue | `#4A95FF` | Highlights, top of gradients |
| Sky Blue | `#7FB0FF` | Text on dark backgrounds |
| Ice Blue | `#EEF4FF` | Light backgrounds |

Brand gradient: Bright Blue to ABUUR Blue to Deep Blue.

## Typography

Inter (free, SIL Open Font License): ExtraBold for headlines and "ABUUR", SemiBold for subheadings and "DIGITAL", Regular for body text.

## Website snippet

```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:image" content="/og-image-1200x630.png">
```
