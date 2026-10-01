import { PageLoader } from '@/components/loading/PageLoader'

export default function pagePage() {
  return (
    <section className="w-full h-full min-h-screen  flex flex-col items-center justify-center">
      <PageLoader label="Loading…" />
    </section>
  )
}
