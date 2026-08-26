alter table public.singboard_flyers
  add column if not exists post_type text not null default 'image' check (post_type in ('image','note')),
  add column if not exists note_text text,
  add column if not exists note_color text,
  add column if not exists start_time text,
  add column if not exists host_name text,
  add column if not exists link_url text;

alter table public.singboard_flyers alter column image_url drop not null;

create index if not exists singboard_flyers_post_type_idx on public.singboard_flyers(post_type);
