// Polymarket Tag 分类配置
export interface TagCategory {
  id: string;
  name: string;
  tagIds: number[];
  description: string;
  defaultExcluded: boolean;
}

export const TAG_CATEGORIES: TagCategory[] = [
  {
    id: 'sports',
    name: '体育竞技',
    description: '体育赛事、竞技比赛，最后时刻易反转',
    defaultExcluded: true,
    tagIds: [
      1,      // Sports
      100350, // Soccer
      450,    // NFL
      745,    // NBA
      100381, // MLB
      279,    // UFC
      28,     // Basketball
      100396, // NCAA
      102114, // NCAA Basketball
      899,    // NHL
      100088, // Hockey
      306,    // EPL
      780,    // La Liga
      100977, // UCL
      102070, // Ligue 1
      1494,   // Bundesliga
      636,    // College Football
      102160, // NCAA Football
      10,     // Football
      100351, // CFB
      101594, // College Football Playoff
      102934, // College Football Playoffs
      100240, // NBA Finals
      102288, // NBA Champion
      1453,   // NFL Draft
      100089, // Stanley Cup
      435,    // Formula 1
      100389, // F1
      102146, // Grand Prix
      517,    // Cricket
      683,    // Boxing
      100219, // Golf
      864,    // Tennis
      100100, // MLS
      1401594 // CFB Playoffs (if exists)
    ]
  },
  {
    id: 'esports',
    name: '电子竞技',
    description: '电竞赛事，竞技性强，不确定性高',
    defaultExcluded: true,
    tagIds: [
      64,     // Esports
      65,     // League of Legends
      100230, // Call of Duty
      101672, // Valorant
      100780, // Counter Strike 2
      100677, // CS2
      102366, // Dota 2
      102755, // Rainbow Six Siege
      102757, // Honor of Kings
      100644, // LOL
      3,      // Video Games
      102109  // GTA VI
    ]
  },
  {
    id: 'crypto_prices',
    name: '加密货币价格',
    description: '加密货币涨跌预测，价格波动剧烈',
    defaultExcluded: true,
    tagIds: [
      1312,   // Crypto Prices
      102127, // Up or Down
      235,    // Bitcoin
      39,     // Ethereum
      818,    // Solana
      101267, // XRP
      101312, // Ripple
      102134, // Hit Price
      21,     // Crypto (部分)
      101798, // Crypto Policy
      101944, // Crypto Summit
      102332, // MegaETH
      102455, // CryptoPunks
      1392,   // Ethena
      102716, // BNB
      102395, // Chainlink
      101612, // Cardano
      101613, // ADA
      1568,   // PEPE
      620,    // BTC
      787,    // SOL
      136,    // Airdrops
      100170, // Depeg
      100171, // Stablecoins
      870,    // USDT
      137,    // OpenSea
      1327,   // NFT
      800,    // Coinbase
      1431,   // Uniswap
      1392,   // Ethena
      102723, // Worldcoin
      102785  // Metamask
    ]
  },
  {
    id: 'stocks',
    name: '股市短期',
    description: '股票价格、盘前交易，短期波动大',
    defaultExcluded: true,
    tagIds: [
      604,    // Stocks
      102831, // Stock Prices
      102368, // Pre-Market
      102676, // Equities
      102849, // S&P 500
      102677, // TSLA
      102680, // AAPL
      102679, // MSFT
      100266, // NVDA
      102678, // GOOGL
      102681, // AMZN
      102696, // NFLX
      102697, // PLTR
      102698, // OPEN
      102683, // SPX
      102684, // NIK
      102685, // NDX
      102690, // DJI
      102689, // FTSE
      102688, // DAX
      102687, // HSI
      102686, // RUT
      102701, // NYA
      102682, // Indices
      100250, // GameStop
      100216, // GME
      600,    // IPOs
      102599, // IPO
      102691, // Acquisitions
      1013,   // Earnings
      102451, // Earnings Calls
      102458  // Earn 4%
    ]
  },
  {
    id: 'weather',
    name: '天气预测',
    description: '天气预报，变化快，不确定性高',
    defaultExcluded: true,
    tagIds: [
      84,     // Weather
      1474,   // Climate & Weather
      85,     // Hurricanes
      102023, // Hurricane
      832,    // Global Temp
      92,     // Global Warming
      87      // Climate
    ]
  },
  {
    id: 'short_term',
    name: '短期事件',
    description: '日周事件，时间窗口短',
    defaultExcluded: true,
    tagIds: [
      102281, // Daily
      102264, // Weekly
      102467, // 15M
      102175, // 1H
      102531, // 4H
      102144, // Monthly
      102536, // Yearly
      102188, // Monthly Hit
      102893, // Yearly Hit
      102133  // Today
    ]
  },
  {
    id: 'social_media',
    name: '社交媒体',
    description: '推特等社交媒体，舆论波动快',
    defaultExcluded: true,
    tagIds: [
      128,    // Twitter
      127,    // Social Media
      972,    // Tweet Markets
      100343, // Mentions
      176,    // YouTube
      202,    // TikTok
      100177, // X
      596,    // Discord
      1263    // Facebook
    ]
  },
  {
    id: 'politics',
    name: '政治',
    description: '政治选举、政策决定，适合尾盘',
    defaultExcluded: false,
    tagIds: [
      2,      // Politics
      178,    // Elections
      1101,   // US Election
      1597,   // Global Elections
      102289, // Midterms
      264,    // Primaries
      126,    // Trump
      101191, // Trump Presidency
      188,    // U.S. Politics
      101206, // World Elections
      102786, // Nov 4 Elections
      742,    // Chile Election
      102776, // Dutch Election
      102775, // Argentina Election
      101997, // Canadian Election
      102520, // Czech Election
      102922, // Honduras Election
      146,    // Romania
      101321, // Starmer
      514,    // Congress
      100199, // Senate
      101165, // Jan 6
      101164, // January 6
      166,    // Biden
      136,    // Cabinet
      100293, // Obama
      527     // Eric Adams
    ]
  },
  {
    id: 'finance',
    name: '金融经济',
    description: '宏观经济数据，适合尾盘',
    defaultExcluded: false,
    tagIds: [
      120,    // Finance
      100328, // Economy
      100196, // Fed Rates
      159,    // Fed
      102000, // Macro Indicators
      101550, // Jerome Powell
      702,    // Inflation
      101701, // CPI
      100207, // Taxes
      101751, // Deficit
      102028, // Treasuries
      1705,   // Forex
      102548  // Jobs Report
    ]
  },
  {
    id: 'tech',
    name: '科技',
    description: '科技公司、产品发布，适合尾盘',
    defaultExcluded: false,
    tagIds: [
      1401,   // Tech
      101999, // Big Tech
      439,    // AI
      537,    // OpenAI
      1097,   // Apple
      102464, // GPT-5
      540,    // Grok
      102800, // Gemini 3
      1410,   // Gemini
      101647, // Meta
      663,    // Google
      100407, // Netflix
      728,    // Tesla
      553,    // Anthropic
      101866, // xAI
      285,    // Sam Altman
      102039, // Zuckerberg
      102296, // Perplexity
      101734, // DeepSeek
      835     // Artificial Intelligence
    ]
  },
  {
    id: 'geopolitics',
    name: '地缘政治',
    description: '国际关系、外交，适合尾盘',
    defaultExcluded: false,
    tagIds: [
      100265, // Geopolitics
      101970, // World
      96,     // Ukraine
      154,    // Middle East
      180,    // Israel
      101794, // Foreign Policy
      95,     // Russia
      270,    // Putin
      78,     // Iran
      61,     // Gaza
      192,    // NATO
      851,    // Lebanon
      738,    // Yemen
      409,    // Palestine
      159,    // Hamas
      388,    // Netanyahu
      297,    // Hezbollah
      132,    // Syria
      216,    // Zelenskyy
      452,    // Zelensky
      582,    // Houthis
      303,    // China
      648,    // Xi Jinping
      351,    // North Korea
      101590, // Kim Jong Un
      867,    // Taiwan
      518,    // India
      872,    // Pakistan
      102083, // India-Pakistan
      101258, // Turkey
      1289,   // Nuclear
      102305, // US-Iran
      102304, // Khamenei
      464,    // Military Actions
      102486  // Ukraine Map
    ]
  },
  {
    id: 'culture',
    name: '文化娱乐',
    description: '颁奖典礼、电影、音乐',
    defaultExcluded: false,
    tagIds: [
      596,    // Culture
      18,     // Awards
      53,     // Movies
      1000,   // Oscars
      101534, // Golden Globes
      924,    // Grammys
      101297, // GRAMMY
      100,    // Music
      286,    // Celebrities
      595,    // Taylor Swift
      145,    // MrBeast
      51,     // Box Office
      102196, // Kpop
      102933, // K-pop
      102195  // BLACKPINK
    ]
  },
  {
    id: 'business',
    name: '商业',
    description: '企业、商业决策',
    defaultExcluded: false,
    tagIds: [
      107,    // Business
      100039, // Business News
      102252, // Startup
      102419, // Global
      102940, // Industry
      102941  // Time
    ]
  },
  {
    id: 'science',
    name: '科学',
    description: '科学研究、太空探索',
    defaultExcluded: false,
    tagIds: [
      74,     // Science
      1325,   // Space
      63,     // SpaceX
      425,    // NASA
      101568  // MH370
    ]
  },
  {
    id: 'other',
    name: '其他',
    description: '其他类别',
    defaultExcluded: false,
    tagIds: [
      102204, // Other
      100418, // Derivatives
      93      // Prediction Markets
    ]
  }
];

// 获取所有默认排除的 tag IDs
export function getDefaultExcludedTagIds(): number[] {
  return TAG_CATEGORIES
    .filter(cat => cat.defaultExcluded)
    .flatMap(cat => cat.tagIds);
}

// 根据用户选择的分类获取要排除的 tag IDs
export function getExcludedTagIdsByCategories(excludedCategoryIds: string[]): number[] {
  return TAG_CATEGORIES
    .filter(cat => excludedCategoryIds.includes(cat.id))
    .flatMap(cat => cat.tagIds);
}

// 获取所有分类的简要信息（用于 UI 显示）
export function getCategorySummary() {
  return TAG_CATEGORIES.map(cat => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    defaultExcluded: cat.defaultExcluded,
    tagCount: cat.tagIds.length
  }));
}
