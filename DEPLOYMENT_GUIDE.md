# 快速部署指南

## 你的订阅ID
```
30867384965334728711427918226381771937390809014305130314753698149523927636152
```

## 部署步骤

### 1. 本地测试部署
```bash
# 启动本地节点
npx hardhat node

# 新开终端，部署到本地
npx hardhat run scripts/deploy-subscription-consumer.js --network localhost
```

### 2. Sepolia测试网部署
```bash
# 确保设置了环境变量
export PRIVATE_KEY="你的私钥"
export SEPOLIA_URL="你的Sepolia RPC URL"

# 部署到Sepolia
npx hardhat run scripts/deploy-subscription-consumer-sepolia.js --network sepolia
```

### 3. 验证部署
部署完成后，你会看到类似这样的输出：
```
SubcriptionConsumer deployed to: 0x...
Subscription ID: 30867384965334728711427918226381771937390809014305130314753698149523927636152
Network: Sepolia Testnet
✅ Subscription ID verification successful!
```

## 重要提醒

1. **确保订阅有足够的LINK余额**
   - 访问 https://vrf.chain.link/
   - 检查订阅ID: `30867384965334728711427918226381771937390809014305130314753698149523927636152`
   - 确保有足够的LINK代币

2. **网络配置**
   - Sepolia测试网: 使用 `scripts/deploy-subscription-consumer-sepolia.js`
   - 本地测试: 使用 `scripts/deploy-subscription-consumer.js`

3. **测试功能**
   ```bash
   # 运行测试
   npx hardhat test test/SubscriptionConsumer.test.js
   ```

## 故障排除

如果遇到问题：
1. 检查私钥和RPC URL是否正确
2. 确认账户有足够的ETH支付gas费
3. 验证Chainlink订阅状态
4. 查看部署日志中的错误信息
