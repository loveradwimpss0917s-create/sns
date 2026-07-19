import { AppShell } from "@/components/layout/AppShell";
import { RevenueView } from "./RevenueView";

/** Single hydration root — see DashboardPage.tsx for why this wrapper exists. */
export function RevenuePage({ currentPath }: { currentPath: string }) {
  return (
    <AppShell currentPath={currentPath}>
      <RevenueView />
    </AppShell>
  );
}
