import Image from 'next/image';

interface MarketIconProps {
  title: string;
  image?: string;
}

export function MarketIcon({ title, image }: MarketIconProps) {
  return image ? (
    <Image src={image} alt={title} width={32} height={32} className="rounded-full flex-shrink-0" />
  ) : (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
      <span className="text-white text-xs font-bold">{title.charAt(0).toUpperCase()}</span>
    </div>
  );
}
