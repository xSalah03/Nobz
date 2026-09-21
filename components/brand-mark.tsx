import Link from "next/link";

export function BrandMark() {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="Nobz home">
      <span className="grid size-9 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-lg font-black text-primary transition-transform group-hover:-rotate-6">N</span>
      <span className="text-xl font-black tracking-[-.04em]">NOBZ</span>
    </Link>
  );
}
