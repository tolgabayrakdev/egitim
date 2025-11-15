import Navigation from "../components/navigation";
import Footer from "../components/footer";
import { Separator } from "../components/separator";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Kullanım Şartları - Adivora",
  description: "Adivora kullanım şartları ve koşulları.",
};

export default function Terms() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Kullanım Şartları</h1>
            <p className="text-muted-foreground">
              Son Güncelleme: {new Date().toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">1. Genel Koşullar</h2>
                  <p className="text-sm text-muted-foreground">
                    Platform kullanımı için genel koşullar
                  </p>
                </div>
              </div>
              <Separator />
              <p className="text-foreground leading-relaxed">
                Adivora'yı kullanarak, aşağıdaki kullanım şartlarını kabul etmiş sayılırsınız. 
                Bu şartları kabul etmiyorsanız, lütfen platformu kullanmayın.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">2. Hesap Sorumluluğu</h2>
              <Separator />
              <p className="text-foreground leading-relaxed">
                Platforma kayıt olurken doğru ve güncel bilgiler sağlamak sizin sorumluluğunuzdadır. 
                Hesap bilgilerinizin güvenliğinden siz sorumlusunuz. Şüpheli aktivite tespit edilirse, 
                hesabınız askıya alınabilir.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">3. Kullanıcı Davranışları</h2>
              <Separator />
              <p className="text-foreground leading-relaxed mb-4">
                Platformu kullanırken aşağıdaki davranışlardan kaçınmalısınız:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>Yasadışı faaliyetlerde bulunmak</li>
                <li>Başkalarının haklarını ihlal etmek</li>
                <li>Zararlı yazılım veya virüs yaymak</li>
                <li>Platformun güvenliğini tehdit etmek</li>
                <li>Spam veya istenmeyen içerik paylaşmak</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">4. Fikri Mülkiyet</h2>
              <Separator />
              <p className="text-foreground leading-relaxed">
                Platformun tüm içeriği, tasarımı ve yazılımı telif hakkı koruması altındadır. 
                İçeriği izinsiz kopyalamak, dağıtmak veya kullanmak yasaktır.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">5. Hizmet Değişiklikleri</h2>
              <Separator />
              <p className="text-foreground leading-relaxed">
                Platform özelliklerini, hizmetlerini veya şartlarını önceden haber vermeksizin 
                değiştirme hakkını saklı tutarız.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">6. Sorumluluk Reddi</h2>
              <Separator />
              <p className="text-foreground leading-relaxed">
                Platform "olduğu gibi" sunulmaktadır. Hizmetlerin kesintisiz veya hatasız olacağına 
                dair garanti vermiyoruz. Platform kullanımından kaynaklanan zararlardan sorumlu değiliz.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">7. Hesap İptali</h2>
              <Separator />
              <p className="text-foreground leading-relaxed">
                Hesabınızı istediğiniz zaman iptal edebilirsiniz. Kullanım şartlarını ihlal eden 
                hesaplar, önceden haber vermeksizin kapatılabilir.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">8. Değişiklikler</h2>
              <Separator />
              <p className="text-foreground leading-relaxed">
                Bu kullanım şartlarını istediğimiz zaman güncelleyebiliriz. Önemli değişiklikler 
                kullanıcılara bildirilecektir.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">9. İletişim</h2>
              <Separator />
              <p className="text-foreground leading-relaxed">
                Kullanım şartları hakkında sorularınız için{" "}
                <a href="/contact" className="text-primary hover:underline">
                  iletişim sayfamızdan
                </a>{" "}
                bizimle iletişime geçebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
