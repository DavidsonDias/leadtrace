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
- Private content routes use `src/lib/route-meta.ts` for app-specific metadata without lead, organization, or account details, so sharing never exposes private data.
- Shared CRM screens live in `src/components/pages`; `src/lib/crm/context.ts` separates UI from demo/live providers. Never load demo state into `/workspace`.
- Production data goes through `src/lib/backend/repository.ts` and transactional RPCs in `supabase/migrations`; preserve organization RLS and composite foreign keys. Never use the existing SevenDevX Supabase project for LeadTrace. Its activation was reverted at the owner’s request. Production requires a separate, explicitly approved project.
- Run `npm test`, `npm run typecheck`, `npm run build`, and `npm run test:e2e` for operational changes. Database security tests execute real migration SQL via PGlite; never replace them with string-matching policy assertions.
- npm/package-lock.json is the canonical package manager/lock for local work, CI, and Vercel.

- Production is disconnected pending a dedicated backend; Google and recovery require `VITE_AUTH_REDIRECTS_CONFIGURED=true` only after callback allowlisting is verified. Do not modify other apps' Site URL or mail templates.
