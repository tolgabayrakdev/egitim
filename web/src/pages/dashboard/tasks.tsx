import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiUrl } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash2, CheckCircle2, Clock, Send, MessageSquare, FileText, ClipboardList } from "lucide-react";
import { useSearchParams } from "react-router";

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
}

export default function Tasks() {
    const [searchParams] = useSearchParams();
    const relationshipId = searchParams.get('relationship');
    
    const [tasks, setTasks] = useState<TaskData[]>([]);
    const [relationships, setRelationships] = useState<CoachingRelationship[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);
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
        coaching_relationship_id: relationshipId || "",
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
            fetchTasks();
            if (userRole === 'professional') {
                fetchRelationships();
            }
        }
    }, [userRole, fetchTasks, fetchRelationships]);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload: {
                coaching_relationship_id: string;
                title: string;
                description?: string;
                due_date?: string;
            } = {
                coaching_relationship_id: formData.coaching_relationship_id,
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
            setFormData({ coaching_relationship_id: relationshipId || "", title: "", description: "", due_date: "" });
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
            default:
                return { label: status, color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', icon: Clock };
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

    const isProfessional = userRole === 'professional';

    return (
        <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Görevler</h1>
                    <p className="text-muted-foreground">
                        {isProfessional 
                            ? "Katılımcılarınıza görev atayın ve takip edin"
                            : "Size atanan görevleri görüntüleyin ve tamamlayın"}
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
                                    Bir koçluk ilişkisine görev atayın
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateTask} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="coaching_relationship_id">Koçluk İlişkisi *</Label>
                                    <select
                                        id="coaching_relationship_id"
                                        value={formData.coaching_relationship_id}
                                        onChange={(e) => setFormData({ ...formData, coaching_relationship_id: e.target.value })}
                                        required
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    >
                                        <option value="">İlişki Seçin</option>
                                        {relationships.map((rel) => (
                                            <option key={rel.id} value={rel.id}>
                                                {rel.package_title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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

            {/* Tasks List */}
            {tasks.length === 0 ? (
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
                <div className="space-y-4">
                    {tasks.map((task) => {
                        const statusInfo = getStatusInfo(task.status);
                        const StatusIcon = statusInfo.icon;
                        const dueDate = task.due_date ? new Date(task.due_date) : null;
                        const createdDate = new Date(task.created_at);

                        return (
                            <div
                                key={task.id}
                                className="p-4 sm:p-6 border rounded-lg hover:bg-muted/50 transition-colors space-y-4"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="flex-1 space-y-3 min-w-0">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
                                                <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-base sm:text-lg truncate">{task.title}</h3>
                                                    <span className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${statusInfo.color}`}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        {statusInfo.label}
                                                    </span>
                                                </div>
                                                {task.description && (
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        {task.description}
                                                    </p>
                                                )}
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
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
                                    <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                                        {isProfessional ? (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewSubmissions(task.id)}
                                                    className="flex-1 sm:flex-initial"
                                                >
                                                    <FileText className="h-4 w-4 sm:mr-0" />
                                                    <span className="sm:hidden ml-1">Görüntüle</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className="text-destructive hover:text-destructive flex-1 sm:flex-initial"
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
        </div>
    );
}

