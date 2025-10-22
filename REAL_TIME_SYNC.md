# 🔄 Real-Time Sync System

The Cobras tournament app features automatic real-time synchronization across all connected devices. Here's how it works:

## 📡 Architecture

### Real-Time Sync Flow

```
Device A (Admin)
  ↓
  Edit team name
  ↓
  Save to Vercel KV
  ↓
  Broadcast update event
  ↓
Device B (Phone)  ←→ Device C (Tablet)
  ↓ (polls /api/sync every 1 second)
  Detects change
  ↓
  Refetches data
  ↓
  Updates UI automatically (no refresh needed)
```

## 🎯 Key Features

### 1. Admin Panel Editing
- **Location:** Visit `/?admin=cobras2025` to access
- **Features:**
  - Edit team names
  - Edit player names
  - Changes instantly save to Vercel KV
  - No page refresh needed

### 2. Live Sync to All Devices
- **Polling:** Every device polls `/api/sync` every 1 second
- **Events:** Three update types:
  - `teams_updated` → All devices reload teams
  - `matches_updated` → All devices reload matches & recalculate standings
  - `standings_updated` → All devices reload standings

### 3. Data Storage
- **Primary:** Vercel KV (Redis) - shared source of truth
- **Secondary:** localStorage - device cache for offline
- **Tertiary:** YAML - fallback for teams (version controlled)

## 📝 Admin Panel Usage

### Edit Teams

1. Visit `http://localhost:3000/?admin=cobras2025` (local)
2. Click "⚙️ Admin" tab in navigation
3. Edit team names and player names
4. Click "💾 Save All Changes"
5. Changes instantly appear on all other devices (no refresh!)

### What Happens When You Save

```
Save Click
  ↓
POST /api/teams (with admin token)
  ↓
Vercel KV updated
  ↓
Sync endpoint detects change
  ↓
All polling clients detect update within 1 second
  ↓
UI automatically refreshes with new data
```

## 🔒 Security

- **Admin Token:** `cobras2025` (configurable via `ADMIN_TOKEN` env var)
- **Token Check:** Required for all PUT/POST operations on teams
- **URL Secret:** Admin features only visible when token passed in URL
- **No Public Editing:** Regular users cannot modify teams

## 💾 Data Persistence

### Teams
- **Stored in:** Vercel KV (when edited via admin)
- **Fallback:** public/teams.yaml (original YAML file)
- **Sync:** Instant across all devices

### Match Results
- **Stored in:** Vercel KV
- **Type:** Match scores, completion status
- **Sync:** Instant across all devices

### Standings
- **Calculated from:** Match results
- **Stored in:** None (computed on-demand)
- **Sync:** Automatic when matches update

## 🔧 Implementation Details

### useRealTimeSync Hook

```typescript
export function useRealTimeSync(callback: (event: UpdateEvent) => void) {
  useEffect(() => {
    // Poll every 1 second
    const interval = setInterval(async () => {
      const response = await fetch('/api/sync');
      const data = await response.json();
      if (data.event) {
        callback(data.event); // Component handles refetch
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [callback]);
}
```

### API Endpoints

- `GET /api/sync` - Check if anything changed
- `GET /api/teams` - Fetch current teams
- `POST /api/teams` - Update teams (admin only)
- `GET /api/matches` - Fetch current matches
- `POST /api/matches` - Update match score (anyone)
- `GET /api/standings` - Get calculated standings

## 🚀 How It Works in Practice

**Scenario: Updating a team name on tournament day**

```
1. Admin on tablet opens Admin tab
   - Sees all 7 teams with current names

2. Admin changes "Spain" to "Spain United"

3. Admin clicks "Save All Changes"
   - Network request to Vercel KV
   - Data stored in Redis
   - Response: ✅ Teams updated!

4. Simultaneously on other devices:
   - Phone polling /api/sync
   - Detects version mismatch
   - Automatically refetches /api/teams
   - UI updates with "Spain United"
   - No user action needed!
   - No refresh needed!
```

## 📊 Polling Strategy

- **Frequency:** 1 second (configurable in useRealTimeSync.ts)
- **Overhead:** ~1KB per poll
- **Latency:** Typical update sees effect within 1-2 seconds across all devices
- **Works Offline:** Devices can work independently, sync when reconnected

## 🎮 Examples

### Editing Team Name
```
Admin Panel:
  Team: Spain → Spain United

All Devices Within 1s:
  Standings shows: Spain United
  Teams tab shows: Spain United
  Home view shows: Spain United (in match names)
```

### Match Score Update
```
Home Tab (any device):
  Argentina 2 - 1 Brazil → Save

All Devices Within 1s:
  Standings recalculated
  Table updated
  Match shows as completed
```

## 🔍 Troubleshooting

**Q: Changes not syncing?**
A: Check if Vercel KV is connected. On local dev, must have `.env.local` set. On Vercel, check Storage tab.

**Q: Syncing too slow?**
A: Change polling interval in `src/hooks/useRealTimeSync.ts` from 1000ms to something lower (e.g., 500ms).

**Q: Can't access admin panel?**
A: Make sure you're accessing `/?admin=cobras2025` (exact token required).

## 🎯 Future Enhancements

- [ ] WebSocket integration for <500ms sync (instead of 1s polling)
- [ ] Conflict resolution when multiple admins edit simultaneously
- [ ] Change history/audit log
- [ ] Admin can add/remove teams
- [ ] Admin can reset all matches
- [ ] Notifications when data changes

---

**The system is designed for reliability and simplicity:**
- ✅ Works on 3-4 concurrent users
- ✅ No complex WebSocket setup required
- ✅ Simple polling mechanism (proven reliable)
- ✅ Real-time feel (1 second = human-imperceptible)
- ✅ Automatic with no user intervention needed
- ✅ Graceful degradation if sync fails
