import { pgTable, uuid, text, numeric, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const clientStatusEnum = pgEnum('client_status', ['active', 'suspended']);

export const clients = pgTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').unique().notNull(),
  businessName: text('business_name').notNull(),
  email: text('email').notNull(),
  status: clientStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const clientAuth = pgTable('client_auth', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientSlug: text('client_slug').notNull().references(() => clients.slug),
  passwordHash: text('password_hash').notNull(),
});

export const settings = pgTable('settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientSlug: text('client_slug').notNull().references(() => clients.slug),
  // RestaurantInfo
  phone: text('phone'),
  address: text('address'),
  emailContact: text('email_contact'),
  openingHours: text('opening_hours'),
  minimumOrderAmount: numeric('minimum_order_amount'),
  // BrandSettings
  restaurantName: text('restaurant_name'),
  tagline: text('tagline'),
  heroLabel: text('hero_label'),
  heroTitle: text('hero_title'),
  heroHighlight: text('hero_highlight'),
  heroSubtitle: text('hero_subtitle'),
  categoryEmoji: text('category_emoji'),
  brandColor: text('brand_color'),
  secondaryColor: text('secondary_color'),
  // SeoSettings
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  faviconUrl: text('favicon_url'),
  // EmailSettings
  ownerEmailSubject: text('owner_email_subject'),
  ownerEmailBody: text('owner_email_body'),
  customerEmailSubject: text('customer_email_subject'),
  customerEmailBody: text('customer_email_body'),
  // Stripe + Resend per tenant
  stripePublishableKey: text('stripe_publishable_key'),
  stripeSecretKey: text('stripe_secret_key'),
  stripeWebhookSecret: text('stripe_webhook_secret'),
  resendApiKey: text('resend_api_key'),
  resendFrom: text('resend_from'),
});

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientSlug: text('client_slug').notNull().references(() => clients.slug),
  name: text('name').notNull(),
  order: integer('order').default(0).notNull(),
});

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientSlug: text('client_slug').notNull().references(() => clients.slug),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price').notNull(),
  allergens: text('allergens'),
  imageUrl: text('image_url'),
  categoryId: uuid('category_id').references(() => categories.id),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientSlug: text('client_slug').notNull().references(() => clients.slug),
  orderNumber: text('order_number').unique().notNull(),
  stripeSessionId: text('stripe_session_id'),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  amountTotal: numeric('amount_total').notNull(),
  shippingAddress: text('shipping_address'),
  notes: text('notes'),
  status: text('status').default('completed').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  productName: text('product_name').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price').notNull(),
});
