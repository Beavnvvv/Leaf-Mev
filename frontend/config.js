// Leafswap Frontend Configuration
// Update these addresses after deploying your contracts

const CONTRACT_ADDRESSES = {
    // Main contracts
    factory: '0x...', // Your LeafswapAMMFactory address
    router: '0x...',  // Your LeafswapRouter address
    weth: '0x...',    // WETH address (0x0 for local testing)
    
    // Test tokens
    tokenA: '0x...',  // Your TestToken A address
    tokenB: '0x...',  // Your TestToken B address
    
    // MEV Protection
    mevGuard: '0x...' // Your MEVGuard address
};

// MEV Protection Configuration
const MEV_CONFIG = {
    // Default protection settings
    defaultProtectionDuration: 100,    // blocks
    defaultMevFee: 1.0,               // percentage
    defaultMinTxSize: 0.5,            // percentage
    
    // Protection levels
    protectionLevels: {
        low: { blocks: 50, color: 'danger' },
        medium: { blocks: 100, color: 'warning' },
        high: { blocks: 200, color: 'success' },
        maximum: { blocks: 500, color: 'primary' }
    },
    
    // Fee ranges
    feeRanges: {
        min: 0.1,
        max: 5.0,
        step: 0.1
    },
    
    // Transaction size limits
    txSizeRanges: {
        min: 0.1,
        max: 2.0,
        step: 0.1
    }
};

// Network Configuration
const NETWORK_CONFIG = {
    // Supported networks
    networks: {
        1: { name: 'Ethereum Mainnet', explorer: 'https://etherscan.io' },
        11155111: { name: 'Sepolia Testnet', explorer: 'https://sepolia.etherscan.io' },
        1337: { name: 'Local Hardhat', explorer: null }
    },
    
    // Default network
    defaultNetwork: 1337
};

// UI Configuration
const UI_CONFIG = {
    // Update intervals (milliseconds)
    updateIntervals: {
        balances: 10000,        // 10 seconds
        mevStatus: 15000,       // 15 seconds
        analytics: 30000,       // 30 seconds
        blockNumber: 5000       // 5 seconds
    },
    
    // Display settings
    display: {
        addressLength: 6,       // Characters to show for addresses
        numberDecimals: 6,      // Default decimal places
        currencySymbol: 'ETH'   // Default currency symbol
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONTRACT_ADDRESSES,
        MEV_CONFIG,
        NETWORK_CONFIG,
        UI_CONFIG
    };
} else {
    // Browser environment
    window.LEAFSWAP_CONFIG = {
        CONTRACT_ADDRESSES,
        MEV_CONFIG,
        NETWORK_CONFIG,
        UI_CONFIG
    };
}
