import { NextRequest } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return Response.json({ error: 'Brak pliku.' }, { status: 400 });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return Response.json({ error: 'Niedozwolony format pliku. Użyj JPG, PNG, WebP, AVIF lub GIF.' }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: 'Plik jest za duży (max 5 MB).' }, { status: 400 });
  }

  const blob = await put(file.name, file, { access: 'public' });
  return Response.json({ url: blob.url });
}
