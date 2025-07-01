"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Table2, Settings, Globe, LogOut } from "lucide-react";
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary">
              <Globe className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-semibold font-headline text-foreground group-data-[collapsible=icon]:hidden">
              DarkWeb Insights
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/dashboard"}
                tooltip={{ children: "Dashboard" }}
              >
                <Link href="/dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/sources")}
                tooltip={{ children: "Sources" }}
              >
                <Link href="/sources">
                  <Table2 />
                  <span>Sources</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/settings"}
                tooltip={{ children: "Settings" }}
              >
                <Link href="#">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <div className="flex items-center gap-3 p-2 transition-colors duration-200 rounded-lg hover:bg-sidebar-accent">
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://placehold.co/40x40" data-ai-hint="user avatar" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium truncate text-foreground">Analyst</span>
                <span className="text-xs truncate text-muted-foreground">analyst@dw.local</span>
              </div>
              <Button variant="ghost" size="icon" className="w-8 h-8 group-data-[collapsible=icon]:hidden">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 sm:p-6 lg:p-8 relative">
            <div className="absolute block top-4 right-4 md:hidden">
                <SidebarTrigger />
            </div>
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
