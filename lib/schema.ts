import { pgTable, text, timestamp, boolean, jsonb, integer, numeric, uuid, pgEnum, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- ENUMS ---
export const roleEnum = pgEnum('role', ['user', 'admin']);
export const productStatusEnum = pgEnum('product_status', ['active', 'draft', 'archived']);
export const categoryEnum = pgEnum('category', ['tops', 'bottoms', 'outerwear', 'accessories', 'poleras', 'polerones', 'buzos', 'conjuntos', 'faldas', 'accesorios']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']);
export const paymentMethodEnum = pgEnum('payment_method', ['card', 'transfer', 'mercadopago']);

// --- USERS & AUTH (Auth.js Compatible) ---
export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  passwordHash: text('password_hash'),
  role: roleEnum('role').default('user').notNull(),
  image: text('image'),
  rut: text('rut'),
  address: jsonb('address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const accounts = pgTable('accounts', {
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}));

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable('verificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}));

// --- PRODUCTS ---
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: numeric('compare_at_price', { precision: 10, scale: 2 }),
  category: categoryEnum('category').notNull(),
  status: productStatusEnum('status').default('draft').notNull(),
  images: jsonb('images').default('[]').notNull(), // Array de URLs de R2
  featured: boolean('featured').default(false).notNull(),
  isSale: boolean('is_sale').default(false).notNull(),
  isPreOrder: boolean('is_pre_order').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const productVariants = pgTable('product_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  size: text('size').notNull(),
  color: text('color'),
  designVariant: text('design_variant'),
  stock: integer('stock').default(0).notNull(),
  sku: text('sku').unique().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- ORDERS ---
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('userId').references(() => users.id, { onDelete: 'set null' }),
  guestEmail: text('guest_email'),
  status: orderStatusEnum('status').default('pending').notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  paymentId: text('payment_id'),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  shippingCost: numeric('shipping_cost', { precision: 10, scale: 2 }).notNull(),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  shippingAddress: jsonb('shipping_address').notNull(),
  notes: text('notes'),
  receiptUrl: text('receipt_url'),
  trackingUrl: text('tracking_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  productSnapshot: jsonb('product_snapshot').notNull(),
});

// --- CART ---
export const cartItems = pgTable('cart_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: text('session_id').notNull(), // Id guardado en cookies del cliente
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  variantId: uuid('variant_id')
    .notNull()
    .references(() => productVariants.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- RELATIONS ---
export const productsRelations = relations(products, ({ many }) => ({
  variants: many(productVariants),
}));

export const variantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// --- CONFIGURACIÓN DE LA TIENDA (HOME) ---
export const storeSettings = pgTable('store_settings', {
  id: text('id').primaryKey(), // Siempre será "default"
  heroTitle: text('hero_title').notNull().default("Rompe las reglas.\nHaz tu propio\ncamino."),
  heroDescription: text('hero_description').notNull().default("Estética vanguardista y disruptiva. Calidad sin límites. Vestuario urbano independiente para un mundo onírico."),
  heroCtaText: text('hero_cta_text').notNull().default("Ver Colección"),
  heroCtaLink: text('hero_cta_link').notNull().default("/shop"),
  heroImageUrl: text('hero_image_url'),
  manifestoTitle: text('manifesto_title').notNull().default("Disruptive\nFluid"),
  manifestoDescription: text('manifesto_description').notNull().default("En ANTA, creemos que la indumentaria es más que simples prendas; es una declaración de identidad, pensamiento y un vehículo de expresión profundo con el entorno."),
  galleryImage1: text('gallery_image_1'),
  galleryImage2: text('gallery_image_2'),
  conceptHeading1: text('concept_heading_1').default("CREATIVE CONCEPT"),
  conceptText1: text('concept_text_1').default("En ANTA, creemos que la indumentaria es más que simples prendas; es una declaración de identidad, pensamiento y un vehículo de expresión profundo con el entorno."),
  conceptHeading2: text('concept_heading_2').default("DISRUPTIVE FLUID"),
  conceptText2: text('concept_text_2').default("El tono de voz de la marca ANTA es audaz, disruptivo, directo y minimalista. Promoviendo siempre la individualidad y exclusividad de forma directa y con un lenguaje rebelde sin exceso de texto."),
  conceptImage1: text('concept_image_1'),
  conceptImage2: text('concept_image_2'),
});

// --- COUPONS ---
export const coupons = pgTable('coupons', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  discountPercentage: integer('discount_percentage').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
