import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Crown, Zap, CreditCard, Sparkles, TestTube } from "lucide-react";
import { apiUrl } from "@/lib/api";

interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    features: string[];
    icon: React.ReactNode;
    popular?: boolean;
}

const plans: SubscriptionPlan[] = [
    {
        id: 'pro',
        name: 'Pro',
        price: 299,
        icon: <Zap className="h-5 w-5" />,
        features: [
            'Sınırsız program oluşturma',
            'Sınırsız katılımcı davet etme',
            'Gelişmiş analitikler',
            'E-posta desteği',
            'Öncelikli destek'
        ]
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 599,
        icon: <Crown className="h-5 w-5" />,
        popular: true,
        features: [
            'Pro planın tüm özellikleri',
            'Özel API erişimi',
            'Özel entegrasyonlar',
            '7/24 telefon desteği',
            'Özel hesap yöneticisi',
            'Özel eğitimler'
        ]
    }
];

export default function SubscriptionPage() {
    const navigate = useNavigate();
    const [testLoading, setTestLoading] = useState(false);
    const [testMessage, setTestMessage] = useState<string>("");

    const handleSelectPlan = (planId: string) => {
        navigate(`/subscription/payment?plan=${planId}`);
    };

    const handleTestSubscription = async () => {
        setTestLoading(true);
        setTestMessage("");
        
        try {
            const response = await fetch(apiUrl("api/subscriptions/create"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    plan: "pro",
                    paymentMethod: "test"
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setTestMessage("✅ Test aboneliği başarıyla oluşturuldu! (1 aylık Pro plan)");
                // Ana dizine yönlendir
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            } else {
                setTestMessage(`❌ Hata: ${data.message || "Abonelik oluşturulamadı"}`);
            }
        } catch (error) {
            setTestMessage(`❌ Hata: ${error instanceof Error ? error.message : "Bir hata oluştu"}`);
        } finally {
            setTestLoading(false);
        }
    };

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
                
                <Separator />
                
                <div className="grid gap-6 md:grid-cols-2">
                    {plans.map((plan) => (
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
                                            <span className="text-3xl font-bold">
                                                {plan.price}₺
                                            </span>
                                            <span className="text-muted-foreground text-sm ml-1">/ay</span>
                                        </div>
                                    </div>
                                </div>
                                <CardDescription>
                                    Aylık faturalandırma ile esnek ödeme
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
                    Tüm planlar aylık faturalandırılır. İstediğiniz zaman iptal edebilirsiniz.
                </p>
            </div>

            {/* Test Button */}
            <div className="rounded-lg border-2 border-dashed border-orange-500/50 bg-orange-500/5 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-lg bg-orange-500/10 p-2">
                        <TestTube className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Test Amaçlı Abonelik</h3>
                        <p className="text-sm text-muted-foreground">
                            1 aylık Pro planı için test aboneliği oluştur
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleTestSubscription}
                    disabled={testLoading}
                    variant="outline"
                    className="w-full border-orange-500/50 hover:bg-orange-500/10"
                >
                    <TestTube className="h-4 w-4 mr-2" />
                    {testLoading ? "Oluşturuluyor..." : "Test Aboneliği Oluştur (1 Aylık Pro)"}
                </Button>
                {testMessage && (
                    <p className={`mt-3 text-sm text-center ${
                        testMessage.startsWith("✅") 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-red-600 dark:text-red-400"
                    }`}>
                        {testMessage}
                    </p>
                )}
            </div>
        </div>
    );
}
