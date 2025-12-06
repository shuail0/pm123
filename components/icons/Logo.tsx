export default function Logo({ className = "w-8 h-8", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#0047FF', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#2D6FFF', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#5B8FFF', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* 外圈：预测的不确定性波动 */}
      <path
        d="M 50 10 Q 65 15, 75 25 Q 85 35, 90 50 Q 85 65, 75 75 Q 65 85, 50 90 Q 35 85, 25 75 Q 15 65, 10 50 Q 15 35, 25 25 Q 35 15, 50 10"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="3"
        opacity="0.4"
      />

      {/* 中间层：市场趋势曲线 */}
      <path
        d="M 30 50 Q 40 35, 50 40 Q 60 45, 70 30"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* 核心：概率节点 */}
      <circle cx="30" cy="50" r="5" fill="url(#logoGradient)" opacity="0.8" />
      <circle cx="50" cy="40" r="6" fill="url(#logoGradient)" />
      <circle cx="70" cy="30" r="5" fill="url(#logoGradient)" opacity="0.8" />

      {/* 下方趋势线 */}
      <path
        d="M 30 50 Q 40 65, 50 60 Q 60 55, 70 70"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
      />

      <circle cx="50" cy="60" r="4" fill="url(#logoGradient)" opacity="0.7" />
    </svg>
  );
}
