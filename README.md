<p align="center">
  <img src="public/images/project_logo.png" alt="Deyaneira & Aaron" width="400" />
</p>

<h1 align="center">Deyaneira & Aaron</h1>

<p align="center">
  <strong>A destination wedding invitation website for a celebration in Puerto Rico</strong>
</p>

<p align="center">
  <em>July 18, 2026 · Aguadilla, Puerto Rico</em>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#deployment">Deployment</a>
</p>

---

## About

This is a modern, elegant wedding invitation website built with love for Deyaneira & Aaron's destination wedding in Puerto Rico. The design draws inspiration from tropical sophistication—think warm sunset tones, watercolor florals, and the nostalgic aesthetic of Bad Bunny's "Debí Tirar Más Fotos" era.

The site evolves through three states:
- **Before the wedding**: Full invitation with RSVP, event details, travel tips, and gift registry
- **During the wedding**: A live celebration message for guests
- **After the wedding**: Thank you message and photo gallery managed via Notion

## Features

### Interactive Envelope Opening
A cinematic opening animation where guests "open" a wedding envelope to reveal the invitation. The animation respects `prefers-reduced-motion` for accessibility.

### Bilingual Support
Full Spanish and English translations with a single click. Content from Notion is automatically translated using the MyMemory API.

### Smart RSVP System
- Server-side duplicate prevention using Upstash Redis
- Submissions stored in Google Sheets
- Spotify playlist integration—after submitting, guests see a button to the wedding playlist

### Dynamic Content via Notion
The couple can update their thank-you message and photo gallery directly from Notion without touching any code:
- Rich text support (bold, italic, links, emojis)
- Embedded images with captions
- Automatic translation to English

### Tropical-Elegant Design
- Custom color palette inspired by Puerto Rican sunsets
- Watercolor floral accents (hibiscus, bird of paradise)
- Smooth animations powered by Framer Motion
- Mobile-first responsive design

### Travel & Logistics
- Direct flight booking links (JetBlue, Skyscanner)
- Local restaurant and beach recommendations
- Interactive Google Maps integration
- Add-to-calendar functionality

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Hosting | [Vercel](https://vercel.com/) |
| Database | [Upstash Redis](https://upstash.com/) (RSVP tracking) |
| CMS | [Notion API](https://developers.notion.com/) (photo gallery & messages) |
| Forms | Google Forms + Google Sheets |
| Translation | MyMemory API |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/boda-deyaneira-aaron.git
cd boda-deyaneira-aaron

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with the following:

```env
# Google Forms (RSVP)
VITE_GOOGLE_FORM_ACTION=https://docs.google.com/forms/d/e/.../formResponse
VITE_GOOGLE_FORM_ENTRY_NAME=entry.123456789
VITE_GOOGLE_FORM_ENTRY_ATTENDANCE=entry.234567890
VITE_GOOGLE_FORM_ENTRY_GUESTS=entry.345678901
VITE_GOOGLE_FORM_ENTRY_SONG=entry.456789012

# Notion (After-wedding gallery)
NOTION_API_KEY=secret_...
NOTION_PAGE_ID=...
NOTION_DATABASE_ID=...

# Upstash Redis (RSVP duplicate prevention)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# Spotify Playlist
VITE_SPOTIFY_PLAYLIST_URL=https://open.spotify.com/playlist/...

# Optional: Higher translation limits
MYMEMORY_EMAIL=your@email.com

# Development: Override event state (before/during/after)
# VITE_OVERRIDE_EVENT_STATE=after
```

## Deployment

### Vercel (Recommended)

1. Import the repository in [Vercel](https://vercel.com/)
2. Add all environment variables in Settings → Environment Variables
3. Deploy automatically on push to `main`

The site uses Vercel serverless functions for:
- `/api/notion` — Fetch gallery content from Notion
- `/api/rsvp` — RSVP duplicate checking with Redis
- `/api/translate` — Automatic message translation

### Custom Domain

Configure your domain in Vercel and update the `CNAME` file if needed.

## Documentation

- [`docs/GOOGLE_FORMS_SETUP.md`](docs/GOOGLE_FORMS_SETUP.md) — Setting up Google Forms for RSVP
- [`docs/NOTION_SETUP.md`](docs/NOTION_SETUP.md) — Configuring Notion for the photo gallery
- [`docs/MAKING_IT_PERFECT.md`](docs/MAKING_IT_PERFECT.md) — Design guidelines and polish tips

## Project Structure

```
├── api/                    # Vercel serverless functions
│   ├── notion.ts          # Fetch Notion content
│   ├── rsvp.ts            # RSVP duplicate prevention
│   └── translate.ts       # Translation API
├── public/
│   ├── audio/             # Background music
│   └── images/            # Static images
├── src/
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript definitions
│   ├── App.tsx            # Main application
│   └── style.css          # Tailwind + custom styles
└── docs/                  # Documentation
```

## License

This project is private and built specifically for Deyaneira & Aaron's wedding.

---

<p align="center">
  Made with 🤍 in Puerto Rico
</p>

<p align="center">
  <a href="https://alexberrios.com">alexberrios.com</a>
</p>
