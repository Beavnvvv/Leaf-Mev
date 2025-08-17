// Debug version of app.js
console.log('Debug app.js loading...');

let provider, signer;
let connected = false;

// Basic connectWallet function
async function connectWallet() {
    console.log('connectWallet function called');
    try {
        if (typeof ethers === 'undefined') {
            alert('Ethers.js not loaded!');
            return;
        }
        
        if (typeof window.ethereum === 'undefined') {
            alert('MetaMask not installed!');
            return;
        }
        
        provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        
        if (accounts.length === 0) {
            alert('No accounts found!');
            return;
        }
        
        signer = provider.getSigner();
        const address = await signer.getAddress();
        connected = true;
        
        alert('Wallet connected: ' + address);
        console.log('Wallet connected successfully:', address);
        
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
    console.log('Connected:', connected);
    alert('Check console for connection test results');
}

// Initialize function
async function init() {
    console.log('Initializing debug app...');
    if (typeof ethers !== 'undefined') {
        console.log('Ethers.js loaded successfully');
    } else {
        console.error('Ethers.js not loaded');
    }
}

// DOM ready event
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Debug version');
    init();
});

console.log('Debug app.js loaded successfully');
