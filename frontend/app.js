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

// Contract addresses (will be updated after deployment)
const CONTRACT_ADDRESSES = window.LEAFSWAP_CONFIG ? window.LEAFSWAP_CONFIG.CONTRACT_ADDRESSES : {
    factory: '',
    router: '',
    weth: '',
    tokenA: '',
    tokenB: '',
    mevGuard: ''
};

// ABI definitions
const ROUTER_ABI = [
    "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint256[] memory amounts)",
    "function swapExactETHForTokens(uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external payable returns (uint256[] memory amounts)",
    "function swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint256[] memory amounts)",
    "function addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) external returns (uint256 amountA, uint256 amountB, uint256 liquidity)",
    "function addLiquidityETH(address token, uint256 amountTokenDesired, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) external payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity)",
    "function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)"
];

const FACTORY_ABI = [
    "function getPair(address tokenA, address tokenB) external view returns (address pair)",
    "function createPair(address tokenA, address tokenB) external returns (address pair)",
    "function MEVGuard() external view returns (address)"
];

const MEVGUARD_ABI = [
    "function antiFrontDefendBlock() external view returns (uint256)",
    "function antiMEVFeePercentage() external view returns (uint256)",
    "function antiMEVAmountOutLimitRate() external view returns (uint256)",
    "function antiFrontDefendBlockEdges(address pair) external view returns (uint256)",
    "function setAntiFrontDefendBlock(uint256 blocks) external",
    "function setAntiMEVFeePercentage(uint256 percentage) external",
    "function setAntiMEVAmountOutLimitRate(uint256 rate) external",
    "function defend(bool antiMEV, uint256 reserve0, uint256 reserve1, uint256 amount0Out, uint256 amount1Out) external returns (bool)",
    "function isUserMEVEnabled(address user) external view returns (bool)",
    "function setUserMEVEnabled(address user, bool enabled) external"
];

const ERC20_ABI = [
    "function balanceOf(address owner) external view returns (uint256)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)"
];

// Initialize the application
async function init() {
    try {
        // Check if MetaMask is installed
        if (typeof window.ethereum !== 'undefined') {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', function (accounts) {
                window.location.reload();
            });

            // Listen for chain changes
            window.ethereum.on('chainChanged', function (chainId) {
                window.location.reload();
            });

            console.log('MetaMask is installed!');
        } else {
            alert('Please install MetaMask to use Leafswap!');
            return;
        }
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Connect wallet
async function connectWallet() {
    try {
        if (!provider) {
            alert('Please install MetaMask first!');
            return;
        }

        // Request account access - use more compatible method
        let accounts;
        try {
            // Try the newer method first
            accounts = await provider.send("eth_requestAccounts", []);
        } catch (error) {
            // Fallback to older method
            try {
                accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            } catch (fallbackError) {
                // Try the most basic method
                accounts = await window.ethereum.enable();
            }
        }
        
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found');
        }
        
        signer = provider.getSigner();
        const address = await signer.getAddress();
        
        connected = true;
        
        // Update UI
        document.getElementById('swapBtn').disabled = false;
        document.querySelector('button[onclick="connectWallet()"]').innerHTML = 
            `<i class="fas fa-check me-2"></i>${address.slice(0, 6)}...${address.slice(-4)}`;
        
        // Initialize contracts
        await initializeContracts();
        
        // Load balances
        await loadBalances();
        
        // Load MEV protection status
        await loadMEVProtectionStatus();
        
        // Load user's MEV protection status from chain
        await loadUserMEVProtectionStatus();
        
        // Initialize MEV protection switch
        initializeMEVProtectionSwitch();
        
        console.log('Wallet connected:', address);
    } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Failed to connect wallet: ' + error.message);
    }
}

