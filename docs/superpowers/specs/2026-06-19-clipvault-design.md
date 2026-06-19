# ClipVault — Design Specification
**Date:** 2026-06-19  
**Status:** Approved for implementation

---

## 1. Product Summary

ClipVault is a free, no-login web tool for real-time board-based sharing (text, image, PDF) combined with a suite of client-side utility tools. Revenue comes from Google AdSense. Costs are kept near-zero by using free-tier infrastructure.

**URL:** `clipvault.vercel.app` (free Vercel subdomain — no domain purchase needed to launch)  
**Target users:** Anyone needing fast, frictionless device-to-device transfer or a quick utility tool — students, developers, office workers.

---

## 2. Core Features

### 2.1 Boards (Real-time Sharing)
- **Creation:** One click → generates a memorable `word-word-number` room name (e.g., `swift-tiger-42`)
- **Joining:** Type the room name or paste an ID → enter password if protected
- **Slots per board:**
  - **Text** — live-synced textarea, up to 100KB, **never expires**
  - **File 1, File 2, File 3** — any file type (images, PDF, Excel .xlsx, JSON, Word .docx, CSV, ZIP, etc.), up to 25MB each, each with its own user-set expiry
- **Real-time:** All connected clients see updates within ~1s via Firebase Realtime listeners
- **Password protection:** Optional on creation. Board shows a lock badge. Wrong password = access denied.
- **Board expiry:** Never. The board itself (name, password, text) persists indefinitely.
- **File expiry:** When uploading a file, user picks a TTL: **1 hour / 24 hours / 7 days / 30 days / Never**. Each file slot has its own independent expiry. After expiry the file is deleted from Firebase Storage and the slot shows "File expired — upload a new one". Board and text are unaffected.
- **Connected users:** Live counter shown on board header.
- **Share:** Copy link button generates `clipvault.io/b/swift-tiger-42`. QR code overlay for mobile sharing.

### 2.2 Free Utility Tools (Client-side, zero DB cost)
Each tool lives at its own route (e.g., `/tools/qr-generator`) for SEO indexability.
All tools: browser-only processing, no data sent to server, privacy-first messaging on each page.

**Phase 1 Launch (12 tools):**

| Tool | Route | Search Intent |
|---|---|---|
| QR Code Generator | `/tools/qr` | "qr code generator free" |
| JSON Formatter | `/tools/json` | "json formatter online" |
| Password Generator | `/tools/password` | "password generator" |
| Image Compressor | `/tools/image-compressor` | "compress image online free" |
| Color Picker | `/tools/color-picker` | "color picker online HEX RGB" |
| Markdown Editor | `/tools/markdown` | "markdown editor online" |
| Word Counter | `/tools/word-counter` | "word counter online" |
| Base64 Encoder/Decoder | `/tools/base64` | "base64 encoder decoder" |
| URL Encoder/Decoder | `/tools/url-encoder` | "url encode decode online" |
| Lorem Ipsum Generator | `/tools/lorem-ipsum` | "lorem ipsum generator" |
| UUID Generator | `/tools/uuid` | "uuid generator online" |
| Timestamp Converter | `/tools/timestamp` | "unix timestamp converter" |

**Full 100-tool roadmap:** see Section 9 (Future Phases).

---

## 3. Technical Architecture

### 3.1 Stack
| Layer | Technology | Cost |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Free |
| Hosting | Vercel Hobby (free subdomain `clipvault.vercel.app`) | Free |
| WebSockets / Presence | Partykit (Cloudflare Durable Objects, 1 party = 1 board) | Free |
| Database | Neon (serverless Postgres, never pauses on free tier) | Free (0.5GB) |
| File Storage | Cloudflare R2 (10GB free, zero egress fees) | Free |
| Authentication | None (anonymous boards) | — |
| Ads | Google AdSense | Revenue |

