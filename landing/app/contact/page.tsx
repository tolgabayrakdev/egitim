import Navigation from "../components/navigation";
import Footer from "../components/footer";
import ContactForm from "../components/contact-form";
import { Separator } from "../components/separator";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export const metadata = {
  title: "İletişim - Adivora",
  description: "Adivora iletişim bilgileri ve iletişim formu.",
};

export default function Contact() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold tracking-tight">İletişim</h1>
            <p className="text-muted-foreground">
              Sorularınız, önerileriniz veya destek talepleriniz için bizimle iletişime geçin.
            </p>
          </div>

          <div className="space-y-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">İletişim Bilgileri</h2>
                  <p className="text-sm text-muted-foreground">
                    Bize ulaşabileceğiniz yollar
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="font-medium text-sm">E-posta</h3>
                    <a href="mailto:info@adivora.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      info@adivora.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="font-medium text-sm">Telefon</h3>
                    <a href="tel:+905551234567" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      +90 (555) 123 45 67
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="font-medium text-sm">Adres</h3>
                    <p className="text-sm text-muted-foreground">
                      İstanbul, Türkiye
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Hours */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Destek Saatleri</h2>
                  <p className="text-sm text-muted-foreground">
                    Müşteri desteği çalışma saatleri
                  </p>
                </div>
              </div>
              <Separator />
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <p className="text-sm text-foreground">
                  <span className="font-medium">Pazartesi - Cuma:</span> 09:00 - 18:00
                </p>
                <p className="text-sm text-foreground">
                  <span className="font-medium">Cumartesi:</span> 10:00 - 16:00
                </p>
                <p className="text-sm text-foreground">
                  <span className="font-medium">Pazar:</span> Kapalı
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Mesaj Gönderin</h2>
                  <p className="text-sm text-muted-foreground">
                    Formu doldurarak bize ulaşabilirsiniz
                  </p>
                </div>
              </div>
              <Separator />
              <ContactForm />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
