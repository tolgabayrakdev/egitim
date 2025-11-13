import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUp() {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        role: "participant" as "professional" | "participant",
        specialty: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

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

        // Professional ise specialty zorunlu
        if (formData.role === "professional" && !formData.specialty.trim()) {
            setError("Profesyonel kullanıcılar için uzmanlık alanı zorunludur");
            return;
        }

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
                role: formData.role,
                ...(formData.role === "professional" && { specialty: formData.specialty }),
            };

            const response = await fetch("http://localhost:1234/api/auth/register", {
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
                    <h1 className="text-2xl font-semibold">Kayıt Ol</h1>
                    <p className="text-sm text-muted-foreground">
                        Yeni hesap oluşturmak için bilgilerinizi girin
                    </p>
                </div>
                {success ? (
                    <div className="space-y-4">
                        <div className="p-4 text-sm bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 rounded-md border border-green-200 dark:border-green-800">
                            <p className="font-medium">Hesabınız başarıyla oluşturuldu!</p>
                            <p className="mt-2">
                                E-posta adresinize doğrulama linki gönderilmiştir. 
                                Lütfen e-postanızı kontrol edin.
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
                        <Label htmlFor="role">Rol</Label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            disabled={loading}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        >
                            <option value="participant">Katılımcı</option>
                            <option value="professional">Profesyonel</option>
                        </select>
                    </div>
                    {formData.role === "professional" && (
                        <div className="space-y-2">
                            <Label htmlFor="specialty">Uzmanlık Alanı</Label>
                            <Input
                                id="specialty"
                                name="specialty"
                                type="text"
                                placeholder="Örn: Psikoloji, Eğitim, Koçluk"
                                value={formData.specialty}
                                onChange={handleChange}
                                required={formData.role === "professional"}
                                disabled={loading}
                            />
                        </div>
                    )}
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
