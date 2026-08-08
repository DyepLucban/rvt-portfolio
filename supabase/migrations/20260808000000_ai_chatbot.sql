-- AI chatbot ("Know more") — knowledge base + guardrail tables.
-- Run once against the project, either with `npx supabase db push` or by
-- pasting this file into the Supabase dashboard SQL editor.

create extension if not exists vector;

-- ---------------------------------------------------------------- knowledge

-- One row per source document. `source` is the natural key the ingest script
-- upserts on, so re-running ingest updates in place instead of duplicating.
create table if not exists knowledge_documents (
  id          bigint generated always as identity primary key,
  source      text not null unique,        -- 'cv' | 'linkedin' | 'faq'
  title       text,
  updated_at  timestamptz not null default now()
);

create table if not exists knowledge_chunks (
  id          bigint generated always as identity primary key,
  document_id bigint not null references knowledge_documents(id) on delete cascade,
  heading     text,                        -- breadcrumb, embedded with the content
  content     text not null,
  embedding   vector(384),                 -- gte-small, Supabase Edge Runtime built-in
  created_at  timestamptz not null default now()
);

create index if not exists knowledge_chunks_document_id_idx
  on knowledge_chunks (document_id);

create index if not exists knowledge_chunks_embedding_idx
  on knowledge_chunks using hnsw (embedding vector_cosine_ops);

-- Similarity search lives here so the Edge Function stays thin. `<=>` is
-- cosine distance; 1 - distance is the similarity the caller reasons about.
create or replace function match_knowledge_chunks(
  query_embedding vector(384),
  match_count     int   default 6,
  min_similarity  float default 0.3
)
returns table (id bigint, heading text, content text, similarity float)
language sql stable
as $$
  select c.id,
         c.heading,
         c.content,
         1 - (c.embedding <=> query_embedding) as similarity
  from knowledge_chunks c
  where 1 - (c.embedding <=> query_embedding) > min_similarity
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

-- The content is a public CV on a public site, so anon may read it. Writes go
-- through the service-role client in the ingest handler, which bypasses RLS.
alter table knowledge_documents enable row level security;
alter table knowledge_chunks    enable row level security;

drop policy if exists "knowledge_documents anon read" on knowledge_documents;
create policy "knowledge_documents anon read"
  on knowledge_documents for select to anon using (true);

drop policy if exists "knowledge_chunks anon read" on knowledge_chunks;
create policy "knowledge_chunks anon read"
  on knowledge_chunks for select to anon using (true);

-- --------------------------------------------------------------- guardrails

-- Two rows per visitor per day (one hour window, one day window). `ip_hash` is
-- a salted SHA-256 — the raw IP is never stored.
create table if not exists chat_rate_limits (
  ip_hash      text        not null,
  window_kind  text        not null check (window_kind in ('hour', 'day')),
  window_start timestamptz not null,
  count        int         not null default 0,
  primary key (ip_hash, window_kind, window_start)
);

create table if not exists chat_logs (
  id                bigint generated always as identity primary key,
  question          text not null,
  answer            text,
  ip_hash           text,
  retrieved_ids     bigint[],
  model             text,
  prompt_tokens     int,
  completion_tokens int,
  cached_tokens     int,
  created_at        timestamptz not null default now()
);

create index if not exists chat_logs_created_at_idx on chat_logs (created_at desc);

-- Service-role only: RLS on with no policy at all means anon gets nothing.
alter table chat_rate_limits enable row level security;
alter table chat_logs        enable row level security;

-- Check-and-increment in one statement so two simultaneous requests from the
-- same visitor can't both read "14 so far" and both be allowed through.
-- Returns without incrementing when either window is already at its cap.
create or replace function bump_chat_rate_limit(
  p_ip_hash      text,
  p_hourly_limit int default 15,
  p_daily_limit  int default 60
)
returns table (allowed boolean, hourly_count int, daily_count int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hour  timestamptz := date_trunc('hour', now());
  v_day   timestamptz := date_trunc('day', now());
  v_hourly int;
  v_daily  int;
begin
  select coalesce(count, 0) into v_hourly
  from chat_rate_limits
  where ip_hash = p_ip_hash and window_kind = 'hour' and window_start = v_hour;

  select coalesce(count, 0) into v_daily
  from chat_rate_limits
  where ip_hash = p_ip_hash and window_kind = 'day' and window_start = v_day;

  v_hourly := coalesce(v_hourly, 0);
  v_daily  := coalesce(v_daily, 0);

  if v_hourly >= p_hourly_limit or v_daily >= p_daily_limit then
    return query select false, v_hourly, v_daily;
    return;
  end if;

  insert into chat_rate_limits (ip_hash, window_kind, window_start, count)
  values (p_ip_hash, 'hour', v_hour, 1)
  on conflict (ip_hash, window_kind, window_start)
  do update set count = chat_rate_limits.count + 1
  returning count into v_hourly;

  insert into chat_rate_limits (ip_hash, window_kind, window_start, count)
  values (p_ip_hash, 'day', v_day, 1)
  on conflict (ip_hash, window_kind, window_start)
  do update set count = chat_rate_limits.count + 1
  returning count into v_daily;

  return query select true, v_hourly, v_daily;
end;
$$;

-- Only the Edge Function (service role) may call it.
revoke execute on function bump_chat_rate_limit(text, int, int) from anon, authenticated;

-- Old counter rows are dead weight once their window has passed; nothing reads
-- them again. Delete by hand or from a cron job whenever it's convenient:
--   delete from chat_rate_limits where window_start < now() - interval '2 days';
