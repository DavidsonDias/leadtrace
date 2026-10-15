import { cn } from "@/lib/utils";

/** LeadTrace symbol: stylised “L” whose foot rises into a tracking arrow. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-8", className)} aria-hidden="true">
      <defs>
        <linearGradient id="lt-g" x1="0" y1="40" x2="40" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--electric)" />
          <stop offset="0.6" stopColor="var(--teal)" />
          <stop offset="1" stopColor="var(--mint)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="var(--card)" stroke="var(--border)" />
      <path d="M12 9v20h8" fill="none" stroke="url(#lt-g)" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 29l9-10" fill="none" stroke="url(#lt-g)" strokeWidth="4.2" strokeLinecap="round" />
      <path d="M24 17.5h6v6" fill="none" stroke="var(--mint)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.6" fill="var(--mint)" />
    </svg>
  );
}

export function Logo({ className, sub = true }: { className?: string; sub?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-extrabold tracking-tight">Lead<span className="text-brand">Trace</span></span>
        {sub && <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">by SevenDevX</span>}
      </span>
    </span>
  );
}
