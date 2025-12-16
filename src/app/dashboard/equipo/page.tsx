"use client";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import TeamMembers from "@/components/table-team";
import { RoleGuard } from "@/components/RoleGuard";

export default function Dashtests() {
  return (
    <RoleGuard allowedRoles={["ADMINISTRADOR"]}>
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2 p-4"></div>
          <div className="px-4 lg:px-2">
            <TeamMembers />
          </div>
        </div>
      </SidebarInset>
    </RoleGuard>
  );
}
