import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiUrl } from "@/lib/api";

type Step = "login" | "emailOtp" | "smsOtp";

export default function SignIn() {
    const [step, setStep] = useState<Step>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailOtpCode, setEmailOtpCode] = useState("");
    const [smsOtpCode, setSmsOtpCode] = useState("");
    const [maskedPhone, setMaskedPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(apiUrl("api/auth/login"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.status === 202) {
                if (data.message === "E-posta doğrulaması gerekli") {
                    setStep("emailOtp");
                } else if (data.message === "SMS doğrulaması gerekli") {
                    setMaskedPhone(data.maskedPhone);
                    setStep("smsOtp");
                }
                return;
            }

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

    const handleEmailOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(apiUrl("api/auth/verify-email-otp"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, code: emailOtpCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "E-posta doğrulama başarısız");
            }

            // Email doğrulandı, şimdi SMS OTP gönder
            const loginResponse = await fetch(apiUrl("api/auth/login"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const loginData = await loginResponse.json();

            if (loginResponse.status === 202 && loginData.message === "SMS doğrulaması gerekli") {
                setMaskedPhone(loginData.maskedPhone);
                setStep("smsOtp");
            } else if (loginResponse.ok) {
                navigate("/");
            } else {
                throw new Error(loginData.message || "Giriş başarısız");
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Bir hata oluştu";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSmsOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(apiUrl("api/auth/verify-sms-otp"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, code: smsOtpCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "SMS doğrulama başarısız");
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
                    <h1 className="text-2xl font-semibold">
                        {step === "login" && "Giriş Yap"}
                        {step === "emailOtp" && "E-posta Doğrulama"}
                        {step === "smsOtp" && "SMS Doğrulama"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {step === "login" && "Hesabınıza giriş yapmak için bilgilerinizi girin"}
                        {step === "emailOtp" && `${email} adresine gönderilen 6 haneli doğrulama kodunu girin`}
                        {step === "smsOtp" && `${maskedPhone} numarasına gönderilen 6 haneli doğrulama kodunu girin`}
                    </p>
                </div>
                
                {step === "login" && (
                    <form onSubmit={handleLogin} className="space-y-4">
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
                )}

                {step === "emailOtp" && (
                    <form onSubmit={handleEmailOtpSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="emailOtp">E-posta Doğrulama Kodu</Label>
                            <Input
                                id="emailOtp"
                                type="text"
                                placeholder="123456"
                                value={emailOtpCode}
                                onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                required
                                disabled={loading}
                                maxLength={6}
                                className="text-center text-2xl tracking-widest"
                            />
                        </div>
                        <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={loading || emailOtpCode.length !== 6}
                        >
                            {loading ? "Doğrulanıyor..." : "Doğrula"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => setStep("login")}
                            disabled={loading}
                        >
                            Geri
                        </Button>
                    </form>
                )}

                {step === "smsOtp" && (
                    <form onSubmit={handleSmsOtpSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="smsOtp">SMS Doğrulama Kodu</Label>
                            <Input
                                id="smsOtp"
                                type="text"
                                placeholder="123456"
                                value={smsOtpCode}
                                onChange={(e) => setSmsOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                required
                                disabled={loading}
                                maxLength={6}
                                className="text-center text-2xl tracking-widest"
                            />
                        </div>
                        <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={loading || smsOtpCode.length !== 6}
                        >
                            {loading ? "Doğrulanıyor..." : "Doğrula"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => setStep("login")}
                            disabled={loading}
                        >
                            Geri
                        </Button>
                    </form>
                )}

                {step === "login" && (
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
                )}
            </div>
        </div>
    );
}
