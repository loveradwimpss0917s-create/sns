import { AppShell } from "@/components/layout/AppShell";
import { EditingView } from "./EditingView";

/** Single hydration root — see DashboardPage.tsx for why this wrapper exists. */
export function EditingPage({ currentPath }: { currentPath: string }) {
  return (
    <AppShell currentPath={currentPath}>
      <EditingView />
    </AppShell>
  );
}
