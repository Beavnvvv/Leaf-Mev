// 前端配置文件
window.LEAFSWAP_CONFIG = {
    // 合约地址配置
    CONTRACT_ADDRESSES: {
        // 本地网络地址
        localhost: {
            factory: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
            router: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
            weth: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
            tokenA: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
            tokenB: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
            mevGuard: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
        },
        // Sepolia测试网地址
        sepolia: {
            factory: "0x...", // 待部署
            router: "0x...", // 待部署
            weth: "0x...", // 待部署
            mevGuard: "0xed2B5D85db3D0b5Cb24D074c83b32d5446eAbDb8" // 已部署的SubcriptionConsumer
        }
    },

    // MEV保护配置
    MEV_CONFIG: {
        enabled: true,
        defaultProtection: false, // 默认不启用MEV保护
        antiFrontRunningBlocks: 100,
        antiMEVFeePercentage: 100, // 1%
        antiMEVAmountOutLimitRate: 50 // 0.5%
    },

    // 网络配置
    NETWORK_CONFIG: {
        defaultNetwork: "localhost", // 默认使用本地网络
        supportedNetworks: {
            localhost: {
                chainId: 31337,
                name: "Localhost",
                rpcUrl: "http://127.0.0.1:8545",
                explorer: null
            },
            sepolia: {
                chainId: 11155111,
                name: "Sepolia Testnet",
                rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/demo",
                explorer: "https://sepolia.etherscan.io"
            }
        }
    },

    // UI配置
    UI_CONFIG: {
        theme: "dark",
        language: "en",
        autoConnect: true,
        showMEVProtection: true
    }
};
