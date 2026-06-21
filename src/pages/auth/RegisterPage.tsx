import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from './AuthLayout'
import FieldLabel from '@/components/primitives/FieldLabel/FieldLabel'
import Input from '@/components/primitives/Input/Input'
import Button from '@/components/primitives/Button/Button'
import PasswordStrengthMeter from './PasswordStrengthMeter'
import { isPasswordValid } from './passwordStrength'
import { useAuth } from '@/lib/auth/context'
import { ApiError } from '@/lib/api/client'
import s from './AuthForm.module.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
}

export default function RegisterPage() {
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [emailTaken, setEmailTaken] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isSubmitting) return
    setFormError(null)
    setEmailTaken(false)

    const next: FormErrors = {}
    if (!email) next.email = 'Email is required.'
    else if (!EMAIL_RE.test(email)) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Password is required.'
    else if (!isPasswordValid(password)) next.password = 'Password does not meet all requirements below.'
    if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setIsSubmitting(true)
    try {
      await register(email, password)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setEmailTaken(true)
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout tagline="Create your account — registration is open to anyone for now.">
      <form onSubmit={handleSubmit} noValidate>
        {formError && <p className={s.formError}>{formError}</p>}
        {emailTaken && (
          <p className={s.formError}>
            An account with this email already exists.{' '}
            <Link
              to="/login"
              className={s.toggleLink}
              state={{ email, notice: 'Log in with your existing account below.' }}
            >
              Log in instead
            </Link>
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordStrengthMeter password={password} />
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

        <Button type="submit" variant="primary" className={s.submit} disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Sign Up'}
        </Button>
      </form>

      <p className={s.toggle}>
        Already have an account?{' '}
        <Link to="/login" className={s.toggleLink}>Log in</Link>
      </p>
    </AuthLayout>
  )
}
