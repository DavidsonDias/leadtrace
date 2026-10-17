<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## LeadTrace CRM
- Demo workspace state lives in `src/lib/crm/store.tsx` (browser-only, localStorage) so demo data stays isolated from production; production data must go through a separate backend layer, never this store.
- Business rules (alerts, filters, KPIs) are pure functions in `src/lib/crm/metrics.ts`, covered by `src/test/crm-rules.test.ts`, so every screen computes the same numbers.
- `/app/*` is `ssr: false` + noindex because it is a private, browser-state area.
