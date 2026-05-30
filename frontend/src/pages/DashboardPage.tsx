const stats = [
  { label: 'Total Deals', value: '0', icon: '📁' },
  { label: 'Active Deals', value: '0', icon: '⚡' },
  { label: 'Completed', value: '0', icon: '✅' },
  { label: 'Disputed', value: '0', icon: '⚖️' },
]

export default function DashboardPage() {
  return (
    <div id="dashboard-page" style={{ padding: '3rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontWeight: 800, fontSize: '2rem', marginBottom: '0.5rem', color: '#f1f5f9' }}>
        Dashboard
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: '3rem' }}>Welcome back — here's your escrow overview.</p>

      {/* Stats grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '3rem',
        }}
      >
        {stats.map(({ label, value, icon }) => (
          <div
            key={label}
            id={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}
            className="glass"
            style={{ borderRadius: '1rem', padding: '1.75rem', textAlign: 'center' }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{icon}</div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#f1f5f9' }}>{value}</div>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Recent deals placeholder */}
      <div
        id="recent-deals"
        className="glass"
        style={{ borderRadius: '1rem', padding: '2rem', textAlign: 'center', color: '#64748b' }}
      >
        <p style={{ fontSize: '1.125rem', margin: 0 }}>🚀 No deals yet. <a href="/deals" style={{ color: '#60a5fa' }}>Create your first deal →</a></p>
      </div>
    </div>
  )
}
