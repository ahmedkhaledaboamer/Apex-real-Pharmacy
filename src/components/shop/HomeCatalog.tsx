import type { ReactNode } from 'react';
import { ArrowRight, ShieldCheck, Truck, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocale, useTranslations } from '../../lib/i18n';
import { nameOf } from '../../lib/localize';
import { useBrands, useCategories } from '../../hooks/useCatalog';
import { Skeleton } from '../ui/Spinner';
import { ButtonLink } from '../ui/Button';
import { SectionTitle } from './PageHero';
import type { Brand, Category } from '../../api/types';

/** Mixes a hex colour with white (t=0 → colour, t=1 → white) or black (t<0). */
function mix(hex: string, t: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(t >= 0 ? v + (255 - v) * t : v * (1 + t)));
  return `rgb(${c.join(',')})`;
}

export function CategoryTile({ category, tabIndex }: { category: Category; tabIndex?: number }) {
  const locale = useLocale();
  const t = useTranslations('Catalog');
  const color = category.color || '#7A1FB8';
  return (
    <Link
      to={`/categories/${category._id}`}
      tabIndex={tabIndex}
      className="group relative flex flex-col h-full rounded-[1.75rem] bg-white p-2.5 ring-1 ring-brand-dark/[0.06] shadow-[0_1px_3px_rgba(11,31,92,0.06)] hover:shadow-[0_28px_50px_-24px_rgba(11,31,92,0.38)] hover:-translate-y-1.5 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
      <div
        className="relative aspect-[9/7] rounded-[1.35rem] overflow-hidden isolate"
        style={{ background: `radial-gradient(120% 95% at 50% 100%, ${mix(color, 0.72)} 0%, ${mix(color, 0.9)} 50%, ${mix(color, 0.96)} 100%)` }}>
        <div className="absolute -top-12 -end-12 w-36 h-36 rounded-full blur-2xl opacity-30 -z-10" style={{ background: color }} />
        {category.image && (
          <img
            src={category.image}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-contain px-3 pt-6 pb-1 drop-shadow-[0_10px_14px_rgba(11,31,92,0.12)] group-hover:scale-[1.07] transition-transform duration-500 ease-out"
          />
        )}
        {category.productsCount !== undefined && (
          <span className="absolute top-3 start-3 rounded-full bg-white/85 backdrop-blur px-2.5 py-1 text-[11px] font-semibold text-brand-dark shadow-sm">
            {t(category.productsCount === 1 ? 'productsCountOne' : 'productsCount', { count: category.productsCount })}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 px-2.5 pt-3.5 pb-1.5">
        <div className="min-w-0">
          <h3 className="font-semibold text-brand-dark text-[15px] sm:text-base leading-snug truncate">{nameOf(category, locale)}</h3>
          <p className="text-xs font-semibold mt-0.5" style={{ color: mix(color, -0.15) }}>
            {t('shopNow')}
          </p>
        </div>
        <span
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
          style={{ background: `linear-gradient(135deg, ${color}, ${mix(color, -0.25)})` }}>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </span>
      </div>
    </Link>
  );
}

export function BrandTile({ brand, tabIndex }: { brand: Brand; tabIndex?: number }) {
  const locale = useLocale();
  const t = useTranslations('Catalog');
  return (
    <Link
      to={`/products?brand=${brand._id}`}
      tabIndex={tabIndex}
      title={nameOf(brand, locale)}
      className="group relative flex flex-col h-full rounded-[1.5rem] bg-white ring-1 ring-brand-dark/[0.06] shadow-[0_1px_3px_rgba(11,31,92,0.06)] hover:shadow-[0_24px_44px_-22px_rgba(11,31,92,0.35)] hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
      <div className="relative flex-1 flex items-center justify-center h-28 px-6 pt-4">
        <div className="absolute inset-x-6 top-4 bottom-0 rounded-2xl bg-gradient-to-b from-brand-cream/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {brand.image ? (
          <img
            src={brand.image}
            alt={nameOf(brand, locale)}
            loading="lazy"
            className="relative max-h-14 max-w-[80%] w-auto object-contain transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <span className="relative text-2xl font-extrabold tracking-tight bg-gradient-to-r from-brand-gold to-brand-goldLight bg-clip-text text-transparent">
            {nameOf(brand, locale)}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 mx-4 mb-3 mt-2 pt-3 border-t border-brand-dark/[0.06]">
        <span className="text-xs font-semibold text-brand-dark/60 truncate">
          {brand.productsCount !== undefined ? t(brand.productsCount === 1 ? 'productsCountOne' : 'productsCount', { count: brand.productsCount }) : nameOf(brand, locale)}
        </span>
        <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-brand-cream text-brand-dark group-hover:bg-gradient-to-br group-hover:from-brand-gold group-hover:to-brand-goldLight group-hover:text-white transition-colors">
          <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
        </span>
      </div>
    </Link>
  );
}

export function ShopByCategory() {
  const t = useTranslations('Home');
  const tCommon = useTranslations('Common');
  const { data, isLoading, isError } = useCategories();
  if (isError || (!isLoading && !data?.length)) return null;
  return (
    <section className="py-20 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <SectionTitle
          eyebrow={t('catEyebrow')}
          title={t('catTitle')}
          description={t('catDesc')}
          action={
            <ButtonLink to="/categories" variant="secondary">
              {tCommon('viewAll')}
            </ButtonLink>
          }
        />
      </div>
      {isLoading ? (
        <div className="container mx-auto px-4 sm:px-6 md:px-12 flex gap-5 overflow-hidden">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-72 w-56 sm:w-64 shrink-0 rounded-[1.75rem]" />
          ))}
        </div>
      ) : (
        <Marquee
          items={data!}
          itemKey={(c) => c._id}
          itemClassName="w-56 sm:w-64"
          secondsPerItem={4.5}
          reverse
          renderItem={(c, duplicate) => <CategoryTile category={c} tabIndex={duplicate ? -1 : undefined} />}
        />
      )}
    </section>
  );
}

