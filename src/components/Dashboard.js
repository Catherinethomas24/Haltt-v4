import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, auth, signOut } from '../firebase';
import { LogOut, User, Mail, Home, Zap, Wallet, Plus, X, Send, Download, TrendingUp, History, AlertTriangle, Cloud, Users, Trash2, FileText, Receipt, Archive, Barcode, Shield, Flag, UserX, UsersRound, Menu, ChevronLeft } from 'lucide-react';
import { Connection, PublicKey, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { syncWalletsToFirestore, removeWalletFromUser, initializeUserDocument } from '../services/walletService';
import { testFirestoreConnection } from '../utils/testFirestore';

// Import tab components
import AuditLogs from './tabs/AuditLogs';
import Receipts from './tabs/Receipts';
import StoreReceipts from './tabs/StoreReceipts';
import ExportBarcode from './tabs/ExportBarcode';
import ManualFraudReporting from './tabs/ManualFraudReporting';
import ManageBlocklist from './tabs/ManageBlocklist';
import ManageTrustedContacts from './tabs/ManageTrustedContacts';

// Wallet icon paths from public folder
const walletIconPaths = {
    Phantom: `${process.env.PUBLIC_URL}/phantom.png`,
    Solflare: `${process.env.PUBLIC_URL}/solflare.png`,
    Backpack: `${process.env.PUBLIC_URL}/backpack.png`,
    MetaMask: `${process.env.PUBLIC_URL}/metamask.png`,
};

const Dashboard = () => {
    const { user } = useAuth();
    
    // --- STATE ---
    const [network, setNetwork] = useState('mainnet-beta');
    const [activeTab, setActiveTab] = useState('balances');
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [activeView, setActiveView] = useState('dashboard'); // Track which view/tab is active
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar toggle
    const [connectedWallets, setConnectedWallets] = useState([]);
    const [availableWallets, setAvailableWallets] = useState([]);
    const [totalBalanceUSD, setTotalBalanceUSD] = useState(0);
    const [walletBalances, setWalletBalances] = useState({}); 
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [solPrice, setSolPrice] = useState(0);
    const [loading, setLoading] = useState(false);
    const [profileImageError, setProfileImageError] = useState(false);
    const [profileImageUrl, setProfileImageUrl] = useState(null);
    
    // --- RPC ENDPOINTS (Public/Generic only) ---
    const rpcEndpoints = {
        'mainnet-beta': [
            'https://api.mainnet-beta.solana.com',
            'https://solana-mainnet.g.alchemy.com/v2/demo', 
            'https://rpc.ankr.com/solana',
            'https://solana-api.projectserum.com'
        ],
        'devnet': [
            'https://api.devnet.solana.com',
            'https://solana-devnet.g.alchemy.com/v2/demo', 
            'https://api.testnet.solana.com'
        ]
    };
    
    // --- AUTH HANDLER ---
    const handleSignOut = async () => {
      try {
        await signOut(auth);
      } catch (error) {
        // Sign out error silenced
      }
    };

    // Function to test if image URL is accessible with different methods
    const testImageLoad = (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        
        // Try without CORS first
        img.onload = () => resolve(true);
        img.onerror = () => {
          // If CORS fails, try with different crossOrigin settings
          const img2 = new Image();
          img2.crossOrigin = 'use-credentials';
          img2.onload = () => resolve(true);
          img2.onerror = () => {
            // Try with anonymous CORS
            const img3 = new Image();
            img3.crossOrigin = 'anonymous';
            img3.onload = () => resolve(true);
            img3.onerror = () => resolve(false);
            img3.src = url;
          };
          img2.src = url;
        };
        img.src = url;
      });
    };

    // Function to create a proxy URL for Google images
    const createProxyUrl = (googleUrl) => {
      // Try to modify the URL to remove size restrictions
      const modifiedUrl = googleUrl.replace(/=s\d+-c$/, '=s400-c');
      return modifiedUrl;
    };

    // Function to try different proxy services for Google images
    const tryProxyServices = (googleUrl) => {
      const proxies = [
        googleUrl, // Original URL
        googleUrl.replace(/=s\d+-c$/, '=s400-c'), // Modified size
        googleUrl.replace(/=s\d+-c$/, '=s200-c'), // Smaller size
        `https://images.weserv.nl/?url=${encodeURIComponent(googleUrl)}`, // Weserv proxy
        `https://cors-anywhere.herokuapp.com/${googleUrl}`, // CORS proxy
      ];
      return proxies;
    };

    // --- FETCH SOL PRICE ---
    const fetchSolPrice = async () => {
        if (network === 'devnet') {
            setSolPrice(0.00); 
            return;
        }
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const data = await response.json();
        setSolPrice(data.solana.usd);
      } catch (error) {
        setSolPrice(0);
      }
    };

    // --- FETCH BALANCE ---
    const fetchWalletBalance = async (publicKey) => {
      const endpoints = rpcEndpoints[network];
      for (let i = 0; i < endpoints.length; i++) {
        try {
          const connection = new Connection(endpoints[i], 'confirmed'); 
          const balance = await connection.getBalance(new PublicKey(publicKey));
          return balance / LAMPORTS_PER_SOL;
        } catch (error) {
          if (i === endpoints.length - 1) return 0;
        }
      }
      return 0;
    };

    // --- TRANSACTION FETCH AND PARSING ---
    const fetchRecentTransactions = async (publicKey) => {
        if (connectedWallets.find(w => w.publicKey === publicKey)?.type !== 'solana') {
            return [];
        }

        let signatures = [];
        let connection = null;

        for (let i = 0; i < rpcEndpoints[network].length; i++) {
            const endpoint = rpcEndpoints[network][i];
            try {
                connection = new Connection(endpoint, 'finalized'); 
                const signatureInfos = await connection.getSignaturesForAddress(
                    new PublicKey(publicKey),
                    { limit: 200, commitment: 'finalized' }
                );
                
                signatures = signatureInfos
                    .filter(info => !info.err && info.signature)
                    .map(info => info.signature);
                break; 
            } catch (error) {
                if (i === rpcEndpoints[network].length - 1) return [];
            }
        }

        if (signatures.length === 0 || !connection) return [];
        
        try {
            const transactions = await connection.getParsedTransactions(
                signatures, 
                { maxSupportedTransactionVersion: 0, commitment: 'finalized' }
            );

            return transactions.map((tx, index) => {
                const txSignature = signatures[index];

                if (!tx || !tx.meta) {
                    return {
                        signature: txSignature, blockTime: null, amount: 0,
                        direction: 'Unknown', success: false, publicKey: publicKey,
                        type: 'RPC Data Gap'
                    };
                }
                
                let amount = 0;
                let direction = 'unknown';
                let type = 'Program Call';
                const isSuccessful = !tx.meta.err;

                const transferInstruction = tx.transaction.message.instructions.find(ix => 
                    ix.programId.toBase58() === SystemProgram.programId.toBase58() && 
                    ix.parsed && ix.parsed.type === 'transfer'
                );

                if (transferInstruction) {
                    const { info } = transferInstruction.parsed;
                    const sender = info.source;
                    const receiver = info.destination;
                    amount = info.lamports / LAMPORTS_PER_SOL;
                    type = 'SOL Transfer';

                    if (sender === publicKey) {
                        direction = 'sent';
                    } else if (receiver === publicKey) {
                        direction = 'received';
                    }
                } else {
                     const accountIndex = tx.transaction.message.accountKeys.findIndex(key => key.pubkey.toBase58() === publicKey);
                     
                     if (accountIndex !== -1 && tx.meta.postBalances[accountIndex] !== tx.meta.preBalances[accountIndex]) {
                        const lamportChange = tx.meta.postBalances[accountIndex] - tx.meta.preBalances[accountIndex];
                        amount = Math.abs(lamportChange) / LAMPORTS_PER_SOL;
                        direction = lamportChange > 0 ? 'received' : 'sent';
                        
                        const firstInstructionProgramId = tx.transaction.message.instructions[0]?.programId.toBase58();
                        
                        if (firstInstructionProgramId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') {
                            type = 'Token Operation';
                        } else if (firstInstructionProgramId !== SystemProgram.programId.toBase58()) {
                            type = 'Program Interaction';
                        }
                     }
                }

                return {
                    signature: txSignature, slot: tx.slot, blockTime: tx.blockTime, amount: amount,
                    direction: direction, success: isSuccessful, publicKey: publicKey, type: type 
                };
            });

        } catch (error) {
            return [];
        }
    };

    // --- UPDATE CALLERS (useCallback) ---
    const updateWalletBalances = useCallback(async () => {
      if (connectedWallets.length === 0) return;
      
      const newBalances = {};
      let totalSOL = 0;
      
      for (const wallet of connectedWallets) {
        const uniqueKey = wallet.publicKey || wallet.address;
        
        if (wallet.type === 'solana' && wallet.publicKey) {
          const balance = await fetchWalletBalance(wallet.publicKey);
          newBalances[uniqueKey] = balance;
          totalSOL += balance;
        } else if (wallet.type === 'ethereum' && wallet.address) {
            newBalances[uniqueKey] = 0;
        }
      }
      
      setWalletBalances(newBalances);
      setTotalBalanceUSD(network === 'mainnet-beta' ? totalSOL * solPrice : 0);
    }, [connectedWallets, solPrice, network]);

    const updateRecentTransactions = useCallback(async () => {
      if (connectedWallets.length === 0) return;
      
      setLoading(true);
      const allTransactions = [];
      
      for (const wallet of connectedWallets) {
        if (wallet.type === 'solana' && wallet.publicKey) {
          const transactions = await fetchRecentTransactions(wallet.publicKey);
          allTransactions.push(...transactions);
        }
      }
      
      allTransactions.sort((a, b) => (b.blockTime || 0) - (a.blockTime || 0));
      setRecentTransactions(allTransactions.slice(0, 50)); 
      setLoading(false);
    }, [connectedWallets, network]);

    // --- WALLET CONNECTION LOGIC ---
    const connectWallet = async (wallet) => {
      try {
        if (wallet.type === 'solana') {
          // Solflare and Phantom use .connect()
          const response = await wallet.provider.connect();
          
          let publicKeyString = response?.publicKey?.toString();
          
          // Fallback check for Solflare, which sometimes requires manual publicKey access
          if (!publicKeyString && wallet.name === 'Solflare' && window.solflare?.publicKey) {
              publicKeyString = window.solflare.publicKey.toString();
          }

          if (publicKeyString) {
          const newWallet = {
            ...wallet,
                publicKey: publicKeyString,
            connected: true
          };
              if (!connectedWallets.some(w => w.publicKey === newWallet.publicKey)) {
          setConnectedWallets(prev => [...prev, newWallet]);
          
          // Sync to Firestore automatically
          if (user?.email) {
            try {
              await syncWalletsToFirestore(user.email, [newWallet]);
            } catch (error) {
              // Firestore sync error silenced
            }
          }
              }
          }

        } else if (wallet.type === 'ethereum') {
          const accounts = await wallet.provider.request({ method: 'eth_requestAccounts' });
          const newWallet = {
            ...wallet,
            address: accounts[0],
                connected: true,
                publicKey: accounts[0]
          };
            if (!connectedWallets.some(w => w.address === newWallet.address)) {
          setConnectedWallets(prev => [...prev, newWallet]);
          
          // Sync to Firestore automatically
          if (user?.email) {
            try {
              await syncWalletsToFirestore(user.email, [newWallet]);
            } catch (error) {
              // Firestore sync error silenced
            }
          }
            }
        }
      } catch (error) {
        // Wallet connection error silenced
      }
    };

    const disconnectWallet = async (uniqueKey) => {
      setConnectedWallets(prev => prev.filter(w => (w.publicKey || w.address) !== uniqueKey));
      
      // Remove from Firestore automatically
      if (user?.email) {
        try {
          await removeWalletFromUser(user.email, uniqueKey);
        } catch (error) {
          // Firestore removal error silenced
        }
      }
    };
    
    // --- FIXED WALLET DETECTION LOGIC ---
    const detectWallets = useCallback(() => {
        const wallets = [];
        
        // 1. Phantom
        if (window.solana && window.solana.isPhantom) {
          wallets.push({ name: 'Phantom', iconPath: walletIconPaths.Phantom, provider: window.solana, type: 'solana' });
        }
        
        // 2. Solflare (Robust check for window.solflare)
        if (window.solflare) {
            wallets.push({ name: 'Solflare', iconPath: walletIconPaths.Solflare, provider: window.solflare, type: 'solana' });
        }

        // 3. Backpack (Checking for both structures)
        if (window.backpack && (window.backpack.isBackpack || window.backpack.solana)) {
            const provider = window.backpack.solana || window.backpack;
            wallets.push({ name: 'Backpack', iconPath: walletIconPaths.Backpack, provider: provider, type: 'solana' });
        }
        
        // 4. MetaMask (Ethereum)
        if (window.ethereum && window.ethereum.isMetaMask) {
           wallets.push({ name: 'MetaMask', iconPath: walletIconPaths.MetaMask, provider: window.ethereum, type: 'ethereum' });
        }
        
        setAvailableWallets(wallets);
    }, []);
    
    // --- Effect for Wallet Detection with Delay ---
    useEffect(() => {
        const timeout = setTimeout(() => {
            detectWallets();
        }, 500);

        window.addEventListener('load', detectWallets);

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('load', detectWallets);
        };
    }, [detectWallets]);
    
    // --- DATA FETCH EFFECTS ---
    useEffect(() => {
      fetchSolPrice();
      setTotalBalanceUSD(0);
      setWalletBalances({});
      setRecentTransactions([]);
      if (connectedWallets.length > 0) {
        updateWalletBalances();
        updateRecentTransactions();
      }
    }, [network, connectedWallets.length]);

    // Initialize user document in Firestore when user signs in
    useEffect(() => {
      if (user?.email) {
        initializeUserDocument(user.email)
          .then(() => {
            // User document initialized
          })
          .catch(error => {
            // Initialization error silenced
          });
      }
    }, [user]);

    // Reset profile image error when user changes and test image load
    useEffect(() => {
      setProfileImageError(false);
      setProfileImageUrl(null);
      if (user?.photoURL) {
        const proxyUrls = tryProxyServices(user.photoURL);
        
        // Try each proxy URL in sequence
        const tryNextUrl = async (index) => {
          if (index >= proxyUrls.length) {
            setProfileImageError(true);
            return;
          }
          
          const url = proxyUrls[index];
          const canLoad = await testImageLoad(url);
          
          if (canLoad) {
            setProfileImageUrl(url);
          } else {
            tryNextUrl(index + 1);
          }
        };
        
        tryNextUrl(0);
      }
    }, [user]);

    useEffect(() => {
      if (connectedWallets.length > 0 && (solPrice > 0 || network === 'devnet')) {
        updateWalletBalances();
        updateRecentTransactions();
      }
    }, [solPrice, updateWalletBalances, updateRecentTransactions]);

    useEffect(() => {
      if (activeTab === 'transactions') {
        updateRecentTransactions();
      }
    }, [activeTab, updateRecentTransactions]);

    useEffect(() => {
      const interval = setInterval(() => {
        if (connectedWallets.length > 0) {
          updateWalletBalances();
          updateRecentTransactions();
        }
        fetchSolPrice(); 
      }, 30000); 

      return () => clearInterval(interval);
    }, [connectedWallets, network, updateWalletBalances, updateRecentTransactions]);
  
    if (!user) {
      return null;
    }
 
    // --- UI COMPONENTS ---
    
    // Wallet Card Component 
    const WalletCard = ({ wallet }) => {
      const uniqueKey = wallet.publicKey || wallet.address;
      const balance = walletBalances[uniqueKey] || 0;
      const usdValue = balance * solPrice;
  
    return (
        <div className="flex items-center justify-between p-4 bg-gray-800/70 backdrop-blur-sm border-b border-gray-700 hover:bg-gray-800 transition duration-300 group">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-900 border border-cyan-700/50 p-1.5">
                    <img src={wallet.iconPath} alt={wallet.name} className="w-full h-full object-contain" />
                </div>
                <div>
                    <p className="font-semibold text-white text-lg">{wallet.name}</p>
                    <p className="text-xs text-gray-400 font-mono">
                         {uniqueKey ? `${uniqueKey.slice(0, 4)}...${uniqueKey.slice(-4)}` : 'Disconnected'}
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <div className="text-right">
                    <p className="font-bold text-xl text-white font-mono">
                        {wallet.type === 'ethereum' ? 'N/A' : `${balance.toFixed(2)} SOL`}
                    </p>
                    {wallet.type === 'solana' && network !== 'devnet' && (
                        <p className="text-xs text-cyan-400 font-mono">${usdValue.toFixed(2)}</p>
                    )}
                </div>
                <button
                    onClick={() => disconnectWallet(uniqueKey)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Remove Wallet"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
      );
    };

    // Transaction Row Component
    const TransactionRow = ({ tx }) => (
        <div className="flex items-center justify-between p-3 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-b-0">
            <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    !tx.success ? 'bg-gray-500' :
                    tx.direction === 'sent' ? 'bg-red-500' : 
                    tx.direction === 'received' ? 'bg-green-500' : 'bg-cyan-500'
                }`}></div>
                <div>
                    <p className="font-medium text-white text-sm">
                        {tx.type}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                        {tx.signature.slice(0, 6)}...{tx.signature.slice(-4)}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p className={`font-bold text-sm font-mono ${
                    !tx.success ? 'text-gray-500' :
                    tx.direction === 'sent' ? 'text-red-400' : 
                    tx.direction === 'received' ? 'text-green-400' : 'text-cyan-400'
                }`}>
                    {tx.success && tx.amount > 0 
                        ? `${tx.direction === 'sent' ? '-' : '+'}${tx.amount.toFixed(4)} SOL` 
                        : (tx.success ? 'No SOL Change' : 'Failed')}
                </p>
                <p className="text-xs text-gray-600">
                    {tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleTimeString() : 'N/A'}
                </p>
            </div>
        </div>
    );
    
    // --- MAIN RENDER ---
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex">
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-cyan-600 text-white rounded-lg shadow-lg hover:bg-cyan-500 transition-all"
        >
          {sidebarOpen ? <ChevronLeft className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Left Sidebar */}
        <div className={`
          fixed lg:sticky top-0 h-screen z-40 lg:z-20
          bg-gray-950 shadow-2xl border-r border-gray-800 
          flex flex-col p-4
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 lg:w-64
        `}>
          
          {/* Header - Premium Branding */}
          <div className="pb-6 border-b border-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 tracking-tight premium-heading">
                    HALTT
                  </h1>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium -mt-1">Security Platform</p>
                </div>
              </div>
              {/* Close button for mobile */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 mt-6 space-y-6 overflow-y-auto pr-2" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(21, 94, 117, 0.3) transparent'
          }}>
            
            {/* Dashboard */}
            <div 
              onClick={() => {
                setActiveView('dashboard');
                setSidebarOpen(false);
              }}
              className={`flex items-center px-4 py-3 rounded-lg font-semibold transition-all cursor-pointer ${
                activeView === 'dashboard' 
                  ? 'bg-cyan-900/40 text-cyan-400' 
                  : 'text-gray-400 hover:bg-cyan-900/20'
              }`}
            >
              <Home className="w-5 h-5 mr-3" />
              <span>Dashboard</span>
            </div>

            {/* Quick Actions Category */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mt-4">Quick Actions</h3>
              
              <div 
                onClick={() => {
                  setActiveView('auditLogs');
                  setSidebarOpen(false);
                }}
                className={`flex items-center px-4 py-2.5 rounded-lg cursor-pointer transition-colors text-sm ${
                  activeView === 'auditLogs' 
                    ? 'bg-cyan-900/40 text-cyan-400' 
                    : 'text-gray-400 hover:bg-cyan-900/20'
                }`}
              >
                <FileText className="w-4 h-4 mr-3" />
                <span>Audit Logs</span>
              </div>
              
              <div 
                onClick={() => {
                  setActiveView('receipts');
                  setSidebarOpen(false);
                }}
                className={`flex items-center px-4 py-2.5 rounded-lg cursor-pointer transition-colors text-sm ${
                  activeView === 'receipts' 
                    ? 'bg-cyan-900/40 text-cyan-400' 
                    : 'text-gray-400 hover:bg-cyan-900/20'
                }`}
              >
                <Receipt className="w-4 h-4 mr-3" />
                <span>Receipts</span>
              </div>
              
              <div 
                onClick={() => {
                  setActiveView('storeReceipts');
                  setSidebarOpen(false);
                }}
                className={`flex items-center px-4 py-2.5 rounded-lg cursor-pointer transition-colors text-sm ${
                  activeView === 'storeReceipts' 
                    ? 'bg-cyan-900/40 text-cyan-400' 
                    : 'text-gray-400 hover:bg-cyan-900/20'
                }`}
              >
                <Archive className="w-4 h-4 mr-3" />
                <span>Store Receipts</span>
              </div>
              
              <div 
                onClick={() => {
                  setActiveView('exportBarcode');
                  setSidebarOpen(false);
                }}
                className={`flex items-center px-4 py-2.5 rounded-lg cursor-pointer transition-colors text-sm ${
                  activeView === 'exportBarcode' 
                    ? 'bg-cyan-900/40 text-cyan-400' 
                    : 'text-gray-400 hover:bg-cyan-900/20'
                }`}
              >
                <Barcode className="w-4 h-4 mr-3" />
                <span>Export Barcode</span>
              </div>
            </div>

            {/* Safety Center Category */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mt-4">Safety Center</h3>
              
              <div 
                onClick={() => {
                  setActiveView('manualFraudReporting');
                  setSidebarOpen(false);
                }}
                className={`flex items-center px-4 py-2.5 rounded-lg cursor-pointer transition-colors text-sm ${
                  activeView === 'manualFraudReporting' 
                    ? 'bg-cyan-900/40 text-cyan-400' 
                    : 'text-gray-400 hover:bg-cyan-900/20'
                }`}
              >
                <Flag className="w-4 h-4 mr-3" />
                <span>Manual Fraud Reporting</span>
              </div>
              
              <div 
                onClick={() => {
                  setActiveView('manageBlocklist');
                  setSidebarOpen(false);
                }}
                className={`flex items-center px-4 py-2.5 rounded-lg cursor-pointer transition-colors text-sm ${
                  activeView === 'manageBlocklist' 
                    ? 'bg-cyan-900/40 text-cyan-400' 
                    : 'text-gray-400 hover:bg-cyan-900/20'
                }`}
              >
                <UserX className="w-4 h-4 mr-3" />
                <span>Manage Blocklist</span>
              </div>
              
              <div 
                onClick={() => {
                  setActiveView('manageTrustedContacts');
                  setSidebarOpen(false);
                }}
                className={`flex items-center px-4 py-2.5 rounded-lg cursor-pointer transition-colors text-sm ${
                  activeView === 'manageTrustedContacts' 
                    ? 'bg-cyan-900/40 text-cyan-400' 
                    : 'text-gray-400 hover:bg-cyan-900/20'
                }`}
              >
                <UsersRound className="w-4 h-4 mr-3" />
                <span>Manage Trusted Contacts</span>
              </div>
            </div>
          </div>

          {/* Footer (User Profile & Network Selector) */}
          <div className="pt-6 border-t border-gray-800">
            
            {/* Google Profile Section (MATCHING PROVIDED IMAGE) */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">GOOGLE PROFILE</h3>
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-xl">
                <div className="flex items-center space-x-3 mb-3">
                  {/* Profile Picture / Placeholder */}
                    <div className="relative">
                    {profileImageUrl && !profileImageError ? (
                      <img 
                        src={profileImageUrl} 
                        alt="Profile" 
                        className="w-12 h-12 rounded-full object-cover shadow-lg border border-red-500"
                        onError={(e) => {
                          setProfileImageError(true);
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white text-xl font-bold border border-red-500">
                        {(user.displayName ? user.displayName[0].toUpperCase() : 'U')}
                      </div>
                    )}
                    </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.displayName || 'Google User'}
                    </p>
                    <p className="text-xs text-gray-400 truncate flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {user.email}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center px-3 py-2 text-xs text-red-400 border border-red-500 rounded-lg hover:bg-red-500/10 hover:border-red-400 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
            
             {/* Network Selector (Moved after Google Profile) */}
            <select
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="w-full bg-cyan-900/50 text-cyan-400 text-base p-2 rounded-md border border-cyan-700/50 cursor-pointer focus:ring-cyan-500 focus:border-cyan-500"
            >
                <option value="mainnet-beta">Mainnet Beta</option>
                <option value="devnet">Devnet (Testing)</option>
            </select>
          </div>
        </div>

        {/* Main Content Area - Glassmorphism */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto lg:ml-0">

            {/* Render content based on active view */}
            {activeView !== 'dashboard' ? (
              // Render tab components
              <div key={activeView} className="tab-fade">
                {activeView === 'auditLogs' && <AuditLogs />}
                {activeView === 'receipts' && <Receipts />}
                {activeView === 'storeReceipts' && <StoreReceipts />}
                {activeView === 'exportBarcode' && <ExportBarcode />}
                {activeView === 'manualFraudReporting' && <ManualFraudReporting />}
                {activeView === 'manageBlocklist' && <ManageBlocklist />}
                {activeView === 'manageTrustedContacts' && <ManageTrustedContacts />}
              </div>
            ) : connectedWallets.length === 0 ? (
                // --- Empty State ---
                <div className="flex items-center justify-center min-h-[80vh] bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-cyan-900/30">
                    <div className="text-center p-10">
                        <Wallet className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallets</h2>
                        <p className="text-gray-400 mb-8 max-w-sm">Connect your Phantom, Solflare, or Backpack wallets to begin monitoring your Solana assets.</p>
                <button
                  onClick={() => setShowWalletModal(true)}
                            className="bg-cyan-600 text-white px-8 py-3 rounded-lg font-semibold shadow-cyan hover:bg-cyan-500 transition-all"
                >
                            <Plus className="w-5 h-5 mr-2 inline-block" /> Connect Wallet
                </button>
                    </div>
              </div>
            ) : (
                // --- Dashboard Content (Glassmorphism) ---
                <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-cyan-900/30 p-4 sm:p-6 md:p-8 shadow-2xl space-y-6 sm:space-y-8 md:space-y-10 tab-transition">
                    
                    {/* Top Section: Total Balance & Quick Actions */}
                    <div className="flex flex-col space-y-4 sm:space-y-6">
                        <p className="premium-label text-gray-400 tracking-wide text-xs sm:text-sm">Total Balance</p>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl premium-heading text-cyan-400 tracking-tighter">
                            {network === 'devnet' ? '---' : `$${totalBalanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </h2>
                        {network !== 'devnet' && <p className="premium-mono text-xs sm:text-sm text-gray-500">SOL Price: ${solPrice.toFixed(2)}</p>}

                        {/* Quick Actions (Matching Screenshot) */}
                        <div className="grid grid-cols-2 sm:flex sm:space-x-4 md:space-x-6 gap-4 sm:gap-0 pt-4 border-t border-gray-800">
                            <button className="flex flex-col items-center space-y-2 text-cyan-400 hover:text-cyan-300 transition-colors group">
                                <div className="w-12 h-12 rounded-full bg-cyan-700/20 flex items-center justify-center border border-cyan-700/40 group-hover:bg-cyan-700/30 transition-all"><Send className="w-5 h-5" /></div>
                                <span className="premium-label text-xs">Send</span>
                            </button>
                            <button className="flex flex-col items-center space-y-2 text-cyan-400 hover:text-cyan-300 transition-colors group">
                                <div className="w-12 h-12 rounded-full bg-cyan-700/20 flex items-center justify-center border border-cyan-700/40 group-hover:bg-cyan-700/30 transition-all"><Download className="w-5 h-5" /></div>
                                <span className="premium-label text-xs">Receive</span>
                            </button>
                            <button className="flex flex-col items-center space-y-2 text-cyan-400 hover:text-cyan-300 transition-colors group">
                                <div className="w-12 h-12 rounded-full bg-cyan-700/20 flex items-center justify-center border border-cyan-700/40 group-hover:bg-cyan-700/30 transition-all"><Users className="w-5 h-5" /></div>
                                <span className="premium-label text-xs">Contacts</span>
                            </button>
                            <button
                                onClick={() => setShowWalletModal(true)}
                                className="flex flex-col items-center space-y-2 text-red-400 hover:text-red-300 transition-colors group"
                            >
                                <div className="w-12 h-12 rounded-full bg-red-700/20 flex items-center justify-center border border-red-700/40 group-hover:bg-red-700/30 transition-all"><Plus className="w-5 h-5" /></div>
                                <span className="premium-label text-xs">Add Wallet</span>
                            </button>
                        </div>
                      </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-700">
                        <button 
                            className={`px-6 py-3 font-semibold text-lg transition-colors ${
                                activeTab === 'balances' 
                                ? 'text-white border-b-2 border-cyan-400' 
                                : 'text-gray-500 hover:text-gray-300'
                            }`}
                            onClick={() => setActiveTab('balances')}
                        >
                            Per Wallet Balances
                        </button>
                      <button
                            className={`px-6 py-3 font-semibold text-lg transition-colors ${
                                activeTab === 'transactions' 
                                ? 'text-white border-b-2 border-cyan-400' 
                                : 'text-gray-500 hover:text-gray-300'
                            }`}
                            onClick={() => setActiveTab('transactions')}
                        >
                            Recent Transactions
                      </button>
                        {loading && (
                             <div className="flex items-center ml-auto text-cyan-400">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400 mr-2"></div>
                                Updating...
                             </div>
                        )}
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[300px]">
                        {activeTab === 'balances' && (
                            <div className="space-y-1">
                                {connectedWallets.map((wallet, index) => (
                                    <WalletCard key={index} wallet={wallet} />
                  ))}
                </div>
                        )}

                        {activeTab === 'transactions' && (
                            <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg border border-cyan-900/50 shadow-inner">
                                {recentTransactions.length > 0 ? (
                                    <div className="divide-y divide-gray-800">
                                        {recentTransactions.map((tx, index) => (
                                            <TransactionRow key={index} tx={tx} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <History className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                        <p className="text-gray-400 text-lg">
                                            No recent transactions found.
                                        </p>
                                        <p className="text-gray-500 text-sm mt-2">
                                            This may be due to wallet inactivity or public RPC indexing gaps.
                                        </p>
                                    </div>
                                )}
              </div>
            )}
          </div>

                </div>
            )}
        </div>

        {/* Wallet Connection Modal */}
        {showWalletModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/90 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-cyan-900/50 backdrop-blur-xl">
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
                  <h3 className="text-2xl font-bold text-white">Connect Wallet</h3>
                  <button
                    onClick={() => setShowWalletModal(false)}
                    className="text-gray-400 hover:text-cyan-400 transition-colors p-2 rounded-full hover:bg-gray-800"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                    {network === 'devnet' && (
                        <div className="p-4 bg-red-900/30 text-red-300 border border-red-800 rounded-xl flex items-start space-x-3 mb-4">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-medium">
                                **DEVNET WARNING**: Ensure your wallet is set to **Solana Devnet** before connecting to use test tokens.
                            </p>
                        </div>
                    )}

                  {availableWallets
                      .filter(wallet => !connectedWallets.some(connected => connected.name === wallet.name))
                      .map((wallet, index) => (
                        <button
                          key={index}
                        onClick={() => { connectWallet(wallet); setShowWalletModal(false); }}
                        className="w-full flex items-center p-4 bg-gray-800/70 rounded-xl hover:bg-gray-800 transition-all border border-cyan-900/50"
                      >
                        <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mr-4 p-2">
                          <img src={wallet.iconPath} alt={wallet.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-white text-lg">{wallet.name}</p>
                          <p className="text-sm text-gray-400">{wallet.type === 'ethereum' ? 'Ethereum (No SOL Balance)' : 'Solana Compatible'}</p>
                        </div>
                      </button>
                    ))}
                    
                    {availableWallets.length === 0 && (
                    <div className="text-center py-8">
                            <p className="text-gray-300 text-lg">No Wallets Detected</p>
                            <p className="text-sm text-gray-500 mt-2">Install a browser extension like Phantom, Solflare, or MetaMask.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

export default Dashboard;