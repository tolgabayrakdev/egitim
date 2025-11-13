import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiUrl } from "@/lib/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setLoading(true);

        try {
            const response = await fetch(apiUrl("api/auth/forgot-password"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.message?.message || data.message || "Bir hata oluştu";
                throw new Error(errorMessage);
            }

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
                    <h1 className="text-2xl font-semibold">Şifremi Unuttum</h1>
                    <p className="text-sm text-muted-foreground">
                        E-posta adresinize şifre sıfırlama bağlantısı göndereceğiz
                    </p>
                </div>
                {success ? (
                    <div className="space-y-4">
                        <div className="p-4 text-sm bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 rounded-md border border-green-200 dark:border-green-800">
                            <p className="font-medium">E-posta gönderildi!</p>
                            <p className="mt-2">
                                E-posta adresinize şifre sıfırlama bağlantısı gönderildi. 
                                Lütfen e-postanızı kontrol edin.
                            </p>
                        </div>
                        <div className="text-center">
                            <Link to="/sign-in">
                                <Button variant="outline" className="w-full">
                                    Giriş Sayfasına Dön
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">E-posta</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="ornek@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={loading}
                        >
                            {loading ? "Gönderiliyor..." : "Şifre Sıfırlama Bağlantısı Gönder"}
                        </Button>
                    </form>
                )}
                <div className="text-center text-sm">
                    <Link 
                        to="/sign-in" 
                        className="text-primary hover:underline"
                    >
                        Giriş sayfasına dön
                    </Link>
                </div>
            </div>
        </div>
    );
}
