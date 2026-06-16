import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clientAuth, clients } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json({ error: 'Brak danych logowania.' }, { status: 400 });
  }

  // Find client by email
  const clientRows = await db.select().from(clients).where(eq(clients.email, email)).limit(1);
  if (!clientRows[0]) {
    return Response.json({ error: 'Nieprawidłowe dane logowania.' }, { status: 401 });
  }
  const clientSlug = clientRows[0].slug;

  // Find auth record
  const authRows = await db.select().from(clientAuth).where(eq(clientAuth.clientSlug, clientSlug)).limit(1);
  if (!authRows[0]) {
    return Response.json({ error: 'Nieprawidłowe dane logowania.' }, { status: 401 });
  }

  const valid = await verifyPassword(password, authRows[0].passwordHash);
  if (!valid) {
    return Response.json({ error: 'Nieprawidłowe hasło.' }, { status: 401 });
  }

  const token = await signToken(clientSlug);
  const response = NextResponse.json({ ok: true });
  response.cookies.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return response;
}
