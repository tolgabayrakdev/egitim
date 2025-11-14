import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiUrl } from "@/lib/api";
import { toast } from "sonner";

interface InvitationInfo {
    email: string;
    inviterName: string;
    programTitle: string | null;
    programId: string | null;
    expiresAt: string;
}

export default function AcceptInvitation() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [invitationInfo, setInvitationInfo] = useState<InvitationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        phone: "",
        password: "",
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error("Geçersiz davet bağlantısı");
            navigate("/sign-in");
            return;
        }

        const fetchInvitation = async () => {
            try {
                const response = await fetch(apiUrl(`api/invitations/token?token=${token}`), {
                    credentials: "include",
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || "Davet bulunamadı");
                }

                const data = await response.json();
                setInvitationInfo(data.invitation);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Davet yüklenemedi";
                toast.error(errorMessage);
                setTimeout(() => navigate("/sign-in"), 2000);
            } finally {
                setLoading(false);
            }
        };

        fetchInvitation();
    }, [token, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // Telefon numarası için sadece rakamları al
        if (name === "phone") {
            const digitsOnly = value.replace(/\D/g, "");
            setFormData(prev => ({
                ...prev,
                [name]: digitsOnly
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        // Telefon numarası validasyonu (10 haneli olmalı)
        if (formData.phone.length !== 10) {
            toast.error("Telefon numarası 10 haneli olmalıdır");
            setSubmitting(false);
            return;
        }

        // Şifre validasyonu
        if (formData.password.length < 6) {
            toast.error("Şifre en az 6 karakter olmalıdır");
            setSubmitting(false);
            return;
        }

        try {
            // Telefon numarasına +90 ekle
            const fullPhone = `+90${formData.phone}`;
            
            const payload = {
                token,
                email: invitationInfo?.email,
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: fullPhone,
                password: formData.password,
            };

            const response = await fetch(apiUrl("api/invitations/accept"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Kayıt başarısız");
            }

            toast.success("Hesabınız başarıyla oluşturuldu! Giriş yapabilirsiniz.");
            // Sign-in sayfasına yönlendir
            setTimeout(() => navigate("/sign-in"), 1500);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Bir hata oluştu";
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Davet bilgileri yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!invitationInfo) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-4">
                    <div className="flex justify-center mb-6">
                        <img 
                            src="/logo.png" 
                            alt="EDIVORA" 
                            className="h-20 w-auto"
                        />
                    </div>
                    <h1 className="text-2xl font-semibold">Daveti Kabul Et</h1>
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">
                            <strong>{invitationInfo.inviterName}</strong> sizi sisteme davet etti.
                        </p>
                        {invitationInfo.programTitle && (
                            <p className="text-sm text-muted-foreground">
                                Program: <strong>{invitationInfo.programTitle}</strong>
                            </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">
                            E-posta: <strong>{invitationInfo.email}</strong>
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Hesabınızı oluşturmak için aşağıdaki bilgileri doldurun
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">Ad</Label>
                            <Input
                                id="first_name"
                                name="first_name"
                                type="text"
                                placeholder="Adınız"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                                disabled={submitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Soyad</Label>
                            <Input
                                id="last_name"
                                name="last_name"
                                type="text"
                                placeholder="Soyadınız"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">E-posta</Label>
                        <Input
                            id="email"
                            type="email"
                            value={invitationInfo.email}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                            Bu e-posta adresi davet ile belirlenmiştir ve değiştirilemez
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefon</Label>
                        <div className="flex items-center">
                            <span className="flex items-center h-9 px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                                +90
                            </span>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="555 123 45 67"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                disabled={submitting}
                                className="rounded-l-none"
                                maxLength={10}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Şifre</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={submitting}
                            minLength={6}
                        />
                        <p className="text-xs text-muted-foreground">
                            Şifre en az 6 karakter olmalıdır
                        </p>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={submitting}
                    >
                        {submitting ? "Kayıt yapılıyor..." : "Daveti Kabul Et ve Kayıt Ol"}
                    </Button>
                </form>
            </div>
        </div>
    );
}

