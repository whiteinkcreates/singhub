-- Restore the server-only boundary already intended by supabase/vibe-checks.sql.
-- Direct RPC calls accept caller-supplied member IDs and must not be public.
revoke execute on function public.submit_feature_vote(uuid, text, text, text, boolean) from public, anon, authenticated;
grant execute on function public.submit_feature_vote(uuid, text, text, text, boolean) to service_role;
revoke execute on function public.submit_vibe_check(uuid, text, text, text, text, text, date, text[], boolean) from public, anon, authenticated;
grant execute on function public.submit_vibe_check(uuid, text, text, text, text, text, date, text[], boolean) to service_role;

-- Trigger functions only use NEW/OLD and pg_catalog built-ins.
alter function public.touch_roundup_updated_at() set search_path = '';
alter function public.enforce_roundup_state_transition() set search_path = '';
alter function public.protect_locked_roundup_payload() set search_path = '';
