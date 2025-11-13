import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router";

export default function DashboardLayout() {
    return (
         <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <div className="flex items-center justify-between p-1">
                        <SidebarTrigger />
                    </div>
                    <div className="flex-1 w-full overflow-y-auto pl-8 pr-8">
                        <Outlet />
                    </div>
                </SidebarInset>
            </SidebarProvider>
    )
}
