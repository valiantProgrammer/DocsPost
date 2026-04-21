# Analytics Database: Diagnostic & Repair Guide

## Quick Start: Verify Your Schema

### Step 1: Check What's In Your Database

```bash
# See all documents in collection
curl http://localhost:3000/api/analytics/check-schema

# See specific user's document
curl "http://localhost:3000/api/analytics/check-schema?email=YOUR_EMAIL@example.com"
```

**Expected Output:**
```
✓ Document exists with proper schema
  - daily: 1 intervals, 1 views
  - monthly: 1 intervals, 1 views
  - quarterly: 1 intervals, 1 views
  - yearly: 1 intervals, 1 views
```

---

## Issues & Solutions

### ❌ Issue 1: "Document not found"

```json
{
  "found": false,
  "message": "No document found for user@example.com"
}
```

**Cause:** No analytics logged yet

**Solution:**
1. Make sure you're logged in (email in Local Storage)
2. View a document
3. Check again: `curl http://localhost:3000/api/analytics/check-schema?email=your@email.com`

---

### ❌ Issue 2: "Document missing timeframe fields"

Example of **BAD** document:
```javascript
{
  userEmail: "user@example.com",
  // Missing: daily, monthly, quarterly, yearly
  // Missing: summary
}
```

**Solution:**
1. Delete bad documents:
   ```bash
   # Using MongoDB (if you have access):
   db.analytics_optimized.deleteMany({ daily: { $exists: false } })
   ```

2. Let new documents be created by logging views:
   ```bash
   curl -X POST http://localhost:3000/api/docs/log-view-optimized \
     -H "Content-Type: application/json" \
     -d '{"docId":"test-doc","userEmail":"your@email.com"}'
   ```

3. Verify the new document:
   ```bash
   curl "http://localhost:3000/api/analytics/check-schema?email=your@example.com"
   ```

---

### ❌ Issue 3: "Intervals array is empty or missing"

Example of **BAD** document:
```javascript
{
  userEmail: "user@example.com",
  daily: {
    // Missing or empty: intervals
    totalViews: 5,
    totalVotes: 0
  }
}
```

**Solution:** Same as Issue 2 - delete and recreate

---

### ❌ Issue 4: "Dashboard shows no data despite documents existing"

**Check:**
1. Document structure is correct:
   ```bash
   curl "http://localhost:3000/api/analytics/check-schema?email=your@email.com"
   ```
   Should show: `"status": "✓ Document exists with proper schema"`

2. API returns data:
   ```bash
   curl "http://localhost:3000/api/analytics/get-stats-optimized?email=your@example.com&timeframe=daily"
   ```
   Should return non-empty `viewStats` array

3. Dashboard is using correct endpoint:
   - Check DevTools Network tab
   - Should see: `GET /api/analytics/get-stats-optimized?email=...&timeframe=daily`
   - NOT: `/api/analytics/get-stats` (old endpoint)

4. Refresh dashboard:
   - Press Ctrl+R
   - Wait 2-3 seconds
   - Charts should appear

---

## What the Fixed Implementation Does

### Before (Problem)
```
First view attempt:
  ├─ Try to update document (document doesn't exist)
  ├─ Fails (upsert: false)
  ├─ Then insert new document
  └─ Complex logic, multiple DB operations

Result: Could fail if insert happens but update doesn't complete
```

### After (Fixed)
```
Every view:
  ├─ Try to update existing interval
  │  ├─ If exists: increment views, apply sliding window ✓
  │  └─ If not exists: continue...
  ├─ Use upsert to create document (if needed) + add interval
  │  ├─ If document exists: add interval to correct timeframe
  │  ├─ If document doesn't exist: create with complete schema
  │  └─ Apply sliding window
  └─ Simple, reliable, one operation per timeframe

Result: Always creates proper schema, no edge cases
```

---

## Complete Diagnostic Checklist

Run through each step and check the results:

### 1. ✓ Check Email Logged In
```bash
# Open DevTools Console (F12)
localStorage.getItem('docspost-email')

# Should return your email, e.g., "user@example.com"
```

### 2. ✓ Initialize Database
```bash
curl -X POST http://localhost:3000/api/db/init-indexes \
  -H "Authorization: Bearer dev-secret"

# Should return: "success": true
```

### 3. ✓ Check Collection Status
```bash
curl http://localhost:3000/api/analytics/check-schema

# Should return list of documents (if any exist)
```

### 4. ✓ Log a Test View
```bash
curl -X POST http://localhost:3000/api/docs/log-view-optimized \
  -H "Content-Type: application/json" \
  -d '{"docId":"test-article","userEmail":"your@example.com"}'

# Should return: "success": true, "message": "View logged successfully"
```

