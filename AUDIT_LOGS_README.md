# Audit Logs Feature

## Overview
The Audit Logs feature tracks all wallet connection and disconnection activities with Firebase Firestore persistence. Users can view their complete wallet activity history, even after months of inactivity.

## Features

### ✅ Implemented
- **Real-time Activity Tracking**: Automatically logs wallet connections and disconnections
- **Firebase Persistence**: All logs stored in Firestore for long-term retention
- **Historical View**: Users can view all past activities, even after extended periods
- **Visual Indicators**:
  - 🟢 Green for successful connections
  - 🔴 Red for disconnections
  - 💼 Wallet icon for each entry
- **Smart Timestamps**: Relative time display (e.g., "2 minutes ago") with full timestamp on hover
- **Filter System**: Filter by all events, connections only, or disconnections only
- **Statistics Dashboard**: Shows total events, connections, and disconnections
- **Responsive Design**: Mobile-friendly UI matching the dashboard's aesthetic
- **Refresh Functionality**: Manual refresh button to fetch latest logs

## Data Structure

### Firestore Collection: `auditLogs`
```javascript
{
  userId: "user@example.com",
  walletAddress: "Az2a7tJqzphDJDSzmB3bSwK7BHN3PsP61Muz6q6hMyyi",
  walletName: "Phantom",
  walletType: "solana",
  action: "connected", // or "disconnected"
  timestamp: Timestamp,
  metadata: {
    userAgent: "...",
    platform: "..."
  }
}
```

## Usage

### Automatic Logging
Logs are automatically created when:
1. User connects a wallet → Creates "connected" log
2. User disconnects a wallet → Creates "disconnected" log

### Viewing Logs
1. Navigate to **Audit Logs** tab from the sidebar
2. View all activities in chronological order (newest first)
3. Use filter buttons to show specific event types
4. Click refresh to fetch latest logs
5. Hover over timestamps to see full date/time

## Firestore Indexes Required

The feature requires composite indexes for efficient querying. Deploy these indexes:

```bash
firebase deploy --only firestore:indexes
```

Indexes are defined in `firestore.indexes.json`:
- `userId` + `timestamp` (descending)
- `userId` + `walletAddress` + `timestamp` (descending)

## API Functions

### `logWalletConnection(userId, walletData)`
Logs a wallet connection event.

**Parameters:**
- `userId` (string): User's email
- `walletData` (object): Wallet information including name, type, address

**Returns:** Promise<string> - Document ID

### `logWalletDisconnection(userId, walletAddress, walletName, walletType)`
Logs a wallet disconnection event.

**Parameters:**
- `userId` (string): User's email
- `walletAddress` (string): Wallet address
- `walletName` (string): Wallet name (e.g., "Phantom")
- `walletType` (string): Wallet type ("solana" or "ethereum")

**Returns:** Promise<string> - Document ID

### `getUserAuditLogs(userId, maxLogs)`
Retrieves audit logs for a user.

**Parameters:**
- `userId` (string): User's email
- `maxLogs` (number): Maximum logs to retrieve (default: 100)

**Returns:** Promise<Array> - Array of log entries

### `getWalletAuditLogs(userId, walletAddress, maxLogs)`
Retrieves audit logs for a specific wallet.

**Parameters:**
- `userId` (string): User's email
- `walletAddress` (string): Wallet address
- `maxLogs` (number): Maximum logs to retrieve (default: 50)

**Returns:** Promise<Array> - Array of log entries

## UI Components

### Header
- Title with icon
- Subtitle describing functionality
- Refresh button with loading state

### Filter Bar
- All Events button (cyan)
- Connected button (green)
- Disconnected button (red)
- Shows count for each filter

### Log Entries
Each entry displays:
- Colored circular icon with wallet symbol
- Action text (Connected/Disconnected)
- Wallet name and truncated address
- Relative timestamp with full date on hover
- Badge showing wallet type (SOLANA/ETHEREUM)

### Statistics Footer
- Total Events count
- Total Connections count (green)
- Total Disconnections count (red)

## Design Consistency

The UI matches the dashboard's visual style:
- **Colors**: Cyan primary, green for success, red for errors
- **Typography**: Premium heading and body fonts
- **Glassmorphism**: Backdrop blur and transparency
- **Borders**: Cyan-tinted borders with low opacity
- **Spacing**: Consistent padding and margins
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design with breakpoints

## Error Handling

All errors are silently caught to maintain clean console output:
- Failed Firestore writes don't block wallet operations
- Failed reads show empty state with helpful message
- Network errors handled gracefully

## Performance Considerations

- Logs limited to 100 most recent entries by default
- Queries use Firestore indexes for fast retrieval
- Timestamps use server-side generation for accuracy
- Component uses React hooks for efficient re-renders

## Future Enhancements

Potential additions:
- Export logs to CSV/JSON
- Advanced filtering (date ranges, wallet types)
- Search functionality
- Real-time updates using Firestore listeners
- Pagination for very large log histories
- Log retention policies
- Additional event types (transactions, security alerts)
