import { AppShell } from "@/components/layout/AppShell";
import { AiView } from "./AiView";

/** Single hydration root — see DashboardPage.tsx for why this wrapper exists. */
export function AiPage({ currentPath }: { currentPath: string }) {
  return (
    <AppShell currentPath={currentPath}>
      <AiView />
    </AppShell>
  );
}
