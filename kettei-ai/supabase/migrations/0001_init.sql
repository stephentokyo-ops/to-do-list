-- KETTEI AI 初期スキーマ
-- 注意: このマイグレーションはSupabaseプロジェクトに未接続の開発環境で作成されたため、
-- 実際のSupabase上での適用・動作確認は行われていない。本番投入前に必ず検証すること。

create extension if not exists "pgcrypto";

-- ============================================================
-- profiles
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid() references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  plan text not null default 'free' check (plan in ('free', 'standard', 'professional')),
  monthly_limit integer,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- projects
-- ============================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  analysis_type text not null,
  background text not null default '',
  priority_points text not null default '',
  deadline text not null default '',
  input_text text not null default '',
  status text not null default 'draft' check (status in ('draft', 'analyzing', 'completed', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_projects_user_id on public.projects(user_id);

-- ============================================================
-- documents
-- ============================================================
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  original_filename text not null,
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null,
  extracted_text text not null default '',
  extraction_status text not null default 'pending' check (extraction_status in ('pending', 'success', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);
create index if not exists idx_documents_project_id on public.documents(project_id);

-- ============================================================
-- analyses
-- ============================================================
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null,
  model text not null,
  prompt_version text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  estimated_cost numeric(10, 4) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed')),
  result_json jsonb,
  result_markdown text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_analyses_project_id on public.analyses(project_id);
create index if not exists idx_analyses_user_id on public.analyses(user_id);

-- ============================================================
-- exports
-- ============================================================
create table if not exists public.exports (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  format text not null check (format in ('markdown', 'pdf', 'docx')),
  storage_path text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_exports_analysis_id on public.exports(analysis_id);

-- ============================================================
-- usage_records
-- ============================================================
create table if not exists public.usage_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  estimated_cost numeric(10, 4) not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_usage_records_user_id on public.usage_records(user_id);

-- ============================================================
-- prompt_versions
-- ============================================================
create table if not exists public.prompt_versions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  version text not null,
  system_prompt text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- updated_at 自動更新トリガー
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists trg_analyses_updated_at on public.analyses;
create trigger trg_analyses_updated_at before update on public.analyses
  for each row execute function public.set_updated_at();

-- ============================================================
-- 新規ユーザー登録時に profiles 行を自動作成
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', ''));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.documents enable row level security;
alter table public.analyses enable row level security;
alter table public.exports enable row level security;
alter table public.usage_records enable row level security;
alter table public.prompt_versions enable row level security;

-- profiles: 本人のみ参照・更新可能。管理者は全件参照可能。
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_select_admin" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- projects: 本人のみCRUD可能
create policy "projects_all_own" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "projects_select_admin" on public.projects
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- documents: 本人のみCRUD可能
create policy "documents_all_own" on public.documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- analyses: 本人のみCRUD可能。管理者は全件参照可能（使用量集計用）。
create policy "analyses_all_own" on public.analyses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "analyses_select_admin" on public.analyses
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- exports: 本人のみCRUD可能
create policy "exports_all_own" on public.exports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- usage_records: 本人は参照のみ。管理者は全件参照可能。
create policy "usage_records_select_own" on public.usage_records
  for select using (auth.uid() = user_id);
create policy "usage_records_select_admin" on public.usage_records
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
create policy "usage_records_insert_own" on public.usage_records
  for insert with check (auth.uid() = user_id);

-- prompt_versions: 管理者のみ参照・更新可能
create policy "prompt_versions_admin_all" on public.prompt_versions
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
