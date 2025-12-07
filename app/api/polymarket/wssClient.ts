import { EventEmitter } from 'events';
import WebSocket from 'ws';


export type WssChannelType = 'market' | 'user';

export interface WssAuth {
  apiKey: string;
  secret: string;
  passphrase: string;
}

export interface WssClientConfig {
  baseUrl?: string;
  pingInterval?: number;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  debug?: boolean;
  
}

export interface OrderBookLevel {
  price: string;
  size: string;
}

export interface OrderBookSnapshot {
  asset_id: string;
  market: string;
  timestamp: number;
  hash: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

export interface OrderBookDelta {
  asset_id: string;
  market: string;
  timestamp: number;
  hash: string;
  bids?: OrderBookLevel[];
  asks?: OrderBookLevel[];
}

export interface PriceChangeEvent {
  asset_id: string;
  market: string;
  price: string;
  timestamp: number;
}

export interface LastTradePrice {
  asset_id: string;
  market: string;
  price: string;
  timestamp: number;
}

export interface OrderUpdate {
  id: string;                    // 订单 ID（主键）
  market: string;
  asset_id: string;
  event_type: 'order';
  type: 'PLACEMENT' | 'UPDATE' | 'CANCELLATION';  // 订单事件类型
  side: 'BUY' | 'SELL';
  price: string;
  size: string;                  // 当前剩余数量
  size_matched?: string;         // 已成交数量
  original_size: string;         // 原始数量
  timestamp: number;
}

export interface TradeNotification {
  id: string;                    // Trade ID
  event_type: 'trade';
  market: string;
  asset_id: string;
  taker_order_id: string;        // Taker 订单 ID（关键字段）
  side: 'BUY' | 'SELL';
  price: string;
  size: string;                  // 成交数量
  fee_rate_bps: string;
  status: 'MATCHED' | 'MINED' | 'CONFIRMED' | 'RETRYING' | 'FAILED';  // 成交状态
  timestamp: number;
  trade_id?: string;
  maker_orders?: Array<{         // Maker 订单详情
    asset_id: string;
    matched_amount: string;
    order_id: string;
    outcome: string;
    owner: string;
    price: string;
  }>;
}

export type MarketMessage =
  | { type: 'book'; data: OrderBookSnapshot }
  | { type: 'delta'; data: OrderBookDelta }
  | { type: 'price_change'; data: PriceChangeEvent }
  | { type: 'last_trade_price'; data: LastTradePrice };

export type UserMessage =
  | { type: 'order'; data: OrderUpdate }
  | { type: 'trade'; data: TradeNotification };

export class PolymarketWssConnection extends EventEmitter {
  private ws: WebSocket | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private isIntentionalClose = false;
  private isConnected = false;

  constructor(
    private readonly channel: WssChannelType,
    private readonly wsUrl: string,
    private readonly subscribePayload: Record<string, any>,
    private readonly config: Required<WssClientConfig>
  ) {
    super();
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    this.isIntentionalClose = false;

    return new Promise((resolve, reject) => {
      const url = `${this.wsUrl}/ws/${this.channel}`;
      this.log('连接中...', { url });

      this.ws = new WebSocket(url);

      const onOpen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.log('连接成功');
        this.emit('connected');
        this.subscribe();
        this.startPing();
        cleanup();
        resolve();
      };

      const onError = (error: Error) => {
        this.log('连接错误', { error: error.message });
        this.emit('error', error);
        cleanup();
        reject(error);
      };

      const cleanup = () => {
        this.ws?.off('open', onOpen);
        this.ws?.off('error', onError);
      };

      this.ws.on('open', onOpen);
      this.ws.on('error', onError);
      this.ws.on('message', (data) => this.handleMessage(data));
      this.ws.on('close', (code, reason) => this.handleClose(code, reason));
    });
  }

  disconnect(): void {
    this.isIntentionalClose = true;
    this.stopPing();
    this.stopReconnect();
    if (this.ws) {
      this.isConnected = false;
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
      this.log('已断开连接');
    }
  }

  send(data: any): void {
    if (!this.ws || !this.isConnected) return;
    this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
  }

