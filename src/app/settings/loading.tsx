import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 md:py-12">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-80 w-full max-w-xl" />
    </main>
  )
}
