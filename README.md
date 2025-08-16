# Leafswap - Secure DeFi Exchange with MEV Protection

Leafswap是一个基于UniswapV2的去中心化交易所，集成了先进的MEV（矿工可提取价值）保护系统，有效防止初始流动性抢跑攻击和三明治攻击。

## 🎯 项目概述

Leafswap是一个安全的UniswapV2分支，具有增强的安全功能，专门设计用于防止常见的DeFi攻击，特别是MEV攻击。

### 核心特性

- **完整的UniswapV2功能**: 完整的AMM（自动做市商）实现
- **增强的安全保护**: 内置针对常见DeFi攻击的保护机制
- **现代化UI界面**: 美观、响应式的Web界面，集成MEV保护状态监控
- **Gas优化**: 高效的智能合约，最小化Gas成本
- **全面测试**: 所有功能的完整测试覆盖
- **MEV保护系统**: 企业级的MEV攻击防护

## 🛡️ 核心安全功能

### 1. 防止初始流动性抢跑攻击

#### 🔒 保护期设置
- **动态保护期**：根据不同链的区块时间，设置持续数百个区块的初始流动性保护期
- **个性化配置**：每个交易对可单独设置保护参数
- **灵活调整**：支持实时调整保护期长度

#### 🎲 随机性检查
- **动态概率调节**：根据上一区块尝试执行的交易数量动态调节成功概率
- **公平执行**：`successProbability = 1 / previousBlockRequestCount`
- **防操纵**：使用Chainlink VRF确保随机性不可预测

#### 📊 交易数量限制
- **单区块限制**：每个区块每个交易对只允许一笔交易执行
- **状态管理**：通过智能合约状态标记控制执行权限
- **防止女巫攻击**：减少恶意用户创建多个账户的影响

#### 💰 交易规模控制
- **1%限制**：每笔交易代币最大数量不得超过总流动性池储备总量的1%
- **双重保护**：token0和token1都有独立限制
- **防止垄断**：确保流动性池不被单笔交易垄断

#### ⏰ 保护期解除
- **自动解除**：初始流动性保护期结束后，所有限制自动解除
- **平滑过渡**：从保护模式平滑过渡到正常交易模式

### 2. 防止三明治攻击

#### 🚫 Anti-MEV开关
- **强制独占**：开启后强制当前交易成为区块内唯一可执行交易
- **后续阻断**：同一区块内后续交易全部revert
- **攻击破坏**：直接破坏三明治攻击的前置-后置交易结构
- **闪电贷防护**：使闪电贷无法用于此类攻击，提高攻击成本

#### 📏 交易规模检查
- **最小阈值**：可配置的最小交易规模（默认0.5%）
- **防止滥用**：避免DDOS攻击导致协议不可用
- **动态调整**：通过参数灵活配置阈值

#### 💸 MEV手续费
- **额外成本**：对Anti-MEV交易收取额外手续费
- **经济抑制**：减少非必要的Anti-MEV使用
- **可配置**：支持动态调整费率

## 🏗️ 技术架构

### 合约结构
```
LeafswapAMMFactory (增强版工厂)
├── MEVGuard (MEV保护核心)
├── LeafswapPair (增强版交易对)
└── LeafswapRouter (路由器)
```

### 项目结构

```
leafswap/
├── contracts/                    # 智能合约
│   ├── interfaces/              # 合约接口
│   │   └── Mev/                # MEV相关接口
│   ├── libraries/               # 工具库
│   ├── Mev/                     # MEV保护合约
│   │   ├── MEVGuard.sol        # MEV保护核心
│   │   └── SimpleSubscriptionConsumer.sol # 随机数生成器
│   ├── LeafswapAMMFactory.sol   # 增强版工厂合约
│   ├── LeafswapFactory.sol      # 原始工厂合约
│   ├── LeafswapPair.sol         # 交易对合约
│   ├── LeafswapRouter.sol       # 路由器合约
│   └── LeafswapERC20.sol        # LP代币合约
├── frontend/                    # Web界面
│   ├── index.html              # 主HTML文件
│   ├── app.js                  # JavaScript应用
│   ├── config.js               # 配置文件
│   └── README.md               # 前端说明文档
├── scripts/                     # 部署脚本
│   ├── deploy.js               # 基础部署脚本
│   ├── deploy-sepolia.js       # Sepolia测试网部署
│   └── deploy-with-mev.js      # MEV保护系统部署
├── test/                        # 测试文件
│   ├── Leafswap.test.js        # 基础功能测试
│   └── MEVGuard.test.js        # MEV保护测试
├── hardhat.config.js            # Hardhat配置
├── package.json                 # 依赖管理
└── README.md                    # 项目说明文档
```

