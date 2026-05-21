# Coin Islands Wallet 工程地图

## 1. 项目定位

Coin Islands Wallet 是基于 `token-ui` 改造的像素海岛钱包原型。它把传统钱包里的账户、资产、收款、转账、交易记录重新组织成“群岛”体验：

- 每个钱包账户是一座岛屿。
- 收款入口是右上角码头小岛。
- 转账入口是海面上缓慢漂浮的帆船。
- 资产页展示钱包账户与余额状态。
- 航线页展示账本与交易日志。
- 创建钱包、派生地址、签名交易基于 `@consenlabs/tcx-wasm`。

当前实现范围按活动作品边界收敛为：创建本地钱包、显示 BNB Chain 余额、基础转账签名、广播交易、记录交易日志。

数据存储定位：

- 项目没有后端数据库。
- 钱包数据保存在访问者自己的浏览器 `localStorage`。
- 部署到 GitHub + Vercel 后，不同用户的数据互不共享。
- 刷新页面后，已创建岛屿、tcx-wasm keystore 和航线日志会从本地恢复。
- 这是活动作品原型，不建议导入真实助记词或存放大额资产。

## 2. 核心入口

主要页面：

- `apps/web/src/features/wallet/wallet-dashboard.tsx`

主要服务：

- `apps/web/src/features/wallet/services/saferpro-tcx.ts`
- `apps/web/src/features/wallet/services/bnb-rpc.ts`
- `apps/web/src/features/wallet/services/qrcode-generator.mjs`
- `apps/web/src/features/wallet/services/qrcode-generator.d.ts`

本地状态：

- `coin-islands.wallet-state.v1`
- 保存内容：岛屿账户列表、SaferPro/tcx-wasm keystore、交易日志。

主要视觉资源：

- `apps/web/src/assets/coin-islands/backgrounds/ocean-islands-map.png`
- `apps/web/src/assets/coin-islands/sprites/*`
- `apps/web/src/assets/coin-islands/ui/scroll-panel-cutout.png`

## 3. 页面结构

主容器是竖屏手机比例视图，底部五栏导航横向切换窗口。

### 3.1 资产页

功能：

- 展示每个岛屿钱包账户。
- 展示岛屿等级、余额标签、状态和地址。
- 提供“创建钱包”入口。

创建钱包流程：

- 点击创建钱包。
- 调用 `createSaferProWallet`。
- 通过 `tcx-wasm` 创建 keystore。
- 导出助记词用于演示确认。
- 为 Ethereum、Bitcoin、Polygon、Arbitrum、BNB Chain 派生地址。
- 确认后新增一座 Lv1 岛屿，并写入一条“账本创建”日志。
- 新增岛屿和 keystore 会保存到当前浏览器本地，刷新页面不会丢失。

### 3.2 航线页

功能：

- 展示交易日志时间线。
- 按岛屿账户归类交易日志。
- 创建钱包和主动转账会写入航线记录。

边界：

- 自动余额刷新不会新增航线。
- 当前不做自动链上交易扫描。
- 航线日志只代表本应用内明确触发的创建或转账行为。

### 3.3 海岛页

功能：

- 主视图为大海和岛屿地图。
- 岛屿代表钱包账户。
- 右上角码头小岛打开收款弹窗。
- 海面帆船打开转账弹窗。
- 测试阶段固定保留 1 座大型岛、2 座中型岛、3 座小型岛，用于展示布局、缩放和详情页。
- 本地缓存会过滤额外旧岛屿，保证海岛页只显示这 6 座测试岛。
- 海岛渲染前会执行间距布局算法，岛屿外接框之间至少保留 20px。
- 岛屿较多或用户缩放后，地图支持拖拽平移和按钮缩放。
- 点击任意岛屿会打开二级资产页，展示该岛屿钱包内的代币和金额。

帆船运动：

- 由 `useSailboatMotion` 控制。
- 在海面上极慢移动。
- 碰到视图边缘会反向。
- 接近岛屿碰撞圈会转向。

天气层：

- 天气资源位于 `apps/web/src/assets/coin-islands/weather/*`。
- 支持晴天、多云、雪、雨、雷暴五种天气。
- 晴天和多云权重最高，雨雪雷暴低概率出现。
- 天气层约占屏幕顶部五分之一，并可通过多张云层叠加形成组合感。
- 天气会按随机时间间隔自动变化。

### 3.4 探索页

功能：

- 保留游戏化任务和装饰兑换的展示入口。
- 当前不接入真实奖励逻辑。

### 3.5 我的页

功能：

