import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-secret-change-me');

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(clientSlug: string): Promise<string> {
  return new SignJWT({ clientSlug })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<{ clientSlug: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return { clientSlug: payload.clientSlug as string };
  } catch {
    return null;
  }
}
