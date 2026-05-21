import { SideNav } from "./SideNav";
import { WorkspaceArea } from "./WorkspaceArea";

export function DesktopLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-navy">
      <div className="relative flex-shrink-0">
        <SideNav />
      </div>
      <WorkspaceArea />
    </div>
  );
}
