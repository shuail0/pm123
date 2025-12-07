'use client';

import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { useCountdownStore, type CountdownMarket, type CountdownEvent } from '@/lib/store/countdown';
import { CATEGORY_CONFIG } from '@/lib/constants/categories';
import { formatCurrency, formatTimeUntil, formatDateTime } from '@/lib/utils/format';
import { SortButton } from './SortButton';
import { MarketIcon } from './MarketIcon';
import { PriceBar } from './PriceBar';

export function EventTable() {
  const { filteredMarkets, markets, expandedEvents, toggleEventExpand, loading, currentPage, pageSize, setCurrentPage, setPageSize } = useCountdownStore();

  const totalPages = Math.ceil(filteredMarkets.length / pageSize);
  const paginatedMarkets = filteredMarkets.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col">
      <div className="overflow-hidden flex-1">
        <div className="grid grid-cols-[48px,2fr,1fr,1fr,1fr,140px,1.2fr] gap-4 px-4 py-2.5 bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-600 tracking-wide">
          <div></div>
          <div><SortButton field="market" label="事件" /></div>
          <div className="text-right"><SortButton field="volume24hr" label="24h成交量" /></div>
          <div className="text-right"><SortButton field="volume" label="总成交量" /></div>
          <div className="text-right"><SortButton field="liquidity" label="流动性" /></div>
          <div className="text-center"><SortButton field="ends" label="结束时间(UTC)" /></div>
          <div className="text-left">标签</div>
        </div>

        <div className="divide-y divide-gray-100 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
          {loading && markets.length === 0 && (
            <div className="px-4 py-16 flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-3 border-polyBlue border-t-transparent rounded-full animate-spin"></div>
              <div className="text-gray-500 text-sm">加载中...</div>
            </div>
          )}

          {!loading && filteredMarkets.length === 0 && (
            <div className="px-4 py-16 text-center text-gray-400 text-sm">未找到符合条件的市场</div>
          )}

          {paginatedMarkets.map(event => (
            <EventRow key={event.id} event={event} isExpanded={expandedEvents.has(event.id)} onToggle={() => toggleEventExpand(event.id)} />
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">每页显示</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-polyBlue"
            >
              {[10, 20, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
            </select>
            <span className="text-sm text-gray-600">共 {filteredMarkets.length} 条</span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">首页</button>
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">上一页</button>
            <span className="px-4 py-1.5 text-sm text-gray-700">第 {currentPage} / {totalPages} 页</span>
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">下一页</button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">末页</button>
          </div>
        </div>
      )}
    </div>
  );
}

function EventRow({ event, isExpanded, onToggle }: { event: CountdownEvent; isExpanded: boolean; onToggle: () => void }) {
  const hasMarkets = event.markets?.length > 0;

  return (
    <div className="hover:bg-gray-50/50 transition-colors">
      <div className="grid grid-cols-[48px,2fr,1fr,1fr,1fr,140px,1.2fr] gap-4 px-4 py-3 items-center">
        <div>
          <button onClick={onToggle} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors">
            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />}
          </button>
        </div>

        <div className="flex items-center gap-3 min-w-0">
          <MarketIcon title={event.title} image={event.markets[0]?.image} />
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2">
              <a href={`https://polymarket.com/event/${event.slug}`} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-900 hover:text-blue-600 inline-flex items-center gap-1.5 group transition-colors">
                <span className="truncate">{event.title}</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </a>
              {event.negRisk && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium flex-shrink-0">NegRisk</span>}
            </div>
            {event.category && <div className="text-xs text-gray-500 mt-0.5">{CATEGORY_CONFIG[event.category] || event.category}</div>}
          </div>
        </div>

        <div className="text-right">{event.volume24hr ? <div className="text-sm font-semibold text-gray-900">{formatCurrency(event.volume24hr)}</div> : <div className="text-sm text-gray-400">-</div>}</div>
        <div className="text-right text-sm font-semibold text-gray-900">{formatCurrency(event.volume || 0)}</div>
        <div className="text-right text-sm font-semibold text-gray-900">{formatCurrency(event.liquidity || 0)}</div>

        <div className="text-center space-y-1">
          <div className="text-sm font-medium text-gray-900">{event.deadline ? formatDateTime(event.deadline) : '-'}</div>
          {event.hoursUntil !== undefined && <div className="text-xs text-gray-500">{formatTimeUntil(event.hoursUntil)}</div>}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {event.tagLabels && event.tagLabels.length > 0 ? (
            <>
              {event.tagLabels.slice(0, 3).map((tag: string, idx: number) => (
                <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">{tag}</span>
              ))}
              {event.tagLabels.length > 3 && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">+{event.tagLabels.length - 3}</span>}
            </>
          ) : (
            <span className="text-xs text-gray-400">-</span>
          )}
        </div>
      </div>

      {hasMarkets && isExpanded && event.markets.map((market: CountdownMarket, idx: number) => (
        <MarketRow key={`${event.id}-${market.id}-${idx}`} market={market} event={event} />
      ))}
    </div>
  );
}

function MarketRow({ market, event }: { market: CountdownMarket; event: CountdownEvent }) {
  const yesPrice = market.bestAsk ?? null;
  const noPrice = market.bestBid !== undefined ? 1 - market.bestBid : null;

  return (
    <div className="grid grid-cols-[48px,2fr,1fr,1fr,1fr,140px,1.2fr] gap-4 px-4 py-2.5 items-center bg-gray-50/30 border-l-2 border-blue-400 ml-12">
      <div></div>

      <div className="flex items-center gap-3 min-w-0 pl-2">
        <MarketIcon title={market.groupItemTitle || market.question} image={market.image} />
        <div className="flex-1 min-w-0">
          <a href={`https://polymarket.com/event/${event.slug}?outcome=${market.id}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-700 hover:text-blue-600 inline-flex items-center gap-1.5 group transition-colors">
            <span className="truncate">{market.groupItemTitle || market.question}</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </a>
          {yesPrice !== null && noPrice !== null && <PriceBar yesPrice={yesPrice} noPrice={noPrice} />}
        </div>
      </div>

      <div className="text-right">{market.volume24hr ? <div className="text-sm text-gray-700">{formatCurrency(parseFloat(String(market.volume24hr)))}</div> : <div className="text-sm text-gray-400">-</div>}</div>
      <div className="text-right text-sm text-gray-700">{formatCurrency(parseFloat(String(market.volume || '0')))}</div>
      <div className="text-right text-sm text-gray-700">{formatCurrency(parseFloat(String(market.liquidity || '0')))}</div>
      <div className="text-center text-sm text-gray-700">{event.deadline ? formatDateTime(event.deadline) : '-'}</div>
      <div></div>
    </div>
  );
}
