import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from './AuthLayout'
import FieldLabel from '@/components/primitives/FieldLabel/FieldLabel'
import Input from '@/components/primitives/Input/Input'
import Button from '@/components/primitives/Button/Button'
import s from './AuthForm.module.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const next: typeof errors = {}
    if (!email) next.email = 'Email is required.'
    else if (!EMAIL_RE.test(email)) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Password is required.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    // Auth wiring (POST /auth/login via apiFetch) lands in Phase 4 —
    // see docs/development/deferred-work.md.
  }

  return (
    <AuthLayout tagline="Welcome back to your garden.">
      <form onSubmit={handleSubmit} noValidate>
        <div className={s.field}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <span className={s.error}>{errors.email}</span>}
        </div>

        <div className={s.field}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <span className={s.error}>{errors.password}</span>}
        </div>

        <Button type="submit" variant="primary" className={s.submit}>Login</Button>
      </form>

      <p className={s.toggle}>
        Don't have an account?{' '}
        <Link to="/register" className={s.toggleLink}>Sign up</Link>
      </p>
    </AuthLayout>
  )
}
