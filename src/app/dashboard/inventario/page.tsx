"use client";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import InventoryTable from "@/components/table-me";
import { RoleGuard } from "@/components/RoleGuard";
export default function Dashtests() {
  return (
    <>
      <RoleGuard allowedRoles={["ADMINISTRADOR"]}>
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <InventoryTable />
            </div>
          </div>
        </SidebarInset>
      </RoleGuard>
    </>
  );
}
