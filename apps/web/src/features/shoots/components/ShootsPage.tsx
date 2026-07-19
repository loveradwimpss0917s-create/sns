import { AppShell } from "@/components/layout/AppShell";
import { ShootsView } from "./ShootsView";

/** Single hydration root — see DashboardPage.tsx for why this wrapper exists. */
export function ShootsPage({ currentPath }: { currentPath: string }) {
  return (
    <AppShell currentPath={currentPath}>
      <ShootsView />
    </AppShell>
  );
}