### 5. ✓ Check Document Was Created
```bash
curl "http://localhost:3000/api/analytics/check-schema?email=your@example.com"

# Should show:
# "found": true
# "schema": { "daily": { "exists": true, ... } }
# "status": "✓ Document exists with proper schema"
```

### 6. ✓ Fetch Stats
```bash
curl "http://localhost:3000/api/analytics/get-stats-optimized?email=your@example.com&timeframe=daily"

# Should return data in viewStats array
```

### 7. ✓ Open Dashboard
- Go to `/dashboard`
- Should see charts with your data

---

## If Something Still Doesn't Work

### Step A: Clear All Data & Start Fresh
```bash
# Using MongoDB (if you have access):
db.analytics_optimized.deleteMany({})
db.analytics.deleteMany({})

# Then:
# 1. Refresh dashboard
# 2. View 3+ documents
# 3. Check schema: curl http://localhost:3000/api/analytics/check-schema
# 4. Check stats: curl http://localhost:3000/api/analytics/get-stats-optimized?email=your@example.com&timeframe=daily
```

### Step B: Restart Everything
```bash
# 1. Stop dev server (Ctrl+C in terminal)
# 2. Clear next.js cache:
rm -rf .next

# 3. Restart:
npm run dev

# 4. Wait 5-10 seconds for server to start
# 5. Try again
```

### Step C: Check Error Logs
```bash
# In the terminal where npm run dev is running
# Look for any [View Logged] or error messages

# Or in Browser DevTools (F12):
# Console tab for any fetch errors
# Network tab to see API responses
```

---

## Key Implementation Changes

### log-view-optimized/route.js

**Key change: Using `upsert: true`**

```javascript
// OLD: Try to create document manually
if (updateResult.matchedCount === 0) {
    console.log(`Creating new document for user: ${userEmail}`);
    const newDoc = { /* complex structure */ };
    await collection.insertOne(newDoc);
}

// NEW: Let MongoDB handle it with upsert
await collection.updateOne(
    { userEmail },
    {
        $push: { [`${timeframe}.intervals`]: newInterval },
        $inc: { [`${timeframe}.totalViews`]: 1 },
        $setOnInsert: { /* complete schema */ }  // ← Initialized on first upsert
    },
    { upsert: true }  // ← Creates document if doesn't exist
);
```

**Benefits:**
- Simpler code (no conditional logic)
- Guaranteed document creation
- Atomic operation (safer)
- Always proper schema

---

## Performance Impact

| Operation | Before | After | Change |
|-----------|--------|-------|--------|
| First view (new user) | 3 DB ops (try update, insert) | 2 DB ops (upsert, sliding window) | ✓ Faster |
| Nth view (existing) | 2-4 DB ops (update, sliding window) | 2 DB ops (update, sliding window) | ≈ Same |
| Reliability | Good (but edge cases) | Excellent (no edge cases) | ✓ Better |
| Code complexity | High (condition branches) | Low (simple upsert flow) | ✓ Simpler |

---

## When Everything Works

You'll see:

✅ Views being logged:
```
POST /api/docs/log-view-optimized → 200 OK
```

✅ Documents in database:
```
curl http://localhost:3000/api/analytics/check-schema
→ Returns documents with proper schema
```

✅ Stats available:
```
curl http://localhost:3000/api/analytics/get-stats-optimized?email=...&timeframe=daily
→ Returns viewStats array with data
```

✅ Dashboard showing data:
```
/dashboard → Charts display with views/trends/engagement
```

---

## Final Verification Command

**Run this ONE command to verify everything:**

```bash
# Replace YOUR_EMAIL with your actual email
curl -X POST http://localhost:3000/api/docs/log-view-optimized \
  -H "Content-Type: application/json" \
  -d '{"docId":"verify-test","userEmail":"YOUR_EMAIL"}' && \
sleep 1 && \
curl "http://localhost:3000/api/analytics/check-schema?email=YOUR_EMAIL" && \
sleep 1 && \
curl "http://localhost:3000/api/analytics/get-stats-optimized?email=YOUR_EMAIL&timeframe=daily"
```

**Expected result:**
- First curl: `"success": true`
- Second curl: `"found": true` and `"status": "✓ Document exists"`
- Third curl: `viewStats` array with data

If all three succeed, your analytics are working perfectly! 🎉

---

## Still Having Issues?

1. **Verify** using commands above
2. **Check** schema with `/api/analytics/check-schema`
3. **Delete** bad documents if needed
4. **Restart** dev server
5. **Clear** cache (Ctrl+Shift+Delete)
6. **Test** again

The new implementation should resolve all schema-related issues!
