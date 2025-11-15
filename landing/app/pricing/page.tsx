import Navigation from "../components/navigation";
import Footer from "../components/footer";
import { Separator } from "../components/separator";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Fiyatlandırma - Adivora",
  description: "Adivora fiyatlandırma planları ve paket seçenekleri.",
};

export default function Pricing() {
  const plans = [
    {
      name: "Başlangıç",
      price: "Ücretsiz",
      description: "Bireysel kullanıcılar için ideal",
      features: [
        "5 koçluk ilişkisi",
        "50 görev/ay",
        "Temel ilerleme takibi",
        "E-posta desteği",
        "Mobil uyumlu arayüz",
      ],
      popular: false,
    },
    {
      name: "Profesyonel",
      price: "₺299",
      period: "/ay",
      description: "Profesyonel koçlar için",
      features: [
        "Sınırsız koçluk ilişkisi",
        "Sınırsız görev",
        "Gelişmiş ilerleme analizi",
        "Öncelikli destek",
        "Raporlama ve istatistikler",
        "API erişimi",
      ],
      popular: true,
    },
    {
      name: "Kurumsal",
      price: "Özel Fiyat",
      description: "Büyük ekipler için",
      features: [
        "Tüm Profesyonel özellikler",
        "Özel entegrasyonlar",
        "Dedike destek ekibi",
        "Özel eğitimler",
        "SLA garantisi",
        "Özel güvenlik önlemleri",
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-2 mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Fiyatlandırma
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Fiyatlandırma Planları</h1>
            <p className="text-muted-foreground">
              İhtiyacınıza uygun planı seçin ve hemen başlayın
            </p>
          </div>

          <Separator className="my-8" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-lg border-2 p-6 ${
                  plan.popular
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                {plan.popular && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground mb-4">
                    En Popüler
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-muted-foreground text-sm">
                          {plan.period}
                        </span>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="http://localhost:5173/auth/sign-in"
                    className={`block w-full text-center px-4 py-2 rounded-lg font-semibold transition-all ${
                      plan.popular
                        ? "bg-primary text-primary-foreground hover:opacity-90"
                        : "bg-background text-foreground border border-border hover:bg-muted"
                    }`}
                  >
                    {plan.name === "Kurumsal" ? "İletişime Geç" : "Başla"}
                  </a>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-8" />

          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Sıkça Sorulan Sorular</h2>
              <p className="text-sm text-muted-foreground">
                Fiyatlandırma hakkında merak ettikleriniz
              </p>
            </div>
            <Separator />
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Ödeme nasıl yapılır?</h3>
                <p className="text-sm text-muted-foreground">
                  Kredi kartı, banka kartı veya banka havalesi ile ödeme yapabilirsiniz. 
                  Tüm ödemeler güvenli ödeme altyapısı üzerinden işlenir.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Plan değiştirebilir miyim?</h3>
                <p className="text-sm text-muted-foreground">
                  Evet, istediğiniz zaman planınızı yükseltebilir veya düşürebilirsiniz. 
                  Değişiklikler bir sonraki faturalama döneminde geçerli olur.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">İade garantisi var mı?</h3>
                <p className="text-sm text-muted-foreground">
                  İlk 14 gün içinde memnun kalmazsanız tam iade garantisi sunuyoruz. 
                  Detaylar için{" "}
                  <Link href="/delivery-return" className="text-primary hover:underline">
                    İade ve İptal Politikası
                  </Link>{" "}
                  sayfamızı inceleyebilirsiniz.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Kurumsal plan için nasıl iletişime geçebilirim?</h3>
                <p className="text-sm text-muted-foreground">
                  Kurumsal planlar için özel fiyatlandırma ve özelleştirme seçenekleri sunuyoruz. 
                  <Link href="/contact" className="text-primary hover:underline">
                    {" "}İletişim sayfamızdan
                  </Link>{" "}
                  bizimle iletişime geçebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

