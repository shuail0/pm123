'use client';

import { Search, X, Filter } from 'lucide-react';
import { useCountdownStore } from '@/lib/store/countdown';
import { TAG_CATEGORIES } from '@/lib/constants/tags';
import { useMemo, useState, useRef, useEffect } from 'react';

export function AdvancedFilterBar() {
  const { filter, setFilter, markets } = useCountdownStore();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const tagFilterRef = useRef<HTMLDivElement>(null);
  const timeFilterRef = useRef<HTMLDivElement>(null);

  // 提取所有可用的类别和标签
  const { availableCategories, availableTags } = useMemo(() => {
    const categories = new Set<string>();
    const tags = new Set<string>();

    markets.forEach(m => {
      if (m.category) categories.add(m.category);
      m.tags?.forEach(tag => tags.add(tag));
    });

    return {
      availableCategories: Array.from(categories).sort(),
      availableTags: Array.from(tags).sort()
    };
  }, [markets]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (tagFilterRef.current && !tagFilterRef.current.contains(event.target as Node)) {
        setIsTagFilterOpen(false);
      }
      if (timeFilterRef.current && !timeFilterRef.current.contains(event.target as Node)) {
        setIsTimeFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const timePeriodOptions = [
    { value: 'all', label: '全部时间' },
    { value: '30min', label: '30分钟内' },
    { value: '1h', label: '1小时内' },
    { value: '2h', label: '2小时内' },
    { value: '6h', label: '6小时内' },
    { value: '12h', label: '12小时内' },
    { value: '24h', label: '24小时内' },
    { value: '3d', label: '3天内' },
    { value: '7d', label: '7天内' }
  ];

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

        {/* 类别筛选 */}
        {availableCategories.length > 0 && (
          <select
            value=""
            onChange={e => {
              if (e.target.value && !filter.categories.includes(e.target.value)) {
                setFilter({ categories: [...filter.categories, e.target.value] });
              }
            }}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-polyBlue"
          >
            <option value="">分类</option>
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}

        {/* 标签筛选 */}
        {availableTags.length > 0 && (
          <div className="relative" ref={tagFilterRef}>
            <button
              onClick={() => setIsTagFilterOpen(!isTagFilterOpen)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-polyBlue transition-colors"
            >
              <span>标签筛选</span>
              {filter.tags.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-polyBlue text-white text-xs rounded-full">
                  {filter.tags.length}
                </span>
              )}
            </button>
            {isTagFilterOpen && (
              <div className="absolute z-10 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg">
                {/* 已选标签 */}
                {filter.tags.length > 0 && (
                  <div className="p-3 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700">已选 ({filter.tags.length})</span>
                      <button
                        onClick={() => setFilter({ tags: [] })}
                        className="text-xs text-polyBlue hover:text-polyBlue/80 font-medium"
                      >
                        清除全部
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {filter.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md"
                        >
                          {tag}
                          <button
                            onClick={() => setFilter({ tags: filter.tags.filter(t => t !== tag) })}
                            className="hover:bg-gray-200 rounded p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 标签列表 */}
                <div className="max-h-80 overflow-y-auto">
                  {availableTags.map(tag => (
                    <label
                      key={tag}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
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
                </div>
              </div>
            )}
          </div>
        )}

        {/* 排除分类筛选 */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-polyBlue transition-colors"
          >
            <Filter className="w-4 h-4 text-gray-600" />
            <span>排除分类</span>
            {filter.excludedTagCategories.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-polyBlue text-white text-xs rounded-full">
                {filter.excludedTagCategories.length}
              </span>
            )}
          </button>
          {isFilterOpen && (
            <div className="absolute z-10 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg">
              {/* 已选分类 */}
              {filter.excludedTagCategories.length > 0 && (
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700">已排除 ({filter.excludedTagCategories.length})</span>
                    <button
                      onClick={() => setFilter({ excludedTagCategories: [] })}
                      className="text-xs text-polyBlue hover:text-polyBlue/80 font-medium"
                    >
                      清除全部
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {filter.excludedTagCategories.map(key => (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md"
                      >
                        {TAG_CATEGORIES.find(cat => cat.id === key)?.name || key}
                        <button
                          onClick={() => setFilter({ excludedTagCategories: filter.excludedTagCategories.filter(c => c !== key) })}
                          className="hover:bg-gray-200 rounded p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 分类列表 */}
              <div className="max-h-80 overflow-y-auto">
                {TAG_CATEGORIES.map(category => (
                  <label
                    key={category.id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filter.excludedTagCategories.includes(category.id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setFilter({ excludedTagCategories: [...filter.excludedTagCategories, category.id] });
                        } else {
                          setFilter({ excludedTagCategories: filter.excludedTagCategories.filter(c => c !== category.id) });
                        }
                      }}
                      className="w-4 h-4 text-polyBlue border-gray-300 rounded focus:ring-polyBlue cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 flex-1">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 已选筛选条件 */}
      {(filter.categories.length > 0 || filter.tags.length > 0) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">已选:</span>

          {filter.categories.map(cat => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-polyBlue/10 text-polyBlue text-xs font-medium rounded-md"
            >
              {cat}
              <button
                onClick={() => setFilter({ categories: filter.categories.filter(c => c !== cat) })}
                className="hover:bg-polyBlue/20 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filter.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md"
            >
              {tag}
              <button
                onClick={() => setFilter({ tags: filter.tags.filter(t => t !== tag) })}
                className="hover:bg-gray-200 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {(filter.categories.length > 0 || filter.tags.length > 0) && (
            <button
              onClick={() => setFilter({ categories: [], tags: [] })}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              清除全部
            </button>
          )}
        </div>
      )}
    </div>
  );
}
