import { Command } from "cmdk";
import { useEffect, useState } from "react";

const NAV = [
  { label: "ダッシュボード", href: "/", hint: "g d" },
  { label: "投稿管理", href: "/posts", hint: "g p" },
  { label: "撮影管理", href: "/shoots", hint: "g s" },
  { label: "編集管理", href: "/editing", hint: "g e" },
  { label: "AI", href: "/ai", hint: "g a" },
  { label: "KPI", href: "/kpi", hint: "g k" },
  { label: "アセット", href: "/assets", hint: "g v" },
  { label: "収益", href: "/revenue", hint: "g r" },
];

/** グローバルコマンドパレット。⌘K / Ctrl+K で開く (設計書「Command Palette / ショートカット対応」)。 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!open) return null;

  return (
    <div
      className="bg-ink/40 animate-fade-in fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <Command
        className="glass-panel !bg-cream/95 w-full max-w-lg overflow-hidden dark:!bg-[#242320]/95"
        onClick={(e) => e.stopPropagation()}
        label="Command Palette"
      >
        <Command.Input
          autoFocus
          placeholder="ページ・アクションを検索..."
          className="border-ink/10 placeholder:text-ink/40 dark:border-cream/10 dark:placeholder:text-cream/40 w-full border-b bg-transparent px-4 py-3 text-sm outline-none"
        />
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="text-ink/50 px-3 py-6 text-center text-sm">
            見つかりませんでした
          </Command.Empty>
          {NAV.map((item) => (
            <Command.Item
              key={item.href}
              onSelect={() => {
                window.location.href = item.href;
                setOpen(false);
              }}
              className="aria-selected:bg-ink/5 dark:aria-selected:bg-cream/10 flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm"
            >
              <span>{item.label}</span>
              <kbd className="text-ink/40 dark:text-cream/40 text-xs">{item.hint}</kbd>
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </div>
  );
}
