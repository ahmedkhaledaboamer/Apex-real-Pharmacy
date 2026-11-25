/**
 * Local, in-browser replacement for the REST backend.
 *
 * Every call that used to go to `${API_BASE_URL}/...` is answered here from a
 * small database kept in localStorage (key `apex_db`). Response shapes
 * mirror the old API so pages, hooks and the dashboard work unchanged.
 *
 * Demo accounts (created on first load):
 *   admin@apexaora.com    / Admin@123     (dashboard)
 *   customer@apexaora.com / Customer@123  (shopping)
 */
import { BRANCHES, BRANDS, CATEGORIES, COUPONS, PRODUCTS } from './catalog';

/* --------------------------------- Types --------------------------------- */
type Doc = Record<string, any> & { _id: string; createdAt: string; updatedAt: string };
type Role = 'user' | 'manager' | 'admin';

interface DB {
  version: number;
  users: Doc[];
  categories: Doc[];
  subcategories: Doc[];
  brands: Doc[];
  products: Doc[];
  reviews: Doc[];
  coupons: Doc[];
  branches: Doc[];
  orders: Doc[];
  carts: Doc[];
}

export interface MockResponse {
  status: number;
  payload: unknown;
}

type Params = Record<string, string | string[]>;
interface Ctx {
  method: string;
  path: string;
  seg: string[];
  params: Params;
  body: Record<string, any>;
  files: Record<string, string[]>;
  user: Doc | null;
}

const STORAGE_KEY = 'apex_db';
const DB_VERSION = 5;
const RESET_CODE_HINT = 'Any 6-digit code works in local mode (e.g. 123456).';

/* -------------------------------- Helpers -------------------------------- */
const now = () => new Date().toISOString();
const oid = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('');
const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));
const round2 = (n: number) => Math.round(n * 100) / 100;

class HttpError extends Error {
  status: number;
  errors?: Array<{ msg: string; path: string }>;
  constructor(status: number, message: string, errors?: Array<{ msg: string; path: string }>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}
const fail = (status: number, message: string): never => {
  throw new HttpError(status, message);
};
const invalid = (path: string, msg: string): never => {
  throw new HttpError(400, msg, [{ msg, path }]);
};

/** Small deterministic PRNG so the seed looks the same on every machine. */
function prng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const hashPw = (pw: string) => {
  let h = 5381;
  for (const ch of `apex:${pw}`) h = ((h << 5) + h + ch.charCodeAt(0)) >>> 0;
  return `h${h.toString(16)}`;
};

/* --------------------------------- Seed ---------------------------------- */
function seed(): DB {
  const rand = prng(20261125);
  const stamp = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000 - Math.floor(rand() * 86400000)).toISOString();
  const doc = (fields: Record<string, any>, daysAgo = 200): Doc => {
    const t = stamp(daysAgo);
    return { _id: oid(), ...fields, createdAt: t, updatedAt: t };
  };

  const users: Doc[] = [
    doc({ name: 'Apex Aora Admin', email: 'admin@apexaora.com', phone: '0500000000', role: 'admin', active: true, password: hashPw('Admin@123'), wishlist: [], addresses: [] }, 400),
    doc({ name: 'Pharmacy Manager', email: 'manager@apexaora.com', phone: '0500000001', role: 'manager', active: true, password: hashPw('Manager@123'), wishlist: [], addresses: [] }, 380),
    doc(
      {
        name: 'Sara Ahmed',
        email: 'customer@apexaora.com',
        phone: '0501234567',
        role: 'user',
        active: true,
        password: hashPw('Customer@123'),
        wishlist: [],
        addresses: [{ _id: oid(), alias: 'Home', details: 'Marina Walk, Tower 3, Apt 1204', phone: '0501234567', city: 'Dubai', postalCode: '00000' }]
      },
      150
    )
  ];
  const shopperNames = ['Mohamed Ali', 'Fatima Hassan', 'Omar Khalid', 'Layla Mansour', 'Yousef Ibrahim', 'Noura Saeed', 'Ahmed Mostafa', 'Mariam Adel'];
  shopperNames.forEach((name, i) =>
    users.push(
      doc(
        {
          name,
          email: `${name.split(' ')[0].toLowerCase()}@example.com`,
          phone: `05${String(10000000 + i * 1234567).slice(0, 8)}`,
          role: 'user',
          active: true,
          password: hashPw('Customer@123'),
          wishlist: [],
          addresses: [{ _id: oid(), alias: 'Home', details: `Building ${10 + i}, Street ${3 + i}`, phone: '0500000000', city: ['Dubai', 'Abu Dhabi', 'Sharjah'][i % 3] }]
        },
        300 - i * 20
      )
    )
  );
  const shoppers = users.filter((u) => u.role === 'user');

  const categories: Doc[] = [];
  const subcategories: Doc[] = [];
  const catIds: Record<string, string> = {};
  const subIds: Record<string, string[]> = {};
  for (const c of CATEGORIES) {
    const cat = doc({ name: c.name, nameAr: c.nameAr, slug: slugify(c.name), image: `/images/categories/${c.key}.webp`, color: c.tone }, 365);
    categories.push(cat);
    catIds[c.key] = cat._id;
    subIds[c.key] = c.subs.map(([en, ar]) => {
      const s = doc({ name: en, nameAr: ar, slug: slugify(en), category: cat._id }, 360);
      subcategories.push(s);
      return s._id;
    });
  }

  const brands: Doc[] = [];
  const brandIds: Record<string, string> = {};
  for (const b of BRANDS) {
    const br = doc({ name: b.name, nameAr: b.nameAr, slug: slugify(b.name), image: b.logo === false ? undefined : `/images/brands/${b.key}.png` }, 365);
    brands.push(br);
    brandIds[b.key] = br._id;
  }

