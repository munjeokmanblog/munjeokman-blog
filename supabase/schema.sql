-- ============================================
-- 문적만 블로그 - Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.
-- ============================================

create extension if not exists "pgcrypto";

-- 글 테이블
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  view_count integer not null default 0,
  published boolean not null default true
);

-- 댓글 테이블
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  author text not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table posts enable row level security;
alter table comments enable row level security;

-- 누구나 공개된 글은 읽을 수 있음
create policy "public read published posts"
  on posts for select
  using (published = true);

-- 로그인한 사람(관리자)은 글에 대해 모든 작업 가능 (읽기/쓰기/수정/삭제)
create policy "admin manage posts"
  on posts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 누구나 공개된 글의 댓글을 읽을 수 있음
create policy "public read comments"
  on comments for select
  using (
    exists (
      select 1 from posts
      where posts.id = comments.post_id and posts.published = true
    )
  );

-- 누구나 댓글 작성 가능
create policy "public insert comments"
  on comments for insert
  with check (true);

-- 관리자만 댓글 삭제 가능
create policy "admin delete comments"
  on comments for delete
  using (auth.role() = 'authenticated');

-- 조회수 증가용 함수 (RLS 우회, 오직 view_count만 +1 하도록 제한됨)
create or replace function increment_view_count(post_id_input uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update posts set view_count = view_count + 1 where id = post_id_input;
end;
$$;

grant execute on function increment_view_count(uuid) to anon, authenticated;
