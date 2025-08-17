// Simplified but complete app.js
console.log('Simple app.js loading...');

let provider, signer, router, factory, mevGuard;
let connected = false;
let currentBlock = 0;
let mevConfig = {
    protectionDuration: 100,
    mevFee: 1.0,
    minTxSize: 0.5
};

// MEV protection state
let mevProtectionEnabled = false;

// Contract addresses
let CONTRACT_ADDRESSES = {
    factory: '',
    router: '',
    weth: '',
    tokenA: '',
    tokenB: '',
    mevGuard: ''
};

// Update contract addresses from config if available
function updateContractAddresses() {
    if (window.LEAFSWAP_CONFIG && window.LEAFSWAP_CONFIG.CONTRACT_ADDRESSES) {
        CONTRACT_ADDRESSES = window.LEAFSWAP_CONFIG.CONTRACT_ADDRESSES;
        console.log('Contract addresses updated from config:', CONTRACT_ADDRESSES);
    } else {
        console.log('Using default contract addresses:', CONTRACT_ADDRESSES);
    }
}

// Basic ABI definitions
const ROUTER_ABI = [
    "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint256[] memory amounts)",
    "function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)"
];

const FACTORY_ABI = [
    "function getPair(address tokenA, address tokenB) external view returns (address pair)",
    "function MEVGuard() external view returns (address)"
];

const MEVGUARD_ABI = [
    "function isUserMEVEnabled(address user) external view returns (bool)",
    "function setUserMEVEnabled(address user, bool enabled) external"
];

// Initialize the application
async function init() {
    console.log('Initializing application...');
    try {
        // Update contract addresses from config
        updateContractAddresses();
        
        // Check if ethers is available
        if (typeof ethers === 'undefined') {
            console.error('Ethers.js not loaded!');
            alert('Ethers.js library not loaded. Please refresh the page.');
            return;
        }
        console.log('Ethers.js loaded successfully');

        // Check if MetaMask is installed
        if (typeof window.ethereum !== 'undefined') {
            console.log('MetaMask detected');
            provider = new ethers.providers.Web3Provider(window.ethereum);
            console.log('Provider created:', provider);
            
            // Check and switch to Sepolia network
            await checkAndSwitchNetwork();
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', function (accounts) {
                console.log('Account changed:', accounts);
                window.location.reload();
            });

            // Listen for chain changes
            window.ethereum.on('chainChanged', function (chainId) {
                console.log('Chain changed:', chainId);
                updateNetworkInfo();
            });

            console.log('MetaMask is installed and configured!');
        } else {
            console.error('MetaMask not detected');
            alert('Please install MetaMask to use Leafswap!');
            return;
        }
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Connect wallet
async function connectWallet() {
    console.log('connectWallet function called');
    try {
        console.log('Checking provider...');
        if (!provider) {
            console.error('Provider not initialized');
            alert('Please install MetaMask first!');
            return;
        }
        console.log('Provider found:', provider);

        // Request account access
        let accounts;
        console.log('Requesting accounts...');
        try {
            console.log('Trying provider.send method...');
            accounts = await provider.send("eth_requestAccounts", []);
            console.log('Accounts received via provider.send:', accounts);
        } catch (error) {
            console.log('provider.send failed, trying window.ethereum.request...');
            try {
                accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                console.log('Accounts received via window.ethereum.request:', accounts);
            } catch (fallbackError) {
                console.log('window.ethereum.request failed, trying window.ethereum.enable...');
                accounts = await window.ethereum.enable();
                console.log('Accounts received via window.ethereum.enable:', accounts);
            }
        }
        
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found');
        }
        
        signer = provider.getSigner();
        const address = await signer.getAddress();
        
        connected = true;
        
        // Update UI
        const swapBtn = document.getElementById('swapBtn');
        if (swapBtn) swapBtn.disabled = false;
        
        const walletConnectBtn = document.getElementById('walletConnectBtn');
        if (walletConnectBtn) {
            walletConnectBtn.innerHTML = `<i class="fas fa-check me-2"></i>${address.slice(0, 6)}...${address.slice(-4)}`;
            walletConnectBtn.className = 'btn btn-success btn-lg';
            walletConnectBtn.onclick = function() {
                // Show wallet info or disconnect
                alert(`Connected to: ${address}\nNetwork: Sepolia Testnet`);
            };
        }
        
        // Initialize contracts
        await initializeContracts();
        
        console.log('Wallet connected:', address);
        alert('Wallet connected successfully: ' + address);
        
    } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Failed to connect wallet: ' + error.message);
    }
}

