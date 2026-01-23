## Wedding Website - Deyaneira & Aaron

Modern tropical-elegant wedding website inspired by the original Canva flyer.

### Tech Stack
- Vite + React + TypeScript
- Tailwind CSS
- Framer Motion
- Google Forms for RSVP submissions

### Local Development
1. Install dependencies:
   - `npm install`
2. Create a `.env` file using `.env.example`.
3. Start dev server:
   - `npm run dev`

### Environment Variables
Copy `.env.example` to `.env` and fill in your Google Form values:
```
VITE_GOOGLE_FORM_ACTION=https://docs.google.com/forms/d/e/FORM_ID/formResponse
VITE_GOOGLE_FORM_ENTRY_NAME=entry.123456789
VITE_GOOGLE_FORM_ENTRY_ATTENDANCE=entry.234567890
VITE_GOOGLE_FORM_ENTRY_GUESTS=entry.345678901
VITE_GOOGLE_FORM_ENTRY_SONG=entry.456789012
```

### Google Forms Setup (RSVP)
See `docs/GOOGLE_FORMS_SETUP.md` for step-by-step instructions.

### Deploy to GitHub Pages
This project uses the `gh-pages` package:
1. Build:
   - `npm run build`
2. Deploy:
   - `npm run deploy`

If you use a custom domain, ensure `public/CNAME` is set.

### Deploy to Vercel (Optional)
1. Import the repo in Vercel.
2. Set the same environment variables in Vercel.
3. Build command: `npm run build`
4. Output directory: `dist`
