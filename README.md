# ⚽ Cobras 3v3 Tournament AppThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



A lightweight, mobile-first single-page app for managing the Cobras 3v3 soccer tournament.## Getting Started



## FeaturesFirst, run the development server:



✅ **No Authentication** - Perfect for 3-4 concurrent users  ```bash

✅ **Real-time Score Updates** - Synced across all devices via Vercel KV  npm run dev

✅ **Mobile-First Design** - Optimized for phone viewing  # or

✅ **Zero Refresh Required** - All updates happen instantly  yarn dev

✅ **Automatic Standings** - Points calculated as scores are entered  # or

✅ **Auto-generated Finals** - Top 4 teams from standings  pnpm dev

# or

## Stackbun dev

```

- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS

- **Database:** Vercel KV (Redis)Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- **Hosting:** Vercel

- **Config:** YAML (teams.yaml)You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.



## SetupThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.



### Prerequisites## Learn More



- Node.js 20+ (using nvm)To learn more about Next.js, take a look at the following resources:

- npm or yarn

- Vercel account (for deployment)- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

### Local Development

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

```bash

# Use Node 20## Deploy on Vercel

nvm use

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

# Install dependencies

npm installCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create `.env.local`:

```
ADMIN_TOKEN=cobras2025
```

## Tournament Structure

### Matches

**Round 1 (4:40 PM):**
- Field 1: Argentina vs Brazil
- Field 2: England vs France
- Field 3: Germany vs Portugal
- Rest: Spain

**Round 2 (5:05 PM):**
- Field 1: Argentina vs England
- Field 2: Brazil vs Germany
- Field 3: France vs Portugal
- Rest: Spain

**Round 3 (5:20 PM):**
- Field 1: Argentina vs France
- Field 2: Brazil vs Portugal
- Field 3: England vs Germany
- Rest: Spain

**Finals (5:35 PM):**
- Auto-generated based on standings

### Scoring System

- **Win:** 3 points
- **Draw:** 1 point
- **Loss:** 0 points

**Ranking:** Points → Goal Difference → Goals For

## Views

### 🏠 Home
- List of all matches in accordions by round
- Score input with +/- buttons
- Saves scores to Vercel KV in real-time
- Mobile-optimized layout

### 👥 Teams
- All teams with player names
- Pulled from teams.yaml
- Card-based layout

### 📊 Table
- Live standings table
- Top 4 teams advance to finals
- Showing: Rank, Team, Played, Points, GD, GF

## Deployment to Vercel

### 1. Connect to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/cobras.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Select Node.js 20 in build settings
- Click Deploy

### 3. Set up Vercel KV

- In Vercel dashboard, go to Storage → Create Database → KV
- Connect it to your project
- Environment variables will auto-populate

### 4. Add Environment Variables

In Vercel project settings, add:
- `ADMIN_TOKEN=cobras2025`

Your app is now live! 🎉

## Data Storage

- **Match results:** Vercel KV (shared across all devices)
- **Team data:** `public/teams.yaml` (version controlled)
- **UI State:** localStorage (per-device cache)

## Tech Notes

- No backend server needed - all runs in Next.js API routes
- Vercel KV provides real-time sync for multiple users
- localStorage provides instant UI updates (optimistic)
- Teams.yaml can be edited and redeployed to update team info

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── matches/route.ts
│   │   ├── teams/route.ts
│   │   ├── standings/route.ts
│   │   └── admin/reset/route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── views/
│   │   ├── HomeView.tsx
│   │   ├── TeamsView.tsx
│   │   └── TableView.tsx
│   ├── MatchCard.tsx
│   ├── Accordion.tsx
│   └── ui/
│       └── button.tsx
├── hooks/
│   ├── useMatches.ts
│   └── useStandings.ts
├── lib/
│   ├── tournament.ts
│   ├── standings.ts
│   └── kv.ts
└── types/
    └── index.ts

public/
└── teams.yaml
```
