# RPC Setup Guide - Fix Transaction Fetching Issues

## Problem
Public Solana RPC endpoints are heavily rate-limited and often return 403 errors, causing transaction fetching to fail.

## Solution: Get a Free RPC API Key

### Option 1: Helius (Recommended - Best Free Tier)

1. **Sign up for free**: https://www.helius.dev/
2. **Create account** (takes 2 minutes)
3. **Get your API key** from the dashboard
4. **Update Dashboard.js**:

```javascript
const rpcEndpoints = {
    'mainnet-beta': [
        'https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY_HERE',
        'https://solana-mainnet.rpc.extrnode.com',
        'https://api.mainnet-beta.solana.com',
        'https://solana.public-rpc.com'
    ],
    // ...
};
```

**Free Tier Limits:**
- 100,000 requests/month
- More than enough for personal use

### Option 2: QuickNode (Also Good)

1. **Sign up**: https://www.quicknode.com/
2. **Create a Solana Mainnet endpoint**
3. **Copy your HTTP endpoint**
4. **Add to Dashboard.js**:

```javascript
const rpcEndpoints = {
    'mainnet-beta': [
        'https://YOUR-ENDPOINT.solana-mainnet.quiknode.pro/YOUR_TOKEN/',
        'https://mainnet.helius-rpc.com/?api-key=public',
        // ...
    ],
};
```

### Option 3: Alchemy

1. **Sign up**: https://www.alchemy.com/
2. **Create a Solana app**
3. **Get your API key**
4. **Add to Dashboard.js**:

```javascript
const rpcEndpoints = {
    'mainnet-beta': [
        'https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
        // ...
    ],
};
```

## Current RPC Endpoints (Updated)

The app now uses these endpoints in order:

### Mainnet:
1. `https://solana-mainnet.rpc.extrnode.com` - Free, no key needed
2. `https://mainnet.helius-rpc.com/?api-key=public` - Public key (limited)
3. `https://api.mainnet-beta.solana.com` - Official (heavily rate-limited)
4. `https://solana.public-rpc.com` - Backup

### Devnet:
1. `https://api.devnet.solana.com` - Official devnet
2. `https://devnet.helius-rpc.com/?api-key=public` - Helius devnet
3. `https://api.testnet.solana.com` - Testnet backup

## Debugging

Check browser console for messages:
- ✅ "Successfully fetched X transactions from..." - Working!
- ❌ "RPC endpoint ... failed" - That endpoint didn't work
- "All RPC endpoints failed" - Need to add a proper API key

## Why This Happens

Public RPC endpoints have strict rate limits:
- **api.mainnet-beta.solana.com**: ~100 requests/10 seconds
- **Demo endpoints**: Very limited, often blocked
- **Free public RPCs**: Shared by thousands of users

## Best Practice

For production apps:
1. Always use a dedicated RPC provider with API key
2. Have multiple fallback endpoints
3. Implement retry logic (already done in the app)
4. Monitor RPC usage

## Cost

All recommended providers have generous free tiers:
- **Helius**: 100K requests/month FREE
- **QuickNode**: 10M credits/month FREE
- **Alchemy**: 300M compute units/month FREE

Perfect for personal projects and testing!
