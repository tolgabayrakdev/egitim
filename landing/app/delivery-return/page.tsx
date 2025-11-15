import Navigation from "../components/navigation";
import Footer from "../components/footer";
import { Separator } from "../components/separator";
import { Package } from "lucide-react";

export const metadata = {
  title: "İade ve İptal Politikası - Adivora",
  description: "Adivora iade ve iptal politikası hakkında bilgiler.",
};

export default function DeliveryReturn() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold tracking-tight">İade ve İptal Politikası</h1>
            <p className="text-muted-foreground">
              İade ve iptal işlemleri hakkında bilgiler
            </p>
          </div>

          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">1. Genel Bilgiler</h2>
                  <p className="text-sm text-muted-foreground">
                    İade ve iptal politikamız hakkında genel bilgiler
                  </p>
                </div>
              </div>
              <Separator />
              <p className="text-foreground leading-relaxed">
                Adivora olarak, kullanıcılarımızın memnuniyetini önemsiyoruz. Bu politika, 
                platformumuzda satın aldığınız hizmetlerin iade ve iptal işlemleri hakkında 
                bilgi vermek için hazırlanmıştır.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">2. İptal Hakkı</h2>
              <Separator />
              <p className="text-foreground leading-relaxed mb-4">
                Aşağıdaki durumlarda iptal hakkınız bulunmaktadır:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>Hizmet başlamadan önce iptal talebinde bulunabilirsiniz</li>
                <li>İptal talebiniz 24 saat içinde değerlendirilir</li>
                <li>Onaylanan iptal işlemleri 3-5 iş günü içinde geri ödeme yapılır</li>
                <li>Hizmet başladıktan sonra iptal işlemi, kullanılan süreye göre hesaplanır</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">3. İade Koşulları</h2>
              <Separator />
              <p className="text-foreground leading-relaxed mb-4">
                İade işlemleri için aşağıdaki koşullar geçerlidir:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>İade talebi, hizmet başlangıcından itibaren 14 gün içinde yapılmalıdır</li>
                <li>Kullanılmayan hizmetler için tam iade yapılır</li>
                <li>Kısmen kullanılan hizmetler için orantılı iade yapılır</li>
                <li>İade işlemi, ödeme yönteminize göre 5-10 iş günü içinde gerçekleşir</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">4. İade Edilemeyen Durumlar</h2>
              <Separator />
              <p className="text-foreground leading-relaxed mb-4">
                Aşağıdaki durumlarda iade yapılamaz:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>Hizmet tamamen tamamlandıysa</li>
                <li>14 günlük iade süresi geçmişse</li>
                <li>Kullanıcı hatasından kaynaklanan sorunlar</li>
                <li>Yasal zorunluluklar nedeniyle iade edilemeyen hizmetler</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">5. İptal ve İade İşlemleri</h2>
              <Separator />
              <p className="text-foreground leading-relaxed mb-4">
                İptal ve iade işlemleriniz için:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>Hesap ayarlarınızdan iptal talebi oluşturabilirsiniz</li>
                <li>Müşteri desteği üzerinden iade talebinde bulunabilirsiniz</li>
                <li>İptal/iade talebiniz en geç 24 saat içinde değerlendirilir</li>
                <li>Onaylanan işlemler için geri ödeme otomatik olarak yapılır</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">6. Geri Ödeme Süreci</h2>
              <Separator />
              <p className="text-foreground leading-relaxed mb-4">
                Geri ödeme süreci hakkında:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>Geri ödemeler, ödeme yaptığınız yönteme göre yapılır</li>
                <li>Kredi kartı ödemeleri 3-5 iş günü içinde hesabınıza yansır</li>
                <li>Banka havalesi ödemeleri 5-10 iş günü sürebilir</li>
                <li>Geri ödeme durumunu hesap ayarlarınızdan takip edebilirsiniz</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">7. Özel Durumlar</h2>
              <Separator />
              <p className="text-foreground leading-relaxed">
                Özel durumlar için müşteri desteğimizle iletişime geçebilirsiniz. 
                Her durum bireysel olarak değerlendirilir ve en uygun çözüm sunulur.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">8. İletişim</h2>
              <Separator />
              <p className="text-foreground leading-relaxed">
                İade ve iptal politikamız hakkında sorularınız için{" "}
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

