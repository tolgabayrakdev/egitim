import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { apiUrl } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
    ArrowLeft, 
    User, 
    Mail, 
    Phone, 
    Calendar, 
    Package, 
    ClipboardList,
    CheckCircle2,
    Clock,
    FileText,
    Plus,
    Edit,
    Trash2,
    Star,
    TrendingUp,
    BarChart3,
    Activity
} from "lucide-react";
import { toast } from "sonner";

interface Participant {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    bio?: string;
    total_relationships: string;
    active_relationships: string;
    total_tasks: string;
    completed_tasks: string;
}

interface Relationship {
    id: string;
    package_title: string;
    status: string;
    started_at: string;
    completed_at: string | null;
}

interface TaskStat {
    status: string;
    count: string;
}

interface Note {
    id: string;
    title: string | null;
    content: string;
    is_important: boolean;
    created_at: string;
    updated_at: string;
    relationship_id?: string;
    package_title?: string;
}

interface Analytics {
    statistics: {
        total_relationships: string;
        active_relationships: string;
        completed_relationships: string;
        total_tasks: string;
        completed_tasks: string;
        pending_tasks: string;
        submitted_tasks: string;
        completion_rate: string;
        avg_task_completion_days: string | null;
    };
    trends: Array<{
        month: string;
        completed_tasks: string;
        total_tasks: string;
    }>;
}

