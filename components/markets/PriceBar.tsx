interface PriceBarProps {
  yesPrice: number;
  noPrice: number;
}

export function PriceBar({ yesPrice, noPrice }: PriceBarProps) {
  return (
    <div className="mt-1.5 flex items-center gap-3 text-xs">
      <div className="flex items-center gap-1.5">
        <span className="text-gray-600 font-medium">Yes</span>
        <span className="text-blue-600 font-semibold">${(yesPrice * 100).toFixed(1)}¢</span>
      </div>
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden max-w-[100px]">
        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${yesPrice * 100}%` }} />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-gray-600 font-medium">No</span>
        <span className="text-red-600 font-semibold">${(noPrice * 100).toFixed(1)}¢</span>
      </div>
    </div>
  );
}
