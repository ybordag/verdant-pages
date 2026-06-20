import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from './AuthLayout'
import FieldLabel from '@/components/primitives/FieldLabel/FieldLabel'
import Input from '@/components/primitives/Input/Input'
import Button from '@/components/primitives/Button/Button'
import s from './AuthForm.module.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
}

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const next: FormErrors = {}
    if (!email) next.email = 'Email is required.'
    else if (!EMAIL_RE.test(email)) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Password is required.'
    else if (password.length < MIN_PASSWORD_LENGTH) next.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    // Auth wiring (POST /auth/register via apiFetch) lands in Phase 4 —
    // see docs/development/deferred-work.md.
  }

  return (
    <AuthLayout tagline="Create your account — registration is open to anyone for now.">
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <span className={s.error}>{errors.password}</span>}
        </div>

        <div className={s.field}>
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && <span className={s.error}>{errors.confirmPassword}</span>}
        </div>

        <Button type="submit" variant="primary" className={s.submit}>Sign Up</Button>
      </form>

      <p className={s.toggle}>
        Already have an account?{' '}
        <Link to="/login" className={s.toggleLink}>Log in</Link>
      </p>
    </AuthLayout>
  )
}
