-- ════════════════════════════════════════════════════════════════════════
-- Configuration Supabase pour la synchro de progression
-- À exécuter une fois dans : Supabase > SQL Editor
-- ════════════════════════════════════════════════════════════════════════

-- 1. Table de progression utilisateur
create table if not exists user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  progress jsonb not null default '{}'::jsonb,
  streak jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2. Une seule ligne par utilisateur (nécessaire pour upsert onConflict)
create unique index if not exists user_progress_user_id_idx
  on user_progress(user_id);

-- 3. Activer la Row Level Security
alter table user_progress enable row level security;

-- 4. Politiques : chaque utilisateur n'accède qu'à sa propre ligne
create policy "Users can read their own progress"
  on user_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert their own progress"
  on user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress"
  on user_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own progress"
  on user_progress for delete
  using (auth.uid() = user_id);
