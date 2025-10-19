# Wallet Storage Testing Guide

## How to Test Wallet Storage

### Step 1: Clear Browser Console
1. Open your app in the browser
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Click the 🚫 icon to clear console

### Step 2: Connect a Wallet
1. Click **"Connect Wallet"** button in your app
2. Select a wallet (Phantom, Solflare, MetaMask, etc.)
3. Approve the connection in the wallet extension

### Step 3: Check Console Messages

You should see these messages in order:

```
💾 Attempting to save wallet to Firestore...
📧 User email: your-email@gmail.com
🔑 Wallet address: ABC123XYZ...
📦 Wallet data: { name: "Phantom", type: "solana", publicKey: "ABC123...", ... }

🔄 syncWalletsToFirestore called
📧 Email: your-email@gmail.com
💼 Connected wallets: [{ ... }]

🔧 addWalletToUser called with: { email: "...", walletData: { ... } }
📊 Current user data: { email: "...", wallets: [...], ... }
💾 Adding wallet entry: { address: "...", type: "solana", name: "Phantom", ... }

✅ Wallet added successfully: ABC123XYZ...
✅ Wallets synced to Firestore
✅ Wallet saved to Firestore successfully!
```

### Step 4: Verify in Firebase Console

1. Go to Firebase Console → Firestore Database → Data tab
2. Click on `users` collection
3. Click on your email document
4. You should see:
   ```javascript
   {
     email: "your-email@gmail.com",
     wallets: [
       {
         address: "ABC123XYZ...",
         type: "solana",
         name: "Phantom",
         connectedAt: Timestamp
       }
     ],
     createdAt: Timestamp,
     lastUpdated: Timestamp
   }
   ```

---

## Common Issues & Solutions

### Issue 1: No Console Messages After Connecting Wallet

**Possible Causes:**
- Wallet connection failed
- JavaScript error preventing code execution

**Solution:**
1. Check console for any red error messages
2. Try refreshing the page and connecting again
3. Make sure wallet extension is unlocked

---

### Issue 2: Console Shows "⚠️ Missing email or wallets, skipping sync"

**Possible Causes:**
- User not signed in
- Wallet data not properly formatted

**Solution:**
1. Make sure you're signed in with Google
2. Check if `user?.email` exists:
   ```javascript
   // In console
   console.log('User email:', window.location)
   ```

---

### Issue 3: Console Shows "❌ Error adding wallet: permission-denied"

**Possible Causes:**
- Firestore Rules not set correctly

**Solution:**
Update Firestore Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{email} {
      allow read, write: if request.auth != null && 
                          request.auth.token.email == email;
    }
  }
}
```

---

### Issue 4: Wallet Shows in UI but Not in Firestore

**Possible Causes:**
- Silent error in Firestore write
- Network issue

**Solution:**
1. Check Network tab in DevTools
2. Look for requests to `firestore.googleapis.com`
3. Check if they return 200 (success) or error codes
4. Run test function:
   ```javascript
   window.testFirestore()
   ```

---

## Expected Flow

```
User clicks "Connect Wallet"
         ↓
Wallet extension opens
         ↓
User approves connection
         ↓
Wallet address retrieved
         ↓
syncWalletsToFirestore() called
         ↓
addWalletToUser() called
         ↓
Firestore updated
         ↓
Success! ✅
```

---

## Debug Commands

Run these in browser console to debug:

### Check if user is signed in:
```javascript
console.log('User email:', window.location)
```

### Test Firestore connection:
```javascript
window.testFirestore()
```

### Check connected wallets:
```javascript
// This won't work directly, but you can see them in the UI
```

---

## What Each Log Message Means

| Message | Meaning |
|---------|---------|
| 💾 Attempting to save wallet | Starting wallet save process |
| 📧 User email | Shows which user document will be updated |
| 🔑 Wallet address | The public key/address being saved |
| 🔄 syncWalletsToFirestore called | Sync function started |
| 🔧 addWalletToUser called | Adding wallet to database |
| 📊 Current user data | Shows existing data in Firestore |
| 💾 Adding wallet entry | The exact data being written |
| ✅ Wallet added successfully | Write succeeded! |
| ❌ Error | Something went wrong (check details) |

---

## Success Checklist

After connecting a wallet, verify:

- [ ] Console shows "💾 Attempting to save wallet..."
- [ ] Console shows "✅ Wallet added successfully"
- [ ] Console shows "✅ Wallet saved to Firestore successfully!"
- [ ] No red error messages in console
- [ ] Firebase Console shows wallet in `wallets` array
- [ ] Wallet address matches what's shown in UI

---

## Next Steps

Once wallet storage is working:

1. **Test Multiple Wallets:**
   - Connect a second wallet
   - Verify both appear in Firestore
   - Check that duplicates are prevented

2. **Test Disconnection:**
   - Hover over a wallet card
   - Click the trash icon
   - Verify wallet is removed from Firestore

3. **Test Persistence:**
   - Refresh the page
   - Sign in again
   - Check if wallets are still in Firestore

---

## Need Help?

If you see errors, provide:
1. Full console output (copy all messages)
2. Screenshot of Firebase Console showing the document
3. Any error messages in red
4. Which wallet you're trying to connect (Phantom, Solflare, etc.)
