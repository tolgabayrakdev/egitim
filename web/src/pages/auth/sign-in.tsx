import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:1234/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Giriş başarısız");
            }

            // Başarılı giriş
            navigate("/");
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
                    <h1 className="text-2xl font-semibold">Giriş Yap</h1>
                    <p className="text-sm text-muted-foreground">
                        Hesabınıza giriş yapmak için bilgilerinizi girin
                    </p>
                </div>
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
                    <div className="space-y-2">
                        <Label htmlFor="password">Şifre</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loading}
                    >
                        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </Button>
                </form>
                <div className="space-y-2 text-center text-sm">
                    <div>
                        <Link 
                            to="/forgot-password" 
                            className="text-primary hover:underline"
                        >
                            Şifremi unuttum
                        </Link>
                    </div>
                    <div>
                        Hesabınız yok mu?{" "}
                        <Link 
                            to="/sign-up" 
                            className="text-primary hover:underline font-medium"
                        >
                            Kayıt olun
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
