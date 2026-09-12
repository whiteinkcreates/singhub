# SingHUB participation launch checklist

SingHUB uses two participation thresholds:

- Feature votes count immediately after an email is entered. They do not require an account, password, or inbox visit.
- Venue Vibe Checks require a one-time passwordless email confirmation because they change public venue information.

## 1. Create the database objects

Run the complete contents of `supabase/vibe-checks.sql` in the Supabase SQL Editor for the initial participation setup. The streamlined feature-vote flow reuses these existing objects and does not require an additional migration.

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

Supabase's default sender is suitable for setup testing, not a public participation campaign. Configure production SMTP before promoting Vibe Checks, then test at least Gmail and one non-Gmail address. Feature voting does not send a sign-in email.

## 4. Verify the complete flow

1. Visit the homepage and choose a feature.
2. Enter an email and submit the vote.
3. Confirm the result appears immediately without an inbox visit or sign-in.
4. Change the vote with the same email and confirm the singer count does not increase.
5. Open a venue with a verified recurring karaoke event.
6. Select one to four Vibe Check boxes and submit.
7. Enter an email and open the one-click sign-in link.
8. Confirm the saved report appears in the venue's aggregate results.
9. Confirm a second Vibe Check for the same event updates the existing report instead of creating another singer.

Raw emails and individual responses should remain unavailable through the public Supabase API. Only aggregate results are returned by the SingHUB server routes.