### 核心组件

#### MEVGuard.sol
- **防护逻辑**：实现所有MEV保护算法
- **状态管理**：管理保护期、交易限制等状态
- **权限控制**：控制工厂合约的权限设置

#### LeafswapAMMFactory.sol
- **MEV集成**：在创建交易对时自动设置MEV保护
- **配置管理**：支持动态调整手续费率等参数
- **事件记录**：完整记录所有重要操作

#### LeafswapPair.sol
- **保护调用**：在swap时调用MEVGuard进行检查
- **状态同步**：与MEVGuard保持状态同步
- **错误处理**：优雅处理被拒绝的交易

## 📋 智能合约

### 核心合约

1. **LeafswapAMMFactory**: 创建和管理交易对，集成MEV保护
2. **LeafswapPair**: 处理单个交易对逻辑，调用MEV保护检查
3. **LeafswapRouter**: 用户友好的交换和流动性接口
4. **MEVGuard**: MEV保护核心合约，实现所有防护算法

### 工具库

1. **SafeMath**: 安全的数学运算
2. **Math**: 数学工具函数
3. **UQ112x112**: 价格计算的定点算术
4. **LeafswapLibrary**: 核心交换计算和工具函数

## 🚀 快速开始

### 环境要求

- Node.js (v16或更高版本)
- npm或yarn
- MetaMask或其他Web3钱包

### 安装步骤

1. 克隆仓库:
```bash
git clone https://github.com/Beavnvvv/Leaf-Mev.git
cd Leaf-Mev
```

2. 安装依赖:
```bash
npm install
```

3. 编译合约:
```bash
npm run compile
```

4. 运行测试:
```bash
npm test
```

5. 部署到本地网络:
```bash
npm run node
npm run deploy
```

## 🚀 部署和使用

### 部署命令
```bash
# 部署包含MEV保护的完整系统
npm run deploy:mev

# 部署到Sepolia测试网
npm run deploy:sepolia

# 部署基础UniswapV2系统
npm run deploy
```

### 配置参数
```javascript
// MEV保护配置
const config = {
    antiFrontDefendBlock: 100,        // 防抢跑保护期（区块数）
    antiMEVFeePercentage: 100,        // MEV手续费（基点，1% = 100）
    antiMEVAmountOutLimitRate: 50,    // 最小交易规模（基点，0.5% = 50）
    swapFeeRate: 30                   // 交易手续费率（基点，0.3% = 30）
};
```

### 测试命令
```bash
# 运行MEV保护测试
npx hardhat test test/MEVGuard.test.js

# 运行所有测试
npx hardhat test
```

### 前端开发

1. 进入前端目录:
```bash
cd frontend
```

2. 在浏览器中打开`index.html`或使用本地服务器:
```bash
python3 -m http.server 8000
# 或
npx serve .
```

3. 连接MetaMask钱包并开始交易!

### 前端MEV保护功能

#### 保护状态监控
- **Anti-Front-Running Protection**: 显示防抢跑保护状态
- **Anti-MEV Mode**: 显示三明治攻击防护状态
- **Transaction Limits**: 显示交易规模限制

#### 配置管理
- **Protection Duration**: 调整保护期长度（50-500区块）
- **MEV Fee**: 设置MEV手续费率（0.1-5.0%）
- **Min Transaction Size**: 设置最小交易规模（0.1-2.0%）

#### 实时分析
- **Blocked Transactions**: 被阻止的交易数量
- **Protection Efficiency**: 保护效率百分比
- **Avg Gas Saved**: 平均节省的Gas费用
- **Last Attack Attempt**: 最后一次攻击尝试时间

## 📱 使用方法

### 添加流动性

1. 连接钱包
2. 导航到Liquidity标签页
3. 选择代币和数量
4. 点击"Add Liquidity"

### 交换代币

1. 连接钱包
2. 选择要交换的代币
3. 输入数量
4. 选择要交换到的代币
5. 点击"Swap"

### 创建交易对

1. 部署工厂合约
2. 在工厂上调用`createPair(tokenA, tokenB)`
3. 交易对将自动创建并初始化

### MEV保护配置

#### 调整保护期
```solidity
// 调整防抢跑保护期
await mevGuard.setAntiFrontDefendBlock(200); // 200个区块
```

#### 调整手续费
```solidity
// 调整MEV手续费
await mevGuard.setAntiMEVFeePercentage(200); // 2%
```

#### 调整交易规模限制
```solidity
// 调整最小交易规模
await mevGuard.setAntiMEVAmountOutLimitRate(100); // 1%
```