  const products: Doc[] = [];
  const reviews: Doc[] = [];
  const reviewTitles: Array<[number, string]> = [
    [5, 'Excellent quality, works exactly as described.'],
    [5, 'منتج ممتاز وفعال، أنصح به بشدة.'],
    [5, 'Fast delivery and well packed. Will buy again.'],
    [5, 'التوصيل سريع والمنتج أصلي. شكراً صيدلية أبكس أورا.'],
    [4, 'Very good, the pharmacist gave great advice.'],
    [4, 'جيد جداً والسعر مناسب.'],
    [4, 'Does the job, good value for money.'],
    [3, 'Okay, but I expected faster results.']
  ];
  PRODUCTS.forEach((p, i) => {
    const prod = doc(
      {
        title: p.title,
        titleAr: p.titleAr,
        slug: p.slug,
        description: p.description,
        descriptionAr: p.descriptionAr,
        benefits: p.benefits.map(([en, ar]) => ({ en, ar })),
        ingredients: p.ingredients.map(([en, ar]) => ({ en, ar })),
        directions: { en: p.directions[0], ar: p.directions[1] },
        sizes: p.sizes.map(([en, ar]) => ({ en, ar })),
        featured: !!p.featured,
        quantity: p.quantity,
        sold: p.sold,
        price: p.price,
        ...(p.sale ? { priceAfterDiscount: p.sale } : {}),
        colors: [],
        imageCover: `/images/products/${p.slug}.jpg`,
        images: [],
        category: catIds[p.category],
        subcategories: [subIds[p.category][p.sub]].filter(Boolean),
        brand: brandIds[p.brand],
        ratingsAverage: 0,
        ratingsQuantity: 0
      },
      240 - i * 4
    );
    // a handful of real reviews per product, skewed towards the catalog rating
    const n = 3 + Math.floor(rand() * 4);
    const pool = [...shoppers].sort(() => rand() - 0.5).slice(0, n);
    let sum = 0;
    pool.forEach((u, k) => {
      const candidates = reviewTitles.filter(([r]) => (p.rating >= 4.7 ? r >= 4 : r >= 3));
      const [r, title] = candidates[Math.floor(rand() * candidates.length)];
      sum += r;
      reviews.push(doc({ title, ratings: r, user: u._id, product: prod._id }, 60 - k * 7));
    });
    prod.ratingsQuantity = n;
    prod.ratingsAverage = round2(sum / n);
    products.push(prod);
  });

  const coupons = COUPONS.map((c) => doc({ name: c.name, discount: c.discount, expire: new Date(Date.now() + c.days * 86400000).toISOString() }, 30));
  const branches = BRANCHES.map((b) => doc({ ...b, isMain: !!(b as { isMain?: boolean }).isMain, active: true }, 365));

  // sample order history so the dashboard has something to show
  const orders: Doc[] = [];
  for (let i = 0; i < 26; i++) {
    const u = shoppers[Math.floor(rand() * shoppers.length)];
    const count = 1 + Math.floor(rand() * 3);
    const items = Array.from({ length: count }, () => {
      const p = products[Math.floor(rand() * products.length)];
      return { _id: oid(), product: p._id, quantity: 1 + Math.floor(rand() * 2), price: p.priceAfterDiscount ?? p.price };
    });
    const total = round2(items.reduce((s, it) => s + it.price * it.quantity, 0));
    const daysAgo = Math.floor(rand() * 170);
    const created = stamp(daysAgo);
    const paid = daysAgo > 3 || rand() > 0.5;
    const delivered = paid && daysAgo > 5;
    const addr = u.addresses[0];
    orders.push({
      _id: oid(),
      user: u._id,
      cartItems: items,
      shippingAddress: { details: addr.details, phone: addr.phone, city: addr.city, postalCode: addr.postalCode },
      taxPrice: 0,
      shippingPrice: 0,
      totalOrderPrice: total,
      paymentMethodType: 'cash',
      isPaid: paid,
      paidAt: paid ? created : null,
      isDelivered: delivered,
      deliveredAt: delivered ? created : null,
      createdAt: created,
      updatedAt: created
    });
  }

  return { version: DB_VERSION, users, categories, subcategories, brands, products, reviews, coupons, branches, orders, carts: [] };
}

/* ------------------------------ Persistence ------------------------------ */
let db: DB | null = null;

function load(): DB {
  if (db) return db;
  try {
    window.localStorage.removeItem('apex_db_v1'); // pre-release catalog
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      if (parsed?.version === DB_VERSION) return (db = parsed);
    }
  } catch {
    /* fall through to a fresh seed */
  }
  db = seed();
  persist();
  return db;
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    throw new HttpError(500, 'Local storage is full. Use smaller images or reset the demo data.');
  }
}

/** Wipes local data and reseeds the catalog (also signs everyone out). */
export function resetMockDatabase() {
  db = seed();
  persist();
}

/* ------------------------------ Serialisers ------------------------------ */
const publicUser = (u: Doc) => {
  const { password: _pw, ...rest } = u;
  return clone(rest);
};
const userRef = (id: string) => {
  const u = load().users.find((x) => x._id === id);
  return u ? { _id: u._id, name: u.name, email: u.email, phone: u.phone, profileImg: u.profileImg } : null;
};
const catRef = (id?: string | null) => {
  const c = id ? load().categories.find((x) => x._id === id) : null;
  return c ? { _id: c._id, name: c.name, nameAr: c.nameAr, slug: c.slug } : null;
};
const outProduct = (p: Doc) => ({ ...clone(p), id: p._id, category: catRef(p.category) });
const outReview = (r: Doc) => {
  const u = load().users.find((x) => x._id === r.user);
  return { ...clone(r), user: u ? { _id: u._id, name: u.name } : r.user };
};
const outOrder = (o: Doc) => ({
  ...clone(o),
  user: userRef(o.user),
  cartItems: o.cartItems.map((it: Doc) => {
    const p = load().products.find((x) => x._id === it.product);
    return { ...clone(it), product: p ? { _id: p._id, title: p.title, titleAr: p.titleAr, imageCover: p.imageCover } : null };
  })
});

/* ------------------------------ Query engine ----------------------------- */
const RESERVED = new Set(['page', 'limit', 'sort', 'keyword', 'field', 'fields', 'all']);
const KEYWORD_FIELDS = ['title', 'titleAr', 'name', 'nameAr', 'description', 'descriptionAr', 'email', 'city', 'cityAr', 'phone'];

function coerce(raw: unknown, q: string): [unknown, unknown] {
  if (typeof raw === 'number') return [raw, Number(q)];
  if (typeof raw === 'boolean') return [raw, q === 'true'];
  if (typeof raw === 'string' && /^\d{4}-\d\d-\d\dT/.test(raw) && !Number.isNaN(Date.parse(q))) return [Date.parse(raw), Date.parse(q)];
  if (raw === undefined || raw === null) {
    if (q === 'true' || q === 'false') return [false, q === 'true'];
    return [raw, q];
  }
  return [raw, q];
}

