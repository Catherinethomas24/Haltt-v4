# Firestore Wallet Integration Guide

## Overview
This document explains the automatic wallet storage feature implemented in the Haltt project. When users connect their wallets, the wallet addresses are automatically stored in Firebase Firestore without requiring any additional user action.

## Database Structure

### Collection: `users`
Each user document is identified by their email address and contains:

```javascript
{
  email: "user@example.com",
  wallets: [
    {
      address: "wallet_address_or_public_key",
      type: "solana" | "ethereum",
      name: "Phantom" | "MetaMask" | "Solflare" | "Backpack",
      connectedAt: Timestamp
    }
  ],
  createdAt: Timestamp,
  lastUpdated: Timestamp
}
```

## Implementation Details

### Files Modified/Created

1. **`src/firebase.js`**
   - Enabled Firestore imports
   - Exported `db` instance for use throughout the app

2. **`src/services/walletService.js`** (NEW)
   - Contains all Firestore wallet management functions
   - Functions:
     - `initializeUserDocument(email)` - Creates user document on first login
     - `addWalletToUser(email, walletData)` - Adds wallet to user's list
     - `removeWalletFromUser(email, walletAddress)` - Removes wallet from user's list
     - `getUserWallets(email)` - Retrieves all wallets for a user
     - `syncWalletsToFirestore(email, connectedWallets)` - Syncs multiple wallets

3. **`src/components/Dashboard.js`**
   - Imported wallet service functions
   - Added Firestore sync in `connectWallet()` function
   - Added Firestore removal in `disconnectWallet()` function
   - Added user document initialization on login

## How It Works

### 1. User Signs In with Google
```javascript
// Automatically triggered when user object is available
useEffect(() => {
  if (user?.email) {
    initializeUserDocument(user.email);
  }
}, [user]);
```
- Creates a new document in Firestore with the user's email
- Document is created only once (checked before creation)

### 2. User Connects a Wallet
```javascript
// Inside connectWallet() function
if (user?.email) {
  await syncWalletsToFirestore(user.email, [newWallet]);
}
```
- When user clicks "Connect Wallet" and approves in their wallet extension
- Wallet address is automatically saved to Firestore
- Duplicate wallets are prevented (checked before adding)

### 3. User Disconnects a Wallet
```javascript
// Inside disconnectWallet() function
if (user?.email) {
  await removeWalletFromUser(user.email, uniqueKey);
}
```
- When user clicks the remove button on a wallet card
- Wallet is removed from both UI and Firestore

## Testing the Implementation

### Step 1: Enable Firestore in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `haltt-c7632`
3. Navigate to **Firestore Database** in the left sidebar
4. Click **Create Database**
5. Choose **Start in test mode** (for development)
6. Select a location (e.g., `us-central`)
7. Click **Enable**

### Step 2: Set Up Firestore Rules (Important!)
In the Firebase Console, go to **Firestore Database > Rules** and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own document
    match /users/{email} {
      allow read, write: if request.auth != null && request.auth.token.email == email;
    }
  }
}
```

### Step 3: Test the Feature
1. **Start your app:**
   ```bash
   npm start
   ```

2. **Sign in with Google**
   - Open the app in your browser
   - Click "Sign in with Google"
   - Check the browser console for: `✅ New user document created for: [email]`

3. **Connect a wallet:**
   - Click "Connect Wallet" button
   - Select a wallet (Phantom, Solflare, etc.)
   - Approve the connection in the wallet extension
   - Check console for: `✅ Wallet added successfully: [address]`

4. **Verify in Firebase Console:**
   - Go to Firestore Database in Firebase Console
   - You should see a `users` collection
   - Click on your email document
   - Verify the `wallets` array contains your connected wallet

5. **Test disconnection:**
   - Hover over a connected wallet card
   - Click the trash icon
   - Check console for: `✅ Wallet removed successfully: [address]`
   - Verify in Firebase Console that the wallet is removed

## Console Messages

### Success Messages:
- ✅ `New user document created for: [email]`
- ✅ `User document already exists for: [email]`
- ✅ `Wallet added successfully: [address]`
- ✅ `Wallet removed successfully: [address]`
- ✅ `Wallets synced to Firestore`

### Info Messages:
- ℹ️ `Wallet already exists in database: [address]`

### Error Messages:
- ❌ `Error initializing user document: [error]`
- ❌ `Error adding wallet: [error]`
- ❌ `Error removing wallet: [error]`

## Security Considerations

1. **Authentication Required:**
   - All Firestore operations require user authentication
   - Users can only access their own data

2. **Email as Document ID:**
   - Using email as document ID ensures uniqueness
   - Easy to query and manage

3. **No Sensitive Data:**
   - Only public wallet addresses are stored
   - No private keys or seed phrases are ever stored

4. **Automatic Updates:**
   - No user interaction required after initial wallet connection
   - Seamless experience

## Future Enhancements

1. **Wallet History:**
   - Track connection/disconnection timestamps
   - Show wallet usage analytics

2. **Multi-Device Sync:**
   - Load previously connected wallets on new devices
   - Auto-reconnect feature

3. **Wallet Nicknames:**
   - Allow users to add custom names to wallets
   - Better organization for multiple wallets

4. **Transaction History Storage:**
   - Store important transactions in Firestore
   - Quick access without blockchain queries

## Troubleshooting

### Issue: "Permission denied" error
**Solution:** Check Firestore rules and ensure user is authenticated

### Issue: Wallet not saving
**Solution:** 
- Check browser console for errors
- Verify Firestore is enabled in Firebase Console
- Ensure user is signed in (check `user?.email`)

### Issue: Duplicate wallets
**Solution:** The code already prevents duplicates, but if it happens:
- Check the `addWalletToUser` function
- Verify wallet address comparison logic

### Issue: Wallet not removed
**Solution:**
- Check if `disconnectWallet` is async
- Verify the wallet address matches exactly

## Code Examples

### Manually Add a Wallet (if needed)
```javascript
import { addWalletToUser } from '../services/walletService';

const manuallyAddWallet = async () => {
  const walletData = {
    address: "YourWalletAddressHere",
    type: "solana",
    name: "Phantom"
  };
  
  await addWalletToUser(user.email, walletData);
};
```

### Get All User Wallets
```javascript
import { getUserWallets } from '../services/walletService';

const loadWallets = async () => {
  const wallets = await getUserWallets(user.email);
  console.log('User wallets:', wallets);
};
```

## Summary

The wallet storage feature is now fully integrated and works automatically:
- ✅ User signs in → Document created
- ✅ User connects wallet → Wallet saved
- ✅ User disconnects wallet → Wallet removed
- ✅ No user interaction required
- ✅ Secure and efficient

All wallet operations are logged to the console for easy debugging and monitoring.
