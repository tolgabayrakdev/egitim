import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { apiUrl } from "@/lib/api";
import { toast } from "sonner";
import { CreditCard, Lock, ArrowLeft, Save } from "lucide-react";

interface Plan {
    id: string;
    name: string;
    duration: string;
    price: number;
    original_price?: number;
}

export default function PaymentPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const planId = searchParams.get("planId");
    const [loading, setLoading] = useState(false);
    const [fetchingPlan, setFetchingPlan] = useState(true);
    const [error, setError] = useState("");
    const [plan, setPlan] = useState<Plan | null>(null);
    const [paymentData, setPaymentData] = useState({
        cardNumber: "",
        cardName: "",
        expiryDate: "",
        cvv: "",
    });

    useEffect(() => {
        if (!planId) {
            toast.error("Geçersiz plan seçimi");
            navigate("/subscription");
            return;
        }

        const fetchPlan = async () => {
            try {
                setFetchingPlan(true);
                const response = await fetch(apiUrl("api/subscription/plans"), {
                    method: "GET",
                    credentials: "include",
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    const foundPlan = data.plans.find((p: Plan) => p.id === planId);
                    if (foundPlan) {
                        setPlan(foundPlan);
                    } else {
                        toast.error("Plan bulunamadı");
                        navigate("/subscription");
                    }
                } else {
                    toast.error("Plan bilgileri yüklenemedi");
                    navigate("/subscription");
                }
            } catch (error) {
                toast.error("Bir hata oluştu");
                console.error(error);
                navigate("/subscription");
            } finally {
                setFetchingPlan(false);
            }
        };

        fetchPlan();
    }, [planId, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        if (name === "cardNumber") {
            const digitsOnly = value.replace(/\D/g, "").slice(0, 16);
            const formatted = digitsOnly.replace(/(.{4})/g, "$1 ").trim();
            setPaymentData(prev => ({ ...prev, [name]: formatted }));
        } else if (name === "expiryDate") {
            const digitsOnly = value.replace(/\D/g, "").slice(0, 4);
            const formatted = digitsOnly.replace(/(.{2})/, "$1/");
            setPaymentData(prev => ({ ...prev, [name]: formatted }));
        } else if (name === "cvv") {
            const digitsOnly = value.replace(/\D/g, "").slice(0, 3);
            setPaymentData(prev => ({ ...prev, [name]: digitsOnly }));
        } else {
            setPaymentData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Validasyon
        if (paymentData.cardNumber.replace(/\s/g, "").length !== 16) {
            setError("Kart numarası 16 haneli olmalıdır");
            toast.error("Kart numarası 16 haneli olmalıdır");
            setLoading(false);
            return;
        }

        if (paymentData.expiryDate.length !== 5) {
            setError("Son kullanma tarihi geçerli değil");
            toast.error("Son kullanma tarihi geçerli değil");
            setLoading(false);
            return;
        }

        if (paymentData.cvv.length !== 3) {
            setError("CVV 3 haneli olmalıdır");
            toast.error("CVV 3 haneli olmalıdır");
            setLoading(false);
            return;
        }

        try {
            // Simüle edilmiş ödeme işlemi
            await new Promise(resolve => setTimeout(resolve, 2000));

            const response = await fetch(apiUrl("api/subscription/create"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    planId: planId,
                    paymentMethod: "credit_card"
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Ödeme işlemi başarısız");
            }

            toast.success("Ödeme başarıyla tamamlandı! Yönlendiriliyorsunuz...");
            setTimeout(() => {
                window.location.href = "/";
            }, 1500);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Bir hata oluştu";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (fetchingPlan) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <div className="text-muted-foreground">Plan bilgileri yükleniyor...</div>
                </div>
            </div>
        );
    }

    if (!plan) {
        return null;
    }

    const planName = plan.name === 'pro' ? 'Pro' : 'Premium';
    const planPrice = Number(plan.price);
    const isYearly = plan.duration === 'yearly';
    const monthlyPrice = isYearly ? (planPrice / 12).toFixed(2) : planPrice.toFixed(2);

    return (
        <div className="space-y-8 p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/subscription")}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Geri
                    </Button>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Ödeme Bilgileri</h1>
                <p className="text-muted-foreground">
                    {planName} {isYearly ? 'Yıllık' : 'Aylık'} planını seçtiniz. Ödeme bilgilerinizi girin.
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <Alert variant="destructive" className="animate-in fade-in-0">
                    <AlertTitle>Hata</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Ödeme Formu */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Kart Bilgileri</h2>
                        <p className="text-sm text-muted-foreground">
                            Ödeme işleminizi tamamlamak için kart bilgilerinizi girin
                        </p>
                    </div>
                </div>
                
                <Separator />
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Plan Özeti */}
                    <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium">{planName} Plan</p>
                                    {isYearly && (
                                        <Badge variant="secondary" className="text-xs">
                                            %20 İndirim
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {isYearly ? 'Yıllık faturalandırma' : 'Aylık faturalandırma'}
                                </p>
                                {isYearly && plan.original_price && (
                                    <p className="text-xs text-muted-foreground line-through mt-1">
                                        {Number(plan.original_price).toFixed(2)}₺
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold">{planPrice.toFixed(2)}₺</p>
                                <p className="text-xs text-muted-foreground">
                                    /{isYearly ? 'yıl' : 'ay'}
                                </p>
                                {isYearly && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Aylık: {monthlyPrice}₺
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="cardNumber" className="text-sm font-medium flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                Kart Numarası
                            </Label>
                            <Input
                                id="cardNumber"
                                name="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                value={paymentData.cardNumber}
                                onChange={handleInputChange}
                                required
                                disabled={loading}
                                maxLength={19}
                                className="transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cardName" className="text-sm font-medium">
                                Kart Üzerindeki İsim
                            </Label>
                            <Input
                                id="cardName"
                                name="cardName"
                                placeholder="Ad Soyad"
                                value={paymentData.cardName}
                                onChange={handleInputChange}
                                required
                                disabled={loading}
                                className="transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="expiryDate" className="text-sm font-medium">
                                Son Kullanma Tarihi
                            </Label>
                            <Input
                                id="expiryDate"
                                name="expiryDate"
                                placeholder="MM/YY"
                                value={paymentData.expiryDate}
                                onChange={handleInputChange}
                                required
                                disabled={loading}
                                maxLength={5}
                                className="transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cvv" className="text-sm font-medium">
                                CVV
                            </Label>
                            <Input
                                id="cvv"
                                name="cvv"
                                placeholder="123"
                                type="password"
                                value={paymentData.cvv}
                                onChange={handleInputChange}
                                required
                                disabled={loading}
                                maxLength={3}
                                className="transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                        <Lock className="h-4 w-4 shrink-0" />
                        <span>Ödeme bilgileriniz güvenli bir şekilde işlenir ve saklanmaz</span>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/subscription")}
                            disabled={loading}
                        >
                            İptal
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="gap-2"
                        >
                            <Save className="h-4 w-4" />
                            {loading ? "İşleniyor..." : `${planPrice.toFixed(2)}₺ Öde ve Abone Ol`}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