- 展示群岛总值。
- 展示今日航行额。
- 展示岛屿数量。
- 展示群岛钥匙连接状态。

## 4. 卷轴弹窗

卷轴弹窗用于创建钱包、发起转账、选择钱包收款。

实现：

- 背景资源：`scroll-panel-cutout.png`
- 样式类：`.wallet-scroll-panel`
- 打开动画：从下向上滑入展开。
- 关闭动画：向下滑回窗口外。
- 卷轴主体控制在屏幕约三分之二区域内，底部部分隐藏在视窗之外。

## 5. tcx-wasm 集成

文件：

- `apps/web/src/features/wallet/services/saferpro-tcx.ts`

已接能力：

- `create_keystore`
- `export_mnemonic`
- `derive_accounts`
- `sign_tx`

签名输入：

- EVM 链使用 `sign_tx`。
- BNB Chain 转账会传入真实 `nonce`、`gasPrice`、`gasLimit`、`to`、`value`。
- BEP20 转账会额外传入 `transfer(address,uint256)` calldata。

当前边界：

- imKey 真实硬件交互未接入。
- BTC 完整 UTXO 交易构造未接入。
- 当前重点是 BNB Chain 的基础余额、签名和广播演示。
- keystore 与解锁信息用于活动演示，当前以浏览器本地明文状态保存；正式钱包产品必须改为更严格的加密和权限模型。

## 6. BNB Chain 能力

文件：

- `apps/web/src/features/wallet/services/bnb-rpc.ts`

RPC 端点：

- `https://bsc-dataseed.bnbchain.org`
- `https://bsc-dataseed-public.bnbchain.org`
- `https://bsc-rpc.publicnode.com`

已接能力：

- `eth_getBalance` 查询 BNB 余额。
- `eth_call` 查询 BEP20 余额。
- `eth_getTransactionCount` 获取 nonce。
- `eth_gasPrice` 获取 gas price。
- `eth_estimateGas` 估算 BEP20 转账 gas。
- `eth_sendRawTransaction` 广播已签名交易。

支持资产：

- BNB 原生币。
- USDT：`0x55d398326f99059fF775485246999027B3197955`
- USDC：`0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d`

转账流程：

- BNB 原生转账：`to = 收款地址`，`value = 转账金额`，`data = 0x`。
- BEP20 转账：`to = 合约地址`，`value = 0`，`data = transfer(address,uint256)`。
- 使用 `tcx-wasm sign_tx` 签名。
- 使用 `eth_sendRawTransaction` 广播。
- 广播成功后把返回的交易 hash 写入航线日志。

当前边界：

- 钱包必须有 BNB 支付 gas。
- 公共 RPC 可能限流或失败。
- 广播失败会在 UI 中显示错误，不会伪造成成功。
- 当前不做自动链上交易日志扫描。

## 7. 收款二维码

文件：

- `wallet-dashboard.tsx`
- `qrcode-generator.mjs`

实现：

- 使用本地 QR 生成器生成 SVG。
- 不依赖在线二维码 API。
- 二维码内容编码当前所选岛屿在对应链上的钱包收款地址。

规则：

- 有 EVM 收款地址时，二维码内容就是纯 `0x...` 钱包地址。
- 不包含链名。
- 不包含 chainId。
- 不包含代币合约地址。
- 不包含 JSON。
- 不包含说明文字。
- 收款弹窗不展示代币合约映射，避免误转到合约地址。

## 8. 余额刷新与交易日志

余额刷新：

- 使用随机 `2-5 秒`循环。
- 对绑定 SaferPro BNB Chain 地址的岛屿查询 BNB / USDT / USDC 余额。
- 刷新只更新状态文字，不修改岛币余额。
- 刷新不会写入航线日志。

交易日志：

- 创建钱包时写入“账本创建”日志。
- 用户主动提交转账并签名或广播成功时写入转账日志。
- BNB Chain 广播成功时日志会显示广播返回的真实交易 hash。
- 非 BNB Chain 当前只保留本地签名记录，不进行真实广播。

## 9. 验证命令

常用命令：

```powershell
$env:PATH='C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs;' + $env:PATH
& .\node_modules\.bin\tsc.CMD --noEmit
& .\node_modules\.bin\vitest.CMD run
```

## 10. 后续建议

优先级较高：

- 将 BNB RPC 端点改成可配置项，降低公共 RPC 不稳定的影响。
- 增加广播确认状态：pending、confirmed、failed。
- 接入真实 imKey 硬件确认流程。
- 演示或评审时只放小额资产。
