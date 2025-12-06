'use client';

import { Search, X } from 'lucide-react';
import { useCountdownStore } from '@/lib/store/countdown';
import { useMemo } from 'react';

export function AdvancedFilterBar() {
  const { filter, setFilter, markets } = useCountdownStore();

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

  const timePeriodOptions = [
    { value: '30min', label: '30分钟' },
    { value: '2h', label: '2小时' },
    { value: '12h', label: '12小时' },
    { value: '24h', label: '24小时' },
    { value: 'all', label: '全部' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'closed', label: 'Closed' }
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
            placeholder="Search terms..."
            value={filter.searchQuery || ''}
            onChange={e => setFilter({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-polyBlue focus:border-transparent"
          />
        </div>

        {/* 状态筛选 */}
        <select
          value={filter.status}
          onChange={e => setFilter({ status: e.target.value as any })}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-polyBlue"
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* 时间周期筛选 */}
        <select
          value={filter.timePeriod}
          onChange={e => setFilter({ timePeriod: e.target.value as any })}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-polyBlue"
        >
          {timePeriodOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

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
          <select
            value=""
            onChange={e => {
              if (e.target.value && !filter.tags.includes(e.target.value)) {
                setFilter({ tags: [...filter.tags, e.target.value] });
              }
            }}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-polyBlue"
          >
            <option value="">标签</option>
            {availableTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        )}
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
