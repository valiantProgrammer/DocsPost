# Optimized Analytics Database Schema

## Overview
One document per user (author) containing all analytics data organized by timeframe (quarterly, daily, monthly, yearly).

## Document Structure

```javascript
{
  _id: ObjectId("..."),
  userEmail: "rupayandey134@gmail.com",
  createdAt: ISODate("2026-04-01T00:00:00.000Z"),
  updatedAt: ISODate("2026-04-20T21:25:00.000Z"),

  // ========== QUARTERLY DATA (15-minute intervals) ==========
  quarterly: {
    intervals: [
      {
        intervalId: "2026-04-20 15:30",        // Key for fast lookup
        timestamp: ISODate("2026-04-20T10:00:00.000Z"),  // Start of interval
        views: 14,
        articles: ["dsfasdf", "types-of-binary-tree"],
        votes: {
          likes: 2,
          dislikes: 0
        }
      },
      {
        intervalId: "2026-04-20 15:45",
        timestamp: ISODate("2026-04-20T10:15:00.000Z"),
        views: 20,
        articles: ["types-of-binary-tree"],
        votes: {
          likes: 3,
          dislikes: 1
        }
      }
      // ... more intervals (max 28 for 7 hours)
    ],
    lastUpdated: ISODate("2026-04-20T15:45:00.000Z"),
    totalViews: 176,
    totalVotes: 12
  },

  // ========== DAILY DATA (30 days) ==========
  daily: {
    intervals: [
      {
        dateId: "2026-04-20",                  // YYYY-MM-DD format
        timestamp: ISODate("2026-04-20T00:00:00.000Z"),
        views: 176,
        articles: ["dsfasdf", "types-of-binary-tree"],
        votes: {
          likes: 12,
          dislikes: 2
        }
      },
      {
        dateId: "2026-04-19",
        timestamp: ISODate("2026-04-19T00:00:00.000Z"),
        views: 98,
        articles: ["types-of-binary-tree"],
        votes: {
          likes: 8,
          dislikes: 1
        }
      }
      // ... more days (max 30)
    ],
    lastUpdated: ISODate("2026-04-20T21:25:00.000Z"),
    totalViews: 1024,
    totalVotes: 87
  },

  // ========== MONTHLY DATA (36 months) ==========
  monthly: {
    intervals: [
      {
        monthId: "2026-04",                    // YYYY-MM format
        timestamp: ISODate("2026-04-01T00:00:00.000Z"),
        views: 1024,
        articles: ["dsfasdf", "types-of-binary-tree", "binary-search"],
        votes: {
          likes: 87,
          dislikes: 12
        }
      },
      {
        monthId: "2026-03",
        timestamp: ISODate("2026-03-01T00:00:00.000Z"),
        views: 856,
        articles: ["types-of-binary-tree"],
        votes: {
          likes: 72,
          dislikes: 8
        }
      }
      // ... more months (max 36)
    ],
    lastUpdated: ISODate("2026-04-20T21:25:00.000Z"),
    totalViews: 5234,
    totalVotes: 456
  },

  // ========== YEARLY DATA (20 years) ==========
  yearly: {
    intervals: [
      {
        yearId: "2026",                        // YYYY format
        timestamp: ISODate("2026-01-01T00:00:00.000Z"),
        views: 5234,
        articles: ["dsfasdf", "types-of-binary-tree", "..."],
        votes: {
          likes: 456,
          dislikes: 98
        }
      },
      {
        yearId: "2025",
        timestamp: ISODate("2025-01-01T00:00:00.000Z"),
        views: 3421,
        articles: ["..."],
        votes: {
          likes: 298,
          dislikes: 54
        }
      }
      // ... more years (max 20)
    ],
    lastUpdated: ISODate("2026-04-20T21:25:00.000Z"),
    totalViews: 15234,
    totalVotes: 1554
  },

  // ========== SUMMARY STATS ==========
  summary: {
    allTimeViews: 15234,
    allTimeVotes: 1554,
    avgViewsPerDay: 42.3,
    topArticles: [
      {
        articleId: "types-of-binary-tree",
        title: "Types of Binary Tree",
        views: 4200,
        votes: 324
      },
      {
        articleId: "dsfasdf",
        title: "dsfasdf",
        views: 2100,
        votes: 156
      }
    ],
    lastViewTime: ISODate("2026-04-20T15:53:52.583Z"),
    activeArticles: 2
  }
}
```

