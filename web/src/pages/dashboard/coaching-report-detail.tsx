import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { apiUrl } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
    FileText, 
    ArrowLeft, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    XCircle,
    AlertCircle,
    Send,
    User,
    Package,
    TrendingUp
} from "lucide-react";
import { toast } from "sonner";

interface Task {
    id: string;
    title: string;
    description: string | null;
    status: string;
    due_date: string | null;
    created_at: string;
    updated_at: string;
    submission_count: string;
    last_submission_date: string | null;
}

interface TaskStatusDistribution {
    status: string;
    count: string;
}

interface ReportData {
    relationship: {
        id: string;
        package_title: string;
        participant_first_name?: string;
        participant_last_name?: string;
        participant_email?: string;
        professional_first_name?: string;
        professional_last_name?: string;
        professional_email?: string;
        status: string;
        started_at: string;
        completed_at: string | null;
    };
    tasks: Task[];
    taskStatusDistribution: TaskStatusDistribution[];
    avgCompletionDays: number;
}

export default function CoachingReportDetail() {
    const { relationshipId } = useParams<{ relationshipId: string }>();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [user, setUser] = useState<any>(null);

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
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        const fetchReport = async () => {
            if (!relationshipId) return;

            try {
                setLoading(true);
                const response = await fetch(apiUrl(`api/coaching/${relationshipId}/report`), {
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setReportData(data.report);
                    } else {
                        toast.error("Rapor yüklenemedi");
                    }
                } else {
                    toast.error("Rapor yüklenirken bir hata oluştu");
                }
            } catch (error) {
                console.error("Error fetching report:", error);
                toast.error("Rapor yüklenirken bir hata oluştu");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchReport();
        }
    }, [relationshipId, user]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Beklemede</Badge>;
            case 'in_progress':
                return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Devam Ediyor</Badge>;
            case 'submitted':
                return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Gönderildi</Badge>;
            case 'completed':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Tamamlandı</Badge>;
            case 'overdue':
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Gecikmiş</Badge>;
            case 'cancelled':
                return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">İptal Edildi</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getRelationshipStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Aktif</Badge>;
            case 'completed':
                return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Tamamlandı</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">İptal Edildi</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

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

    if (!reportData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Rapor bulunamadı</p>
                    <Button asChild variant="outline">
                        <Link to="/dashboard/coaching">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Koçluk İlişkilerine Dön
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const { relationship, tasks, taskStatusDistribution, avgCompletionDays } = reportData;
    const isProfessional = user?.role === 'professional';
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    return (
        <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
            {/* Header */}
            <div className="space-y-4">
                <Button asChild variant="ghost" className="w-fit">
                    <Link to="/dashboard/coaching-reports">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Raporlara Dön
                    </Link>
                </Button>

                <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Detaylı Koçluk Raporu</h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                {relationship.package_title}
                            </p>
                        </div>
                        {getRelationshipStatusBadge(relationship.status)}
                    </div>
                </div>
            </div>

            <Separator />

            {/* İlişki Bilgileri */}
            <Card className="bg-transparent border shadow-none">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        İlişki Bilgileri
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">
                                {isProfessional ? 'Katılımcı' : 'Profesyonel'}
                            </p>
                            <p className="font-medium">
                                {isProfessional
                                    ? `${relationship.participant_first_name || ''} ${relationship.participant_last_name || ''}`.trim() || relationship.participant_email
                                    : `${relationship.professional_first_name || ''} ${relationship.professional_last_name || ''}`.trim() || relationship.professional_email}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Paket</p>
                            <p className="font-medium flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                {relationship.package_title}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Başlangıç Tarihi</p>
                            <p className="font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {new Date(relationship.started_at).toLocaleDateString("tr-TR", {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                        {relationship.completed_at && (
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Tamamlanma Tarihi</p>
                                <p className="font-medium flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {new Date(relationship.completed_at).toLocaleDateString("tr-TR", {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Özet İstatistikler */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-transparent border shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Görevler</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tasks.length}</div>
                    </CardContent>
                </Card>

                <Card className="bg-transparent border shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                    </CardContent>
                </Card>

                <Card className="bg-transparent border shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tamamlanma Oranı</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
                        <Progress value={completionRate} className="mt-2" />
                    </CardContent>
                </Card>

                <Card className="bg-transparent border shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ort. Tamamlanma Süresi</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {avgCompletionDays > 0 
                                ? `${Math.round(avgCompletionDays)} gün`
                                : 'N/A'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Görev Durum Dağılımı */}
            {taskStatusDistribution.length > 0 && (
                <Card className="bg-transparent border shadow-none">
                    <CardHeader>
                        <CardTitle className="text-lg">Görev Durum Dağılımı</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            {taskStatusDistribution.map((dist) => (
                                <div key={dist.status} className="text-center p-4 border rounded-lg">
                                    <p className="text-2xl font-bold">{dist.count}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {getStatusBadge(dist.status).props.children}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Görev Listesi */}
            <Card className="bg-transparent border shadow-none">
                <CardHeader>
                    <CardTitle className="text-lg">Görevler</CardTitle>
                </CardHeader>
                <CardContent>
                    {tasks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Henüz görev bulunmuyor</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-semibold">{task.title}</h3>
                                                        {getStatusBadge(task.status)}
                                                    </div>
                                                    {task.description && (
                                                        <p className="text-sm text-muted-foreground mb-2">
                                                            {task.description}
                                                        </p>
                                                    )}
                                                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>
                                                                Oluşturulma: {new Date(task.created_at).toLocaleDateString("tr-TR")}
                                                            </span>
                                                        </div>
                                                        {task.due_date && (
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                <span>
                                                                    Bitiş: {new Date(task.due_date).toLocaleDateString("tr-TR")}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {parseInt(task.submission_count) > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <Send className="h-3 w-3" />
                                                                <span>
                                                                    {task.submission_count} gönderim
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            className="w-full sm:w-auto"
                                        >
                                            <Link to={`/dashboard/tasks?task=${task.id}`}>
                                                Detayları Görüntüle
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

