'use client';

import { ChevronDown, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { useCountdownStore, type CountdownMarket, type SortField } from '@/lib/store/countdown';
import { useMemo } from 'react';
import Image from 'next/image';

export function MarketTable() {
  const { filteredMarkets, expandedEvents, toggleEventExpand, filter, setSorting, loading, currentPage, pageSize, setCurrentPage, setPageSize } = useCountdownStore();

  // 将市场按事件分组
  const groupedMarkets = useMemo(() => {
    const groups = new Map<string, CountdownMarket[]>();

    filteredMarkets.forEach(market => {
      const key = market.eventId || market.id;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(market);
    });

    // 转换为数组并为每个事件创建一个父级行
    return Array.from(groups.entries()).map(([, markets]) => {
      const firstMarket = markets[0];
      const eventRow: CountdownMarket = {
        ...firstMarket,
        _isEvent: true,
        _childMarkets: markets.length > 1 ? markets : undefined,
        liquidity: markets.reduce((sum, m) => sum + parseFloat(String(m.liquidity || m.liquidityNum || '0')), 0),
        volume: markets.reduce((sum, m) => sum + parseFloat(String(m.volume || m.volumeNum || '0')), 0),
      };
      return eventRow;
    });
  }, [filteredMarkets]);

  // 分页计算
  const totalPages = Math.ceil(groupedMarkets.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMarkets = groupedMarkets.slice(startIndex, endIndex);

  const SortButton = ({ field, label }: { field: SortField; label: string }) => {
    const isActive = filter.sortField === field;
    const Icon = isActive ? (filter.sortDirection === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;

    return (
      <button
        onClick={() => setSorting(field)}
        className={`inline-flex items-center gap-1 hover:text-gray-900 transition-colors ${isActive ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}
      >
        {label}
        <Icon className="w-3.5 h-3.5" />
      </button>
    );
  };

  const TimingBadge = ({ urgency }: { urgency: string }) => {
    const config = {
      critical: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', label: '1小时内' },
      urgent: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', label: '24小时内' },
      soon: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200', label: '本周内' },
      normal: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', label: '更晚' }
    };
    const style = config[urgency as keyof typeof config] || config.normal;

    return (
      <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
        {style.label}
      </span>
    );
  };

  const formatCurrency = (val: number) => {
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}K`;
    return `$${val.toFixed(0)}`;
  };

  // 生成市场图标（使用事件标题首字母）
  const MarketIcon = ({ title, image }: { title: string; image?: string }) => {
    if (image) {
      return (
        <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <Image src={image} alt={title} fill className="object-cover" />
        </div>
      );
    }

    const initials = title
      .split(' ')
      .filter(word => /^[A-Z]/.test(word))
      .slice(0, 2)
      .map(word => word[0])
      .join('');

    const colors = [
      'bg-gradient-to-br from-blue-400 to-blue-600',
      'bg-gradient-to-br from-purple-400 to-purple-600',
      'bg-gradient-to-br from-pink-400 to-pink-600',
      'bg-gradient-to-br from-green-400 to-green-600',
      'bg-gradient-to-br from-orange-400 to-orange-600',
    ];

    const colorIndex = title.charCodeAt(0) % colors.length;

    return (
      <div className={`w-9 h-9 rounded-lg ${colors[colorIndex]} flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <span className="text-white text-sm font-bold">{initials || '?'}</span>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col">
      {/* 表格容器 - 带滚动 */}
      <div className="overflow-hidden flex-1">
      {/* 表头 */}
      <div className="grid grid-cols-[48px,2fr,1fr,1fr,1fr,1fr,140px,1.2fr] gap-4 px-4 py-2.5 bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-600 tracking-wide">
        <div></div>
        <div><SortButton field="market" label="市场" /></div>
        <div className="text-right"><SortButton field="volume24hr" label="24h成交量" /></div>
        <div className="text-right"><SortButton field="volume" label="总成交量" /></div>
        <div className="text-right"><SortButton field="liquidity" label="流动性" /></div>
        <div className="text-center"><SortButton field="ends" label="结束时间(UTC)" /></div>
        <div className="text-center"><SortButton field="urgency" label="时间范围" /></div>
        <div className="text-left">标签</div>
      </div>

      {/* 表体 - 带滚动 */}
      <div className="divide-y divide-gray-100 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
        {loading && (
          <div className="px-4 py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-polyBlue to-blue-400 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '60%' }} />
              </div>
              <div className="text-gray-500 text-sm">正在加载市场数据...</div>
            </div>
          </div>
        )}

        {!loading && groupedMarkets.length === 0 && (
          <div className="px-4 py-16 text-center">
            <div className="text-gray-400 text-sm">未找到符合条件的市场</div>
          </div>
        )}

        {paginatedMarkets.map(market => {
          const isExpanded = expandedEvents.has(market.eventId || market.id);
          const hasChildren = market._childMarkets && market._childMarkets.length >= 1;
          const liquidity = parseFloat(String(market.liquidity || market.liquidityNum || '0'));
          const volume = parseFloat(String(market.volume || market.volumeNum || '0'));

          return (
            <div key={market.eventId || market.id} className="hover:bg-gray-50/50 transition-colors">
              {/* 事件行 */}
              <div className="grid grid-cols-[48px,2fr,1fr,1fr,1fr,1fr,140px,1.2fr] gap-4 px-4 py-3 items-center">
                {/* 展开按钮 */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleEventExpand(market.eventId || market.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {isExpanded ?
                      <ChevronDown className="w-4 h-4 text-gray-600" /> :
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    }
                  </button>
                </div>

                {/* 标题 + 图标 */}
                <div className="flex items-center gap-3 min-w-0">
                  <MarketIcon title={market.eventTitle || market.question} image={market.image} />
                  <div className="flex-1 min-w-0">
                    <a
                      href={`https://polymarket.com/event/${market.eventSlug || market.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-gray-900 hover:text-blue-600 inline-flex items-center gap-1.5 group transition-colors"
                    >
                      <span className="truncate">{market.eventTitle || market.question}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </a>
                    <div className="flex items-center gap-2 mt-0.5">
                      {market.category && (
                        <span className="text-xs text-gray-500">{market.category}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 24h成交量 */}
                <div className="text-right space-y-1">
                  {market.volume24hr ? (
                    <div className="text-sm font-semibold text-gray-900">{formatCurrency(parseFloat(String(market.volume24hr)))}</div>
                  ) : (
                    <div className="text-sm text-gray-400">-</div>
                  )}
                </div>

                {/* 交易量 */}
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{formatCurrency(volume)}</div>
                </div>

                {/* 流动性 */}
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{formatCurrency(liquidity)}</div>
                </div>

                {/* 结束时间 */}
                <div className="text-center space-y-1">
                  <div className="text-sm font-medium text-gray-900">
                    {market._deadline ? new Date(market._deadline).toISOString().slice(0, 16).replace('T', ' ') : '-'}
                  </div>
                  {market._hoursUntil !== undefined && (
                    <div className="text-xs text-gray-500">
                      {market._hoursUntil < 1
                        ? `${Math.round(market._hoursUntil * 60)}分钟后`
                        : market._hoursUntil < 24
                        ? `${market._hoursUntil.toFixed(1)}小时后`
                        : `${Math.round(market._hoursUntil / 24)}天后`
                      }
                    </div>
                  )}
                </div>

                {/* 时间范围 */}
                <div className="flex justify-center">
                  <TimingBadge urgency={market._urgency || 'normal'} />
                </div>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1.5">
                  {market.tags && market.tags.length > 0 ? (
                    <>
                      {market.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                          {tag}
                        </span>
                      ))}
                      {market.tags.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">
                          +{market.tags.length - 3}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </div>
              </div>

              {/* 子市场 */}
              {hasChildren && isExpanded && market._childMarkets!.filter(child => child.closed !== true).map(child => {
                const childLiquidity = parseFloat(String(child.liquidity || child.liquidityNum || '0'));
                const childVolume = parseFloat(String(child.volume || child.volumeNum || '0'));
                const price = child.outcomePrices ? JSON.parse(child.outcomePrices)[0] : null;

                return (
                  <div
                    key={child.id}
                    className="grid grid-cols-[48px,2fr,1fr,1fr,1fr,1fr,140px,1.2fr] gap-4 px-4 py-2.5 items-center bg-gray-50/30 border-l-2 border-blue-400 ml-12"
                  >
                    <div></div>

                    <div className="flex items-center gap-3 min-w-0 pl-2">
                      <MarketIcon title={child.groupItemTitle || child.question} image={child.image} />
                      <div className="flex-1 min-w-0">
                        <a
                          href={`https://polymarket.com/event/${child.eventSlug}?outcome=${child.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-700 hover:text-blue-600 inline-flex items-center gap-1.5 group transition-colors"
                        >
                          <span className="truncate">{child.groupItemTitle || child.question}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </a>
                        {price && (
                          <div className="mt-1.5 flex items-center gap-2 text-xs">
                            <span className="text-gray-600 font-medium w-8">Yes</span>
                            <span className="text-blue-600 font-semibold w-12 text-center">${(parseFloat(price) * 100).toFixed(0)}¢</span>
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden max-w-[120px]">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${parseFloat(price) * 100}%` }} />
                            </div>
                            <span className="text-gray-600 font-medium w-6">No</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {child.volume24hr ? (
                        <div className="text-sm text-gray-700">{formatCurrency(parseFloat(String(child.volume24hr)))}</div>
                      ) : (
                        <div className="text-sm text-gray-400">-</div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-700">{formatCurrency(childVolume)}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-700">{formatCurrency(childLiquidity)}</div>
                    </div>

                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      </div>

      {/* 分页控件 */}
      {!loading && totalPages > 1 && (
        <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>每页显示</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-polyBlue"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>条，共 {groupedMarkets.length} 条</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              首页
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              上一页
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-polyBlue text-white'
                        : 'border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              下一页
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              末页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
