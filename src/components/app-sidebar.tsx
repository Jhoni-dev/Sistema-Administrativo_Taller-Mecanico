"use client";
import * as React from "react";
import Link from "next/link";
import {
  IconHome,
  IconPackage,
  IconFileText,
  IconCalendar,
  IconUsers,
  IconHelp,
  IconReportMoney,
  IconServicemark,
} from "@tabler/icons-react";
import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/usercontext";
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const data = {
    user: {
      name: user?.name || "Invitado",
      email: user?.email || "Sin sesión",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      { title: "Dashboard", url: "/dashboard", icon: IconHome },
      {
        title: "Inventario",
        url: "/dashboard/inventario",
        icon: IconPackage,
      },
      {
        title: "Servicios",
        url: "/dashboard/servicios",
        icon: IconServicemark,
      },
      { title: "Citas", url: "/dashboard/citas", icon: IconCalendar },
      { title: "Equipo", url: "/dashboard/equipo", icon: IconUsers },
      {
        title: "Facturas",
        url: "/dashboard/facturacion",
        icon: IconReportMoney,
      },
    ],
    documents: [
      {
        name: "Gestion de documentos",
        url: "/dashboard/documentos",
        icon: IconFileText,
      },
    ],
    navSecondary: [{ title: "Guía", url: "/guia", icon: IconHelp }],
  };
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* HEADER */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/" className="flex items-center gap-2">
                <img src="/foto.png" alt="logo" className="w-5 rounded-full shadow dark:grayscale" />
                <span className="text-base font-semibold">
                  SwiftService
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      {/* CONTENIDO PRINCIPAL */}
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments
          items={data.documents.map((item) => ({
            ...item,
            component: (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton>
                  <Link href={item.url} className="flex items-center gap-2">
                    <item.icon className="!size-5" />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ),
          }))}
        />
        <NavSecondary
          items={data.navSecondary.map((item) => ({
            ...item,
            component: (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton>
                  <Link href={item.url} className="flex items-center gap-2">
                    <item.icon className="!size-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ),
          }))}
          className="mt-auto"
        />
      </SidebarContent>
      {/* FOOTER */}
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
