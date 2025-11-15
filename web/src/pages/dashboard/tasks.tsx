import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { apiUrl } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash2, CheckCircle2, Clock, Send, MessageSquare, FileText, ClipboardList, ChevronDown, TrendingUp, AlertCircle, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams, Link } from "react-router";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface TaskData {
    id: string;
    coaching_relationship_id: string;
    assigned_by: string;
    assigned_to: string;
    title: string;
    description: string | null;
    due_date: string | null;
    status: 'pending' | 'in_progress' | 'submitted' | 'completed' | 'overdue' | 'cancelled';
    created_at: string;
    participant_first_name?: string;
    participant_last_name?: string;
    professional_first_name?: string;
    professional_last_name?: string;
    submission_count?: number;
}

interface CoachingRelationship {
    id: string;
    package_title: string;
    participant_id?: string;
    participant_first_name?: string;
    participant_last_name?: string;
    participant_email?: string;
    status?: 'active' | 'completed' | 'cancelled';
}

export default function Tasks() {
    const [searchParams] = useSearchParams();
    const relationshipId = searchParams.get('relationship');
    
    const [tasks, setTasks] = useState<TaskData[]>([]);
    const [relationships, setRelationships] = useState<CoachingRelationship[]>([]);
    const [selectedParticipantId, setSelectedParticipantId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{ taskId: string; newStatus: string } | null>(null);
    const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
    const [submissions, setSubmissions] = useState<Array<{
        id: string;
        submission_text: string | null;
        attachment_url: string | null;
        status: string;
        feedback: string | null;
        created_at: string;
    }>>([]);
    const [formData, setFormData] = useState({
        participant_id: "",
        title: "",
        description: "",
        due_date: ""
    });
    const [submissionData, setSubmissionData] = useState({
        submission_text: "",
        attachment_url: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [userRole, setUserRole] = useState<string>("");
    const [showCompletedTasks, setShowCompletedTasks] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            const url = relationshipId 
                ? apiUrl(`api/tasks?coaching_relationship_id=${relationshipId}`)
                : apiUrl("api/tasks");
            
            const response = await fetch(url, {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Görevler yüklenemedi");
            }

            const data = await response.json();
            setTasks(data.tasks || []);
        } catch {
            toast.error("Görevler yüklenirken bir hata oluştu");
        } finally {
            setLoading(false);
        }
    }, [relationshipId]);

    const fetchRelationships = useCallback(async () => {
        try {
            const response = await fetch(apiUrl("api/coaching"), {
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                setRelationships(data.relationships || []);
            }
        } catch {
            console.error("Koçluk ilişkileri yüklenemedi");
        }
    }, []);

    const fetchUserInfo = async () => {
        try {
            const response = await fetch(apiUrl("api/auth/me"), {
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                setUserRole(data.user?.role || "");
            }
        } catch {
            console.error("Kullanıcı bilgisi alınamadı");
        }
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    useEffect(() => {
        if (userRole) {
            if (userRole === 'professional') {
                fetchRelationships();
            }
            fetchTasks();
        }
    }, [userRole, fetchTasks, fetchRelationships]);

    // Sayfa değiştiğinde scroll to top
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    // Filtre değiştiğinde ilk sayfaya dön
    useEffect(() => {
        setCurrentPage(1);
    }, [showCompletedTasks, selectedParticipantId, relationshipId]);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // URL'de relationship varsa onu kullan, yoksa seçilen katılımcının aktif ilişkisini bul
            let participantRelationship: CoachingRelationship | undefined;
            
            if (relationshipId) {
                participantRelationship = relationships.find(r => r.id === relationshipId && r.status === 'active');
            } else {
                participantRelationship = relationships.find(
                    r => r.participant_id === formData.participant_id && r.status === 'active'
                );
            }

            if (!participantRelationship) {
                toast.error("Aktif koçluk ilişkisi bulunamadı");
                setSubmitting(false);
                return;
            }

            const payload: {
                coaching_relationship_id: string;
                title: string;
                description?: string;
                due_date?: string;
            } = {
                coaching_relationship_id: participantRelationship.id,
                title: formData.title
            };

            if (formData.description) {
                payload.description = formData.description;
            }
            if (formData.due_date) {
                payload.due_date = formData.due_date;
            }

            const response = await fetch(apiUrl("api/tasks"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Görev oluşturulamadı");
            }

            toast.success("Görev oluşturuldu");
            setIsDialogOpen(false);
            setFormData({ participant_id: "", title: "", description: "", due_date: "" });
            fetchTasks();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Bir hata oluştu";
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitTask = async (taskId: string) => {
        if (!submissionData.submission_text && !submissionData.attachment_url) {
            toast.error("Gönderim metni veya dosya gereklidir");
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(apiUrl(`api/tasks/${taskId}/submit`), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(submissionData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Görev gönderilemedi");
            }

            toast.success("Görev başarıyla gönderildi");
            setIsSubmissionDialogOpen(false);
            setSubmissionData({ submission_text: "", attachment_url: "" });
            fetchTasks();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Bir hata oluştu";
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewSubmissions = async (taskId: string) => {
        try {
            const response = await fetch(apiUrl(`api/tasks/${taskId}/submissions`), {
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                setSubmissions(data.submissions || []);
                setIsSubmissionDialogOpen(true);
            }
        } catch {
            toast.error("Gönderimler yüklenemedi");
        }
    };

    const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
        // Completed veya cancelled için onay iste
        if (newStatus === 'completed' || newStatus === 'cancelled') {
            setPendingStatusUpdate({ taskId, newStatus });
            setIsConfirmDialogOpen(true);
            return;
        }

        // Diğer durumlar için direkt güncelle
        await performStatusUpdate(taskId, newStatus);
    };

    const performStatusUpdate = async (taskId: string, newStatus: string) => {
        try {
            const response = await fetch(apiUrl(`api/tasks/${taskId}`), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Görev durumu güncellenemedi");
            }

            const statusLabel = newStatus === 'completed' ? 'Tamamlandı' : newStatus === 'cancelled' ? 'İptal Edildi' : 'Güncellendi';
            toast.success(`Görev ${statusLabel.toLowerCase()} olarak işaretlendi`);
            fetchTasks();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Bir hata oluştu";
            toast.error(errorMessage);
        }
    };

    const handleConfirmStatusUpdate = async () => {
        if (pendingStatusUpdate) {
            await performStatusUpdate(pendingStatusUpdate.taskId, pendingStatusUpdate.newStatus);
            setIsConfirmDialogOpen(false);
            setPendingStatusUpdate(null);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm("Bu görevi silmek istediğinize emin misiniz?")) {
            return;
        }

        try {
            const response = await fetch(apiUrl(`api/tasks/${taskId}`), {
                method: "DELETE",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Görev silinemedi");
            }

            toast.success("Görev silindi");
            fetchTasks();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Bir hata oluştu";
            toast.error(errorMessage);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock };
            case 'in_progress':
                return { label: 'Devam Ediyor', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Clock };
            case 'submitted':
                return { label: 'Gönderildi', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: Send };
            case 'completed':
                return { label: 'Tamamlandı', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle2 };
            case 'overdue':
                return { label: 'Gecikmiş', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: Clock };
            case 'cancelled':
                return { label: 'İptal Edildi', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', icon: Clock };
            default:
                return { label: status, color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', icon: Clock };
        }
    };

    const getStatusOptions = (currentStatus: string) => {
        // Tamamlanmış veya iptal edilmiş görevler için seçenek gösterilmez
        if (currentStatus === 'completed' || currentStatus === 'cancelled') {
            return [];
        }

        const allStatuses = [
            { value: 'pending', label: 'Beklemede' },
            { value: 'in_progress', label: 'Devam Ediyor' },
            { value: 'submitted', label: 'Gönderildi' },
            { value: 'completed', label: 'Tamamlandı' },
            { value: 'overdue', label: 'Gecikmiş' },
            { value: 'cancelled', label: 'İptal Edildi' },
        ];
        return allStatuses.filter(status => status.value !== currentStatus);
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

    const isProfessional = userRole === 'professional';

    // Benzersiz katılımcıları çıkar (professional için)
    const uniqueParticipants = isProfessional 
        ? Array.from(
            new Map(
                relationships
                    .filter(r => r.participant_id)
                    .map(r => [
                        r.participant_id!,
                        {
                            id: r.participant_id!,
                            name: `${r.participant_first_name || ''} ${r.participant_last_name || ''}`.trim() || r.participant_email || 'Bilinmeyen',
                            email: r.participant_email
                        }
                    ])
            ).values()
        )
        : [];

    // URL'de relationship varsa, o ilişkiye ait görevleri göster
    // Yoksa ve professional ise, seçilen katılımcıya göre filtrele
    let filteredTasks = relationshipId 
        ? tasks // URL'de relationship varsa tüm görevler zaten o ilişkiye ait
        : (isProfessional && selectedParticipantId && relationships.length > 0
            ? tasks.filter((task) => {
                const taskRelationship = relationships.find(r => r.id === task.coaching_relationship_id);
                return taskRelationship?.participant_id === selectedParticipantId;
            })
            : tasks);

    // Geçmiş görevleri (completed, cancelled) varsayılan olarak gizle
    if (!showCompletedTasks) {
        filteredTasks = filteredTasks.filter(task => 
            task.status !== 'completed' && task.status !== 'cancelled'
        );
    }

    // Pagination hesaplamaları
    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

    // İstatistikleri hesapla (tüm görevler üzerinden - toggle için)
    const allTasksForStats = relationshipId 
        ? tasks
        : (isProfessional && selectedParticipantId && relationships.length > 0
            ? tasks.filter((task) => {
                const taskRelationship = relationships.find(r => r.id === task.coaching_relationship_id);
                return taskRelationship?.participant_id === selectedParticipantId;
            })
            : tasks);

    // Toplam her zaman tüm görevlerin sayısı olmalı
    const totalTasks = allTasksForStats.length;
    const completedTasks = allTasksForStats.filter(t => t.status === 'completed').length;
    const cancelledTasks = allTasksForStats.filter(t => t.status === 'cancelled').length;
    
    // Aktif görevler (filtrelenmiş listede gösterilen)
    const pendingTasks = filteredTasks.filter(t => t.status === 'pending').length;
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress').length;
    const submittedTasks = filteredTasks.filter(t => t.status === 'submitted').length;
    const overdueTasks = filteredTasks.filter(t => t.status === 'overdue').length;
    
    // Başarı oranı (tamamlanan / toplam aktif görevler)
    const activeTasksCount = allTasksForStats.filter(t => t.status !== 'cancelled').length;
    const successRate = activeTasksCount > 0 ? Math.round((completedTasks / activeTasksCount) * 100) : 0;

    // Relationship bilgisini al (URL'de varsa)
    const currentRelationship = relationshipId 
        ? relationships.find(r => r.id === relationshipId)
        : null;

    return (
        <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
            {/* Breadcrumb - Relationship varsa göster */}
            {relationshipId && currentRelationship && (
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to="/dashboard/coaching" className="flex items-center gap-1">
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    Koçluk İlişkileri
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>
                                {currentRelationship.participant_first_name && currentRelationship.participant_last_name
                                    ? `${currentRelationship.participant_first_name} ${currentRelationship.participant_last_name}`
                                    : currentRelationship.participant_email || 'Bilinmeyen'}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Görevler</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {relationshipId && currentRelationship
                        ? `${currentRelationship.participant_first_name && currentRelationship.participant_last_name
                            ? `${currentRelationship.participant_first_name} ${currentRelationship.participant_last_name}`
                            : currentRelationship.participant_email || 'Bilinmeyen'} - Görevler`
                        : "Görevler"}
                </h1>
                    <p className="text-muted-foreground">
                        {relationshipId && currentRelationship
                            ? `${currentRelationship.package_title} paketi için görevler`
                            : (isProfessional 
                                ? "Katılımcılarınıza görev atayın ve takip edin"
                                : "Size atanan görevleri görüntüleyin ve tamamlayın")}
                    </p>
                </div>
                {isProfessional && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Yeni Görev
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Yeni Görev Oluştur</DialogTitle>
                                <DialogDescription>
                                    Bir katılımcıya görev atayın
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateTask} className="space-y-4">
                                {/* URL'de relationship varsa katılımcı seçimi gizle, otomatik seç */}
                                {!relationshipId && (
                                    <div className="space-y-2">
                                        <Label htmlFor="participant_id">Katılımcı *</Label>
                                        <select
                                            id="participant_id"
                                            value={formData.participant_id}
                                            onChange={(e) => setFormData({ ...formData, participant_id: e.target.value })}
                                            required
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                        >
                                            <option value="">Katılımcı Seçin</option>
                                            {uniqueParticipants.map((participant) => {
                                                // Bu katılımcının aktif ilişkisi var mı kontrol et
                                                const hasActiveRelationship = relationships.some(
                                                    r => r.participant_id === participant.id && r.status === 'active'
                                                );
                                                if (!hasActiveRelationship) return null;
                                                
                                                return (
                                                    <option key={participant.id} value={participant.id}>
                                                        {participant.name}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        {formData.participant_id && (() => {
                                            const selectedParticipantRelationship = relationships.find(
                                                r => r.participant_id === formData.participant_id && r.status === 'active'
                                            );
                                            return selectedParticipantRelationship ? (
                                                <p className="text-xs text-muted-foreground">
                                                    Paket: {selectedParticipantRelationship.package_title}
                                                </p>
                                            ) : null;
                                        })()}
                                    </div>
                                )}
                                {relationshipId && (() => {
                                    const currentRelationship = relationships.find(r => r.id === relationshipId);
                                    return currentRelationship ? (
                                        <div className="space-y-2">
                                            <Label>Katılımcı</Label>
                                            <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
                                                {currentRelationship.participant_first_name && currentRelationship.participant_last_name
                                                    ? `${currentRelationship.participant_first_name} ${currentRelationship.participant_last_name}`
                                                    : currentRelationship.participant_email || 'Bilinmeyen'}
                                                <span className="ml-2 text-muted-foreground">- {currentRelationship.package_title}</span>
                                            </div>
                                        </div>
                                    ) : null;
                                })()}
                                <div className="space-y-2">
                                    <Label htmlFor="title">Görev Başlığı *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        placeholder="Görev başlığı"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Açıklama</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Görev açıklaması..."
                                        rows={4}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="due_date">Son Tarih</Label>
                                    <Input
                                        id="due_date"
                                        type="datetime-local"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        İptal
                                    </Button>
                                    <Button type="submit" disabled={submitting}>
                                        {submitting ? "Oluşturuluyor..." : "Oluştur"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <Separator />

            {/* Katılımcı Filtresi - Professional için (sadece URL'de relationship yoksa) */}
            {isProfessional && uniqueParticipants.length > 0 && !relationshipId && (
                <div className="flex items-center gap-3">
                    <Label htmlFor="participant-filter" className="text-sm font-medium whitespace-nowrap">
                        Katılımcı:
                    </Label>
                    <select
                        id="participant-filter"
                        value={selectedParticipantId}
                        onChange={(e) => setSelectedParticipantId(e.target.value)}
                        className="flex h-10 w-full sm:w-[250px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                        <option value="">Tüm Katılımcılar</option>
                        {uniqueParticipants.map((participant) => (
                            <option key={participant.id} value={participant.id}>
                                {participant.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Geçmiş Görevler Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="show-completed"
                        checked={showCompletedTasks}
                        onChange={(e) => setShowCompletedTasks(e.target.checked)}
                        className="rounded border-gray-300"
                    />
                    <Label htmlFor="show-completed" className="cursor-pointer text-sm font-medium">
                        Geçmiş Görevleri Göster
                    </Label>
                </div>
                {showCompletedTasks && (completedTasks + cancelledTasks > 0) && (
                    <span className="text-xs text-muted-foreground">
                        {completedTasks + cancelledTasks} geçmiş görev
                    </span>
                )}
            </div>

            <Separator />

            {/* İstatistikler */}
            {totalTasks > 0 && (
                <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Toplam:</span>
                        <span className="font-semibold">{totalTasks}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-muted-foreground">Tamamlanan:</span>
                        <span className="font-semibold text-green-600">{completedTasks}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-muted-foreground">Devam Eden:</span>
                        <span className="font-semibold text-blue-600">{inProgressTasks + pendingTasks + submittedTasks}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Başarı Oranı:</span>
                        <span className="font-semibold">{successRate}%</span>
                    </div>
                    {overdueTasks > 0 && (
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <span className="font-semibold">{overdueTasks} gecikmiş</span>
                        </div>
                    )}
                </div>
            )}

            <Separator />

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/50">
                    <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground font-medium mb-1">
                        Henüz görev bulunmuyor
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {isProfessional 
                            ? "Yukarıdaki butona tıklayarak yeni bir görev oluşturun"
                            : "Size atanan bir görev henüz bulunmuyor"}
                    </p>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {paginatedTasks.map((task) => {
                        const statusInfo = getStatusInfo(task.status);
                        const StatusIcon = statusInfo.icon;
                        const dueDate = task.due_date ? new Date(task.due_date) : null;
                        const createdDate = new Date(task.created_at);
                        
                        // Katılımcı bilgisini bul
                        const taskRelationship = relationships.find(r => r.id === task.coaching_relationship_id);
                        const participantName = isProfessional && taskRelationship
                            ? `${taskRelationship.participant_first_name || ''} ${taskRelationship.participant_last_name || ''}`.trim() || taskRelationship.participant_email || 'Bilinmeyen'
                            : null;

                        const isCompletedOrCancelled = task.status === 'completed' || task.status === 'cancelled';

                        return (
                            <div
                                key={task.id}
                                className={`p-4 sm:p-6 border rounded-lg transition-all space-y-4 ${
                                    isCompletedOrCancelled 
                                        ? 'opacity-60 hover:opacity-70 bg-muted/30' 
                                        : 'hover:bg-muted/50'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="flex-1 space-y-3 min-w-0">
                                        <div className="flex items-start gap-3">
                                            <div className={`rounded-lg p-2 shrink-0 ${
                                                isCompletedOrCancelled 
                                                    ? 'bg-muted/50' 
                                                    : 'bg-primary/10'
                                            }`}>
                                                <ClipboardList className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                                    isCompletedOrCancelled 
                                                        ? 'text-muted-foreground' 
                                                        : 'text-primary'
                                                }`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className={`font-semibold text-base sm:text-lg truncate ${
                                                            isCompletedOrCancelled 
                                                                ? 'line-through text-muted-foreground' 
                                                                : ''
                                                        }`}>{task.title}</h3>
                                                        {isProfessional && participantName && (
                                                            <p className={`text-xs mt-1 ${
                                                                isCompletedOrCancelled 
                                                                    ? 'text-muted-foreground/60' 
                                                                    : 'text-muted-foreground'
                                                            }`}>
                                                                Katılımcı: <span className="font-medium">{participantName}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                    {isProfessional ? (
                                                        (task.status === 'completed' || task.status === 'cancelled') ? (
                                                            <span className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${statusInfo.color} opacity-75`}>
                                                                <StatusIcon className="h-3 w-3" />
                                                                {statusInfo.label}
                                                            </span>
                                                        ) : (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <button className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${statusInfo.color} hover:opacity-80 transition-opacity`}>
                                                                        <StatusIcon className="h-3 w-3" />
                                                                        {statusInfo.label}
                                                                        <ChevronDown className="h-3 w-3" />
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    {getStatusOptions(task.status).map((statusOption) => (
                                                                        <DropdownMenuItem
                                                                            key={statusOption.value}
                                                                            onClick={() => handleUpdateTaskStatus(task.id, statusOption.value)}
                                                                        >
                                                                            {statusOption.label}
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )
                                                    ) : (
                                                        <span className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${statusInfo.color}`}>
                                                            <StatusIcon className="h-3 w-3" />
                                                            {statusInfo.label}
                                                        </span>
                                                    )}
                                                </div>
                                                {task.description && (
                                                    <p className={`text-sm mb-2 ${
                                                        isCompletedOrCancelled 
                                                            ? 'line-through text-muted-foreground/70' 
                                                            : 'text-muted-foreground'
                                                    }`}>
                                                        {task.description}
                                                    </p>
                                                )}
                                                <div className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs ${
                                                    isCompletedOrCancelled 
                                                        ? 'text-muted-foreground/60' 
                                                        : 'text-muted-foreground'
                                                }`}>
                                                    <span>Oluşturulma: {createdDate.toLocaleDateString("tr-TR")}</span>
                                                    {dueDate && (
                                                        <span className="truncate">Son Tarih: {dueDate.toLocaleDateString("tr-TR")} {dueDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
                                                    )}
                                                    {task.submission_count !== undefined && task.submission_count > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <MessageSquare className="h-3 w-3" />
                                                            {task.submission_count} gönderim
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                                        {isProfessional ? (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewSubmissions(task.id)}
                                                    className={`flex-1 sm:flex-initial ${
                                                        isCompletedOrCancelled ? 'opacity-60' : ''
                                                    }`}
                                                >
                                                    <FileText className="h-4 w-4 sm:mr-0" />
                                                    <span className="sm:hidden ml-1">Görüntüle</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className={`text-destructive hover:text-destructive flex-1 sm:flex-initial ${
                                                        isCompletedOrCancelled ? 'opacity-60' : ''
                                                    }`}
                                                >
                                                    <Trash2 className="h-4 w-4 sm:mr-0" />
                                                    <span className="sm:hidden ml-1">Sil</span>
                                                </Button>
                                            </>
                                        ) : (
                                            task.status === 'pending' || task.status === 'in_progress' ? (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedTask(task);
                                                        setIsSubmissionDialogOpen(true);
                                                    }}
                                                    className="gap-2 w-full sm:w-auto"
                                                >
                                                    <Send className="h-4 w-4" />
                                                    Gönder
                                                </Button>
                                            ) : null
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
                            <div className="text-sm text-muted-foreground">
                                {startIndex + 1}-{Math.min(endIndex, filteredTasks.length)} / {filteredTasks.length} görev gösteriliyor
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="gap-2"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className="hidden sm:inline">Önceki</span>
                                </Button>
                                
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={currentPage === pageNum ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentPage(pageNum)}
                                                className="min-w-10"
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="gap-2"
                                >
                                    <span className="hidden sm:inline">Sonraki</span>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Submission Dialog */}
            <Dialog open={isSubmissionDialogOpen} onOpenChange={setIsSubmissionDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {isProfessional ? "Gönderimler" : "Görev Gönder"}
                        </DialogTitle>
                        <DialogDescription>
                            {isProfessional 
                                ? "Görev gönderimlerini görüntüleyin"
                                : "Görevinizi tamamlayın ve gönderin"}
                        </DialogDescription>
                    </DialogHeader>
                    {isProfessional ? (
                        <div className="space-y-4">
                            {submissions.length === 0 ? (
                                <p className="text-muted-foreground">Henüz gönderim bulunmuyor</p>
                            ) : (
                                submissions.map((submission) => (
                                    <div key={submission.id} className="p-4 border rounded-lg space-y-2">
                                        <p className="text-sm font-medium">Gönderim Tarihi: {new Date(submission.created_at).toLocaleString("tr-TR")}</p>
                                        {submission.submission_text && (
                                            <p className="text-sm text-muted-foreground">{submission.submission_text}</p>
                                        )}
                                        {submission.attachment_url && (
                                            <a href={submission.attachment_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                                Dosya Eki
                                            </a>
                                        )}
                                        {submission.feedback && (
                                            <div className="mt-2 p-2 bg-muted rounded">
                                                <p className="text-xs font-medium mb-1">Geri Bildirim:</p>
                                                <p className="text-sm">{submission.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (selectedTask) {
                                handleSubmitTask(selectedTask.id);
                            }
                        }} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="submission_text">Gönderim Metni</Label>
                                <Textarea
                                    id="submission_text"
                                    value={submissionData.submission_text}
                                    onChange={(e) => setSubmissionData({ ...submissionData, submission_text: e.target.value })}
                                    placeholder="Görevinizi tamamladığınızı belirtin..."
                                    rows={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="attachment_url">Dosya URL (Opsiyonel)</Label>
                                <Input
                                    id="attachment_url"
                                    value={submissionData.attachment_url}
                                    onChange={(e) => setSubmissionData({ ...submissionData, attachment_url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsSubmissionDialogOpen(false)}>
                                    İptal
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? "Gönderiliyor..." : "Gönder"}
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Onay Dialogu - Completed/Cancelled için */}
            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {pendingStatusUpdate?.newStatus === 'completed' 
                                ? 'Görevi Tamamlandı Olarak İşaretle'
                                : 'Görevi İptal Et'}
                        </DialogTitle>
                        <DialogDescription>
                            {pendingStatusUpdate?.newStatus === 'completed' 
                                ? 'Bu görevi tamamlandı olarak işaretlemek istediğinize emin misiniz? Tamamlanan görevlerin durumu daha sonra değiştirilemez.'
                                : 'Bu görevi iptal etmek istediğinize emin misiniz? İptal edilen görevlerin durumu daha sonra değiştirilemez.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setIsConfirmDialogOpen(false);
                                setPendingStatusUpdate(null);
                            }}
                        >
                            İptal
                        </Button>
                        <Button 
                            variant={pendingStatusUpdate?.newStatus === 'cancelled' ? 'destructive' : 'default'}
                            onClick={handleConfirmStatusUpdate}
                        >
                            {pendingStatusUpdate?.newStatus === 'completed' ? 'Tamamlandı Olarak İşaretle' : 'İptal Et'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

