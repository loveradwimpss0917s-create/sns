import { AppShell } from "@/components/layout/AppShell";
import { PostsView } from "./PostsView";

/** Single hydration root — see DashboardPage.tsx for why this wrapper exists. */
export function PostsPage({ currentPath }: { currentPath: string }) {
  return (
    <AppShell currentPath={currentPath}>
      <PostsView />
    </AppShell>
  );
}
