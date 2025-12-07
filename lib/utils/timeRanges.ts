// 统一的时间范围定义
export const TIME_RANGES = {
  critical: { hours: 1, label: '1小时内', color: 'red' },
  urgent: { hours: 24, label: '24小时内', color: 'orange' },
  soon: { hours: 168, label: '本周内', color: 'yellow' },
  normal: { hours: Infinity, label: '更晚', color: 'gray' }
} as const;

export type TimeRangeKey = keyof typeof TIME_RANGES;

// 根据小时数获取时间范围
export function getTimeRange(hoursUntil: number): TimeRangeKey {
  if (hoursUntil < TIME_RANGES.critical.hours) return 'critical';
  if (hoursUntil < TIME_RANGES.urgent.hours) return 'urgent';
  if (hoursUntil < TIME_RANGES.soon.hours) return 'soon';
  return 'normal';
}

// 获取筛选选项（用于下拉菜单）
export function getFilterOptions() {
  return [
    { value: 'all', label: '全部时间', hours: Infinity },
    { value: 'critical', label: TIME_RANGES.critical.label, hours: TIME_RANGES.critical.hours },
    { value: 'urgent', label: TIME_RANGES.urgent.label, hours: TIME_RANGES.urgent.hours },
    { value: 'soon', label: TIME_RANGES.soon.label, hours: TIME_RANGES.soon.hours },
  ];
}

// 获取样式配置
export function getTimeRangeStyle(range: TimeRangeKey) {
  const config = {
    critical: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200',
      label: TIME_RANGES.critical.label
    },
    urgent: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-200',
      label: TIME_RANGES.urgent.label
    },
    soon: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-200',
      label: TIME_RANGES.soon.label
    },
    normal: {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      border: 'border-gray-200',
      label: TIME_RANGES.normal.label
    }
  };
  return config[range];
}
