# Leafswap - Secure DeFi Exchange

Leafswap is a secure fork of UniswapV2 with enhanced security features to prevent initial liquidity front-running attacks and sandwich attacks.

## Features

- **Core UniswapV2 Functionality**: Complete AMM (Automated Market Maker) implementation
- **Enhanced Security**: Built-in protections against common DeFi attacks
- **Modern UI**: Beautiful, responsive web interface
- **Gas Optimization**: Efficient smart contracts with minimal gas costs
- **Comprehensive Testing**: Full test coverage for all functionality

## Security Features

### Initial Liquidity Protection
- Prevents front-running attacks when creating new trading pairs
- Time-delayed liquidity addition
- Minimum liquidity requirements

### Sandwich Attack Prevention
- MEV-resistant transaction ordering
- Slippage protection mechanisms
- Transaction deadline enforcement

## Project Structure

```
leafswap/
├── contracts/                 # Smart contracts
│   ├── interfaces/           # Contract interfaces
│   ├── libraries/            # Utility libraries
│   ├── test/                 # Test contracts
│   ├── LeafswapFactory.sol   # Factory contract
│   ├── LeafswapPair.sol      # Pair contract
│   └── LeafswapRouter.sol    # Router contract
├── frontend/                 # Web interface
│   ├── index.html           # Main HTML file
│   └── app.js               # JavaScript application
├── scripts/                  # Deployment scripts
│   └── deploy.js            # Main deployment script
├── test/                     # Test files
│   └── Leafswap.test.js     # Main test suite
├── hardhat.config.js         # Hardhat configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

## Smart Contracts

### Core Contracts

1. **LeafswapFactory**: Creates and manages trading pairs
2. **LeafswapPair**: Handles individual trading pair logic
3. **LeafswapRouter**: User-friendly interface for swaps and liquidity

### Libraries

1. **SafeMath**: Safe mathematical operations
2. **Math**: Mathematical utilities
3. **UQ112x112**: Fixed-point arithmetic for price calculations
4. **LeafswapLibrary**: Core swap calculations and utilities

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask or other Web3 wallet

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd leafswap
```

2. Install dependencies:
```bash
npm install
```

3. Compile contracts:
```bash
npm run compile
```

4. Run tests:
```bash
npm test
```

5. Deploy to local network:
```bash
npm run node
npm run deploy
```

### Frontend Development

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Open `index.html` in your browser or serve it using a local server:
```bash
python -m http.server 8000
# or
npx serve .
```

3. Connect your MetaMask wallet and start trading!

## Usage

### Adding Liquidity

1. Connect your wallet
2. Navigate to the Liquidity tab
3. Select tokens and amounts
4. Click "Add Liquidity"

### Swapping Tokens

1. Connect your wallet
2. Select the token you want to swap from
3. Enter the amount
4. Select the token you want to swap to
5. Click "Swap"

### Creating Pairs

1. Deploy the factory contract
2. Call `createPair(tokenA, tokenB)` on the factory
3. The pair will be automatically created and initialized

## Testing

Run the comprehensive test suite:

```bash
npm test
```

The test suite covers:
- Factory functionality
- Pair creation and management
- Router operations
- Swap functionality
- Liquidity operations
- Security features

## Deployment

### Local Development

```bash
npm run node        # Start local Hardhat node
npm run deploy      # Deploy contracts
```

### Testnet Deployment

```bash
npm run deploy:testnet
```

### Mainnet Deployment

```bash
npm run deploy:mainnet
```

## Configuration

### Environment Variables

Create a `.env` file with:

```env
PRIVATE_KEY=your_private_key_here
TESTNET_URL=your_testnet_rpc_url
MAINNET_URL=your_mainnet_rpc_url
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Network Configuration

Update `hardhat.config.js` with your preferred networks and settings.

## Security Considerations

- **Private Keys**: Never commit private keys to version control
- **Testing**: Always test on testnets before mainnet deployment
- **Auditing**: Consider professional security audits for production use
- **Upgrades**: Plan for contract upgradeability if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This software is for educational and development purposes. Use at your own risk. The authors are not responsible for any financial losses or damages.

## Support

For questions and support:
- Open an issue on GitHub
- Check the documentation
- Review the test files for examples

## Roadmap

- [ ] Advanced MEV protection
- [ ] Multi-chain support
- [ ] Governance token
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] API endpoints

---

Built with ❤️ by the Leafswap team
