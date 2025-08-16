let provider, signer, router, factory;
let connected = false;

// Contract addresses (will be updated after deployment)
const CONTRACT_ADDRESSES = {
    factory: '',
    router: '',
    weth: '',
    tokenA: '',
    tokenB: ''
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
    "function createPair(address tokenA, address tokenB) external returns (address pair)"
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
});

// Utility function to format addresses
function formatAddress(address) {
    if (!address) return '';
    return address.slice(0, 6) + '...' + address.slice(-4);
}

// Utility function to format numbers
function formatNumber(number, decimals = 6) {
    if (isNaN(number)) return '0';
    return parseFloat(number).toFixed(decimals);
}
