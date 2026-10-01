# Host media admin

`/admin/hosts` uses the existing admin authentication. Upload JPG, PNG or WebP images through signed Cloudinary uploads, choose existing host-folder media, and save portrait, hero, descriptions, focal positions and license notes. Portraits appear in avatars and shared trading cards; the directory hero remains separately configurable. Blank hero settings inherit the shared booth hero.

Canonical host identity, bio, links and venue event schedules remain authoritative. The existing claim/update Google Form is linked for profile intake; automatic form-to-publication sync has not been verified or implemented. Reviewed submissions still need to reach Hosts_Canonical.

Persistence: public.host_media, created by the host_media_presentation migration. RLS is enabled with no public policies; anon/authenticated grants are revoked. Reads and writes are server-only with service_role. No test records remain.

Validation: production webpack build, TypeScript, lint (warnings only), seven prototype provenance checks, local HTTP authentication/origin/input/error-path checks, and transactional database insert/update/rollback checks passed. Live authenticated Cloudinary upload and admin save/reload still require preview review with the administrator session.

No main merge. Desktop/mobile fidelity review remains required.
