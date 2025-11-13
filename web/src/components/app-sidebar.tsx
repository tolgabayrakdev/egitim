import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router"
import { Calendar, Home, Inbox, Search, Settings, User2, LogOut, Bell } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { apiUrl } from "@/lib/api"
import { ModeToggle } from "@/components/mode-toggle"

// Menu items.
const items = [
  {
    title: "Ana Sayfa",
    url: "/",
    icon: Home,
  },
  {
    title: "Gelen Kutusu",
    url: "/inbox",
    icon: Inbox,
  },
  {
    title: "Takvim",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Ara",
    url: "/search",
    icon: Search,
  }
]

interface UserResponse {
  success: boolean
  message: string
  user: {
    id: number
    first_name: string
    last_name: string
    email: string
    [key: string]: unknown
  }
}

export function AppSidebar() {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(apiUrl("api/auth/me"), {
          method: "GET",
          credentials: "include",
        })

        if (response.ok) {
          const contentType = response.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json()
            setUser(data)
          } else {
            // Response is not JSON, likely HTML error page
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const logout = async () => {
    try {
      await fetch(apiUrl("api/auth/logout"), {
        method: "POST",
        credentials: "include",
      })
      setUser(null)
      navigate("/sign-in")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-3 py-2">
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Edivora
            </SidebarGroupLabel>
            <ModeToggle />
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {items.map((item) => {
                const isActive = location.pathname === item.url || 
                  (item.url !== "/" && location.pathname.startsWith(item.url))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className="relative w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent/50"
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r" />
                        )}
                        <item.icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-2 py-2">
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupContent>
            {loading ? (
              <div className="flex items-center gap-2 p-2">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                <div className="flex-1">
                  <div className="h-3 bg-muted rounded animate-pulse mb-1" />
                  <div className="h-2.5 bg-muted rounded animate-pulse w-3/4" />
                </div>
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 h-auto p-2 hover:bg-sidebar-accent rounded-lg transition-all duration-200"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent shrink-0">
                      <User2 className="h-4 w-4 text-sidebar-foreground/70" />
                    </div>
                    <div className="flex flex-col items-start text-left min-w-0 flex-1">
                      <span className="text-xs font-medium text-sidebar-foreground truncate w-full">
                        {user.user?.first_name} {user.user?.last_name}
                      </span>
                      <span className="text-[10px] text-sidebar-foreground/60 truncate w-full">
                        {user.user?.email}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings/account" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Hesap Ayarları
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings/notifications" className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Bildirim Ayarları
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="p-2 text-center text-xs text-sidebar-foreground/60">
                Kullanıcı bilgileri yüklenemedi
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  )
}