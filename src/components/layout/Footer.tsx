import { profile } from '../../data/profile'

// Version injectée au build par la CI (vite.config.ts) : on sait toujours quel commit est en ligne.
declare const __BUILD_SHA__: string
declare const __BUILD_DATE__: string
declare const __BUILD_REPO__: string

const YEAR = new Date().getFullYear()

export default function Footer() {
  const sha = __BUILD_SHA__
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <p>
          © {YEAR} {profile.name}. Conçu et développé par moi, déployé automatiquement par GitHub Actions.
        </p>
        <p className="footer-build">
          Version{' '}
          {sha !== 'local' ? (
            <a href={`https://github.com/${__BUILD_REPO__}/commit/${sha}`} target="_blank" rel="noreferrer">
              {sha.slice(0, 7)}
            </a>
          ) : (
            'locale'
          )}{' '}
          du {__BUILD_DATE__}
        </p>
      </div>
    </footer>
  )
}