  private subscribe(): void {
    const msg = { ...this.subscribePayload, type: this.channel };
    this.log('发送订阅消息', msg);
    this.send(msg);
  }

  private handleMessage(raw: WebSocket.RawData): void {
    const text = Buffer.isBuffer(raw) ? raw.toString() : String(raw);
    if (text === 'PING') { this.send('PONG'); return; }
    if (text === 'PONG') { this.emit('pong'); return; }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      this.log('收到非JSON消息', { text: text.substring(0, 200) });
      return;
    }

    this.log('收到消息', { type: data.event_type || data.type, data: JSON.stringify(data).substring(0, 300) });
    this.emit('message', { channel: this.channel, data, raw: text });

    if (this.channel === 'market') this.handleMarketMessage(data);
    else if (this.channel === 'user') this.handleUserMessage(data);
  }

  private handleMarketMessage(data: any): void {
    // Market频道的消息是数组格式
    const messages = Array.isArray(data) ? data : [data];

    for (const msg of messages) {
      const eventType = msg.event_type;
      if (eventType === 'book') {
        this.emit('book', msg);
      } else if (eventType === 'price_change') {
        this.emit('price_change', msg);
      } else if (eventType === 'last_trade_price') {
        this.emit('last_trade_price', msg);
      } else {
        this.emit('unknown', msg);
      }
    }
  }

  private handleUserMessage(data: any): void {
    // User频道只有两种事件类型：order 和 trade
    const eventType = data.event_type;

    if (eventType === 'order') {
      this.emit('order', data);
    } else if (eventType === 'trade') {
      this.emit('trade', data);
    } else {
      // 未知事件类型（实际不应该出现）
      this.log('收到未知用户事件', { eventType, data: JSON.stringify(data).substring(0, 200) });
    }
  }

  private handleClose(code: number, reason: Buffer): void {
    this.isConnected = false;
    this.stopPing();
    const reasonStr = reason.toString() || 'Unknown';
    this.emit('disconnected', { code, reason: reasonStr });

    if (!this.isIntentionalClose && this.config.maxReconnectAttempts > 0) {
      this.tryReconnect();
    }
  }

  private tryReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.emit('reconnect_failed', { attempts: this.reconnectAttempts });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.config.reconnectDelay * this.reconnectAttempts;
    this.emit('reconnecting', { attempt: this.reconnectAttempts, delay });

    this.reconnectTimer = setTimeout(() => {
      if (!this.isIntentionalClose) {
        this.connect().catch((error) => this.emit('reconnect_error', error));
      }
    }, delay);
  }

  private startPing(): void {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      if (this.isConnected) this.send('PING');
    }, this.config.pingInterval);
  }

  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private log(_message: string, _meta?: any): void {
    // 日志已禁用，可通过监听 'log' 事件获取日志
  }

  getStatus(): { connected: boolean; attempts: number } {
    return { connected: this.isConnected, attempts: this.reconnectAttempts };
  }
}

export class PolymarketWssClient {
  private readonly config: Required<WssClientConfig>;

  constructor(config: WssClientConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'wss://ws-subscriptions-clob.polymarket.com',
      pingInterval: config.pingInterval || 10000,
      reconnectDelay: config.reconnectDelay || 5000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      debug: config.debug || false
    };
  }

  createMarketConnection(assetIds: string[]): PolymarketWssConnection {
    if (!assetIds?.length) throw new Error('assetIds 不能为空');
    return new PolymarketWssConnection('market', this.config.baseUrl, { assets_ids: assetIds }, this.config);
  }

  createUserConnection(auth: WssAuth, markets?: string[]): PolymarketWssConnection {
    if (!auth?.apiKey || !auth.secret || !auth.passphrase) {
      throw new Error('auth 必须包含 apiKey, secret, passphrase');
    }

    const payload: any = {
      auth: { apiKey: auth.apiKey, secret: auth.secret, passphrase: auth.passphrase }
    };

    return new PolymarketWssConnection('user', this.config.baseUrl, payload, this.config);
  }
}
