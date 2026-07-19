import { AppShell } from "@/components/layout/AppShell";
import { KpiView } from "./KpiView";

/** Single hydration root — see DashboardPage.tsx for why this wrapper exists. */
export function KpiPage({ currentPath }: { currentPath: string }) {
  return (
    <AppShell currentPath={currentPath}>
      <KpiView />
    </AppShell>
  );
}
