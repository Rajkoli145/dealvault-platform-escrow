import { Link } from 'react-router-dom'

const features = [
  { icon: '🔐', title: 'Secure Escrow', desc: 'Funds locked safely until both parties confirm deal completion.' },
  { icon: '⚡', title: 'Instant Releases', desc: 'Automated payment release on approval — no delays, no friction.' },
  { icon: '⚖️', title: 'Dispute Resolution', desc: 'Built-in mediation system to handle disagreements fairly.' },
  { icon: '📊', title: 'Deal Analytics', desc: 'Real-time dashboards to track every deal from start to close.' },
]

export default function HomePage() {
  return (
    <div id="home-page">
      {/* ── Hero ── */}
      <section
        id="hero"
        style={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          padding: '4rem 2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background blobs */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
            bottom: '15%',
            right: '10%',
            pointerEvents: 'none',
          }}
        />

        <div className="animate-fade-in-up" style={{ maxWidth: 760, position: 'relative' }}>
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(37,99,235,0.15)',
              border: '1px solid rgba(96,165,250,0.3)',
              borderRadius: 999,
              padding: '0.35rem 1rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#60a5fa',
              marginBottom: '1.5rem',
              letterSpacing: '0.04em',
            }}
          >
            ✨ Escrow for the modern era
          </span>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              color: '#f1f5f9',
            }}
          >
            Transact with{' '}
            <span className="text-gradient">total confidence.</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: '#94a3b8',
              lineHeight: 1.7,
              marginBottom: '2.5rem',
              maxWidth: 600,
              margin: '0 auto 2.5rem',
            }}
          >
            DealVault locks funds securely until every condition of your deal is met.
            Buyers, sellers, and freelancers — all protected.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/deals" id="hero-cta-primary" className="btn btn-primary animate-pulse-glow" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
              Create a Deal →
            </Link>
            <Link to="/dashboard" id="hero-cta-secondary" className="btn btn-ghost" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section
        id="features"
        style={{
          padding: '6rem 2rem',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <h2
          className="text-gradient"
          style={{
            textAlign: 'center',
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            fontWeight: 700,
            marginBottom: '3rem',
          }}
        >
          Everything you need for secure deals
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {features.map(({ icon, title, desc }) => (
            <div
              key={title}
              id={`feature-${title.toLowerCase().replace(/\s+/g, '-')}`}
              className="glass animate-fade-in-up"
              style={{
                borderRadius: '1rem',
                padding: '2rem',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(37,99,235,0.25)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLDivElement).style.transform = ''
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = ''
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.5rem', color: '#f1f5f9' }}>
                {title}
              </h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.6, margin: 0, fontSize: '0.9375rem' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
