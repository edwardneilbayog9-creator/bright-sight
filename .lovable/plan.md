

# Plan: Rebrand to BrightEdge with New Color Scheme

## Overview

Rename all "BrightSight" references to "BrightEdge" across the entire application, replace the ScanEye icon with the uploaded logo image, update the tagline to "Sharper insight. Smarter Care.", and shift the color scheme to teal/aqua blue and royal blue to match the logo — while preserving semantic status colors (green, orange, red).

## 1. Copy Logo Assets

Copy the no-background logo into the project:
- `user-uploads://BRIGHTEDGE-notext-removebg-preview.png` → `src/assets/brightedge-logo.png`

## 2. Update Color Scheme (`src/index.css`)

Shift the CSS variables from the current navy/teal to a teal-aqua-blue + royal-blue palette aligned with the logo colors:

**Light mode:**
- `--primary`: Royal blue (~215 80% 45%) 
- `--secondary`: Teal/aqua (~185 75% 45%)
- `--accent`: Teal (~185 65% 40%)
- `--ring`: Royal blue
- Sidebar colors: deep royal blue background, teal accents
- Gradient tokens updated to use royal blue → teal transitions

**Dark mode:** Corresponding dark variants with the same hue family.

Status colors (`--success`, `--warning`, `--destructive`) remain unchanged.

## 3. Text Rebrand — All Files

Replace every "BrightSight" → "BrightEdge" and update taglines in these files:

| File | Changes |
|------|---------|
| `index.html` | Title, meta tags, author |
| `package.json` | productName, appId |
| `electron-builder.json` | appId, productName, copyright |
| `electron/main.js` | Window title |
| `src/pages/Index.tsx` | Brand name, description text |
| `src/components/landing/HeroSection.tsx` | Brand name, tagline → "Sharper insight. Smarter Care." |
| `src/components/landing/LoginForm.tsx` | Card title, toast message |
| `src/components/dashboard/DashboardLayout.tsx` | Sidebar brand name, subtitle |
| `src/pages/DetectionDetail.tsx` | Print header |
| `src/utils/generateReport.ts` | Report title, header, footer |
| `src/lib/db/schema.ts` | Comment |
| `src/hooks/useAuth.tsx` | Storage key `brightsight_` → `brightedge_` |
| `src/lib/db/sqljs-service.ts` | Storage key |
| `src/lib/db/migrate-from-localstorage.ts` | Migration key |
| `src/pages/Settings.tsx` | Storage key |

**Note on storage keys:** Changing `brightsight_` to `brightedge_` will reset local data. An alternative is to keep the old keys for backward compatibility. I will keep old keys and add migration logic to avoid data loss.

Actually, to keep it simple and avoid breaking existing installs, I will keep the internal storage keys (`brightsight_*`) unchanged — they are not user-facing. Only visible UI text and branding will change.

## 4. Replace ScanEye Icon with Logo Image

In components that currently use the `ScanEye` lucide icon as the brand logo:
- `src/pages/Index.tsx` — Replace `<ScanEye>` with `<img src={logo}>` 
- `src/components/landing/HeroSection.tsx` — Same replacement
- `src/components/dashboard/DashboardLayout.tsx` — Replace `<Eye>` icon in sidebar header with logo image

All will import from `@/assets/brightedge-logo.png`.

## 5. Update Tailwind Config (`tailwind.config.ts`)

No structural changes needed — colors are driven by CSS variables. The keyframes and animations remain the same.

## Summary of Changes

- **1 asset copied** (logo)
- **~14 files edited** (text replacements + color scheme + logo swap)
- **No storage key changes** (backward compatible)
- **Status colors preserved** (green/orange/red untouched)

