# Quick Start Guide

## 🏁 Before You Start

Make sure you have Node.js 20+ installed via nvm:

```bash
nvm install 20
nvm use 20
```

## 🚀 Development Mode

```bash
cd /Users/joelsteidl/Personal/Sites/cobras

# Install dependencies (if not already done)
npm install

# Start dev server
npm run dev
```

Open http://localhost:3000 in your browser.

## 🎮 Using the App

### Home View 🏠
- **Enter Scores:** Use +/- buttons next to each team
- **Save:** Click "Save Score" button when done
- **Status:** Green checkmark appears when saved

### Teams View 👥
- **View Rosters:** See all 7 teams with player names
- **Edit:** Change team names in `public/teams.yaml` and redeploy

### Table View 📊
- **Live Standings:** Auto-updates as scores are entered
- **Finals:** Top 4 teams shown in yellow section
- **Refresh:** Click "Refresh" button for latest standings

## 🔐 Admin Mode

Access admin features at: `http://localhost:3000?admin=cobras2025`

(Admin panel coming soon - can add more features as needed)

## 📝 Editing Tournament Data

### Change Team Names/Players

Edit `public/teams.yaml`:

```yaml
teams:
  - id: argentina
    name: Argentina  # ← Change team name
    players:
      - name: Lionel Messi  # ← Change player names
      - name: Sergio Agüero
      - name: Juan Román Riquelme
```

Then restart dev server: `npm run dev`

### Add/Remove Teams

Simply add new team to `public/teams.yaml` and redeploy.

## 🌐 Deploying to Vercel

### 1. Create GitHub Repo

```bash
git init
git add .
git commit -m "Initial Cobras app"
git remote add origin https://github.com/YOUR_USERNAME/cobras
git push -u origin main
```

### 2. Deploy to Vercel

- Go to https://vercel.com
- Click "New Project"
- Import GitHub repo
- Click "Deploy"
- ✅ Done!

### 3. Set Environment Variables

In Vercel Dashboard:
- Go to your project
- Settings → Environment Variables
- Add: `ADMIN_TOKEN` = `cobras2025`

### 4. Set Up Vercel KV

- Vercel Dashboard → Storage
- Create Database → KV
- Select your project
- Click Create
- ✅ Auto-connected!

## 📊 Tournament Format

### Times
- Round 1: 4:40 PM
- Round 2: 5:05 PM
- Round 3: 5:20 PM
- Finals: 5:35 PM

### Scoring
- Win: 3 points
- Draw: 1 point
- Loss: 0 points

### Ranking
Points → Goal Difference → Goals For

## 🆘 Troubleshooting

**Q: "Cannot find module" error**
A: Run `npm install` to install dependencies

**Q: Port 3000 already in use**
A: Run on different port: `npm run dev -- -p 3001`

**Q: Scores not syncing between devices**
A: Deployment only - works automatically on Vercel with KV

**Q: Teams not updating after edit**
A: Restart dev server: Ctrl+C then `npm run dev`

## 🎯 Key Features

- ✅ No authentication needed
- ✅ No page refreshes
- ✅ Real-time sync via Vercel KV
- ✅ Mobile-first design
- ✅ Lightweight (~100KB)
- ✅ Works offline (cached locally)

## 📞 Need Help?

Check files:
- `README.md` - Full documentation
- `BUILD_SUMMARY.md` - What was built
- `src/` - Source code

---

**Happy Tournament! 🎉⚽**
