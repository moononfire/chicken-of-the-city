import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { clients, clientAuth, settings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const agencySecret = request.headers.get('x-agency-secret');
  if (!agencySecret || agencySecret !== process.env.AGENCY_API_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { slug, businessName, email, password } = body;

  if (!slug || !businessName || !email || !password) {
    return Response.json({ error: 'Brak wymaganych pól: slug, businessName, email, password' }, { status: 400 });
  }

  // Check if slug already taken
  const existing = await db.select().from(clients).where(eq(clients.slug, slug)).limit(1);
  if (existing[0]) {
    return Response.json({ error: `Klient o slug "${slug}" już istnieje.` }, { status: 409 });
  }

  // Email służy teraz do logowania, musi być unikalny
  const existingEmail = await db.select().from(clients).where(eq(clients.email, email)).limit(1);
  if (existingEmail[0]) {
    return Response.json({ error: `Klient z adresem email "${email}" już istnieje.` }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  await db.insert(clients).values({ slug, businessName, email, status: 'active' });
  await db.insert(clientAuth).values({ clientSlug: slug, passwordHash });
  await db.insert(settings).values({
    clientSlug: slug,
    restaurantName: businessName,
    brandColor: '#FF6B35',
    secondaryColor: '#2C3E50',
    categoryEmoji: '🍗',
  });

  return Response.json({ ok: true, slug });
}
