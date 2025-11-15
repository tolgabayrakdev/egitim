import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiUrl } from "@/lib/api";

export default function SignUp() {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        specialty: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const navigate = useNavigate();

    // Check if user is already logged in
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch(apiUrl("api/auth/me"), {
                    method: "GET",
                    credentials: "include",
                });

                if (response.ok) {
                    // User is already logged in, redirect to dashboard
                    navigate("/");
                } else {
                    // User is not logged in, show sign-up form
                    setCheckingAuth(false);
                }
            } catch {
                // Error checking auth, show sign-up form
                setCheckingAuth(false);
            }
        };

        checkAuth();
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        setError("");
        setSuccess(false);

        // Specialty artık opsiyonel

        // Telefon numarası validasyonu (10 haneli olmalı)
        if (formData.phone.length !== 10) {
            setError("Telefon numarası 10 haneli olmalıdır");
            return;
        }

        setLoading(true);

        try {
            // Telefon numarasına +90 ekle
            const fullPhone = `+90${formData.phone}`;
            
            const payload = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone: fullPhone,
                password: formData.password,
                specialty: formData.specialty,
            };

            const response = await fetch(apiUrl("api/auth/register"), {
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

            // Başarılı kayıt
            setSuccess(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Bir hata oluştu";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Show loading while checking authentication
    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <div className="text-muted-foreground">Yükleniyor...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-4">
                    <div className="flex justify-center mb-6">
                        <img 
                            src="/" 
                            alt="" 
                            className="h-20 w-auto"
                        />
                    </div>
                    <h1 className="text-2xl font-semibold">Kayıt Ol</h1>
                    <p className="text-sm text-muted-foreground">
                        Hesap oluşturmak için bilgilerinizi girin
                    </p>
                </div>
                {success ? (
                    <div className="space-y-4">
                        <div className="p-4 text-sm bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 rounded-md border border-green-200 dark:border-green-800">
                            <p className="font-medium">Hesabınız başarıyla oluşturuldu!</p>
                            <p className="mt-2">
                                Giriş yaparak hesabınızı doğrulayabilirsiniz. 
                                Giriş yaptığınızda e-posta adresinize doğrulama kodu gönderilecektir.
                            </p>
                        </div>
                        <Button 
                            onClick={() => navigate("/sign-in")}
                            className="w-full"
                        >
                            Giriş Ekranına Git
                        </Button>
                    </div>
                ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                            {error}
                        </div>
                    )}
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
                                disabled={loading}
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
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">E-posta</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="ornek@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
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
                                disabled={loading}
                                className="rounded-l-none"
                                maxLength={10}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="specialty">Uzmanlık Alanı (Opsiyonel)</Label>
                        <Input
                            id="specialty"
                            name="specialty"
                            type="text"
                            placeholder="Örn: Psikoloji, Eğitim, Koçluk"
                            value={formData.specialty}
                            onChange={handleChange}
                            disabled={loading}
                        />
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
                            disabled={loading}
                            minLength={6}
                        />
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loading}
                    >
                        {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
                    </Button>
                </form>
                )}
                {!success && (
                <div className="text-center text-sm">
                    Zaten hesabınız var mı?{" "}
                    <Link 
                        to="/sign-in" 
                        className="text-primary hover:underline font-medium"
                    >
                        Giriş yapın
                    </Link>
                </div>
                )}
            </div>
        </div>
    );
}
