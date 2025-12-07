import { type Got } from 'got';
import { createHttpClient } from '@/utils/httpClient';

export interface DataClientOptions {
  baseURL?: string;
  timeout?: number;
  debug?: boolean;
  
}

export interface PositionQueryParams {
  user: string;
  sizeThreshold?: number | string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface UserStatsParams {
  user: string;
  startDate?: string;
  endDate?: string;
}

export interface TradeHistoryParams {
  user: string;
  marketId?: string;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * Data API 客户端封装
 * 专门处理用户数据（持仓、交易历史、统计等）
 */
export class PolymarketDataClient {
  private readonly client: Got;
  private readonly baseURL: string;

  constructor(options: DataClientOptions = {}) {
    this.baseURL = options.baseURL ?? 'https://data-api.polymarket.com';
    this.client = createHttpClient({
      baseURL: this.baseURL,
      timeout: options.timeout,
      
    });
  }

  async getPositions(params: PositionQueryParams): Promise<any> {
    const searchParams = this.buildSearchParams(params as unknown as Record<string, unknown>);
    return (await this.client.get('positions', { ...(searchParams ? { searchParams } : {}), responseType: 'json' })).body;
  }

  async getPositionsByMarket(user: string, marketId: string): Promise<any> {
    const searchParams = this.buildSearchParams({ user });
    return (await this.client.get(`positions/${marketId}`, { ...(searchParams ? { searchParams } : {}), responseType: 'json' })).body;
  }

  async getUserStats(params: UserStatsParams): Promise<any> {
    const searchParams = this.buildSearchParams(params as unknown as Record<string, unknown>);
    return (await this.client.get('user-stats', { ...(searchParams ? { searchParams } : {}), responseType: 'json' })).body;
  }

  async getTradeHistory(params: TradeHistoryParams): Promise<any> {
    const searchParams = this.buildSearchParams(params as unknown as Record<string, unknown>);
    return (await this.client.get('trades', { ...(searchParams ? { searchParams } : {}), responseType: 'json' })).body;
  }

  async getUserPnL(user: string, timeframe?: string): Promise<any> {
    const searchParams = this.buildSearchParams(timeframe ? { user, timeframe } : { user });
    return (await this.client.get('pnl', { ...(searchParams ? { searchParams } : {}), responseType: 'json' })).body;
  }

  async getBalanceHistory(user: string, token?: string): Promise<any> {
    const searchParams = this.buildSearchParams(token ? { user, token } : { user });
    return (await this.client.get('balance-history', { ...(searchParams ? { searchParams } : {}), responseType: 'json' })).body;
  }

  async getOrderHistory(user: string, limit?: number, offset?: number): Promise<any> {
    const searchParams = this.buildSearchParams({ user, limit, offset });
    return (await this.client.get('orders', { ...(searchParams ? { searchParams } : {}), responseType: 'json' })).body;
  }

  async getUserActiveMarkets(user: string): Promise<any> {
    const searchParams = this.buildSearchParams({ user });
    return (await this.client.get('active-markets', { ...(searchParams ? { searchParams } : {}), responseType: 'json' })).body;
  }

  async getUserRanking(user: string, timeframe?: string): Promise<any> {
    const searchParams = this.buildSearchParams(timeframe ? { user, timeframe } : { user });
    return (await this.client.get('ranking', { ...(searchParams ? { searchParams } : {}), responseType: 'json' })).body;
  }

  private buildSearchParams(params?: Record<string, unknown>): URLSearchParams | undefined {
    if (!params) return undefined;

    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;

      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item === undefined || item === null) return;
          searchParams.append(key, String(item));
        });
      } else {
        searchParams.set(key, String(value));
      }
    }

    return [...searchParams.keys()].length > 0 ? searchParams : undefined;
  }
}
