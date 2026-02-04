"use client";

import {
  IconChartBar,
  IconFolder,
  IconListDetails,
  IconUsers,
} from "@tabler/icons-react";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth-context";
import { BookA, DollarSign, Flag, Users } from "lucide-react";
import Link from "next/link";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const data = {
  navMain: [
    {
      title: "Utilisateurs",
      url: "/users",
      icon: Users,
    },
    {
      title: "Provinces",
      url: "/provinces",
      icon: Flag,
    },
    {
      title: "Sections",
      url: "/sections",
      icon: IconChartBar,
    },
    {
      title: "Abonnements",
      url: "/subscriptions",
      icon: DollarSign,
    },
    {
      title: "Cours",
      url: "/courses",
      icon: IconListDetails,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard">
                <BookA className="size-5!" />
                <span className="text-base font-semibold">EduBooster</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
