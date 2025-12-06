'use client';

import { ChevronDown, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { useCountdownStore, type CountdownMarket, type SortField } from '@/lib/store/countdown';
import { useMemo } from 'react';
import Image from 'next/image';

export function MarketTable() {
  const { filteredMarkets, expandedEvents, toggleEventExpand, filter, setSorting } = useCountdownStore();

  // 将市场按事件分组
  const groupedMarkets = useMemo(() => {
    const groups = new Map<string, CountdownMarket[]>();

    filteredMarkets.forEach(market => {
      const eventId = market.eventId || market.id;
      if (!groups.has(eventId)) {
        groups.set(eventId, []);
      }
      groups.get(eventId)!.push(market);
    });

    // 转换为数组并为每个事件创建一个父级行
    return Array.from(groups.entries()).map(([eventId, markets]) => {
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

  const ProgressBar = ({ value, max, color = 'blue' }: { value: number; max: number; color?: 'blue' | 'green' }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const bgColor = color === 'blue' ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 'bg-gradient-to-r from-green-400 to-green-500';

    return (
      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${bgColor} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  const UrgencyBadge = ({ urgency }: { urgency: string }) => {
    const config = {
      critical: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
      urgent: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
      soon: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
      normal: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' }
    };
    const style = config[urgency as keyof typeof config] || config.normal;

    return (
      <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
        {urgency}
      </span>
    );
  };

  const formatCurrency = (val: number) => {
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}K`;
    return `$${val.toFixed(0)}`;
  };

  const maxLiquidity = Math.max(...groupedMarkets.map(m => parseFloat(String(m.liquidity || m.liquidityNum || '0'))), 1);
  const maxVolume = Math.max(...groupedMarkets.map(m => parseFloat(String(m.volume || m.volumeNum || '0'))), 1);

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

  const SourceBadge = ({ sources }: { sources: string[] }) => {
    const displaySources = sources.slice(0, 2);
    return (
      <div className="flex items-center gap-1.5">
        {displaySources.map((source, i) => (
          <div key={i} className="inline-flex items-center gap-1 text-xs">
            {source === 'Polymarket' && (
              <>
                <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
                <span className="text-blue-600 font-medium">Polymarket</span>
              </>
            )}
            {source === 'Kalshi' && (
              <>
                <div className="w-3.5 h-3.5 bg-green-600 rounded-sm" />
                <span className="text-green-600 font-medium">Kalshi</span>
              </>
            )}
            {source === 'Limitless' && (
              <>
                <div className="w-3.5 h-3.5 bg-gray-800 rounded-sm" />
                <span className="text-gray-800 font-medium">Limitless</span>
              </>
            )}
          </div>
        ))}
        {sources.length > 2 && (
          <span className="text-xs text-gray-400">+{sources.length - 2}</span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* 表头 */}
      <div className="grid grid-cols-[48px,2.5fr,1fr,1fr,1fr,120px,120px,140px] gap-4 px-4 py-2.5 bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wide">
        <div></div>
        <div><SortButton field="market" label="Market" /></div>
        <div className="text-center">Source</div>
        <div className="text-right"><SortButton field="volume" label="Volume" /></div>
        <div className="text-right"><SortButton field="liquidity" label="Open Interest" /></div>
        <div className="text-center">Starts</div>
        <div className="text-center"><SortButton field="ends" label="Ends" /></div>
        <div className="text-center">Tags</div>
      </div>

      {/* 表体 */}
      <div className="divide-y divide-gray-100">
        {groupedMarkets.length === 0 && (
          <div className="px-4 py-16 text-center">
            <div className="text-gray-400 text-sm">未找到符合条件的市场</div>
          </div>
        )}

        {groupedMarkets.map(market => {
          const isExpanded = expandedEvents.has(market.eventId || market.id);
          const hasChildren = market._childMarkets && market._childMarkets.length >= 1;
          const liquidity = parseFloat(String(market.liquidity || market.liquidityNum || '0'));
          const volume = parseFloat(String(market.volume || market.volumeNum || '0'));

          return (
            <div key={market.eventId || market.id} className="hover:bg-gray-50/50 transition-colors">
              {/* 事件行 */}
              <div className="grid grid-cols-[48px,2.5fr,1fr,1fr,1fr,120px,120px,140px] gap-4 px-4 py-3 items-center">
                {/* 展开按钮 + 图标 */}
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
                    {market.category && (
                      <div className="text-xs text-gray-500 mt-0.5">{market.category}</div>
                    )}
                  </div>
                </div>

                {/* 来源 */}
                <div className="flex justify-center">
                  <SourceBadge sources={['Polymarket']} />
                </div>

                {/* 交易量 */}
                <div className="text-right space-y-1">
                  <div className="text-sm font-semibold text-gray-900">{formatCurrency(volume)}</div>
                  <ProgressBar value={volume} max={maxVolume} color="blue" />
                </div>

                {/* 流动性 */}
                <div className="text-right space-y-1">
                  <div className="text-sm font-semibold text-gray-900">{formatCurrency(liquidity)}</div>
                  <ProgressBar value={liquidity} max={maxLiquidity} color="green" />
                </div>

                {/* 开始时间 */}
                <div className="text-center space-y-1">
                  <div className="text-sm font-medium text-gray-900">
                    {market.gameStartTime ? new Date(market.gameStartTime).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '-'}
                  </div>
                </div>

                {/* 结束时间 */}
                <div className="text-center space-y-1">
                  <div className="text-sm font-medium text-gray-900">
                    {market._deadline ? new Date(market._deadline).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '-'}
                  </div>
                  <UrgencyBadge urgency={market._urgency || 'normal'} />
                </div>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {market.tags && market.tags.length > 0 ? (
                    <>
                      {market.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                          {tag}
                        </span>
                      ))}
                      {market.tags.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">
                          +{market.tags.length - 2}
                        </span>
                      )}
                    </>
                  ) : (
                    market.category && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full font-medium border border-blue-100">
                        {market.category}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* 子市场 */}
              {hasChildren && isExpanded && market._childMarkets!.map(child => {
                const childLiquidity = parseFloat(String(child.liquidity || child.liquidityNum || '0'));
                const childVolume = parseFloat(String(child.volume || child.volumeNum || '0'));
                const price = child.outcomePrices ? JSON.parse(child.outcomePrices)[0] : null;

                return (
                  <div
                    key={child.id}
                    className="grid grid-cols-[48px,2.5fr,1fr,1fr,1fr,120px,120px,140px] gap-4 px-4 py-2.5 items-center bg-gray-50/30 border-l-2 border-blue-400 ml-12"
                  >
                    <div></div>

                    <div className="flex items-center gap-3 min-w-0 pl-2">
                      <MarketIcon title={child.question} image={child.image} />
                      <div className="text-sm text-gray-700 flex-1 min-w-0">
                        <a
                          href={`https://polymarket.com/event/${child.eventSlug}?outcome=${child.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 inline-flex items-center gap-1.5 group transition-colors"
                        >
                          <span className="truncate">{child.question}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </a>
                        {price && (
                          <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <span className={parseFloat(price) >= 0.5 ? 'text-green-600' : 'text-red-600'}>
                              Yes: {(parseFloat(price) * 100).toFixed(1)}%
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className={parseFloat(price) < 0.5 ? 'text-green-600' : 'text-red-600'}>
                              No: {((1 - parseFloat(price)) * 100).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div></div>

                    <div className="text-right space-y-1">
                      <div className="text-sm text-gray-700">{formatCurrency(childVolume)}</div>
                      <ProgressBar value={childVolume} max={maxVolume} color="blue" />
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-sm text-gray-700">{formatCurrency(childLiquidity)}</div>
                      <ProgressBar value={childLiquidity} max={maxLiquidity} color="green" />
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
  );
}
