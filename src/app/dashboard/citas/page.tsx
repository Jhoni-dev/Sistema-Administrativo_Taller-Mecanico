"use client";
import React, { useState } from "react";
import Calendar from "@/components/calendar";
import { SiteHeader } from "@/components/site-header";
import AppointmentsTable from "@/components/table-test";
import ClientVehicleManager from "@/components/client-vehiculo";
import { SidebarInset } from "@/components/ui/sidebar";
import { RoleGuard } from "@/components/RoleGuard";
import { Calendar as CalendarIcon, Clock, Users } from "lucide-react";

export default function Page() {
  const [activeTab, setActiveTab] = useState<
    "calendar" | "other" | "clientes" | "autos"
  >("calendar");

  const tabs = [
    {
      id: "calendar" as const,
      label: "Calendario",
      icon: CalendarIcon,
    },
    {
      id: "other" as const,
      label: "Citas",
      icon: Clock,
    },
    {
      id: "clientes" as const,
      label: "Clientes",
      icon: Users,
    },
  ];

  return (
    <SidebarInset>
      <SiteHeader />
      <div className="flex flex-1 flex-col bg-background">
        {/* Tabs */}
        <div className="border-b border-border bg-background">
          <div className="flex px-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`
                    relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                    hover:text-foreground
                    ${
                      activeTab === tab.id
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  `}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="@container/main flex flex-1 flex-col gap-2 p-4">
          {activeTab === "calendar" && (
            <div className="px-4 lg:px-2">
              <Calendar />
            </div>
          )}

          {activeTab === "other" && (
            <div className="px-4 lg:px-2">
              <RoleGuard allowedRoles={["ADMINISTRADOR"]}>
                <AppointmentsTable />
              </RoleGuard>
            </div>
          )}

          {activeTab === "clientes" && (
            <div className="px-4 lg:px-2">
              <ClientVehicleManager />
            </div>
          )}
        </div>
      </div>
    </SidebarInset>
  );
}