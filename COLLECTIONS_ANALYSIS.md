# Analytics Collections Analysis

## Collections Overview

### 1. `analytics_stats` Collection
**Purpose:** Daily contribution and activity tracking  
**Status:** STILL ACTIVE (actively written to and read from)

**Written by:**
- ✅ `/api/documents/create-document` - Tracks articles created per day
- ❌ `/api/analytics/log-activity` (OLD endpoint - no longer called)
- ❌ `/api/analytics/log-view` (OLD endpoint - no longer called)

**Read by:**
- ✅ `/api/analytics/contribution-activity` - Used to display contribution activity by day

**Data Structure:**
```javascript
{
  userEmail: "user@example.com",
  date: ISODate("2026-04-21T00:00:00Z"),
  totalActivity: 2,
  articlesCreated: 1,
  created: 1,
  createdArticles: [
    { articleId: "slug", title: "Title", createdAt: ISODate(...) }
  ],
  views: 0,
  votes: 0,
  likes: 0,
  lastActivity: ISODate(...),
  updatedAt: ISODate(...)
}
```

**Verdict:** ✅ KEEP - This is contribution tracking which is separate from view/vote tracking

---

### 2. `article_stats` Collection
**Purpose:** Per-article statistics (views, votes, likes, dislikes)  
**Status:** ACTIVELY MAINTAINED (still being written to)

**Written by:**
- ✅ `/api/analytics/log-article-event` - Logs view/vote events (called from optimized routes)

**Read by:**
- ✅ `/api/analytics/article-stats` - Endpoint to get article statistics
- ✅ `/api/docs/[id]/stats` - FALLBACK if authorEmail not provided

**Data Structure:**
```javascript
{
  articleId: "slug",
  title: "Article Title",
  authorEmail: "author@example.com",
  totalViews: 10,
  totalVotes: 2,
  totalLikes: 2,
  totalDislikes: 0,
  engagementRate: 20.0,
  lastViewedAt: ISODate(...),
  lastVotedAt: ISODate(...),
  createdAt: ISODate(...),
  updatedAt: ISODate(...)
}
```

**Verdict:** ⚠️ REDUNDANT - Same data exists in `analytics_optimized.summary.topArticles`

---

### 3. `analytics_optimized` Collection (NEW)
**Purpose:** Unified analytics with timeframe intervals and summary  
**Status:** PRIMARY SYSTEM (actively written to)

**Data Structure:**
```javascript
{
  userEmail: "user@example.com",
  createdAt: ISODate(...),
  updatedAt: ISODate(...),
  summary: {
    allTimeViews: 101,
    allTimeVotes: 1,
    topArticles: [
      {
        articleId: "slug",
        title: "Title",
        views: 68,
        votes: 1,
        dislikes: 0
      }
    ],
    activeArticles: 2,
    lastViewTime: ISODate(...)
  },
  daily: {
    intervals: [{ intervalId, views, votes: { likes, dislikes }, articles }],
    totalViews: 101,
    totalVotes: 1,
    lastUpdated: ISODate(...)
  },
  monthly: { ... },
  quarterly: { ... },
  yearly: { ... }
}
```

**Data Overlap:**
- ✅ `analytics_optimized.summary.topArticles` = `article_stats` (duplicate)
- ✅ `analytics_optimized.daily.intervals[].views` = aggregated views from `article_stats`

**Verdict:** PRIMARY SYSTEM - Contains all article data + timeframe intervals

---

### 4. `analytics` Collection (OLD)
**Purpose:** Individual event log (deprecated)  
**Status:** NOT ACTIVELY WRITTEN

**Written by:**
- ❌ OLD endpoints (no longer called)

**Verdict:** ❌ CAN BE REMOVED (replaced by analytics_optimized)

---

## Recommendations

### Phase 1: Current State (✅ Already Done)
- `analytics_optimized` is primary system for views/votes
- `article_stats` still receives updates (backup)
- `/api/docs/[id]/stats` can fetch from `analytics_optimized` OR `article_stats` (fallback)
- `analytics_stats` still tracks contributions (different purpose)

### Phase 2: Cleanup (Can Be Done)
1. **Remove redundant `article_stats` writes** - Since `analytics_optimized` has same data
   - Stop calling `updateArticleStats()` in `/api/analytics/log-article-event`
   - Or keep it as a backup for now

2. **Migrate `/api/analytics/article-stats` endpoint**
   - Use `analytics_optimized.summary.topArticles` instead of `article_stats` collection
   - Eliminates need for separate collection

3. **Drop old `analytics` collection**
   - No longer being written to
   - Completely replaced by `analytics_optimized`

### Phase 3: Optimize (For Later)
- Migrate contribution tracking to use `analytics_optimized` if needed
- Eventually retire `analytics_stats` in favor of optimized system

---

## Summary

| Collection | Purpose | Status | Keep? |
|-----------|---------|--------|-------|
| `analytics_optimized` | Views, votes, timeframes | ACTIVE PRIMARY | ✅ YES |
| `analytics_stats` | Contribution tracking | ACTIVE | ✅ YES (different purpose) |
| `article_stats` | Article stats (duplicate) | ACTIVE but REDUNDANT | ⚠️ CAN REMOVE |
| `analytics` | Old event log | INACTIVE | ❌ REMOVE |

