import { db } from './db';
import { categories, products, settings } from './db/schema';
import { eq, asc } from 'drizzle-orm';

// --- Types (same shape as old datocms.ts for easy migration) ---

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  allergens: string;
  image: { url: string; alt: string } | null;
  category: { id: string; name: string };
}

export interface RestaurantInfo {
  phone: string;
  address: string;
  email: string;
  openingHours: string;
  minimumOrderAmount: number | null;
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  favicon: { url: string } | null;
}

export interface BrandSettings {
  restaurantName: string;
  restaurantTagline: string;
  heroLabel: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  categoryEmoji: string;
  brandColor: string;
  secondaryColor: string;
}

export interface EmailSettings {
  ownerSubject: string;
  ownerBody: string;
  customerSubject: string;
  customerBody: string;
}

// --- Helpers ---

async function getSettings(clientSlug: string) {
  const rows = await db
    .select()
    .from(settings)
    .where(eq(settings.clientSlug, clientSlug))
    .limit(1);
  return rows[0] ?? null;
}

// --- Queries ---

export async function getAllCategories(clientSlug: string): Promise<Category[]> {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.clientSlug, clientSlug))
    .orderBy(asc(categories.order));
  return rows.map(r => ({ id: r.id, name: r.name, order: r.order }));
}

export async function getAllProducts(clientSlug: string): Promise<Product[]> {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      allergens: products.allergens,
      imageUrl: products.imageUrl,
      categoryId: products.categoryId,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.clientSlug, clientSlug));

  return rows.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description ?? '',
    price: parseFloat(r.price),
    allergens: r.allergens ?? '',
    image: r.imageUrl ? { url: r.imageUrl, alt: r.name } : null,
    category: { id: r.categoryId ?? '', name: r.categoryName ?? '' },
  }));
}

export async function getProductsByCategory(clientSlug: string, categoryId: string): Promise<Product[]> {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      allergens: products.allergens,
      imageUrl: products.imageUrl,
      categoryId: products.categoryId,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.clientSlug, clientSlug));

  return rows
    .filter(r => r.categoryId === categoryId)
    .map(r => ({
      id: r.id,
      name: r.name,
      description: r.description ?? '',
      price: parseFloat(r.price),
      allergens: r.allergens ?? '',
      image: r.imageUrl ? { url: r.imageUrl, alt: r.name } : null,
      category: { id: r.categoryId ?? '', name: r.categoryName ?? '' },
    }));
}

export async function getRestaurantInfo(clientSlug: string): Promise<RestaurantInfo> {
  const s = await getSettings(clientSlug);
  return {
    phone: s?.phone ?? '',
    address: s?.address ?? '',
    email: s?.emailContact ?? '',
    openingHours: s?.openingHours ?? '',
    minimumOrderAmount: s?.minimumOrderAmount ? parseFloat(s.minimumOrderAmount) : null,
  };
}

export async function getSeoSettings(clientSlug: string): Promise<SeoSettings> {
  const s = await getSettings(clientSlug);
  return {
    metaTitle: s?.metaTitle ?? '',
    metaDescription: s?.metaDescription ?? '',
    favicon: s?.faviconUrl ? { url: s.faviconUrl } : null,
  };
}

export async function getBrandSettings(clientSlug: string): Promise<BrandSettings> {
  const s = await getSettings(clientSlug);
  return {
    restaurantName: s?.restaurantName ?? '',
    restaurantTagline: s?.tagline ?? '',
    heroLabel: s?.heroLabel ?? '',
    heroTitle: s?.heroTitle ?? '',
    heroHighlight: s?.heroHighlight ?? '',
    heroSubtitle: s?.heroSubtitle ?? '',
    categoryEmoji: s?.categoryEmoji ?? '🍗',
    brandColor: s?.brandColor ?? '#FF6B35',
    secondaryColor: s?.secondaryColor ?? '#2C3E50',
  };
}

export async function getEmailSettings(clientSlug: string): Promise<EmailSettings> {
  const s = await getSettings(clientSlug);
  return {
    ownerSubject: s?.ownerEmailSubject ?? 'Nowe zamówienie #{orderId}',
    ownerBody: s?.ownerEmailBody ?? 'Nowe zamówienie #{orderId}\nKlient: {name}\nKwota: {amount} PLN\n\nPozycje:\n{items}\n\nAdres: {address}\nUwagi: {notes}',
    customerSubject: s?.customerEmailSubject ?? 'Potwierdzenie zamówienia #{orderId}',
    customerBody: s?.customerEmailBody ?? 'Dziękujemy za zamówienie #{orderId}!\nKwota: {amount} PLN\n\nPozycje:\n{items}',
  };
}
