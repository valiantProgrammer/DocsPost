# Analytics Dashboard - Quick Start Guide

## 🚀 Get Your Analytics Dashboard Working in 5 Minutes

---

## Step 1: Ensure You're Logged In ✅

**Action:**
1. Open your app
2. Click "Login" → "Sign in with Email"
3. Enter your email address
4. **You should see your email in the app**

**Verify in DevTools:**
- Press F12 (Developer Tools)
- Go to **Application** → **Local Storage**
- Look for key `docspost-email`
- Should show your email address

---

## Step 2: Initialize Database Indexes ✅

**Run this command once:**

```bash
curl -X POST http://localhost:3000/api/db/init-indexes \
  -H "Authorization: Bearer dev-secret"
```

**Or in PowerShell:**

```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/db/init-indexes" `
  -Method Post `
  -Headers @{"Authorization" = "Bearer dev-secret"}
$response.Content | ConvertFrom-Json | ConvertTo-Json
```

**Expected Output:**
```
✓ Database indexes created successfully
```

---

## Step 3: View Some Documents 📖

**Action:**
1. Go back to your app
2. Find some documents in your dashboard
3. **Click to view at least 3 different documents**
4. Wait 1-2 seconds after each view

**Check Console:**
- Press F12 → **Console** tab
- You should see successful POST requests
- Look for: `[View Logged] DocID:...`

---

## Step 4: Open Analytics Dashboard 📊

**Action:**
1. Click on your **Dashboard** or **Analytics** menu
2. Look for "**Track your content performance**"
3. **Wait for charts to load** (takes 2-3 seconds)

**You should see:**
- ✓ Bar chart with "Page Views"
- ✓ Line chart with "Trend Deviation"
- ✓ Statistics cards showing total views/votes
- ✓ Article performance table

**If blank, go to Step 5...**

---

## Step 5: Test the API Directly 🔍

**In your browser, visit this URL:**
```
http://localhost:3000/api/analytics/get-stats-optimized?email=YOUR_EMAIL@example.com&timeframe=daily
```

**Replace `YOUR_EMAIL@example.com` with your actual email**

**You should see JSON like:**
```json
{
  "success": true,
  "timeframe": "daily",
  "viewStats": [
    {
      "_id": "2026-04-20",
      "views": 3,
      "articles": ["doc-1", "doc-2", "doc-3"]
    }
  ],
  "summary": {
    "allTimeViews": 3,
    "allTimeVotes": 0,
    "topArticles": [...]
  }
}
```

**If you see data here** → Dashboard should show it too (refresh the page)

**If empty** → Views weren't logged properly (go back to Step 3)

---

## Step 6: Try Different Timeframes 🔄

**On the dashboard, click:**
- **Daily** - Last 30 days
- **Monthly** - Last 36 months  
- **Quarterly** - Last 28 quarters
- **Yearly** - Last 20 years

**Each should show different chart data**

---

## ⚡ Quick Troubleshooting

### "Dashboard is still blank after these steps"

**Quick fixes:**

1. **Refresh the page**
   ```
   Press Ctrl+R (or Cmd+R on Mac)
   ```

2. **Clear browser cache**
   ```
   Press Ctrl+Shift+Delete
   Select "All time" → Click "Clear data"
   Refresh page
   ```

3. **Check your email**
   - Press F12 → Application → Local Storage
   - Verify `docspost-email` matches the email you used in Step 5

4. **Restart dev server**
   ```bash
   npm run dev
   ```

---

## 📝 Email Must Match Exactly

**Important:** The email in Local Storage must EXACTLY match the one in the API call.

**Example:**
- ✓ Local Storage has: `rupayandey134@gmail.com`
- ✓ API call uses: `rupayandey134@gmail.com`
- ✗ API call uses: `Rupayandey134@gmail.com` (uppercase R)
- ✗ API call uses: `rupayandey@gmail.com` (missing "134")

**Emails are case-sensitive in MongoDB!**

---

## 🔄 What's Happening Behind the Scenes

```
You view a document
         ↓
Frontend logs view: POST /api/docs/log-view-optimized
         ↓
Server creates analytics record for your email
         ↓
Data stored in analytics_optimized collection
         ↓
You open Dashboard
         ↓
Frontend fetches stats: GET /api/analytics/get-stats-optimized?email=YOUR_EMAIL
         ↓
Server retrieves your analytics data
         ↓
Charts render with your data
```

---

## 📊 Data You Should See

**After viewing 3 documents today:**

| Metric | Value |
|--------|-------|
| **Total Views** | 3 |
| **Active Days** | 1 |
| **Today's Views** | 3 |
| **Top Article** | (Document you viewed most) |
| **Total Articles** | 3 |

---

## 🎯 Expected Timeline

| Action | Time |
|--------|------|
| View document | Instant ✓ |
| POST to API | < 1 second |
| Data saved | < 1 second |
| Refresh dashboard | < 2 seconds |
| Charts appear | < 1 second |
| **Total time** | **~5 seconds** |

---

## ✅ Checklist

- [ ] Email logged in Local Storage
- [ ] Database indexes initialized
- [ ] Viewed 3+ documents
- [ ] Check API endpoint directly
- [ ] Refresh dashboard
- [ ] See charts with data

---

## 🚀 You're Ready!

**Your analytics dashboard should now show:**
- ✓ Daily/Monthly/Quarterly/Yearly charts
- ✓ Page views and trends
- ✓ Top performing articles
- ✓ Vote engagement data

**Enjoy tracking your content performance!** 📈

---

## 💡 Pro Tips

1. **Add more documents to see better trends**
   - Single day data shows flat line
   - View over multiple days for trends

2. **Try the same document multiple times**
   - Views stack: 5 views to same doc
   - Shows which content is popular

3. **Switch timeframes to see patterns**
   - Daily: See hour-to-hour changes
   - Monthly: See week-to-week patterns
   - Yearly: See seasonal trends

4. **Check Console for debug info**
   - Shows exactly what data is fetched
   - Helps diagnose issues

---

## 📞 Still Need Help?

Check these files:
- `ANALYTICS_DASHBOARD_TROUBLESHOOTING.md` - Detailed troubleshooting
- `ANALYTICS_IMPLEMENTATION_CHECKLIST.md` - Implementation details
- `SLIDING_WINDOW_ANALYTICS.md` - How data retention works
