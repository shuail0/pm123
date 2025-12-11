import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useCountdownStore, type SortField } from '@/lib/store/markets';

interface SortButtonProps {
  field: SortField;
  label: string;
}

export function SortButton({ field, label }: SortButtonProps) {
  const { filter, setSorting } = useCountdownStore();
  const isActive = filter.sortField === field;
  const direction = filter.sortDirection;

  return (
    <button
      onClick={() => setSorting(field)}
      className={`inline-flex items-center gap-1.5 hover:text-gray-900 transition-colors ${
        isActive ? 'text-polyBlue font-semibold' : 'text-gray-600'
      }`}
    >
      <span>{label}</span>
      {isActive ? (
        direction === 'asc' ? (
          <ArrowUp className="w-3.5 h-3.5" />
        ) : (
          <ArrowDown className="w-3.5 h-3.5" />
        )
      ) : (
        <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
      )}
    </button>
  );
}
