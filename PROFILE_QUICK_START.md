# Profile Tab Integration - Quick Start Guide

## Overview
The profile tab has been completely refactored with an inline edit modal (not a popup window) that allows users to update their profile information with form validation and theme-matched styling.

## How to Use

### For Users
1. **View Profile**: Click on the "Profile" tab in the dashboard sidebar
2. **Edit Profile**: Click the "Edit Profile" button on the profile card
3. **Update Information**:
   - Update your bio (up to 500 characters)
   - Add your city (with autocomplete suggestions)
   - Select your country from dropdown
   - Add education entries (click Add, then press Enter or click Add button)
   - Add domains/expertise entries (click Add, then press Enter or click Add button)
   - Your public profile link auto-generates
4. **Save**: Click "Save Changes" to update your profile
5. **Cancel**: Click "Back to Profile" to return without saving

### Profile Information Displayed
- **Avatar**: Profile picture (or initials if no picture)
- **Name**: Your display name
- **Bio**: Your profile bio
- **Location**: City and Country
- **Statistics**: Followers, Following, Articles count
- **Recent Articles**: Latest 2 articles

## Components

### ProfileView Component
**File**: `app/components/ProfileView.js`

Main component that displays user profile information. Shows overview statistics and recent articles. When edit mode is activated, it renders the ProfileEdit component.

**Props**:
- `userData` (Object): User data from API
- `userEmail` (String): User's email
- `userName` (String): User's username

**State**:
- `isEditMode` (Boolean): Controls whether edit form is shown
- `profileData` (Object): Current profile data

### ProfileEdit Component
**File**: `app/components/ProfileEdit.js`

Inline edit modal form for updating profile. NOT a popup window - it replaces the ProfileView component in the DOM.

**Props**:
- `profileData` (Object): Current profile data
- `onClose` (Function): Callback when edit is cancelled or completed
- `userId` (String): User's MongoDB ID

**Form Fields**:
- **Bio**: Textarea input, 500 character limit
- **City**: Text input with autocomplete suggestions
- **Country**: Dropdown select with all countries
- **Education**: Tag-based input for multiple entries
- **Domains**: Tag-based input for multiple entries
- **Public Profile Link**: Read-only generated link

### CitySuggestions Component
**File**: `app/components/CitySuggestions.js`

Helper component for displaying city suggestions dropdown.

## API Endpoints

### GET /api/profile/get-profile
Fetch user profile data

**Query Parameters**:
- `email` (required): User's email

**Response**:
```json
{
  "success": true,
  "user": {
    "_id": "mongo-id",
    "username": "username",
    "name": "Full Name",
    "email": "user@example.com",
    "bio": "Profile bio",
    "city": "City Name",
    "country": "Country Name",
    "educations": ["Education 1", "Education 2"],
    "domains": ["Domain 1", "Domain 2"],
    "profilePicture": "image-url",
    "location": "Location",
    "joinDate": "2024-01-01"
  }
}
```

### POST /api/profile/update-profile
Update user profile

**Request Body**:
```json
{
  "userId": "mongo-id",
  "bio": "New bio",
  "city": "New City",
  "country": "New Country",
  "educations": ["Education 1", "Education 2"],
  "domains": ["Domain 1", "Domain 2"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

### GET /api/cities
Get city suggestions

**Query Parameters**:
- `country` (required): Country name
- `search` (required): Search term

**Example**:
```
/api/cities?country=India&search=ban
```

**Response**:
```json
{
  "success": true,
  "cities": ["Bangalore", "Bandhan", ...]
}
```

## Styling

### Theme Variables Used
- `--panel-bg`: Background for cards/panels
- `--page-bg`: Main page background
- `--text-main`: Primary text color
- `--text-muted`: Secondary text color
- `--line`: Border color
- `--brand`: Primary brand color
- `--brand-deep`: Darker brand color

### CSS Files
- `app/components/ProfileView.css`: ProfileView component styling
- `app/components/ProfileEdit.css`: ProfileEdit form styling

## Features

### ✅ Inline Edit Modal
- Full-screen form overlay
- No popup window
- Smooth transitions
- Back button to return

### ✅ Form Validation
- User ID validation
- Required field validation
- Error message display
- Loading states

### ✅ City Autocomplete
- Real-time suggestions
- Filters by country
- Click to select
- Keyboard support

### ✅ Tag Management
- Add/remove education
- Add/remove domains
- Visual tag display
- Enter key support

### ✅ Theme Support
- Light/dark mode
- CSS variable theming
- Responsive design

## Data Flow

```
DashboardPage
  ↓
renderContent() → ProfileView
  ↓ (Edit clicked)
ProfileView switches to ProfileEdit
  ↓ (Form submitted)
POST /api/profile/update-profile
  ↓ (Success)
onClose() callback with updated data
  ↓
ProfileView updates state
  ↓
Switch back to view mode
```

## Keyboard Shortcuts

- **Enter** in Education/Domain fields: Add new entry
- **Delete/Backspace** on tag: Remove tag (click button)
- **Escape** (future): Close edit mode (if implemented)

## File Structure

```
app/
├── components/
│   ├── ProfileView.js
│   ├── ProfileView.css
│   ├── ProfileEdit.js
│   ├── ProfileEdit.css
│   └── CitySuggestions.js
├── api/
│   ├── profile/
│   │   ├── get-profile/route.js
│   │   ├── update-profile/route.js
│   │   └── cities/route.js
└── [username]/
    └── page.js
```

## Environment Setup

No additional environment variables required. Uses existing:
- `MONGODB_URI`: For database connection
- Theme provider configuration

## Testing

### Manual Testing Steps
1. Navigate to Profile tab
2. Verify profile data loads
3. Click Edit Profile
4. Fill in form fields
5. Test city autocomplete
6. Add/remove education entries
7. Add/remove domains
8. Click Save
9. Verify data updates
10. Return to profile view

### Test Scenarios
- [ ] Edit with all fields
- [ ] Edit with only bio
- [ ] Edit with empty fields
- [ ] Test city autocomplete suggestions
- [ ] Test form validation
- [ ] Test error handling
- [ ] Test responsive layout
- [ ] Test theme switching

## Troubleshooting

### Cities not showing in autocomplete
- Check country is selected
- Ensure country name matches exactly
- Check network tab for API request

### Form not submitting
- Verify user ID is present
- Check browser console for errors
- Verify MongoDB connection

### Styling issues
- Check CSS variables are defined
- Verify theme provider is working
- Clear browser cache

## Future Enhancements
1. Profile picture upload in edit mode
2. Social media links
3. Portfolio website link
4. Profile completion score
5. Activity timeline
6. Follow/Unfollow system
7. Profile view counter
8. Badges and achievements

## Support
For issues or questions, refer to:
- [PROFILE_REFACTORING_IMPLEMENTATION.md](PROFILE_REFACTORING_IMPLEMENTATION.md) - Detailed technical documentation
- Component comments in source files
- API route documentation

---
**Last Updated**: April 21, 2026
**Status**: Complete and Ready for Testing
