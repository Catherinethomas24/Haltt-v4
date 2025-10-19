# 🔍 Audit Logs Diagnostic Guide

## The Console Errors Are NOT the Problem

All those errors you're seeing are **NORMAL** and **NOT related to audit logs**:
- ❌ Extension errors (solanaActionsContentScript, contentScript) - Browser extensions
- ❌ RPC errors (403, CORS) - Public Solana endpoints being rate-limited
- ❌ These don't affect audit logging functionality

## The REAL Issue: Firestore Permissions

The important error is:
```
firestore.googleapis.com/...Write/channel... 400
```

This means **Firestore rules are blocking writes**.

## 🚀 SOLUTION: Update Firestore Rules

### Step 1: Go to Firebase Console
1. Visit: https://console.firebase.google.com/
2. Select project: **haltt-c7632**
3. Click **Firestore Database** in left sidebar
4. Click **Rules** tab at the top

### Step 2: Replace Rules with This:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.token.email == userId;
    }
    
    // Audit Logs collection - users can read/write their own logs
    match /auditLogs/{logId} {
      allow read: if request.auth != null && 
                     request.auth.token.email == resource.data.userId;
      allow create: if request.auth != null && 
                       request.auth.token.email == request.resource.data.userId;
      allow update, delete: if false;
    }
    
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 3: Publish Rules
Click **Publish** button

### Step 4: Test Immediately

1. **Hard refresh your app**: `Ctrl + Shift + R`
2. **Connect a wallet**
3. **Go to Audit Logs tab**
4. **You should see the log entry!**

---

## 🧪 Quick Test in Firebase Console

### Verify Audit Logs Are Being Created:

1. Go to Firebase Console → Firestore Database
2. Click **Data** tab
3. Look for `auditLogs` collection
4. Connect a wallet in your app
5. Refresh Firestore console
6. You should see a new document appear!

**Document structure should look like:**
```
auditLogs/
  └── [auto-generated-id]/
      ├── userId: "your-email@gmail.com"
      ├── walletAddress: "Az2a7t..."
      ├── walletName: "Phantom"
      ├── walletType: "solana"
      ├── action: "connected"
      ├── timestamp: [Timestamp]
      └── metadata: {...}
```

---

## 🔍 Debugging Steps

### Test 1: Check if User is Authenticated
Open browser console and run:
```javascript
firebase.auth().currentUser
```
Should show your user object with email.

### Test 2: Manually Test Firestore Write
Open browser console and run:
```javascript
// Test if you can write to Firestore
const testDoc = {
  userId: "YOUR_EMAIL_HERE",
  test: true,
  timestamp: new Date()
};

firebase.firestore().collection('auditLogs').add(testDoc)
  .then(() => console.log('✅ Write successful!'))
  .catch(err => console.error('❌ Write failed:', err));
```

If this fails, it's definitely a permissions issue.

### Test 3: Check Current Rules
1. Go to Firebase Console → Firestore → Rules
2. Check what rules are currently active
3. If they're too restrictive, update them as shown above

---

## 📊 Expected Behavior After Fix

### When you connect a wallet:

**In Firestore Console:**
- New document appears in `auditLogs` collection
- Document has all required fields
- Timestamp is set

**In Your App:**
- Audit Logs tab shows green "Wallet Connected" entry
- Timestamp shows "Just now"
- Wallet name and address displayed
- Statistics update (Total: 1, Connected: 1)

**In Browser Console:**
- No Firestore permission errors
- Only the normal extension/RPC errors (which are harmless)

---

## ⚠️ Common Mistakes

### ❌ Wrong: Overly Permissive Rules
```javascript
// DON'T USE THIS (security risk)
allow read, write: if true;
```

### ✅ Correct: User-Specific Rules
```javascript
// USE THIS (secure)
allow read: if request.auth != null && 
               request.auth.token.email == resource.data.userId;
```

---

## 🎯 Success Checklist

After updating Firestore rules, verify:
- [ ] Can connect wallet without errors
- [ ] Audit Logs tab shows connection entry
- [ ] Entry has green color and wallet icon
- [ ] Timestamp is accurate
- [ ] Can disconnect and see red entry
- [ ] Filters work correctly
- [ ] Statistics show correct counts
- [ ] Logs persist after page refresh

---

## 💡 Pro Tip: Use Firestore Emulator for Testing

For local development without hitting production:
```bash
firebase emulators:start --only firestore
```

Then update your Firebase config to use emulator.

---

## 🆘 Still Not Working?

If audit logs still don't appear after updating rules:

1. **Check Firebase Console → Firestore → Data**
   - Is `auditLogs` collection being created?
   - Are documents appearing when you connect wallet?

2. **Check Browser DevTools → Network Tab**
   - Filter by "firestore"
   - Look for 403 or 400 errors
   - Check request/response details

3. **Temporarily Use Permissive Rules** (for testing only):
   ```javascript
   match /auditLogs/{logId} {
     allow read, write: if request.auth != null;
   }
   ```

4. **Check Firebase Authentication**
   - Is user properly signed in?
   - Does user have an email?
   - Check: `firebase.auth().currentUser.email`

---

## 📝 Summary

**The issue is NOT the console errors** - those are normal.

**The issue IS Firestore permissions** - fix with proper rules.

**After fixing rules:**
- Audit logs will work immediately
- No code changes needed
- Everything will function as designed

**Update the Firestore rules and test again!** 🚀
