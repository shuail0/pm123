export interface GammaClientOptions {
  baseURL?: string;
  timeout?: number;
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

export class PolymarketGammaClient {
  private readonly baseURL: string;
  private readonly timeout: number;

  constructor(options: GammaClientOptions = {}) {
    this.baseURL = options.baseURL ?? 'https://gamma-api.polymarket.com';
    this.timeout = options.timeout ?? 30000;
  }

  private async request(path: string, params?: Record<string, unknown>): Promise<any> {
    const url = new URL(path, this.baseURL);
    if (params) {
      const searchParams = this.buildSearchParams(params);
      if (searchParams) url.search = searchParams.toString();
    }
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(this.timeout),
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async listEvents(params?: EventQueryParams): Promise<any> {
    return this.request('events', params as Record<string, unknown>);
  }

  async getEventById(id: string | number): Promise<any> {
    return this.request(`events/${id}`);
  }

  async listMarkets(params?: MarketQueryParams): Promise<any> {
    return this.request('markets', params as Record<string, unknown>);
  }

  async getMarketById(id: string | number): Promise<any> {
    return this.request(`markets/${id}`);
  }

  async getEventTags(eventId: string | number): Promise<any> {
    return this.request(`events/${eventId}/tags`);
  }

  async getEventBySlug(slug: string): Promise<any> {
    return this.request(`events/slug/${slug}`);
  }

  async getMarketTagsById(id: string | number): Promise<any> {
    return this.request(`markets/${id}/tags`);
  }

  async getMarketBySlug(slug: string): Promise<any> {
    return this.request(`markets/slug/${slug}`);
  }

  async getMarketStats(marketId: string | number): Promise<any> {
    return this.request(`markets/${marketId}/stats`);
  }

  async searchMarketsEventsAndProfiles(params: SearchMarketsEventsAndProfilesParams): Promise<any> {
    if (!params?.q) throw new Error('q parameter is required for SearchMarketsEventsAndProfiles');
    return this.request('public-search', {
      q: params.q,
      ...(params.cache !== undefined && { cache: params.cache }),
      ...(params.eventsStatus && { 'events-status': params.eventsStatus }),
      ...(params.limitPerType !== undefined && { 'limit-per-type': params.limitPerType }),
      ...(params.page !== undefined && { page: params.page }),
      ...(params.eventsTag && { 'events-tag': params.eventsTag }),
      ...(params.keepClosedMarkets !== undefined && { 'keep-closed-markets': params.keepClosedMarkets }),
      ...(params.sort && { sort: params.sort }),
      ...(params.ascending !== undefined && { ascending: params.ascending }),
      ...(params.searchTags !== undefined && { 'search-tags': params.searchTags }),
      ...(params.searchProfiles !== undefined && { 'search-profiles': params.searchProfiles }),
      ...(params.recurrence && { recurrence: params.recurrence }),
      ...(params.excludeTagId !== undefined && { 'exclude-tag-id': params.excludeTagId }),
      ...(params.optimized !== undefined && { optimized: params.optimized })
    });
  }

  async listTeams(params?: ListTeamsParams): Promise<any> {
    return this.request('teams', params as Record<string, unknown>);
  }

  async getSportsMetadataInformation(): Promise<any> {
    return this.request('sports');
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
