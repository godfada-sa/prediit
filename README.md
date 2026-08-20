# PREDIIT

PREDIIT is a static multi-route web application backed by Supabase. The visual system is black, white, and red; prediction images are processed by an Edge Function; and the admin control room retains its access-code login while using short-lived server-validated sessions.

## Local checks

Requires Node.js 20 or newer.

```powershell
npm test
npm run build
npm run preview
npx deno check supabase/functions/get-prediction/index.ts supabase/functions/admin-proof-url/index.ts supabase/functions/cleanup-proof-images/index.ts
```

The local preview opens at `http://127.0.0.1:4173`.

## Database and functions

The canonical database history is in `supabase/migrations`:

1. `20260820000000_base.sql` creates the base schema.
2. `20260820010000_security_hardening.sql` applies least-privilege grants, private Storage policies, atomic wallet operations, and token-backed admin sessions.
3. `20260820223000_order_submission_responses.sql` keeps duplicate-payment protection while returning user-facing order validation responses and cleaning up rejected proof uploads.
4. `20260820230000_proof_image_retention.sql` schedules reviewed proof images for permanent Storage deletion 15 days after upload while preserving their payment records.

Apply migrations in order with the Supabase CLI, then deploy the Edge Functions:

```powershell
supabase db push
supabase functions deploy get-prediction
supabase functions deploy admin-proof-url
supabase functions deploy cleanup-proof-images --no-verify-jwt
```

Configure `GEMINI_API_KEY` as a hosted function secret, or enter it from the secured admin settings screen. `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are provided by Supabase Functions. Set `ALLOWED_ORIGINS` to a comma-separated list of production origins.

## Security model

- Members can update only their name, phone, and referral code—not role, status, or balances.
- Prediction, spin, ticket, and wallet writes use transactional RPCs with row locking.
- The Gemini key and provider request remain server-side.
- Payment screenshots are private and scoped to the owner's UUID folder.
- Reviewed payment screenshots are removed through the Storage API after 15 days; unresolved submissions are retained until an admin decision.
- The admin access code is hashed. A successful login issues an opaque 30-minute token stored in the current tab; the code itself is never stored in the browser.
- Every sensitive admin RPC requires that token. Private proof URLs are signed server-side and expire after five minutes.

## Frontend maintenance

The original framework source was not present in this repository. The repaired distribution keeps hand-maintained code in readable modules where changes were required:

- `assets/routes-D_UGL2ZY.js` — public landing page
- `assets/theme-red.css` — shared visual system
- `assets/admin.functions-Qwu3nqHw.js` — admin adapters
- `assets/predict.functions-DuIWAvRz.js` — prediction adapter
- `supabase/functions` — server-side integrations

`npm run build` validates every route and JavaScript file, verifies local asset references, blocks unsupported performance claims, and checks the critical security boundaries. A future framework rebuild should preserve these behaviors and tests.
