'use client';

import { Search, Filter } from 'lucide-react';
import { useCountdownStore } from '@/lib/store/markets';
import { useMemo, useState, useRef, useEffect } from 'react';
import { getFilterOptions } from '@/lib/utils/timeRanges';
import { CATEGORY_CONFIG, CATEGORY_ORDER } from '@/lib/constants/categories';

const VolumeRangeFilter = ({
  title,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  defaultMax = 1000000000
}: {
  title: string;
  minValue?: number;
  maxValue?: number;
  onMinChange: (val: number | undefined) => void;
  onMaxChange: (val: number | undefined) => void;
  defaultMax?: number;
}) => {
  const [minInput, setMinInput] = useState(minValue || 0);
  const [maxInput, setMaxInput] = useState(maxValue || defaultMax);

  // 当 defaultMax 改变时更新 maxInput
  useEffect(() => {
    if (!maxValue) {
      setMaxInput(defaultMax);
    }
  }, [defaultMax, maxValue]);

  const formatCurrency = (num: number) => `$${num.toLocaleString('en-US')}`;

  const minPercent = (minInput / defaultMax) * 100;
  const maxPercent = (maxInput / defaultMax) * 100;

  return (
    <div className="p-4 space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={formatCurrency(minInput)}
            onChange={e => {
              const val = e.target.value.replace(/[$,]/g, '');
              const num = parseFloat(val);
              if (!isNaN(num) && num <= maxInput) {
                setMinInput(num);
                onMinChange(num === 0 ? undefined : num);
              }
            }}
            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-polyBlue"
          />
          <span className="text-gray-500">-</span>
          <input
            type="text"
            value={formatCurrency(maxInput)}
            onChange={e => {
              const val = e.target.value.replace(/[$,]/g, '');
              const num = parseFloat(val);
              if (!isNaN(num) && num >= minInput) {
                setMaxInput(num);
                onMaxChange(num);
              }
            }}
            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-polyBlue"
          />
        </div>
        <div className="relative h-2">
          <div className="absolute w-full h-2 bg-gray-200 rounded-lg" />
          <div
            className="absolute h-2 bg-polyBlue rounded-lg"
            style={{
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`
            }}
          />
          <input
            type="range"
            min="0"
            max={defaultMax}
            value={minInput}
            onChange={e => {
              const num = Number(e.target.value);
              if (num <= maxInput) {
                setMinInput(num);
                onMinChange(num === 0 ? undefined : num);
              }
            }}
            className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-polyBlue [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-polyBlue [&::-moz-range-thumb]:cursor-pointer"
            style={{ zIndex: minInput > defaultMax - 100 ? 5 : 3 }}
          />
          <input
            type="range"
            min="0"
            max={defaultMax}
            value={maxInput}
            onChange={e => {
              const num = Number(e.target.value);
              if (num >= minInput) {
                setMaxInput(num);
                onMaxChange(num);
              }
            }}
            className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-polyBlue [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-polyBlue [&::-moz-range-thumb]:cursor-pointer"
            style={{ zIndex: 4 }}
          />
        </div>
      </div>
    </div>
  );
};

export function AdvancedFilterBar() {
  const { filter, setFilter, markets, filteredMarkets } = useCountdownStore();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);
  const [isSeriesFilterOpen, setIsSeriesFilterOpen] = useState(false);
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);
  const [isVolumeFilterOpen, setIsVolumeFilterOpen] = useState(false);
  const [isNegRiskFilterOpen, setIsNegRiskFilterOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [seriesSearch, setSeriesSearch] = useState('');
  const filterRef = useRef<HTMLDivElement>(null);
  const tagFilterRef = useRef<HTMLDivElement>(null);
  const seriesFilterRef = useRef<HTMLDivElement>(null);
  const timeFilterRef = useRef<HTMLDivElement>(null);
  const volumeFilterRef = useRef<HTMLDivElement>(null);
  const negRiskFilterRef = useRef<HTMLDivElement>(null);

  // 计算实际数据的最大成交量
  const maxVolume24hr = useMemo(() => Math.max(...markets.map(m => m.volume24hr || 0), 1000000), [markets]);
  const maxVolume = useMemo(() => Math.max(...markets.map(m => m.volume || 0), 1000000), [markets]);

  // 提取所有可用的类别并按官方顺序排序
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    markets.forEach(m => {
      if (m.category) categories.add(m.category);
    });
    return CATEGORY_ORDER.filter(cat => categories.has(cat));
  }, [markets]);

  // 提取当前筛选条件下的标签（基于分类筛选后的结果）
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    let marketsToCheck = markets;

    // 如果有选中的分类，先按分类筛选
    if (filter.selectedCategories.length > 0) {
      marketsToCheck = markets.filter(m => filter.selectedCategories.includes(m.category));
    }

    // 从筛选后的市场中提取标签
    marketsToCheck.forEach(m => {
      m.tagLabels?.forEach(tag => tags.add(tag));
    });

    return Array.from(tags).sort();
  }, [markets, filter.selectedCategories]);

  // 提取当前筛选条件下的series（基于分类筛选后的结果）
  const availableSeries = useMemo(() => {
    const seriesSet = new Set<string>();
    let marketsToCheck = markets;

    // 如果有选中的分类，先按分类筛选
    if (filter.selectedCategories.length > 0) {
      marketsToCheck = markets.filter(m => filter.selectedCategories.includes(m.category));
    }

    // 从筛选后的市场中提取series
    marketsToCheck.forEach(m => {
      m.seriesLabels?.forEach(series => seriesSet.add(series));
    });

    return Array.from(seriesSet).sort();
  }, [markets, filter.selectedCategories]);

  // 当可用标签改变时，自动清除不在范围内的已选标签
  useEffect(() => {
    if (filter.tags.length > 0) {
      const validTags = filter.tags.filter(tag => availableTags.includes(tag));
      if (validTags.length !== filter.tags.length) {
        setFilter({ tags: validTags });
      }
    }
  }, [availableTags]);

  // 当可用series改变时，自动清除不在范围内的已选series
  useEffect(() => {
    if (filter.series.length > 0) {
      const validSeries = filter.series.filter(series => availableSeries.includes(series));
      if (validSeries.length !== filter.series.length) {
        setFilter({ series: validSeries });
      }
    }
  }, [availableSeries]);

  // 过滤后的分类列表
  const filteredCategories = useMemo(() =>
    availableCategories.filter(cat => {
      const label = `${CATEGORY_CONFIG[cat]}(${cat})`;
      return label.toLowerCase().includes(categorySearch.toLowerCase());
    }),
    [availableCategories, categorySearch]
  );

  // 过滤后的标签列表
  const filteredTagsList = useMemo(() =>
    availableTags.filter(tag => tag.toLowerCase().includes(tagSearch.toLowerCase())),
    [availableTags, tagSearch]
  );

  const filteredSeriesList = useMemo(() =>
    availableSeries.filter(series => series.toLowerCase().includes(seriesSearch.toLowerCase())),
    [availableSeries, seriesSearch]
  );

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (tagFilterRef.current && !tagFilterRef.current.contains(event.target as Node)) {
        setIsTagFilterOpen(false);
      }
      if (seriesFilterRef.current && !seriesFilterRef.current.contains(event.target as Node)) {
        setIsSeriesFilterOpen(false);
      }
      if (timeFilterRef.current && !timeFilterRef.current.contains(event.target as Node)) {
        setIsTimeFilterOpen(false);
      }
      if (volumeFilterRef.current && !volumeFilterRef.current.contains(event.target as Node)) {
        setIsVolumeFilterOpen(false);
      }
      if (negRiskFilterRef.current && !negRiskFilterRef.current.contains(event.target as Node)) {
        setIsNegRiskFilterOpen(false);
      }
    };

    if (isFilterOpen || isTagFilterOpen || isSeriesFilterOpen || isTimeFilterOpen || isVolumeFilterOpen || isNegRiskFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isFilterOpen, isTagFilterOpen, isSeriesFilterOpen, isTimeFilterOpen, isVolumeFilterOpen, isNegRiskFilterOpen]);

  const timePeriodOptions = getFilterOptions();

  return (
    <div className="space-y-4 mb-6">
      {/* 主筛选栏 */}
      <div className="flex items-center gap-3">
        {/* 搜索框 */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索市场、事件、类别..."
            value={filter.searchQuery || ''}
            onChange={e => setFilter({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-polyBlue focus:border-transparent"
          />
        </div>

        {/* 时间周期筛选 */}
        <div className="relative" ref={timeFilterRef}>
          <button
            onClick={() => setIsTimeFilterOpen(!isTimeFilterOpen)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-polyBlue transition-colors"
          >
            <span>{timePeriodOptions.find(o => o.value === filter.timePeriod)?.label || '时间'}</span>
          </button>
          {isTimeFilterOpen && (
            <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {timePeriodOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setFilter({ timePeriod: opt.value as any });
                    setIsTimeFilterOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${filter.timePeriod === opt.value ? 'bg-polyBlue/10 text-polyBlue font-medium' : 'text-gray-700'}`}
                >
                  <span className="text-sm">{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* NegRisk 筛选 */}
        <div className="relative" ref={negRiskFilterRef}>
          <button
            onClick={() => setIsNegRiskFilterOpen(!isNegRiskFilterOpen)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-polyBlue transition-colors"
          >
            <span>
              {filter.negRiskFilter === 'all' ? '全部类型' :
               filter.negRiskFilter === 'neg_risk' ? 'NegRisk' : '非NegRisk'}
            </span>
          </button>
          {isNegRiskFilterOpen && (
            <div className="absolute z-10 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {[
                { value: 'all', label: '全部类型' },
                { value: 'neg_risk', label: 'NegRisk' },
                { value: 'non_neg_risk', label: '非NegRisk' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setFilter({ negRiskFilter: opt.value as any });
                    setIsNegRiskFilterOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${filter.negRiskFilter === opt.value ? 'bg-polyBlue/10 text-polyBlue font-medium' : 'text-gray-700'}`}
                >
                  <span className="text-sm">{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 成交量筛选 */}
        <div className="relative" ref={volumeFilterRef}>
          <button
            onClick={() => setIsVolumeFilterOpen(!isVolumeFilterOpen)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-polyBlue transition-colors"
          >
            <Filter className="w-4 h-4 text-gray-600" />
            <span>成交量</span>
          </button>
          {isVolumeFilterOpen && (
            <div className="absolute z-10 mt-1 w-96 bg-white border border-gray-200 rounded-lg shadow-lg">
              <VolumeRangeFilter
                title="24h成交量"
                minValue={filter.minVolume24hr}
                maxValue={filter.maxVolume24hr}
                onMinChange={val => setFilter({ minVolume24hr: val })}
                onMaxChange={val => setFilter({ maxVolume24hr: val })}
                defaultMax={maxVolume24hr}
              />
              <div className="border-t border-gray-200" />
              <VolumeRangeFilter
                title="总成交量"
                minValue={filter.minVolume}
                maxValue={filter.maxVolume}
                onMinChange={val => setFilter({ minVolume: val })}
                onMaxChange={val => setFilter({ maxVolume: val })}
                defaultMax={maxVolume}
              />
            </div>
          )}
        </div>

        {/* 分类筛选 */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-polyBlue transition-colors"
          >
            <Filter className="w-4 h-4 text-gray-600" />
            <span>分类筛选</span>
            {filter.selectedCategories.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-polyBlue text-white text-xs rounded-full">
                {filter.selectedCategories.length}
              </span>
            )}
          </button>
          {isFilterOpen && (
            <div className="absolute z-10 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="p-3 border-b border-gray-200">
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={e => setCategorySearch(e.target.value)}
                    placeholder="搜索分类..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-polyBlue"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">已选 ({filter.selectedCategories.length}/{availableCategories.length})</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilter({ selectedCategories: [...availableCategories] })}
                      className="text-xs text-polyBlue hover:text-polyBlue/80 font-medium"
                    >
                      全选
                    </button>
                    <button
                      onClick={() => setFilter({ selectedCategories: [] })}
                      className="text-xs text-polyBlue hover:text-polyBlue/80 font-medium"
                    >
                      清除
                    </button>
                  </div>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {filteredCategories.map(category => (
                  <label
                    key={category}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filter.selectedCategories.includes(category)}
                      onChange={e => {
                        if (e.target.checked) {
                          setFilter({ selectedCategories: [...filter.selectedCategories, category] });
                        } else {
                          setFilter({ selectedCategories: filter.selectedCategories.filter(c => c !== category) });
                        }
                      }}
                      className="w-4 h-4 text-polyBlue border-gray-300 rounded focus:ring-polyBlue cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 flex-1">{CATEGORY_CONFIG[category]}({category})</span>
                  </label>
                ))}
                {filteredCategories.length === 0 && (
                  <div className="px-3 py-6 text-center text-sm text-gray-400">未找到匹配的分类</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 系列筛选 */}
        <div className="relative" ref={seriesFilterRef}>
          <button
            onClick={() => setIsSeriesFilterOpen(!isSeriesFilterOpen)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-polyBlue transition-colors"
          >
            <Filter className="w-4 h-4 text-gray-600" />
            <span>系列筛选</span>
            {filter.series.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-polyBlue text-white text-xs rounded-full">
                {filter.series.length}
              </span>
            )}
          </button>
          {isSeriesFilterOpen && (
            <div className="absolute z-10 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="p-3 border-b border-gray-200">
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={seriesSearch}
                    onChange={e => setSeriesSearch(e.target.value)}
                    placeholder="搜索系列..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-polyBlue"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">已选 ({filter.series.length}/{availableSeries.length})</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilter({ series: [...availableSeries] })}
                      className="text-xs text-polyBlue hover:text-polyBlue/80 font-medium"
                    >
                      全选
                    </button>
                    <button
                      onClick={() => setFilter({ series: [] })}
                      className="text-xs text-polyBlue hover:text-polyBlue/80 font-medium"
                    >
                      清除
                    </button>
                  </div>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {filteredSeriesList.map(series => (
                  <label key={series} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={filter.series.includes(series)}
                      onChange={e => {
                        if (e.target.checked) {
                          setFilter({ series: [...filter.series, series] });
                        } else {
                          setFilter({ series: filter.series.filter(s => s !== series) });
                        }
                      }}
                      className="w-4 h-4 text-polyBlue border-gray-300 rounded focus:ring-polyBlue cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 flex-1">{series}</span>
                  </label>
                ))}
                {filteredSeriesList.length === 0 && (
                  <div className="px-3 py-6 text-center text-sm text-gray-400">未找到匹配的系列</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 标签筛选 */}
        <div className="relative" ref={tagFilterRef}>
          <button
            onClick={() => setIsTagFilterOpen(!isTagFilterOpen)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-polyBlue transition-colors"
          >
            <Filter className="w-4 h-4 text-gray-600" />
            <span>标签筛选</span>
            {filter.tags.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-polyBlue text-white text-xs rounded-full">
                {filter.tags.length}
              </span>
            )}
          </button>
          {isTagFilterOpen && (
            <div className="absolute z-10 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="p-3 border-b border-gray-200">
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={tagSearch}
                    onChange={e => setTagSearch(e.target.value)}
                    placeholder="搜索标签..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-polyBlue"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">已选 ({filter.tags.length}/{availableTags.length})</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilter({ tags: [...availableTags] })}
                      className="text-xs text-polyBlue hover:text-polyBlue/80 font-medium"
                    >
                      全选
                    </button>
                    <button
                      onClick={() => setFilter({ tags: [] })}
                      className="text-xs text-polyBlue hover:text-polyBlue/80 font-medium"
                    >
                      清除
                    </button>
                  </div>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {filteredTagsList.map(tag => (
                  <label key={tag} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={filter.tags.includes(tag)}
                      onChange={e => {
                        if (e.target.checked) {
                          setFilter({ tags: [...filter.tags, tag] });
                        } else {
                          setFilter({ tags: filter.tags.filter(t => t !== tag) });
                        }
                      }}
                      className="w-4 h-4 text-polyBlue border-gray-300 rounded focus:ring-polyBlue cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 flex-1">{tag}</span>
                  </label>
                ))}
                {filteredTagsList.length === 0 && (
                  <div className="px-3 py-6 text-center text-sm text-gray-400">未找到匹配的标签</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