function matches(item: Doc, params: Params): boolean {
  for (const [key, value] of Object.entries(params)) {
    if (RESERVED.has(key)) continue;
    const m = key.match(/^(.+)\[(gte|gt|lte|lt|ne)\]$/);
    const field = m ? m[1] : key;
    const op = m ? m[2] : 'eq';
    const values = Array.isArray(value) ? value : [value];
    for (const v of values) {
      const raw = item[field];
      if (Array.isArray(raw)) {
        if (op === 'eq' && !raw.includes(v)) return false;
        continue;
      }
      const [a, b] = coerce(raw, v);
      if (op === 'eq' && a !== b && !(a == null && b === false)) return false;
      if (op === 'ne' && a === b) return false;
      if (op === 'gte' && !((a as number) >= (b as number))) return false;
      if (op === 'gt' && !((a as number) > (b as number))) return false;
      if (op === 'lte' && !((a as number) <= (b as number))) return false;
      if (op === 'lt' && !((a as number) < (b as number))) return false;
    }
  }
  const kw = typeof params.keyword === 'string' ? params.keyword.trim().toLowerCase() : '';
  if (kw) return KEYWORD_FIELDS.some((f) => typeof item[f] === 'string' && item[f].toLowerCase().includes(kw));
  return true;
}

function sortBy(items: Doc[], sort?: string) {
  const keys = (sort || '-createdAt').split(',').filter(Boolean);
  return [...items].sort((x, y) => {
    for (const k of keys) {
      const desc = k.startsWith('-');
      const f = desc ? k.slice(1) : k;
      let a = x[f];
      let b = y[f];
      if (typeof a === 'boolean' || typeof b === 'boolean') {
        a = a ? 1 : 0;
        b = b ? 1 : 0;
      }
      let c = 0;
      if (typeof a === 'number' && typeof b === 'number') c = a - b;
      else c = String(a ?? '').localeCompare(String(b ?? ''));
      if (c) return desc ? -c : c;
    }
    return 0;
  });
}

function list<T>(items: Doc[], params: Params, map: (d: Doc) => T = (d) => clone(d) as T) {
  const filtered = sortBy(items.filter((i) => matches(i, params)), params.sort as string);
  const limit = Math.max(1, Number(params.limit) || 50);
  const page = Math.max(1, Number(params.page) || 1);
  const skip = (page - 1) * limit;
  const numberOfPage = Math.max(1, Math.ceil(filtered.length / limit));
  const data = filtered.slice(skip, skip + limit).map(map);
  const pagination: Record<string, number> = { currentPage: page, limit, skip, numberOfPage, totalResults: filtered.length };
  if (skip + limit < filtered.length) pagination.next = page + 1;
  if (skip > 0) pagination.prev = page - 1;
  return { status: 200, payload: { results: data.length, pagination, data } };
}

/* --------------------------------- Guards -------------------------------- */
function requireUser(ctx: Ctx, roles?: Role[]): Doc {
  if (!ctx.user) fail(401, 'You are not login, Please login to get access this route');
  if (roles && !roles.includes(ctx.user!.role)) fail(403, 'You are not allowed to access this route');
  return ctx.user!;
}
const STAFF: Role[] = ['admin', 'manager'];
const requireStaff = (ctx: Ctx) => requireUser(ctx, STAFF);
const requireAdmin = (ctx: Ctx) => requireUser(ctx, ['admin']);

function find(coll: Doc[], id: string, what = 'document'): Doc {
  const d = coll.find((x) => x._id === id || x.slug === id);
  if (!d) fail(404, `No ${what} for this id ${id}`);
  return d!;
}

/* ------------------------------ Field parsing ---------------------------- */
const str = (v: unknown) => (v === undefined || v === null ? undefined : String(v));
function parseJsonList(v: unknown): unknown[] | undefined {
  if (v === undefined) return undefined;
  if (Array.isArray(v)) return v;
  try {
    const parsed = JSON.parse(String(v));
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return String(v) ? [String(v)] : [];
  }
}

function requireName(body: Record<string, any>, label: string, path = 'name') {
  const name = str(body[path])?.trim();
  if (!name) invalid(path, `${label} required`);
  if (name!.length < 2) invalid(path, `Too short ${label.toLowerCase() === 'subcategory' ? 'SubCategory' : label.toLowerCase()} name`);
  return name!;
}

/* --------------------------------- Cart ---------------------------------- */
function cartOf(userId: string): Doc | undefined {
  return load().carts.find((c) => c.user === userId);
}
function recalc(cart: Doc) {
  const total = round2(cart.cartItems.reduce((s: number, i: Doc) => s + i.price * i.quantity, 0));
  cart.totalCartPrice = total;
  if (cart.coupon) {
    const c = load().coupons.find((x) => x.name === cart.coupon && Date.parse(x.expire) > Date.now());
    if (c) cart.totalPriceAfterDiscount = round2(total - (total * c.discount) / 100);
    else {
      delete cart.coupon;
      delete cart.totalPriceAfterDiscount;
    }
  }
  cart.updatedAt = now();
}
function cartResponse(cart: Doc | undefined) {
  const data = cart ? clone(cart) : { cartItems: [], totalCartPrice: 0 };
  return { status: 200, payload: { status: 'success', numOfCartItems: data.cartItems.length, data } };
}

/* -------------------------------- Routes --------------------------------- */
type Handler = (ctx: Ctx, m: string[]) => MockResponse | Promise<MockResponse>;
const routes: Array<[string, RegExp, Handler]> = [];
const on = (method: string, pattern: string, h: Handler) => routes.push([method, new RegExp(`^${pattern.replace(/:\w+/g, '([^/]+)')}$`), h]);
const ok = (payload: unknown, status = 200): MockResponse => ({ status, payload });

