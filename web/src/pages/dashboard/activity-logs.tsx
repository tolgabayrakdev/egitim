import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { apiUrl } from "@/lib/api";
import { toast } from "sonner";
import { Activity, Clock, User, ClipboardList, Send, CheckCircle2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityLog {
    id: string;
    user_id: string;
    target_user_id: string | null;
    entity_type: string;
    entity_id: string;
    action_type: string;
    description: string | null;
    created_at: string;
    user_first_name?: string;
    user_last_name?: string;
    target_user_first_name?: string;
    target_user_last_name?: string;
}

export default function ActivityLogs() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string>("");
    const [userId, setUserId] = useState<string>("");
    const [filter, setFilter] = useState<'all' | 'my_actions' | 'targeted_me'>('all');

    const fetchUserInfo = async () => {
        try {
            const response = await fetch(apiUrl("api/auth/me"), {
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                setUserRole(data.user?.role || "");
                setUserId(data.user?.id || "");
            }
        } catch {
            console.error("Kullanıcı bilgisi alınamadı");
        }
    };

    const fetchActivityLogs = async () => {
        try {
            setLoading(true);
            const response = await fetch(apiUrl("api/activity-logs?limit=100"), {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Aktivite logları yüklenemedi");
            }

            const data = await response.json();
            setLogs(data.logs || []);
        } catch {
            toast.error("Aktivite logları yüklenirken bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserInfo();
        fetchActivityLogs();
    }, []);

    const getActionIcon = (actionType: string) => {
        switch (actionType) {
            case 'coaching_relationship_created':
                return User;
            case 'task_created':
                return ClipboardList;
            case 'task_submitted':
                return Send;
            case 'task_reviewed':
                return CheckCircle2;
            default:
                return Activity;
        }
    };

    const getActionLabel = (actionType: string) => {
        switch (actionType) {
            case 'coaching_relationship_created':
                return 'Koçluk İlişkisi Oluşturuldu';
            case 'task_created':
                return 'Görev Oluşturuldu';
            case 'task_submitted':
                return 'Görev Gönderildi';
            case 'task_reviewed':
                return 'Görev Değerlendirildi';
            default:
                return actionType;
        }
    };

    const getEntityTypeLabel = (entityType: string) => {
        switch (entityType) {
            case 'coaching_relationship':
                return 'Koçluk İlişkisi';
            case 'task':
                return 'Görev';
            case 'task_submission':
                return 'Görev Gönderimi';
            default:
                return entityType;
        }
    };

    const isProfessional = userRole === 'professional';

    // Filtreleme
    const filteredLogs = logs.filter(log => {
        if (filter === 'all') return true;
        if (filter === 'my_actions') {
            // Benim yaptığım aktiviteler
            return log.user_id === userId;
        }
        if (filter === 'targeted_me' && isProfessional) {
            // Bana yapılan aktiviteler (target_user_id benim id'm)
            return log.target_user_id === userId;
        }
        return true;
    });

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

    return (
        <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Aktivite Logları</h1>
                <p className="text-muted-foreground">
                    Sistemdeki tüm aktivitelerinizi görüntüleyin
                </p>
            </div>

            <Separator />

            {/* Filtreler - Sadece profesyonel için */}
            {isProfessional && logs.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 flex-wrap">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Filtrele:</span>
                    <Button
                        variant={filter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("all")}
                        className="gap-2"
                    >
                        Tümü
                        <span className="ml-1 text-xs opacity-70">({logs.length})</span>
                    </Button>
                    <Button
                        variant={filter === "my_actions" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("my_actions")}
                        className="gap-2"
                    >
                        Sizin Yaptıklarınız
                        <span className="ml-1 text-xs opacity-70">
                            ({logs.filter(log => log.user_id === userId).length})
                        </span>
                    </Button>
                    <Button
                        variant={filter === "targeted_me" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("targeted_me")}
                        className="gap-2"
                    >
                        Size Yapılanlar
                        <span className="ml-1 text-xs opacity-70">
                            ({logs.filter(log => log.target_user_id === userId).length})
                        </span>
                    </Button>
                </div>
            )}

            {/* Activity Logs List */}
            {filteredLogs.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/50">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground font-medium mb-1">
                        Henüz aktivite logu bulunmuyor
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Sistem aktiviteleriniz burada görüntülenecek
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredLogs.map((log) => {
                        const isMyAction = log.user_id === userId;
                        const isTargetedMe = log.target_user_id === userId;
                        const ActionIcon = getActionIcon(log.action_type);
                        const createdAt = new Date(log.created_at);

                        return (
                            <div
                                key={log.id}
                                className="p-4 sm:p-6 border rounded-lg hover:bg-muted/50 transition-colors space-y-3"
                            >
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                                        <ActionIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-2 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <h3 className="font-semibold text-base sm:text-lg truncate">
                                                {getActionLabel(log.action_type)}
                                            </h3>
                                            <span className="px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                                                {getEntityTypeLabel(log.entity_type)}
                                            </span>
                                            {isProfessional && (
                                                <>
                                                    {isMyAction && (
                                                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                            Sizin Yaptığınız
                                                        </span>
                                                    )}
                                                    {isTargetedMe && (
                                                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                            Size Yapılan
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        {log.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {log.description}
                                            </p>
                                        )}
                                        {isProfessional && (
                                            <div className="text-xs text-muted-foreground">
                                                {isMyAction && log.target_user_first_name && (
                                                    <span>
                                                        Katılımcı: <strong>{log.target_user_first_name} {log.target_user_last_name}</strong>
                                                    </span>
                                                )}
                                                {isTargetedMe && log.user_first_name && (
                                                    <span>
                                                        Yapan: <strong>{log.user_first_name} {log.user_last_name}</strong>
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {createdAt.toLocaleDateString("tr-TR")} {createdAt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

