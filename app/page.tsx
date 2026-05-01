import Link from "next/link";

const features = [
  { icon: "receipt_long", title: "TVA & Înregistrare", desc: "Statusul înregistrării în scopuri de TVA și modificări regim." },
  { icon: "block", title: "Inactivitate Fiscală", desc: "Monitorizare stare activitate conform evidențelor ANAF." },
  { icon: "balance", title: "Insolvență & Faliment", desc: "Alerte BPI pentru dosare noi sau termene de judecată." },
  { icon: "badge", title: "Schimbare Administrator", desc: "Notificări privind schimbarea persoanelor cu drept de semnătură." },
  { icon: "location_on", title: "Sediu Social", desc: "Monitorizare valabilitate și schimbări de sediu principal." },
  { icon: "query_stats", title: "Date Financiare", desc: "Cifra de afaceri, profit, datorii și bilanțuri anuale depuse." },
  { icon: "description", title: "e-Factura", desc: "Statusul tehnic și conformitatea cu sistemul RO e-Factura." },
  { icon: "apartment", title: "ONRC", desc: "Mențiuni noi, depuneri de acte și alte cereri la Registrul Comerțului." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-on-surface">

      {/* ── Nav ── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-surface-variant shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-12">
            <span className="text-xl font-bold tracking-tight text-primary-container font-display">ImmAlert</span>
            <div className="hidden md:flex gap-8 items-center">
              <a href="#cum-functioneaza" className="text-sm font-semibold text-primary-container border-b-2 border-primary-container pb-1 font-display">Platforma</a>
              <a href="#ce-monitorizezi" className="text-sm font-medium text-on-surface-variant hover:text-primary-container transition-colors font-display">Soluții</a>
              <a href="#pret" className="text-sm font-medium text-on-surface-variant hover:text-primary-container transition-colors font-display">Prețuri</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-on-surface-variant hover:text-primary-container transition-colors font-display">
              Autentificare
            </Link>
            <Link
              href="/register"
              className="bg-primary-container text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all font-display"
            >
              Începe Trial Gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="relative pt-40 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div className="flex flex-col gap-8 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container w-fit text-xs font-semibold tracking-wide uppercase">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified</span>
              NOU: Integrare e-Factura automată
            </div>

            <h1 className="font-display font-bold text-on-surface leading-tight" style={{ fontSize: 40, lineHeight: "48px", letterSpacing: "-0.02em" }}>
              Monitorizare în timp real.{" "}
              <span className="text-primary-container">Știi primul</span>{" "}
              când se schimbă ceva la firmele tale.
            </h1>

            <p className="text-on-surface-variant max-w-xl leading-relaxed" style={{ fontSize: 18, lineHeight: "28px" }}>
              Monitorizare automată TVA, insolvență, administrator, sediu și date financiare pentru orice firmă din România. Alerte pe email instant.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="bg-primary-container text-white px-8 py-4 rounded-xl font-display font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95"
                style={{ fontSize: 18 }}
              >
                Începe Trial Gratuit 14 Zile
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <a
                href="#pret"
                className="bg-white border border-outline-variant text-on-surface-variant px-8 py-4 rounded-xl font-display font-semibold hover:bg-surface-container-low transition-all text-center"
                style={{ fontSize: 18 }}
              >
                Vezi prețurile
              </a>
            </div>

            <div className="flex items-center gap-6 text-sm text-outline">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
                Fără card
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
                Fără obligații
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
                Anulezi oricând
              </div>
            </div>
          </div>

          {/* Right — dashboard image */}
          <div className="relative hidden lg:block">
            <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(26,188,156,0.1)" }} />
            <div className="bg-white p-4 rounded-3xl shadow-xl border border-surface-variant relative z-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpRthKZ8NYC5knn0UnZLBdGGitqgRRNqBalIpnwou6DSRQ4TCw_rhtT5iYuomduuB6Z8f7u-4Nuvu1wNtTAGIEMazI5RquV-0-yWH61osWMwkkSnH9LTvN5N0rL2-vMCiJXI3PMGhvHLC-VRnXuDP6HzULh_1j6Kob97v70lOFNisRVKwQwrJr0V7i5chwxERSI6IdUyzTm8gMVAfNdMnUTjUSTApre8IkwvAe5sTBjYFODiwwxUuSkNupj3Wed-L-js1FLA0WLziU"
                alt="ImmAlert dashboard preview"
                className="rounded-2xl w-full h-auto object-cover"
              />
              {/* Alert card overlay */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg border border-surface-variant max-w-[200px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-error" style={{ fontSize: 20 }}>warning</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Alertă Insolvență</p>
                    <p className="text-on-surface-variant" style={{ fontSize: 10 }}>S.C. Exemplu S.R.L.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Quick Stats ── */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 bg-white border border-surface-variant rounded-3xl shadow-sm overflow-hidden">
          {[
            { icon: "database", label: "5+ Surse", sub: "Date oficiale centralizate" },
            { icon: "update", label: "Zilnic", sub: "Verificare automată" },
            { icon: "notifications_active", label: "Instant", sub: "Alerte pe email" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`flex items-center gap-4 p-8 ${i > 0 ? "border-t md:border-t-0 md:border-l border-surface-variant" : ""}`}
            >
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0 text-primary-container">
                <span className="material-symbols-outlined" style={{ fontSize: 28 }}>{stat.icon}</span>
              </div>
              <div>
                <h4 className="font-display font-semibold text-on-surface" style={{ fontSize: 24, lineHeight: "32px" }}>{stat.label}</h4>
                <p className="text-on-surface-variant text-sm">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="cum-functioneaza" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-display font-semibold text-on-surface mb-4" style={{ fontSize: 32, lineHeight: "40px" }}>Cum funcționează</h2>
          <p className="text-on-surface-variant">Setezi totul în mai puțin de un minut.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px bg-surface-variant z-0" />

          {[
            {
              icon: "person_add",
              title: "Creezi contul gratuit",
              desc: "14 zile trial inclus, înscriere în 30 de secunde fără card.",
              variant: "filled",
            },
            {
              icon: "add_business",
              title: "Adaugi firmele după CUI",
              desc: "Preluăm datele automat de la ANAF, ONRC și BPI într-o secundă.",
              variant: "outlined",
            },
            {
              icon: "mail",
              title: "Primești alerte pe email",
              desc: "Te notificăm instant de fiecare dată când apare o schimbare relevantă.",
              variant: "ghost",
            },
          ].map((step) => (
            <div key={step.title} className="flex flex-col items-center text-center gap-6 relative z-10">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  step.variant === "filled"
                    ? "bg-primary-container text-white shadow-lg"
                    : step.variant === "outlined"
                    ? "bg-white border-2 border-primary-container text-primary-container shadow-md"
                    : "bg-white border border-surface-variant text-primary-container shadow-sm"
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 32 }}>{step.icon}</span>
              </div>
              <div>
                <h3 className="font-display font-semibold text-on-surface mb-2" style={{ fontSize: 24, lineHeight: "32px" }}>{step.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── What you monitor ── */}
      <section id="ce-monitorizezi" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-semibold text-on-surface mb-4" style={{ fontSize: 32, lineHeight: "40px" }}>Ce monitorizezi</h2>
            <p className="text-on-surface-variant">Acoperim toate aspectele critice ale sănătății unei afaceri.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-8 rounded-2xl border border-surface-container bg-surface-bright hover:shadow-md transition-shadow group cursor-default"
              >
                <span
                  className="material-symbols-outlined text-primary-container mb-4 block group-hover:scale-110 transition-transform"
                  style={{ fontSize: 32 }}
                >
                  {f.icon}
                </span>
                <h4 className="font-display font-semibold text-on-surface mb-2" style={{ fontSize: 18 }}>{f.title}</h4>
                <p className="text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pret" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-semibold text-on-surface mb-4" style={{ fontSize: 32, lineHeight: "40px" }}>Prețuri clare, fără surprize</h2>
            <p className="text-on-surface-variant">Firme nelimitate incluse în ambele planuri.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Monthly */}
            <div className="border border-surface-variant rounded-2xl p-8 bg-white">
              <h3 className="font-display font-bold text-on-surface text-lg mb-2">Lunar</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display font-bold text-on-surface" style={{ fontSize: 36 }}>99</span>
                <span className="text-on-surface-variant text-sm">RON/lună</span>
              </div>
              <p className="text-on-surface-variant text-sm mb-6">Facturare lunară</p>
              <ul className="space-y-2.5 mb-8 text-sm text-on-surface-variant">
                {["Firme nelimitate", "Alerte email instant", "Toate sursele de date", "Anulezi oricând"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 18 }}>check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full text-center border border-outline-variant text-on-surface-variant py-3 rounded-xl font-display font-semibold hover:bg-surface-container-low transition-colors"
              >
                Incepe gratuit
              </Link>
            </div>
            {/* Annual */}
            <div className="border-2 border-primary-container rounded-2xl p-8 bg-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-secondary-container text-on-secondary-container text-xs font-bold px-2.5 py-1 rounded-full">
                Economisesti 20%
              </div>
              <h3 className="font-display font-bold text-on-surface text-lg mb-2">Anual</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display font-bold text-on-surface" style={{ fontSize: 36 }}>79</span>
                <span className="text-on-surface-variant text-sm">RON/lună</span>
              </div>
              <p className="text-on-surface-variant text-sm mb-6">Facturat anual · 948 RON/an</p>
              <ul className="space-y-2.5 mb-8 text-sm text-on-surface-variant">
                {["Firme nelimitate", "Alerte email instant", "Toate sursele de date", "Suport prioritar"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 18 }}>check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full text-center bg-primary-container text-white py-3 rounded-xl font-display font-semibold hover:opacity-90 transition-all active:scale-95"
              >
                Incepe gratuit
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="w-full py-12 border-t border-surface-variant bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-1">
            <span className="font-display font-bold text-on-surface text-lg">ImmAlert</span>
            <p className="text-sm text-outline">© 2024 ImmAlert. Toate drepturile rezervate.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {["Termeni și Condiții", "Confidențialitate", "Contact", "Blog", "API Docs"].map((link) => (
              <a key={link} href="#" className="text-sm text-outline hover:text-primary-container underline decoration-2 underline-offset-4 transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
