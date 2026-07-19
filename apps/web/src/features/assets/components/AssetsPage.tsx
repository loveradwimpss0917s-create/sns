import { AppShell } from "@/components/layout/AppShell";
import { AssetsView } from "./AssetsView";

/** Single hydration root — see DashboardPage.tsx for why this wrapper exists. */
export function AssetsPage({ currentPath }: { currentPath: string }) {
  return (
    <AppShell currentPath={currentPath}>
      <AssetsView />
    </AppShell>
  );
}
