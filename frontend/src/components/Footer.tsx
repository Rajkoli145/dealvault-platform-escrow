export default function Footer() {
  return (
    <footer
      id="footer"
      className="glass"
      style={{
        borderTop: '1px solid rgba(96,165,250,0.1)',
        padding: '1.5rem 2rem',
        textAlign: 'center',
        fontSize: '0.8125rem',
        color: '#64748b',
      }}
    >
      <p style={{ margin: 0 }}>
        © {new Date().getFullYear()} <span className="text-gradient" style={{ fontWeight: 600 }}>DealVault</span> — Secure Escrow Platform. All rights reserved.
      </p>
    </footer>
  )
}
