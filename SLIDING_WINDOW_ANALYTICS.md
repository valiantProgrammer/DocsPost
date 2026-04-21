# Sliding Window Analytics Implementation

## Overview

The analytics system now implements a **sliding window** pattern. When new data is added and the maximum number of intervals is reached, the **oldest data is automatically removed**.

## Maximum Intervals Per Timeframe

| Timeframe | Max Intervals | Description |
|-----------|---------------|-------------|
| **Daily** | 30 | Keeps last 30 days |
| **Monthly** | 36 | Keeps last 3 years (36 months) |
| **Quarterly** | 28 | Keeps last 7 years (28 quarters) |
| **Yearly** | 20 | Keeps last 20 years |

## How It Works

### Scenario: Daily Data

When a view is logged for Day 31:
1. **Before:** Document has intervals for Days 1-30
2. **Action:** New interval for Day 31 is added
3. **Sliding Window Trigger:** Total now exceeds max (30)
4. **After:** Days 2-31 remain, Day 1 is removed

### Example Timeline

```
Day 1-30 tracked
↓
Day 31 view logged
↓
MongoDB removes oldest (Day 1) automatically
↓
Days 2-31 now in database
```

## Implementation Details

### 1. Log-View-Optimized Endpoint
**File:** `app/api/docs/log-view-optimized/route.js`

When a new interval is added:
```javascript
const MAX_INTERVALS = {
    daily: 30,
    monthly: 36,
    quarterly: 28,
    yearly: 20
};

// Push new interval
await collection.updateOne(
    { userEmail },
    { $push: { [`${timeframe}.intervals`]: newInterval } }
);

// Keep only last N intervals (removes oldest)
await collection.updateOne(
    { userEmail },
    {
        $set: {
            [`${timeframe}.intervals`]: {
                $slice: [`$${timeframe}.intervals`, -maxIntervals]
            }
        }
    }
);
```

### 2. Migration Endpoint
**File:** `app/api/analytics/migrate-to-optimized/route.js`

When migrating old data:
```javascript
// Apply sliding window during migration
const quarterlySliced = quarterly.slice(-MAX_INTERVALS.quarterly);
const dailySliced = daily.slice(-MAX_INTERVALS.daily);
const monthlySliced = monthly.slice(-MAX_INTERVALS.monthly);
const yearlySliced = yearly.slice(-MAX_INTERVALS.yearly);
```

If old data has >36 months of records, migration keeps only last 36 months.

## MongoDB Operations

### Adding New Interval with Sliding Window

```javascript
db.collection("analytics_optimized").updateOne(
    { userEmail: "user@example.com" },
    {
        $push: {
            "daily.intervals": {
                intervalId: "2026-04-21",
                timestamp: ISODate(...),
                views: 1,
                articles: ["doc-id"],
                votes: { likes: 0, dislikes: 0 }
            }
        }
    }
);

// Slice to keep last 30
db.collection("analytics_optimized").updateOne(
    { userEmail: "user@example.com" },
    {
        $set: {
            "daily.intervals": {
                $slice: ["$daily.intervals", -30]
            }
        }
    }
);
```

## Data Integrity

### View Count Calculation
View counts are calculated from **only the retained intervals**:

```javascript
daily: {
    intervals: [/* last 30 days */],
    totalViews: dailySliced.reduce((sum, d) => sum + d.views, 0),
    // Result: sum of last 30 days only
}
```

### Summary Stats
Summary stats (allTimeViews, allTimeVotes) are calculated from **all original records** before sliding window:
- More accurate historical representation
- Shows total activity since account creation
- Independent of timeframe windowing

### Top Articles
Calculated from **all original records**, not windowed data:
- Ensures popular articles aren't dropped from top-N list
- Represents historical performance accurately

## Performance Benefits

| Aspect | Benefit |
|--------|---------|
| **Array Size** | Max 36 elements per timeframe (fixed) |
| **Query Speed** | Consistent O(1) lookup, no aggregation |
| **Storage** | Bounded growth, no accumulation |
| **Index Efficiency** | Better B-tree performance with fixed size |

## Migration Behavior

### Before Migration
```
Old analytics collection:
- 360+ documents per user
- All historical data preserved
- Slow aggregation queries
```

### After Migration
```
New analytics_optimized collection:
- 1 document per user
- Last 30 daily, 36 monthly, 28 quarterly, 20 yearly
- Fast direct queries
- Older data beyond windows discarded
```

## Testing the Sliding Window

### Step 1: Check Current State
```bash
curl http://localhost:3000/api/analytics/get-stats-optimized?email=user@example.com&timeframe=daily
```

Response shows current daily intervals (max 30).

### Step 2: Log Views Over Time
```bash
# Log view for today
curl -X POST http://localhost:3000/api/docs/log-view-optimized \
  -H "Content-Type: application/json" \
  -d '{"docId":"doc-slug","userEmail":"user@example.com"}'
```

### Step 3: Verify Oldest Removed
After 31+ days of data, oldest day disappears from daily intervals automatically.

## Rollback Considerations

If you need to recover old data beyond the sliding window:

1. **Before Migration:** Old `analytics` collection has all data
2. **During Migration:** Backup created in `analytics_backup`
3. **After Cleanup:** Old data is deleted (but backup exists)

**To Restore:**
```bash
db.analytics_optimized.deleteMany({})
db.analytics_backup.find({}).forEach(doc => db.analytics.insertOne(doc))
```

## Future Adjustments

To change the window sizes, update `MAX_INTERVALS` in:
- `app/api/docs/log-view-optimized/route.js`
- `app/api/analytics/migrate-to-optimized/route.js`

Example: Keep 60 days instead of 30
```javascript
const MAX_INTERVALS = {
    daily: 60,      // Changed from 30
    monthly: 36,
    quarterly: 28,
    yearly: 20
};
```

**Note:** Only new intervals after the change will respect the new limit. Existing windows won't shrink until naturally cycled out.

## Monitoring

Add this to your dashboard to track data retention:

```javascript
// Check interval counts per user
db.analytics_optimized.aggregate([
    {
        $project: {
            userEmail: 1,
            dailyCount: { $size: "$daily.intervals" },
            monthlyCount: { $size: "$monthly.intervals" },
            quarterlyCount: { $size: "$quarterly.intervals" },
            yearlyCount: { $size: "$yearly.intervals" }
        }
    }
])
```

Should show:
- dailyCount: 0-30
- monthlyCount: 0-36
- quarterlyCount: 0-28
- yearlyCount: 0-20
