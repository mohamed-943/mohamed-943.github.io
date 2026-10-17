import { useState, type FormEvent } from 'react'
import { profile } from '../../data/profile'
import { asset } from '../../lib/asset'
import { CheckIcon, CopyIcon, DownloadIcon, GitHubIcon, LinkedInIcon } from '../Icons'
import './contact.css'

// Si VITE_FORMSPREE_ID est défini (fichier .env.local ou secret de CI), le formulaire envoie via Formspree.
// Sinon, il ouvre la messagerie du visiteur avec le message pré-rempli : aucun serveur nécessaire.
const FORMSPREE = import.meta.env.VITE_FORMSPREE_ID as string | undefined

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function Contact() {
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<Status>('idle')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    if (!FORMSPREE) {
      const subject = encodeURIComponent(String(data.get('subject') || 'Contact depuis le portfolio'))
      const body = encodeURIComponent(`${data.get('message')}\n\n${data.get('name')}\n${data.get('email')}`)
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
      return
    }
    setStatus('sending')
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE}`, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
      setStatus(res.ok ? 'sent' : 'error')
      if (res.ok) e.currentTarget.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="section contact" id="contact" aria-labelledby="contact-title">
      <div className="wrap ctc-grid">
        <div>
          <h2 className="section-title" id="contact-title">
            Parlons de votre stage PFE
          </h2>
          <p className="section-lead ctc-lead">
            Je cherche un stage de 4 à 6 mois à partir de février 2027, en AI Engineering ou en Data Engineering.
          </p>

          <button className="ctc-email" onClick={copy} aria-live="polite">
            <span>{profile.email}</span>
            {copied ? (
              <span className="ctc-copied">
                <CheckIcon /> Adresse copiée
              </span>
            ) : (
              <span className="ctc-copy">
                <CopyIcon /> Copier
              </span>
            )}
          </button>

          <ul className="ctc-links">
            <li>
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                <LinkedInIcon /> LinkedIn
              </a>
            </li>
            <li>
              <a href={profile.github} target="_blank" rel="noreferrer">
                <GitHubIcon /> GitHub
              </a>
            </li>
            <li>
              <a href={asset(profile.cv.ai)} download>
                <DownloadIcon /> CV AI Engineer
              </a>
            </li>
            <li>
              <a href={asset(profile.cv.data)} download>
                <DownloadIcon /> CV Data Engineer
              </a>
            </li>
          </ul>
          <p className="ctc-phone">
            Téléphone : <a href={`tel:${profile.phone.replace(/\s/g, '')}`}>{profile.phone}</a>
          </p>
        </div>

        <form className="ctc-form" onSubmit={submit}>
          <div className="field">
            <label htmlFor="f-name">Nom</label>
            <input id="f-name" name="name" required autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="f-email">E-mail professionnel</label>
            <input id="f-email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="f-subject">Objet</label>
            <input id="f-subject" name="subject" placeholder="Stage PFE Data Engineer, février 2027" />
          </div>
          <div className="field">
            <label htmlFor="f-message">Message</label>
            <textarea id="f-message" name="message" rows={5} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Envoi en cours…' : 'Envoyer le message'}
          </button>
          <p className="ctc-status" role="status">
            {status === 'sent' && 'Message envoyé, merci. Je reviens vers vous rapidement.'}
            {status === 'error' && `L’envoi a échoué. Écrivez-moi directement à ${profile.email}.`}
            {status === 'idle' && !FORMSPREE && 'Le bouton ouvre votre messagerie avec le message pré-rempli.'}
          </p>
        </form>
      </div>
    </section>
  )
}
