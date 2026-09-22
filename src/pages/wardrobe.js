import Head from "next/head";
import Image from "next/image";
import { Fragment, useEffect, useMemo, useState } from "react";
import { getOccasions, getWardrobe } from "../../sanity/queries/wardrobe";
import { urlForImage } from "../../sanity/lib/image";

// Body position, top to bottom. This ordering is what makes the page read as a
// wardrobe rather than a shop. Categories not listed here fall to the end, so
// adding one in Sanity does not require a code change to show up.
const CATEGORY_ORDER = [
  { value: "tops", title: "Tops" },
  { value: "sweatshirts", title: "Sweatshirts" },
  { value: "jerseys", title: "Jerseys" },
  { value: "activewear", title: "Activewear" },
  { value: "bottoms", title: "Bottoms" },
  { value: "outerwear", title: "Outerwear" },
  { value: "footwear", title: "Footwear" },
  { value: "accessories", title: "Accessories" },
];

const SEASONS = [
  { value: "warm", title: "Warm weather" },
  { value: "cold", title: "Cold weather" },
];

export async function getStaticProps() {
  const [items, occasions] = await Promise.all([getWardrobe(), getOccasions()]);

  const itemsWithUrls = items.map((item) => ({
    ...item,
    imageUrl: urlForImage(item.image).width(700).url(),
  }));

  return {
    props: { items: itemsWithUrls, occasions },
    // Lets new pieces appear without a redeploy, so the Studio is the only
    // place you need to touch to add a garment.
    revalidate: 60,
  };
}

function groupByCategory(items) {
  const known = CATEGORY_ORDER.map((c) => c.value);
  const extras = [
    ...new Set(
      items.map((i) => i.category).filter((c) => c && !known.includes(c))
    ),
  ].map((value) => ({ value, title: value }));

  return [...CATEGORY_ORDER, ...extras]
    .map((category) => ({
      ...category,
      items: items.filter((item) => item.category === category.value),
    }))
    .filter((category) => category.items.length > 0);
}

function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-300 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900"
      }`}
    >
      {children}
    </button>
  );
}

function Piece({ item, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="group flex flex-col text-left"
    >
      <div className="relative aspect-square">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={[item.brand, item.name].filter(Boolean).join(" ")}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
            className="object-contain transition-transform duration-300 ease-out group-hover:-translate-y-1"
          />
        ) : null}
      </div>
      <div className="mt-3 text-xs font-medium text-neutral-900">
        {item.brand}
      </div>
      <div className="text-xs text-neutral-500">{item.name}</div>
    </button>
  );
}

// Studio deep link, so fixing a typo is one click from the piece itself. The
// Studio is behind Sanity's own login, so this is safe to show to everyone.
const studioUrl = (item) => `/studio/structure/wardrobeItem;${item.id}`;

function Detail({ item, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const retailer = item.source?.retailer || item.brand;
  const soldOut = item.source?.status === "sold-out";
  const facts = [
    ["Category", item.category],
    ["Colour", item.colorway],
    ["Season", item.season?.replace("-", " ")],
    ["Wear it", (item.occasions || []).map((o) => o?.name).filter(Boolean).join(", ")],
  ].filter(([, value]) => value);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-900/30 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl sm:flex sm:gap-8 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-square w-full sm:w-72 sm:shrink-0">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={[item.brand, item.name].filter(Boolean).join(" ")}
              fill
              sizes="(max-width: 640px) 90vw, 288px"
              className="object-contain"
            />
          ) : null}
        </div>
        <div className="mt-6 flex flex-1 flex-col sm:mt-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-neutral-900">{item.brand}</div>
              <div className="text-sm text-neutral-500">{item.name}</div>
            </div>
            <a
              href={studioUrl(item)}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-neutral-300 px-2.5 py-0.5 text-[11px] text-neutral-500 transition-colors hover:border-neutral-900 hover:text-neutral-900"
            >
              Edit
            </a>
          </div>
          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-xs">
            {facts.map(([label, value]) => (
              <Fragment key={label}>
                <dt className="uppercase tracking-[0.14em] text-neutral-400">{label}</dt>
                <dd className="capitalize text-neutral-700">{value}</dd>
              </Fragment>
            ))}
          </dl>
          <div className="mt-auto pt-8 text-xs">
            {item.source?.url ? (
              <a
                href={item.source.url}
                target="_blank"
                rel="noreferrer"
                className="text-neutral-500 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900"
              >
                {soldOut ? `${retailer} — sold out` : `Buy from ${retailer}`} ↗
              </a>
            ) : (
              <span className="text-neutral-400">
                {soldOut ? `${retailer} — sold out` : retailer}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WardrobePage({ items, occasions }) {
  const [activeOccasion, setActiveOccasion] = useState(null);
  const [activeSeason, setActiveSeason] = useState(null);
  const [open, setOpen] = useState(null);

  const filtered = useMemo(() => {
    return items.filter(
      (item) =>
        (!activeOccasion ||
          (item.occasions || []).some((o) => o?.slug === activeOccasion)) &&
        // Year-round pieces belong to every season.
        (!activeSeason ||
          item.season === activeSeason ||
          item.season === "year-round")
    );
  }, [items, activeOccasion, activeSeason]);

  const grouped = useMemo(() => groupByCategory(filtered), [filtered]);

  return (
    <>
      <Head>
        <title>Wardrobe — Nikhil Goel</title>
        <meta name="description" content="Everything I actually wear." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/ndimelogo.png" />
      </Head>

      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-medium tracking-tight">Wardrobe</h1>
          <p className="text-sm text-neutral-500">
            Everything I actually wear, and where it came from.
          </p>
        </header>

        {items.length > 0 ? (
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {occasions.length > 0 ? (
              <>
                <Chip
                  active={activeOccasion === null}
                  onClick={() => setActiveOccasion(null)}
                >
                  Everything
                </Chip>
                {occasions.map((occasion) => (
                  <Chip
                    key={occasion.slug}
                    active={activeOccasion === occasion.slug}
                    onClick={() => setActiveOccasion(occasion.slug)}
                  >
                    {occasion.name}
                  </Chip>
                ))}
              </>
            ) : null}
            {SEASONS.map((season) => (
              <Chip
                key={season.value}
                active={activeSeason === season.value}
                onClick={() =>
                  setActiveSeason(activeSeason === season.value ? null : season.value)
                }
              >
                {season.title}
              </Chip>
            ))}
            {/* Only meaningful once there is something to count. */}
            {filtered.length > 0 ? (
              <span className="ml-auto text-xs text-neutral-400">
                {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
              </span>
            ) : null}
          </div>
        ) : null}

        {grouped.length === 0 ? (
          <p className="mt-16 text-sm text-neutral-400">
            {items.length === 0
              ? "Still photographing. Check back."
              : "Nothing matches that yet."}
          </p>
        ) : (
          <div className="mt-12 flex flex-col gap-16">
            {grouped.map((category) => (
              <section key={category.value}>
                <h2 className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                  {category.title}
                </h2>
                <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
                  {category.items.map((item) => (
                    <Piece key={item.id} item={item} onOpen={setOpen} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {open ? <Detail item={open} onClose={() => setOpen(null)} /> : null}
    </>
  );
}

// Standalone page: no site header, footer or shared background, so the wardrobe
// reads as its own thing rather than another section of the site.
WardrobePage.getLayout = (page) => (
  <div className="min-h-screen bg-white font-whitney text-neutral-900">
    {page}
  </div>
);
