"use client";

import * as React from "react";

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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  UsersIcon,
  Settings2Icon,
  CircleHelpIcon,
  DatabaseIcon,
  FileChartColumnIcon,
  CommandIcon,
  ShoppingBasket,
  Boxes,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import CompanyLogo from "./custom/company-logo";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashbor",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Produk",
      url: "/products",
      icon: <Boxes />,
    },
    {
      title: "Pesanan",
      url: "/orders",
      icon: <ShoppingBasket />,
    },
    {
      title: "Pelanggan",
      url: "/customers",
      icon: <UsersIcon />,
    },
    {
      title: "Keuangan",
      url: "/finance",
      icon: <Wallet />,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: <Settings2Icon />,
    },
    {
      title: "Get Help",
      url: "#",
      icon: <CircleHelpIcon />,
    },
  ],
  documents: [
    {
      name: "Data Internal",
      url: "#",
      icon: <DatabaseIcon />,
    },
    {
      name: "Laporan",
      url: "/reports",
      icon: <FileChartColumnIcon />,
    },
  ],
};

export function AppSidebar({
  name,
  logoUrl,
  ...props
}: {
  name: string;
  logoUrl: string;
  props: React.ComponentProps<typeof Sidebar>;
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size={"lg"}
              className="data-[slot=sidebar-menu-button]:p-1.5 drop-shadow-sm border-t rounded-lg border-transparent shadow-[1px_1px_2px_1px_rgba(0,0,0,0.5)]"
            >
              <Link href="/dashboard" className="flex gap-2 justify-center">
                <CompanyLogo
                  loading="lazy"
                  logoUrl={logoUrl}
                  className="size-9"
                />
                <span className="text-base font-semibold">{name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator className="mx-0" />
      <SidebarContent>
        <NavMain items={data.navMain} />
        <SidebarSeparator className="mx-0" />
        <NavDocuments items={data.documents} />
        <SidebarSeparator className="mx-0" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarSeparator className="mx-0" />
      <SidebarFooter className="mt-2">
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
