# Reasons to Still Use Next.js from a TanStack Start Enjoyer

## Why You Might Still Pick Next.js Over TanStack Start

*From a TanStack Start fanboy*

TanStack Start is exciting. File-based routing, type-safe search params, and a stack that feels modern and, most importantly, lets you keep your SPA goodies and cool libraries like TanStack Query to maximize UX for your users and DX for yourself. We all know how heavy-handed mutations can be in Next.js, but with TanStack it all feels like a breeze. Lately, with server components quietly encroaching on Next.js territory, and a rising number of job postings asking for TanStack skills, the ecosystem is clearly growing.

That said, Next.js still wins in a few places that matter in production. This isn't a dunk on TanStack. It's a short list of reasons you might still choose Next.js, especially for mostly-static content sites.

---

## 1. Caching, Prebuild, and ISR

Next.js gives you a more mature toolkit for tuning how pages are cached, prebuilt, and regenerated. Incremental Static Regeneration (ISR) and revalidation APIs are battle-tested. TanStack Start can get you far, but Next's knobs for static generation, incremental revalidation, and cache control are still a stronger story when SEO and freshness matter.

```typescript
// Next.js -- page-level ISR
export const revalidate = 3600 // regenerate at most once per hour

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug)
  return <Article post={post} />
}
```

In TanStack Start, you'd approximate this with a build-time static generation plugin or a custom revalidation hook. Both workable, but less declarative and harder to reason about at scale. Next's `revalidatePath` and `revalidateTag` also give you fine-grained control over cache invalidation during mutations, which is still a manual affair in TanStack.

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
function ProductsPage() {
  const { page, q } = Route.useSearch()
  // Changing `page` / `q` re-suspends -> boundary flicker
  const { data } = useSuspenseQuery(productsQueryOptions({ page, q }))
  return <ProductList products={data} />
}

// Next-ish dampening with transitions
function goToPage(page: number) {
  startTransition(() => {
    router.push(`?page=${page}`)
  })
}

// Workaround A: non-suspense query (show isFetching, keep old data)
const { data, isFetching } = useQuery(productsQueryOptions({ page, q }))

// Workaround B: structure -- controls outside the suspending child
function ProductsPage() {
  const search = Route.useSearch()
  return (
    <>
      <Filters /> {/* never suspends */}
      <Suspense fallback={<ListSkeleton />}>
        <ProductResults search={search} />
      </Suspense>
    </>
  )
}
```

---

## 3. Image and Font Optimization

For mostly-static sites chasing Lighthouse / Core Web Vitals, Next's `next/image` and `next/font` are still a real advantage. TanStack is working on this space, but today the built-in story isn't as strong. If those scores are a hard requirement, Next is the safer bet.

```tsx
import Image from 'next/image'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

<Image src={hero} alt="" width={1200} height={630} priority sizes="100vw" />
```

`next/image` handles responsive sizes, lazy loading, and WebP/AVIF conversion out of the box. `next/font` subsets and self-hosts fonts to reduce CLS. In TanStack Start, you'd reach for Vite plugins like `vite-imagetools` or manual preload links. Both work, but require more configuration and ongoing maintenance.

---

## Closing

Most of these gaps will likely shrink as TanStack Start matures. Until then: if your app is interactive and type-safe routing is the priority, Start is a joy. If you're shipping mostly static content and care about ISR tuning, Suspense-friendly navigation, and image/font SEO wins, Next.js still has a clear edge. Even from a Start fan.
