import type { ReactNode } from "react";
import { useState } from "react";
import { AppProviders } from "@/components/providers/AppProviders";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { useDarkMode } from "@/hooks/useDarkMode";

const NAV = [
  { label: "ダッシュボード", href: "/", icon: "◐" },
  { label: "投稿管理", href: "/posts", icon: "▤" },
  { label: "撮影管理", href: "/shoots", icon: "◎" },
  { label: "編集管理", href: "/editing", icon: "✂" },
  { label: "AI", href: "/ai", icon: "✦" },
  { label: "KPI", href: "/kpi", icon: "▲" },
  { label: "アセット", href: "/assets", icon: "▣" },
  { label: "収益", href: "/revenue", icon: "¥" },
];

export function AppShell({ children, currentPath }: { children: ReactNode; currentPath: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useDarkMode();

  return (
    <AppProviders>
      <div className="min-h-screen">
        <a
          href="#main"
          className="focus:bg-ink focus:text-cream sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded focus:px-3 focus:py-2"
        >
          本文へ
        </a>

        {/* Mobile top bar */}
        <header className="glass-panel sticky top-0 z-40 mx-2 mt-2 flex items-center justify-between rounded-full px-4 py-2.5 md:hidden">
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="メニュー"
            className="text-lg"
          >
            ☰
          </button>
          <span className="text-sm font-medium">Vlog管制室</span>
          <button onClick={toggle} aria-label="テーマ切替" className="text-lg">
            {theme === "dark" ? "☾" : "☀"}
          </button>
        </header>

        <div className="mx-auto flex max-w-7xl gap-4 p-2 md:p-4">
          {/* Sidebar */}
          <nav
            className={`glass-panel fixed inset-x-2 top-16 z-30 rounded-2xl p-3 md:sticky md:top-4 md:block md:h-[calc(100vh-2rem)] md:w-56 md:shrink-0 ${
              mobileOpen ? "animate-fade-in block" : "hidden"
            }`}
          >
            <div className="mb-4 hidden px-2 md:block">
              <p className="text-sm font-medium tracking-wide">Vlog管制室</p>
              <p className="kicker mt-0.5">Vlog Control Room</p>
            </div>
            <ul className="space-y-1">
              {NAV.map((item) => {
                const active = currentPath === item.href;
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-ink text-cream dark:bg-cream dark:text-ink"
                          : "hover:bg-ink/5 dark:hover:bg-cream/10"
                      }`}
                    >
                      <span aria-hidden className="text-base leading-none">
                        {item.icon}
                      </span>
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
            <button
              onClick={toggle}
              className="hover:bg-ink/5 dark:hover:bg-cream/10 mt-4 hidden w-full items-center justify-between rounded-xl px-3 py-2 text-sm md:flex"
            >
              <span>ダークモード</span>
              <span>{theme === "dark" ? "☾" : "☀"}</span>
            </button>
            <p className="text-ink/40 dark:text-cream/40 mt-4 hidden px-3 text-xs md:block">
              ⌘K でコマンドパレット
            </p>
          </nav>

          <main id="main" className="min-w-0 flex-1 pb-16 pt-16 md:pt-0">
            {children}
          </main>
        </div>

        <CommandPalette />
      </div>
    </AppProviders>
  );
}
