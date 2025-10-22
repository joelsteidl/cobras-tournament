# Reset Feature Guide

## Overview

The Cobras tournament app now includes a **Reset All Matches** feature in the admin panel, allowing you to clear all match scores for testing purposes.

## How to Access

1. Add the admin token to the URL: `/?admin=cobras2025`
2. Navigate to the **⚙️ Admin** tab (appears when authenticated)
3. Scroll to the bottom to find the **🔄 Reset All Matches** button

## How to Use

### Step 1: Click Reset Button
Click the orange **🔄 Reset All Matches** button.

### Step 2: Confirm
A confirmation dialog will appear with the warning: "⚠️ Are you sure? This will clear all match scores."

- **Yes, Reset** - Clears all match results instantly
- **Cancel** - Returns to the normal admin panel

### Step 3: Real-Time Sync
Once confirmed:
- ✅ All matches are cleared on the server (Vercel KV)
- ✅ Changes sync to all devices within 1 second (polling)
- ✅ No page refresh needed
- ✅ All users see the update automatically

## Technical Details

### Endpoint
- **URL**: `POST /api/admin/reset`
- **Auth**: Requires `x-admin-token: cobras2025` header
- **Response**: `{ "success": true }`

### AdminView Implementation
```typescript
const resetAllMatches = async () => {
  try {
    setResetting(true);
    const response = await fetch('/api/admin/reset', {
      method: 'POST',
      headers: {
        'x-admin-token': 'cobras2025',
      },
    });
    
    if (!response.ok) throw new Error('Failed to reset matches');
    setSuccess('✅ All matches reset! Changes synced to all devices.');
    setShowResetConfirm(false);
    setTimeout(() => setSuccess(''), 3000);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to reset');
  } finally {
    setResetting(false);
  }
};
```

### Verification
- `npm run build` - Successfully builds with zero errors
- No TypeScript compilation errors
- All real-time sync hooks intact

## Reset Data Structure

When reset is called:
1. The match state in Vercel KV (`cobras:tournament:state`) is cleared
2. The standings are automatically recalculated as empty
3. All views (Home, Teams, Table) refresh within 1 second
4. Teams/players remain unchanged (only match scores are reset)

## Security

- Admin token required: `cobras2025`
- Token validated on server-side before execution
- No public access to reset endpoint
- Only accessible through authenticated admin panel

## Testing Checklist

- [ ] Visit `/?admin=cobras2025`
- [ ] Click **Reset All Matches** button
- [ ] Click **Yes, Reset** in confirmation dialog
- [ ] Verify "All matches reset!" message appears
- [ ] Check Home tab - all scores should be 0-0
- [ ] Check Table tab - all standings should be empty
- [ ] Open app on another device/browser
- [ ] Verify reset synced to second device within 1 second

## Troubleshooting

**Button not showing?**
- Ensure URL includes `?admin=cobras2025`
- Check browser console for errors

**Reset fails with error?**
- Verify ADMIN_TOKEN env var is set to `cobras2025`
- Check that Vercel KV is properly connected
- Look at server logs for error details

**Changes not syncing to other devices?**
- Check that real-time polling is working (useRealTimeSync)
- Verify `/api/sync` endpoint is responding
- Wait up to 2 seconds for next poll cycle

## Future Improvements

Potential additions:
- Reset individual matches instead of all
- Reset standings only (keep matches)
- Reset teams/players with confirmation
- Backup/restore snapshots
- Audit log of resets
