const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MEVGuard", function () {
    let mevGuard, factory, tokenA, tokenB, pair, owner, user1, user2, user3;
    
    beforeEach(async function () {
        [owner, user1, user2, user3] = await ethers.getSigners();
        
        // 部署测试代币
        const TestToken = await ethers.getContractFactory("TestToken");
        tokenA = await TestToken.deploy("Test Token A", "TKA");
        tokenB = await TestToken.deploy("Test Token B", "TKB");
        
        // 部署MEVGuard（使用模拟的SubscriptionConsumer）
        const MEVGuard = await ethers.getContractFactory("MEVGuard");
        mevGuard = await MEVGuard.deploy(
            owner.address,
            100, // antiFrontDefendBlock: 100个区块
            100, // antiMEVFeePercentage: 1%
            50,  // antiMEVAmountOutLimitRate: 0.5%
            "0x0000000000000000000000000000000000000001" // 模拟的SubscriptionConsumer地址
        );
        
        // 部署工厂合约
        const LeafswapAMMFactory = await ethers.getContractFactory("LeafswapAMMFactory");
        factory = await LeafswapAMMFactory.deploy(
            owner.address, // feeToSetter
            30, // swapFeeRate: 0.3%
            mevGuard.address // MEVGuard
        );
        
        // 设置工厂权限
        await mevGuard.setFactoryStatus(factory.address, true);
        
        // 创建交易对
        await factory.createPair(tokenA.address, tokenB.address);
        const pairAddress = await factory.getPair(tokenA.address, tokenB.address);
        pair = await ethers.getContractAt("LeafswapPair", pairAddress);
        
        // 添加流动性 - 转移代币到交易对
        await tokenA.transfer(pair.address, ethers.utils.parseEther("1000"));
        await tokenB.transfer(pair.address, ethers.utils.parseEther("1000"));
        
        // 调用mint函数添加流动性
        const mintTx = await pair.mint(owner.address);
        await mintTx.wait();
    });
    
    describe("基础功能", function () {
        it("应该正确设置初始参数", async function () {
            expect(await mevGuard.antiFrontDefendBlock()).to.equal(100);
            expect(await mevGuard.antiMEVFeePercentage()).to.equal(100);
            expect(await mevGuard.antiMEVAmountOutLimitRate()).to.equal(50);
            expect(await mevGuard.factories(factory.address)).to.be.true;
        });
        
        it("应该正确设置交易对的防抢跑边界", async function () {
            const pairBlockEdge = await mevGuard.antiFrontDefendBlockEdges(pair.address);
            expect(pairBlockEdge).to.be.gt(0);
        });
    });
    
    describe("防抢跑保护", function () {
        it("在保护期内应该限制交易规模", async function () {
            const [reserve0, reserve1] = await pair.getReserves();
            const maxAmount = reserve0.div(200); // 0.5%限制
            
            // 尝试超过限制的交易
            const result = await mevGuard.defend(
                false, // 不在Anti-MEV模式
                reserve0,
                reserve1,
                maxAmount.add(1), // 超过限制
                0
            );
            
            expect(result).to.be.false;
        });
        
        it("在保护期内应该限制每个区块只能有一笔交易", async function () {
            const [reserve0, reserve1] = await pair.getReserves();
            const smallAmount = reserve0.div(1000); // 0.1%
            
            // 第一笔交易应该成功
            const result1 = await mevGuard.defend(
                false,
                reserve0,
                reserve1,
                smallAmount,
                0
            );
            
            // 第二笔交易应该失败
            const result2 = await mevGuard.defend(
                false,
                reserve0,
                reserve1,
                smallAmount,
                0
            );
            
            expect(result1).to.be.true;
            expect(result2).to.be.false;
        });
        
        it("同一用户在同一区块内只能请求一次", async function () {
            const [reserve0, reserve1] = await pair.getReserves();
            const smallAmount = reserve0.div(1000);
            
            // 第一次请求
            const result1 = await mevGuard.defend(
                false,
                reserve0,
                reserve1,
                smallAmount,
                0
            );
            
            // 同一用户再次请求应该失败
            const result2 = await mevGuard.defend(
                false,
                reserve0,
                reserve1,
                smallAmount,
                0
            );
            
            expect(result1).to.be.true;
            expect(result2).to.be.false;
        });
    });
    
    describe("Anti-MEV模式", function () {
        it("在Anti-MEV模式下应该限制交易规模", async function () {
            const [reserve0, reserve1] = await pair.getReserves();
            const minAmount = reserve0.mul(50).div(10000); // 0.5%
            
            // 交易规模太小应该失败
            const smallAmount = minAmount.sub(1);
            await expect(
                mevGuard.defend(true, reserve0, reserve1, smallAmount, 0)
            ).to.be.revertedWithCustomError(mevGuard, "TransactionSizeTooSmall");
        });
        
        it("在Anti-MEV模式下每个区块只能有一笔交易", async function () {
            const [reserve0, reserve1] = await pair.getReserves();
            const validAmount = reserve0.mul(50).div(10000); // 0.5%
            
            // 第一笔交易应该成功
            const result1 = await mevGuard.defend(
                true,
                reserve0,
                reserve1,
                validAmount,
                0
            );
            
            // 第二笔交易应该失败
            await expect(
                mevGuard.defend(true, reserve0, reserve1, validAmount, 0)
            ).to.be.revertedWithCustomError(mevGuard, "BlockLimit");
            
            expect(result1).to.be.true;
        });
    });
    
    describe("权限管理", function () {
        it("只有工厂合约可以设置防抢跑边界", async function () {
            await expect(
                mevGuard.connect(user1).setAntiFrontDefendBlockEdge(pair.address, 1000)
            ).to.be.revertedWithCustomError(mevGuard, "PermissionDenied");
        });
        
        it("只有所有者可以修改配置参数", async function () {
            await expect(
                mevGuard.connect(user1).setAntiFrontDefendBlock(200)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
        
        it("所有者可以修改配置参数", async function () {
            await mevGuard.setAntiFrontDefendBlock(200);
            expect(await mevGuard.antiFrontDefendBlock()).to.equal(200);
        });
    });
    
    describe("边界情况", function () {
        it("未授权的交易对调用应该失败", async function () {
            const [reserve0, reserve1] = await pair.getReserves();
            
            await expect(
                mevGuard.connect(user1).defend(false, reserve0, reserve1, 1000, 0)
            ).to.be.revertedWithCustomError(mevGuard, "PermissionDenied");
        });
        
        it("零储备量的交易对应该正确处理", async function () {
            const result = await mevGuard.defend(false, 0, 0, 0, 0);
            expect(result).to.be.false; // 应该被拒绝
        });
    });
});
