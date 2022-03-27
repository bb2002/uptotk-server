import * as bcrypt from 'bcrypt';

export function encryptString(plainText: string): Promise<string> {
  const saltOrRounds = 10;
  return bcrypt.hash(plainText, saltOrRounds);
}

export function compareString(
  plainText: string,
  encryptedText: string,
): Promise<boolean> {
  return bcrypt.compare(plainText, encryptedText);
}