**Why Neon over Supabase:** Supabase free tier pauses the DB after 1 week of inactivity; Neon never pauses.  
**Why Partykit over Firebase RTDB:** True WebSocket connections with server-side room logic; Vercel serverless cannot hold persistent WebSocket connections.  
**Why Cloudflare R2 over Firebase Storage:** R2 has zero egress fees; Firebase charges after 1GB/day download.

### 3.2 Neon Database Schema
```sql
-- Boards table
CREATE TABLE boards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL,          -- "swift-tiger-42"
  password_hash TEXT,                         -- bcrypt hash, null = free/open board
  text_content TEXT DEFAULT '',              -- live-updated, never expires
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- File slots (3 per board)
CREATE TABLE board_files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id    UUID REFERENCES boards(id) ON DELETE CASCADE,
  slot_index  SMALLINT NOT NULL CHECK (slot_index IN (0,1,2)),
  r2_key      TEXT,                          -- Cloudflare R2 object key
  file_name   TEXT,
  file_type   TEXT,                          -- MIME type
  file_size   BIGINT,                        -- bytes
  expires_at  TIMESTAMPTZ,                   -- null = never expires
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (board_id, slot_index)
);

CREATE INDEX idx_board_files_expires ON board_files(expires_at) WHERE expires_at IS NOT NULL;
```

### 3.3 Board Name Generation
- Word lists: 50 adjectives × 50 animals × 99 numbers = 247,500 unique names
- On creation: generate random name, `SELECT 1 FROM boards WHERE name = $1` for collision, retry once
- Names are lowercase, hyphen-separated, URL-safe

### 3.4 Partykit Real-time Architecture
Each board name = one Partykit room (Cloudflare Durable Object). The party server handles:
- `onMessage("text-update", payload)` → broadcast to all connections in the room
- `onConnect` / `onClose` → maintain and broadcast connected-count
- Persistent room state holds current `textContent` so late joiners get it immediately

Next.js client connects via `usePartySocket(roomId)` hook. Text changes debounced 500ms before emitting.

### 3.5 File Expiry Enforcement

Two-layer approach:

1. **Client-side check:** On board page load, compare each `expires_at` against `Date.now()`. If expired, show "File expired" UI and POST `/api/boards/[name]/files/[slot]/expire` (deletes from R2, nulls DB row).
2. **Vercel Cron Job (free):** Daily `/api/cron/cleanup` queries `SELECT * FROM board_files WHERE expires_at < NOW()`, deletes each R2 object, then deletes the DB rows. Handles boards no one has visited.

User picks TTL per file at upload: `1 hour · 24 hours · 7 days · 30 days · Never`.

**Supported file types:** any (images, PDF, Excel .xlsx, Word .docx, JSON, CSV, ZIP, TXT, etc.). Max 25MB per file.

### 3.6 Password Protection
- On creation: user optionally enters password → bcrypt hashed → stored in `boards.password_hash`
- On join password-protected board: user enters password → POST `/api/boards/[name]/auth` → server bcrypt-compares → returns signed session token
- Free/open boards (default): no password, no token required

### 3.7 File Upload Flow
1. User drops/selects file → client validates ≤25MB
2. User picks TTL from dropdown
3. POST `/api/boards/[name]/files/[slot]/upload` → server generates R2 presigned URL
4. Client PUTs file directly to R2 presigned URL (no Next.js bandwidth used)
5. Server writes `{ r2_key, file_name, file_type, file_size, expires_at }` to `board_files`
6. Partykit broadcasts `file-updated` event → all clients refresh file slot UI

---

## 4. Design System

