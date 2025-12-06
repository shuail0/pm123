import { create } from 'zustand';
import { getExcludedTagIdsByCategories } from '@/lib/constants/tags';

export type UrgencyLevel = 'critical' | 'urgent' | 'soon' | 'normal';

export interface PriceHistory {
  price: number;
  timestamp: number;
}

export interface CountdownMarket {
  id: string;
  condition_id: string;
  question: string;
  groupItemTitle?: string;
  description?: string;
  category?: string;
  image?: string;
  liquidity?: string | number;
  liquidityNum?: number;
  volume?: string | number;
  volumeNum?: number;
  volume24hr?: string | number;
  outcomePrices?: string;
  lastTradePrice?: string;
  endDate?: string;
  endDateIso?: string;
  gameStartTime?: string;
  active?: boolean;
  closed?: boolean;
  archived?: boolean;
  tags?: string[];
  tagIds?: number[];
  eventId?: string;
  eventTitle?: string;
  eventSlug?: string;
  _deadline?: Date;
  _urgency?: UrgencyLevel;
  _hoursUntil?: number;
  _isEvent?: boolean;
  _childMarkets?: CountdownMarket[];
}

export type SortField = 'market' | 'liquidity' | 'volume' | 'volume24hr' | 'ends' | 'urgency';
export type SortDirection = 'asc' | 'desc';

export interface FilterOptions {
  status: 'all' | 'active' | 'closed';
  timePeriod: '30min' | '1h' | '2h' | '6h' | '12h' | '24h' | '3d' | '7d' | 'all';
  categories: string[];
  tags: string[];
  excludedTagCategories: string[]; // 排除的分类 ID
  searchQuery?: string;
  minLiquidity?: number;
  sortField: SortField;
  sortDirection: SortDirection;
}

interface CountdownStore {
  markets: CountdownMarket[];
  filteredMarkets: CountdownMarket[];
  favorites: Set<string>;
  expandedEvents: Set<string>;
  priceHistory: Record<string, PriceHistory[]>;
  marketHistory: any[];
  filter: FilterOptions;
  loading: boolean;
  error: string | null;
  lastUpdate: number | null;
  currentTime: number;
  currentPage: number;
  pageSize: number;

