'use client'
import { useState, useEffect, useRef } from 'react'

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [billingAnnual, setBillingAnnual] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const features = [
    {
      icon: '⚡',
      title: 'Mode Entraînement',
      desc: 'Feedback immédiat après chaque réponse. Explications détaillées, scoring partiel pour les QCMs à réponses multiples.',
    },
    {
      icon: '🎯',
      title: 'Mode Examen',
      desc: "Simulation d'examen chronométrée. Conditions réelles, résultats complets à la fin avec révision question par question.",
    },
    {
      icon: '☑',
      title: 'Multi-réponses',
      desc: "Support natif des questions à réponses multiples. Scoring intelligent : correct, partiel ou incorrect selon vos choix.",
    },
    {
      icon: '📊',
      title: 'Analytics Précis',
      desc: 'Suivez votre progression par module. Identifiez vos points faibles et concentrez vos révisions là où ça compte.',
    },
    {
      icon: '📌',
      title: 'Carnet de Révision',
      desc: "Marquez les questions difficiles, constituez votre carnet d'erreurs. Révisez intelligemment, pas aléatoirement.",
    },
    {
      icon: '📁',
      title: 'Import CSV',
      desc: "Les admins importent des centaines de questions en secondes via CSV. Format simple, validation automatique.",
    },
  ]

  const plans = [
    {
      name: 'Gratuit',
      price: 0,
      priceAnnual: 0,
      color: '#333',
      accent: '#888',
      desc: 'Pour découvrir la plateforme',
      features: [
        '50 questions par mois',
        'Mode entraînement',
        '2 matières',
        'Stats de base',
      ],
      cta: 'Commencer gratuitement',
      highlight: false,
    },
    {
      name: 'Étudiant',
      price: 49,
      priceAnnual: 39,
      color: '#c8f04e',
      accent: '#c8f04e',
      desc: 'Pour réviser sérieusement',
      features: [
        'Questions illimitées',
        'Mode examen + entraînement',
        'Toutes les matières',
        'Analytics avancés',
        'Carnet de révision',
        'Historique complet',
      ],
      cta: "S'abonner",
      highlight: true,
    },
    {
      name: 'Promo',
      price: 29,
      priceAnnual: 19,
      color: '#4e80f0',
      accent: '#4e80f0',
      desc: 'Pour les groupes et prépas',
      features: [
        'Tout Étudiant inclus',
        'Accès groupe (5 étudiants)',
        'Tableau de bord admin',
        'Import CSV illimité',
        'Support prioritaire',
      ],
      cta: 'Contacter',
      highlight: false,
    },
  ]

  const faqs = [
    {
      q: 'Les questions sont-elles adaptées au programme marocain ?',
      a: "Oui, toutes les questions sont tirées des examens des facultés de médecine marocaines. Chaque question est liée à une matière, un module et une année d'examen.",
    },
    {
      q: 'Qu\'est-ce que le scoring partiel ?',
      a: "Pour les QCMs à réponses multiples, si vous cochez 2 bonnes réponses sur 4, vous obtenez 50% du point. Pas de pénalité pour les bonnes réponses manquées, mais les mauvaises choix annulent.",
    },
    {
      q: 'Puis-je utiliser MedQCM sur mobile ?',
      a: "Absolument. La plateforme est conçue mobile-first. L'interface est optimisée pour réviser dans le transport, entre les cours, ou partout ailleurs.",
    },
    {
      q: 'Comment importer mes propres questions ?',
      a: "Les administrateurs peuvent importer des questions via un fichier CSV simple. Le format supporte les réponses multiples avec séparateur point-virgule. Validation automatique à l'import.",
    },
    {
      q: 'Y a-t-il un engagement ?',
      a: "Non. Vous pouvez annuler à tout moment. Le plan gratuit reste disponible indéfiniment sans carte bancaire.",
    },
  ]

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: '#0a0a0a',
      color: '#e0e0e0',
      minHeight: '100vh',
      overflowX: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;0,800;0,900;1,300&family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #c8f04e33; color: #c8f04e; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .float { animation: float 4s ease-in-out infinite; }
        .nav-link {
          color: #666;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: color 0.2s;
          cursor: pointer;
        }
        .nav-link:hover { color: #e0e0e0; }
        .btn-primary {
          background: #c8f04e;
          color: #0a0a0a;
          border: none;
          border-radius: 10px;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }
        .btn-primary:hover { background: #d4f570; transform: translateY(-1px); }
        .btn-ghost {
          background: transparent;
          color: #c8f04e;
          border: 1.5px solid #c8f04e44;
          border-radius: 10px;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }
        .btn-ghost:hover { border-color: #c8f04e; background: #c8f04e11; }
        .feature-card {
          background: #111;
          border: 1px solid #1e1e1e;
          border-radius: 16px;
          padding: 28px;
          transition: all 0.3s;
          cursor: default;
        }
        .feature-card:hover {
          border-color: #c8f04e33;
          background: #141414;
          transform: translateY(-4px);
        }
        .plan-card {
          background: #111;
          border: 1px solid #1e1e1e;
          border-radius: 20px;
          padding: 32px 28px;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }
        .plan-card.highlight {
          border-color: #c8f04e55;
          background: #111;
        }
        .plan-card.highlight::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #c8f04e, transparent);
        }
        .faq-item {
          border-bottom: 1px solid #1a1a1a;
          padding: 20px 0;
          cursor: pointer;
        }
        .faq-item:last-child { border-bottom: none; }
        .toggle-track {
          width: 44px;
          height: 24px;
          border-radius: 12px;
          cursor: pointer;
          position: relative;
          transition: background 0.2s;
          border: none;
          font-family: inherit;
        }
        .toggle-thumb {
          position: absolute;
          top: 3px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #0a0a0a;
          transition: left 0.2s;
        }
        @media (max-width: 768px) {
          .features-grid { grid-template-columns: 1fr !important; }
          .plans-grid { grid-template-columns: 1fr !important; }
          .hero-title { font-size: 42px !important; }
          .nav-links { display: none !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 24px',
        background: scrollY > 40 ? 'rgba(10,10,10,0.95)' : 'transparent',
        backdropFilter: scrollY > 40 ? 'blur(12px)' : 'none',
        borderBottom: scrollY > 40 ? '1px solid #1a1a1a' : '1px solid transparent',
        transition: 'all 0.3s',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: 1100, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: '#c8f04e', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>☑</div>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#f0f0f0', letterSpacing: -0.5 }}>MedQCM</span>
        </div>
        <div className="nav-links" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <a className="nav-link" href="#features">Fonctionnalités</a>
          <a className="nav-link" href="#pricing">Tarifs</a>
          <a className="nav-link" href="#faq">FAQ</a>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/login" style={{ textDecoration: 'none' }}>
            <button className="btn-ghost" style={{ padding: '8px 18px', fontSize: 13 }}>Connexion</button>
          </a>
          <a href="/login?signup=true" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>Commencer</button>
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 24px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, #c8f04e08 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', left: '20%', width: 200, height: 200, background: 'radial-gradient(circle, #4e80f008 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '30%', right: '15%', width: 150, height: 150, background: 'radial-gradient(circle, #c8f04e05 0%, transparent 70%)', pointerEvents: 'none', animation: 'pulse 8s ease-in-out infinite 2s' }} />

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#c8f04e11', border: '1px solid #c8f04e33', borderRadius: 20, padding: '6px 16px', marginBottom: 32, animation: 'fadeUp 0.5s ease forwards' }}>
          <span style={{ fontSize: 10, letterSpacing: 2, color: '#c8f04e', textTransform: 'uppercase', fontWeight: 700 }}>Faculté de Médecine et de Pharmacie </span>
        </div>

        {/* Title */}
        <h1 className="hero-title" style={{
          fontSize: 64, fontWeight: 900, lineHeight: 1.05, letterSpacing: -2,
          fontFamily: "'Playfair Display', serif",
          color: '#f0f0f0',
          maxWidth: 800,
          marginBottom: 24,
          animation: 'fadeUp 0.6s ease 0.1s both',
        }}>
          Révisez comme un{' '}
          <span style={{ color: '#c8f04e', fontStyle: 'italic' }}>champion</span>
          {' '} and ACE your exams!
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 18, color: '#666', lineHeight: 1.7, maxWidth: 520,
          marginBottom: 40, fontWeight: 300,
          animation: 'fadeUp 0.6s ease 0.2s both',
        }}>
          La plateforme QCM conçue pour les étudiants en médecine marocains. Questions d&apos;examens réels, scoring intelligent, analytics précis.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', animation: 'fadeUp 0.6s ease 0.3s both' }}>
          <a href="/login?signup=true" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '14px 32px', fontSize: 15 }}>
              Commencer gratuitement →
            </button>
          </a>
          <a href="#features" style={{ textDecoration: 'none' }}>
            <button className="btn-ghost" style={{ padding: '14px 32px', fontSize: 15 }}>
              Voir les fonctionnalités
            </button>
          </a>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 48, marginTop: 80, flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeUp 0.6s ease 0.4s both',
        }}>
          {[
            { value: '2,000+', label: 'Questions' },
            { value: '8', label: 'Matières' },
            { value: '500+', label: 'Étudiants' },
            { value: '94%', label: 'Taux de satisfaction' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#f0f0f0', fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#555', marginTop: 4, letterSpacing: 0.5 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Floating UI mockup */}
        <div className="float" style={{
          marginTop: 80, width: '100%', maxWidth: 360,
          background: '#111', border: '1px solid #1e1e1e', borderRadius: 20,
          padding: 20, textAlign: 'left',
          animation: 'fadeUp 0.7s ease 0.5s both, float 4s ease-in-out 1.5s infinite',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px #1e1e1e',
        }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 10, background: '#c8f04e22', color: '#c8f04e', border: '1px solid #c8f04e44', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>Cardiologie</span>
            <span style={{ fontSize: 10, background: '#f4a82122', color: '#f4a821', border: '1px solid #f4a82144', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>☑ 3 réponses</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0', lineHeight: 1.5, marginBottom: 14, fontFamily: "'Playfair Display', serif" }}>
            Quelles sont les cardiopathies fréquentes dans la trisomie 21 ?
          </div>
          {[
            { text: 'Canal atrio-ventriculaire', correct: true, selected: true },
            { text: 'Communication inter-auriculaire', correct: true, selected: true },
            { text: 'Sténose aortique', correct: false, selected: false },
            { text: 'Communication inter-ventriculaire', correct: true, selected: false },
          ].map((o, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, marginBottom: 6,
              background: o.correct && o.selected ? '#c8f04e0e' : o.selected && !o.correct ? '#f04e4e0e' : o.correct ? '#c8f04e06' : 'transparent',
              border: `1px solid ${o.correct && o.selected ? '#c8f04e44' : o.selected && !o.correct ? '#f04e4e44' : o.correct ? '#c8f04e22' : '#1e1e1e'}`,
            }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: o.correct && o.selected ? '#c8f04e' : '#1a1a1a', border: '1px solid #333', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#0a0a0a', fontWeight: 800 }}>
                {o.correct && o.selected ? '✓' : ''}
              </div>
              <span style={{ fontSize: 11, color: o.correct ? '#c8f04e' : '#666' }}>{o.text}</span>
              {o.correct && !o.selected && <span style={{ marginLeft: 'auto', fontSize: 9, color: '#c8f04e', background: '#c8f04e11', border: '1px solid #c8f04e33', borderRadius: 3, padding: '1px 5px' }}>✓</span>}
            </div>
          ))}
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ overflow: 'hidden', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', padding: '14px 0', background: '#0d0d0d' }}>
        <div style={{ display: 'flex', animation: 'marquee 20s linear infinite', width: 'max-content' }}>
          {[...Array(2)].map((_, j) => (
            <div key={j} style={{ display: 'flex', gap: 48, paddingRight: 48 }}>
              {['Génétique', 'Cardiologie', 'Biochimie', 'Histologie', 'Pharmacologie', 'Anatomie', 'Hématologie', 'Physiologie', 'Microbiologie', 'Immunologie'].map((s, i) => (
                <span key={i} style={{ fontSize: 12, color: '#333', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  {s} <span style={{ color: '#c8f04e', marginLeft: 24 }}>·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" style={{ padding: '100px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: '#c8f04e', textTransform: 'uppercase', fontWeight: 700, marginBottom: 16 }}>Fonctionnalités</div>
          <h2 style={{ fontSize: 42, fontWeight: 900, fontFamily: "'Playfair Display', serif", color: '#f0f0f0', lineHeight: 1.15, letterSpacing: -1 }}>
            Tout ce dont vous avez besoin<br />
            <span style={{ color: '#c8f04e', fontStyle: 'italic' }}>pour réussir</span>
          </h2>
        </div>
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div style={{ fontSize: 28, marginBottom: 16 }}>{f.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0', marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: '100px 24px', background: '#080808' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#c8f04e', textTransform: 'uppercase', fontWeight: 700, marginBottom: 16 }}>Tarifs</div>
            <h2 style={{ fontSize: 42, fontWeight: 900, fontFamily: "'Playfair Display', serif", color: '#f0f0f0', lineHeight: 1.15, letterSpacing: -1, marginBottom: 24 }}>
              Simple et transparent
            </h2>
            {/* Billing toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: !billingAnnual ? '#e0e0e0' : '#555', fontWeight: 600 }}>Mensuel</span>
              <button
                className="toggle-track"
                onClick={() => setBillingAnnual(!billingAnnual)}
                style={{ background: billingAnnual ? '#c8f04e' : '#222' }}
              >
                <div className="toggle-thumb" style={{ left: billingAnnual ? 23 : 3 }} />
              </button>
              <span style={{ fontSize: 13, color: billingAnnual ? '#e0e0e0' : '#555', fontWeight: 600 }}>
                Annuel <span style={{ fontSize: 10, color: '#c8f04e', fontWeight: 700, marginLeft: 4 }}>-20%</span>
              </span>
            </div>
          </div>
          <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {plans.map((p, i) => (
              <div key={i} className={`plan-card${p.highlight ? ' highlight' : ''}`}>
                {p.highlight && (
                  <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 10, background: '#c8f04e', color: '#0a0a0a', borderRadius: 6, padding: '3px 8px', fontWeight: 800, letterSpacing: 0.5 }}>POPULAIRE</div>
                )}
                <div style={{ fontSize: 13, fontWeight: 700, color: p.accent, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#555', marginBottom: 24 }}>{p.desc}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 42, fontWeight: 900, color: '#f0f0f0', fontFamily: "'Playfair Display', serif", letterSpacing: -1 }}>
                    {p.price === 0 ? '0' : billingAnnual ? p.priceAnnual : p.price}
                  </span>
                  {p.price > 0 && <span style={{ fontSize: 13, color: '#555' }}>MAD/mois</span>}
                </div>
                {p.price > 0 && billingAnnual && (
                  <div style={{ fontSize: 11, color: '#555', marginBottom: 20 }}>
                    Facturé <span style={{ color: '#c8f04e' }}>{(p.priceAnnual * 12)} MAD/an</span>
                  </div>
                )}
                <div style={{ height: 1, background: '#1a1a1a', margin: '20px 0' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: p.accent, fontSize: 13, marginTop: 1, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 13, color: '#aaa', lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="/login" style={{ textDecoration: 'none', display: 'block' }}>
                  <button style={{
                    width: '100%', padding: '12px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                    background: p.highlight ? '#c8f04e' : 'transparent',
                    color: p.highlight ? '#0a0a0a' : p.accent,
                    border: p.highlight ? 'none' : `1.5px solid ${p.accent}44`,
                  }}>
                    {p.cta}
                  </button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: '100px 24px', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: '#c8f04e', textTransform: 'uppercase', fontWeight: 700, marginBottom: 16 }}>FAQ</div>
          <h2 style={{ fontSize: 42, fontWeight: 900, fontFamily: "'Playfair Display', serif", color: '#f0f0f0', letterSpacing: -1 }}>
            Questions fréquentes
          </h2>
        </div>
        <div style={{ border: '1px solid #1a1a1a', borderRadius: 16, overflow: 'hidden' }}>
          {faqs.map((f, i) => (
            <div
              key={i}
              className="faq-item"
              style={{ padding: '20px 24px', borderBottom: i < faqs.length - 1 ? '1px solid #1a1a1a' : 'none' }}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: openFaq === i ? '#c8f04e' : '#e0e0e0', lineHeight: 1.4 }}>{f.q}</span>
                <span style={{ color: '#555', fontSize: 18, flexShrink: 0, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
              </div>
              {openFaq === i && (
                <div style={{ fontSize: 13, color: '#888', lineHeight: 1.7, marginTop: 12, paddingTop: 12, borderTop: '1px solid #1a1a1a' }}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', background: 'linear-gradient(135deg, #c8f04e0a, #0a0a0a)', border: '1px solid #c8f04e22', borderRadius: 24, padding: '60px 40px' }}>
          <div style={{ fontSize: 36, fontWeight: 900, fontFamily: "'Playfair Display', serif", color: '#f0f0f0', letterSpacing: -1, marginBottom: 16, lineHeight: 1.2 }}>
            Prêt à passer au niveau supérieur ?
          </div>
          <p style={{ fontSize: 15, color: '#666', marginBottom: 32, lineHeight: 1.6 }}>
            Rejoignez les étudiants qui révisent intelligemment avec MedQCM.
          </p>
          <a href="/login?signup=true" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '14px 36px', fontSize: 15 }}>
              Commencer gratuitement →
            </button>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #1a1a1a', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 22, height: 22, background: '#c8f04e', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>☑</div>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#f0f0f0' }}>MedQCM</span>
        </div>
        <div style={{ fontSize: 12, color: '#333' }}>
          © 2025 MedQCM · Fait pour les étudiants en médecine marocains
        </div>
      </footer>
    </div>
  )
}