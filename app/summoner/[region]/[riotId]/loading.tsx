import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <main className="mx-auto min-h-screen max-w-7xl px-5 py-10 md:px-8"><Skeleton className="h-14 w-36 rounded-xl" /><div className="mt-16 flex gap-6"><Skeleton className="size-24 rounded-3xl" /><div className="space-y-3"><Skeleton className="h-10 w-72" /><Skeleton className="h-5 w-48" /></div></div><div className="mt-12 grid gap-6 lg:grid-cols-[320px_1fr]"><div className="space-y-4"><Skeleton className="h-48 rounded-2xl" /><Skeleton className="h-48 rounded-2xl" /></div><div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div></div></main>;
}
