import InventoryTable from "@/components/table-test";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";

export default function Test() {
  return (
    <>
      <SidebarInset>
        <SiteHeader />

        <div className="@container/main flex flex-1 flex-col gap-2">
          <InventoryTable />
        </div>
      </SidebarInset>
    </>
  );
}
