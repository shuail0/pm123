import { create } from 'zustand';
import { TIME_RANGES, type TimeRangeKey } from '@/lib/utils/timeRanges';

export type UrgencyLevel = 'critical' | 'urgent' | 'soon' | 'normal';

export interface PriceHistory {
  price: number;
  timestamp: number;
}

export interface CountdownMarket {
  id: string;
  condition_id?: string;
  question: string;
  groupItemTitle?: string;
  description?: string;
  image?: string;
  liquidity?: string | number;
  volume?: string | number;
  volume24hr?: string | number;
  outcomePrices?: string;
  lastTradePrice?: string | number;
  bestBid?: number;
  bestAsk?: number;
  active?: boolean;
  closed?: boolean;
  negRisk?: boolean;
}

export interface CountdownEvent {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags?: any[];
  tagLabels?: string[];
  tagIds?: number[];
  deadline: string;
  hoursUntil: number;
  urgency: string;
  negRisk?: boolean;
  markets: CountdownMarket[];
  marketCount: number;
  volume?: number;
  liquidity?: number;
  volume24hr?: number;
}

export type SortField = 'market' | 'liquidity' | 'volume' | 'volume24hr' | 'ends' | 'urgency';
export type SortDirection = 'asc' | 'desc';

export interface FilterOptions {
  status: 'all' | 'active' | 'closed';
  timePeriod: TimeRangeKey | 'all';
  negRiskFilter: 'all' | 'neg_risk' | 'non_neg_risk';
  selectedCategories: string[];
  tags: string[];
  searchQuery?: string;
  minLiquidity?: number;
  minVolume24hr?: number;
  maxVolume24hr?: number;
  minVolume?: number;
  maxVolume?: number;
  sortField: SortField;
  sortDirection: SortDirection;
}

interface CountdownStore {
  markets: CountdownEvent[];
  filteredMarkets: CountdownEvent[];
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

  setMarkets: (markets: CountdownEvent[]) => void;
  setFilteredMarkets: (markets: CountdownEvent[]) => void;
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
    negRiskFilter: 'all',
    selectedCategories: [],
    tags: [],
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

    if (filter.negRiskFilter === 'neg_risk') {
      filtered = filtered.filter(e => e.negRisk === true);
    } else if (filter.negRiskFilter === 'non_neg_risk') {
      filtered = filtered.filter(e => !e.negRisk);
    }

    if (filter.selectedCategories.length > 0) {
      filtered = filtered.filter(e => filter.selectedCategories.includes(e.category));
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query) ||
        e.tagLabels?.some(t => t.toLowerCase().includes(query))
      );
    }

    if (filter.timePeriod !== 'all') {
      const maxHours = TIME_RANGES[filter.timePeriod as TimeRangeKey].hours;
      filtered = filtered.filter(e => e.hoursUntil < maxHours);
    }

    if (filter.tags.length > 0) {
      filtered = filtered.filter(e =>
        e.tagLabels?.some(tag => filter.tags.includes(tag))
      );
    }

    if (filter.minLiquidity) {
      filtered = filtered.filter(e => (e.liquidity || 0) >= filter.minLiquidity!);
    }

    if (filter.minVolume24hr !== undefined || filter.maxVolume24hr !== undefined) {
      filtered = filtered.filter(e => {
        const vol24 = e.volume24hr || 0;
        if (filter.minVolume24hr !== undefined && vol24 < filter.minVolume24hr) return false;
        if (filter.maxVolume24hr !== undefined && vol24 > filter.maxVolume24hr) return false;
        return true;
      });
    }

    if (filter.minVolume !== undefined || filter.maxVolume !== undefined) {
      filtered = filtered.filter(e => {
        const vol = e.volume || 0;
        if (filter.minVolume !== undefined && vol < filter.minVolume) return false;
        if (filter.maxVolume !== undefined && vol > filter.maxVolume) return false;
        return true;
      });
    }

    filtered.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (filter.sortField) {
        case 'market':
          aVal = a.title;
          bVal = b.title;
          break;
        case 'liquidity':
          aVal = a.liquidity || 0;
          bVal = b.liquidity || 0;
          break;
        case 'volume':
          aVal = a.volume || 0;
          bVal = b.volume || 0;
          break;
        case 'volume24hr':
          aVal = a.volume24hr || 0;
          bVal = b.volume24hr || 0;
          break;
        case 'ends':
          aVal = new Date(a.deadline).getTime();
          bVal = new Date(b.deadline).getTime();
          break;
        case 'urgency':
          const urgencyMap: Record<string, number> = { critical: 0, urgent: 1, soon: 2, normal: 3 };
          aVal = urgencyMap[a.urgency] ?? 3;
          bVal = urgencyMap[b.urgency] ?? 3;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string') {
        return filter.sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
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
