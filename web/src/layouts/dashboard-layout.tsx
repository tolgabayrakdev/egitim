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
                    <div className="flex items-center justify-between p-1">
                        <SidebarTrigger />
                    </div>
                    <div className="flex-1 w-full overflow-y-auto pl-8 pr-8">
                        <div className="max-w-4xl mx-auto">
                            <Outlet />
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </AuthProvider>
    )
}
