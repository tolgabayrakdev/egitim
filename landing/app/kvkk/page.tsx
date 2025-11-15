import Navigation from "../components/navigation";
import Footer from "../components/footer";
import { Separator } from "../components/separator";
import { Shield } from "lucide-react";

export const metadata = {
  title: "KVKK Aydınlatma Metni - Adivora",
  description: "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.",
};

export default function KVKK() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold tracking-tight">KVKK Aydınlatma Metni</h1>
            <p className="text-muted-foreground">
              6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni
            </p>
          </div>

          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">1. Veri Sorumlusu</h2>
                  <p className="text-sm text-muted-foreground">
                    Veri sorumlusu bilgileri
                  </p>
                </div>
              </div>
              <Separator />
              <p className="text-foreground leading-relaxed">
                Adivora olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") 
                kapsamında veri sorumlusu sıfatıyla kişisel verilerinizi işlemekteyiz.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">2. İşlenen Kişisel Veriler</h2>
              <Separator />
              <p className="text-foreground leading-relaxed mb-4">
                Platformumuzda aşağıdaki kişisel verileriniz işlenmektedir:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, T.C. kimlik numarası</li>
                <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, adres</li>
                <li><strong>Hesap Bilgileri:</strong> Kullanıcı adı, şifre, profil bilgileri</li>
                <li><strong>İşlem Bilgileri:</strong> Platform kullanım kayıtları, aktivite logları</li>
                <li><strong>Teknik Bilgiler:</strong> IP adresi, çerez bilgileri, cihaz bilgileri</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">3. Kişisel Verilerin İşlenme Amaçları</h2>
              <Separator />
              <p className="text-foreground leading-relaxed mb-4">
                Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>Platform hizmetlerinin sağlanması ve yönetimi</li>
                <li>Kullanıcı hesaplarının oluşturulması ve yönetimi</li>
                <li>Koçluk ilişkilerinin kurulması ve yönetimi</li>
                <li>Görev atama ve takip süreçlerinin yürütülmesi</li>
                <li>Müşteri desteği ve iletişim hizmetlerinin sağlanması</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                <li>Güvenlik ve dolandırıcılık önleme</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">4. Kişisel Verilerin İşlenme Hukuki Sebepleri</h2>
              <Separator />
              <p className="text-foreground leading-relaxed mb-4">
                Kişisel verileriniz KVKK'nın 5. ve 6. maddelerinde belirtilen aşağıdaki hukuki sebeplere 
                dayanılarak işlenmektedir:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>Açık rızanız</li>
                <li>Sözleşmenin kurulması veya ifası</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                <li>Meşru menfaatlerimiz</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">5. Kişisel Verilerin Aktarılması</h2>
              <Separator />
              <p className="text-foreground leading-relaxed mb-4">
                Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi için, 
                yasal zorunluluklar çerçevesinde ve KVKK'ya uygun olarak aşağıdaki taraflara aktarılabilir:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>Hizmet sağlayıcılarımız (hosting, bulut depolama vb.)</li>
                <li>Yasal merciler (yasal zorunluluklar çerçevesinde)</li>
                <li>İş ortaklarımız (sadece gerekli durumlarda)</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">6. Kişisel Verilerin Saklanma Süresi</h2>
              <Separator />
              <p className="text-foreground leading-relaxed">
                Kişisel verileriniz, işleme amaçlarının gerektirdiği süre boyunca ve yasal saklama 
                sürelerine uygun olarak saklanmaktadır. Bu süre sona erdiğinde verileriniz silinir, 
                yok edilir veya anonim hale getirilir.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">7. KVKK Kapsamındaki Haklarınız</h2>
              <Separator />
              <p className="text-foreground leading-relaxed mb-4">
                KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
                <li>KVKK'da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
                <li>Düzeltme, silme, yok edilme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">8. Başvuru Hakkı</h2>
              <Separator />
              <p className="text-foreground leading-relaxed mb-4">
                KVKK kapsamındaki haklarınızı kullanmak için yazılı olarak{" "}
                <a href="/contact" className="text-primary hover:underline">
                  iletişim sayfamızdan
                </a>{" "}
                başvurabilirsiniz. Başvurularınız en geç 30 gün içinde sonuçlandırılacaktır.
              </p>
              <p className="text-foreground leading-relaxed">
                Başvurunuzun reddedilmesi, yanıt süresinin dolması veya verilen yanıtın yetersiz 
                bulunması halinde, Kişisel Verileri Koruma Kurulu'na şikayette bulunabilirsiniz.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold">9. İletişim</h2>
              <Separator />
              <p className="text-foreground leading-relaxed">
                KVKK kapsamındaki haklarınızı kullanmak veya sorularınız için{" "}
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
