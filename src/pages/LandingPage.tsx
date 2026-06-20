import { Link } from 'react-router-dom'
import Button from '@/components/primitives/Button/Button'
import ThemeToggle from '@/components/primitives/ThemeToggle/ThemeToggle'
import s from './LandingPage.module.css'

function GithubIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.7 1.25 3.35.96.1-.74.39-1.25.71-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.07.78 2.15 0 1.56-.01 2.81-.01 3.19 0 .31.21.66.79.55A11.5 11.5 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
    </svg>
  )
}

export default function LandingPage() {
  return (
    <div className={s.page}>
      <a
        className={s.githubLink}
        href="https://github.com/ybordag/verdant-pages"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View on GitHub"
        title="View on GitHub"
      >
        <GithubIcon />
      </a>

      <div className={s.topRight}>
        <ThemeToggle />
        <Link to="/login">
          <Button variant="ghost-clay" size="sm">Login</Button>
        </Link>
        <Link to="/register">
          <Button variant="primary" size="sm">Sign Up</Button>
        </Link>
      </div>

      <div className={s.hero}>
        <h1 className={s.wordmark}>Verdant Pages</h1>
        <p className={s.tagline}>
          Plan, tend, and track your garden — with Rhizome doing the thinking alongside you.
        </p>
      </div>
    </div>
  )
}
