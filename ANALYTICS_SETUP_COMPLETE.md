# Analytics Dashboard - Complete Setup & Troubleshooting

## Why Your Analytics Dashboard Isn't Showing Data

Your analytics dashboard might appear empty for one of these reasons:

1. **❌ Email not logged in** - No email saved in Local Storage
2. **❌ Views not being logged** - Documents viewed but data not saved
3. **❌ Database indexes not created** - Analytics collection not optimized
4. **❌ Dashboard using old endpoint** - Fixed! Now uses new optimized endpoint
5. **❌ No data yet** - Perfectly normal on first load

---

## ✅ Complete Setup Solution

### Phase 1: Verify Login (2 minutes)

**Step 1.1: Check if you're logged in**

```
Open your app home page
Look for: Your email displayed in profile/header
```

**If email is NOT showing:**
1. Click **Sign In / Login**
2. Enter your email address
3. Complete authentication
4. Page should show your email

**Step 1.2: Verify email saved in browser**

```
Press F12 → Application → Local Storage
Find key: docspost-email
Value: Should be YOUR_EMAIL@example.com
```

**If not found:**
- Sign in again
- Check if browser allows Local Storage
- Disable browser extensions that might block storage

---

### Phase 2: Initialize Database (1 minute)

**Why:** Creates indexes for fast analytics queries

**Step 2.1: Run initialization API**

**Using Terminal/PowerShell:**
```bash
# Windows PowerShell
curl -X POST http://localhost:3000/api/db/init-indexes `
  -H "Authorization: Bearer dev-secret" `
  -H "Content-Type: application/json"

# Or use cmd.exe (Windows Command Prompt):
powershell -Command "Invoke-WebRequest -Uri 'http://localhost:3000/api/db/init-indexes' -Method Post -Headers @{'Authorization'='Bearer dev-secret'}"
```

**Using Browser DevTools Console:**
```javascript
fetch('/api/db/init-indexes', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer dev-secret' }
})
.then(r => r.json())
.then(d => console.log(JSON.stringify(d, null, 2)))
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Database indexes initialized successfully",
  "indexes": [
    "users.username (unique, case-insensitive)",
    "users.email (unique, case-insensitive)",
    "tempusers.username (unique, case-insensitive)",
    "tempusers.email (unique, case-insensitive)",
    "tempusers.otpExpiresAt (TTL index)",
    "analytics_optimized.userEmail (lookup)",
    "analytics_optimized.updatedAt (recent activity)",
    "analytics_optimized.summary.allTimeViews (reports)"
  ]
}
```

✅ **Success indicators:**
- Status 200 OK
- `success: true` in response
- Lists analytics_optimized indexes

---

### Phase 3: Log View Data (2 minutes)

**Why:** Create sample analytics data to display

**Step 3.1: View documents in your app**

```
1. Go to your dashboard/home page
2. Find 3-5 documents you created
3. Click each one to view
4. Wait 2-3 seconds between views
```

**Step 3.2: Verify views are being logged**

**In DevTools Console:**
```
Press F12 → Console tab
Look for: [View Logged] DocID: ...
Should show multiple entries
```

**If you see errors:**
```
404 /api/docs/log-view-optimized
→ Restart dev server: npm run dev

Network error connecting
→ Check if server is running: npm run dev
```

**Step 3.3: Check database for analytics**

**Using MongoDB Compass (if you have it):**
1. Connect to your MongoDB
2. Select database: `DocsPost`
3. Navigate to collection: `analytics_optimized`
4. Should see 1+ documents

**Document structure should look like:**
```javascript
{
  "_id": ObjectId(...),
  "userEmail": "your@email.com",
  "updatedAt": ISODate(...),
  "daily": {
    "intervals": [
      { "intervalId": "2026-04-20", "views": 3, ... }
    ]
  },
  "summary": {
    "allTimeViews": 3,
    ...
  }
}
```

---

### Phase 4: Verify API Endpoint (1 minute)

**Why:** Confirm the backend is returning data correctly

**Step 4.1: Test API directly**

```
Replace YOUR_EMAIL with your actual email address

Open in browser (or use curl):
http://localhost:3000/api/analytics/get-stats-optimized?email=YOUR_EMAIL@example.com&timeframe=daily
```

**Example with actual email:**
```
http://localhost:3000/api/analytics/get-stats-optimized?email=rupayandey134@gmail.com&timeframe=daily
```

**Expected Response (after viewing documents):**
```json
{
  "success": true,
  "timeframe": "daily",
  "viewStats": [
    {
      "_id": "2026-04-20",
      "views": 3,
      "articles": ["slug-1", "slug-2", "slug-3"]
    }
  ],
  "voteStats": [],
  "articleStats": [
    {
      "articleId": "slug-1",
      "title": "Article Title",
      "views": 1,
      "votes": 0
    }
  ],
  "summary": {
    "allTimeViews": 3,
    "allTimeVotes": 0,
    "topArticles": [
      {"articleId": "slug-1", "title": "Article Title", "views": 1, "votes": 0}
    ],
    "activeArticles": 3
  }
}
```

**If `viewStats` is empty:**
- Views not logged yet
- Check Local Storage email matches
- Go back to Phase 3

---

