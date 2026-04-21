# Contribution Heatmap - Updated Architecture

## Major Change: Heatmap Now Fetches from user_documents

### What Changed
**Old approach:** Contribution heatmap fetched from `analytics_stats` collection
**New approach:** Contribution heatmap fetches directly from `user_documents` collection

---

## Why This Change?

1. **Single Source of Truth** - user_documents is the canonical source for articles
2. **Real-time Accuracy** - Heatmap reflects actual articles immediately
3. **Simplified Logic** - No need for separate contribution tracking
4. **Automatic Date Tracking** - createdAt field automatically maintained

---

## Updated Data Flow

### Article Creation
```
User Creates Article
    ↓
POST /api/documents/create-document
    ↓
{
    title: "My Article",
    slug: "my-article",
    userEmail: "user@email.com",
    createdAt: 2024-04-21T10:30:00Z,
    views: 0,
    ...
}
    ↓
Stored in user_documents collection
```

### Contribution Activity Heatmap Fetch
```
GET /api/analytics/contribution-activity?email=user@email.com&days=365
    ↓
Query user_documents:
    - Find all articles where userEmail = "user@email.com"
    - Filter by createdAt >= (now - 365 days)
    ↓
Group by date:
    - 2024-04-18: [article1, article2]
    - 2024-04-20: [article3]
    - 2024-04-21: [article4, article5, article6]
    ↓
Count per day:
    - 2024-04-18: 2 articles
    - 2024-04-20: 1 article
    - 2024-04-21: 3 articles
    ↓
Return to frontend for heatmap rendering
```

---

## Updated contribution-activity Endpoint

**File:** `/api/analytics/contribution-activity/route.js`

**Key Changes:**
- Queries `user_documents` instead of `analytics_stats`
- Groups articles by `createdAt.toISOString().split("T")[0]` (YYYY-MM-DD format)
- Returns article details including title, category, and current view count
- Data source field in response: `"dataSource": "user_documents"`

**Query:**
```javascript
const userArticles = await docsCollection
    .find({
        userEmail: email,
        createdAt: { $gte: startDate }
    })
    .sort({ createdAt: -1 })
    .toArray();
```

**Grouping:**
```javascript
const creationMap = {};
userArticles.forEach(article => {
    const dateStr = article.createdAt.toISOString().split("T")[0];
    
    if (!creationMap[dateStr]) {
        creationMap[dateStr] = {
            date: new Date(UTC date),
            articles: [],
            articlesCreated: 0
        };
    }
    
    creationMap[dateStr].articles.push({
        articleId: article.slug,
        title: article.title,
        createdAt: article.createdAt,
        category: article.category,
        views: article.views
    });
    creationMap[dateStr].articlesCreated += 1;
});
```

---

## Response Format

```json
{
  "success": true,
  "userEmail": "user@email.com",
  "dataSource": "user_documents",
  "period": {
    "days": 365,
    "startDate": "2024-04-21T00:00:00.000Z",
    "endDate": "2025-04-21T10:30:45.123Z"
  },
  "summary": {
    "totalArticlesCreated": 11,
    "activeDays": 5,
    "averagePerDay": "2.20",
    "totalActivity": 11
  },
  "creationsByDay": [
    {
      "date": "2024-04-18T00:00:00.000Z",
      "articlesCreated": 2,
      "articles": [
        {
          "articleId": "article-1-slug",
          "title": "Article 1",
          "createdAt": "2024-04-18T08:30:00.000Z",
          "category": "JavaScript",
          "views": 15
        },
        {
          "articleId": "article-2-slug",
          "title": "Article 2",
          "createdAt": "2024-04-18T14:15:00.000Z",
          "category": "React",
          "views": 8
        }
      ]
    },
    {
      "date": "2024-04-21T00:00:00.000Z",
      "articlesCreated": 3,
      "articles": [
        ...
      ]
    }
  ]
}
```

---

## Database Collections Now

### user_documents (PRIMARY SOURCE OF TRUTH)
- **Contains:** Article metadata including createdAt
- **Used by:** 
  - Heatmap (groups by createdAt)
  - Article display
  - View tracking (views field updated on each view)
