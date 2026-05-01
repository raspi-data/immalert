import Link from "next/link";

const features = [
  { icon: "🏢", title: "TVA & Înregistrare", desc: "Alertă instant când firma se înregistrează sau se radiază din TVA" },
  { icon: "🚨", title: "Inactivitate Fiscală", desc: "Știi primul când o firmă este declarată inactivă fiscal de ANAF" },
  { icon: "⚖️", title: "Insolvență & Faliment", desc: "Monitorizare zilnică în Buletinul Procedurilor de Insolvență" },
  { icon: "👤", title: "Schimbare Administrator", desc: "Alertă când administratorul sau asociații firmei se schimbă" },
  { icon: "📍", title: "Sediu Social", desc: "Notificare când sediul social al firmei se mută" },
  { icon: "📊", title: "Date Financiare", desc: "Actualizare anuală cu cifra de afaceri, profit și numărul de angajați" },
  { icon: "🔢", title: "e-Factura", desc: "Monitorizare status e-Factura conform cerințelor ANAF" },
  { icon: "📋", title: "ONRC", desc: "Verificare săptămânală a datelor din Registrul Comerțului" },
];

const steps = [
  { num: "1", title: "Creezi contul gratuit", desc: "14 zile trial, fără card. Te înregistrezi în 30 de secunde cu email și parolă." },
  { num: "2", title: "Adaugi firmele după CUI", desc: "Introduci CUI-ul și noi preluăm instant toate datele din ANAF, ONRC, BPI și Ministerul Finanțelor." },
  { num: "3", title: "Primești alerte pe email", desc: "La orice schimbare, primești un email cu exact ce s-a modificat și când." },
];

const faqs = [
  { q: "Câte firme pot monitoriza?", a: "Nelimitat! Ambele planuri includ firme nelimitate." },
  { q: "Trebuie să introduc cardul pentru trial?", a: "Nu. Trialul de 14 zile este complet gratuit, fără card și fără obligații." },
  { q: "Cât de des verificați datele?", a: "ANAF este verificat zilnic. ONRC săptămânal. BPI zilnic. Datele financiare anual când sunt disponibile." },
  { q: "Pot anula oricând?", a: "Da, anulezi din setările contului, fără penalizări. Abonamentul rămâne activ până la sfârșitul perioadei plătite." },
  { q: "De unde preluați datele?", a: "Din surse oficiale gratuite: API ANAF, ONRC (data.gov.ro), Buletinul Procedurilor de Insolvență și Ministerul Finanțelor." },
  { q: "Funcționează pentru toate firmele din România?", a: "Da, pentru orice firmă cu CUI valid înregistrată în România." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-700">ImmAlert</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2">
              Autentificare
            </Link>
            <Link
              href="/register"
              className="bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Start Trial Gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Monitorizare în timp real
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Știi primul când se schimbă
            <br />
            <span className="text-blue-700">ceva la firmele tale</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Monitorizare automată TVA, insolvență, administrator, sediu și date financiare pentru orice firmă din România.
            Alerte pe email instant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-blue-700 text-white text-lg font-semibold px-8 py-4 rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-blue-200"
            >
              Începe Trial Gratuit 14 Zile →
            </Link>
            <a
              href="#pret"
              className="border-2 border-gray-200 text-gray-700 text-lg font-medium px-8 py-4 rounded-xl hover:border-gray-300 transition-colors"
            >
              Vezi prețurile
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-4">Fără card • Fără obligații • Anulezi oricând</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-gray-900">5+</p>
            <p className="text-gray-500 text-sm mt-1">Surse de date oficiale</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">Zilnic</p>
            <p className="text-gray-500 text-sm mt-1">Verificare automată</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">Instant</p>
            <p className="text-gray-500 text-sm mt-1">Alerte pe email</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Cum funcționează</h2>
          <p className="text-center text-gray-600 mb-12">3 pași simpli și ești gata</p>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-12 h-12 bg-blue-700 text-white text-xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Ce monitorizezi</h2>
          <p className="text-center text-gray-600 mb-12">Toate informațiile relevante despre firmele tale, într-un singur loc</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-5 border border-gray-100 hover:border-blue-200 transition-colors">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pret" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Prețuri clare, fără surprize</h2>
          <p className="text-center text-gray-600 mb-12">Firme nelimitate incluse în ambele planuri</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Monthly */}
            <div className="border-2 border-gray-200 rounded-2xl p-8">
              <h3 className="font-bold text-gray-900 text-lg mb-1">Lunar</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-gray-900">99</span>
                <span className="text-gray-500">RON/lună</span>
              </div>
              <p className="text-gray-500 text-sm mb-6">Facturare lunară</p>
              <ul className="space-y-2 mb-8 text-sm text-gray-600">
                <li className="flex gap-2"><span className="text-green-500">✓</span> Firme nelimitate</li>
                <li className="flex gap-2"><span className="text-green-500">✓</span> Alerte email instant</li>
                <li className="flex gap-2"><span className="text-green-500">✓</span> Toate sursele de date</li>
                <li className="flex gap-2"><span className="text-green-500">✓</span> Anulezi oricând</li>
              </ul>
              <Link
                href="/register"
                className="block text-center border-2 border-blue-700 text-blue-700 font-semibold py-3 rounded-xl hover:bg-blue-50 transition-colors"
              >
                Începe Trial Gratuit
              </Link>
            </div>
            {/* Annual */}
            <div className="border-2 border-blue-700 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                Economisești 240 RON/an
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Anual</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-blue-700">79</span>
                <span className="text-gray-500">RON/lună</span>
              </div>
              <p className="text-gray-500 text-sm mb-6">948 RON/an, facturat anual</p>
              <ul className="space-y-2 mb-8 text-sm text-gray-600">
                <li className="flex gap-2"><span className="text-green-500">✓</span> Firme nelimitate</li>
                <li className="flex gap-2"><span className="text-green-500">✓</span> Alerte email instant</li>
                <li className="flex gap-2"><span className="text-green-500">✓</span> Toate sursele de date</li>
                <li className="flex gap-2"><span className="text-green-500">✓</span> Anulezi oricând</li>
              </ul>
              <Link
                href="/register"
                className="block text-center bg-blue-700 text-white font-semibold py-3 rounded-xl hover:bg-blue-800 transition-colors"
              >
                Începe Trial Gratuit
              </Link>
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">14 zile trial gratuit • Fără card • Anulezi oricând</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Întrebări frecvente</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="bg-white rounded-xl border border-gray-100 p-5 group">
                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                  {faq.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-gray-600 mt-3 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-blue-700">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Gata să monitorizezi firmele tale?</h2>
          <p className="text-blue-200 mb-8">14 zile gratuit, fără card, fără obligații</p>
          <Link
            href="/register"
            className="inline-block bg-white text-blue-700 font-bold text-lg px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Creează cont gratuit →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} ImmAlert. Date preluate din surse oficiale: ANAF, ONRC, BPI, Ministerul Finanțelor.</p>
      </footer>
    </div>
  );
}
