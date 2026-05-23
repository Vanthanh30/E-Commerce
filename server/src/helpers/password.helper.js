import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export function isPasswordHashed(password = "") {
  return /^\$2[aby]\$\d{2}\$/.test(password);
}

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(plainPassword, storedPassword) {
  if (!storedPassword) return false;
  if (!isPasswordHashed(storedPassword)) {
    return plainPassword === storedPassword;
  }

  return bcrypt.compare(plainPassword, storedPassword);
}
