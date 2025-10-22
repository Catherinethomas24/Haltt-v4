# HALTT - Solana Wallet Security Platform

A comprehensive Solana wallet management platform with built-in fraud detection and security features.

## 🚀 Quick Start

### Prerequisites
- Node.js v14 or higher
- npm or yarn

### Installation

1. **Install frontend dependencies:**
```bash
npm install
```

2. **Install proxy server dependencies:**
```bash
cd server
npm install
cd ..
```

### Running the Application

**IMPORTANT:** You need to run BOTH the frontend and proxy server for fraud detection to work.

#### Terminal 1 - Start Proxy Server (Required for fraud detection):
```bash
cd server
npm start
```
Server will run on `http://localhost:3001`

#### Terminal 2 - Start React App:
```bash
npm start
```
App will open at `http://localhost:3000`

## 🛡️ Features

- **Multi-Wallet Support**: Connect Phantom, Solflare, Backpack wallets
- **Real-time Balance Tracking**: Monitor SOL balances across all wallets
- **Transaction History**: View detailed transaction history
- **Fraud Detection**: Automatic address verification using ChainAbuse API
- **Blockchain Analysis**: Real-time analysis using Helius API
- **Secure Sending**: Multi-step verification before sending transactions
- **Audit Logs**: Track all wallet connections and activities
- **Receipt Management**: Store and manage transaction receipts
- **QR Code Generation**: Generate QR codes for receiving payments

## 🔒 Security Features

### Send Transaction Workflow:
1. **Address Entry**: User enters recipient address
2. **Fraud Check**: System checks address against ChainAbuse database
3. **Risk Assessment**: Displays risk score and fraud reports
4. **Transaction Blocking**: Automatically blocks transactions to flagged addresses
5. **Manual Verification**: Warns users if verification service is unavailable

## 📁 Project Structure

```
haltt-project/
├── src/
│   ├── components/        # React components
│   │   ├── Dashboard.js   # Main dashboard
│   │   └── tabs/          # Tab components
│   ├── services/          # API services
│   │   ├── fraudDetectionService.js  # ChainAbuse & Helius integration
│   │   ├── walletService.js          # Wallet management
│   │   └── auditLogService.js        # Audit logging
│   └── firebase.js        # Firebase configuration
├── server/                # Proxy server (REQUIRED)
│   ├── proxy.js          # Express proxy server
│   ├── package.json      # Server dependencies
│   └── README.md         # Server documentation
└── public/               # Static assets
```

## 🔧 Configuration

### API Keys (Already Configured)
- **Helius API**: For blockchain data
- **ChainAbuse API**: For fraud detection
- **Firebase**: For user authentication and data storage

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
