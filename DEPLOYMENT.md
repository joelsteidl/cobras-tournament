# Deployment Guide - Cobras Tournament App

## Pre-Deployment Checklist

✅ All completed:
- [x] Next.js project initialized with all dependencies
- [x] Real team and player data loaded (`public/teams.yaml`)
- [x] Match schedule logic implemented (3 rounds + Finals)
- [x] Vercel KV API endpoints configured
- [x] All views built (Home, Teams, Table, Admin)
- [x] Real-time sync system implemented (1-second polling)
- [x] Reset functionality added
- [x] Code committed to Git (`3c2c95c`)

## Step-by-Step Deployment

### 1. Verify Git Push
```bash
cd /Users/joelsteidl/Personal/Sites/cobras
git remote -v  # Should show: origin git@github.com:joelsteidl/cobras-tournament.git
git push -u origin main
```

**Expected Output:**
```
Enumerating objects: 46, done.
Counting objects: 100% (46/46), done.
...
To github.com:joelsteidl/cobras-tournament.git
 * [new branch]      main -> main
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
npm i -g vercel  # Install Vercel CLI if needed
vercel --prod
```

#### Option B: Using Vercel Web Dashboard
1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Search for **"cobras-tournament"**
5. Click **"Import"**
6. Vercel will auto-detect Next.js + Node 20 from `.nvmrc`
7. Click **"Deploy"**

### 3. Configure Upstash Redis Database

1. Go to https://upstash.com (free account)
2. Create a new Redis database
3. Copy your credentials:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

4. In Vercel project settings, go to **"Environment Variables"**
5. Add these variables for Production:
   - **Name**: `UPSTASH_REDIS_REST_URL`
   - **Value**: Your URL from Upstash
   - **Name**: `UPSTASH_REDIS_REST_TOKEN`
   - **Value**: Your token from Upstash

### 4. Add Admin Token Environment Variable

1. In Vercel project settings, go to **"Environment Variables"**
2. Add new variable:
   - **Name**: `ADMIN_TOKEN`
   - **Value**: `cobras2025`
   - **Environment**: Production

3. Click **"Save"** and proceed to redeploy

### 5. Redeploy with Environment Variables

```bash
vercel --prod  # If using CLI
```

Or in web dashboard:
- Click **"Deployments"**
- Find the latest deployment
- Click **"..."** → **"Redeploy"**

## Verification Steps

### Test 1: Check App is Live
Visit your deployment URL (appears in Vercel dashboard):
```
https://cobras-tournament.vercel.app
```

You should see:
- ✅ 🏠 Home tab with 7 teams and 3 rounds
- ✅ 👥 Teams tab showing all players
- ✅ 📊 Table tab with empty standings
- ✅ Fixed bottom navigation

### Test 2: Access Admin Panel
Visit with admin token:
```
https://cobras-tournament.vercel.app/?admin=cobras2025
```

You should see:
- ✅ ⚙️ Admin tab appears in navigation
- ✅ Team/player edit inputs visible
- ✅ 💾 Save All Changes button
- ✅ 🔄 Reset All Matches button

### Test 3: Enter a Match Score
1. Click 🏠 **Home**
2. Click on **Round 1** accordion
3. Click **+** next to first match to increment scores
4. Check 📊 **Table** tab - standings should auto-calculate
5. Verify Points, Goal Difference, and Goals For appear

### Test 4: Real-Time Sync
1. Open app in two browser tabs/windows
2. Enter score in Tab 1
3. **Within 1 second**, Tab 2 should show the same score
4. No page refresh needed

### Test 5: Reset Feature
1. Click ⚙️ **Admin**
2. Click 🔄 **Reset All Matches**
3. Confirm the warning dialog
4. Check 🏠 **Home** - all scores should be 0-0
5. Check 📊 **Table** - standings should be empty

## Deployment URL

Once deployed, your app will be available at:
```
https://cobras-tournament.vercel.app
```

Share this link with your 3-4 users - they don't need any setup!

## Environment Summary

**Production (Vercel):**
```
Framework: Next.js 16.0.0
Node Version: 20 (from .nvmrc)
Database: Upstash Redis (free tier)
Auth: Admin token in URL query param
Sync: 1-second polling
```

## Troubleshooting

### App shows "Failed to load matches"
- Check Upstash Redis connection in environment variables
- Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set
- Test connection at https://upstash.com (Dashboard → your database)
- Restart deployment

### Admin panel not showing
- Ensure URL has `?admin=cobras2025`
- Check browser console for errors
- Verify `ADMIN_TOKEN` env var is set to `cobras2025`

### Real-time sync not working
- Verify `/api/sync` endpoint responds
- Check browser's Network tab for polling requests
- Ensure polling interval is 1 second

### Teams data not loading
- Verify `public/teams.yaml` was deployed
- Check `/api/teams` returns JSON
- Teams should have 7 entries with 3 players each

### Redis connection error
- Verify credentials are correct in Vercel env vars
- Check Upstash dashboard for database status
- Ensure database is in "Running" state

## Post-Deployment

### 1. Create Shareable Link
Give users this URL to access the app:
```
https://cobras-tournament.vercel.app
```

### 2. Share Admin Link
Only give tournament admin this URL:
```
https://cobras-tournament.vercel.app/?admin=cobras2025
```

### 3. Monitor Performance
- Vercel dashboard shows analytics
- Check deployment logs for errors
- Monitor Redis database usage in Upstash dashboard

### 4. Backup Strategy
- GitHub automatically backs up all code
- Match data is in Upstash Redis (managed backup)
- No additional action needed

## Next Steps

After deployment:
1. ✅ Test with actual users during tournament
2. ✅ Monitor real-time sync performance
3. ✅ Use Reset feature between test runs
4. ✅ Share feedback for any improvements

## Support

For issues:
1. Check Vercel deployment logs
2. Review browser console errors
3. Verify all environment variables are set
4. Test locally: `npm run dev`
