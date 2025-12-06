# PM123 - Polymarket 中文数据分析平台

PM123 是一个模仿 Polymarket Analytics 的中文数据分析网站，提供实时预测市场数据、交易者排行榜和强大的分析工具。

## 🎯 功能特性

### 已实现
- ✅ Next.js 15 + React 19 + TypeScript
- ✅ Tailwind CSS + Polymarket 设计风格
- ✅ Polymarket API 封装（Gamma、Data、WebSocket）
- ✅ 响应式导航组件
- ✅ 基础页面结构
  - 首页
  - 交易者排行榜（框架）
  - 市场列表（实时数据）
  - 活动监控（框架）

### 开发中
- 🚧 交易者数据分析
- 🚧 完整的市场搜索和筛选
- 🚧 实时活动追踪
- 🚧 WebSocket 实时数据流
- 🚧 投资组合追踪
- 🚧 数据可视化图表

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 15 (App Router)
- **UI**: React 19
- **样式**: Tailwind CSS
- **语言**: TypeScript
- **字体**: Open Sauce One（Polymarket 同款）

### API 集成
- **Gamma API**: 市场和事件数据
- **Data API**: 用户数据和统计
- **WebSocket**: 实时订单簿和交易通知
- **HTTP 客户端**: Got + 代理支持

### 设计系统
完全模仿 Polymarket 官网设计：
- Poly Blue (#1652f0) 主品牌色
- Open Sauce One 字体
- 8px 网格系统
- 响应式断点：600px / 1024px

## 📦 安装

```bash
# 克隆项目
git clone <your-repo>
cd pm123

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

## 📁 项目结构

```
pm123/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   ├── traders/           # 交易者排行榜
│   ├── markets/           # 市场列表
│   └── activity/          # 活动监控
├── components/            # React 组件
│   └── Navigation.tsx     # 导航栏
├── lib/                   # 库和工具
│   └── polymarket/        # Polymarket API 封装
│       ├── gammaClient.ts    # Gamma API 客户端
│       ├── dataClient.ts     # Data API 客户端
│       ├── wssClient.ts      # WebSocket 客户端
│       └── index.ts          # 导出
├── utils/                 # 工具函数
│   └── httpClient.ts      # HTTP 客户端
├── types/                 # TypeScript 类型
├── tailwind.config.ts     # Tailwind 配置
├── tsconfig.json          # TypeScript 配置
└── package.json           # 依赖配置
```

## 🎨 设计系统

### 色彩
```typescript
polyBlue: "#1652f0"      // 主品牌色
polyRed: "#E23939"       // 品牌红
polyPink: "#e04569"      // 强调粉
success: "#219653"       // 成功/涨
error: "#E64800"         // 错误/跌
```

### 字号
```typescript
xxs: "0.625rem" (10px)
xs: "0.75rem" (12px)
sm: "0.875rem" (14px)
md: "1rem" (16px)
lg: "1.125rem" (18px)
xl: "1.25rem" (20px)
...
5xl: "2.25rem" (36px)
```

### 间距
基于 8px 网格系统，从 4px 到 384px

## 🔌 API 使用

### Gamma API - 市场数据
```typescript
import { PolymarketGammaClient } from "@/lib/polymarket";

const client = new PolymarketGammaClient();

// 获取市场列表
const markets = await client.listMarkets({
  limit: 20,
  active: true,
  order: "volume_num",
  ascending: false,
});

// 搜索市场
const results = await client.searchMarketsEventsAndProfiles({
  q: "Trump",
  limitPerType: 10,
});
```

### Data API - 用户数据
```typescript
import { PolymarketDataClient } from "@/lib/polymarket";

const client = new PolymarketDataClient();

// 获取用户仓位
const positions = await client.getPositions({
  user: "0x...",
  limit: 50,
});

// 获取用户统计
const stats = await client.getUserStats({
  user: "0x...",
});
```

### WebSocket - 实时数据
```typescript
import { PolymarketWssClient } from "@/lib/polymarket";

const wss = new PolymarketWssClient();

// 订阅市场数据
const conn = wss.createMarketConnection(["assetId1", "assetId2"]);

conn.on("book", (snapshot) => {
  console.log("订单簿快照:", snapshot);
});

await conn.connect();
```

## 📝 开发计划

### Phase 1 - 基础框架 ✅
- [x] Next.js 项目初始化
- [x] Tailwind CSS 配置
- [x] Polymarket API 封装
- [x] 基础页面结构
- [x] 导航组件

### Phase 2 - 核心功能 🚧
- [ ] 交易者数据获取和展示
- [ ] 市场搜索和筛选
- [ ] 实时活动追踪
- [ ] 数据可视化（图表）
- [ ] 响应式优化

### Phase 3 - 高级功能 📋
- [ ] 投资组合追踪
- [ ] 用户认证
- [ ] 数据导出
- [ ] 高级筛选器
- [ ] 性能优化

### Phase 4 - 扩展功能 💡
- [ ] 多链支持
- [ ] AI 预测分析
- [ ] 社交功能
- [ ] 移动端 App

## ⚠️ 注意事项

1. **API 限制**: Polymarket Analytics 的核心数据 API（如交易者排行榜）不公开，需要自建数据索引
2. **数据更新**: Goldsky 数据管道需要单独配置
3. **代理支持**: 已集成 HTTP/SOCKS5 代理支持，可通过环境变量配置
4. **字体**: Open Sauce One 需要自行下载或使用 CDN

## 🔗 相关链接

- [Polymarket](https://polymarket.com)
- [Polymarket Analytics](https://polymarketanalytics.com)
- [Polymarket 文档](https://docs.polymarket.com)
- [Gamma API 文档](https://docs.polymarket.com/developers/subgraph)
- [Goldsky](https://goldsky.com)

## 📄 开源协议

MIT License

---

**Built with ❤️ by PM123 Team**

实时预测市场数据，助力明智决策 🚀
