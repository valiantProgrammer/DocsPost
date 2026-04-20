# Database Setup Guide

## Username Uniqueness Enforcement

DocsPost ensures that usernames are unique in the system through both application-level and database-level constraints.

### Application-Level Validation
- Signup endpoint checks if username already exists in both `users` and `tempusers` collections
- Case-insensitive duplicate checking (username matching ignores case)
- Validates username format (only letters and numbers, 3-20 characters)

### Database-Level Constraints (Indexes)

To ensure complete data integrity, MongoDB unique indexes should be created on the `username` and `email` fields:

#### Initialize Database Indexes (One-time setup)

**POST** `/api/db/init-indexes`

```bash
# With curl (for development):
curl -X POST http://localhost:3000/api/db/init-indexes

# With secret key (for production):
curl -X POST http://localhost:3000/api/db/init-indexes \
  -H "Authorization: Bearer YOUR_DB_INIT_SECRET"
```

**Response:**
```json
{
  "success": true,
  "message": "Database indexes initialized successfully",
  "indexes": [
    "users.username (unique, case-insensitive)",
    "users.email (unique, case-insensitive)",
    "tempusers.username (unique, case-insensitive)",
    "tempusers.email (unique, case-insensitive)",
    "tempusers.otpExpiresAt (TTL index)"
  ]
}
```

#### Check Existing Indexes

**GET** `/api/db/init-indexes`

```bash
curl http://localhost:3000/api/db/init-indexes
```

Returns all current indexes on both collections.

### What Gets Indexed

1. **users.username** - Unique, case-insensitive, sparse
   - Prevents duplicate usernames
   - Allows null values for users without usernames

2. **users.email** - Unique, case-insensitive, sparse
   - Prevents duplicate emails
   - Ensures one user per email

3. **tempusers.username** - Unique, case-insensitive, sparse
   - Prevents duplicate usernames during signup
   - Temporary users are deleted after verification or OTP expiry

4. **tempusers.email** - Unique, case-insensitive, sparse
   - Prevents duplicate signup attempts
   - Auto-deleted by TTL index after 31 minutes

5. **tempusers.otpExpiresAt** - TTL Index
   - Automatically deletes expired temp users
   - Runs every 60 seconds

### Environment Variables

Add to your `.env.local`:

```env
# For production, set a secret key for database initialization
DB_INIT_SECRET=your-secret-key-here
```

### Features

- **Case-Insensitive Matching**: `john123`, `John123`, and `JOHN123` are all treated as the same username
- **Sparse Indexes**: Allows null values without triggering uniqueness violation
- **TTL Cleanup**: Temporary users are automatically removed after OTP expires
- **Production Ready**: Requires authorization in production environment

### Testing Username Uniqueness

1. **Signup** with username `john123`
   - User receives OTP email
   
2. **Try to signup** with username `JOHN123`
   - Error: "This username is already taken"
   - Error: "This username is already being used" (if in tempusers)

3. **Try to signup** with username `John123`
   - Same error due to case-insensitive indexing

### Troubleshooting

**Index Already Exists**
```
If you get an error about indexes already existing,
the endpoint will return success=true anyway.
Existing indexes are maintained and not modified.
```

**Duplicate Key Error on Signup**
```
If database-level unique constraint is violated:
- Check MongoDB error logs
- Verify indexes are created with collation settings
- Ensure application is running latest signup validation code
```

**TTL Index Not Working**
```
If old temp users aren't being deleted:
- MongoDB TTL indexes run every 60 seconds
- Check MongoDB logs for TTL monitor
- Manually delete old tempusers if needed
```

### Manual Index Creation (Alternative)

If you prefer to create indexes directly in MongoDB:

```javascript
// Connect to MongoDB and run:
db.users.createIndex(
  { username: 1 },
  { unique: true, sparse: true, collation: { locale: "en", strength: 2 } }
)

db.users.createIndex(
  { email: 1 },
  { unique: true, sparse: true, collation: { locale: "en", strength: 2 } }
)

db.tempusers.createIndex(
  { username: 1 },
  { unique: true, sparse: true, collation: { locale: "en", strength: 2 } }
)

db.tempusers.createIndex(
  { email: 1 },
  { unique: true, sparse: true, collation: { locale: "en", strength: 2 } }
)

db.tempusers.createIndex(
  { otpExpiresAt: 1 },
  { expireAfterSeconds: 0 }
)
```

---

**Setup should be done once** during application initialization.
All usernames are guaranteed to be unique across the system.
