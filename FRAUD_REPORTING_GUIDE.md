# Manual Fraud Reporting Feature - Implementation Guide

## 🎯 Overview

A modern, responsive fraud reporting system that allows authenticated users to report suspicious wallet addresses. The system includes Cloudflare Turnstile verification to prevent bot submissions and stores all reports in Firestore with intelligent duplicate handling.

## ✨ Features Implemented

### 🎨 UI/UX
- ✅ Clean, minimal, and modern interface with smooth animations
- ✅ Adequate padding, spacing, and rounded input fields
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Professional color scheme matching the HALTT brand
- ✅ Smooth input animations and transitions
- ✅ Loading states and disabled states during submission

### 📝 Form Fields
1. **Wallet Address** (Required)
   - Text input with validation
   - Supports both Solana (base58, 32-44 chars) and Ethereum (0x..., 42 chars) addresses
   - Real-time validation feedback

2. **Category / Reason** (Required)
   - Dropdown selection
   - Options: Phishing, Scam, Fraud, Others

3. **Short Note / Explanation** (Optional)
   - Textarea with 500 character limit
   - Character counter
   - Resizable disabled for consistent UI

4. **User Email** (Auto-fetched)
   - Non-editable field
   - Automatically populated from authenticated user's account
   - Grayed out to indicate read-only status

5. **Cloudflare Turnstile Verification** (Required)
   - Dark theme integration
   - Prevents bot submissions
   - Auto-reset on form submission

### ⚙️ Functionality

#### Smart Duplicate Handling
- **New Wallet Address**: Creates a new document with frequency = 1
- **Existing Wallet Address**:
  - Increments frequency counter
  - Adds reporter's email to reporters array (prevents duplicate reports from same user)
  - Appends new category if it doesn't exist
  - Adds note to notes array with timestamp

#### Firestore Structure
```javascript
// Collection: 'reports'
{
  walletAddress: "wallet_address_here",
  categories: ["Phishing", "Scam", ...],
  reporters: ["user1@example.com", "user2@example.com", ...],
  frequency: 2,
  notes: [
    { 
      email: "user1@example.com", 
      note: "...", 
      timestamp: Timestamp 
    }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### ✅ Post-Submission Features
- **Success Confirmation**: Green banner with checkmark icon
- **Error Handling**: Red banner with error details
- **Frequency Display**: Shows how many users have reported the wallet
- **Auto-Reset**: Form automatically resets after 3 seconds
- **Turnstile Reset**: Verification widget resets for next submission

## 📁 Files Created/Modified

### New Files
1. **`src/services/fraudReportService.js`**
   - `submitFraudReport()` - Main submission function
   - `getAllFraudReports()` - Admin function to fetch all reports
   - `checkWalletReport()` - Check if a wallet has been reported

2. **`FRAUD_REPORTING_GUIDE.md`** (this file)
   - Complete documentation

### Modified Files
1. **`src/components/tabs/ManualFraudReporting.js`**
   - Complete form implementation
   - State management
   - Validation logic
   - Success/error handling

## 🔧 Dependencies Installed

```bash
npm install react-turnstile
```

## 🚀 Usage

### For Users
1. Navigate to **Safety Center** → **Manual Fraud Reporting** in the sidebar
2. Fill in the wallet address you want to report
3. Select the appropriate category
4. Optionally add a note with details
5. Complete the Cloudflare Turnstile verification
6. Click "Submit Fraud Report"
7. See success confirmation and report frequency

### For Developers

#### Submitting a Report
```javascript
import { submitFraudReport } from '../services/fraudReportService';

const result = await submitFraudReport(
  walletAddress,  // string
  category,       // "Phishing" | "Scam" | "Fraud" | "Others"
  note,          // string (optional)
  userEmail      // string
);

// Result object
{
  success: true,
  message: "Report submitted successfully...",
  frequency: 1,
  alreadyReported: false  // Only present if user already reported
}
```

#### Checking a Wallet
```javascript
import { checkWalletReport } from '../services/fraudReportService';

const report = await checkWalletReport(walletAddress);
// Returns report data or null
```

## 🔐 Security Features

1. **Authentication Required**: Only authenticated users can submit reports
2. **Cloudflare Turnstile**: Prevents bot submissions
3. **Duplicate Prevention**: Users cannot report the same wallet twice
4. **Input Validation**: Client-side validation for wallet addresses
5. **Firestore Security Rules**: Should be configured to restrict write access

## 📊 Firestore Security Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reports/{reportId} {
      // Allow authenticated users to create reports
      allow create: if request.auth != null 
        && request.resource.data.reporters.size() == 1
        && request.auth.token.email in request.resource.data.reporters;
      
      // Allow authenticated users to update if they're adding themselves
      allow update: if request.auth != null
        && request.auth.token.email in request.resource.data.reporters
        && !(request.auth.token.email in resource.data.reporters);
      
      // Allow read for authenticated users
      allow read: if request.auth != null;
    }
  }
}
```

## 🎨 Design Highlights

- **Gradient Header Icon**: Red gradient background with white flag icon
- **Animated Messages**: Fade-in animations for success/error messages
- **Disabled States**: Visual feedback when form is submitting
- **Loading Spinner**: Animated loader during submission
- **Character Counter**: Real-time feedback for note field
- **Validation Feedback**: Clear error messages for invalid inputs
- **Info Section**: "How It Works" section at the bottom

## 🧪 Testing Checklist

- [ ] Submit report for new wallet address
- [ ] Submit report for existing wallet address
- [ ] Try to submit duplicate report (same user, same wallet)
- [ ] Test with invalid wallet address
- [ ] Test without selecting category
- [ ] Test without completing Turnstile
- [ ] Test form reset after successful submission
- [ ] Test responsive design on mobile
- [ ] Test with very long notes (500 char limit)
- [ ] Verify Firestore document structure

## 🐛 Known Limitations

1. **Turnstile Site Key**: Currently using a test site key (`0x4AAAAAAAzLWN8BCoKLlJLq`). Replace with your production key.
2. **Server-Side Verification**: Turnstile token should be verified server-side for production use.
3. **Rate Limiting**: Consider implementing rate limiting to prevent abuse.

## 🔄 Future Enhancements

- [ ] Admin dashboard to review reports
- [ ] Email notifications for high-frequency reports
- [ ] Integration with blockchain explorers
- [ ] Report status tracking (pending, reviewed, confirmed)
- [ ] Bulk import of known fraudulent addresses
- [ ] API endpoint for external integrations
- [ ] Analytics dashboard for fraud trends

## 📞 Support

For issues or questions, please refer to the main project documentation or contact the development team.

---

**Built with ❤️ for the HALTT Security Platform**
