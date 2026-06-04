import Link from 'next/link';
import { ArrowRight, Sparkles, Calendar, Zap } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-purple-200/20 dark:border-purple-900/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            ✨ Hair Salon Pro
          </div>
          <div className="flex gap-4">
            <Link
              href="/appointment"
              className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-semibold transition-all hover:scale-105"
            >
              Randevu Al
            </Link>
            <Link
              href="/admin/login"
              className="px-6 py-2 rounded-lg border-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold transition-all"
            >
              Admin Giriş
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-300 text-sm font-semibold mb-6 animate-fade-in">
            🎨 Modern Tasarım Hizmetleri
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Sizin İçin Mükemmel Saç{' '}
            <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 bg-clip-text text-transparent">
              Tasarımı
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Hair Salon Pro, İngiltere'nin en modern kuaför salonudur. Deneyimli stilistlerimiz ile saç kesimi, boyama ve tasarım hizmetlerini online randevu sistemi üzerinden kolayca alabilirsiniz.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/appointment"
              className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-all hover:scale-105 group"
            >
              Hemen Randevu Al
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-purple-600 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold transition-all"
            >
              Hizmetler
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Neden Bizi Seçmelisiniz?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-900 border border-purple-200/50 dark:border-purple-900/50 hover:shadow-lg transition-all">
              <div className="mb-4 w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Çevrimiçi Randevu</h3>
              <p className="text-gray-600 dark:text-gray-300">
                7/24 online randevu sistemi. İstediğiniz tarih ve saati seçerek anında randevu alın.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-900 border border-purple-200/50 dark:border-purple-900/50 hover:shadow-lg transition-all">
              <div className="mb-4 w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Profesyonel Hizmet</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Deneyimli ve sertifikalı stilistler. Her müşteri için özel ilgi ve özen.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-900 border border-purple-200/50 dark:border-purple-900/50 hover:shadow-lg transition-all">
              <div className="mb-4 w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Modern Teknoloji</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Otomatik hatırlatmalar, e-posta ve WhatsApp bildirimleri ile hiçbir randevuyu kaçırmayın.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Hizmetlerimiz</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '✂️', name: 'Saç Kesimi', price: '£25-35' },
              { icon: '🎨', name: 'Boyama', price: '£40-60' },
              { icon: '💇', name: 'Styling', price: '£30-45' },
              { icon: '💆', name: 'Bakım Tedavisi', price: '£20-30' },
            ].map((service, index) => (
              <div
                key={index}
                className="p-6 rounded-lg bg-white dark:bg-slate-800 border border-purple-200/50 dark:border-purple-900/50 hover:shadow-lg transition-all text-center hover:translate-y-[-4px]"
              >
                <div className="text-4xl mb-3">{service.icon}</div>
                <h3 className="font-bold text-lg mb-2">{service.name}</h3>
                <p className="text-purple-600 dark:text-purple-400 font-semibold">{service.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-purple-800">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Hemen Randevu Alın</h2>
          <p className="text-lg mb-8 opacity-90">
            Deneyimli stilistlerimizden hizmet almak için sadece birkaç tıklama uzakta
          </p>
          <Link
            href="/appointment"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 rounded-lg font-bold hover:shadow-xl transition-all hover:scale-105 group"
          >
            Randevu Sistemi
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Hair Salon Pro</h3>
              <p className="text-gray-400">Modern ve şık kuaför salonu</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Hızlı Bağlantılar</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/appointment" className="hover:text-white transition">Randevu</Link></li>
                <li><Link href="/services" className="hover:text-white transition">Hizmetler</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">İletişim</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>📞 +44 20 XXXX XXXX</li>
                <li>📧 info@hairsalon.com</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Çalışma Saatleri</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Pazartesi - Cuma: 09:00 - 18:00</li>
                <li>Cumartesi: 10:00 - 17:00</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 Hair Salon Pro. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
