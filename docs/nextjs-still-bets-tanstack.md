# Reasons to Still Use Next.js from a TanStack Start Enjoyer

## Why You Might Still Pick Next.js Over TanStack Start

*From a TanStack Start fanboy*

TanStack Start is exciting. File-based routing, type-safe search params, and a stack that feels modern and, most importantly, lets you keep your SPA goodies and cool libraries like TanStack Query to maximize UX for your users and DX for yourself. We all know how heavy-handed mutations can be in Next.js, but with TanStack it all feels like a breeze. Lately, with server components quietly encroaching on Next.js territory, and a rising number of job postings asking for TanStack skills, the ecosystem is clearly growing.

That said, Next.js still wins in a few places that matter in production. This isn't a dunk on TanStack. It's a short list of reasons you might still choose Next.js, especially for mostly-static content sites.

---

## 1. Static Server State, Prebuild, and ISR

To be clear: this is not about TanStack Query client caching. This is about **static server state**: how Server Components and page output get stored, served, and regenerated on the server (Next's Full Route Cache / Data Cache style setup). Off Vercel that usually means wiring a KV (or similar) so the framework can actually persist that page-level server state. On Vercel, a lot of that plumbing is already there.

Next.js makes this *easy*. You declare revalidation once and the framework owns the rest:

```typescript
// Next.js -- page-level ISR / static server state
export const revalidate = 3600 // regenerate at most once per hour

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  return <Article post={post} />
}
```

TanStack Start does have prebuild capabilities, but you still end up manually setting cache headers (or whatever your platform expects) to get proper edge/CDN behavior. Cloudflare made this friendlier with Workers Cache and solid stale-while-revalidate support (so the pieces exist), but Next's declarative `revalidate`, `revalidatePath`, and `revalidateTag` story is cleaner when SEO and freshness matter at scale. Less platform glue, more "set a number and ship."

---

## 2. Suspense-Aware Routing (and the Query-Param Flicker)

Next's data fetching and router integrate more cleanly with Suspense. TanStack Router leans on an external store for a lot of its state. That store doesn't register with Suspense the way you'd hope.

A common pain point: a list driven by search params (filters, page, sort). Change a param, TanStack tracks it, your `useSuspenseQuery` re-suspends, the Suspense boundary flickers.

In Next.js you'd often wrap the navigation in `useTransition` so React keeps showing the old UI until the new data is ready. In TanStack Router / Start there's no great equivalent.

**Workarounds (neither ideal):**

1. Swap `useSuspenseQuery` for `useQuery` so you don't hit a Suspense boundary on every param change.
2. If you're on a fully suspenseful library (e.g., Relay), you're mostly stuck. Compose so controls (search, pagination) live *outside* the suspending region and only the data pane suspends. You still get flicker where `startTransition` would have held previous data.

```tsx
// Pain pattern (TanStack Router + Suspense Query)
// useSuspenseQuery in the page = the whole page (filters included) suspends
function ProductsPage() {
  const { page, q } = Route.useSearch()
  // Changing `page` / `q` re-suspends -> boundary flicker
  const { data } = useSuspenseQuery(productsQueryOptions({ page, q }))
  return (
    <>
      <Filters />
      <ProductList products={data} />
    </>
  )
}

// Next-ish dampening with transitions
function goToPage(page: number) {
  startTransition(() => {
    router.push(`?page=${page}`)
  })
}

// Workaround A: non-suspense query (show isFetching, keep old data)
const { data, isFetching } = useQuery(productsQueryOptions({ page, q }))

// Workaround B: push the suspend into a child so Filters stay mounted
function ProductsPage() {
  const search = Route.useSearch()
  return (
    <>
      <Filters /> {/* stays up; never suspends */}
      <Suspense fallback={<ListSkeleton />}>
        <ProductResults search={search} />
      </Suspense>
    </>
  )
}

function ProductResults({ search }: { search: { page: number; q: string } }) {
  // Must live here, not in ProductsPage, or Filters suspend too
  const { data } = useSuspenseQuery(productsQueryOptions(search))
  return <ProductList products={data} />
}
```

---

## 3. Image and Font Optimization

For mostly-static sites chasing Lighthouse / Core Web Vitals, Next's `next/image` and `next/font` are still a real advantage. TanStack is working on this space, but today the built-in story isn't as strong. If those scores are a hard requirement, Next is the safer bet.

```tsx
import Image from 'next/image'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export default function Hero() {
  return (
    <div className={inter.className}>
      <Image src={hero} alt="" width={1200} height={630} priority sizes="100vw" />
    </div>
  )
}
```

`next/image` handles responsive sizes, lazy loading, and WebP/AVIF conversion out of the box. `next/font` subsets and self-hosts fonts to reduce CLS. In TanStack Start, you'd reach for Vite plugins like `vite-imagetools` or manual preload links. Both work, but require more configuration and ongoing maintenance.

---

## 4. React Canary Features (View Transitions) Built In

Another Next.js W: App Router ships on React canary, so features like the `<ViewTransition>` component are available without bolting on a separate experimental React install. Navigations already run inside React's `startTransition`, so the React-aware View Transition path can participate in the render lifecycle.

TanStack Start does support view transitions, but I've hit flashes of white before the animation starts. Part of that is the transition firing *outside* React's `startTransition` / Suspense coordination: blank paint, then the morph. It's also because the current TanStack implementation is the **standard web** View Transitions API: no React integration. Next gives you React's canary `<ViewTransition>` component, which actually participates in React's render lifecycle. Same feature name, very different depth of integration, and the React-aware path feels smoother out of the box.

```tsx
import { ViewTransition } from 'react'

export default function GalleryItem({ slug, src }: { slug: string; src: string }) {
  return (
    <ViewTransition name={`photo-${slug}`}>
      <img src={src} alt="" />
    </ViewTransition>
  )
}
```

(Older Next docs mentioned an `experimental.viewTransition` flag; recent Next releases treat that as inert / removed because the canary React channel already exposes `ViewTransition`, and App Router navigations already run in `startTransition`.)

When you care about polished navigations without chasing timing bugs, "use the React integration the framework already bundled" beats "wire the View Transition API yourself and hope it lands inside React's transition."

---

## 5. Ecosystem Fit: Payload CMS (Personal, But Real)

This one's more personal (it might not move the needle for everyone), but it matters a lot if you live in that stack.

Payload CMS is a strong pick when you're already on Next.js. It ties into the App Router cleanly, gives you a highly customizable backend without building half of it yourself, and leans on Server Components to get a lot done. That's a plus TanStack Start simply doesn't have today.

**Big caveat:** the Payload team has said they're working on TanStack support. After Start gained Server Components, they've been taking it more seriously. They've talked about a TanStack integration landing before the next major Payload release. Until that ships, if you want Payload in your React app *today*, Next.js is the option.

---

## Closing: When I'd Still Bite the Complexity and Pick TanStack Start

Most of these gaps will shrink as Start matures (including a real Payload integration). For static, crawlable content where ISR, Suspense-friendly nav, image/font SEO, canary React features, or Next-native CMS matter, Next still has the edge.

But I'm a Start fanboy for a reason. Classic fit: a light landing page attached to a **heavy, auth-gated dashboard**. No bot crawls it. First paint of 80ms vs 800ms barely matters when the user is about to wrestle charts and filters. Paying Next's full server-render + static-server-state tax for that UI is wasted compute and DX.

What you gain instead:

- **Full `useQuery` power**: fine-grained fetches, optimistic updates, cache as source of truth, without the App Router's mutation → revalidate → stream-diff loop.
- **Typed search params** in the router. Share a URL; coworkers land on the same filters. In Next you'd bolt on `nuqs`; in TanStack Router it's first-class.
- **Rendering escape hatches**: data-only (hydrate from server-fetched data) or SSR off. Dump heavy charting into the browser instead of keeping server compute warm for dashboards no bot will score.

Doing that shape in Next is hard. Wiring Query into the App Router fights you toward server actions that invalidate and re-render the whole page. For a per-user, constantly moving dashboard, that's a quiet inefficiency: throw the page away, re-render on the server, ship a diff, for data the next person won't even share. Why run dynamic server caching if nothing is shared?

Adam Rackis breaks down how TanStack's RSC model differs: explicit, opt-in, not your primary data path ([React Server Components in TanStack](https://master.dev/blog/react-server-components-in-tanstack/)). Loaders + Query own data; RSCs keep expensive non-interactive trees off the client. In Next, RSC is the center of gravity. That gap is why auth-gated dashboards feel native in Start and upstream in Next.

So: static / SEO / CMS → Next. Thin public shell + thick private dashboard → Start, any day. Even after listing all those rough edges.