/* Auth */
const tokenFor = (u: Doc) => `local.${u._id}.${Date.now().toString(36)}`;
on('POST', '/auth/login', (ctx) => {
  const email = str(ctx.body.email)?.trim().toLowerCase();
  const user = load().users.find((u) => u.email === email);
  if (!user || user.password !== hashPw(String(ctx.body.password ?? ''))) fail(401, 'Incorrect email or password');
  if (user!.active === false) user!.active = true;
  persist();
  return ok({ data: publicUser(user!), token: tokenFor(user!) });
});
on('POST', '/auth/signup', (ctx) => {
  const b = ctx.body;
  const name = str(b.name)?.trim();
  const email = str(b.email)?.trim().toLowerCase();
  if (!name) invalid('name', 'User required');
  if (name!.length < 3) invalid('name', 'Too short User name');
  if (!email) invalid('email', 'Email required');
  if (!/^\S+@\S+\.\S+$/.test(email!)) invalid('email', 'Invalid email address');
  if (load().users.some((u) => u.email === email)) invalid('email', 'E-mail already in use');
  if (!b.password) invalid('password', 'Password required');
  if (String(b.password).length < 6) invalid('password', 'Password must be at least 6 characters');
  if (b.passwordConfirm !== undefined && b.passwordConfirm !== b.password) invalid('passwordConfirm', 'Password Confirmation incorrect');
  const t = now();
  const user: Doc = { _id: oid(), name, email, role: 'user', active: true, password: hashPw(String(b.password)), wishlist: [], addresses: [], createdAt: t, updatedAt: t };
  load().users.push(user);
  persist();
  return ok({ data: publicUser(user), token: tokenFor(user) }, 201);
});
on('POST', '/auth/forgotPassword', (ctx) => {
  const email = str(ctx.body.email)?.trim().toLowerCase();
  if (!load().users.some((u) => u.email === email)) fail(404, `There is no user with that email ${email}`);
  return ok({ status: 'Success', message: `Reset code sent to email. ${RESET_CODE_HINT}` });
});
on('POST', '/auth/verifyResetCode', (ctx) => {
  if (!/^\d{6}$/.test(String(ctx.body.resetCode ?? '').trim())) fail(400, 'Reset code invalid or expired');
  return ok({ status: 'Success' });
});
on('PUT', '/auth/resetPassword', (ctx) => {
  const email = str(ctx.body.email)?.trim().toLowerCase();
  const user = load().users.find((u) => u.email === email);
  if (!user) fail(404, `There is no user with email ${email}`);
  if (!ctx.body.newPassword || String(ctx.body.newPassword).length < 6) invalid('newPassword', 'Password must be at least 6 characters');
  user!.password = hashPw(String(ctx.body.newPassword));
  user!.updatedAt = now();
  persist();
  return ok({ token: tokenFor(user!) });
});

/* Profile */
on('GET', '/users/getMe', (ctx) => ok({ data: publicUser(requireUser(ctx)) }));
on('PUT', '/users/updateMe', (ctx) => {
  const u = requireUser(ctx);
  const b = ctx.body;
  if (b.email !== undefined) {
    const email = String(b.email).trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) invalid('email', 'Invalid email address');
    if (load().users.some((x) => x.email === email && x._id !== u._id)) invalid('email', 'E-mail already in use');
    u.email = email;
  }
  if (b.name !== undefined) u.name = String(b.name).trim();
  if (b.phone !== undefined) u.phone = String(b.phone).trim();
  u.updatedAt = now();
  persist();
  return ok({ data: publicUser(u) });
});
on('PUT', '/users/changeMyPassword', (ctx) => {
  const u = requireUser(ctx);
  if (!ctx.body.password || String(ctx.body.password).length < 6) invalid('password', 'Password must be at least 6 characters');
  u.password = hashPw(String(ctx.body.password));
  u.updatedAt = now();
  persist();
  return ok({ data: publicUser(u), token: tokenFor(u) });
});
on('DELETE', '/users/deleteMe', (ctx) => {
  const u = requireUser(ctx);
  u.active = false;
  persist();
  return ok(null, 204);
});

/* Admin users */
on('PUT', '/users/changeMyPassword/:id', (ctx, [id]) => {
  requireStaff(ctx);
  const u = find(load().users, id, 'user');
  const b = ctx.body;
  if (!b.password || String(b.password).length < 6) invalid('password', 'Password must be at least 6 characters');
  if (b.passwordConfirm !== b.password) invalid('passwordConfirm', 'Password Confirmation incorrect');
  u.password = hashPw(String(b.password));
  u.updatedAt = now();
  persist();
  return ok({ data: publicUser(u) });
});
on('GET', '/users', (ctx) => (requireStaff(ctx), list(load().users, ctx.params, publicUser)));
on('GET', '/users/:id', (ctx, [id]) => (requireStaff(ctx), ok({ data: publicUser(find(load().users, id, 'user')) })));
on('POST', '/users', (ctx) => {
  requireStaff(ctx);
  const b = ctx.body;
  const name = str(b.name)?.trim();
  const email = str(b.email)?.trim().toLowerCase();
  if (!name || name.length < 3) invalid('name', 'Too short User name');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) invalid('email', 'Invalid email address');
  if (load().users.some((u) => u.email === email)) invalid('email', 'E-mail already in use');
  if (!b.password || String(b.password).length < 6) invalid('password', 'Password must be at least 6 characters');
  if (b.passwordConfirm !== b.password) invalid('passwordConfirm', 'Password Confirmation incorrect');
  if (b.role && !['user', 'manager', 'admin'].includes(b.role)) invalid('role', 'Invalid role');
  const t = now();
  const user: Doc = {
    _id: oid(), name, email, phone: str(b.phone), role: b.role || 'user', active: true, password: hashPw(String(b.password)),
    profileImg: ctx.files.profileImg?.[0], wishlist: [], addresses: [], createdAt: t, updatedAt: t
  };
  load().users.push(user);
  persist();
  return ok({ data: publicUser(user) }, 201);
});
on('PUT', '/users/:id', (ctx, [id]) => {
  requireStaff(ctx);
  const u = find(load().users, id, 'user');
  const b = ctx.body;
  if (b.email !== undefined) {
    const email = String(b.email).trim().toLowerCase();
    if (load().users.some((x) => x.email === email && x._id !== u._id)) invalid('email', 'E-mail already in use');
    u.email = email;
  }
  if (b.name !== undefined) u.name = String(b.name).trim();
  if (b.phone !== undefined) u.phone = String(b.phone);
  if (b.role !== undefined) u.role = b.role;
  if (b.active !== undefined) u.active = b.active === true || b.active === 'true';
  if (ctx.files.profileImg?.[0]) u.profileImg = ctx.files.profileImg[0];
  u.updatedAt = now();
  persist();
  return ok({ data: publicUser(u) });
});
on('DELETE', '/users/:id', (ctx, [id]) => {
  requireAdmin(ctx);
  const d = load();
  find(d.users, id, 'user');
  d.users = d.users.filter((u) => u._id !== id);
  persist();
  return ok(null, 204);
});

