import { Link, NavLink } from 'react-router-dom'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/deals', label: 'Deals' },
]

export default function Navbar() {
  return (
    <header
      id="navbar"
      className="glass"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid rgba(96,165,250,0.1)',
        padding: '0 2rem',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        id="navbar-logo"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          textDecoration: 'none',
          fontWeight: 800,
          fontSize: '1.25rem',
        }}
      >
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg,#2563eb,#8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
          }}
        >
          🔐
        </span>
        <span className="text-gradient">DealVault</span>
      </Link>

      {/* Nav links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            id={`nav-${label.toLowerCase()}`}
            end={to === '/'}
            style={({ isActive }) => ({
              padding: '0.4rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none',
              color: isActive ? '#60a5fa' : '#94a3b8',
              background: isActive ? 'rgba(96,165,250,0.1)' : 'transparent',
              transition: 'all 0.2s ease',
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* CTA */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link to="/dashboard" id="navbar-login" className="btn btn-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}>
          Login
        </Link>
        <Link to="/deals" id="navbar-cta" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}>
          Get Started
        </Link>
      </div>
    </header>
  )
}
