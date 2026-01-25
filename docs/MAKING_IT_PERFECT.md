# Making This App Perfect

A checklist and set of instructions to polish the Deyaneira & Aaron wedding site before and after launch.

---

## 1. Content & Copy

- [ ] **Dates and times** — Confirm 07.18.26 and 5:00 PM in hero, FAQ, and `calendar.ics`.
- [ ] **Venue** — Verify “Officers Club, Punta Borinquen Resort” and “Aguadilla, PR 00603” everywhere.
- [ ] **Coordinates** — Check 18.4886761, -67.1616232 in the map and “CÓMO LLEGAR” link.
- [ ] **ES/EN** — Review all `copy` in `App.tsx` for typos, tone, and consistency.
- [ ] **Intro** — Confirm `intro.letterNames`, `intro.letterDate`, and `intro.hint` in both languages.
- [ ] **Travel** — `travel.flight` opens Google Flights (NYC → Puerto Rico). `travel.placesList` is a curated list with Google Maps links; no Platea/API. Edit in `App.tsx` to add or change places in Aguadilla.

---

## 2. Assets & Images

### Required

- [ ] **`/images/paper-noise.png`** — Used by `.rsvp-form`. Add a subtle paper texture (e.g. from [Transparent Textures](https://www.transparenttextures.com/) or similar) or remove the `background-image` in `style.css` if not needed.
- [ ] **`/images/logo-og.png`** (1200×630) — Many platforms (Facebook, WhatsApp, LinkedIn) expect PNG for `og:image`. Export `/images/logo-og.svg` to PNG and:
  - Save as `public/images/logo-og.png`
  - In `index.html`, set `og:image` and `twitter:image` to  
    `https://bodaenelsunset.com/images/logo-og.png`

### Optional

- [ ] **Favicon PNG fallback** — Add `public/favicon.ico` or `public/favicon-32x32.png` for older browsers; keep `/logo.svg` as primary.
- [ ] **Image optimization** — Compress `hibiscus.png`, `bird_of_paradise.png`, `Palm_leaves.png` (e.g. [Squoosh](https://squoosh.app/)). Prefer WebP with PNG fallback if you need smaller files.

---

## 3. Google Forms & RSVP

- [ ] **Env vars** — Create `.env` from `.env.example` and set:
  - `VITE_GOOGLE_FORM_ACTION`
  - `VITE_GOOGLE_FORM_ENTRY_NAME`
  - `VITE_GOOGLE_FORM_ENTRY_ATTENDANCE`
  - `VITE_GOOGLE_FORM_ENTRY_GUESTS`
  - `VITE_GOOGLE_FORM_ENTRY_SONG`
- [ ] **Form setup** — Follow [docs/GOOGLE_FORMS_SETUP.md](./GOOGLE_FORMS_SETUP.md).
- [ ] **Deploy env** — On Vercel/Netlify (if used), add the same variables in the project settings. For GitHub Pages, these must be baked in at build time (e.g. via GitHub Actions secrets).
- [ ] **Test RSVP** — Submit in dev and production and confirm rows in Google Sheets.

---

## 4. Button & UI Style

The app uses a small **button system** that fits the tropical-elegant look:

| Class          | Use                         | Style |
|----------------|-----------------------------|--------|
| `btn-primary`  | Main CTAs (RSVP, CÓMO LLEGAR)| Terracotta fill, soft shadow, slight lift on hover |
| `btn-secondary`| Alternate on dark sections  | Forest green, gold border, same hover lift |
| `btn-outline`  | Nav, language, low emphasis | Transparent, forest border, hover fill |
| `btn-ghost`    | Tertiary, minimal           | Transparent, text only, very subtle hover |
| `stamp-link`   | “Agregar al calendario”     | Dashed border, stamp-like, hover background |

When adding new buttons:

- Use **only these classes** (or combinations like `btn-primary map-overlay` for overrides) so the look stays consistent.
- For inspiration without breaking the style, use **UIverse** ([uiverse.io](https://uiverse.io)), **UI Snippets**, or **Codepen** and adapt only:
  - **Hover**: `translateY(-1px)`, soft `box-shadow`, or light `scale(1.02)`.
  - **Colors**: `boda-terracotta`, `boda-forest`, `boda-gold`, `boda-burgundy`, `boda-cream`.
  - **Shape**: `rounded-full` or `rounded-xl`, no sharp corners.
  - **Typography**: `uppercase`, `tracking-[0.2em]`–`[0.35em]`, `font-heading` or `font-display`.

Avoid: neon, heavy 3D, big gradients, or fonts that clash with Playfair / Montserrat / Inter.

---

## 5. Performance

- [ ] **Images** — Compress and, if needed, convert to WebP. Use `loading="lazy"` for below-the-fold images (already on the map iframe).
- [ ] **Fonts** — `index.html` loads Google Fonts (Playfair, Montserrat, Inter). Consider `font-display: swap` (or preconnect) if not set.
- [ ] **Audio** — `preload="auto"` on `/audio/tqm.mp3` is fine for “play on tap”; avoid extra tracks.
- [ ] **Lighthouse** — Run in Chrome DevTools. Aim: Performance &gt; 90, Accessibility &gt; 95.

---

## 6. Accessibility

- [ ] **Focus** — All buttons and links use `focus:ring-2` and `focus:ring-offset-2`. Don’t remove or hide outlines.
- [ ] **Touch targets** — Buttons have `min-height: 44px`. Keep that for any new controls.
- [ ] **Alt text** — Decorative images use `alt=""`. Any meaningful image should have a short `alt`.
- [ ] **Reduced motion** — `useReducedMotion` shortens or skips the envelope animation. Respect that.
- [ ] **Labels** — Form inputs use `<label>`. `aria-label` is set on icon-only buttons (music, intro, etc.).

---

## 7. SEO & Sharing

- [ ] **Meta** — `index.html` has `title`, `description`, `canonical`, `og:*`, `twitter:*`, `theme-color`. Check that `og:url` and `canonical` match the live URL (e.g. `https://bodaenelsunset.com`).
- [ ] **og:image** — Prefer `logo-og.png` (1200×630) over SVG for best compatibility. See **Assets** above.
- [ ] **Sitemap** — For a one-page site, a sitemap is optional. If you add one, put `https://bodaenelsunset.com` in it.

---

## 8. Testing

### Devices & Browsers

- [ ] **iOS Safari** — Envelope, music on tap, RSVP, map, language toggle.
- [ ] **Android Chrome** — Same flows.
- [ ] **Desktop** — Chrome, Firefox, Safari, Edge.

### Flows

- [ ] **First visit** — Envelope intro, tap to open, music starts, letter shows “Deyaneira & Aaron” and date, then main site.
- [ ] **Return visit** — Skips intro (localStorage), no scroll lock, music toggle works.
- [ ] **RSVP** — Submit with valid data; see success toast and new row in Sheets. Test “Sí” / “No”, guests, song.
- [ ] **Calendar** — “Agregar al calendario” downloads `calendar.ics` and opens in calendar apps.
- [ ] **Map** — “CÓMO LLEGAR” opens Google Maps to the correct coordinates.
- [ ] **Travel** — "Reservar vuelo" opens Google Flights (NYC → Puerto Rico). "Lugares en Aguadilla" expands; each place opens in Google Maps.

### Share Previews

- [ ] **Facebook** — [Sharing Debugger](https://developers.facebook.com/tools/debug/); paste `https://bodaenelsunset.com` and refresh if you change `og:image`.
- [ ] **Twitter** — [Card Validator](https://cards-dev.twitter.com/validator).
- [ ] **WhatsApp** — Share the link in a chat and check title, description, and image.

---

## 9. Deployment

- [ ] **GitHub Pages** — `npm run deploy` builds and pushes `dist/` to the `gh-pages` branch.
- [ ] **CNAME** — `public/CNAME` and repo root `CNAME` contain `bodaenelsunset.com`. DNS for the domain must point to GitHub Pages (A/CNAME as in GitHub’s docs).
- [ ] **HTTPS** — GitHub Pages provides it; ensure the custom domain is connected in repo **Settings → Pages**.
- [ ] **Env for GH Pages** — If you rely on `VITE_*` at build time, run the build in CI (e.g. GitHub Actions) with secrets and then deploy the `dist/` output.

---

## 10. Optional Polish

- [ ] **404** — If you add a custom 404, keep the same layout and a link back home.
- [ ] **Analytics** — If you use Google Analytics/Plausible/etc., add the script only in `index.html` and avoid `localStorage` for feature flags; use React state or build-time env.
- [ ] **Burgundy CTA** — `.cursorrules` mentions a “CÓMO LLEGAR” in burgundy. To match, you can add a `btn-burgundy` (e.g. `#8B4B5C` fill, cream text) and use it for that button if you want a stronger accent.
- [ ] **EN locale for `og:locale`** — If you expect many English-only guests, add `og:locale:alternate` with `en_US` and/or a language switch that updates `lang` and canonical/OG (advanced).

---

## Quick reference: button classes

```html
<button class="btn-primary">ENVIAR</button>
<button class="btn-secondary">CÓMO LLEGAR</button>
<button class="btn-outline">EN / ES</button>
<button class="btn-ghost">Ver más</button>
<a class="stamp-link" href="/calendar.ics" download>Agregar al calendario</a>
```

Use `disabled` on `btn-primary` for the RSVP submit while sending; the existing `:disabled` styles handle it.

---

*Last note: the site is already in strong shape. This list is for final checks and small refinements before and after sharing with guests.*
