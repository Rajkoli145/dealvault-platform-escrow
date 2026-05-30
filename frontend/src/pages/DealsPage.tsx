export default function DealsPage() {
  return (
    <div id="deals-page" style={{ padding: '3rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '2rem', marginBottom: '0.25rem', color: '#f1f5f9' }}>
            My Deals
          </h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>Manage all your escrow deals in one place.</p>
        </div>
        <button id="create-deal-btn" className="btn btn-primary">
          + New Deal
        </button>
      </div>

      {/* Empty state */}
      <div
        id="deals-empty-state"
        className="glass"
        style={{
          borderRadius: '1.5rem',
          padding: '5rem 2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📁</div>
        <h2 style={{ fontWeight: 700, fontSize: '1.5rem', color: '#f1f5f9', marginBottom: '0.75rem' }}>
          No deals yet
        </h2>
        <p style={{ color: '#94a3b8', marginBottom: '2rem', maxWidth: 400, margin: '0 auto 2rem' }}>
          Start your first escrow deal to securely transact with buyers or sellers.
        </p>
        <button id="deals-empty-cta" className="btn btn-primary">
          Create your first deal →
        </button>
      </div>
    </div>
  )
}
