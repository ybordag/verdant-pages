import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AuthLayout from './AuthLayout'
import FieldLabel from '@/components/primitives/FieldLabel/FieldLabel'
import Input from '@/components/primitives/Input/Input'
import Button from '@/components/primitives/Button/Button'
import { useAuth } from '@/lib/auth/context'
import { ApiError } from '@/lib/api/client'
import s from './AuthForm.module.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface LoginNavState {
  email?: string
  notice?: string
}

export default function LoginPage() {
  const { login } = useAuth()
  const location = useLocation()
  const navState = location.state as LoginNavState | null
  const [email, setEmail] = useState(navState?.email ?? '')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [loginFailed, setLoginFailed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isSubmitting) return
    setFormError(null)
    setLoginFailed(false)

    const next: typeof errors = {}
    if (!email) next.email = 'Email is required.'
    else if (!EMAIL_RE.test(email)) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Password is required.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setIsSubmitting(true)
    try {
      await login(email, password)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // Cambium returns the same 401 whether the email doesn't exist or the
        // password is wrong (deliberately — distinguishing the two would let
        // anyone enumerate registered emails), so the message has to cover
        // both cases rather than claim to know which one happened.
        setLoginFailed(true)
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout tagline="Welcome back to your garden.">
      <form onSubmit={handleSubmit} noValidate>
        {!formError && !loginFailed && navState?.notice && <p className={s.notice}>{navState.notice}</p>}
        {formError && <p className={s.formError}>{formError}</p>}
        {loginFailed && (
          <p className={s.formError}>
            Invalid email or password.{' '}
            <Link to="/register" className={s.toggleLink}>No account yet? Sign up</Link>
          </p>
        )}

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

        <Button type="submit" variant="primary" className={s.submit} disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Login'}
        </Button>
      </form>

      <p className={s.toggle}>
        Don't have an account?{' '}
        <Link to="/register" className={s.toggleLink}>Sign up</Link>
      </p>
    </AuthLayout>
  )
}