/* Generic catalog CRUD for categories / brands (multipart with optional image) */
function namedCrud(base: string, key: 'categories' | 'brands', label: string, onDelete?: (id: string) => void) {
  // categories/brands also report how many products they hold
  const withCount = (d: Doc) => ({ ...clone(d), productsCount: load().products.filter((p) => (key === 'categories' ? p.category : p.brand) === d._id).length });
  on('GET', base, (ctx) => list(load()[key], ctx.params, withCount));
  on('GET', `${base}/:id`, (_ctx, [id]) => ok({ data: withCount(find(load()[key], id, label)) }));
  on('POST', base, (ctx) => {
    requireStaff(ctx);
    const name = requireName(ctx.body, label);
    const t = now();
    const d: Doc = { _id: oid(), name, nameAr: str(ctx.body.nameAr)?.trim() || undefined, slug: slugify(name), image: ctx.files.image?.[0], createdAt: t, updatedAt: t };
    load()[key].push(d);
    persist();
    return ok({ data: clone(d) }, 201);
  });
  on('PUT', `${base}/:id`, (ctx, [id]) => {
    requireStaff(ctx);
    const d = find(load()[key], id, label);
    if (ctx.body.name !== undefined) {
      d.name = requireName(ctx.body, label);
      d.slug = slugify(d.name);
    }
    if (ctx.body.nameAr !== undefined) d.nameAr = String(ctx.body.nameAr).trim() || undefined;
    if (ctx.files.image?.[0]) d.image = ctx.files.image[0];
    d.updatedAt = now();
    persist();
    return ok({ data: clone(d) });
  });
  on('DELETE', `${base}/:id`, (ctx, [id]) => {
    requireAdmin(ctx);
    const db_ = load();
    find(db_[key], id, label);
    db_[key] = db_[key].filter((x) => x._id !== id);
    onDelete?.(id);
    persist();
    return ok(null, 204);
  });
}

/* Subcategories (nested route first so it wins over /categories/:id) */
on('GET', '/categories/:id/subcategory', (ctx, [id]) => list(load().subcategories, { ...ctx.params, category: id }));
on('POST', '/categories/:id/subcategory', (ctx, [id]) => {
  requireStaff(ctx);
  find(load().categories, id, 'category');
  return createSub(ctx, id);
});
function createSub(ctx: Ctx, category: string) {
  const name = requireName(ctx.body, 'SubCategory');
  if (!category) invalid('category', 'subCategory must be belong to category');
  const t = now();
  const d: Doc = { _id: oid(), name, nameAr: str(ctx.body.nameAr)?.trim() || undefined, slug: slugify(name), category, createdAt: t, updatedAt: t };
  load().subcategories.push(d);
  persist();
  return ok({ data: clone(d) }, 201);
}
on('GET', '/subcategories', (ctx) => list(load().subcategories, ctx.params));
on('GET', '/subcategories/:id', (_ctx, [id]) => ok({ data: clone(find(load().subcategories, id, 'subcategory')) }));
on('POST', '/subcategories', (ctx) => (requireStaff(ctx), createSub(ctx, str(ctx.body.category) ?? '')));
on('PUT', '/subcategories/:id', (ctx, [id]) => {
  requireStaff(ctx);
  const d = find(load().subcategories, id, 'subcategory');
  if (ctx.body.name !== undefined) {
    d.name = requireName(ctx.body, 'SubCategory');
    d.slug = slugify(d.name);
  }
  if (ctx.body.nameAr !== undefined) d.nameAr = String(ctx.body.nameAr).trim() || undefined;
  if (ctx.body.category) d.category = String(ctx.body.category);
  d.updatedAt = now();
  persist();
  return ok({ data: clone(d) });
});
on('DELETE', '/subcategories/:id', (ctx, [id]) => {
  requireAdmin(ctx);
  const d = load();
  d.subcategories = d.subcategories.filter((x) => x._id !== id);
  d.products.forEach((p) => (p.subcategories = (p.subcategories ?? []).filter((s: string) => s !== id)));
  persist();
  return ok(null, 204);
});

namedCrud('/categories', 'categories', 'Category', (id) => {
  const d = load();
  d.subcategories = d.subcategories.filter((s) => s.category !== id);
});
namedCrud('/brands', 'brands', 'Brand', (id) => {
  load().products.forEach((p) => p.brand === id && (p.brand = null));
});

/* Products */
function applyProductFields(p: Doc, ctx: Ctx, creating: boolean) {
  const b = ctx.body;
  const set = (k: string, v: unknown) => v !== undefined && (p[k] = v);
  if (creating || b.title !== undefined) {
    const title = str(b.title)?.trim();
    if (!title) invalid('title', 'Product required');
    if (title!.length < 3) invalid('title', 'must be at least 3 chars');
    p.title = title;
    p.slug = slugify(title!);
  }
  set('titleAr', str(b.titleAr)?.trim());
  if (creating || b.description !== undefined) {
    const d = str(b.description)?.trim();
    if (!d) invalid('description', 'Product description is required');
    p.description = d;
  }
  set('descriptionAr', str(b.descriptionAr)?.trim());
  if (b.quantity !== undefined) p.quantity = Math.max(0, Math.floor(Number(b.quantity) || 0));
  else if (creating) p.quantity = 0;
  if (creating || b.price !== undefined) {
    const price = Number(b.price);
    if (!(price > 0)) invalid('price', 'Product price is required');
    p.price = round2(price);
  }
  if (b.priceAfterDiscount !== undefined) {
    if (b.priceAfterDiscount === '' || b.priceAfterDiscount === null) delete p.priceAfterDiscount;
    else p.priceAfterDiscount = round2(Number(b.priceAfterDiscount));
  }
  if (creating || b.category !== undefined) {
    if (!b.category) invalid('category', 'Product must be belong to category');
    find(load().categories, String(b.category), 'category');
    p.category = String(b.category);
  }
  if (b.brand !== undefined) p.brand = b.brand ? String(b.brand) : null;
  if (b.featured !== undefined) p.featured = b.featured === true || b.featured === 'true';
  for (const k of ['colors', 'subcategories', 'benefits', 'ingredients', 'sizes'] as const) {
    const v = parseJsonList(b[k]);
    if (v !== undefined) p[k] = v;
    else if (creating) p[k] = [];
  }
  if (b.directions !== undefined) {
    try {
      const d = typeof b.directions === 'string' ? JSON.parse(b.directions) : b.directions;
      p.directions = d && (d.en || d.ar) ? d : null;
    } catch {
      p.directions = null;
    }
  }
  // cover: uploaded file wins, else a URL string
  const coverFile = ctx.files.imageCover?.[0];
  if (coverFile) p.imageCover = coverFile;
  else if (typeof b.imageCover === 'string' && b.imageCover) p.imageCover = b.imageCover;
  if (creating && !p.imageCover) invalid('imageCover', 'Product imageCover is required');
  // gallery: kept URLs (JSON list in the text field) + new files
  if (b.images !== undefined || ctx.files.images?.length) {
    const kept = (parseJsonList(Array.isArray(b.images) ? b.images[0] : b.images) ?? []).filter((x): x is string => typeof x === 'string');
    p.images = [...kept, ...(ctx.files.images ?? [])];
  } else if (creating) p.images = [];
}

