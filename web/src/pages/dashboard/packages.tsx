import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiUrl } from "@/lib/api";
import { toast } from "sonner";
import { Package, Plus, Edit, Trash2, CheckCircle2, XCircle, DollarSign, Calendar } from "lucide-react";

interface PackageData {
    id: string;
    title: string;
    description: string | null;
    duration_days: number | null;
    price: number | null;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

export default function Packages() {
    const [packages, setPackages] = useState<PackageData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<PackageData | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        duration_days: "",
        price: "",
        status: "active" as "active" | "inactive"
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const response = await fetch(apiUrl("api/packages"), {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Paketler yüklenemedi");
            }

            const data = await response.json();
            setPackages(data.packages || []);
        } catch (error) {
            toast.error("Paketler yüklenirken bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const handleOpenDialog = (pkg?: PackageData) => {
        if (pkg) {
            setEditingPackage(pkg);
            setFormData({
                title: pkg.title,
                description: pkg.description || "",
                duration_days: pkg.duration_days?.toString() || "",
                price: pkg.price?.toString() || "",
                status: pkg.status
            });
        } else {
            setEditingPackage(null);
            setFormData({
                title: "",
                description: "",
                duration_days: "",
                price: "",
                status: "active"
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload: any = {
                title: formData.title,
                description: formData.description || null,
                status: formData.status
            };

            if (formData.duration_days) {
                payload.duration_days = parseInt(formData.duration_days);
            }
            if (formData.price) {
                payload.price = parseFloat(formData.price);
            }

            const url = editingPackage 
                ? apiUrl(`api/packages/${editingPackage.id}`)
                : apiUrl("api/packages");
            
            const method = editingPackage ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Paket kaydedilemedi");
            }

            toast.success(editingPackage ? "Paket güncellendi" : "Paket oluşturuldu");
            setIsDialogOpen(false);
            fetchPackages();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Bir hata oluştu";
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (packageId: string) => {
        if (!confirm("Bu paketi silmek istediğinize emin misiniz?")) {
            return;
        }

        try {
            const response = await fetch(apiUrl(`api/packages/${packageId}`), {
                method: "DELETE",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Paket silinemedi");
            }

            toast.success("Paket silindi");
            fetchPackages();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Bir hata oluştu";
            toast.error(errorMessage);
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

    return (
        <div className="space-y-8 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Paketler</h1>
                    <p className="text-muted-foreground">
                        Koçluk paketlerinizi oluşturun ve yönetin. Bu paketleri davet ettiğiniz katılımcılara atayabilirsiniz.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Yeni Paket
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingPackage ? "Paketi Düzenle" : "Yeni Paket Oluştur"}</DialogTitle>
                            <DialogDescription>
                                {editingPackage ? "Paket bilgilerini güncelleyin" : "Yeni bir koçluk paketi oluşturun"}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Paket Başlığı *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="Örn: Temel Koçluk Paketi"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Açıklama</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Paket hakkında detaylı bilgi..."
                                    rows={4}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="duration_days">Süre (Gün)</Label>
                                    <Input
                                        id="duration_days"
                                        type="number"
                                        value={formData.duration_days}
                                        onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                                        placeholder="30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Fiyat</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Durum</Label>
                                <select
                                    id="status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                >
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Pasif</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    İptal
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? "Kaydediliyor..." : editingPackage ? "Güncelle" : "Oluştur"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Separator />

            {/* Packages List */}
            {packages.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/50">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground font-medium mb-1">
                        Henüz paket oluşturulmamış
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                        İlk paketinizi oluşturmak için yukarıdaki butona tıklayın
                    </p>
                    <Button onClick={() => handleOpenDialog()} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Yeni Paket Oluştur
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {packages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className="p-6 border rounded-lg hover:bg-muted/50 transition-colors space-y-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Package className="h-5 w-5 text-primary" />
                                        <h3 className="font-semibold text-lg">{pkg.title}</h3>
                                    </div>
                                    {pkg.status === 'active' ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Aktif
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                            <XCircle className="h-3 w-3" />
                                            Pasif
                                        </span>
                                    )}
                                </div>
                            </div>

                            {pkg.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {pkg.description}
                                </p>
                            )}

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {pkg.duration_days && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>{pkg.duration_days} gün</span>
                                    </div>
                                )}
                                {pkg.price && (
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="h-4 w-4" />
                                        <span>{pkg.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenDialog(pkg)}
                                    className="flex-1 gap-2"
                                >
                                    <Edit className="h-4 w-4" />
                                    Düzenle
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(pkg.id)}
                                    className="gap-2 text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Sil
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

