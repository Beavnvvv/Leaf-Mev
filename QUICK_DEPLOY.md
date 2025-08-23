# 🚀 快速在线部署指南

## 方法1: Vercel (推荐 - 最简单)

### 步骤1: 注册Vercel账户
1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Sign Up"
3. 选择 "Continue with GitHub"
4. 授权GitHub账户

### 步骤2: 导入项目
1. 在Vercel控制台点击 "New Project"
2. 选择 "Import Git Repository"
3. 选择您的仓库: `Beavnvvv/Leaf-Mev`
4. 点击 "Import"

### 步骤3: 配置部署
1. **Framework Preset:** 选择 "Other"
2. **Root Directory:** 保持默认 (根目录)
3. **Build Command:** 留空
4. **Output Directory:** `frontend`
5. **Install Command:** 留空

### 步骤4: 部署
1. 点击 "Deploy"
2. 等待部署完成 (约1-2分钟)
3. 获得免费域名: `https://your-project.vercel.app`

## 方法2: Netlify (也很简单)

### 步骤1: 注册Netlify账户
1. 访问 [netlify.com](https://netlify.com)
2. 点击 "Sign up"
3. 选择 "Sign up with GitHub"

### 步骤2: 部署项目
1. 点击 "New site from Git"
2. 选择 "GitHub"
3. 选择仓库: `Beavnvvv/Leaf-Mev`
4. 配置:
   - **Base directory:** 留空
   - **Build command:** 留空
   - **Publish directory:** `frontend`
5. 点击 "Deploy site"

## 方法3: GitHub Pages

### 步骤1: 创建部署分支
```bash
# 在项目根目录执行
git checkout -b gh-pages
git push origin gh-pages
```

### 步骤2: 配置GitHub Pages
1. 进入GitHub仓库设置
2. 找到 "Pages" 选项
3. Source 选择 "Deploy from a branch"
4. Branch 选择 "gh-pages"
5. 保存设置

## 🎯 推荐流程

**我建议使用Vercel，因为:**
- ✅ 完全免费
- ✅ 自动部署
- ✅ 全球CDN
- ✅ 自定义域名
- ✅ 优秀的性能

### 快速开始 (Vercel)

1. **访问:** https://vercel.com
2. **注册:** 使用GitHub账户
3. **导入项目:** 选择 `Beavnvvv/Leaf-Mev`
4. **配置:**
   - Framework: Other
   - Output Directory: `frontend`
5. **部署:** 点击Deploy

### 部署后配置

1. **自定义域名 (可选):**
   - 在Vercel控制台 → Settings → Domains
   - 添加您的域名
   - 配置DNS记录

2. **环境变量 (如果需要):**
   - Settings → Environment Variables
   - 添加任何需要的环境变量

## 🔧 部署前检查

确保以下文件存在:
```
frontend/
├── index.html          ✅ 主页面
├── config.js           ✅ 配置文件
├── app-final.js        ✅ 主要逻辑
└── _redirects          ✅ 重定向配置
```

## 🌐 部署后测试

1. **访问您的网站**
2. **测试功能:**
   - 钱包连接
   - 网络切换
   - MEV保护开关
3. **检查控制台:** 确保没有错误

## 📱 移动端测试

1. 在手机上访问您的网站
2. 测试钱包连接
3. 确认界面响应式设计正常

## 🆘 常见问题

### 部署失败
- 检查 `frontend` 目录是否存在
- 确认所有文件都已提交到GitHub
- 查看部署日志

### 页面空白
- 检查浏览器控制台错误
- 确认JavaScript文件加载
- 验证合约地址配置

### 钱包连接失败
- 确认MetaMask连接到Sepolia网络
- 检查RPC URL配置
- 验证合约地址

## 🎉 完成!

部署完成后，您将获得:
- 🌐 免费在线域名
- 🚀 全球CDN加速
- 🔒 自动HTTPS
- 📱 移动端支持

**您的Leafswap项目现在可以在线访问了！** 🎊
