import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Crown, Zap, CreditCard, Sparkles, Gift } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { toast } from "sonner";

interface Plan {
    id: string;
    name: string;
    duration: string;
    price: number;
    original_price?: number;
}

interface SubscriptionPlan {
    id: string;
    name: string;
    duration: string;
    price: number;
    originalPrice?: number;
    features: string[];
    icon: React.ReactNode;
    popular?: boolean;
}

export default function SubscriptionPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [trialLoading, setTrialLoading] = useState(false);
    const [allPlans, setAllPlans] = useState<SubscriptionPlan[]>([]);
    const [hasUsedTrial, setHasUsedTrial] = useState(false);
    const [duration, setDuration] = useState<'monthly' | 'yearly'>('monthly');

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await fetch(apiUrl("api/subscription/plans"), {
                method: "GET",
                credentials: "include",
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const fetchedPlans: Plan[] = data.plans;
                setHasUsedTrial(data.hasUsedTrial || false);

                // Planları organize et (pro ve premium için monthly ve yearly)
                const organizedPlans: SubscriptionPlan[] = [];
                
                const proMonthly = fetchedPlans.find(p => p.name === 'pro' && p.duration === 'monthly');
                const proYearly = fetchedPlans.find(p => p.name === 'pro' && p.duration === 'yearly');
                const premiumMonthly = fetchedPlans.find(p => p.name === 'premium' && p.duration === 'monthly');
                const premiumYearly = fetchedPlans.find(p => p.name === 'premium' && p.duration === 'yearly');

                if (proMonthly) {
                    organizedPlans.push({
                        id: proMonthly.id,
                        name: 'Pro',
                        duration: 'monthly',
                        price: Number(proMonthly.price),
                        features: [
                            'Sınırsız program oluşturma',
                            'Sınırsız katılımcı davet etme',
                            'Gelişmiş analitikler',
                            'E-posta desteği',
                            'Öncelikli destek'
                        ],
                        icon: <Zap className="h-5 w-5" />
                    });
                }

                if (proYearly) {
                    organizedPlans.push({
                        id: proYearly.id,
                        name: 'Pro',
                        duration: 'yearly',
                        price: Number(proYearly.price),
                        originalPrice: proYearly.original_price ? Number(proYearly.original_price) : undefined,
                        features: [
                            'Sınırsız program oluşturma',
                            'Sınırsız katılımcı davet etme',
                            'Gelişmiş analitikler',
                            'E-posta desteği',
                            'Öncelikli destek',
                            'Yıllık plan %20 indirim'
                        ],
                        icon: <Zap className="h-5 w-5" />,
                        popular: true
                    });
                }

                if (premiumMonthly) {
                    organizedPlans.push({
                        id: premiumMonthly.id,
                        name: 'Premium',
                        duration: 'monthly',
                        price: Number(premiumMonthly.price),
                        features: [
                            'Pro planın tüm özellikleri',
                            'Özel API erişimi',
                            'Özel entegrasyonlar',
                            '7/24 telefon desteği',
                            'Özel hesap yöneticisi',
                            'Özel eğitimler'
                        ],
                        icon: <Crown className="h-5 w-5" />
                    });
                }

                if (premiumYearly) {
                    organizedPlans.push({
                        id: premiumYearly.id,
                        name: 'Premium',
                        duration: 'yearly',
                        price: Number(premiumYearly.price),
                        originalPrice: premiumYearly.original_price ? Number(premiumYearly.original_price) : undefined,
                        features: [
                            'Pro planın tüm özellikleri',
                            'Özel API erişimi',
                            'Özel entegrasyonlar',
                            '7/24 telefon desteği',
                            'Özel hesap yöneticisi',
                            'Özel eğitimler',
                            'Yıllık plan %20 indirim'
                        ],
                        icon: <Crown className="h-5 w-5" />
                    });
                }

                setAllPlans(organizedPlans);
            }
        } catch (error) {
            toast.error("Planlar yüklenirken bir hata oluştu");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = (planId: string) => {
        navigate(`/subscription/payment?planId=${planId}`);
    };

    const handleStartTrial = async () => {
        setTrialLoading(true);
        
        try {
            const response = await fetch(apiUrl("api/subscription/trial"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("7 günlük ücretsiz deneme başlatıldı!");
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            } else {
                toast.error(data.message || "Deneme başlatılamadı");
            }
        } catch (error) {
            toast.error("Bir hata oluştu");
            console.error(error);
        } finally {
            setTrialLoading(false);
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
        <div className="space-y-8 p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Üyelik Planı Seçin</h1>
                <p className="text-muted-foreground">
                    Profesyonel kullanıcılar için özel olarak tasarlanmış planlarımızla 
                    sistemin tüm özelliklerinden yararlanın.
                </p>
            </div>

            {/* Plans Section */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Mevcut Planlar</h2>
                            <p className="text-sm text-muted-foreground">
                                İhtiyacınıza uygun planı seçin
                            </p>
                        </div>
                    </div>
                    
                    {/* Toggle Butonu */}
                    <div className="flex items-center justify-center sm:justify-end gap-3">
                        <span className={`text-sm font-medium transition-colors ${duration === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                            Aylık
                        </span>
                        <button
                            type="button"
                            onClick={() => setDuration(duration === 'monthly' ? 'yearly' : 'monthly')}
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                            role="switch"
                            aria-checked={duration === 'yearly'}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    duration === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                        <span className={`text-sm font-medium transition-colors ${duration === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                            Yıllık
                        </span>
                        {/* Badge için sabit alan - layout kaymasını önlemek için */}
                        <div className="w-[90px] flex justify-start">
                            {duration === 'yearly' && (
                                <Badge variant="secondary" className="text-xs whitespace-nowrap">
                                    %20 İndirim
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
                
                <Separator />
                
                <div className="grid gap-6 md:grid-cols-2">
                    {allPlans
                        .filter(plan => plan.duration === duration)
                        .map((plan) => (
                        <Card 
                            key={plan.id}
                            className={`relative transition-all hover:shadow-lg ${
                                plan.popular ? 'border-primary border-2' : ''
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge className="px-3 py-1 text-xs">
                                        En Popüler
                                    </Badge>
                                </div>
                            )}
                            <CardHeader>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`rounded-lg p-2 ${
                                        plan.popular 
                                            ? 'bg-primary/10 text-primary' 
                                            : 'bg-muted text-muted-foreground'
                                    }`}>
                                        {plan.icon}
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                        <div className="mt-1">
                                            {plan.originalPrice && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg line-through text-muted-foreground">
                                                        {plan.originalPrice.toFixed(2)}₺
                                                    </span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        %20 İndirim
                                                    </Badge>
                                                </div>
                                            )}
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-bold">
                                                    {plan.price.toFixed(2)}₺
                                                </span>
                                                <span className="text-muted-foreground text-sm">
                                                    /{plan.duration === 'monthly' ? 'ay' : 'yıl'}
                                                </span>
                                            </div>
                                            {plan.duration === 'yearly' && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Aylık: {(plan.price / 12).toFixed(2)}₺
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <CardDescription>
                                    {plan.duration === 'monthly' 
                                        ? 'Aylık faturalandırma ile esnek ödeme'
                                        : 'Yıllık faturalandırma ile %20 tasarruf edin'
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Separator />
                                <div className="space-y-3">
                                    <p className="text-sm font-medium">Özellikler:</p>
                                    <ul className="space-y-2">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <Check className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                                <span className="text-sm text-muted-foreground">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Button
                                    className="w-full"
                                    variant={plan.popular ? 'default' : 'outline'}
                                    onClick={() => handleSelectPlan(plan.id)}
                                >
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Planı Seç
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Info */}
            <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground text-center">
                    Tüm planlar aylık veya yıllık faturalandırılır. İstediğiniz zaman iptal edebilirsiniz.
                </p>
            </div>

            {/* 7 Günlük Ücretsiz Deneme */}
            {!hasUsedTrial && (
                <div className="rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="rounded-lg bg-primary/10 p-2">
                            <Gift className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">7 Günlük Ücretsiz Deneme</h3>
                            <p className="text-sm text-muted-foreground">
                                Tüm özellikleri 7 gün boyunca ücretsiz deneyin. Kredi kartı gerektirmez.
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleStartTrial}
                        disabled={trialLoading}
                        variant="default"
                        className="w-full"
                    >
                        <Gift className="h-4 w-4 mr-2" />
                        {trialLoading ? "Başlatılıyor..." : "Ücretsiz Denemeyi Başlat"}
                    </Button>
                </div>
            )}

            {hasUsedTrial && (
                <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground text-center">
                        Ücretsiz deneme süreniz zaten kullanılmış. Bir plan seçerek devam edebilirsiniz.
                    </p>
                </div>
            )}
        </div>
    );
}
