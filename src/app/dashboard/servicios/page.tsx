"use client";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import ServicesTable from "@/components/services";
import { RoleGuard } from "@/components/RoleGuard";
export default function Dashtests() {
  return (
    <>
      <RoleGuard allowedRoles={["ADMINISTRADOR"]}>
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <ServicesTable />
            </div>
          </div>
        </SidebarInset>
      </RoleGuard>
    </>
  );
}
