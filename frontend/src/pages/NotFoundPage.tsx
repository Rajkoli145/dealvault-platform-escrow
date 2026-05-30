import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div
      id="not-found-page"
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🔍</div>
      <h1 style={{ fontSize: '6rem', fontWeight: 800, margin: 0 }} className="text-gradient">404</h1>
      <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '2rem' }}>
        Oops! This page doesn't exist.
      </p>
      <Link to="/" id="not-found-home-link" className="btn btn-primary">
        ← Back to Home
      </Link>
    </div>
  )
}
