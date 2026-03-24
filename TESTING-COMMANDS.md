# CareerCanvas LMS - Testing Commands

## 🧪 Browser Console Tests

Open your browser console (F12) and run these commands to test the APIs:

### 1. Test Dashboard API
```javascript
// Test Dashboard
fetch('/api/dashboard', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Dashboard API Response:', data);
  if (data.user) {
    console.log('👤 User:', data.user.name, '(' + data.user.role + ')');
    console.log('📊 Stats:', data.stats);
  }
})
.catch(err => console.error('❌ Dashboard Error:', err));
```

### 2. Test My Classes API
```javascript
// Test My Classes
fetch('/api/my-classes', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ My Classes API Response:', data);
  if (data.success) {
    console.log('📚 Courses Count:', data.count);
    console.log('📋 Enrollments:', data.enrollments);
  }
})
.catch(err => console.error('❌ My Classes Error:', err));
```

### 3. Test Authentication
```javascript
// Check if user is logged in
const token = localStorage.getItem('token');
if (token) {
  console.log('✅ User is logged in');
  console.log('🔑 Token exists:', token.substring(0, 20) + '...');
} else {
  console.log('❌ User not logged in');
  console.log('💡 Please login first');
}
```

### 4. Test YouTube Utility
```javascript
// Test YouTube URL conversion (if you have videos)
const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
console.log('🎥 Original URL:', testUrl);
console.log('🔗 Embed URL:', getYouTubeEmbedUrl(testUrl));
console.log('🖼️ Thumbnail:', getYouTubeThumbnail('dQw4w9WgXcQ'));
```

## 🔍 Expected Results

### Dashboard API Success:
```json
{
  "user": {
    "_id": "...",
    "name": "User Name",
    "email": "user@example.com",
    "role": "student"
  },
  "stats": { ... },
  "recentEnrollments": [...],
  "unreadNotifications": 0
}
```

### My Classes API Success:
```json
{
  "success": true,
  "enrollments": [
    {
      "_id": "...",
      "title": "Course Title",
      "status": "in-progress",
      "progress": 45
    }
  ],
  "count": 1
}
```

## 🚨 Common Issues & Solutions

### Issue: "Unauthorized" Error
**Solution:** Make sure you're logged in
```javascript
// Login first, then test
window.location.href = '/login';
```

### Issue: "Internal server error"
**Solution:** Check if MongoDB is connected
```javascript
// Test database connection
fetch('/api/health')
.then(r => r.json())
.then(data => console.log('🏥 Health:', data));
```

### Issue: Empty enrollments array
**Solution:** This is normal if user hasn't enrolled in any courses
```javascript
// This is expected for new users
console.log('ℹ️ User has no enrollments yet');
```

## 📱 Page Navigation Tests

### Test My Classes Page
1. Go to: `http://localhost:3000/myclasses`
2. Should show:
   - Loading spinner first
   - Then either courses or "No Courses Yet" message
   - No console errors

### Test Dashboard
1. Go to: `http://localhost:3000/dashboard`
2. Should show user stats and recent activity

## ✅ Success Checklist

- [ ] Dashboard API returns user data
- [ ] My Classes API returns enrollments
- [ ] My Classes page loads without errors
- [ ] YouTube utility functions work
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Pages load quickly
- [ ] Dark mode works properly

## 🎯 Next Steps

If all tests pass:
1. ✅ APIs are working
2. ✅ Frontend is connected
3. ✅ Ready for production

If tests fail:
1. Check authentication
2. Verify database connection
3. Check console for detailed errors