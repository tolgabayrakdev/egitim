import { useState, useEffect } from "react";
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
    const [emailOtpCode, setEmailOtpCode] = useState(["", "", "", "", "", ""]);
    const [smsOtpCode, setSmsOtpCode] = useState(["", "", "", "", "", ""]);
    const [maskedPhone, setMaskedPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [captchaNum1, setCaptchaNum1] = useState(0);
    const [captchaNum2, setCaptchaNum2] = useState(0);
    const [captchaAnswer, setCaptchaAnswer] = useState("");
    const [smsTimer, setSmsTimer] = useState(0);
    const [resendingEmail, setResendingEmail] = useState(false);
    const [resendingSms, setResendingSms] = useState(false);
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
                    // User is not logged in, show sign-in form
                    setCheckingAuth(false);
                }
            } catch {
                // Error checking auth, show sign-in form
                setCheckingAuth(false);
            }
        };

        checkAuth();
    }, [navigate]);

    // Generate new captcha
    const generateCaptcha = () => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        setCaptchaNum1(num1);
        setCaptchaNum2(num2);
        setCaptchaAnswer("");
    };

    useEffect(() => {
        generateCaptcha();
    }, []);

    // SMS timer effect
    useEffect(() => {
        if (step === "smsOtp" && smsTimer > 0) {
            const interval = setInterval(() => {
                setSmsTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [step, smsTimer]);

    // Start SMS timer when SMS step is reached
    useEffect(() => {
        if (step === "smsOtp") {
            setSmsTimer(180); // 3 minutes = 180 seconds
        }
    }, [step]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        // Validate captcha
        const userAnswer = parseInt(captchaAnswer);
        const correctAnswer = captchaNum1 + captchaNum2;
        
        if (isNaN(userAnswer) || userAnswer !== correctAnswer) {
            setError("Güvenlik sorusu cevabı yanlış. Lütfen tekrar deneyin.");
            generateCaptcha();
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(apiUrl("api/auth/login"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ 
                    email, 
                    password,
                    captchaAnswer: userAnswer,
                    captchaSum: correctAnswer
                }),
            });

            const data = await response.json();

            if (response.status === 202) {
                if (data.message === "E-posta doğrulaması gerekli") {
                    setStep("emailOtp");
                } else if (data.message === "SMS doğrulaması gerekli") {
                    setMaskedPhone(data.maskedPhone);
                    setStep("smsOtp");
                    setSmsTimer(180); // Start 3 minute timer
                }
                return;
            }

            if (!response.ok) {
                generateCaptcha(); // Generate new captcha on error
                throw new Error(data.message || "Giriş başarısız");
            }

            // Başarılı giriş
            navigate("/");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Bir hata oluştu";
            setError(errorMessage);
            generateCaptcha(); // Generate new captcha on error
        } finally {
            setLoading(false);
        }
    };

    const handleEmailOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Paste event - handle multiple digits
            const digits = value.replace(/\D/g, "").slice(0, 6).split("");
            const newCode = [...emailOtpCode];
            digits.forEach((digit, i) => {
                if (index + i < 6) {
                    newCode[index + i] = digit;
                }
            });
            setEmailOtpCode(newCode);
            // Focus on the last filled input or the last one
            const lastIndex = Math.min(index + digits.length - 1, 5);
            const nextInput = document.getElementById(`emailOtp-${lastIndex}`);
            if (nextInput) {
                (nextInput as HTMLInputElement).focus();
            }
        } else {
            // Single digit input
            const newCode = [...emailOtpCode];
            newCode[index] = value.replace(/\D/g, "").slice(0, 1);
            setEmailOtpCode(newCode);
            
            // Auto-focus next input
            if (value && index < 5) {
                const nextInput = document.getElementById(`emailOtp-${index + 1}`);
                if (nextInput) {
                    (nextInput as HTMLInputElement).focus();
                }
            }
        }
    };

    const handleEmailOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !emailOtpCode[index] && index > 0) {
            const prevInput = document.getElementById(`emailOtp-${index - 1}`);
            if (prevInput) {
                (prevInput as HTMLInputElement).focus();
            }
        }
    };

    const handleEmailOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const code = emailOtpCode.join("");
        if (code.length !== 6) {
            setError("Lütfen 6 haneli kodu girin");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(apiUrl("api/auth/verify-email-otp"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, code }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "E-posta doğrulama başarısız");
            }

            // Email doğrulandı, şimdi SMS OTP gönder
            // Generate new captcha for second login attempt
            const num1 = Math.floor(Math.random() * 10) + 1;
            const num2 = Math.floor(Math.random() * 10) + 1;
            const captchaSum = num1 + num2;
            
            const loginResponse = await fetch(apiUrl("api/auth/login"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ 
                    email, 
                    password,
                    captchaAnswer: captchaSum,
                    captchaSum: captchaSum
                }),
            });

            const loginData = await loginResponse.json();

            if (loginResponse.status === 202 && loginData.message === "SMS doğrulaması gerekli") {
                setMaskedPhone(loginData.maskedPhone);
                setStep("smsOtp");
                setSmsTimer(180); // Start 3 minute timer
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

    const handleSmsOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Paste event - handle multiple digits
            const digits = value.replace(/\D/g, "").slice(0, 6).split("");
            const newCode = [...smsOtpCode];
            digits.forEach((digit, i) => {
                if (index + i < 6) {
                    newCode[index + i] = digit;
                }
            });
            setSmsOtpCode(newCode);
            // Focus on the last filled input or the last one
            const lastIndex = Math.min(index + digits.length - 1, 5);
            const nextInput = document.getElementById(`smsOtp-${lastIndex}`);
            if (nextInput) {
                (nextInput as HTMLInputElement).focus();
            }
        } else {
            // Single digit input
            const newCode = [...smsOtpCode];
            newCode[index] = value.replace(/\D/g, "").slice(0, 1);
            setSmsOtpCode(newCode);
            
            // Auto-focus next input
            if (value && index < 5) {
                const nextInput = document.getElementById(`smsOtp-${index + 1}`);
                if (nextInput) {
                    (nextInput as HTMLInputElement).focus();
                }
            }
        }
    };

    const handleSmsOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !smsOtpCode[index] && index > 0) {
            const prevInput = document.getElementById(`smsOtp-${index - 1}`);
            if (prevInput) {
                (prevInput as HTMLInputElement).focus();
            }
        }
    };

    const handleResendEmail = async () => {
        setResendingEmail(true);
        setError("");
        try {
            const response = await fetch(apiUrl("api/auth/resend-verification-email"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "E-posta gönderilemedi");
            }

            // Reset OTP code
            setEmailOtpCode(["", "", "", "", "", ""]);
            // Focus first input
            setTimeout(() => {
                const firstInput = document.getElementById("emailOtp-0");
                if (firstInput) {
                    (firstInput as HTMLInputElement).focus();
                }
            }, 100);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Bir hata oluştu";
            setError(errorMessage);
        } finally {
            setResendingEmail(false);
        }
    };

    const handleResendSms = async () => {
        if (smsTimer > 0) {
            return; // Don't allow resend if timer is still running
        }

        setResendingSms(true);
        setError("");
        try {
            const response = await fetch(apiUrl("api/auth/resend-sms-verification"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "SMS gönderilemedi");
            }

            // Reset OTP code and timer
            setSmsOtpCode(["", "", "", "", "", ""]);
            setSmsTimer(180); // Reset to 3 minutes
            // Focus first input
            setTimeout(() => {
                const firstInput = document.getElementById("smsOtp-0");
                if (firstInput) {
                    (firstInput as HTMLInputElement).focus();
                }
            }, 100);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Bir hata oluştu";
            setError(errorMessage);
        } finally {
            setResendingSms(false);
        }
    };

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleSmsOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const code = smsOtpCode.join("");
        if (code.length !== 6) {
            setError("Lütfen 6 haneli kodu girin");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(apiUrl("api/auth/verify-sms-otp"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, code }),
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
                            src="" 
                            alt="" 
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
                        <div className="flex items-center gap-2">
                            <Label htmlFor="captcha" className="text-sm whitespace-nowrap">Güvenlik:</Label>
                            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-muted rounded border text-sm">
                                <span className="font-medium">{captchaNum1}</span>
                                <span>+</span>
                                <span className="font-medium">{captchaNum2}</span>
                                <span>=</span>
                            </div>
                            <Input
                                id="captcha"
                                type="number"
                                placeholder="?"
                                value={captchaAnswer}
                                onChange={(e) => setCaptchaAnswer(e.target.value)}
                                required
                                disabled={loading}
                                className="w-16 h-9"
                                min="0"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={generateCaptcha}
                                disabled={loading}
                                title="Yenile"
                                className="h-9 w-9"
                            >
                                🔄
                            </Button>
                        </div>
                        <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={loading || !captchaAnswer}
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
                            <Label>E-posta Doğrulama Kodu</Label>
                            <div className="flex justify-center gap-2">
                                {emailOtpCode.map((digit, index) => (
                                    <Input
                                        key={index}
                                        id={`emailOtp-${index}`}
                                        type="text"
                                        inputMode="numeric"
                                        value={digit}
                                        onChange={(e) => handleEmailOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleEmailOtpKeyDown(index, e)}
                                        required
                                        disabled={loading}
                                        maxLength={1}
                                        className="w-12 h-14 text-center text-2xl font-semibold"
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>
                        </div>
                        <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={loading || emailOtpCode.join("").length !== 6}
                        >
                            {loading ? "Doğrulanıyor..." : "Doğrula"}
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setStep("login");
                                    setEmailOtpCode(["", "", "", "", "", ""]);
                                }}
                                disabled={loading}
                            >
                                Geri
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={handleResendEmail}
                                disabled={loading || resendingEmail}
                            >
                                {resendingEmail ? "Gönderiliyor..." : "Tekrar Gönder"}
                            </Button>
                        </div>
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
                            <Label>SMS Doğrulama Kodu</Label>
                            <div className="flex justify-center gap-2">
                                {smsOtpCode.map((digit, index) => (
                                    <Input
                                        key={index}
                                        id={`smsOtp-${index}`}
                                        type="text"
                                        inputMode="numeric"
                                        value={digit}
                                        onChange={(e) => handleSmsOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleSmsOtpKeyDown(index, e)}
                                        required
                                        disabled={loading}
                                        maxLength={1}
                                        className="w-12 h-14 text-center text-2xl font-semibold"
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>
                        </div>
                        <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={loading || smsOtpCode.join("").length !== 6}
                        >
                            {loading ? "Doğrulanıyor..." : "Doğrula"}
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setStep("login");
                                    setSmsOtpCode(["", "", "", "", "", ""]);
                                    setSmsTimer(0);
                                }}
                                disabled={loading}
                            >
                                Geri
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={handleResendSms}
                                disabled={loading || resendingSms || smsTimer > 0}
                            >
                                {resendingSms 
                                    ? "Gönderiliyor..." 
                                    : smsTimer > 0 
                                        ? `Tekrar Gönder (${formatTimer(smsTimer)})`
                                        : "Tekrar Gönder"}
                            </Button>
                        </div>
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
