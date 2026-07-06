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

-- ============================================
-- 이미지 업로드용 Storage 버킷 (글 본문에 이미지 삽입)
-- ============================================

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- 누구나 이미지 조회 가능 (공개 버킷이라 사실상 필요 없지만 명시적으로 추가)
create policy "public read post images"
  on storage.objects for select
  using (bucket_id = 'post-images');

-- 로그인한 사람(관리자)만 업로드 가능
create policy "admin upload post images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'post-images');

-- 로그인한 사람(관리자)만 삭제 가능
create policy "admin delete post images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'post-images');