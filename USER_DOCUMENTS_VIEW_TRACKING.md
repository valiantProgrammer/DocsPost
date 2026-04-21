# User Documents & View Tracking Update

## Changes Made

### 1. ✅ Views Update in user_documents Collection
**File:** `/api/docs/log-view-optimized/route.js`

**Change:** Added increment of views field in user_documents collection when a view is logged:
```javascript
// Update views count in user_documents collection
await docsCollection.updateOne(
    { slug: docId },
    { $inc: { views: 1 }, $set: { updatedAt: now } }
);
```

**Result:**
- Each time a document is viewed, the `views` field in `user_documents` collection is incremented
- The `updatedAt` timestamp is refreshed
- Views are now tracked in two places:
  - `user_documents` collection (document-level counter)
  - `analytics_optimized` collection (detailed intervals + summary)

---

## Contribution Heatmap Data Flow

### How Articles Create Records for the Heatmap

**1. Document Creation** → `/api/documents/create-document/route.js`

When a user creates a new article:
- ✅ Article stored in `user_documents` collection with `views: 0`, `createdAt: now`
- ✅ Contribution activity logged to `analytics_stats` collection
  - Increments: `articlesCreated`, `totalActivity`
  - Stores: `createdArticles` array with article metadata
  - Date field: UTC date (e.g., "2024-04-21")

**2. View Logging** → `/api/docs/log-view-optimized/route.js`

When an article is viewed:
- ✅ Views incremented in `user_documents` collection (`views: views + 1`)
- ✅ Views logged to `analytics_optimized` collection (intervals + summary)
- ❌ Does NOT update contribution heatmap (heatmap shows CREATIONS, not views)

**3. Heatmap Display** → `/api/analytics/contribution-activity/route.js`

When fetching contribution activity:
- ✅ Fetches from `analytics_stats` collection
- ✅ Returns `articlesCreated` count per day
- ✅ Returns `createdArticles` array with article details
- ✅ Frontend displays as GitHub-style heatmap

---

## Data Collections Summary

### user_documents
**Purpose:** Store article content and metadata
**Fields:** title, description, content, category, difficulty, slug, userEmail, **views**, createdAt, updatedAt, published
**Views Update:** ✅ YES (incremented on each view)
**Heatmap:** ❌ No (heatmap uses analytics_stats instead)

### analytics_stats
**Purpose:** Track contribution activity (articles created per day)
**Fields:** userEmail, date, articlesCreated, totalActivity, createdArticles[], createdAt, updatedAt
**Used For:** Contribution heatmap
**Updates When:** New article is created

### analytics_optimized
**Purpose:** Track detailed view/vote analytics with timeframe intervals
**Fields:** userEmail, daily/monthly/quarterly/yearly intervals, summary, topArticles[]
**Views Update:** ✅ YES (all timeframes + summary)
**Used For:** Analytics dashboard, trend charts

### analytics_reports
**Purpose:** Detailed event log (view/vote events)
**Fields:** articleId, title, authorEmail, eventType, voteType, timestamp, date, month, year
**Used For:** Historical tracking and auditing

---

## Complete View Tracking Flow

```
User Views Article
    ↓
Frontend calls /api/docs/log-view-optimized
    ↓
Endpoint performs:
    1. Get document from user_documents
    2. Increment views in user_documents ← NEW
    3. Update analytics_optimized (all timeframes)
    4. Update analytics_optimized summary.topArticles
    5. Call log-article-event for reports
    ↓
Result:
    ✅ user_documents.views incremented
    ✅ analytics_optimized has detailed view data
    ✅ analytics_reports has event log
```

---

## What Shows on Contribution Heatmap

**GitHub-style heatmap displays:**
- Squares colored by intensity
- Each square = one day
- Color intensity = number of **articles CREATED** that day
- Tooltip shows: "X article(s) created" on YYYY-MM-DD

**NOT shown on heatmap:**
- Views (shown in analytics dashboard instead)
- Votes (shown in analytics dashboard instead)
- Other activities (only article creation counts)

---

## Examples

### Example 1: User Creates 3 Articles on April 21
**Heatmap shows:**
- April 21 square with intensity level 3 (color indicates "6+" or high activity)
- Tooltip: "April 21: 3 articles created"
- When hovering: Shows all 3 article titles from createdArticles[]

### Example 2: Articles Get 100 Views on April 21
**Heatmap shows:**
- No change (heatmap only counts article creation)
- Views are visible in:
  - user_documents collection (each article has views: 100)
  - analytics_optimized.summary.topArticles (each article shows view count)
  - Analytics dashboard charts (views graph)

### Example 3: Multiple Users with Different Activity
**Each user has their own:**
- analytics_stats records (one per day they created articles)
- analytics_optimized document (view/vote tracking)
- Contribution heatmap shows only their own article creation activity

---

## Verification

To verify everything is working:

### Check user_documents has views updated
```javascript
db.collection("user_documents").findOne({ slug: "article-slug" })
// Should show: { ..., views: 100, ... }
```

### Check analytics_stats has creation records
```javascript
db.collection("analytics_stats").findOne({ userEmail: "user@email.com", date: ISODate("2024-04-21") })
// Should show: { ..., articlesCreated: 3, createdArticles: [...], ... }
```

### Check analytics_optimized has view data
```javascript
db.collection("analytics_optimized").findOne({ userEmail: "user@email.com" })
// Should show: { daily: { totalViews: 100, ... }, ..., summary: { allTimeViews: 100, topArticles: [...], ... } }
```

### Check contribution heatmap endpoint
```bash
curl "http://localhost:3000/api/analytics/contribution-activity?email=user@email.com&days=365"
# Returns: { creationsByDay: [...], summary: { totalArticlesCreated: X, activeDays: Y, ... } }
```

---

## Key Takeaways

✅ **Views are now tracked in user_documents** - Direct reference for article statistics
✅ **Views are tracked in analytics_optimized** - Detailed time-series analytics
✅ **Contribution heatmap shows article creation** - Accurate representation of productivity
✅ **All data sources synchronized** - Consistent across dashboards
✅ **Backward compatible** - No breaking changes to existing flows
