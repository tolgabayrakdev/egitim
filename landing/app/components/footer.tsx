import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-white text-lg font-bold mb-4">Adivora</h3>
            <p className="text-sm text-gray-400">
              Profesyonel koçluk yönetim sistemi ile hedeflerinize ulaşın.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Hızlı Linkler</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Fiyatlandırma
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Yasal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Kullanım Şartları
                </Link>
              </li>
              <li>
                <Link href="/kvkk" className="hover:text-white transition-colors">
                  KVKK Aydınlatma Metni
                </Link>
              </li>
              <li>
                <Link href="/delivery-return" className="hover:text-white transition-colors">
                  İade ve İptal Politikası
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">İletişim</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:info@adivora.com" className="hover:text-white transition-colors">
                  info@adivora.com
                </a>
              </li>
              <li className="text-gray-400">
                Destek: 7/24
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} Adivora. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}

