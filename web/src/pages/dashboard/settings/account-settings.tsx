import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { User, Lock, Trash2, Edit2, Mail, Phone, Save, X } from "lucide-react";

interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
}

export default function AccountSettings() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [originalFormData, setOriginalFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
    });
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [deleteConfirmText, setDeleteConfirmText] = useState("");

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const response = await fetch(apiUrl("api/auth/me"), {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Kullanıcı bilgileri alınamadı");
            }

            const data = await response.json();
            if (data.success && data.user) {
                const userData = data.user;
                setUser(userData);
                const initialData = {
                    first_name: userData.first_name || "",
                    last_name: userData.last_name || "",
                    email: userData.email || "",
                    phone: userData.phone?.replace("+90", "") || "",
                };
                setFormData(initialData);
                setOriginalFormData(initialData);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Bir hata oluştu";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setFormData(originalFormData);
        setIsEditing(false);
        setError("");
        setSuccess("");
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setUpdating(true);

        try {
            const response = await fetch(apiUrl("api/auth/update-user"), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Güncelleme başarısız");
            }

            setSuccess("Kullanıcı bilgileri başarıyla güncellendi");
            toast.success("Kullanıcı bilgileri başarıyla güncellendi");
            await fetchUser(); // Kullanıcı bilgilerini yeniden yükle
            setIsEditing(false);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Bir hata oluştu";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setUpdating(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError("Yeni şifreler eşleşmiyor");
            toast.error("Yeni şifreler eşleşmiyor");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError("Şifre en az 6 karakter olmalıdır");
            toast.error("Şifre en az 6 karakter olmalıdır");
            return;
        }

        setChangingPassword(true);

        try {
            const response = await fetch(apiUrl("api/auth/change-password"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Şifre değiştirme başarısız");
            }

            setSuccess("Şifre başarıyla değiştirildi");
            toast.success("Şifre başarıyla değiştirildi");
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Bir hata oluştu";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== "Hesabımı silmek istiyorum") {
            setError("Lütfen 'Hesabımı silmek istiyorum' yazın");
            toast.error("Lütfen 'Hesabımı silmek istiyorum' yazın");
            return;
        }

        setError("");
        setDeletingAccount(true);

        try {
            const response = await fetch(apiUrl("api/auth/delete-account"), {
                method: "DELETE",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Hesap silme başarısız");
            }

            toast.success("Hesabınız başarıyla silindi");
            // Logout ve sign-in sayfasına yönlendir
            navigate("/sign-in");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Bir hata oluştu";
            setError(errorMessage);
            toast.error(errorMessage);
            setDeleteConfirmOpen(false);
        } finally {
            setDeletingAccount(false);
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

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Alert variant="destructive">
                    <AlertTitle>Hata</AlertTitle>
                    <AlertDescription>Kullanıcı bilgileri yüklenemedi</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Hesap Ayarları</h1>
                <p className="text-muted-foreground">
                    Hesap bilgilerinizi ve güvenlik ayarlarınızı buradan yönetebilirsiniz.
                </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <Alert variant="destructive" className="animate-in fade-in-0">
                    <AlertTitle>Hata</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="animate-in fade-in-0 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                    <AlertTitle className="text-green-800 dark:text-green-200">Başarılı</AlertTitle>
                    <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
                </Alert>
            )}

            {/* Kullanıcı Bilgileri Güncelleme */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Kullanıcı Bilgileri</h2>
                            <p className="text-sm text-muted-foreground">
                                Kişisel bilgilerinizi güncelleyin
                            </p>
                        </div>
                    </div>
                    {!isEditing ? (
                        <Button onClick={handleEdit} variant="outline" size="sm" className="gap-2">
                            <Edit2 className="h-4 w-4" />
                            Düzenle
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={updating}
                                size="sm"
                                className="gap-2"
                            >
                                <X className="h-4 w-4" />
                                İptal
                            </Button>
                            <Button
                                type="submit"
                                form="user-form"
                                disabled={updating}
                                size="sm"
                                className="gap-2"
                            >
                                <Save className="h-4 w-4" />
                                {updating ? "Kaydediliyor..." : "Kaydet"}
                            </Button>
                        </div>
                    )}
                </div>
                
                <Separator />
                
                <form id="user-form" onSubmit={handleUpdateUser} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="first_name" className="text-sm font-medium">
                                Ad
                            </Label>
                            <Input
                                id="first_name"
                                value={formData.first_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, first_name: e.target.value })
                                }
                                disabled={!isEditing}
                                required
                                className="transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name" className="text-sm font-medium">
                                Soyad
                            </Label>
                            <Input
                                id="last_name"
                                value={formData.last_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, last_name: e.target.value })
                                }
                                disabled={!isEditing}
                                required
                                className="transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                E-posta
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                disabled
                                className="bg-muted/50 cursor-not-allowed"
                            />
                            <p className="text-xs text-muted-foreground">E-posta adresi değiştirilemez</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                Telefon
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                disabled
                                className="bg-muted/50 cursor-not-allowed"
                            />
                            <p className="text-xs text-muted-foreground">Telefon numarası değiştirilemez</p>
                        </div>
                    </div>
                </form>
            </div>

            {/* Şifre Değiştirme */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                        <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Şifre Değiştir</h2>
                        <p className="text-sm text-muted-foreground">
                            Hesap güvenliğiniz için düzenli olarak şifrenizi güncelleyin
                        </p>
                    </div>
                </div>
                
                <Separator />
                
                <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-sm font-medium">
                            Mevcut Şifre
                        </Label>
                        <Input
                            id="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                                setPasswordData({ ...passwordData, currentPassword: e.target.value })
                            }
                            required
                            placeholder="••••••••"
                            className="transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm font-medium">
                            Yeni Şifre
                        </Label>
                        <Input
                            id="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) =>
                                setPasswordData({ ...passwordData, newPassword: e.target.value })
                            }
                            required
                            minLength={6}
                            placeholder="••••••••"
                            className="transition-all"
                        />
                        <p className="text-xs text-muted-foreground">
                            En az 6 karakter olmalıdır
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium">
                            Yeni Şifre (Tekrar)
                        </Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                            }
                            required
                            minLength={6}
                            placeholder="••••••••"
                            className="transition-all"
                        />
                        {passwordData.newPassword && passwordData.confirmPassword && (
                            <p className={`text-xs ${
                                passwordData.newPassword === passwordData.confirmPassword
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                            }`}>
                                {passwordData.newPassword === passwordData.confirmPassword
                                    ? "Şifreler eşleşiyor"
                                    : "Şifreler eşleşmiyor"}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={changingPassword} className="gap-2">
                            <Lock className="h-4 w-4" />
                            {changingPassword ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Hesap Silme */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-destructive/10 p-2">
                        <Trash2 className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-destructive">Hesabı Sil</h2>
                        <p className="text-sm text-muted-foreground">
                            Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz?
                        </p>
                    </div>
                </div>
                
                <Separator />
                
                <div className="rounded-lg bg-destructive/5 p-4 space-y-3">
                    <div className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-destructive mt-1.5" />
                        <div className="space-y-1 flex-1">
                            <p className="text-sm font-medium text-destructive">
                                Bu işlem geri alınamaz
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Hesabınız ve tüm verileriniz kalıcı olarak silinecektir. 
                                Bu işlemden sonra hesabınıza erişemezsiniz.
                            </p>
                        </div>
                    </div>
                </div>
                
                <Dialog open={deleteConfirmOpen} onOpenChange={(open) => {
                    setDeleteConfirmOpen(open);
                    if (!open) {
                        setDeleteConfirmText("");
                        setError("");
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button variant="destructive" className="gap-2">
                            <Trash2 className="h-4 w-4" />
                            Hesabı Sil
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="rounded-lg bg-destructive/10 p-2">
                                    <Trash2 className="h-5 w-5 text-destructive" />
                                </div>
                                <DialogTitle className="text-destructive">
                                    Hesabı Silmek İstediğinizden Emin misiniz?
                                </DialogTitle>
                            </div>
                            <DialogDescription className="space-y-3 pt-2">
                                <p>
                                    Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı olarak silinecektir.
                                </p>
                                <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3">
                                    <p className="text-sm font-medium mb-1">
                                        Devam etmek için lütfen aşağıya yazın:
                                    </p>
                                    <p className="text-sm font-mono text-destructive">
                                        "Hesabımı silmek istiyorum"
                                    </p>
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="deleteConfirm" className="text-sm font-medium">
                                    Onay Metni
                                </Label>
                                <Input
                                    id="deleteConfirm"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    placeholder="Hesabımı silmek istiyorum"
                                    disabled={deletingAccount}
                                    className="font-mono"
                                />
                            </div>
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setDeleteConfirmOpen(false);
                                    setDeleteConfirmText("");
                                    setError("");
                                }}
                                disabled={deletingAccount}
                            >
                                İptal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteAccount}
                                disabled={deletingAccount || deleteConfirmText !== "Hesabımı silmek istiyorum"}
                                className="gap-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                {deletingAccount ? "Siliniyor..." : "Evet, Hesabı Sil"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