on('GET', '/products', (ctx) => list(load().products, ctx.params, outProduct));
on('GET', '/products/:id', (_ctx, [id]) => ok({ data: outProduct(find(load().products, id, 'product')) }));
on('POST', '/products', (ctx) => {
  requireStaff(ctx);
  const t = now();
  const p: Doc = { _id: oid(), sold: 0, ratingsAverage: 0, ratingsQuantity: 0, featured: false, createdAt: t, updatedAt: t };
  applyProductFields(p, ctx, true);
  load().products.push(p);
  persist();
  return ok({ data: outProduct(p) }, 201);
});
on('PUT', '/products/:id', (ctx, [id]) => {
  requireStaff(ctx);
  const p = find(load().products, id, 'product');
  applyProductFields(p, ctx, false);
  p.updatedAt = now();
  persist();
  return ok({ data: outProduct(p) });
});
on('DELETE', '/products/:id', (ctx, [id]) => {
  requireAdmin(ctx);
  const d = load();
  find(d.products, id, 'product');
  d.products = d.products.filter((x) => x._id !== id);
  d.reviews = d.reviews.filter((r) => r.product !== id);
  d.users.forEach((u) => (u.wishlist = (u.wishlist ?? []).filter((w: string) => w !== id)));
  d.carts.forEach((c) => {
    c.cartItems = c.cartItems.filter((i: Doc) => i.product !== id);
    recalc(c);
  });
  persist();
  return ok(null, 204);
});

/* Reviews */
function refreshRating(productId: string) {
  const p = load().products.find((x) => x._id === productId);
  if (!p) return;
  const rs = load().reviews.filter((r) => r.product === productId);
  p.ratingsQuantity = rs.length;
  p.ratingsAverage = rs.length ? round2(rs.reduce((s, r) => s + r.ratings, 0) / rs.length) : 0;
}
function createReview(ctx: Ctx, productId: string) {
  const u = requireUser(ctx, ['user']);
  find(load().products, productId, 'product');
  const ratings = Number(ctx.body.ratings);
  if (!ratings) invalid('ratings', 'ratings value required');
  if (ratings < 1 || ratings > 5) invalid('ratings', 'Ratings value must be between 1 to 5');
  if (load().reviews.some((r) => r.user === u._id && r.product === productId)) invalid('product', 'You already created a review before');
  const t = now();
  const r: Doc = { _id: oid(), title: str(ctx.body.title)?.trim(), ratings, user: u._id, product: productId, createdAt: t, updatedAt: t };
  load().reviews.push(r);
  refreshRating(productId);
  persist();
  return ok({ data: outReview(r) }, 201);
}
on('GET', '/products/:id/reviews', (ctx, [id]) => list(load().reviews, { ...ctx.params, product: id }, outReview));
on('POST', '/products/:id/reviews', (ctx, [id]) => createReview(ctx, id));
on('GET', '/reviews', (ctx) => list(load().reviews, ctx.params, outReview));
on('GET', '/reviews/:id', (_ctx, [id]) => ok({ data: outReview(find(load().reviews, id, 'review')) }));
on('POST', '/reviews', (ctx) => createReview(ctx, String(ctx.body.product ?? '')));
on('PUT', '/reviews/:id', (ctx, [id]) => {
  const u = requireUser(ctx);
  const r = find(load().reviews, id, 'review');
  if (r.user !== u._id) fail(403, 'Your are not allowed to perform this action');
  if (ctx.body.title !== undefined) r.title = String(ctx.body.title).trim();
  if (ctx.body.ratings !== undefined) {
    const n = Number(ctx.body.ratings);
    if (n < 1 || n > 5) invalid('ratings', 'Ratings value must be between 1 to 5');
    r.ratings = n;
  }
  r.updatedAt = now();
  refreshRating(r.product);
  persist();
  return ok({ data: outReview(r) });
});
on('DELETE', '/reviews/:id', (ctx, [id]) => {
  const u = requireUser(ctx);
  const r = find(load().reviews, id, 'review');
  if (r.user !== u._id && !STAFF.includes(u.role)) fail(403, 'Your are not allowed to perform this action');
  load().reviews = load().reviews.filter((x) => x._id !== id);
  refreshRating(r.product);
  persist();
  return ok(null, 204);
});

/* Wishlist */
on('GET', '/wishlist', (ctx) => {
  const u = requireUser(ctx);
  const ps = (u.wishlist ?? []).map((id: string) => load().products.find((p) => p._id === id)).filter(Boolean) as Doc[];
  return ok({ status: 'success', results: ps.length, data: ps.map(outProduct) });
});
on('POST', '/wishlist', (ctx) => {
  const u = requireUser(ctx);
  const id = String(ctx.body.productId ?? '');
  find(load().products, id, 'product');
  u.wishlist = Array.from(new Set([...(u.wishlist ?? []), id]));
  persist();
  return ok({ status: 'success', data: [...u.wishlist] });
});
on('DELETE', '/wishlist/:id', (ctx, [id]) => {
  const u = requireUser(ctx);
  u.wishlist = (u.wishlist ?? []).filter((w: string) => w !== id);
  persist();
  return ok({ status: 'success', data: [...u.wishlist] });
});

/* Addresses */
on('GET', '/address', (ctx) => {
  const u = requireUser(ctx);
  return ok({ status: 'success', results: (u.addresses ?? []).length, data: clone(u.addresses ?? []) });
});
on('POST', '/address', (ctx) => {
  const u = requireUser(ctx);
  const b = ctx.body;
  if (!b.details || !b.phone || !b.city) invalid('details', 'Shipping address (details, phone, city) is required');
  u.addresses = [...(u.addresses ?? []), { _id: oid(), alias: str(b.alias), details: String(b.details), phone: String(b.phone), city: String(b.city), postalCode: str(b.postalCode) }];
  persist();
  return ok({ status: 'success', data: clone(u.addresses) });
});
on('DELETE', '/address/:id', (ctx, [id]) => {
  const u = requireUser(ctx);
  u.addresses = (u.addresses ?? []).filter((a: Doc) => a._id !== id);
  persist();
  return ok({ status: 'success', data: clone(u.addresses) });
});