export default function ParticipantDetail() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [participant, setParticipant] = useState<Participant | null>(null);
    const [relationships, setRelationships] = useState<Relationship[]>([]);
    const [taskStats, setTaskStats] = useState<TaskStat[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [noteForm, setNoteForm] = useState({
        title: "",
        content: "",
        is_important: false,
        coaching_relationship_id: ""
    });

    const fetchParticipant = useCallback(async () => {
        if (!slug) return;

        try {
            setLoading(true);
            const response = await fetch(apiUrl(`api/coaching/participant/${slug}`), {
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setParticipant(data.data.participant);
                    setRelationships(data.data.relationships);
                    setTaskStats(data.data.taskStats);
                } else {
                    toast.error("Katılımcı bulunamadı");
                    navigate("/dashboard/coaching");
                }
            } else {
                toast.error("Katılımcı yüklenirken bir hata oluştu");
                navigate("/dashboard/coaching");
            }
        } catch (error) {
            console.error("Error fetching participant:", error);
            toast.error("Katılımcı yüklenirken bir hata oluştu");
            navigate("/dashboard/coaching");
        } finally {
            setLoading(false);
        }
    }, [slug, navigate]);

    const fetchNotes = useCallback(async () => {
        if (!participant) return;

        try {
            setLoadingNotes(true);
            const response = await fetch(apiUrl(`api/coaching-notes/participant/${participant.id}`), {
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setNotes(data.notes);
                }
            }
        } catch (error) {
            console.error("Error fetching notes:", error);
        } finally {
            setLoadingNotes(false);
        }
    }, [participant]);

    const fetchAnalytics = useCallback(async () => {
        if (!participant) return;

        try {
            const response = await fetch(apiUrl(`api/coaching/participant/${participant.id}/analytics`), {
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setAnalytics(data.analytics);
                }
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
        }
    }, [participant]);

    useEffect(() => {
        fetchParticipant();
    }, [fetchParticipant]);

    useEffect(() => {
        if (participant) {
            fetchNotes();
            fetchAnalytics();
        }
    }, [participant, fetchNotes, fetchAnalytics]);

    const handleCreateNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!participant) return;

        try {
            const response = await fetch(apiUrl("api/coaching-notes"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    participant_id: participant.id,
                    title: noteForm.title || null,
                    content: noteForm.content,
                    is_important: noteForm.is_important,
                    coaching_relationship_id: noteForm.coaching_relationship_id || null
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Not başarıyla oluşturuldu");
                setIsNoteDialogOpen(false);
                setNoteForm({ title: "", content: "", is_important: false, coaching_relationship_id: "" });
                fetchNotes();
            } else {
                toast.error(data.message || "Not oluşturulamadı");
            }
        } catch (error) {
            toast.error("Not oluşturulurken bir hata oluştu");
        }
    };

    const handleUpdateNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingNote) return;

        try {
            const response = await fetch(apiUrl(`api/coaching-notes/${editingNote.id}`), {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    title: noteForm.title || null,
                    content: noteForm.content,
                    is_important: noteForm.is_important
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Not başarıyla güncellendi");
                setIsNoteDialogOpen(false);
                setEditingNote(null);
                setNoteForm({ title: "", content: "", is_important: false, coaching_relationship_id: "" });
                fetchNotes();
            } else {
                toast.error(data.message || "Not güncellenemedi");
            }
        } catch (error) {
            toast.error("Not güncellenirken bir hata oluştu");
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!confirm("Bu notu silmek istediğinizden emin misiniz?")) return;

        try {
            const response = await fetch(apiUrl(`api/coaching-notes/${noteId}`), {
                method: "DELETE",
                credentials: "include",
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Not başarıyla silindi");
                fetchNotes();
            } else {
                toast.error(data.message || "Not silinemedi");
            }
        } catch (error) {
            toast.error("Not silinirken bir hata oluştu");
        }
    };

    const openEditDialog = (note: Note) => {
        setEditingNote(note);
        setNoteForm({
            title: note.title || "",
            content: note.content,
            is_important: note.is_important,
            coaching_relationship_id: note.relationship_id || ""
        });
        setIsNoteDialogOpen(true);
    };

    const openCreateDialog = () => {
        setEditingNote(null);
        setNoteForm({ title: "", content: "", is_important: false, coaching_relationship_id: "" });
        setIsNoteDialogOpen(true);
    };

    const getStatusBadge = (status: string) => {
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

    const getTaskStatusLabel = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Beklemede';
            case 'in_progress':
                return 'Devam Ediyor';
            case 'submitted':
                return 'Gönderildi';
            case 'completed':
                return 'Tamamlandı';
            case 'overdue':
                return 'Gecikmiş';
            case 'cancelled':
                return 'İptal Edildi';
            default:
                return status.replace('_', ' ');
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

    if (!participant) {
        return null;
    }

    const completionRate = analytics?.statistics.completion_rate 
        ? parseFloat(analytics.statistics.completion_rate) 
        : 0;

    return (
        <div className="space-y-8 p-4 sm:p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="space-y-4">
                <Button asChild variant="ghost" className="w-fit">
                    <Link to="/dashboard/coaching">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Koçluk İlişkilerine Dön
                    </Link>
                </Button>

                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        {participant.first_name} {participant.last_name}
                    </h1>
                    <p className="text-muted-foreground">
                        Katılımcı Detayları ve Analizleri
                    </p>
                </div>
            </div>

            <Separator />

            {/* Katılımcı Bilgileri */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Kişisel Bilgiler</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                        <div className="rounded-full bg-primary/10 p-2">
                            <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">E-posta</p>
                            <p className="font-medium">{participant.email}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                        <div className="rounded-full bg-primary/10 p-2">
                            <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Telefon</p>
                            <p className="font-medium">{participant.phone}</p>
                        </div>
                    </div>
                    {participant.bio && (
                        <div className="sm:col-span-2 p-4 rounded-lg bg-muted/30">
                            <p className="text-sm text-muted-foreground mb-2">Hakkında</p>
                            <p className="text-sm leading-relaxed">{participant.bio}</p>
                        </div>
                    )}
                </div>
            </section>

            <Separator />

            {/* Özet İstatistikler */}
            {analytics && (
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold">İstatistikler</h2>
                    </div>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="p-6 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border border-green-200/50 dark:border-green-800/30">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-medium text-muted-foreground">Aktif İlişkiler</p>
                                <Activity className="h-5 w-5 text-green-600" />
                            </div>
                            <p className="text-3xl font-bold text-green-600">
                                {analytics.statistics.active_relationships}
                            </p>
                        </div>

                        <div className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-800/30">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-medium text-muted-foreground">Toplam Görevler</p>
                                <ClipboardList className="h-5 w-5 text-blue-600" />
                            </div>
                            <p className="text-3xl font-bold text-blue-600">{analytics.statistics.total_tasks}</p>
                        </div>

                        <div className="p-6 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border border-purple-200/50 dark:border-purple-800/30">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-medium text-muted-foreground">Tamamlanma Oranı</p>
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                            </div>
                            <p className="text-3xl font-bold text-purple-600 mb-2">{completionRate.toFixed(1)}%</p>
                            <Progress value={completionRate} className="h-2" />
                        </div>

                        <div className="p-6 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border border-orange-200/50 dark:border-orange-800/30">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-medium text-muted-foreground">Ort. Tamamlanma Süresi</p>
                                <Clock className="h-5 w-5 text-orange-600" />
                            </div>
                            <p className="text-3xl font-bold text-orange-600">
                                {analytics.statistics.avg_task_completion_days 
                                    ? `${Math.round(parseFloat(analytics.statistics.avg_task_completion_days))} gün`
                                    : 'N/A'}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            <Separator />

            {/* Koçluk İlişkileri */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Koçluk İlişkileri</h2>
                </div>
                {relationships.length === 0 ? (
                    <div className="text-center py-12 rounded-lg bg-muted/30">
                        <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">
                            Henüz koçluk ilişkisi bulunmuyor
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {relationships.map((rel) => (
                            <div key={rel.id} className="p-5 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold">{rel.package_title}</h3>
                                            {getStatusBadge(rel.status)}
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>Başlangıç: {new Date(rel.started_at).toLocaleDateString("tr-TR")}</span>
                                            </div>
                                            {rel.completed_at && (
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <span>Tamamlanma: {new Date(rel.completed_at).toLocaleDateString("tr-TR")}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                                        <Link to={`/dashboard/tasks?relationship=${rel.id}`}>
                                            Görevleri Görüntüle
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <Separator />

            {/* Notlar */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold">Notlar</h2>
                    </div>
                    <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreateDialog} size="sm" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Yeni Not
                            </Button>
                        </DialogTrigger>
                            <DialogContent className="max-w-[95vw] sm:max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingNote ? "Notu Düzenle" : "Yeni Not Oluştur"}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {participant.first_name} {participant.last_name} hakkında not ekleyin
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={editingNote ? handleUpdateNote : handleCreateNote} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="note_title">Başlık (Opsiyonel)</Label>
                                        <Input
                                            id="note_title"
                                            value={noteForm.title}
                                            onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                                            placeholder="Not başlığı"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="note_content">İçerik *</Label>
                                        <Textarea
                                            id="note_content"
                                            value={noteForm.content}
                                            onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                                            required
                                            rows={6}
                                            placeholder="Not içeriği..."
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="note_important"
                                            checked={noteForm.is_important}
                                            onChange={(e) => setNoteForm({ ...noteForm, is_important: e.target.checked })}
                                            className="rounded border-gray-300"
                                        />
                                        <Label htmlFor="note_important" className="cursor-pointer">
                                            Önemli olarak işaretle
                                        </Label>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button type="button" variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
                                            İptal
                                        </Button>
                                        <Button type="submit">
                                            {editingNote ? "Güncelle" : "Oluştur"}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                </div>

                {loadingNotes ? (
                    <div className="text-center py-12 rounded-lg bg-muted/30">
                        <div className="text-muted-foreground">Yükleniyor...</div>
                    </div>
                ) : notes.length === 0 ? (
                    <div className="text-center py-12 rounded-lg bg-muted/30">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">Henüz not bulunmuyor</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notes.map((note) => (
                            <div key={note.id} className="p-5 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all group">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {note.is_important && (
                                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                            )}
                                            {note.title && (
                                                <h3 className="font-semibold text-base">{note.title}</h3>
                                            )}
                                            {note.package_title && (
                                                <Badge variant="outline" className="text-xs">
                                                    {note.package_title}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{note.content}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(note.created_at).toLocaleDateString("tr-TR", {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditDialog(note)}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteNote(note.id)}
                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Görev İstatistikleri */}
            {taskStats.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold">Görev Durum Dağılımı</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {taskStats.map((stat) => (
                            <div key={stat.status} className="text-center p-5 rounded-lg bg-muted/30 border border-border/50">
                                <p className="text-3xl font-bold mb-2">{stat.count}</p>
                                <p className="text-sm text-muted-foreground">
                                    {getTaskStatusLabel(stat.status)}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

