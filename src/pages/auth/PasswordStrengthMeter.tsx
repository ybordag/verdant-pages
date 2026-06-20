import { Check, X } from 'lucide-react'
import { PASSWORD_REQUIREMENTS, passwordStrength } from './passwordStrength'
import s from './PasswordStrengthMeter.module.css'

const LEVEL_LABEL = ['Weak', 'Weak', 'Fair', 'Good', 'Strong']
const LEVEL_CLASS = [s.level0, s.level0, s.level1, s.level2, s.level3]

export default function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = passwordStrength(password)
  const showBars = password.length > 0

  return (
    <div className={s.meter}>
      <div className={s.bars} aria-hidden={!showBars}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={[s.bar, showBars && i < strength ? LEVEL_CLASS[strength] : ''].filter(Boolean).join(' ')}
          />
        ))}
      </div>
      {showBars && <p className={s.label}>{LEVEL_LABEL[strength]}</p>}

      <ul className={s.requirements}>
        {PASSWORD_REQUIREMENTS.map((req) => {
          const met = req.test(password)
          return (
            <li key={req.label} className={met ? s.met : undefined}>
              {met ? <Check size={12} /> : <X size={12} />}
              {req.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
