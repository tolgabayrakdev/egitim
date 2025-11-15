import Navigation from "../components/navigation";
import Footer from "../components/footer";
import { Separator } from "../components/separator";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Gizlilik Politikası - Adivora",
  description: "Adivora gizlilik politikası ve kişisel verilerin korunması hakkında bilgiler.",
};

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Gizlilik Politikası</h1>
            <p className="text-muted-foreground">
              Son Güncelleme: {new Date().toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">1. Genel Bilgiler</h2>
                  <p className="text-sm text-muted-foreground">
                    Gizlilik politikamız hakkında genel bilgiler
                  </p>
                </div>
              </div>
              <Separator />
              <p className="text-foreground leading-relaxed">
                Adivora olarak, kullanıcılarımızın gizliliğini korumak bizim için çok önemlidir. 
                Bu gizlilik politikası, platformumuzu kullanırken topladığımız bilgiler ve bu bilgilerin 
                nasıl kullanıldığı hakkında sizleri bilgilendirmek için hazırlanmıştır.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">2. Toplanan Bilgiler</h2>
              <Separator />
              <p className="text-foreground leading-relaxed mb-4">
                Platformumuzu kullanırken aşağıdaki bilgileri toplayabiliriz:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>Kişisel bilgiler (ad, soyad, e-posta, telefon)</li>
                <li>Hesap bilgileri ve kullanıcı kimlik doğrulama verileri</li>
                <li>Platform kullanım verileri ve aktivite logları</li>
                <li>Teknik bilgiler (IP adresi, tarayıcı türü, cihaz bilgileri)</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">3. Bilgilerin Kullanımı</h2>
              <Separator />
              <p className="text-foreground leading-relaxed mb-4">
                Topladığımız bilgiler aşağıdaki amaçlarla kullanılır:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>Platform hizmetlerini sağlamak ve geliştirmek</li>
                <li>Kullanıcı hesaplarını yönetmek</li>
                <li>Müşteri desteği sağlamak</li>
                <li>Yasal yükümlülükleri yerine getirmek</li>
                <li>Güvenlik ve dolandırıcılık önleme</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">4. Bilgilerin Paylaşımı</h2>
              <Separator />
              <p className="text-foreground leading-relaxed mb-4">
                Kişisel bilgileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz. 
                Sadece aşağıdaki durumlarda bilgileriniz paylaşılabilir:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>Yasal zorunluluklar</li>
                <li>Güvenlik ve dolandırıcılık önleme</li>
                <li>Hizmet sağlayıcılarımız (veri işleme amaçlı)</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">5. Veri Güvenliği</h2>
              <Separator />
              <p className="text-foreground leading-relaxed">
                Verilerinizin güvenliği için endüstri standardı şifreleme ve güvenlik önlemleri kullanıyoruz. 
                Ancak, internet üzerinden veri iletiminin %100 güvenli olmadığını unutmayın.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">6. Çerezler</h2>
              <Separator />
              <p className="text-foreground leading-relaxed">
                Platformumuz, kullanıcı deneyimini iyileştirmek için çerezler kullanır. 
                Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">7. Haklarınız</h2>
              <Separator />
              <p className="text-foreground leading-relaxed mb-4">
                KVKK kapsamında, kişisel verilerinizle ilgili aşağıdaki haklara sahipsiniz:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenen kişisel verileriniz hakkında bilgi talep etme</li>
                <li>Kişisel verilerinizin silinmesini talep etme</li>
                <li>Kişisel verilerinizin düzeltilmesini talep etme</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">8. İletişim</h2>
              <Separator />
              <p className="text-foreground leading-relaxed">
                Gizlilik politikamız hakkında sorularınız için{" "}
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