### 4.1 Design Philosophy
Premium dark-first SaaS. Massive whitespace. Typography does the heavy lifting — one focal point per section. Restraint everywhere except the board name (JetBrains Mono, the brand's signature). Cues from Linear, Vercel, Raycast, Resend.

### 4.2 Typography
- **Display:** Syne 800 — headings only, large scale, tight letter-spacing (-0.04em)
- **Body/UI:** Inter 400/500 — all labels, paragraphs, buttons
- **Code/Board names:** JetBrains Mono 500/600 — board names, code outputs, file names
- Scale: 10 / 11 / 12 / 13 / 14 / 17 / 22 / 30 / 44px

### 4.3 Color Palette
- Background: `#09090B` (near-black)
- Surface 1: `#111115` — nav, card backgrounds
- Surface 2: `#18181C` — hover states
- Surface 3: `#222228` — active/selected
- **Accent: `#F97316` (orange)** — primary CTAs, board name chip, live dot, highlights
- Success: `#22C55E`
- Warning: `#F59E0B`
- Danger: `#F43F5E`
- Text primary: `#FAFAFA`
- Text muted: `#A1A1AA`
- Text dim: `#52525B`
- Border default: `rgba(255,255,255,0.06)`
- Border emphasis: `rgba(255,255,255,0.10)`

**Accent usage rule:** Orange appears ONLY on primary CTAs, the board name display, live indicators, and hover accents — never on decorative elements.

### 4.4 Spacing System
- Base unit: 4px
- Common: 8 / 12 / 16 / 24 / 32 / 48 / 64px

### 4.5 Component Patterns
- Cards: subtle border, no heavy shadows, `border-radius: 12px`
- Buttons: primary (indigo filled), secondary (ghost), destructive (red ghost)
- Inputs: 40px height, clear focus ring
- Animations: subtle, purposeful — 150ms ease-out transitions

### 4.6 Responsiveness
- Mobile-first CSS
- Fluid typography with `clamp()`
- Grid: 1 col (mobile) → 2 col (tablet) → 3 col (desktop)
- Board slots: stack vertically on mobile, 3-column on desktop
- Navigation: hamburger menu on mobile, horizontal links on desktop

---

## 5. Pages & Routes

| Route | Purpose |
|---|---|
| `/` | Homepage — create/join board, tool grid, ads |
| `/b/[name]` | Live board room |
| `/b/[name]/join` | Password entry screen |
| `/tools` | All tools index |
| `/tools/[slug]` | Individual tool page |
| `/about` | About + how it works |
| `/privacy` | Privacy policy |

---

## 6. Monetization

- **Google AdSense** — auto ads + manual placements:
  - Homepage: 1 banner below hero, 1 between tools grid
  - Board page: 1 sidebar ad (desktop), 1 bottom ad (mobile) — never in the board slots area
  - Tool pages: 1 banner top, 1 bottom
- **Goal:** Keep ads non-intrusive. No popups. No interstitials. Never block core functionality.

---

## 7. SEO Strategy

- Each tool page: unique title, meta description, H1 targeting the search keyword
- Board pages: `noindex` (dynamic, user content)
- Homepage: structured data (WebApplication schema)
- Sitemap: auto-generated via Next.js
- Core Web Vitals: LCP < 2.5s target (SSR homepage, static tool pages)

---

## 8. Implementation Phases

### Phase 1 — Foundation
- Next.js 14 project setup, Tailwind CSS, Geist font
- Firebase project + config
- Design system: tokens, base components (Button, Card, Input, Badge)
- Layout: nav, footer, responsive shell

### Phase 2 — Board Core
- Board creation (name generation, Firestore write)
- Board join (name lookup)
- Password protection (create + verify flow)
- Real-time text sync

### Phase 3 — File Sharing
- Image upload to Firebase Storage
- PDF upload to Firebase Storage
- Board view: image preview + PDF viewer/download

### Phase 4 — Polish & UX
- Live connected user count (Presence)
- Share link + QR overlay
- Delete board / clear slots
- Loading states, error states, empty states

### Phase 5 — Utility Tools
- All 10 tool pages (client-side, no backend)
- Tools index page

### Phase 6 — Monetization & SEO
- Google AdSense integration
- Meta tags, sitemap, structured data
- Performance optimization (bundle analysis, image optimization)

### Phase 7 — Production Readiness
- Comprehensive responsive QA (mobile, tablet, desktop, ultrawide)
- Accessibility audit (WCAG AA)
- Firebase security rules
- Error monitoring (Sentry free tier)
- Vercel deployment + domain config

---

## 9. Out of Scope (v1)
- User accounts / authentication
- Board history / versioning
- Multiple files per slot
- Mobile apps
- Paid plans

---

## 10. Future Tool Roadmap (100 tools across phases)

All tools are client-side only. Each gets its own SEO-indexed route at `/tools/[slug]`.

### Text Tools (15)
| # | Tool | Route |
|---|---|---|
| 1 | Word Counter | `/tools/word-counter` |
| 2 | Character Counter | `/tools/char-counter` |
| 3 | Lorem Ipsum Generator | `/tools/lorem-ipsum` |
| 4 | Text Case Converter | `/tools/case-converter` |
| 5 | Markdown Editor | `/tools/markdown` |
| 6 | Text Diff Checker | `/tools/diff` |
| 7 | Duplicate Line Remover | `/tools/dedupe-lines` |
| 8 | Text Sorter (A-Z) | `/tools/sort-lines` |
| 9 | Slug Generator | `/tools/slug` |
| 10 | Find & Replace | `/tools/find-replace` |
| 11 | Line Break Remover | `/tools/remove-linebreaks` |
| 12 | Text Reversal | `/tools/reverse-text` |
| 13 | Email Extractor | `/tools/extract-emails` |
| 14 | URL Extractor | `/tools/extract-urls` |
| 15 | Reading Time Estimator | `/tools/reading-time` |

### Developer Tools (20)
| # | Tool | Route |
|---|---|---|
| 16 | JSON Formatter/Validator | `/tools/json` |
| 17 | JSON to CSV | `/tools/json-to-csv` |
| 18 | CSV to JSON | `/tools/csv-to-json` |
| 19 | HTML Formatter | `/tools/html-formatter` |
| 20 | CSS Minifier/Beautifier | `/tools/css` |
| 21 | JavaScript Minifier | `/tools/js-minify` |
| 22 | SQL Formatter | `/tools/sql` |
| 23 | XML Formatter | `/tools/xml` |
| 24 | Base64 Encoder/Decoder | `/tools/base64` |
| 25 | URL Encoder/Decoder | `/tools/url-encoder` |
| 26 | UUID Generator | `/tools/uuid` |
| 27 | JWT Decoder | `/tools/jwt` |
| 28 | Regex Tester | `/tools/regex` |
| 29 | CRON Expression Builder | `/tools/cron` |
| 30 | HTML Entities Encoder | `/tools/html-entities` |
| 31 | HTTP Status Code Reference | `/tools/http-status` |
| 32 | Markdown to HTML | `/tools/md-to-html` |
| 33 | Code Diff Viewer | `/tools/code-diff` |
| 34 | Timestamp Converter | `/tools/timestamp` |
| 35 | Number Base Converter | `/tools/base-converter` |

### Security Tools (10)
| # | Tool | Route |
|---|---|---|
| 36 | Password Generator | `/tools/password` |
| 37 | Hash Generator (MD5/SHA) | `/tools/hash` |
| 38 | Password Strength Meter | `/tools/password-strength` |
| 39 | Email Validator | `/tools/validate-email` |
| 40 | URL Validator | `/tools/validate-url` |
| 41 | Random Token Generator | `/tools/token` |
| 42 | HMAC Generator | `/tools/hmac` |
| 43 | bcrypt Hash Generator | `/tools/bcrypt` |
| 44 | Credit Card Validator (Luhn) | `/tools/luhn` |
| 45 | IBAN Validator | `/tools/iban` |

### Image Tools (10)
| # | Tool | Route |
|---|---|---|
| 46 | Image Compressor | `/tools/image-compressor` |
| 47 | Image to Base64 | `/tools/image-to-base64` |
| 48 | Base64 to Image | `/tools/base64-to-image` |
| 49 | Image Format Converter | `/tools/image-convert` |
| 50 | Image Resizer | `/tools/image-resize` |
| 51 | Image Crop | `/tools/image-crop` |
| 52 | Color Picker from Image | `/tools/color-from-image` |
| 53 | QR Code Generator | `/tools/qr` |
| 54 | Barcode Generator | `/tools/barcode` |
| 55 | Favicon Generator | `/tools/favicon` |

### Color Tools (8)
| # | Tool | Route |
|---|---|---|
| 56 | Color Picker (HEX/RGB/HSL) | `/tools/color-picker` |
| 57 | Contrast Checker (WCAG) | `/tools/contrast` |
| 58 | Color Palette Generator | `/tools/palette` |
| 59 | CSS Gradient Generator | `/tools/gradient` |
| 60 | Color Blindness Simulator | `/tools/color-blind` |
| 61 | CSS Box Shadow Generator | `/tools/box-shadow` |
| 62 | CSS Border Radius Generator | `/tools/border-radius` |
| 63 | Tint & Shade Generator | `/tools/tints` |

### Math & Numbers (10)
| # | Tool | Route |
|---|---|---|
| 64 | Percentage Calculator | `/tools/percentage` |
| 65 | Unit Converter | `/tools/units` |
| 66 | Currency Converter | `/tools/currency` |
| 67 | BMI Calculator | `/tools/bmi` |
| 68 | Age Calculator | `/tools/age` |
| 69 | Loan / EMI Calculator | `/tools/loan` |
| 70 | Compound Interest | `/tools/compound-interest` |
| 71 | Roman Numeral Converter | `/tools/roman` |
| 72 | Scientific Calculator | `/tools/calculator` |
| 73 | Random Number Generator | `/tools/random-number` |

### Time & Date (8)
| # | Tool | Route |
|---|---|---|
| 74 | Unix Timestamp Converter | `/tools/timestamp` |
| 75 | Date Difference Calculator | `/tools/date-diff` |
| 76 | Time Zone Converter | `/tools/timezone` |
| 77 | Date Formatter | `/tools/date-format` |
| 78 | Countdown Timer | `/tools/countdown` |
| 79 | World Clock | `/tools/world-clock` |
| 80 | Working Days Calculator | `/tools/working-days` |
| 81 | Day of Week Finder | `/tools/day-of-week` |

### Generators (10)
| # | Tool | Route |
|---|---|---|
| 82 | Lorem Ipsum (advanced) | `/tools/lorem-ipsum` |
| 83 | UUID (v1/v4/v7) | `/tools/uuid` |
| 84 | Name Generator | `/tools/name-generator` |
| 85 | Email Template Generator | `/tools/email-template` |
| 86 | Fake Data Generator | `/tools/fake-data` |
| 87 | Random Color Generator | `/tools/random-color` |
| 88 | Placeholder Image Generator | `/tools/placeholder-image` |
| 89 | Table Generator (CSV → HTML) | `/tools/table` |
| 90 | Privacy Policy Generator | `/tools/privacy-policy` |
| 91 | Terms Template Generator | `/tools/terms` |

### SEO & Web (9)
| # | Tool | Route |
|---|---|---|
| 92 | Meta Tag Generator | `/tools/meta-tags` |
| 93 | OG Tag Preview | `/tools/og-preview` |
| 94 | Robots.txt Generator | `/tools/robots-txt` |
| 95 | Sitemap Generator | `/tools/sitemap` |
| 96 | HTTP Headers Checker | `/tools/http-headers` |
| 97 | htaccess Generator | `/tools/htaccess` |
| 98 | Keyword Density Analyzer | `/tools/keyword-density` |
| 99 | Word Count + Reading Time | `/tools/content-stats` |
| 100 | Twitter Card Preview | `/tools/twitter-card` |

**Phase rollout:** Launch with 12 (Phase 5) → add 8 more in Phase 6 → add remaining tools in Phase 7+.
