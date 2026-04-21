# Analytics Dashboard Troubleshooting Guide

## Problem: Analytics Dashboard Not Showing Data

The analytics dashboard ("Track your content performance") appears empty even after viewing documents. Here's how to diagnose and fix the issue.

---

## ✅ Step 1: Verify Your Email is Logged In

**Check:**
- Open browser DevTools (F12)
- Go to Application → Local Storage
- Find key: `docspost-email`
- **Must have a valid email address**

**If missing:**
- Go to `/Auth` page
- Sign in with email
- Verify email in Local Storage is set

---

## ✅ Step 2: Check If Views Are Being Logged

**Action:** View a document while logged in

**Verify in DevTools:**
- Open Console tab
- Look for a successful POST request to `/api/docs/log-view-optimized`
- Should show **status 200 OK**

**If failed:**
```
✗ Error: POST 404 /api/docs/log-view-optimized
→ Endpoint may not exist
→ Run: npm run dev to ensure latest code deployed
```

**If succeeded:**
```
✓ POST /api/docs/log-view-optimized → 200 OK
→ View logged successfully
```

---

## ✅ Step 3: Initialize Database Indexes

**Run this API endpoint once:**
```bash
curl -X POST http://localhost:3000/api/db/init-indexes \
  -H "Authorization: Bearer dev-secret" \
  -H "Content-Type: application/json"
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

---

## ✅ Step 4: Check Migration Status

**API Call:**
```bash
curl http://localhost:3000/api/analytics/migrate-to-optimized?action=status
```

**Expected Response:**
```json
{
  "status": "OK",
  "oldAnalyticsCount": 0,
  "newOptimizedCount": 0,
  "message": "Old collection: 0 docs | New collection: 0 docs"
}
```

**Means:**
- No old data (expected on fresh start)
- New collection ready
- Data will be created as views are logged

---

## ✅ Step 5: Verify Dashboard Endpoint

**API Call with your email:**
```bash
curl "http://localhost:3000/api/analytics/get-stats-optimized?email=your@email.com&timeframe=daily"
```

**Expected Response (if no data yet):**
```json
{
  "success": true,
  "timeframe": "daily",
  "viewStats": [],
  "voteStats": [],
  "articleStats": [],
  "summary": {
    "allTimeViews": 0,
    "allTimeVotes": 0,
    "topArticles": [],
    "activeArticles": 0
  }
}
```

**This is normal!** It means:
- ✓ Endpoint is working
- ✓ Your email is recognized
- ✓ No data yet (need to log views first)

---

## ✅ Step 6: Log Multiple Views to Generate Data

View different documents to create analytics data:

```bash
# View document 1
curl -X POST http://localhost:3000/api/docs/log-view-optimized \
  -H "Content-Type: application/json" \
  -d '{"docId":"doc-slug-1","userEmail":"your@email.com"}'

# View document 2
curl -X POST http://localhost:3000/api/docs/log-view-optimized \
  -H "Content-Type: application/json" \
  -d '{"docId":"doc-slug-2","userEmail":"your@email.com"}'

# View document 3
curl -X POST http://localhost:3000/api/docs/log-view-optimized \
  -H "Content-Type: application/json" \
  -d '{"docId":"doc-slug-3","userEmail":"your@email.com"}'
```

**Each should respond:**
```json
{
  "success": true,
  "message": "View logged to optimized collection"
}
```

---

## ✅ Step 7: Verify Data in Dashboard

**API Call after logging views:**
```bash
curl "http://localhost:3000/api/analytics/get-stats-optimized?email=your@email.com&timeframe=daily"
```

**Expected Response (with data):**
```json
{
  "success": true,
  "timeframe": "daily",
  "viewStats": [
    {
      "_id": "2026-04-20",
      "views": 3,
      "articles": ["doc-slug-1", "doc-slug-2", "doc-slug-3"]
    }
  ],
  "voteStats": [],
  "articleStats": [
    {
      "articleId": "doc-slug-1",
      "title": "Document Title",
      "views": 1,
      "votes": 0
    }
  ],
  "summary": {
    "allTimeViews": 3,
    "allTimeVotes": 0,
    "topArticles": [
      {
        "articleId": "doc-slug-1",
        "title": "Document Title",
        "views": 1,
        "votes": 0
      }
    ],
    "activeArticles": 3
  }
}
```

---

## ✅ Step 8: Check Dashboard Component

**In Browser:**
1. Go to your dashboard page
2. Open DevTools (F12) → Network tab
3. You should see a GET request to:
   ```
   /api/analytics/get-stats-optimized?email=your@email.com&timeframe=daily
   ```

4. Check Response tab:
   - If `viewStats` array is empty → No data logged yet
   - If `viewStats` has data → Dashboard should display charts

**If still blank:**
- Refresh the page (Ctrl+R)
- Check Console for any JavaScript errors
- Verify `userEmail` is in Local Storage

---

## 📊 Common Issues & Solutions

### Issue 1: "No data showing even after viewing documents"

**Checklist:**
1. ✓ Email is saved in Local Storage
2. ✓ POST to `/api/docs/log-view-optimized` returned 200 OK
3. ✓ GET to `/api/analytics/get-stats-optimized` returns data in `viewStats`

**Solution:**
- Refresh dashboard page
- Clear browser cache (Ctrl+Shift+Delete)
- Check if `userEmail` parameter matches exactly (case-sensitive)

---

### Issue 2: "404 Error on /api/docs/log-view-optimized"

**Cause:** Endpoint doesn't exist or hasn't been deployed

**Solution:**
```bash
# Stop dev server
npm run dev

