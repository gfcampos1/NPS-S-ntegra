import crypto from 'crypto'

export function generateUniqueToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

export function generateShortToken(length: number = 8): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed ambiguous characters
  let token = ''
  const bytes = crypto.randomBytes(length)
  
  for (let i = 0; i < length; i++) {
    token += characters[bytes[i] % characters.length]
  }
  
  return token
}
