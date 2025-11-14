import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiUrl } from "@/lib/api";
import { toast } from "sonner";
import { UserPlus, Mail, Clock, CheckCircle2, XCircle, Calendar, Filter, Send, X } from "lucide-react";

interface Invitation {
    id: string;
    email: string;
    status: 'pending' | 'accepted' | 'expired' | 'cancelled';
    packageTitle: string | null;
    expiresAt: string;
    acceptedAt: string | null;
    createdAt: string;
}

export default function Invitations() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loadingInvitations, setLoadingInvitations] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [error, setError] = useState("");

    const fetchInvitations = async () => {
        try {
            setLoadingInvitations(true);
            const response = await fetch(apiUrl("api/invitations"), {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Davetler yüklenemedi");
            }

            const data = await response.json();
            setInvitations(data.invitations || []);
        } catch (error) {
            toast.error("Davetler yüklenirken bir hata oluştu");
        } finally {
            setLoadingInvitations(false);
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, []);

    const [packages, setPackages] = useState<any[]>([]);
    const [selectedPackageId, setSelectedPackageId] = useState<string>("");

    useEffect(() => {
        // Paketleri yükle
        const fetchPackages = async () => {
            try {
                const response = await fetch(apiUrl("api/packages"), {
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    setPackages(data.packages || []);
                }
            } catch (error) {
                console.error("Paketler yüklenemedi");
            }
        };
        fetchPackages();
    }, []);

    const handleSendInvitation = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const payload: any = { email };
            if (selectedPackageId) {
                payload.package_id = selectedPackageId;
            }

            const response = await fetch(apiUrl("api/invitations/send"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Davet gönderilemedi");
            }

            toast.success("Davet başarıyla gönderildi");
            setEmail("");
            setSelectedPackageId("");
            fetchInvitations();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Bir hata oluştu";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelInvitation = async (invitationId: string) => {
        if (!confirm("Bu daveti iptal etmek istediğinize emin misiniz?")) {
            return;
        }

        try {
            const response = await fetch(apiUrl(`api/invitations/${invitationId}`), {
                method: "DELETE",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Davet iptal edilemedi");
            }

            toast.success("Davet iptal edildi");
            fetchInvitations();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Bir hata oluştu";
            toast.error(errorMessage);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return { 
                    label: 'Beklemede', 
                    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                    icon: Clock,
                    iconColor: 'text-yellow-600 dark:text-yellow-400'
                };
            case 'accepted':
                return { 
                    label: 'Kabul Edildi', 
                    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                    icon: CheckCircle2,
                    iconColor: 'text-green-600 dark:text-green-400'
                };
            case 'expired':
                return { 
                    label: 'Süresi Doldu', 
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
                    icon: XCircle,
                    iconColor: 'text-gray-600 dark:text-gray-400'
                };
            case 'cancelled':
                return { 
                    label: 'İptal Edildi', 
                    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                    icon: XCircle,
                    iconColor: 'text-red-600 dark:text-red-400'
                };
            default:
                return { 
                    label: status, 
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
                    icon: Clock,
                    iconColor: 'text-gray-600 dark:text-gray-400'
                };
        }
    };

    const filteredInvitations = statusFilter === "all" 
        ? invitations 
        : invitations.filter(inv => inv.status === statusFilter);

    if (loadingInvitations) {
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
        <div className="space-y-8 p-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Davetler</h1>
                <p className="text-muted-foreground">
                    Kullanıcıları sisteme davet edin ve gönderdiğiniz davetlerin durumunu takip edin.
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <Alert variant="destructive" className="animate-in fade-in-0">
                    <AlertTitle>Hata</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Yeni Davet Gönderme */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Yeni Davet Gönder</h2>
                        <p className="text-sm text-muted-foreground">
                            Bir kullanıcıyı sisteme davet etmek için e-posta adresini girin
                        </p>
                    </div>
                </div>
                
                <Separator />
                
                <form onSubmit={handleSendInvitation} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            E-posta Adresi
                        </Label>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="ornek@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="flex-1 transition-all"
                                />
                                <Button type="submit" disabled={loading} className="gap-2">
                                    <Send className="h-4 w-4" />
                                    {loading ? "Gönderiliyor..." : "Davet Gönder"}
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="package_id" className="text-sm">Paket (Opsiyonel)</Label>
                                <select
                                    id="package_id"
                                    value={selectedPackageId}
                                    onChange={(e) => setSelectedPackageId(e.target.value)}
                                    disabled={loading}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                >
                                    <option value="">Paket seçmeden davet gönder</option>
                                    {packages.map((pkg) => (
                                        <option key={pkg.id} value={pkg.id}>
                                            {pkg.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Davet e-postası 7 gün süreyle geçerli olacaktır
                        </p>
                    </div>
                </form>
            </div>

            {/* Gönderilen Davetler */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                            <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Gönderilen Davetler</h2>
                            <p className="text-sm text-muted-foreground">
                                Gönderdiğiniz davetlerin durumunu görüntüleyin ve yönetin
                            </p>
                        </div>
                    </div>
                </div>
                
                <Separator />
                
                {/* Filtreler */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Filtrele:</span>
                    <Button
                        variant={statusFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("all")}
                        className="gap-2"
                    >
                        Tümü
                        <span className="ml-1 text-xs opacity-70">({invitations.length})</span>
                    </Button>
                    <Button
                        variant={statusFilter === "pending" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("pending")}
                        className="gap-2"
                    >
                        Beklemede
                        <span className="ml-1 text-xs opacity-70">
                            ({invitations.filter(i => i.status === 'pending').length})
                        </span>
                    </Button>
                    <Button
                        variant={statusFilter === "accepted" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("accepted")}
                        className="gap-2"
                    >
                        Kabul Edildi
                        <span className="ml-1 text-xs opacity-70">
                            ({invitations.filter(i => i.status === 'accepted').length})
                        </span>
                    </Button>
                    <Button
                        variant={statusFilter === "expired" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("expired")}
                        className="gap-2"
                    >
                        Süresi Doldu
                        <span className="ml-1 text-xs opacity-70">
                            ({invitations.filter(i => i.status === 'expired').length})
                        </span>
                    </Button>
                </div>

                {/* Davet Listesi */}
                {filteredInvitations.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/50">
                        <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground font-medium mb-1">
                            {statusFilter === "all" 
                                ? "Henüz davet gönderilmemiş" 
                                : "Bu durumda davet bulunamadı"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {statusFilter === "all" 
                                ? "Yukarıdaki formu kullanarak ilk davetinizi gönderin" 
                                : "Farklı bir filtre seçmeyi deneyin"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredInvitations.map((invitation) => {
                            const statusInfo = getStatusInfo(invitation.status);
                            const StatusIcon = statusInfo.icon;
                            const expiresAt = new Date(invitation.expiresAt);
                            const createdAt = new Date(invitation.createdAt);
                            const acceptedAt = invitation.acceptedAt ? new Date(invitation.acceptedAt) : null;

                            return (
                                <div
                                    key={invitation.id}
                                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-muted p-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-base">{invitation.email}</span>
                                                    <span className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${statusInfo.color}`}>
                                                        <StatusIcon className={`h-3 w-3 ${statusInfo.iconColor}`} />
                                                        {statusInfo.label}
                                                    </span>
                                                </div>
                                                {invitation.packageTitle && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Paket: <span className="font-medium">{invitation.packageTitle}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground pl-12">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>Gönderilme: {createdAt.toLocaleDateString("tr-TR")} {createdAt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
                                            </div>
                                            {invitation.status === 'pending' && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>Bitiş: {expiresAt.toLocaleDateString("tr-TR")}</span>
                                                </div>
                                            )}
                                            {acceptedAt && (
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    <span>Kabul: {acceptedAt.toLocaleDateString("tr-TR")}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {invitation.status === 'pending' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCancelInvitation(invitation.id)}
                                            className="gap-2 ml-4"
                                        >
                                            <X className="h-4 w-4" />
                                            İptal Et
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
