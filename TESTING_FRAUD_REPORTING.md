# Testing the Fraud Reporting Feature

## 🚀 Quick Start

### 1. Start the Application
```bash
npm start
```

### 2. Sign In
- Navigate to `http://localhost:3000`
- Sign in with your Google account

### 3. Access Fraud Reporting
- Click on **Safety Center** → **Manual Fraud Reporting** in the sidebar

## 🧪 Test Scenarios

### Scenario 1: Submit a New Report
**Steps:**
1. Enter a valid Solana wallet address (e.g., `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`)
2. Select category: "Phishing"
3. Add a note: "This wallet sent me a fake airdrop link"
4. Complete the Turnstile verification
5. Click "Submit Fraud Report"

**Expected Result:**
- ✅ Green success message appears
- ✅ Message shows "Report submitted successfully..."
- ✅ Frequency shows "1 user"
- ✅ Form resets after 3 seconds

**Firestore Check:**
```javascript
// Document created in 'reports' collection
{
  walletAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  categories: ["Phishing"],
  reporters: ["your-email@gmail.com"],
  frequency: 1,
  notes: [{
    email: "your-email@gmail.com",
    note: "This wallet sent me a fake airdrop link",
    timestamp: Timestamp
  }],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

### Scenario 2: Report an Existing Wallet (Different User)
**Setup:** Have another user sign in

**Steps:**
1. Enter the SAME wallet address from Scenario 1
2. Select category: "Scam"
3. Add a note: "Tried to steal my private keys"
4. Complete Turnstile
5. Submit

**Expected Result:**
- ✅ Success message: "Report updated successfully. This wallet has been reported by 2 users."
- ✅ Frequency shows "2 users"

**Firestore Check:**
```javascript
// Document updated
{
  walletAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  categories: ["Phishing", "Scam"],  // New category added
  reporters: ["user1@gmail.com", "user2@gmail.com"],  // New reporter added
  frequency: 2,  // Incremented
  notes: [
    { email: "user1@gmail.com", note: "...", timestamp: T1 },
    { email: "user2@gmail.com", note: "...", timestamp: T2 }
  ],
  updatedAt: Timestamp  // Updated
}
```

---

### Scenario 3: Duplicate Report (Same User)
**Steps:**
1. Try to report the SAME wallet you already reported
2. Fill in all fields
3. Submit

**Expected Result:**
- ❌ Error message: "You have already reported this wallet address."
- ❌ No changes to Firestore
- ❌ Form does NOT reset

---

### Scenario 4: Invalid Wallet Address
**Test Cases:**

**Test 4a: Too Short**
- Input: `abc123`
- Expected: ❌ "Please enter a valid wallet address."

**Test 4b: Invalid Characters**
- Input: `0x123!@#$%^&*()`
- Expected: ❌ "Please enter a valid wallet address."

**Test 4c: Empty**
- Input: (leave blank)
- Expected: ❌ "Please enter a wallet address."

**Test 4d: Valid Ethereum Address**
- Input: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
- Expected: ✅ Should work (42 chars, starts with 0x)

---

### Scenario 5: Missing Required Fields

**Test 5a: No Category**
- Fill wallet address
- Skip category
- Complete Turnstile
- Submit
- Expected: ❌ "Please select a category."

**Test 5b: No Turnstile**
- Fill all fields
- Don't complete Turnstile
- Submit
- Expected: ❌ "Please complete the verification challenge."
- Button should be disabled

---

### Scenario 6: Optional Note Field

**Test 6a: No Note**
- Fill required fields only
- Submit
- Expected: ✅ Should work, notes array will be empty

**Test 6b: Long Note**
- Enter 500+ characters
- Expected: Input limited to 500 characters
- Character counter shows "500/500"

---

### Scenario 7: Form Reset

**Steps:**
1. Fill all fields
2. Submit successfully
3. Wait 3 seconds

**Expected Result:**
- ✅ All fields cleared
- ✅ Turnstile widget reset
- ✅ Success message disappears
- ✅ Ready for next report

---

## 🔍 Visual Testing

### Desktop (1920x1080)
- [ ] Form is centered and properly spaced
- [ ] All fields are clearly labeled
- [ ] Turnstile widget is centered
- [ ] Success/error messages are prominent
- [ ] Submit button has proper gradient and shadow

### Tablet (768x1024)
- [ ] Form adapts to smaller width
- [ ] No horizontal scrolling
- [ ] Touch targets are large enough
- [ ] Sidebar can be toggled

### Mobile (375x667)
- [ ] Form is fully responsive
- [ ] Input fields are easy to tap
- [ ] Turnstile widget fits on screen
- [ ] Success messages are readable

---

## 🎨 UI/UX Checklist

- [ ] **Smooth Animations**: Form has fade-in animation on load
- [ ] **Input Focus**: Cyan ring appears on focus
- [ ] **Disabled State**: Button is grayed out when submitting
- [ ] **Loading State**: Spinner appears during submission
- [ ] **Success Feedback**: Green banner with checkmark
- [ ] **Error Feedback**: Red banner with X icon
- [ ] **Character Counter**: Updates in real-time
- [ ] **Read-only Email**: Grayed out and non-editable
- [ ] **Hover Effects**: Button changes color on hover
- [ ] **Cursor States**: Pointer cursor on interactive elements

---

## 🔧 Developer Tools Testing

### Console Checks
Open browser console and verify:
- [ ] No errors on page load
- [ ] No errors on form submission
- [ ] Firestore operations log correctly
- [ ] Turnstile token is generated

### Network Tab
- [ ] Firestore write operations succeed (200/201)
- [ ] Turnstile verification loads
- [ ] No failed requests

### Firestore Console
Navigate to Firebase Console → Firestore Database
- [ ] 'reports' collection exists
- [ ] Documents have correct structure
- [ ] Timestamps are properly set
- [ ] Arrays are updated correctly

---

## 🐛 Common Issues & Solutions

### Issue: Turnstile doesn't load
**Solution:** Check internet connection and Cloudflare status

### Issue: "Permission denied" on Firestore
**Solution:** Update Firestore security rules (see FRAUD_REPORTING_GUIDE.md)

### Issue: Form doesn't reset
**Solution:** Check browser console for errors, verify Turnstile ref

### Issue: Duplicate reports allowed
**Solution:** Verify email comparison logic in fraudReportService.js

---

## 📊 Test Data Examples

### Valid Solana Addresses
```
7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK
EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

### Valid Ethereum Addresses
```
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed
0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359
```

### Invalid Addresses
```
abc123
0x123
not-a-wallet-address
7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU!!!
```

---

## ✅ Final Checklist

Before marking as complete:
- [ ] All 7 test scenarios pass
- [ ] Visual testing on 3 screen sizes complete
- [ ] UI/UX checklist items verified
- [ ] No console errors
- [ ] Firestore documents have correct structure
- [ ] Form resets properly after submission
- [ ] Turnstile verification works
- [ ] Success and error messages display correctly

---

**Happy Testing! 🎉**
