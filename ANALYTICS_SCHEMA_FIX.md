# Analytics Schema & Implementation Guide

## Problem Identified

The analytics collection might have documents with an unexpected schema or structure, causing mismatches between what the code expects and what actually exists in the database.

---

## Solution: Proper Schema Implementation

### Expected Document Structure

Every document in `analytics_optimized` should follow this schema:

```javascript
{
  _id: ObjectId("..."),
  userEmail: "user@example.com",
  createdAt: ISODate("2026-04-20T10:00:00.000Z"),
  updatedAt: ISODate("2026-04-20T15:30:00.000Z"),
  
  // Daily data - last 30 days
  daily: {
    intervals: [
      {
        intervalId: "2026-04-20",
        timestamp: ISODate("2026-04-20T00:00:00.000Z"),
        views: 5,
        articles: ["doc-slug-1", "doc-slug-2"],
        votes: { likes: 2, dislikes: 0 }
      }
    ],
    totalViews: 5,
    totalVotes: 2,
    lastUpdated: ISODate("2026-04-20T15:30:00.000Z")
  },
  
  // Monthly data - last 36 months
  monthly: {
    intervals: [
      {
        intervalId: "2026-04",
        timestamp: ISODate("2026-04-01T00:00:00.000Z"),
        views: 42,
        articles: ["doc-slug-1", "doc-slug-2"],
        votes: { likes: 8, dislikes: 1 }
      }
    ],
    totalViews: 42,
    totalVotes: 9,
    lastUpdated: ISODate("2026-04-20T15:30:00.000Z")
  },
  
  // Quarterly data - last 28 quarters (7 years)
  quarterly: {
    intervals: [
      {
        intervalId: "2026-04-20 15:30",
        timestamp: ISODate("2026-04-20T15:30:00.000Z"),
        views: 5,
        articles: ["doc-slug-1"],
        votes: { likes: 2, dislikes: 0 }
      }
    ],
    totalViews: 5,
    totalVotes: 2,
    lastUpdated: ISODate("2026-04-20T15:30:00.000Z")
  },
  
  // Yearly data - last 20 years
  yearly: {
    intervals: [
      {
        intervalId: "2026",
        timestamp: ISODate("2026-01-01T00:00:00.000Z"),
        views: 120,
        articles: ["doc-slug-1", "doc-slug-2"],
        votes: { likes: 20, dislikes: 2 }
      }
    ],
    totalViews: 120,
    totalVotes: 22,
    lastUpdated: ISODate("2026-04-20T15:30:00.000Z")
  },
  
  // Summary stats (from all historical data)
  summary: {
    allTimeViews: 150,
    allTimeVotes: 25,
    avgViewsPerDay: 7.5,
    topArticles: [
      {
        articleId: "doc-slug-1",
        title: "Article Title",
        views: 85,
        votes: 15
      }
    ],
    lastViewTime: ISODate("2026-04-20T15:30:00.000Z"),
    activeArticles: 2
  }
}
```

---

## How to Check Your Database Schema

### Step 1: Check if Documents Exist

```bash
curl "http://localhost:3000/api/analytics/check-schema"
```

**Response shows:**
- Total documents in collection
- Sample of 5 documents
- Structure of each document

### Step 2: Check Specific User

```bash
curl "http://localhost:3000/api/analytics/check-schema?email=your@email.com"
```

**Response shows:**
- Document exists: YES/NO
- If YES: Full schema breakdown
  - Each timeframe (daily, monthly, quarterly, yearly)
  - Number of intervals in each
  - Sample intervals
  - Summary statistics

---

## Updated Routes (Fixed)

### 1. POST /api/docs/log-view-optimized (FIXED)

**What changed:**
- Now uses `upsert: true` to automatically create documents if they don't exist
- Ensures all timeframe structures are initialized on first view
- Applies sliding window automatically

**Flow:**
```
View logged
  ↓
Check if interval exists
  ↓
  ├─ YES: Update interval, apply sliding window
  │
  └─ NO: Create document (if needed) + add interval + apply sliding window
```

**Code:**
```javascript
async function updateOrCreateInterval(collection, userEmail, timeframe, intervalId, articleId, timestamp) {
    // Try to update existing interval
    const updateResult = await collection.updateOne(
        { userEmail, [`${timeframe}.intervals.intervalId`]: intervalId },
        { $inc: { [`${timeframe}.intervals.$.views`]: 1 }, ... }
    );

    if (updateResult.matchedCount > 0) {
        // Interval exists - apply sliding window
        await collection.updateOne(
            { userEmail },
            { $set: { [`${timeframe}.intervals`]: { $slice: [...] } } }
        );
        return;
    }

    // Interval doesn't exist - use upsert to create document
    await collection.updateOne(
        { userEmail },
        {
            $push: { [`${timeframe}.intervals`]: newInterval },
            $inc: { [`${timeframe}.totalViews`]: 1 },
            $setOnInsert: { /* complete schema structure */ }
        },
        { upsert: true }  // ← KEY: Creates document if doesn't exist
    );
}
```

**Benefits:**
- ✓ No more conditional logic (insert vs update)
- ✓ Automatic document creation
- ✓ Complete schema initialized
- ✓ Works on first view
- ✓ Sliding window applied every time

