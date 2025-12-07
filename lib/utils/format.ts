export const formatCurrency = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

export const formatTimeUntil = (hoursUntil: number): string => {
  if (hoursUntil < 1) return `${Math.round(hoursUntil * 60)}分钟后`;
  if (hoursUntil < 24) return `${hoursUntil.toFixed(1)}小时后`;
  return `${Math.round(hoursUntil / 24)}天后`;
};

export const formatDateTime = (dateString: string): string =>
  new Date(dateString).toISOString().slice(0, 16).replace('T', ' ');