- **Advantages:** Single source, real-time, maintains dates automatically

### analytics_stats (LEGACY/OPTIONAL)
- **Current status:** No longer required for heatmap
- **Options:**
  - Can be deprecated entirely
  - Can be kept for detailed contribution logs if needed
- **Migration:** Heatmap now sources from user_documents instead

### analytics_optimized (ANALYTICS)
- **Contains:** Detailed view/vote data with timeframe intervals
- **Used by:** Analytics dashboard charts, trend analysis
- **Status:** Still active and important

### analytics_reports (EVENT LOG)
- **Contains:** Detailed view/vote event records
- **Used by:** Auditing, historical tracking
- **Status:** Still active

---

## Views Tracking - Complete Picture

### Views are now tracked in THREE places:

1. **user_documents.views** (direct counter)
   - Updated when: Article is viewed
   - Used for: Article metadata, quick access
   - Latest value: Current view count

2. **analytics_optimized** (time-series)
   - Updated when: Article is viewed
   - Used for: Trends, analytics dashboard, engagement metrics
   - Contains: Intervals (daily/monthly/quarterly/yearly) with view counts

3. **analytics_reports** (event log)
   - Updated when: Article is viewed
   - Used for: Historical tracking, auditing
   - Contains: Individual view events with timestamps

---

## Heatmap Intensity Levels

Based on articles created on a day:

| Level | Count | Color |
|-------|-------|-------|
| 0 | 0 articles | Empty/Gray |
| 1 | 1 article | Light |
| 2 | 2-3 articles | Medium |
| 3 | 4-5 articles | Dark |
| 4 | 6+ articles | Very Dark |

---

## Example: How It All Works Together

### Day 1: April 18, 2024

**Morning:** User creates 2 articles
- Article 1: "Understanding Arrays"
  - Stored in user_documents with createdAt: 2024-04-18T08:30:00Z, views: 0
- Article 2: "Sorting Algorithms"
  - Stored in user_documents with createdAt: 2024-04-18T14:15:00Z, views: 0

**Afternoon:** Users view articles
- Article 1 viewed 15 times
  - user_documents.views: 0 → 15
  - analytics_optimized: daily.intervals[0].views: 15
- Article 2 viewed 8 times
  - user_documents.views: 0 → 8
  - analytics_optimized: daily.intervals[0].views: 8 (total 23 views)

**Heatmap fetches:**
```javascript
GET /api/analytics/contribution-activity?email=user@email.com&days=365

Returns:
{
  creationsByDay: [
    {
      date: "2024-04-18T00:00:00Z",
      articlesCreated: 2,
      articles: [
        { articleId: "understanding-arrays", title: "Understanding Arrays", views: 15, ... },
        { articleId: "sorting-algorithms", title: "Sorting Algorithms", views: 8, ... }
      ]
    }
  ],
  summary: { totalArticlesCreated: 2, activeDays: 1, ... }
}
```

**Heatmap displays:**
- April 18 square with color indicating "2 articles created"
- Tooltip: "April 18: 2 articles created"
- Hover shows: Both article titles

**Analytics dashboard shows:**
- View count: 23 total views
- Trend: Views increased throughout the day
- Top articles: Both articles appear in top articles list

---

## Migration Notes

If migrating from analytics_stats-based heatmap:

1. **No data loss** - Articles in user_documents already have createdAt dates
2. **Historical data** - All past articles can be queried from user_documents
3. **No API changes** - Response format remains the same
4. **Same heatmap display** - Frontend doesn't need changes
5. **More accurate** - Heatmap now matches actual articles exactly

---

## Key Benefits

✅ **Single source of truth** - No redundant data across collections
✅ **Real-time accuracy** - Heatmap matches articles immediately
✅ **Automatic date tracking** - No manual date maintenance needed
✅ **Simplified code** - No separate contribution logging
✅ **Better performance** - Direct query on indexed collection
✅ **Historical data** - All articles have creation dates
✅ **Live view counts** - Articles show current view count in heatmap
