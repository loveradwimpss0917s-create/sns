import { AppShell } from "@/components/layout/AppShell";
import { DashboardView } from "./DashboardView";

/**
 * Astro's `client:*` directives create independent hydration roots — a
 * `<DashboardView client:load />` nested inside `<AppShell client:load>` in
 * an .astro file does NOT share React context (e.g. QueryClientProvider)
 * with AppShell, because they're separate islands, not one component tree.
 * Mounting a single wrapper like this per page keeps AppShell + the feature
 * view as one real React tree with exactly one hydration root.
 */
export function DashboardPage({ currentPath }: { currentPath: string }) {
  return (
    <AppShell currentPath={currentPath}>
      <DashboardView />
    </AppShell>
  );
}