## Key Benefits

✅ **One document per user** - Easy to fetch all analytics in one query
✅ **Fast lookups** - `intervalId`, `dateId`, `monthId`, `yearId` enable instant interval lookup
✅ **Efficient storage** - No duplicate data, aggregated counts
✅ **Scalability** - Fixed array sizes (28, 30, 36, 20)
✅ **Real-time updates** - Update only the relevant interval in the array
✅ **Analytics-ready** - All timeframes in one document

## CRUD Operations

### Create User Analytics
```javascript
{
  userEmail: "user@example.com",
  createdAt: new Date(),
  updatedAt: new Date(),
  quarterly: { intervals: [], lastUpdated: new Date(), totalViews: 0, totalVotes: 0 },
  daily: { intervals: [], lastUpdated: new Date(), totalViews: 0, totalVotes: 0 },
  monthly: { intervals: [], lastUpdated: new Date(), totalViews: 0, totalVotes: 0 },
  yearly: { intervals: [], lastUpdated: new Date(), totalViews: 0, totalVotes: 0 },
  summary: { allTimeViews: 0, allTimeVotes: 0, topArticles: [] }
}
```

### Update/Increment View Count (Quarterly)
```javascript
// Increment existing interval
db.analytics.updateOne(
  { userEmail: "rupayandey134@gmail.com", "quarterly.intervals.intervalId": "2026-04-20 15:30" },
  { 
    $inc: { "quarterly.intervals.$.views": 1 },
    $addToSet: { "quarterly.intervals.$.articles": "dsfasdf" },
    $set: { "quarterly.lastUpdated": new Date() }
  }
)

// Or if interval doesn't exist, add it
db.analytics.updateOne(
  { userEmail: "rupayandey134@gmail.com" },
  { 
    $push: { 
      "quarterly.intervals": {
        intervalId: "2026-04-20 15:30",
        timestamp: new Date(...),
        views: 1,
        articles: ["dsfasdf"],
        votes: { likes: 0, dislikes: 0 }
      }
    },
    $inc: { "quarterly.totalViews": 1 },
    $set: { "quarterly.lastUpdated": new Date() }
  },
  { upsert: true }
)
```

### Query for Dashboard
```javascript
// Get all quarterly data for a user
db.analytics.findOne(
  { userEmail: "rupayandey134@gmail.com" },
  { "quarterly.intervals": 1, "quarterly.totalViews": 1 }
)

// Returns: { quarterly: { intervals: [...], totalViews: 176, ... } }
```

## Migration Path

1. Create new `analytics_v2` collection with this schema
2. Migrate data from old `analytics` collection (aggregate by user + timeframe)
3. Update API endpoints to query `analytics_v2`
4. Test thoroughly
5. Drop old `analytics` collection
6. Rename `analytics_v2` to `analytics`

## Index Recommendations

```javascript
// Primary index on userEmail (for quick lookups)
db.analytics.createIndex({ userEmail: 1 })

// For faster interval lookups
db.analytics.createIndex({ userEmail: 1, "quarterly.intervals.intervalId": 1 })
db.analytics.createIndex({ userEmail: 1, "daily.intervals.dateId": 1 })
db.analytics.createIndex({ userEmail: 1, "monthly.intervals.monthId": 1 })
db.analytics.createIndex({ userEmail: 1, "yearly.intervals.yearId": 1 })
```

## Comparison

### Old Schema (Current)
- 360+ documents for analytics collection
- Multiple queries needed for different timeframes
- Duplicate storage of same view in different formats
- Slow aggregation pipelines

### New Schema (Optimized)
- 1 document per user
- All timeframes in one fetch
- Minimal storage footprint
- Direct array access with no aggregation needed
- O(1) lookups using intervalId