## 🧪 测试

运行全面的测试套件:

```bash
npm test
```

测试套件覆盖:
- 工厂功能
- 交易对创建和管理
- 路由器操作
- 交换功能
- 流动性操作
- 安全功能
- MEV保护功能

## 📊 保护效果

### 初始流动性保护期
- **保护强度**：⭐⭐⭐⭐⭐
- **攻击成本**：极高（需要控制大量区块）
- **用户体验**：公平的随机执行机会

### 三明治攻击防护
- **防护效果**：⭐⭐⭐⭐⭐
- **攻击成本**：极高（无法完成三明治结构）
- **交易成本**：增加MEV手续费

### 整体安全性
- **MEV防护**：⭐⭐⭐⭐⭐
- **流动性保护**：⭐⭐⭐⭐⭐
- **用户体验**：⭐⭐⭐⭐

## 🚀 部署

### 本地开发

```bash
npm run node        # 启动本地Hardhat节点
npm run deploy      # 部署合约
```

### 测试网部署

```bash
npm run deploy:testnet
```

### 主网部署

```bash
npm run deploy:mainnet
```

## 📈 性能指标

### Gas消耗
- **MEV检查**：~15,000 gas
- **保护期检查**：~8,000 gas
- **随机数生成**：~25,000 gas

### 延迟影响
- **保护期内**：交易延迟增加1-2个区块
- **正常模式**：无额外延迟
- **Anti-MEV模式**：无额外延迟

## ⚙️ 配置

### 环境变量

创建`.env`文件:

```env
PRIVATE_KEY=your_private_key_here
TESTNET_URL=your_testnet_rpc_url
MAINNET_URL=your_mainnet_rpc_url
ETHERSCAN_API_KEY=your_etherscan_api_key
SEPOLIA_URL=your_sepolia_rpc_url
```

### 网络配置

更新`hardhat.config.js`中的网络设置。

## 🔧 配置和调优

### 保护期调整
```solidity
// 调整防抢跑保护期
await mevGuard.setAntiFrontDefendBlock(200); // 200个区块
```

### 手续费调整
```solidity
// 调整MEV手续费
await mevGuard.setAntiMEVFeePercentage(200); // 2%
```

### 交易规模限制
```solidity
// 调整最小交易规模
await mevGuard.setAntiMEVAmountOutLimitRate(100); // 1%
```

## 🔒 安全考虑

- **私钥安全**: 永远不要将私钥提交到版本控制
- **测试**: 在主网部署前始终在测试网上测试
- **审计**: 生产环境使用前考虑专业安全审计
- **升级**: 如需要，制定合约升级计划

## 🚨 注意事项

### 部署要求
1. **Chainlink VRF**：需要配置有效的订阅ID
2. **LINK代币**：确保有足够的LINK支付随机数费用
3. **网络配置**：确认目标网络的VRF Coordinator地址

### 安全考虑
1. **权限管理**：严格控制feeToSetter权限
2. **参数验证**：确保所有配置参数在合理范围内
3. **紧急暂停**：建议实现紧急暂停机制

### 维护建议
1. **定期监控**：监控保护效果和攻击尝试
2. **参数调优**：根据实际使用情况调整参数
3. **升级计划**：制定合约升级和参数调整计划

## 🤝 贡献和反馈

欢迎提交Issue和Pull Request来改进MEV保护系统！

### 贡献步骤
1. Fork仓库
2. 创建功能分支
3. 进行更改
4. 为新功能添加测试
5. 提交Pull Request

### 联系方式
- GitHub: [https://github.com/Beavnvvv/Leaf-Mev](https://github.com/Beavnvvv/Leaf-Mev)
- 项目主页: [Leafswap MEV Protection](https://github.com/Beavnvvv/Leaf-Mev)

## 📄 许可证

本项目采用MIT许可证 - 详见LICENSE文件。

## ⚠️ 免责声明

本软件仅供教育和开发目的使用。使用风险自负。作者不对任何财务损失或损害负责。

**免责声明**: 本系统提供了强大的MEV保护，但无法保证100%的安全性。用户应自行评估风险并采取适当的风险管理措施。

## 📞 支持

如有问题和支持:
- 在GitHub上提交Issue
- 查看文档
- 查看测试文件示例

## 🗺️ 路线图

- [x] 基础MEV保护
- [x] 前端MEV保护界面
- [x] 配置管理功能
- [ ] 多链支持
- [ ] 治理代币
- [ ] 高级分析
- [ ] 移动应用
- [ ] API端点

---

由Leafswap团队用❤️构建
