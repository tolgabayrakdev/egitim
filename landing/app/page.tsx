import Link from "next/link";
import Navigation from "./components/navigation";
import Footer from "./components/footer";
import { Separator } from "./components/separator";
import { ArrowRight, CheckCircle, Users, ClipboardList, TrendingUp, Shield, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="space-y-6 mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Profesyonel Koçluk Platformu
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
              Koçluk Yönetimini
              <br />
              <span className="text-primary">Kolaylaştırın</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Koçlar ve katılımcılar için modern, kullanıcı dostu platform. Görev takibi, ilerleme analizi ve profesyonel koçluk yönetimi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a
                href="http://localhost:5173/auth/sign-in"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                Hemen Başla
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/about"
                className="px-6 py-3 bg-background text-foreground rounded-lg font-semibold hover:bg-muted transition-all border border-border"
              >
                Daha Fazla Bilgi
              </Link>
            </div>
          </div>

          <Separator className="my-12" />

          {/* Features Section */}
          <div className="space-y-8 mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Güçlü Özellikler</h2>
              <p className="text-muted-foreground">
                Koçluk sürecinizi kolaylaştıran modern araçlar
              </p>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Koçluk İlişkileri</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Profesyonel koçlar ve katılımcılar arasında kolay ilişki yönetimi
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Görev Yönetimi</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Görev atama, takip ve tamamlama süreçlerini kolaylaştırın
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">İlerleme Takibi</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Detaylı istatistikler ve ilerleme raporları ile hedeflerinizi takip edin
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Güvenli Platform</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Verileriniz güvende, KVKK uyumlu ve şifreli platform
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-12" />

          {/* Benefits Section */}
          <div className="space-y-8 mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Neden Adivora?</h2>
              <p className="text-muted-foreground">
                Profesyonel koçluk yönetimini kolaylaştıran modern çözümler
              </p>
            </div>
            <Separator />
            <div className="space-y-4">
              {[
                "Kolay ve hızlı görev yönetimi",
                "Gerçek zamanlı ilerleme takibi",
                "Profesyonel koçluk ilişkileri yönetimi",
                "Güvenli ve şifreli veri saklama",
                "Mobil uyumlu arayüz",
                "7/24 teknik destek"
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-12" />

          {/* CTA Section */}
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Hemen Başlayın</h2>
              <p className="text-muted-foreground">
                Profesyonel koçluk yönetim sistemine katılın ve hedeflerinize daha hızlı ulaşın.
              </p>
            </div>
            <Separator />
            <div className="rounded-lg bg-primary p-8 text-primary-foreground">
              <h3 className="text-2xl font-bold mb-3">Koçluk Yolculuğunuza Bugün Başlayın</h3>
              <p className="mb-6 text-primary-foreground/80">
                Binlerce profesyonel koç ve katılımcıya katılın. Hemen ücretsiz deneyin.
              </p>
              <a
                href="http://localhost:5173/auth/sign-in"
                className="inline-block px-8 py-3 bg-primary-foreground text-primary rounded-lg font-semibold hover:opacity-90 transition-all"
              >
                Hemen Kayıt Ol
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