/**
 * One-row, endlessly scrolling strip. The list is rendered twice and the track
 * moves by half its width, so the loop is seamless. Pauses on hover/focus and
 * stays still for users who prefer reduced motion.
 */
function Marquee<T>({
  items,
  itemKey,
  renderItem,
  itemClassName,
  minItems = 8,
  secondsPerItem = 3.5,
  reverse = false
}: {
  items: T[];
  itemKey: (item: T) => string;
  renderItem: (item: T, duplicate: boolean) => ReactNode;
  itemClassName: string;
  minItems?: number;
  secondsPerItem?: number;
  reverse?: boolean;
}) {
  // repeat short lists so one copy is always wider than the screen
  const base = items.length >= minItems ? items : Array.from({ length: Math.ceil(minItems / Math.max(items.length, 1)) }, () => items).flat();
  const duration = `${Math.max(base.length * secondsPerItem, 20)}s`;
  return (
    <div className={`rc-marquee relative overflow-hidden py-2 ${reverse ? 'rc-marquee--reverse' : ''}`} style={{ ['--rc-marquee-duration' as string]: duration }}>
      <div className="rc-marquee-track flex w-max py-3">
        {[0, 1].map((copy) =>
          base.map((item, i) => (
            <div key={`${copy}-${itemKey(item)}-${i}`} className={`shrink-0 pe-5 ${itemClassName}`} aria-hidden={copy === 1 || undefined}>
              {renderItem(item, copy === 1)}
            </div>
          ))
        )}
      </div>
      <div className="pointer-events-none absolute inset-y-0 start-0 w-16 sm:w-32 bg-gradient-to-r rtl:bg-gradient-to-l from-brand-cream to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 end-0 w-16 sm:w-32 bg-gradient-to-l rtl:bg-gradient-to-r from-brand-cream to-transparent" />
    </div>
  );
}

export function BrandsStrip() {
  const t = useTranslations('Home');
  const tCommon = useTranslations('Common');
  const { data, isLoading, isError } = useBrands();
  if (isError || (!isLoading && !data?.length)) return null;
  return (
    <section className="py-20 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <SectionTitle
          eyebrow={t('brandsEyebrow')}
          title={t('brandsTitle')}
          action={
            <ButtonLink to="/brands" variant="secondary">
              {tCommon('viewAll')}
            </ButtonLink>
          }
        />
      </div>
      {isLoading ? (
        <div className="container mx-auto px-4 sm:px-6 md:px-12 flex gap-5 overflow-hidden">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-40 w-52 sm:w-56 shrink-0 rounded-[1.5rem]" />
          ))}
        </div>
      ) : (
        <Marquee
          items={data!}
          itemKey={(b) => b._id}
          itemClassName="w-52 sm:w-56"
          renderItem={(b, duplicate) => <BrandTile brand={b} tabIndex={duplicate ? -1 : undefined} />}
        />
      )}
    </section>
  );
}

export function ShopPromo() {
  const t = useTranslations('Home');
  return (
    <section className="py-10 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <div className="rounded-[2rem] bg-brand-dark text-white p-8 md:p-12 grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center overflow-hidden relative">
          <div className="absolute -top-20 -end-20 w-72 h-72 bg-brand-gold/30 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">{t('promoTitle')}</h2>
            <p className="text-white/70 text-lg mb-6">{t('promoDesc')}</p>
            <ButtonLink to="/products" size="lg">
              {t('promoCta')}
              <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </ButtonLink>
          </div>
          <div className="relative grid grid-cols-3 gap-3 text-center">
            {[Truck, Wallet, ShieldCheck].map((Icon, i) => (
              <div key={i} className="rounded-2xl bg-white/10 p-4 flex items-center justify-center aspect-square">
                <Icon className="w-9 h-9 text-brand-pinkDark" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