---

### 2. GET /api/analytics/get-stats-optimized

**No changes needed** - Still expects the proper schema structure

But now it will always get documents because log-view-optimized creates them with upsert.

---

### 3. NEW: GET /api/analytics/check-schema

**Purpose:** Diagnostic tool to verify schema in database

**Usage:**
```bash
# Check all documents
curl http://localhost:3000/api/analytics/check-schema

# Check specific user
curl "http://localhost:3000/api/analytics/check-schema?email=user@example.com"
```

**Response Format:**
```json
{
  "userEmail": "user@example.com",
  "found": true,
  "schema": {
    "daily": {
      "exists": true,
      "totalViews": 5,
      "intervalCount": 3,
      "sampleIntervals": [...]
    },
    // ... monthly, quarterly, yearly
    "summary": {...}
  },
  "status": "✓ Document exists with proper schema"
}
```

---

## Troubleshooting

### Issue: "Document doesn't have daily field"

**Cause:** Old document structure without timeframe fields

**Fix:**
```bash
# Manually fix the document (if you have MongoDB):
db.analytics_optimized.updateMany(
  { daily: { $exists: false } },
  {
    $set: {
      daily: { intervals: [], totalViews: 0, totalVotes: 0 },
      monthly: { intervals: [], totalViews: 0, totalVotes: 0 },
      quarterly: { intervals: [], totalViews: 0, totalVotes: 0 },
      yearly: { intervals: [], totalViews: 0, totalVotes: 0 }
    }
  }
)
```

**Or:** Delete old documents and let new ones be created:
```bash
# Backup old data first
db.analytics_optimized.aggregate([{ $out: "analytics_backup_old" }])

# Delete old documents
db.analytics_optimized.deleteMany({})

# New documents will be created with correct schema on next view
```

---

### Issue: "Intervals array is missing"

**Cause:** Document structure doesn't have `daily.intervals`, `monthly.intervals`, etc.

**Solution:** Same as above - fix using updateMany or recreate

---

## Step-by-Step Verification

### 1. Initialize Database
```bash
curl -X POST http://localhost:3000/api/db/init-indexes \
  -H "Authorization: Bearer dev-secret"
```

### 2. Check Collection Status
```bash
curl http://localhost:3000/api/analytics/check-schema
```

### 3. Log a View
```bash
curl -X POST http://localhost:3000/api/docs/log-view-optimized \
  -H "Content-Type: application/json" \
  -d '{"docId":"test-doc","userEmail":"your@email.com"}'
```

### 4. Verify Document Was Created
```bash
curl "http://localhost:3000/api/analytics/check-schema?email=your@email.com"
```

**Expected Response:**
```json
{
  "userEmail": "your@email.com",
  "found": true,
  "schema": {
    "daily": {
      "exists": true,
      "totalViews": 1,
      "intervalCount": 1,
      ...
    },
    "status": "✓ Document exists with proper schema"
  }
}
```

### 5. Fetch Stats
```bash
curl "http://localhost:3000/api/analytics/get-stats-optimized?email=your@email.com&timeframe=daily"
```

**Should return:**
```json
{
  "success": true,
  "viewStats": [
    {
      "_id": "2026-04-20",
      "views": 1,
      "articles": ["test-doc"]
    }
  ],
  ...
}
```

---

## Schema Rules

**When creating/updating documents, follow these rules:**

✓ **Required fields:**
- `userEmail` - Always required, used as lookup key
- `daily`, `monthly`, `quarterly`, `yearly` - All timeframes must exist
- Each timeframe needs: `intervals`, `totalViews`, `totalVotes`, `lastUpdated`
- `summary` with at least: `allTimeViews`, `allTimeVotes`, `lastViewTime`

✓ **Intervals structure:**
- `intervalId` - Unique within timeframe
- `timestamp` - Date of interval
- `views` - View count (number)
- `articles` - Array of article IDs
- `votes` - Object with `likes` and `dislikes` (numbers)

✓ **Constraints:**
- Max 30 daily intervals (sliding window)
- Max 36 monthly intervals (sliding window)
- Max 28 quarterly intervals (sliding window)
- Max 20 yearly intervals (sliding window)

✓ **Always update `updatedAt`:**
```javascript
$set: { updatedAt: new Date() }
```

---

## Data Integrity Checks

**To verify all documents are valid:**

```javascript
// MongoDB query to check
db.analytics_optimized.aggregate([
  {
    $match: {
      $or: [
        { daily: { $exists: false } },
        { monthly: { $exists: false } },
        { quarterly: { $exists: false } },
        { yearly: { $exists: false } },
        { summary: { $exists: false } }
      ]
    }
  }
])
```

If this returns any documents, they need to be fixed.

---

## Next Steps

1. **Check your database schema:**
   ```bash
   curl http://localhost:3000/api/analytics/check-schema
   ```

2. **If documents are missing/malformed:**
   - Delete them: `db.analytics_optimized.deleteMany({})`
   - Log new views to recreate with proper schema

3. **Verify dashboard now works:**
   - Open dashboard
   - View some documents
   - Should see charts with data

4. **Monitor for success:**
   ```bash
   curl "http://localhost:3000/api/analytics/check-schema?email=your@email.com"
   ```

Should show proper schema with data!
