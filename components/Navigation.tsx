"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./icons/Logo";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/countdown", label: "尾盘市场" },
    { href: "/markets", label: "市场搜索" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gray-1 border-b border-gray-3">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <Logo className="w-9 h-9 transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold text-white">PM123</span>
          </Link>

          {/* Center Navigation */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-white text-gray-1"
                    : "text-gray-6 hover:text-white hover:bg-gray-2"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side - Twitter Link */}
          <div className="flex items-center space-x-4">
            <a
              href="https://x.com/ShuaiWeb3"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md text-gray-6 hover:text-white hover:bg-gray-2 transition-colors"
              aria-label="Twitter"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
