import Link from "next/link";
import Image from "next/image";

const features = [
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
      </svg>
    ),
    title: "TVA & Inregistrare",
    desc: "Statusul inregistrarii in scopuri de TVA si modificari regim.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    title: "Inactivitate Fiscala",
    desc: "Monitorizare stare activitate conform evidentelor ANAF.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
      </svg>
    ),
    title: "Insolventa & Faliment",
    desc: "Alerte BPI pentru dosare noi sau termene de judecata.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: "Schimbare Administrator",
    desc: "Notificari privind schimbarea persoanelor cu drept de semnatura.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: "Sediu Social",
    desc: "Monitorizare valabilitate si schimbari de sediu principal.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Date Financiare",
    desc: "Cifra de afaceri, profit, datorii si bilantturi anuale depuse.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: "e-Factura",
    desc: "Statusul tehnic si conformitatea cu sistemul RO e-Factura.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
    title: "ONRC",
    desc: "Mentiuni noi, depuneri de acte si alte cereri la Registrul Comertului.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Nav */}
      <nav className="border-b border-[--color-border] bg-background sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold text-[--color-brand]">ImmAlert</span>
            <div className="hidden md:flex items-center gap-1">
              <a href="#cum-functioneaza" className="text-sm text-[--color-muted] hover:text-[--color-foreground] px-3 py-1.5 rounded-md transition-colors">
                Platforma
              </a>
              <a href="#ce-monitorizezi" className="text-sm text-[--color-muted] hover:text-[--color-foreground] px-3 py-1.5 rounded-md transition-colors">
                Solutii
              </a>
              <a href="#pret" className="text-sm text-[--color-muted] hover:text-[--color-foreground] px-3 py-1.5 rounded-md transition-colors">
                Preturi
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[--color-muted] hover:text-[--color-foreground] px-3 py-2 transition-colors">
              Autentificare
            </Link>
            <Link
              href="/register"
              className="bg-[--color-brand] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[--color-brand-dark] transition-colors"
            >
              Incepe Trial Gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[--color-surface] pt-16 pb-0 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left */}
            <div className="pt-8 pb-20">
              <div className="inline-flex items-center gap-2 bg-[--color-brand-light] text-[--color-brand] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-[--color-brand]/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="4" />
                </svg>
                NOU: Integrare e-Factura automata
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-[--color-foreground] leading-tight mb-6 text-balance">
                Monitorizare in timp real.{" "}
                <span className="text-[--color-brand]">Stii primul</span>{" "}
                cand se schimba ceva la firmele tale.
              </h1>
              <p className="text-[--color-muted] text-lg leading-relaxed mb-8 max-w-md">
                Monitorizare automata TVA, insolventa, administrator, sediu si date financiare pentru orice firma din Romania. Alerte pe email instant.
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-[--color-brand] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[--color-brand-dark] transition-colors text-sm"
                >
                  Incepe Trial Gratuit 14 Zile
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <a
                  href="#pret"
                  className="inline-flex items-center gap-2 border border-[--color-border] text-[--color-foreground] font-medium px-6 py-3 rounded-lg hover:border-[--color-brand]/40 hover:bg-[--color-brand-light] transition-colors text-sm"
                >
                  Vezi preturile
                </a>
              </div>
              <div className="flex items-center gap-4 text-xs text-[--color-muted]">
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Fara card
                </span>
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Fara obligatii
                </span>
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Anulezi oricand
                </span>
              </div>
            </div>

            {/* Right - Dashboard preview */}
            <div className="relative hidden lg:block">
              <div className="relative mt-4 rounded-t-2xl overflow-hidden shadow-2xl border border-[--color-border] border-b-0">
                <Image
                  src="/dashboard-preview.jpg"
                  alt="ImmAlert dashboard preview"
                  width={680}
                  height={440}
                  className="w-full object-cover"
                  priority
                />
                {/* Alert card overlay */}
                <div className="absolute bottom-[-16px] left-[-20px] bg-white rounded-xl shadow-lg border border-[--color-border] px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#f97316" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[--color-foreground]">Alerta Insolventa</p>
                    <p className="text-xs text-[--color-muted]">S.C. Exemplu S.R.L.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-[--color-border] bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-3 divide-x divide-[--color-border]">
            <div className="flex items-center gap-4 py-6 px-8">
              <div className="w-10 h-10 bg-[--color-brand-light] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-[--color-foreground]">5+ Surse</p>
                <p className="text-sm text-[--color-muted]">Date oficiale centralizate</p>
              </div>
            </div>
            <div className="flex items-center gap-4 py-6 px-8">
              <div className="w-10 h-10 bg-[--color-brand-light] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-[--color-foreground]">Zilnic</p>
                <p className="text-sm text-[--color-muted]">Verificare automata</p>
              </div>
            </div>
            <div className="flex items-center gap-4 py-6 px-8">
              <div className="w-10 h-10 bg-[--color-brand-light] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-[--color-foreground]">Instant</p>
                <p className="text-sm text-[--color-muted]">Alerte pe email</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="cum-functioneaza" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[--color-foreground] mb-3 text-balance">Cum functioneaza</h2>
          <p className="text-[--color-muted] mb-16">Setezi totul in mai putin de un minut.</p>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-px bg-[--color-border]" />
            {[
              {
                icon: (
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                ),
                title: "Creezi contul gratuit",
                desc: "14 zile trial inclus, inscriere in 30 de secunde fara card.",
              },
              {
                icon: (
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
                ),
                title: "Adaugi firmele dupa CUI",
                desc: "Preluam datele automat de la ANAF, ONRC si BPI intr-o secunda.",
              },
              {
                icon: (
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                ),
                title: "Primesti alerte pe email",
                desc: "Te notificam instant de fiecare data cand apare o schimbare relevanta.",
              },
            ].map((step) => (
              <div key={step.title} className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-[--color-brand] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[--color-brand]/30 relative z-10">
                  {step.icon}
                </div>
                <h3 className="font-semibold text-[--color-foreground]">{step.title}</h3>
                <p className="text-[--color-muted] text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="ce-monitorizezi" className="py-24 px-6 bg-[--color-surface]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[--color-foreground] mb-3 text-balance">Ce monitorizezi</h2>
            <p className="text-[--color-muted]">Acoperim toate aspectele critice ale sanatatii unei afaceri.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl p-5 border border-[--color-border] hover:border-[--color-brand]/40 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 text-[--color-brand] mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-[--color-foreground] mb-1.5 text-sm">{f.title}</h3>
                <p className="text-[--color-muted] text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pret" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[--color-foreground] mb-3 text-balance">Preturi clare, fara surprize</h2>
            <p className="text-[--color-muted]">Firme nelimitate incluse in ambele planuri</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Monthly */}
            <div className="border border-[--color-border] rounded-2xl p-8 bg-white">
              <h3 className="font-bold text-[--color-foreground] text-lg mb-2">Lunar</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-[--color-foreground]">99</span>
                <span className="text-[--color-muted] text-sm">RON/luna</span>
              </div>
              <p className="text-[--color-muted] text-sm mb-6">Facturare lunara</p>
              <ul className="space-y-2.5 mb-8 text-sm text-[--color-muted]">
                {["Firme nelimitate", "Alerte email instant", "Toate sursele de date", "Anulezi oricand"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center border border-[--color-brand] text-[--color-brand] font-semibold py-3 rounded-xl hover:bg-[--color-brand-light] transition-colors text-sm"
              >
                Incepe Trial Gratuit
              </Link>
            </div>
            {/* Annual */}
            <div className="border-2 border-[--color-brand] rounded-2xl p-8 bg-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-[--color-success-bg] text-[--color-success] text-xs font-bold px-2.5 py-1 rounded-full">
                Economisesti 240 RON/an
              </div>
              <h3 className="font-bold text-[--color-foreground] text-lg mb-2">Anual</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-[--color-brand]">79</span>
                <span className="text-[--color-muted] text-sm">RON/luna</span>
              </div>
              <p className="text-[--color-muted] text-sm mb-6">948 RON/an, facturat anual</p>
              <ul className="space-y-2.5 mb-8 text-sm text-[--color-muted]">
                {["Firme nelimitate", "Alerte email instant", "Toate sursele de date", "Anulezi oricand"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center bg-[--color-brand] text-white font-semibold py-3 rounded-xl hover:bg-[--color-brand-dark] transition-colors text-sm"
              >
                Incepe Trial Gratuit
              </Link>
            </div>
          </div>
          <p className="text-center text-[--color-muted] text-sm mt-6">14 zile trial gratuit • Fara card • Anulezi oricand</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-[--color-surface]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[--color-foreground] mb-12 text-balance">Intrebari frecvente</h2>
          <div className="space-y-3">
            {[
              { q: "Cate firme pot monitoriza?", a: "Nelimitat! Ambele planuri includ firme nelimitate." },
              { q: "Trebuie sa introduc cardul pentru trial?", a: "Nu. Trialul de 14 zile este complet gratuit, fara card si fara obligatii." },
              { q: "Cat de des verificati datele?", a: "ANAF este verificat zilnic. ONRC saptamanal. BPI zilnic. Datele financiare anual cand sunt disponibile." },
              { q: "Pot anula oricand?", a: "Da, anulezi din setarile contului, fara penalizari. Abonamentul ramane activ pana la sfarsitul perioadei platite." },
              { q: "De unde preluati datele?", a: "Din surse oficiale gratuite: API ANAF, ONRC (data.gov.ro), Buletinul Procedurilor de Insolventa si Ministerul Finantelor." },
              { q: "Functioneaza pentru toate firmele din Romania?", a: "Da, pentru orice firma cu CUI valid inregistrata in Romania." },
            ].map((faq) => (
              <details key={faq.q} className="bg-white rounded-xl border border-[--color-border] p-5 group">
                <summary className="font-semibold text-[--color-foreground] cursor-pointer list-none flex justify-between items-center text-sm">
                  {faq.q}
                  <svg
                    width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    className="text-[--color-muted] group-open:rotate-180 transition-transform flex-shrink-0"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <p className="text-[--color-muted] mt-3 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-[--color-border] bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-[--color-brand] text-lg">ImmAlert</p>
            <p className="text-[--color-muted] text-xs mt-0.5">
              &copy; {new Date().getFullYear()} ImmAlert. Toate drepturile rezervate.
            </p>
          </div>
          <nav className="flex items-center gap-5">
            <a href="#" className="text-[--color-muted] hover:text-[--color-foreground] text-sm transition-colors">Termeni si Conditii</a>
            <a href="#" className="text-[--color-muted] hover:text-[--color-foreground] text-sm transition-colors">Confidentialitate</a>
            <a href="#" className="text-[--color-muted] hover:text-[--color-foreground] text-sm transition-colors">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
