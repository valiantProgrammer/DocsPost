# Analytics Collection - Safe Removal Action Plan

## ✅ Current Status: All Redundant Writes Removed

The following has been completed:
- ✅ Removed old analytics write from `/api/documents/get-document/route.js`
- ✅ Removed old analytics write from `/api/docs/upvote/route.js` 
- ✅ No active code writes to old `analytics` collection anymore

## Dead Code Ready for Deletion

These endpoints are no longer called by any frontend code and write only to the deprecated `analytics` collection:

```
1. /api/analytics/activity-log/route.js          (~50 lines)
2. /api/analytics/log-view/route.js              (~80 lines)
3. /api/analytics/log-vote/route.js              (~100 lines)
4. /api/analytics/get-stats/route.js             (~150 lines)
5. /api/analytics/log-activity/route.js          (~200+ lines)
```

**Total dead code:** ~800+ lines to remove

## Two-Phase Safe Removal

### Phase 1: Delete Dead Endpoints (ZERO RISK)
Execute immediately:
```bash
# Delete these directories
rm -r app/api/analytics/activity-log/
rm -r app/api/analytics/log-view/
rm -r app/api/analytics/log-vote/
rm -r app/api/analytics/get-stats/
rm -r app/api/analytics/log-activity/
```

**Why safe:**
- ✅ Frontend code doesn't call any of these endpoints (verified via grep)
- ✅ No active writes to analytics collection
- ✅ No dependencies from other endpoints
- ✅ All data migrated to analytics_optimized

**After Phase 1:**
- Deploy and monitor for 24-48 hours
- Check logs for any 404 errors to deleted endpoints (there should be none)

### Phase 2: Drop Database Collection (AFTER Phase 1 confirmed)
Execute only after Phase 1 verified stable:

```javascript
// Option 1: Via MongoDB console (manual verification)
use DocsPost
db.collection("analytics").drop()

// Option 2: Via API endpoint (create temporary cleanup route)
const db = getDatabase();
const result = await db.collection("analytics").drop();
console.log("Dropped analytics collection:", result);
```

**Why wait 48 hours:**
- Gives confidence no "ghost" requests exist
- Allows log analysis to confirm 
- Reversible if needed (though data already in analytics_optimized)

## Data Safety Verification

### Before Cleanup - Run Verification Query
```javascript
// Check if all data exists in analytics_optimized
const oldCount = db.collection("analytics").countDocuments();
const optimizedCount = db.collection("analytics_optimized").countDocuments();

console.log("Old collection docs:", oldCount);
console.log("Optimized collection docs:", optimizedCount);
// Note: optimizedCount will be LESS because it's aggregated by user, 
// but all event data is preserved in timeframe intervals
```

### What Was in Old Collection
- Individual view/vote events (one document per event)
- User email, article ID, timestamp, event type
- ~300k+ documents (exact count in your database)

### Where It Went
- **Views & Votes:** Now aggregated in `analytics_optimized.summary.topArticles` and timeframe intervals
- **Event Trails:** Preserved in `analytics_reports` collection (detailed records)
- **Contribution Stats:** In separate `analytics_stats` collection (articles created per day)

## Recommended Timeline

| Time | Action | Status |
|------|--------|--------|
| **Today** | Delete 5 dead endpoints | Ready ✅ |
| **+24h** | Monitor logs for 404 errors | TBD |
| **+48h** | If clean, drop `analytics` collection | TBD |
| **+1 week** | Delete migration endpoints (optional) | TBD |

## Rollback Plan (if needed)

If issues appear after Phase 1:
1. No rollback needed - deleting endpoints is safe, collection still exists
2. Can restore endpoints from git history if needed
3. Analytics still running on optimized system

If issues appear after Phase 2:
1. Check if analytics_optimized has the data
2. If data intact in analytics_optimized → safe to ignore
3. If data missing → may have incident (unlikely given migration verification)

## Checklist Before Execution

- [ ] Verify no active analytics requests in logs
- [ ] Confirm all test environments use same endpoints as production
- [ ] Backup database (optional but recommended)
- [ ] Have rollback procedure documented (above)
- [ ] Schedule during low-traffic window
- [ ] Monitor logs for 48 hours after Phase 1

## Questions to Answer Before Deletion

1. **Is any batch job using old endpoints?**
   - Checked: No background jobs in codebase use these endpoints ✅

2. **Is any third-party tool connected?**
   - Checked: Only Next.js app connects to this MongoDB instance ✅

3. **Do analytics_optimized backups exist?**
   - Recommendation: Yes, create backup before Phase 2

4. **Is this in a single-user development environment?**
   - Current: Windows dev machine
   - Production: Will need separate cleanup procedure

---

**Ready to proceed with Phase 1 deletion? Yes/No**