# Kill any existing processes
lsof -i :3000  # Check port
kill -9 <PID>  # Kill process

# Restart
npm run dev
```

---

### Issue 3: "Dashboard shows 'Track your content performance' but no charts"

**Cause:** Component structure issue or data not loading

**Check:**
1. Browser Console for errors
2. Network tab for failed requests
3. Verify response format matches expected structure

**Solution:**
- Check file: `app/components/AnalyticsDashboard.js`
- Verify it uses `/api/analytics/get-stats-optimized` endpoint
- Ensure `viewStats`, `voteStats`, `articleStats` are arrays

---

### Issue 4: "Sliding window data disappearing"

**Expected Behavior:**
- Daily: Max 30 days retained
- Monthly: Max 36 months
- Quarterly: Max 28 intervals
- Yearly: Max 20 years

**Not a Bug:** Data older than limits is automatically removed

**To change limits:**
Edit `app/api/docs/log-view-optimized/route.js`:
```javascript
const MAX_INTERVALS = {
    daily: 30,      // Change to 60 for 60 days
    monthly: 36,
    quarterly: 28,
    yearly: 20
};
```

---

## 🔧 Complete Setup Workflow

**For Fresh Start:**

1. **Ensure logged in**
   ```
   Go to /Auth → Sign in → Email saved in Local Storage
   ```

2. **Initialize indexes**
   ```bash
   curl -X POST http://localhost:3000/api/db/init-indexes \
     -H "Authorization: Bearer dev-secret"
   ```

3. **View some documents**
   - Open 3-5 different documents
   - Wait 2-3 seconds after each view
   - Check Console for successful POST requests

4. **Open Analytics Dashboard**
   - Navigate to `/dashboard`
   - Should see charts with data
   - Try different timeframes: Daily, Monthly, Quarterly, Yearly

5. **Verify with API**
   ```bash
   curl "http://localhost:3000/api/analytics/get-stats-optimized?email=your@email.com&timeframe=daily"
   ```

---

## 📈 Debugging Steps

### Enable Detailed Logging

Edit `app/components/AnalyticsDashboard.js` and add:
```javascript
const fetchAnalytics = async () => {
    setIsLoading(true);
    console.log("[Dashboard] Fetching analytics for:", userEmail, "timeframe:", timeframe);
    try {
        const url = `/api/analytics/get-stats-optimized?email=${encodeURIComponent(
            userEmail
        )}&timeframe=${timeframe}`;
        console.log("[Dashboard] API URL:", url);
        
        const response = await fetch(url);
        console.log("[Dashboard] Response status:", response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log("[Dashboard] Received data:", data);
            setViewStats(data.viewStats);
            setVoteStats(data.voteStats);
            setArticleStats(data.articleStats);
        }
    } catch (error) {
        console.error("[Dashboard] Error fetching analytics:", error);
    } finally {
        setIsLoading(false);
    }
};
```

Then check Console output for full data flow.

---

## 🎯 Expected Result

**After completing these steps, you should see:**

✅ Analytics Dashboard displays charts
✅ Shows "Track your content performance"
✅ Charts show:
- Page Views (bar chart)
- Trend Deviation (line chart)
- Vote Analytics (pie chart)
- Top Articles Performance

✅ Can switch between timeframes:
- Daily: Last 30 days
- Monthly: Last 36 months (3 years)
- Quarterly: Last 28 quarters (7 years)
- Yearly: Last 20 years

✅ Data updates in real-time as documents are viewed

---

## 🚀 Still Having Issues?

**Check these files:**
1. `app/components/AnalyticsDashboard.js` - Dashboard component
2. `app/api/analytics/get-stats-optimized/route.js` - API endpoint
3. `app/api/docs/log-view-optimized/route.js` - View logging endpoint
4. `app/doc/[id]/page.js` - Document view page (calls log-view-optimized)

**Verify:**
- All files use `/api/analytics/get-stats-optimized` (not old `/api/analytics/get-stats`)
- All files use `/api/docs/log-view-optimized` (not old `/api/docs/log-view`)
- Database indexes are created
- Email is properly saved in Local Storage