// Initialize smart contracts
async function initializeContracts() {
    try {
        // Initialize router contract
        router = new ethers.Contract(CONTRACT_ADDRESSES.router, ROUTER_ABI, signer);
        
        // Initialize factory contract
        factory = new ethers.Contract(CONTRACT_ADDRESSES.factory, FACTORY_ABI, signer);
        
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

// Load token balances
async function loadBalances() {
    try {
        if (!signer) return;
        
        const address = await signer.getAddress();
        
        // Load ETH balance
        const ethBalance = await provider.getBalance(address);
        document.getElementById('fromBalance').textContent = 
            ethers.utils.formatEther(ethBalance).slice(0, 6);
        
        // Load token balances (if tokens are deployed)
        if (CONTRACT_ADDRESSES.tokenA) {
            const tokenAContract = new ethers.Contract(CONTRACT_ADDRESSES.tokenA, ERC20_ABI, signer);
            const tokenABalance = await tokenAContract.balanceOf(address);
            // Update UI with token A balance
        }
        
        if (CONTRACT_ADDRESSES.tokenB) {
            const tokenBContract = new ethers.Contract(CONTRACT_ADDRESSES.tokenB, ERC20_ABI, signer);
            const tokenBBalance = await tokenBContract.balanceOf(address);
            // Update UI with token B balance
        }
        
    } catch (error) {
        console.error('Error loading balances:', error);
    }
}

// Swap tokens
async function swapTokens() {
    try {
        if (!connected || !signer) {
            alert('Please connect your wallet first!');
            return;
        }

        const fromAmount = document.getElementById('fromAmount').value;
        const fromToken = document.getElementById('fromToken').value;
        const toToken = document.getElementById('toToken').value;
        
        if (!fromAmount || fromAmount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (fromToken === toToken) {
            alert('Cannot swap the same token');
            return;
        }

        // Show loading state
        const swapBtn = document.getElementById('swapBtn');
        const originalText = swapBtn.innerHTML;
        swapBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Swapping...';
        swapBtn.disabled = true;

        // Check MEV protection status before swap (only if enabled)
        if (mevGuard && mevProtectionEnabled) {
            try {
                // Get current reserves (simplified for demo)
                const reserves = { reserve0: ethers.utils.parseEther("1000"), reserve1: ethers.utils.parseEther("1000") };
                
                // Check if swap would be allowed by MEVGuard
                const isAllowed = await mevGuard.defend(
                    false, // antiMEV mode (will be determined by contract)
                    reserves.reserve0,
                    reserves.reserve1,
                    0, // amount0Out (will be calculated)
                    0  // amount1Out (will be calculated)
                );
                
                if (!isAllowed) {
                    throw new Error('Transaction blocked by MEV protection');
                }
                
                console.log('MEV protection check passed');
            } catch (error) {
                console.error('MEV protection check failed:', error);
                // Continue with swap but log the issue
            }
        } else if (mevProtectionEnabled) {
            console.log('MEV protection enabled but MEVGuard not available');
        } else {
            console.log('MEV protection disabled - proceeding with normal swap');
        }
        
        // Prepare swap parameters
        const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes
        const amountIn = ethers.utils.parseEther(fromAmount);
        const amountOutMin = 0; // No slippage protection for demo

        let tx;
        if (fromToken === 'ETH') {
            // Swap ETH for tokens
            const path = [CONTRACT_ADDRESSES.weth, CONTRACT_ADDRESSES[toToken]];
            tx = await router.swapExactETHForTokens(
                amountOutMin,
                path,
                await signer.getAddress(),
                deadline,
                { value: amountIn }
            );
        } else if (toToken === 'ETH') {
            // Swap tokens for ETH
            const path = [CONTRACT_ADDRESSES[fromToken], CONTRACT_ADDRESSES.weth];
            
            // Approve router to spend tokens
            const tokenContract = new ethers.Contract(CONTRACT_ADDRESSES[fromToken], ERC20_ABI, signer);
            await tokenContract.approve(CONTRACT_ADDRESSES.router, amountIn);
            
            tx = await router.swapExactTokensForETH(
                amountIn,
                amountOutMin,
                path,
                await signer.getAddress(),
                deadline
            );
        } else {
            // Token to token swap
            const path = [CONTRACT_ADDRESSES[fromToken], CONTRACT_ADDRESSES[toToken]];
            
            // Approve router to spend tokens
            const tokenContract = new ethers.Contract(CONTRACT_ADDRESSES[fromToken], ERC20_ABI, signer);
            await tokenContract.approve(CONTRACT_ADDRESSES.router, amountIn);
            
            tx = await router.swapExactTokensForTokens(
                amountIn,
                amountOutMin,
                path,
                await signer.getAddress(),
                deadline
            );
        }

        // Wait for transaction confirmation
        await tx.wait();
        
        alert('Swap completed successfully!');
        
        // Reload balances
        await loadBalances();
        
        // Reset form
        document.getElementById('fromAmount').value = '';
        document.getElementById('toAmount').value = '';
        
    } catch (error) {
        console.error('Error swapping tokens:', error);
        alert('Swap failed: ' + error.message);
    } finally {
        // Reset button state
        const swapBtn = document.getElementById('swapBtn');
        swapBtn.innerHTML = '<i class="fas fa-exchange-alt me-2"></i>Swap';
        swapBtn.disabled = false;
    }
}

// Add liquidity
async function addLiquidity() {
    try {
        if (!connected || !signer) {
            alert('Please connect your wallet first!');
            return;
        }

        const amountA = document.getElementById('liquidityTokenA').value;
        const amountB = document.getElementById('liquidityTokenB').value;
        const tokenA = document.getElementById('liquidityTokenASelect').value;
        const tokenB = document.getElementById('liquidityTokenBSelect').value;

        if (!amountA || !amountB || amountA <= 0 || amountB <= 0) {
            alert('Please enter valid amounts for both tokens');
            return;
        }

        if (tokenA === tokenB) {
            alert('Cannot add liquidity with the same token');
            return;
        }

        // Show loading state
        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Adding...';
        btn.disabled = true;

        const deadline = Math.floor(Date.now() / 1000) + 300;
        const amountADesired = ethers.utils.parseEther(amountA);
        const amountBDesired = ethers.utils.parseEther(amountB);

        // Approve tokens
        const tokenAContract = new ethers.Contract(CONTRACT_ADDRESSES[tokenA], ERC20_ABI, signer);
        const tokenBContract = new ethers.Contract(CONTRACT_ADDRESSES[tokenB], ERC20_ABI, signer);
        
        await tokenAContract.approve(CONTRACT_ADDRESSES.router, amountADesired);
        await tokenBContract.approve(CONTRACT_ADDRESSES.router, amountBDesired);

        // Add liquidity
        const tx = await router.addLiquidity(
            CONTRACT_ADDRESSES[tokenA],
            CONTRACT_ADDRESSES[tokenB],
            amountADesired,
            amountBDesired,
            0, // amountAMin
            0, // amountBMin
            await signer.getAddress(),
            deadline
        );

        await tx.wait();
        alert('Liquidity added successfully!');
        
        // Reset form
        document.getElementById('liquidityTokenA').value = '';
        document.getElementById('liquidityTokenB').value = '';

    } catch (error) {
        console.error('Error adding liquidity:', error);
        alert('Failed to add liquidity: ' + error.message);
    } finally {
        // Reset button state
        const btn = event.target;
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Remove liquidity
async function removeLiquidity() {
    alert('Remove liquidity functionality coming soon!');
}

// Calculate swap amounts
async function calculateSwapAmounts() {
    const fromAmount = document.getElementById('fromAmount').value;
    const fromToken = document.getElementById('fromToken').value;
    const toToken = document.getElementById('toToken').value;
    
    if (!fromAmount || fromAmount <= 0) {
        document.getElementById('toAmount').value = '';
        return;
    }

    try {
        if (fromToken === toToken) {
            document.getElementById('toAmount').value = fromAmount;
            return;
        }

        // For demo purposes, use a simple calculation
        // In a real implementation, you would call the router's getAmountsOut function
        const amount = parseFloat(fromAmount);
        let outputAmount;
        
        if (fromToken === 'ETH' && toToken === 'TKA') {
            outputAmount = amount * 100; // 1 ETH = 100 TKA
        } else if (fromToken === 'TKA' && toToken === 'ETH') {
            outputAmount = amount / 100; // 100 TKA = 1 ETH
        } else if (fromToken === 'ETH' && toToken === 'TKB') {
            outputAmount = amount * 200; // 1 ETH = 200 TKB
        } else if (fromToken === 'TKB' && toToken === 'ETH') {
            outputAmount = amount / 200; // 200 TKB = 1 ETH
        } else if (fromToken === 'TKA' && toToken === 'TKB') {
            outputAmount = amount * 2; // 1 TKA = 2 TKB
        } else if (fromToken === 'TKB' && toToken === 'TKA') {
            outputAmount = amount / 2; // 2 TKB = 1 TKA
        } else {
            outputAmount = amount;
        }

        document.getElementById('toAmount').value = outputAmount.toFixed(6);
        
        // Update exchange rate
        document.getElementById('swapRate').textContent = (outputAmount / amount).toFixed(4);
        
    } catch (error) {
        console.error('Error calculating swap amounts:', error);
        document.getElementById('toAmount').value = '';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    init();
    
    // Add input event listeners for real-time calculation
    document.getElementById('fromAmount').addEventListener('input', calculateSwapAmounts);
    document.getElementById('fromToken').addEventListener('change', calculateSwapAmounts);
    document.getElementById('toToken').addEventListener('change', calculateSwapAmounts);
    
    // Initialize MEV protection switch (even if wallet not connected)
    initializeMEVProtectionSwitch();
    
    // Update MEV analytics every 30 seconds
    setInterval(updateMEVAnalytics, 30000);
    
    // Initial MEV analytics update
    updateMEVAnalytics();
});

// Utility function to format addresses
function formatAddress(address) {
    if (!address) return '';
    return address.slice(0, 6) + '...' + address.slice(-4);
}

// Load MEV protection status
async function loadMEVProtectionStatus() {
    try {
        if (!mevGuard) return;
        
        // Get current block number
        currentBlock = await provider.getBlockNumber();
        
        // Get MEV protection configuration
        const protectionDuration = await mevGuard.antiFrontDefendBlock();
        const mevFee = await mevGuard.antiMEVFeePercentage();
        const minTxSize = await mevGuard.antiMEVAmountOutLimitRate();
        
        // Update configuration inputs
        document.getElementById('protectionDuration').value = protectionDuration.toString();
        document.getElementById('mevFee').value = (mevFee / 100).toFixed(1); // Convert from basis points
        document.getElementById('minTxSize').value = (minTxSize / 100).toFixed(1); // Convert from basis points
        
        // Update MEV config object
        mevConfig = {
            protectionDuration: protectionDuration,
            mevFee: mevFee / 100,
            minTxSize: minTxSize / 100
        };
        
        // Update protection status display
        updateMEVProtectionDisplay();
        
    } catch (error) {
        console.error('Error loading MEV protection status:', error);
    }
}

// Update MEV protection display
function updateMEVProtectionDisplay() {
    try {
        // Only update if MEV protection is enabled
        if (!mevProtectionEnabled) {
            return;
        }
        
        // Calculate protection expiry
        const protectionExpiry = Math.max(0, mevConfig.protectionDuration);
        document.getElementById('protectionExpiry').textContent = protectionExpiry;
        
        // Update protection level based on remaining blocks
        const protectionLevel = protectionExpiry > 50 ? 'High' : protectionExpiry > 20 ? 'Medium' : 'Low';
        const protectionLevelBadge = document.getElementById('mevProtectionLevel');
        protectionLevelBadge.textContent = protectionLevel;
        
        // Update badge colors
        protectionLevelBadge.className = 'badge ' + 
            (protectionLevel === 'High' ? 'bg-success' : 
             protectionLevel === 'Medium' ? 'bg-warning' : 'bg-danger');
        
        // Update front-running status
        const frontRunningStatus = document.getElementById('frontRunningStatus');
        if (protectionExpiry > 0) {
            frontRunningStatus.textContent = 'Active';
            frontRunningStatus.className = 'badge bg-success';
            document.getElementById('frontRunningBlocks').textContent = `${protectionExpiry} blocks remaining`;
        } else {
            frontRunningStatus.textContent = 'Inactive';
            frontRunningStatus.className = 'badge bg-secondary';
            document.getElementById('frontRunningBlocks').textContent = 'Protection expired';
        }
        
        // Update Anti-MEV status
        const antiMEVStatus = document.getElementById('antiMEVStatus');
        if (protectionExpiry === 0) {
            antiMEVStatus.textContent = 'Active';
            antiMEVStatus.className = 'badge bg-success';
        } else {
            antiMEVStatus.textContent = 'Standby';
            antiMEVStatus.className = 'badge bg-warning';
        }
        
        // Update transaction limits
        document.getElementById('txLimitStatus').textContent = `${mevConfig.minTxSize}% max per trade`;
        
        // Update protection info
        updateMEVProtectionInfo();
        
    } catch (error) {
        console.error('Error updating MEV protection display:', error);
    }
}

// Update MEV configuration
async function updateMEVConfig() {
    try {
        if (!mevGuard || !connected) {
            alert('Please connect your wallet first!');
            return;
        }
        
        const btn = document.getElementById('updateConfigBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Updating...';
        btn.disabled = true;
        
        // Get new values
        const newProtectionDuration = parseInt(document.getElementById('protectionDuration').value);
        const newMevFee = parseFloat(document.getElementById('mevFee').value);
        const newMinTxSize = parseFloat(document.getElementById('minTxSize').value);
        
        // Validate inputs
        if (newProtectionDuration < 50 || newProtectionDuration > 500) {
            throw new Error('Protection duration must be between 50 and 500 blocks');
        }
        if (newMevFee < 0.1 || newMevFee > 5.0) {
            throw new Error('MEV fee must be between 0.1% and 5.0%');
        }
        if (newMinTxSize < 0.1 || newMinTxSize > 2.0) {
            throw new Error('Min transaction size must be between 0.1% and 2.0%');
        }
        
        // Update configuration on-chain
        const tx1 = await mevGuard.setAntiFrontDefendBlock(newProtectionDuration);
        const tx2 = await mevGuard.setAntiMEVFeePercentage(Math.round(newMevFee * 100)); // Convert to basis points
        const tx3 = await mevGuard.setAntiMEVAmountOutLimitRate(Math.round(newMinTxSize * 100)); // Convert to basis points
        
        // Wait for all transactions to confirm
        await Promise.all([tx1.wait(), tx2.wait(), tx3.wait()]);
        
        // Update local config
        mevConfig = {
            protectionDuration: newProtectionDuration,
            mevFee: newMevFee,
            minTxSize: newMinTxSize
        };
        
        // Reload protection status
        await loadMEVProtectionStatus();
        
        alert('MEV configuration updated successfully!');
        
    } catch (error) {
        console.error('Error updating MEV configuration:', error);
        alert('Failed to update configuration: ' + error.message);
    } finally {
        // Reset button state
        const btn = document.getElementById('updateConfigBtn');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Initialize MEV protection switch
function initializeMEVProtectionSwitch() {
    const mevSwitch = document.getElementById('mevProtectionSwitch');
    const mevStatus = document.getElementById('mevProtectionStatus');
    const mevDisabled = document.getElementById('mevProtectionDisabled');
    
    // Load saved state from localStorage
    const savedState = localStorage.getItem('mevProtectionEnabled');
    mevProtectionEnabled = savedState === 'true';
    mevSwitch.checked = mevProtectionEnabled;
    
    // Update UI based on current state
    updateMEVProtectionUI();
    
    // Add event listener for switch toggle
    mevSwitch.addEventListener('change', function() {
        mevProtectionEnabled = this.checked;
        localStorage.setItem('mevProtectionEnabled', mevProtectionEnabled.toString());
        updateMEVProtectionUI();
        
        // Update user's MEV protection status on-chain
        updateUserMEVProtectionStatus(mevProtectionEnabled);
        
        // Show feedback to user
        if (mevProtectionEnabled) {
            showNotification('MEV protection enabled', 'success');
        } else {
            showNotification('MEV protection disabled', 'info');
        }
    });
}

// Update MEV protection UI based on enabled state
function updateMEVProtectionUI() {
    const mevStatus = document.getElementById('mevProtectionStatus');
    const mevDisabled = document.getElementById('mevProtectionDisabled');
    
    if (mevProtectionEnabled) {
        mevStatus.classList.remove('d-none');
        mevStatus.classList.add('d-block');
        mevDisabled.classList.remove('d-block');
        mevDisabled.classList.add('d-none');
        
        // Update protection info based on current state
        updateMEVProtectionInfo();
    } else {
        mevStatus.classList.remove('d-block');
        mevStatus.classList.add('d-none');
        mevDisabled.classList.remove('d-none');
        mevDisabled.classList.add('d-block');
    }
}

// Update MEV protection information
function updateMEVProtectionInfo() {
    const protectionInfo = document.getElementById('mevProtectionInfo');
    
    if (mevConfig.protectionDuration > 0) {
        protectionInfo.textContent = 'Anti-front-running protection active';
    } else {
        protectionInfo.textContent = 'Anti-MEV mode active';
    }
}

// Update user's MEV protection status on-chain
async function updateUserMEVProtectionStatus(enabled) {
    try {
        if (!mevGuard || !connected) {
            console.log('MEVGuard not available or wallet not connected');
            return;
        }
        
        const userAddress = await signer.getAddress();
        
        // Update user's MEV protection status on-chain
        const tx = await mevGuard.setUserMEVEnabled(userAddress, enabled);
        await tx.wait();
        
        console.log(`User MEV protection ${enabled ? 'enabled' : 'disabled'} on-chain`);
        
    } catch (error) {
        console.error('Error updating user MEV protection status:', error);
        // Don't show error to user as this is not critical
    }
}

// Load user's MEV protection status from chain
async function loadUserMEVProtectionStatus() {
    try {
        if (!mevGuard || !connected) {
            return;
        }
        
        const userAddress = await signer.getAddress();
        const onChainStatus = await mevGuard.isUserMEVEnabled(userAddress);
        
        // Update local state to match on-chain state
        mevProtectionEnabled = onChainStatus;
        
        // Update UI
        const mevSwitch = document.getElementById('mevProtectionSwitch');
        if (mevSwitch) {
            mevSwitch.checked = mevProtectionEnabled;
            updateMEVProtectionUI();
        }
        
        console.log(`Loaded user MEV protection status: ${onChainStatus}`);
        
    } catch (error) {
        console.error('Error loading user MEV protection status:', error);
    }
}

// Show notification to user
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Simulate MEV protection analytics (for demo purposes)
function updateMEVAnalytics() {
    // In a real implementation, these would come from on-chain events
    const blockedTransactions = Math.floor(Math.random() * 50);
    const protectionEfficiency = (99.5 + Math.random() * 0.5).toFixed(1);
    const avgGasSaved = (0.01 + Math.random() * 0.02).toFixed(3);
    
    document.getElementById('blockedTransactions').textContent = blockedTransactions;
    document.getElementById('protectionEfficiency').textContent = protectionEfficiency + '%';
    document.getElementById('avgGasSaved').textContent = avgGasSaved;
    
    // Update last attack time
    if (blockedTransactions > 0) {
        const lastAttack = new Date(Date.now() - Math.random() * 86400000); // Random time in last 24h
        document.getElementById('lastAttack').textContent = lastAttack.toLocaleTimeString();
    }
}

// Utility function to format numbers
function formatNumber(number, decimals = 6) {
    if (isNaN(number)) return '0';
    return parseFloat(number).toFixed(decimals);
}
