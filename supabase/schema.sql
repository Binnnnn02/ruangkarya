create extension if not exists pgcrypto;

create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  category text not null,
  date text not null default to_char(current_date, 'DD Mon YYYY'),
  read integer not null default 1 check (read > 0),
  views text not null default '0',
  tag text not null default '',
  color text not null default 'sky',
  excerpt text not null,
  body text not null,
  file_url text,
  file_path text,
  file_name text,
  file_type text,
  file_size bigint check (file_size is null or file_size <= 26214400),
  status text not null default 'published' check (status in ('published', 'draft')),
  created_at timestamptz not null default now()
);
alter table public.works add column if not exists file_url text;
alter table public.works add column if not exists file_path text;
alter table public.works add column if not exists file_name text;
alter table public.works add column if not exists file_type text;
alter table public.works add column if not exists file_size bigint check (file_size is null or file_size <= 26214400);
create index if not exists works_publication_order on public.works (created_at desc);
alter table public.works enable row level security;

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 1 and 180),
  author text not null check (length(author) between 1 and 120),
  category text not null,
  excerpt text not null check (length(excerpt) between 1 and 400),
  body text not null check (length(body) between 1 and 30000),
  contact_email text check (contact_email is null or length(contact_email) <= 320),
  consent boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz not null default now()
);
create index if not exists submissions_queue on public.submissions (submitted_at desc) where status = 'pending';
alter table public.submissions enable row level security;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_admin_user() from public;
grant execute on function public.is_admin_user() to authenticated;

drop policy if exists "Published works are public" on public.works;
create policy "Published works are public" on public.works
  for select to anon, authenticated using (status = 'published');
drop policy if exists "Admins manage works" on public.works;
create policy "Admins manage works" on public.works
  for all to authenticated using (public.is_admin_user())
  with check (public.is_admin_user());
grant select on public.works to anon, authenticated;
grant insert, update, delete on public.works to authenticated;

drop policy if exists "Anyone can submit a work for review" on public.submissions;
create policy "Anyone can submit a work for review" on public.submissions
  for insert to anon, authenticated with check (
    status = 'pending' and consent = true
    and length(title) between 1 and 180
    and length(author) between 1 and 120
    and length(excerpt) between 1 and 400
    and length(body) between 1 and 30000
  );
drop policy if exists "Admins review submissions" on public.submissions;
create policy "Admins review submissions" on public.submissions
  for select to authenticated using (public.is_admin_user());
drop policy if exists "Admins update submissions" on public.submissions;
create policy "Admins update submissions" on public.submissions
  for update to authenticated using (public.is_admin_user()) with check (public.is_admin_user());
drop policy if exists "Admins delete submissions" on public.submissions;
create policy "Admins delete submissions" on public.submissions
  for delete to authenticated using (public.is_admin_user());
grant insert on public.submissions to anon, authenticated;
grant select, update, delete on public.submissions to authenticated;

drop policy if exists "Admins can see own admin record" on public.admin_users;
create policy "Admins can see own admin record" on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));
grant select on public.admin_users to authenticated;

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email) and length(email) <= 320),
  created_at timestamptz not null default now()
);
alter table public.subscribers enable row level security;
drop policy if exists "Anyone can subscribe" on public.subscribers;
create policy "Anyone can subscribe" on public.subscribers
  for insert to anon, authenticated with check (email = lower(email) and length(email) <= 320);
drop policy if exists "Admins read subscribers" on public.subscribers;
create policy "Admins read subscribers" on public.subscribers
  for select to authenticated using (public.is_admin_user());
drop policy if exists "Admins delete subscribers" on public.subscribers;
create policy "Admins delete subscribers" on public.subscribers
  for delete to authenticated using (public.is_admin_user());
grant insert on public.subscribers to anon, authenticated;
grant select, delete on public.subscribers to authenticated;

create or replace function public.approve_submission(submission_id uuid)
returns public.works
language plpgsql
security definer
set search_path = ''
as $$
declare
  submitted public.submissions%rowtype;
  published public.works%rowtype;
begin
  if not public.is_admin_user() then
    raise exception 'Admin access required';
  end if;
  select * into submitted
  from public.submissions
  where id = submission_id and status = 'pending'
  for update;
  if not found then
    raise exception 'Submission is missing or already reviewed';
  end if;
  insert into public.works (title, author, category, date, read, views, tag, color, excerpt, body, status)
  values (
    submitted.title, submitted.author, submitted.category,
    to_char(current_date, 'DD Mon YYYY'),
    greatest(1, ceil(array_length(regexp_split_to_array(trim(submitted.body), '\s+'), 1) / 180.0)::integer),
    '0', upper(submitted.category), 'sky', submitted.excerpt, submitted.body, 'published'
  ) returning * into published;
  update public.submissions set status = 'approved' where id = submitted.id;
  return published;
end;
$$;
revoke all on function public.approve_submission(uuid) from public;
grant execute on function public.approve_submission(uuid) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'work-files', 'work-files', true, 26214400,
  array[
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text', 'application/rtf', 'text/plain',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/epub+zip'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read work files" on storage.objects;
drop policy if exists "Admins upload work files" on storage.objects;
create policy "Admins upload work files" on storage.objects
  for insert to authenticated with check (bucket_id = 'work-files' and public.is_admin_user());
drop policy if exists "Admins update work files" on storage.objects;
create policy "Admins update work files" on storage.objects
  for update to authenticated using (bucket_id = 'work-files' and public.is_admin_user())
  with check (bucket_id = 'work-files' and public.is_admin_user());
drop policy if exists "Admins delete work files" on storage.objects;
create policy "Admins delete work files" on storage.objects
  for delete to authenticated using (bucket_id = 'work-files' and public.is_admin_user());
