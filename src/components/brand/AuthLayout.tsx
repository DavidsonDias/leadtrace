import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { OriginBadge } from "@/components/crm/OriginBadge";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-border bg-card lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
        <div className="pointer-events-none absolute inset-0 bg-glow" />
        <Link to="/" className="relative"><Logo /></Link>
        <div className="relative">
          <h2 className="font-display text-4xl font-extrabold leading-tight">Track every lead.<br /><span className="text-brand">Grow every opportunity.</span></h2>
          <div className="mt-8 flex flex-wrap gap-2"><OriginBadge source="google_ads" /><OriginBadge source="site" /><OriginBadge source="gbp" /><OriginBadge source="instagram" /><OriginBadge source="referral" /></div>
        </div>
        <p className="relative text-sm text-muted-foreground">Uma solução digital desenvolvida pela <a className="text-primary" href="https://sevendevx.com/" target="_blank" rel="noopener noreferrer">SevenDevX</a>.</p>
      </div>
      <div className="flex flex-col items-center justify-center p-6">
        <Link to="/" className="mb-8 lg:hidden"><Logo /></Link>
        <div className="w-full max-w-sm">{children}</div>
        <p className="mt-10 text-xs text-muted-foreground">LeadTrace CRM — Desenvolvido por SevenDevX</p>
      </div>
    </div>
  );
}
