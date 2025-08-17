// Simple app.js for testing
let provider, signer;
let connected = false;

// Initialize the application
async function init() {
    console.log('Initializing application...');
    try {
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
        document.getElementById('swapBtn').disabled = false;
        document.querySelector('button[onclick="connectWallet()"]').innerHTML = 
            `<i class="fas fa-check me-2"></i>${address.slice(0, 6)}...${address.slice(-4)}`;
        
        console.log('Wallet connected:', address);
        alert('Wallet connected successfully: ' + address);
        
    } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Failed to connect wallet: ' + error.message);
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

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
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
