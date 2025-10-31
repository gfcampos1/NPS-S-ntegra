import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  // CWE-916: Usar 12 rounds para segurança adequada (era 10)
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}