/* Cart */
on('GET', '/cart', (ctx) => cartResponse(cartOf(requireUser(ctx)._id)));
on('POST', '/cart', (ctx) => {
  const u = requireUser(ctx);
  const p = find(load().products, String(ctx.body.productId ?? ''), 'product');
  const color = str(ctx.body.color);
  let cart = cartOf(u._id);
  if (!cart) {
    const t = now();
    cart = { _id: oid(), user: u._id, cartItems: [], totalCartPrice: 0, createdAt: t, updatedAt: t };
    load().carts.push(cart);
  }
  const item = cart.cartItems.find((i: Doc) => i.product === p._id && (i.color || undefined) === (color || undefined));
  const nextQty = (item?.quantity ?? 0) + 1;
  if (p.quantity < nextQty) fail(400, 'This product is out of stock');
  if (item) item.quantity = nextQty;
  else cart.cartItems.push({ _id: oid(), product: p._id, quantity: 1, ...(color ? { color } : {}), price: p.priceAfterDiscount ?? p.price });
  recalc(cart);
  persist();
  return cartResponse(cart);
});
on('PUT', '/cart/applyCoupon', (ctx) => {
  const u = requireUser(ctx);
  const name = String(ctx.body.coupon ?? '').trim().toUpperCase();
  const c = load().coupons.find((x) => x.name.toUpperCase() === name && Date.parse(x.expire) > Date.now());
  if (!c) fail(400, 'Coupon is invalid or expired');
  const cart = cartOf(u._id);
  if (!cart || !cart.cartItems.length) fail(400, 'Your cart is empty');
  cart!.coupon = c!.name;
  recalc(cart!);
  persist();
  return cartResponse(cart);
});
on('PUT', '/cart/:itemId', (ctx, [itemId]) => {
  const u = requireUser(ctx);
  const cart = cartOf(u._id);
  const item = cart?.cartItems.find((i: Doc) => i._id === itemId);
  if (!item) fail(404, `There is no item for this id: ${itemId}`);
  const qty = Number(ctx.body.quantity);
  if (!Number.isInteger(qty) || qty < 1) invalid('quantity', 'Quantity must be a whole number greater than 0');
  const p = load().products.find((x) => x._id === item!.product);
  if (p && p.quantity < qty) fail(400, 'This product is out of stock');
  item!.quantity = qty;
  recalc(cart!);
  persist();
  return cartResponse(cart);
});
on('DELETE', '/cart/:itemId', (ctx, [itemId]) => {
  const u = requireUser(ctx);
  const cart = cartOf(u._id);
  if (cart) {
    cart.cartItems = cart.cartItems.filter((i: Doc) => i._id !== itemId);
    recalc(cart);
    persist();
  }
  return cartResponse(cart);
});
on('DELETE', '/cart', (ctx) => {
  const u = requireUser(ctx);
  load().carts = load().carts.filter((c) => c.user !== u._id);
  persist();
  return ok(null, 204);
});

/* Orders */
on('POST', '/orders/checkout-session/:cartId', () => fail(400, 'Card payments are not configured'));
on('GET', '/orders', (ctx) => {
  const u = requireUser(ctx);
  const scope = STAFF.includes(u.role) ? load().orders : load().orders.filter((o) => o.user === u._id);
  return list(scope, ctx.params, outOrder);
});
on('GET', '/orders/:id', (ctx, [id]) => {
  const u = requireUser(ctx);
  const o = find(load().orders, id, 'order');
  if (!STAFF.includes(u.role) && o.user !== u._id) fail(404, `No order for this id ${id}`);
  return ok({ data: outOrder(o) });
});
on('POST', '/orders/:cartId', (ctx, [cartId]) => {
  const u = requireUser(ctx, ['user']);
  const cart = load().carts.find((c) => c._id === cartId && c.user === u._id);
  if (!cart || !cart.cartItems.length) fail(400, 'Your cart is empty');
  const addr = ctx.body.shippingAddress;
  if (!addr?.details || !addr?.phone || !addr?.city) invalid('shippingAddress', 'Shipping address (details, phone, city) is required');
  for (const it of cart!.cartItems) {
    const p = load().products.find((x) => x._id === it.product);
    if (!p || p.quantity < it.quantity) fail(400, 'Some items in your cart are no longer available in this quantity');
  }
  for (const it of cart!.cartItems) {
    const p = load().products.find((x) => x._id === it.product)!;
    p.quantity -= it.quantity;
    p.sold = (p.sold ?? 0) + it.quantity;
  }
  const t = now();
  const order: Doc = {
    _id: oid(),
    user: u._id,
    cartItems: clone(cart!.cartItems),
    shippingAddress: { details: addr.details, phone: addr.phone, city: addr.city, postalCode: addr.postalCode },
    taxPrice: 0,
    shippingPrice: 0,
    totalOrderPrice: Number(cart!.totalPriceAfterDiscount ?? cart!.totalCartPrice),
    paymentMethodType: 'cash',
    isPaid: false,
    paidAt: null,
    isDelivered: false,
    deliveredAt: null,
    createdAt: t,
    updatedAt: t
  };
  load().orders.push(order);
  load().carts = load().carts.filter((c) => c._id !== cartId);
  persist();
  return ok({ status: 'success', data: outOrder(order) }, 201);
});
on('PUT', '/orders/:id/pay', (ctx, [id]) => {
  requireStaff(ctx);
  const o = find(load().orders, id, 'order');
  o.isPaid = true;
  o.paidAt = o.updatedAt = now();
  persist();
  return ok({ status: 'success', data: outOrder(o) });
});
on('PUT', '/orders/:id/deliver', (ctx, [id]) => {
  requireStaff(ctx);
  const o = find(load().orders, id, 'order');
  o.isDelivered = true;
  o.deliveredAt = o.updatedAt = now();
  persist();
  return ok({ status: 'success', data: outOrder(o) });
});

