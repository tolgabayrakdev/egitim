import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { apiUrl } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
    Users, 
    ClipboardList, 
    Package, 
    CheckCircle2, 
    Clock, 
    Send, 
    Plus,
    Activity
} from "lucide-react";
import { toast } from "sonner";

interface UserData {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: string;
    specialty?: string;
    bio?: string;
}

interface DashboardStats {
    totalRelationships?: number;
    activeRelationships?: number;
    totalTasks?: number;
    pendingTasks?: number;
    completedTasks?: number;
    submittedTasks?: number;
    totalPackages?: number;
    activePackages?: number;
}

interface RecentActivity {
    id: string;
    action_type: string;
    description: string | null;
    created_at: string;
}

interface Relationship {
    id: string;
    status: string;
}

interface Task {
    id: string;
    status: string;
}

interface Package {
    id: string;
    status: string;
}

export default function DashboardIndex() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({});
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);

    const isProfessional = user?.role === 'professional';

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(apiUrl("api/auth/me"), {
                    method: "GET",
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.user) {
                        setUser(data.user);
                    }
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoadingStats(true);
            
            // Paralel olarak tüm verileri çek
            const [relationshipsRes, tasksRes, packagesRes, activitiesRes] = await Promise.all([
                fetch(apiUrl("api/coaching"), { credentials: "include" }),
                fetch(apiUrl("api/tasks"), { credentials: "include" }),
                isProfessional ? fetch(apiUrl("api/packages"), { credentials: "include" }) : Promise.resolve(null),
                fetch(apiUrl("api/activity-logs?limit=5"), { credentials: "include" })
            ]);

            // Relationships
            if (relationshipsRes.ok) {
                const relationshipsData = await relationshipsRes.json();
                const relationships: Relationship[] = relationshipsData.relationships || [];
                setStats(prev => ({
                    ...prev,
                    totalRelationships: relationships.length,
                    activeRelationships: relationships.filter((r) => r.status === 'active').length
                }));
            }

            // Tasks
            if (tasksRes.ok) {
                const tasksData = await tasksRes.json();
                const tasks: Task[] = tasksData.tasks || [];
                setStats(prev => ({
                    ...prev,
                    totalTasks: tasks.length,
                    pendingTasks: tasks.filter((t) => t.status === 'pending').length,
                    completedTasks: tasks.filter((t) => t.status === 'completed').length,
                    submittedTasks: tasks.filter((t) => t.status === 'submitted').length
                }));
            }

            // Packages (sadece profesyonel için)
            if (isProfessional && packagesRes) {
                if (packagesRes.ok) {
                    const packagesData = await packagesRes.json();
                    const packages: Package[] = packagesData.packages || [];
                    setStats(prev => ({
                        ...prev,
                        totalPackages: packages.length,
                        activePackages: packages.filter((p) => p.status === 'active').length
                    }));
                }
            }

            // Recent Activities
            if (activitiesRes.ok) {
                const activitiesData = await activitiesRes.json();
                setRecentActivities(activitiesData.logs?.slice(0, 5) || []);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error("Dashboard verileri yüklenirken bir hata oluştu");
        } finally {
            setLoadingStats(false);
        }
    }, [isProfessional]);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user, fetchDashboardData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <div className="text-muted-foreground">Yükleniyor...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-muted-foreground">Kullanıcı bilgileri yüklenemedi</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Hoş Geldiniz</h1>
                    <Badge 
                        variant={user.role === 'professional' ? 'default' : 'secondary'}
                        className="text-sm px-3 py-1 w-fit"
                    >
                        {user.role === 'professional' ? 'Profesyonel' : 'Katılımcı'}
                    </Badge>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                    {user.first_name} {user.last_name}, Edivora sistemine hoş geldiniz.
                </p>
            </div>

            <Separator />

            {/* İstatistikler */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                        <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">İstatistikler</h2>
                        <p className="text-sm text-muted-foreground">
                            Hesap özetiniz ve genel durumunuz
                        </p>
                    </div>
                </div>
                
                <Separator />
                
                {loadingStats ? (
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i} className="animate-pulse bg-transparent border shadow-none">
                                <CardHeader className="space-y-0 pb-2">
                                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                                    <div className="h-8 bg-muted rounded w-1/2"></div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Profesyonel için istatistikler */}
                    {isProfessional ? (
                        <>
                            <Card className="bg-transparent border shadow-none">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Toplam Koçluk İlişkileri
                                    </CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.totalRelationships || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.activeRelationships || 0} aktif
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-transparent border shadow-none">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Toplam Görevler
                                    </CardTitle>
                                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.totalTasks || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.submittedTasks || 0} gönderildi
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-transparent border shadow-none">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Bekleyen Görevler
                                    </CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.pendingTasks || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Değerlendirme bekliyor
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-transparent border shadow-none">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Toplam Paketler
                                    </CardTitle>
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.totalPackages || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.activePackages || 0} aktif
                                    </p>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <>
                            {/* Participant için istatistikler */}
                            <Card className="bg-transparent border shadow-none">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Aktif Koçluk İlişkileri
                                    </CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.activeRelationships || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Devam eden koçluk
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-transparent border shadow-none">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Atanan Görevler
                                    </CardTitle>
                                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.totalTasks || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.pendingTasks || 0} bekliyor
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-transparent border shadow-none">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Tamamlanan Görevler
                                    </CardTitle>
                                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.completedTasks || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Başarıyla tamamlandı
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-transparent border shadow-none">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Gönderilen Görevler
                                    </CardTitle>
                                    <Send className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.submittedTasks || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Geri bildirim bekliyor
                                    </p>
                                </CardContent>
                            </Card>
                        </>
                    )}
                    </div>
                )}
            </div>

            {/* Hızlı İşlemler & Son Aktiviteler */}
            <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2">
                {/* Quick Actions */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                            <Plus className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Hızlı İşlemler</h2>
                            <p className="text-sm text-muted-foreground">
                                Sık kullanılan işlemlere hızlı erişim
                            </p>
                        </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                        {isProfessional ? (
                            <>
                                <Button asChild variant="outline" className="w-full justify-start">
                                    <Link to="/dashboard/packages">
                                        <Package className="mr-2 h-4 w-4" />
                                        Yeni Paket Oluştur
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full justify-start">
                                    <Link to="/dashboard/coaching">
                                        <Users className="mr-2 h-4 w-4" />
                                        Koçluk İlişkisi Oluştur
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full justify-start">
                                    <Link to="/dashboard/tasks">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Yeni Görev Ata
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full justify-start">
                                    <Link to="/dashboard/invitations">
                                        <Send className="mr-2 h-4 w-4" />
                                        Davet Gönder
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button asChild variant="outline" className="w-full justify-start">
                                    <Link to="/dashboard/tasks">
                                        <ClipboardList className="mr-2 h-4 w-4" />
                                        Görevlerimi Görüntüle
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full justify-start text-sm sm:text-base">
                                    <Link to="/dashboard/coaching">
                                        <Users className="mr-2 h-4 w-4" />
                                        Koçluk İlişkilerim
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2">
                                <Activity className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Son Aktiviteler</h2>
                                <p className="text-sm text-muted-foreground">
                                    Son 5 aktivite
                                </p>
                            </div>
                        </div>
                        <Button asChild variant="ghost" size="sm">
                            <Link to="/dashboard/activity-logs">
                                <Activity className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                    
                    <Separator />
                    
                    <div>
                        {loadingStats ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 animate-pulse">
                                        <div className="h-8 w-8 rounded-full bg-muted"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 bg-muted rounded w-3/4"></div>
                                            <div className="h-2 bg-muted rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : recentActivities.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Henüz aktivite bulunmuyor</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentActivities.map((activity) => {
                                    const createdAt = new Date(activity.created_at);
                                    return (
                                        <div key={activity.id} className="flex items-start gap-3">
                                            <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                                                <Activity className="h-3 w-3 text-primary" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium">
                                                    {activity.description || activity.action_type}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {createdAt.toLocaleDateString("tr-TR")} {createdAt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
