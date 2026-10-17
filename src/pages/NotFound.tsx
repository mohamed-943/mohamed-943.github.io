import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="wrap" style={{ minHeight: '80vh', display: 'grid', alignContent: 'center', gap: 24, paddingTop: 'var(--nav-h)' }}>
      <h1 className="section-title">Cette page n’existe pas.</h1>
      <p className="section-lead">Le lien est peut-être ancien. Les projets et le contact sont sur la page d’accueil.</p>
      <p>
        <Link className="btn btn-primary" to="/">
          Revenir à l’accueil
        </Link>
      </p>
    </main>
  )
}
