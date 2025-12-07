import { type Got } from 'got';
import { createHttpClient } from '@/utils/httpClient';

export interface GammaClientOptions {
  baseURL?: string;
  timeout?: number;
  debug?: boolean;
}

export interface SearchMarketsEventsAndProfilesParams {
  q: string;
  cache?: boolean;
  eventsStatus?: string;
  limitPerType?: number;
  page?: number;
  eventsTag?: string;
  keepClosedMarkets?: boolean;
  sort?: string;
  ascending?: boolean;
  searchTags?: boolean;
  searchProfiles?: boolean;
  recurrence?: string;
  excludeTagId?: string | number;
  optimized?: boolean;
}

export interface ListTeamsParams {
  limit?: number;
  offset?: number;
  order?: string;
  ascending?: boolean;
  league?: string;
  name?: string;
  abbreviation?: string;
}

export interface MarketQueryParams {
  limit?: number;
  offset?: number;
  order?: string;
  ascending?: boolean;
  id?: number;
  slug?: string;
  archived?: boolean;
  active?: boolean;
  closed?: boolean;
  clob_token_ids?: string;
  condition_ids?: string;
  liquidity_num_min?: number;
  liquidity_num_max?: number;
  volume_num_min?: number;
  volume_num_max?: number;
  start_date_min?: string;
  start_date_max?: string;
  end_date_min?: string;
  end_date_max?: string;
  tag_id?: number;
  related_tags?: boolean;
}

export interface EventQueryParams extends MarketQueryParams {
  tag_slug?: string;
}

/**
 * Gamma API 客户端封装
 * 专门处理市场数据和事件查询
 */
export class PolymarketGammaClient {
  private readonly client: Got;
  private readonly baseURL: string;

  constructor(options: GammaClientOptions = {}) {
    this.baseURL = options.baseURL ?? 'https://gamma-api.polymarket.com';
    this.client = createHttpClient({
      baseURL: this.baseURL,
      timeout: options.timeout
    });
  }

  async healthCheck(): Promise<any> {
    const response = await this.client.get('status', { responseType: 'text' });
    try {
      return JSON.parse(response.body);
    } catch {
      return response.body;
    }
  }

  async listEvents(params?: EventQueryParams): Promise<any> {
    const searchParams = params ? this.buildSearchParams(params as unknown as Record<string, unknown>) : undefined;
    return (await this.client.get('events', { ...(searchParams ? { searchParams } : {}), responseType: 'json' })).body;
  }

  async getEventById(id: string | number): Promise<any> {
    return (await this.client.get(`events/${id}`, { responseType: 'json' })).body;
  }

  async getEventTags(eventId: string | number): Promise<any> {
    return (await this.client.get(`events/${eventId}/tags`, { responseType: 'json' })).body;
  }

  async getEventBySlug(slug: string): Promise<any> {
    return (await this.client.get(`events/slug/${slug}`, { responseType: 'json' })).body;
  }

  async listMarkets(params?: MarketQueryParams): Promise<any> {
    const searchParams = params ? this.buildSearchParams(params as unknown as Record<string, unknown>) : undefined;
    return (await this.client.get('markets', { ...(searchParams ? { searchParams } : {}), responseType: 'json' })).body;
  }

  async getMarketById(id: string | number): Promise<any> {
    return (await this.client.get(`markets/${id}`, { responseType: 'json' })).body;
  }

  async getMarketTagsById(id: string | number): Promise<any> {
    return (await this.client.get(`markets/${id}/tags`, { responseType: 'json' })).body;
  }

  async getMarketBySlug(slug: string): Promise<any> {
    return (await this.client.get(`markets/slug/${slug}`, { responseType: 'json' })).body;
  }

  async getMarketStats(marketId: string | number): Promise<any> {
    return (await this.client.get(`markets/${marketId}/stats`, { responseType: 'json' })).body;
  }

  async searchMarketsEventsAndProfiles(params: SearchMarketsEventsAndProfilesParams): Promise<any> {
    if (!params?.q) throw new Error('q parameter is required for SearchMarketsEventsAndProfiles');

    const searchParams = this.buildSearchParams({
      q: params.q,
      ...(params.cache !== undefined ? { cache: params.cache } : {}),
      ...(params.eventsStatus ? { 'events-status': params.eventsStatus } : {}),
      ...(params.limitPerType !== undefined ? { 'limit-per-type': params.limitPerType } : {}),
      ...(params.page !== undefined ? { page: params.page } : {}),
      ...(params.eventsTag ? { 'events-tag': params.eventsTag } : {}),
      ...(params.keepClosedMarkets !== undefined ? { 'keep-closed-markets': params.keepClosedMarkets } : {}),
      ...(params.sort ? { sort: params.sort } : {}),
      ...(params.ascending !== undefined ? { ascending: params.ascending } : {}),
      ...(params.searchTags !== undefined ? { 'search-tags': params.searchTags } : {}),
      ...(params.searchProfiles !== undefined ? { 'search-profiles': params.searchProfiles } : {}),
      ...(params.recurrence ? { recurrence: params.recurrence } : {}),
      ...(params.excludeTagId !== undefined ? { 'exclude-tag-id': params.excludeTagId } : {}),
      ...(params.optimized !== undefined ? { optimized: params.optimized } : {})
    });

    return (await this.client.get('public-search', { ...(searchParams ? { searchParams } : {}), responseType: 'json' })).body;
  }

  async listTeams(params?: ListTeamsParams): Promise<any> {
    const searchParams = params ? this.buildSearchParams(params as unknown as Record<string, unknown>) : undefined;
    return (await this.client.get('teams', { ...(searchParams ? { searchParams } : {}), responseType: 'json' })).body;
  }

  async getSportsMetadataInformation(): Promise<any> {
    return (await this.client.get('sports', { responseType: 'json' })).body;
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
