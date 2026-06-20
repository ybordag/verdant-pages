export interface PasswordRequirement {
  label: string
  test(password: string): boolean
}

// Exactly 4 requirements — maps 1:1 to the 4-bar strength meter.
export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'Letters and numbers', test: (pw) => /[a-zA-Z]/.test(pw) && /[0-9]/.test(pw) },
  { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One special character', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
]

export function passwordStrength(password: string): number {
  return PASSWORD_REQUIREMENTS.filter((req) => req.test(password)).length
}

export function isPasswordValid(password: string): boolean {
  return passwordStrength(password) === PASSWORD_REQUIREMENTS.length
}