### Phase 5: View Dashboard (1 minute)

**Step 5.1: Open your analytics dashboard**

```
Navigate to: /dashboard (or your analytics page)
Look for: "Track your content performance" heading
```

**Step 5.2: Observe the charts**

You should see:
- ✓ **Page Views** (bar chart)
- ✓ **Trend Deviation** (line chart) 
- ✓ **Engagement Analytics** (pie chart)
- ✓ **Article Performance** (data table)

**Step 5.3: Test timeframe switching**

Click buttons:
- **Daily** → Shows last 30 days
- **Monthly** → Shows last 36 months
- **Quarterly** → Shows last 28 quarters
- **Yearly** → Shows last 20 years

Charts should update with different data for each timeframe.

**Step 5.4: If still blank**

```
1. Refresh page: Ctrl+R
2. Check Console: F12 → Console
3. Look for errors
4. Verify email in Local Storage matches API calls
5. Try different email? (if you have multiple accounts)
```

---

## 📋 Troubleshooting Decision Tree

```
Dashboard blank?
│
├─ Email not in Local Storage?
│  └─ FIX: Sign in again, check Local Storage
│
├─ Views logged but API returns empty viewStats?
│  └─ FIX: Check email matches EXACTLY (case-sensitive)
│
├─ API returns data but dashboard still blank?
│  └─ FIX: Refresh page, clear cache, restart server
│
├─ Indexes failed to create?
│  └─ FIX: Check MONGODB_URI environment variable
│
├─ POST /api/docs/log-view-optimized returns 404?
│  └─ FIX: Ensure dev server running (npm run dev)
│
└─ Everything works but data looks old?
   └─ FIX: This is sliding window - data older than limits removed
   
```

---

## 🔧 Quick Restart Guide

**If something isn't working, try this:**

### 1. Stop the server
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill it
kill -9 <PID>  # macOS/Linux  
taskkill /PID <PID> /F  # Windows
```

### 2. Clear Next.js cache
```bash
rm -rf .next/  # Remove Next.js cache
rm -rf node_modules/.cache  # Remove npm cache
```

### 3. Reinstall and restart
```bash
npm install  # Fresh install
npm run dev  # Restart dev server
```

### 4. Verify endpoints
```bash
# In browser console
fetch('http://localhost:3000/api/analytics/get-stats-optimized?email=test@example.com&timeframe=daily')
  .then(r => r.json())
  .then(d => console.log(d))
```

---

## 📊 Data Retention (Sliding Window)

**Don't worry if old data disappears!**

Maximum data retained:
- **Daily:** Last 30 days
- **Monthly:** Last 36 months (3 years)
- **Quarterly:** Last 28 quarters (7 years)
- **Yearly:** Last 20 years

This is intentional - keeps database optimized:
- ✓ Faster queries
- ✓ Lower storage
- ✓ Consistent performance

**Summary stats** (allTimeViews, topArticles) are kept forever

---

## 🔍 Debug Console Commands

**Paste these in DevTools Console to diagnose:**

**Check email:**
```javascript
localStorage.getItem('docspost-email')
```

**Test API endpoint:**
```javascript
const email = localStorage.getItem('docspost-email');
fetch(`/api/analytics/get-stats-optimized?email=${email}&timeframe=daily`)
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d, null, 2)))
```

**Log a test view:**
```javascript
const email = localStorage.getItem('docspost-email');
fetch('/api/docs/log-view-optimized', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ docId: 'test-doc', userEmail: email })
})
.then(r => r.json())
.then(d => console.log(d))
```

**Check analytics collection:**
```javascript
// If you have MongoDB Compass open:
// db.analytics_optimized.find({userEmail: "your@email.com"}).pretty()
```

---

## ✅ Final Verification Checklist

Before assuming something is broken:

- [ ] Email is in Local Storage (`docspost-email`)
- [ ] Database indexes created (ran init-indexes API)
- [ ] Viewed 3+ documents while logged in
- [ ] API endpoint returns data (tested directly)
- [ ] Refreshed dashboard page (Ctrl+R)
- [ ] Cleared browser cache (Ctrl+Shift+Delete)
- [ ] Dev server running (`npm run dev`)
- [ ] No errors in Console (F12)
- [ ] Email in API matches Local Storage exactly
- [ ] Network tab shows 200 OK for API calls

---

## 🎯 Summary

**Your analytics dashboard shows data when:**

```
✓ You're logged in (email in Local Storage)
✓ Views are logged (POST /api/docs/log-view-optimized)
✓ Data is stored (analytics_optimized collection)
✓ API returns it (GET /api/analytics/get-stats-optimized)
✓ Dashboard fetches it (AnalyticsDashboard.js)
✓ Charts render it (Recharts component)
```

**If any step fails, data won't show!**

---

## 📞 Getting Help

**Check these files for more info:**
- `ANALYTICS_QUICK_START.md` - 5-minute setup
- `ANALYTICS_IMPLEMENTATION_CHECKLIST.md` - Technical details
- `SLIDING_WINDOW_ANALYTICS.md` - Data retention explanation

**When reporting issues, include:**
1. Email in Local Storage
2. Console error messages
3. API response (test directly)
4. Database document (if accessible)
5. Steps to reproduce
