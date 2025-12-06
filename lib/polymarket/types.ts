// 纯类型定义文件，不依赖任何实现代码

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
}

export interface EventQueryParams {
  limit?: number;
  offset?: number;
  order?: string;
  ascending?: boolean;
  id?: string;
  slug?: string;
  archived?: boolean;
  active?: boolean;
  closed?: boolean;
  end_date_min?: string;
  end_date_max?: string;
}
