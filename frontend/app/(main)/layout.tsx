"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from 'next/link';
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
  SidebarRail,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { LayoutDashboard, Table2, Settings, Globe, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function AppSidebar() {
  const pathname = usePathname();
  const { state, setOpen } = useSidebar();
  const [isSourcesOpen, setIsSourcesOpen] = React.useState(pathname.startsWith("/sources"));

  const handleSourcesClick = () => {
    if (state === 'collapsed') {
      setOpen(true);
      setIsSourcesOpen(true);
    } else {
      setIsSourcesOpen(prev => !prev);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarRail />
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
            <Collapsible open={isSourcesOpen} onOpenChange={setIsSourcesOpen}>
              <SidebarMenuButton
                onClick={handleSourcesClick}
                isActive={pathname.startsWith("/sources")}
                tooltip={{ children: "Sources" }}
                data-state={isSourcesOpen ? "open" : "closed"}
              >
                <Table2 />
                <span className="flex-1 group-data-[collapsible=icon]:hidden">Sources</span>
                <ChevronRight className={`w-4 h-4 transition-transform duration-200 group-data-[collapsible=icon]:hidden ${isSourcesOpen ? "rotate-90" : ""}`} />
              </SidebarMenuButton>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={pathname === "/sources"}>
                      <Link href="/sources">All Sources</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild href="/sources/ransomware">
                      <Link href="/sources/ransomware">Ransomware</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={pathname === "/sources/forum"}>
                      <Link href="/sources/forum">Forums</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild href="#">
                      <Link href="#">Telegram</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/admin"}
              tooltip={{ children: "Admin" }}
            >
              <Link href="/admin">
                <Settings />
                <span>Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/advanced-search"}
              tooltip={{ children: "Búsqueda avanzada" }}
            >
              <Link href="/advanced-search">
                <span>🔍</span>
                <span className="ml-2">Búsqueda avanzada</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {/* Pie de página vacío */}
      </SidebarFooter>
    </Sidebar>
  )
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
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
