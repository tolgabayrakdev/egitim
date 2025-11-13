import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AuthProvider from "@/providers/auth-provider";
import { Outlet } from "react-router";

export default function DashboardLayout() {
    return (
        <AuthProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <div className="flex items-center gap-4 p-1">
                        <SidebarTrigger />
                        <div className="flex-1 w-full overflow-y-auto pr-8">
                            <Outlet />
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </AuthProvider>

    )
}
