-- Disposable PostgreSQL fixture, NOT an application migration.
-- The public objects match only the columns the achievement migration needs.
-- Everything is created inside a GitHub Actions service container.
CREATE SCHEMA auth;
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN;
GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT USAGE ON SCHEMA auth TO authenticated, service_role;

CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE
AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;

CREATE TABLE auth.users (
  id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.singer_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  karaoke_alias text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.singer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "singers see their profile" ON public.singer_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
GRANT SELECT ON public.singer_profiles TO authenticated;

CREATE TABLE public.singer_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_key text NOT NULL,
  badge_name text NOT NULL,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  award_note text,
  UNIQUE(user_id,badge_key)
);
ALTER TABLE public.singer_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read their achievements" ON public.singer_achievements
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
GRANT SELECT ON public.singer_achievements TO authenticated;

CREATE TABLE public.singer_performances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_slug text
);
CREATE TABLE public.singer_venue_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_id text NOT NULL,
  venue_slug text NOT NULL,
  nightlife_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('confirmed','pending')),
  UNIQUE(user_id,venue_id,nightlife_date)
);
INSERT INTO auth.users (id) VALUES
  ('00000000-0000-4000-8000-000000000001'),
  ('00000000-0000-4000-8000-000000000002'),
  ('00000000-0000-4000-8000-000000000003'),
  ('00000000-0000-4000-8000-000000000004'),
  ('00000000-0000-4000-8000-000000000005');
INSERT INTO public.singer_profiles (user_id,karaoke_alias) VALUES
  ('00000000-0000-4000-8000-000000000001','Pilot Singer A'),
  ('00000000-0000-4000-8000-000000000002','Pilot Singer B');

-- Existing activity MUST be backfilled by the real migration.
INSERT INTO public.singer_performances (user_id, venue_slug)
SELECT '00000000-0000-4000-8000-000000000001', 'stage-a'
FROM generate_series(1,10);
INSERT INTO public.singer_venue_visits
  (user_id,venue_id,venue_slug,nightlife_date,status)
VALUES
 ('00000000-0000-4000-8000-000000000002','first-1','first-1','2026-10-01','confirmed'),
 ('00000000-0000-4000-8000-000000000002','first-2','first-2','2026-10-01','confirmed'),
 ('00000000-0000-4000-8000-000000000002','first-3','first-3','2026-10-02','confirmed'),
 ('00000000-0000-4000-8000-000000000002','first-4','first-4','2026-10-02','confirmed'),
 ('00000000-0000-4000-8000-000000000002','first-5','first-5','2026-10-03','confirmed');