  setMarkets: (markets: CountdownMarket[]) => void;
  setFilteredMarkets: (markets: CountdownMarket[]) => void;
  toggleFavorite: (marketId: string) => void;
  toggleEventExpand: (eventId: string) => void;
  setFilter: (filter: Partial<FilterOptions>) => void;
  setSorting: (field: SortField, direction?: SortDirection) => void;
  updatePriceHistory: (marketId: string, price: number) => void;
  addMarketHistory: (market: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastUpdate: (timestamp: number) => void;
  setCurrentTime: (time: number) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  applyFilters: () => void;
  loadFromLocalStorage: () => void;
  saveToLocalStorage: () => void;
}

export const useCountdownStore = create<CountdownStore>()((set, get) => ({
  markets: [],
  filteredMarkets: [],
  favorites: new Set<string>(),
  priceHistory: {},
  marketHistory: [],
  filter: {
    status: 'active',
    timePeriod: 'all',
    categories: [],
    tags: [],
    excludedTagCategories: ['sports', 'esports', 'crypto_prices', 'stocks', 'weather', 'short_term', 'social_media'],
    searchQuery: '',
    minLiquidity: 1000,
    sortField: 'urgency',
    sortDirection: 'asc',
  },
  expandedEvents: new Set<string>(),
  loading: false,
  error: null,
  lastUpdate: null,
  currentTime: Date.now(),
  currentPage: 1,
  pageSize: 20,

  setMarkets: (markets) => {
    set({ markets });
    get().applyFilters();
  },

  setFilteredMarkets: (filteredMarkets) => set({ filteredMarkets }),

  toggleFavorite: (marketId) => {
    const favorites = new Set(get().favorites);
    if (favorites.has(marketId)) {
      favorites.delete(marketId);
    } else {
      favorites.add(marketId);
    }
    set({ favorites });
    get().saveToLocalStorage();
    get().applyFilters();
  },

  toggleEventExpand: (eventId) => {
    const expandedEvents = new Set(get().expandedEvents);
    if (expandedEvents.has(eventId)) {
      expandedEvents.delete(eventId);
    } else {
      expandedEvents.add(eventId);
    }
    set({ expandedEvents });
  },

  setFilter: (newFilter) => {
    set({ filter: { ...get().filter, ...newFilter } });
    get().applyFilters();
  },

  setSorting: (field, direction) => {
    const currentFilter = get().filter;
    const newDirection = direction || (currentFilter.sortField === field && currentFilter.sortDirection === 'asc' ? 'desc' : 'asc');
    set({ filter: { ...currentFilter, sortField: field, sortDirection: newDirection } });
    get().applyFilters();
  },

  updatePriceHistory: (marketId, price) => {
    const priceHistory = { ...get().priceHistory };
    if (!priceHistory[marketId]) {
      priceHistory[marketId] = [];
    }

    const history = priceHistory[marketId];
    const lastEntry = history[history.length - 1];

    if (!lastEntry || Math.abs(lastEntry.price - price) > 0.001) {
      history.push({ price, timestamp: Date.now() });
      if (history.length > 100) history.shift();
      set({ priceHistory });
      get().saveToLocalStorage();
    }
  },

  addMarketHistory: (market) => {
    const marketHistory = [...get().marketHistory];
    marketHistory.unshift(market);
    if (marketHistory.length > 50) marketHistory.pop();
    set({ marketHistory });
    get().saveToLocalStorage();
  },

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setLastUpdate: (timestamp) => set({ lastUpdate: timestamp }),

  setCurrentTime: (time) => set({ currentTime: time }),

  setCurrentPage: (page) => set({ currentPage: page }),

  setPageSize: (size) => set({ pageSize: size, currentPage: 1 }),

  applyFilters: () => {
    const { markets, filter } = get();
    let filtered = [...markets];

    // 标签分类排除过滤（在本地过滤）
    if (filter.excludedTagCategories.length > 0) {
      const excludedTagIds = new Set(getExcludedTagIdsByCategories(filter.excludedTagCategories));

      filtered = filtered.filter(m => {
        // 如果市场没有标签，保留
        if (!m.tagIds || m.tagIds.length === 0) return true;

        // 检查市场是否有任何标签在排除列表中
        // 只要有一个标签在排除列表中，就排除这个市场
        const hasExcludedTag = m.tagIds.some((tagId: number) => excludedTagIds.has(tagId));

        return !hasExcludedTag;
      });
    }

    // 搜索过滤
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.question?.toLowerCase().includes(query) ||
        m.eventTitle?.toLowerCase().includes(query) ||
        m.category?.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query)
      );
    }

    // 状态过滤
    if (filter.status !== 'all') {
      filtered = filtered.filter(m =>
        filter.status === 'active' ? m.active !== false : m.closed === true
      );
    }

    // 时间周期过滤
    if (filter.timePeriod !== 'all') {
      const hourMap = { '30min': 0.5, '1h': 1, '2h': 2, '6h': 6, '12h': 12, '24h': 24, '3d': 72, '7d': 168 };
      const maxHours = hourMap[filter.timePeriod as keyof typeof hourMap];
      filtered = filtered.filter(m => m._hoursUntil && m._hoursUntil <= maxHours);
    }

    // 类别过滤
    if (filter.categories.length > 0) {
      filtered = filtered.filter(m => m.category && filter.categories.includes(m.category));
    }

    // 标签过滤
    if (filter.tags.length > 0) {
      filtered = filtered.filter(m =>
        m.tags?.some(tag => filter.tags.includes(tag))
      );
    }

    // 流动性过滤
    if (filter.minLiquidity) {
      filtered = filtered.filter(m => {
        const liquidity = parseFloat(String(m.liquidity || m.liquidityNum || '0'));
        return liquidity >= filter.minLiquidity!;
      });
    }

    // 排序
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (filter.sortField) {
        case 'market':
          aVal = a.eventTitle || a.question;
          bVal = b.eventTitle || b.question;
          break;
        case 'liquidity':
          aVal = parseFloat(String(a.liquidity || a.liquidityNum || '0'));
          bVal = parseFloat(String(b.liquidity || b.liquidityNum || '0'));
          break;
        case 'volume':
          aVal = parseFloat(String(a.volume || a.volumeNum || '0'));
          bVal = parseFloat(String(b.volume || b.volumeNum || '0'));
          break;
        case 'volume24hr':
          aVal = parseFloat(String(a.volume24hr || '0'));
          bVal = parseFloat(String(b.volume24hr || '0'));
          break;
        case 'ends':
          aVal = a._deadline?.getTime() || 0;
          bVal = b._deadline?.getTime() || 0;
          break;
        case 'urgency':
          const urgencyMap = { critical: 0, urgent: 1, soon: 2, normal: 3 };
          aVal = urgencyMap[a._urgency || 'normal'];
          bVal = urgencyMap[b._urgency || 'normal'];
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string') {
        return filter.sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return filter.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    set({ filteredMarkets: filtered });
  },

  loadFromLocalStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const favs = localStorage.getItem('pm123_countdown_favorites');
      const prices = localStorage.getItem('pm123_countdown_price_history');
      const history = localStorage.getItem('pm123_countdown_market_history');

      if (favs) set({ favorites: new Set(JSON.parse(favs)) });
      if (prices) set({ priceHistory: JSON.parse(prices) });
      if (history) set({ marketHistory: JSON.parse(history) });
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
  },

  saveToLocalStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const { favorites, priceHistory, marketHistory } = get();
      localStorage.setItem('pm123_countdown_favorites', JSON.stringify([...favorites]));
      localStorage.setItem('pm123_countdown_price_history', JSON.stringify(priceHistory));
      localStorage.setItem('pm123_countdown_market_history', JSON.stringify(marketHistory));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  },
}));
