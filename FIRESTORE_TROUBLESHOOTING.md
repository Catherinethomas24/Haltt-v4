# Firestore Troubleshooting Guide

## Issue: Users Collection Not Appearing

### Quick Diagnosis Steps

#### 1. Check Browser Console (F12)
Open your browser console and look for these messages:

**✅ Success Messages (Good):**
```
🔥 User detected, initializing Firestore document for: [email]
✅ User document initialization complete
✅ New user document created for: [email]
```

**❌ Error Messages (Problem):**
```
❌ Error initializing user document: [error]
❌ Error details: permission-denied
🔒 PERMISSION DENIED - Check your Firestore Rules!
```

#### 2. Run Test Function
In your browser console, type:
```javascript
window.testFirestore()
```

This will test the Firestore connection and show detailed error messages.

---

## Common Issues & Solutions

### Issue 1: Permission Denied Error

**Symptom:** Console shows `permission-denied` error

**Cause:** Firestore security rules are blocking writes

**Solution:** Update Firestore Rules in Firebase Console

1. Go to Firebase Console → Firestore Database → Rules tab
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own document
    match /users/{email} {
      allow read, write: if request.auth != null && 
                          request.auth.token.email == email;
    }
  }
}
```

3. Click **Publish**
4. Refresh your app and try again

---

### Issue 2: Firestore Not Initialized

**Symptom:** Error like "Firestore has not been initialized"

**Cause:** Firestore database not created in Firebase Console

**Solution:**
1. Go to Firebase Console
2. Click **Firestore Database** in left sidebar
3. Click **Create Database**
4. Choose **Test Mode** (for development)
5. Select a location (e.g., us-central)
6. Click **Enable**

---

### Issue 3: No Console Messages

**Symptom:** No Firestore-related messages in console at all

**Cause:** Code might not be running or user not signed in

**Solution:**
1. Make sure you're signed in with Google
2. Check if `user?.email` exists:
   ```javascript
   // In browser console
   console.log(window.location)
   ```
3. Hard refresh the page (Ctrl+Shift+R)

---

### Issue 4: Test Mode Rules Expired

**Symptom:** Error after 30 days: "permission-denied"

**Cause:** Test mode rules expire after 30 days

**Solution:** Update to production rules (see Issue 1 solution)

---

## Step-by-Step Debugging

### Step 1: Verify User is Signed In
```javascript
// In browser console
console.log('User signed in?', !!window.firebase?.auth?.currentUser)
```

### Step 2: Check Firestore Instance
```javascript
// In browser console
window.testFirestore()
```

### Step 3: Manual Test Write
Open browser console and run:
```javascript
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

const testDoc = doc(db, 'test', 'test123');
await setDoc(testDoc, { test: 'Hello Firestore!' });
console.log('✅ Test write successful!');
```

### Step 4: Check Network Tab
1. Open DevTools → Network tab
2. Filter by "firestore"
3. Look for requests to Firestore
4. Check if they return 200 (success) or 403 (permission denied)

---

## Most Likely Solution

**90% of the time, it's the Firestore Rules!**

### Quick Fix:
1. Firebase Console → Firestore Database → Rules
2. Use these rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
3. Click **Publish**
4. Refresh your app

⚠️ **Note:** The above rules allow any authenticated user to read/write everything. Use the more specific rules from Issue 1 for production.

---

## Verification Checklist

- [ ] Firestore Database is enabled in Firebase Console
- [ ] Firestore Rules are set (not default deny-all)
- [ ] User is signed in with Google (check console)
- [ ] Browser console shows no errors
- [ ] Network tab shows Firestore requests (not blocked)
- [ ] `window.testFirestore()` runs successfully

---

## Still Not Working?

### Check These:

1. **Firebase Project ID:** Make sure you're looking at the correct project in Firebase Console (`haltt-c7632`)

2. **Browser Cache:** Clear cache and hard refresh (Ctrl+Shift+R)

3. **Ad Blockers:** Disable ad blockers that might block Firebase

4. **Network Issues:** Check if you can access `firestore.googleapis.com`

5. **Firebase SDK Version:** Check if Firebase packages are installed:
   ```bash
   npm list firebase
   ```

---

## Getting Help

If still stuck, provide these details:

1. **Console Output:** Copy all console messages (especially errors)
2. **Firestore Rules:** Screenshot of your current rules
3. **Network Tab:** Screenshot showing Firestore requests
4. **Test Function Result:** Output of `window.testFirestore()`

---

## Expected Behavior

When everything works correctly:

1. **Sign In:** 
   - Console: `🔥 User detected, initializing Firestore document for: [email]`
   - Console: `✅ User document initialization complete`

2. **Connect Wallet:**
   - Console: `✅ Wallet added successfully: [address]`

3. **Firebase Console:**
   - Firestore → Data tab → `users` collection appears
   - Document with your email as ID
   - Contains `wallets` array

---

## Quick Test Script

Run this in browser console after signing in:

```javascript
// Test Firestore connection
window.testFirestore().then(success => {
  if (success) {
    console.log('🎉 Firestore is working! Check Firebase Console now.');
  } else {
    console.log('❌ Firestore test failed. Check errors above.');
  }
});
```
