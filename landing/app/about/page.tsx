import Navigation from "../components/navigation";
import Footer from "../components/footer";
import { Separator } from "../components/separator";
import { Target, Award, Users, Heart } from "lucide-react";

export const metadata = {
  title: "Hakkımızda - Adivora",
  description: "Adivora hakkında bilgi edinin. Misyonumuz, vizyonumuz ve değerlerimiz.",
};

export default function About() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Hakkımızda</h1>
            <p className="text-muted-foreground">
              Profesyonel koçluk yönetim platformu olarak, koçlar ve katılımcılar arasındaki ilişkileri güçlendirmeyi hedefliyoruz.
            </p>
          </div>

          <div className="space-y-8">
            {/* Mission */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Misyonumuz</h2>
                  <p className="text-sm text-muted-foreground">
                    Profesyonel koçlar ve katılımcılar için modern çözümler
                  </p>
                </div>
              </div>
              <Separator />
              <p className="text-foreground leading-relaxed">
                Profesyonel koçlar ve katılımcılar için modern, kullanıcı dostu bir platform sunarak, 
                koçluk süreçlerini kolaylaştırmak ve verimliliği artırmak. Teknoloji ile koçluk 
                deneyimini birleştirerek, herkesin hedeflerine ulaşmasına yardımcı olmak.
              </p>
            </div>

            {/* Vision */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Vizyonumuz</h2>
                  <p className="text-sm text-muted-foreground">
                    Geleceğe yönelik hedeflerimiz
                  </p>
                </div>
              </div>
              <Separator />
              <p className="text-foreground leading-relaxed">
                Türkiye'nin en güvenilir ve kullanıcı dostu koçluk yönetim platformu olmak. 
                Koçluk sektöründe dijital dönüşümün öncüsü olarak, binlerce profesyonel koç ve 
                katılımcıya hizmet vermek.
              </p>
            </div>

            {/* Values */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Değerlerimiz</h2>
                  <p className="text-sm text-muted-foreground">
                    Temel değerlerimiz ve ilkelerimiz
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Kullanıcı Odaklılık</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Kullanıcılarımızın ihtiyaçlarını anlamak ve onlara en iyi deneyimi sunmak önceliğimizdir.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Güvenilirlik</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Verilerinizin güvenliği ve gizliliği bizim için çok önemlidir. KVKK uyumlu platform.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">İnovasyon</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sürekli gelişim ve yenilikçi çözümler sunarak sektörde öncü olmaya devam ediyoruz.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Kalite</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Yüksek kaliteli hizmet sunmak ve kullanıcı memnuniyetini sağlamak temel hedefimizdir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