/* Coupons */
function couponFields(d: Doc, b: Record<string, any>, creating: boolean) {
  if (creating || b.name !== undefined) {
    const name = str(b.name)?.trim().toUpperCase();
    if (!name) invalid('name', 'Coupon name required');
    if (load().coupons.some((c) => c.name === name && c._id !== d._id)) invalid('name', 'Coupon name must be unique');
    d.name = name;
  }
  if (creating || b.expire !== undefined) {
    if (!b.expire) invalid('expire', 'Coupon expire time required');
    if (Number.isNaN(Date.parse(b.expire))) invalid('expire', 'Invalid expire date');
    d.expire = new Date(b.expire).toISOString();
  }
  if (creating || b.discount !== undefined) {
    const n = Number(b.discount);
    if (!n) invalid('discount', 'Coupon discount value required');
    if (n < 1 || n > 100) invalid('discount', 'Discount must be between 1 and 100');
    d.discount = n;
  }
}
on('GET', '/coupon', (ctx) => (requireStaff(ctx), list(load().coupons, ctx.params)));
on('GET', '/coupon/:id', (ctx, [id]) => (requireStaff(ctx), ok({ data: clone(find(load().coupons, id, 'coupon')) })));
on('POST', '/coupon', (ctx) => {
  requireStaff(ctx);
  const t = now();
  const d: Doc = { _id: oid(), createdAt: t, updatedAt: t };
  couponFields(d, ctx.body, true);
  load().coupons.push(d);
  persist();
  return ok({ data: clone(d) }, 201);
});
on('PUT', '/coupon/:id', (ctx, [id]) => {
  requireStaff(ctx);
  const d = find(load().coupons, id, 'coupon');
  couponFields(d, ctx.body, false);
  d.updatedAt = now();
  persist();
  return ok({ data: clone(d) });
});
on('DELETE', '/coupon/:id', (ctx, [id]) => {
  requireAdmin(ctx);
  load().coupons = load().coupons.filter((c) => c._id !== id);
  persist();
  return ok(null, 204);
});

/* Branches */
on('GET', '/branches', (ctx) => {
  const all = ctx.params.all === 'true' && ctx.user && STAFF.includes(ctx.user.role);
  const scope = all ? load().branches : load().branches.filter((b) => b.active !== false);
  return list(scope, ctx.params);
});
on('GET', '/branches/:id', (_ctx, [id]) => ok({ data: clone(find(load().branches, id, 'branch')) }));
on('POST', '/branches', (ctx) => {
  requireStaff(ctx);
  const b = ctx.body;
  if (!str(b.name)?.trim()) invalid('name', 'Branch name required');
  if (!str(b.city)?.trim()) invalid('city', 'City required');
  const t = now();
  const d: Doc = { _id: oid(), active: true, isMain: false, ...clone(b), createdAt: t, updatedAt: t };
  if (d.isMain) load().branches.forEach((x) => (x.isMain = false));
  load().branches.push(d);
  persist();
  return ok({ data: clone(d) }, 201);
});
on('PUT', '/branches/:id', (ctx, [id]) => {
  requireStaff(ctx);
  const d = find(load().branches, id, 'branch');
  if (ctx.body.isMain) load().branches.forEach((x) => (x.isMain = false));
  Object.assign(d, clone(ctx.body), { updatedAt: now() });
  persist();
  return ok({ data: clone(d) });
});
on('DELETE', '/branches/:id', (ctx, [id]) => {
  requireAdmin(ctx);
  load().branches = load().branches.filter((b) => b._id !== id);
  persist();
  return ok(null, 204);
});

/* ----------------------------- Request entry ----------------------------- */
const MAX_IMAGE = 900;

/** Downscales uploaded images so they fit comfortably in localStorage. */
async function fileToDataUrl(file: File): Promise<string> {
  if (file.type.startsWith('image/') && file.type !== 'image/svg+xml' && typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(file);
      const scale = Math.min(1, MAX_IMAGE / Math.max(bmp.width, bmp.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bmp.width * scale);
      canvas.height = Math.round(bmp.height * scale);
      const g = canvas.getContext('2d')!;
      g.fillStyle = '#fff';
      g.fillRect(0, 0, canvas.width, canvas.height);
      g.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.82);
    } catch {
      /* fall back to the raw file */
    }
  }
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

async function readBody(body: unknown): Promise<{ body: Record<string, any>; files: Record<string, string[]> }> {
  const files: Record<string, string[]> = {};
  if (!(body instanceof FormData)) return { body: (body as Record<string, any>) ?? {}, files };
  const out: Record<string, any> = {};
  for (const [key, value] of body.entries()) {
    if (value instanceof File) {
      (files[key] ??= []).push(await fileToDataUrl(value));
    } else if (key in out) {
      out[key] = Array.isArray(out[key]) ? [...out[key], value] : [out[key], value];
    } else out[key] = value;
  }
  return { body: out, files };
}

function userFromToken(token: string | null): Doc | null {
  const id = token?.match(/^local\.([0-9a-f]{24})\./)?.[1];
  if (!id) return null;
  const u = load().users.find((x) => x._id === id);
  return u && u.active !== false ? u : null;
}

function normaliseParams(params?: Record<string, unknown>): Params {
  const out: Params = {};
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v === undefined || v === null || v === '') continue;
    out[k] = Array.isArray(v) ? v.filter((x) => x !== undefined && x !== null && x !== '').map(String) : String(v);
  }
  return out;
}

/** Handles one API call locally. Never touches the network. */
export async function mockRequest(method: string, path: string, opts: { params?: Record<string, unknown>; body?: unknown; token: string | null }): Promise<MockResponse> {
  await new Promise((r) => setTimeout(r, 120)); // keep loading states visible
  const cleanPath = path.split('?')[0].replace(/\/+$/, '') || '/';
  const route = routes.find(([m, re]) => m === method && re.test(cleanPath));
  if (!route) return { status: 404, payload: { message: `Can't find this route: ${cleanPath}` } };
  try {
    const { body, files } = await readBody(opts.body);
    const ctx: Ctx = { method, path: cleanPath, seg: cleanPath.split('/').filter(Boolean), params: normaliseParams(opts.params), body, files, user: null };
    if (opts.token) {
      ctx.user = userFromToken(opts.token);
      if (!ctx.user) return { status: 401, payload: { message: 'Invalid token, please login again..' } };
    }
    const m = cleanPath.match(route[1])!.slice(1).map(decodeURIComponent);
    return await route[2](ctx, m);
  } catch (e) {
    if (e instanceof HttpError) {
      return { status: e.status, payload: e.errors ? { errors: e.errors } : { status: e.status >= 500 ? 'error' : 'fail', message: e.message } };
    }
    console.error('[local api]', e);
    return { status: 500, payload: { message: e instanceof Error ? e.message : 'Unexpected error' } };
  }
}

/* ------------------------------ ERP bridge ------------------------------- */
/**
 * Direct access for the in-browser ERP (src/erp): it shares products,
 * branches and users with the website. Call persistMockDb() after mutating.
 */
export function getMockDb() {
  return load() as unknown as {
    products: Doc[];
    branches: Doc[];
    users: Doc[];
    categories: Doc[];
    brands: Doc[];
  };
}
export function persistMockDb() {
  persist();
}
