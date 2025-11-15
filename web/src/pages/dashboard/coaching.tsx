import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiUrl } from "@/lib/api";
import { toast } from "sonner";
import { Users, Plus, CheckCircle2, XCircle, Calendar, Package } from "lucide-react";

interface CoachingRelationship {
    id: string;
    professional_id: string;
    participant_id: string;
    package_id: string;
    status: 'active' | 'completed' | 'cancelled';
    started_at: string;
    completed_at: string | null;
    created_at: string;
    package_title: string;
    participant_first_name?: string;
    participant_last_name?: string;
    participant_email?: string;
    professional_first_name?: string;
    professional_last_name?: string;
    professional_email?: string;
}

interface Package {
    id: string;
    title: string;
}

export default function Coaching() {
    const [relationships, setRelationships] = useState<CoachingRelationship[]>([]);
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        participant_id: "",
        package_id: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [userRole, setUserRole] = useState<string>("");

    const fetchRelationships = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(apiUrl("api/coaching"), {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Koçluk ilişkileri yüklenemedi");
            }

            const data = await response.json();
            setRelationships(data.relationships || []);
        } catch {
            toast.error("Koçluk ilişkileri yüklenirken bir hata oluştu");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPackages = useCallback(async () => {
        try {
            const response = await fetch(apiUrl("api/packages"), {
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                setPackages(data.packages || []);
            }
        } catch {
            console.error("Paketler yüklenemedi");
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
            fetchRelationships();
            // Sadece professional ise paketleri yükle
            if (userRole === 'professional') {
                fetchPackages();
            }
        }
    }, [userRole, fetchRelationships, fetchPackages]);

    const handleCreateRelationship = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch(apiUrl("api/coaching"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    participant_id: formData.participant_id,
                    package_id: formData.package_id
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Koçluk ilişkisi oluşturulamadı");
            }

            toast.success("Koçluk ilişkisi oluşturuldu");
            setIsDialogOpen(false);
            setFormData({ participant_id: "", package_id: "" });
            fetchRelationships();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Bir hata oluştu";
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'active':
                return {
                    label: 'Aktif',
                    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                    icon: CheckCircle2
                };
            case 'completed':
                return {
                    label: 'Tamamlandı',
                    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                    icon: CheckCircle2
                };
            case 'cancelled':
                return {
                    label: 'İptal Edildi',
                    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                    icon: XCircle
                };
            default:
                return {
                    label: status,
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
                    icon: CheckCircle2
                };
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
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Koçluk İlişkileri</h1>
                    <p className="text-muted-foreground">
                        {isProfessional 
                            ? "Katılımcılarınızla olan koçluk ilişkilerinizi görüntüleyin ve yönetin"
                            : "Koçluk aldığınız profesyonelleri görüntüleyin"}
                    </p>
                </div>
                {isProfessional && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Yeni İlişki
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Yeni Koçluk İlişkisi Oluştur</DialogTitle>
                                <DialogDescription>
                                    Bir katılımcıya paket atayarak koçluk ilişkisi başlatın
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateRelationship} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="participant_id">Katılımcı ID</Label>
                                    <Input
                                        id="participant_id"
                                        value={formData.participant_id}
                                        onChange={(e) => setFormData({ ...formData, participant_id: e.target.value })}
                                        required
                                        placeholder="Katılımcı UUID"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Davet kabul eden katılımcının ID'sini girin
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="package_id">Paket</Label>
                                    <select
                                        id="package_id"
                                        value={formData.package_id}
                                        onChange={(e) => setFormData({ ...formData, package_id: e.target.value })}
                                        required
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    >
                                        <option value="">Paket Seçin</option>
                                        {packages.map((pkg) => (
                                            <option key={pkg.id} value={pkg.id}>
                                                {pkg.title}
                                            </option>
                                        ))}
                                    </select>
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

            {/* Relationships List */}
            {relationships.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/50">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground font-medium mb-1">
                        Henüz koçluk ilişkisi bulunmuyor
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {isProfessional 
                            ? "Yukarıdaki butona tıklayarak yeni bir koçluk ilişkisi oluşturun"
                            : "Size atanan bir paket henüz bulunmuyor"}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {relationships.map((relationship) => {
                        const statusInfo = getStatusInfo(relationship.status);
                        const StatusIcon = statusInfo.icon;
                        const startedAt = new Date(relationship.started_at);

                        return (
                            <div
                                key={relationship.id}
                                className="p-4 sm:p-6 border rounded-lg hover:bg-muted/50 transition-colors space-y-4"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="flex-1 space-y-3 min-w-0">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                                                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-base sm:text-lg truncate">
                                                        {isProfessional
                                                            ? `${relationship.participant_first_name || ''} ${relationship.participant_last_name || ''}`.trim() || relationship.participant_email
                                                            : `${relationship.professional_first_name || ''} ${relationship.professional_last_name || ''}`.trim() || relationship.professional_email}
                                                    </h3>
                                                    <span className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${statusInfo.color}`}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        {statusInfo.label}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        <span className="truncate">{relationship.package_title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        <span>Başlangıç: {startedAt.toLocaleDateString("tr-TR")}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.location.href = `/dashboard/tasks?relationship=${relationship.id}`}
                                        className="w-full sm:w-auto"
                                    >
                                        Görevleri Görüntüle
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

