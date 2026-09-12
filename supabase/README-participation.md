# SingHUB participation launch checklist

The Vibe Check and homepage feature vote share one Supabase passwordless email identity.

## 1. Create the database objects

Run the complete contents of `supabase/vibe-checks.sql` once in the Supabase SQL Editor.

Confirm the controlled bank and feature choices were seeded:

```sql
select slug, label, active
from public.vibe_tags
order by sort_order;

select poll_slug, option_id, title, active
from public.feature_poll_options
order by poll_slug, sort_order;
```

The first query should return 12 vibe tags. The second should return three feature choices.

## 2. Configure passwordless email redirects

In Supabase, open **Authentication → URL Configuration**.

- Site URL: `https://singhub.app`
- Production redirect: `https://singhub.app/**`
- Add the exact Vercel preview pattern only if preview-deployment email testing is needed.
- Add `http://localhost:3000/**` for local email testing.

The existing Magic Link template can keep using Supabase's confirmation URL. If the template has been customized, make sure it still honors the redirect URL passed by the app.

## 3. Check email delivery before launch

Supabase's default sender is suitable for setup testing, not a public participation campaign. Configure production SMTP before promoting Vibe Checks or feature voting, then test at least Gmail and one non-Gmail address.

## 4. Verify the complete flow

1. Open a venue with a verified recurring karaoke event.
2. Select one to four Vibe Check boxes and submit.
3. Enter an email and open the one-click sign-in link.
4. Confirm the saved report appears in the venue's aggregate results.
5. Visit the homepage and cast a feature vote without signing in again.
6. Confirm the feature result appears and the member count does not increase when changing the vote.
7. Confirm a second Vibe Check for the same event updates the existing report instead of creating another singer.

Raw member emails and individual responses should remain unavailable through the public Supabase API. Only aggregate results are returned by the SingHUB server routes.