// Initialize smart contracts
async function initializeContracts() {
    try {
        // Initialize router contract
        if (CONTRACT_ADDRESSES.router) {
            router = new ethers.Contract(CONTRACT_ADDRESSES.router, ROUTER_ABI, signer);
        }
        
        // Initialize factory contract
        if (CONTRACT_ADDRESSES.factory) {
            factory = new ethers.Contract(CONTRACT_ADDRESSES.factory, FACTORY_ABI, signer);
        }
        
        // Initialize MEVGuard contract
        if (CONTRACT_ADDRESSES.mevGuard) {
            mevGuard = new ethers.Contract(CONTRACT_ADDRESSES.mevGuard, MEVGUARD_ABI, signer);
            console.log('MEVGuard contract initialized');
        }
        
        console.log('Contracts initialized');
    } catch (error) {
        console.error('Error initializing contracts:', error);
    }
}

// Check and switch to Sepolia network
async function checkAndSwitchNetwork() {
    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const sepoliaChainId = '0xaa36a7'; // Sepolia chain ID in hex
        
        if (chainId !== sepoliaChainId) {
            console.log('Current network is not Sepolia, attempting to switch...');
            
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: sepoliaChainId }],
                });
                console.log('Successfully switched to Sepolia network');
            } catch (switchError) {
                // This error code indicates that the chain has not been added to MetaMask
                if (switchError.code === 4902) {
                    console.log('Sepolia network not found, attempting to add...');
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: sepoliaChainId,
                                chainName: 'Sepolia Testnet',
                                nativeCurrency: {
                                    name: 'Sepolia Ether',
                                    symbol: 'SEP',
                                    decimals: 18
                                },
                                rpcUrls: ['https://sepolia.infura.io/v3/'],
                                blockExplorerUrls: ['https://sepolia.etherscan.io/']
                            }],
                        });
                        console.log('Successfully added Sepolia network');
                    } catch (addError) {
                        console.error('Failed to add Sepolia network:', addError);
                        alert('Please add Sepolia testnet to MetaMask manually');
                    }
                } else {
                    console.error('Failed to switch to Sepolia network:', switchError);
                    alert('Please switch to Sepolia testnet manually');
                }
            }
        } else {
            console.log('Already on Sepolia network');
        }
        
        updateNetworkInfo();
    } catch (error) {
        console.error('Error checking network:', error);
    }
}

// Update network information display
function updateNetworkInfo() {
    try {
        const networkInfo = document.getElementById('networkInfo');
        if (networkInfo && window.ethereum) {
            window.ethereum.request({ method: 'eth_chainId' }).then(chainId => {
                let networkName = 'Unknown Network';
                let networkClass = 'text-warning';
                
                switch (chainId) {
                    case '0x1':
                        networkName = 'Ethereum Mainnet';
                        networkClass = 'text-danger';
                        break;
                    case '0xaa36a7':
                        networkName = 'Sepolia Testnet';
                        networkClass = 'text-success';
                        break;
                    case '0x5':
                        networkName = 'Goerli Testnet';
                        networkClass = 'text-info';
                        break;
                    case '0x539':
                        networkName = 'Local Network';
                        networkClass = 'text-secondary';
                        break;
                }
                
                networkInfo.textContent = networkName;
                networkInfo.className = `text-white-50 ${networkClass}`;
            });
        }
    } catch (error) {
        console.error('Error updating network info:', error);
    }
}

// Test connection function
function testConnection() {
    console.log('=== Connection Test ===');
    console.log('Ethers available:', typeof ethers !== 'undefined');
    console.log('MetaMask available:', typeof window.ethereum !== 'undefined');
    console.log('Provider:', provider);
    console.log('Signer:', signer);
    console.log('Connected:', connected);
    
    if (typeof ethers !== 'undefined') {
        console.log('Ethers version:', ethers.version);
    }
    
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask isConnected:', window.ethereum.isMetaMask);
        console.log('MetaMask selectedAddress:', window.ethereum.selectedAddress);
        console.log('MetaMask chainId:', window.ethereum.chainId);
    }
    
    alert('Check browser console for connection test results');
}

// Placeholder functions for UI compatibility
async function swapTokens() {
    alert('Swap functionality not implemented in simple version');
}

async function addLiquidity() {
    alert('Add liquidity functionality not implemented in simple version');
}

async function removeLiquidity() {
    alert('Remove liquidity functionality not implemented in simple version');
}

async function calculateSwapAmounts() {
    // Placeholder
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Simple version');
    console.log('Testing basic functionality...');
    
    // Test if basic JavaScript is working
    try {
        const testElement = document.getElementById('swapBtn');
        console.log('Found swap button:', testElement);
        
        // Test if ethers is loaded
        if (typeof ethers !== 'undefined') {
            console.log('Ethers.js is loaded');
        } else {
            console.error('Ethers.js is NOT loaded');
        }
        
        // Test if MetaMask is available
        if (typeof window.ethereum !== 'undefined') {
            console.log('MetaMask is available');
        } else {
            console.error('MetaMask is NOT available');
        }
        
    } catch (error) {
        console.error('Error in DOMContentLoaded:', error);
    }
    
    init();
});

console.log('Simple app.js loaded successfully');
