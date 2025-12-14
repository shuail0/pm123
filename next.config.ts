import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'polymarket-upload.s3.us-east-2.amazonaws.com',
      },
    ],
    dangerouslyAllowSVG: true,
    // 使用unoptimized绕过图片优化和私有IP检查
    unoptimized: true,
  },
};

export default nextConfig;
