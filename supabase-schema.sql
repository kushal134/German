create table if not exists public.live_sessions (
  id bigint generated always as identity primary key,
  join_code text unique not null,
  host_token text not null,
  status text not null default 'lobby',
  question_count integer not null check (question_count > 0),
  time_limit_sec integer not null check (time_limit_sec > 0),
  current_question_index integer not null default 0,
  question_started_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.live_questions (
  id bigint generated always as identity primary key,
  session_id bigint not null references public.live_sessions(id) on delete cascade,
  order_index integer not null check (order_index > 0),
  topic text not null,
  level text not null default 'mixed',
  question text not null,
  choices jsonb not null,
  answer text not null,
  explanation text not null default ''
);

create table if not exists public.live_players (
  id bigint generated always as identity primary key,
  session_id bigint not null references public.live_sessions(id) on delete cascade,
  nickname text not null,
  total_score integer not null default 0 check (total_score >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.live_answers (
  id bigint generated always as identity primary key,
  session_id bigint not null references public.live_sessions(id) on delete cascade,
  player_id bigint not null references public.live_players(id) on delete cascade,
  question_index integer not null check (question_index > 0),
  selected_answer text not null,
  is_correct boolean not null,
  points integer not null default 0 check (points >= 0),
  created_at timestamptz not null default now(),
  unique (player_id, question_index)
);

create index if not exists live_sessions_code_idx on public.live_sessions(join_code);
create index if not exists live_players_session_idx on public.live_players(session_id);
create index if not exists live_questions_session_idx on public.live_questions(session_id, order_index);
create index if not exists live_answers_session_idx on public.live_answers(session_id, player_id);

alter table public.live_sessions enable row level security;
alter table public.live_questions enable row level security;
alter table public.live_players enable row level security;
alter table public.live_answers enable row level security;

drop policy if exists live_sessions_read on public.live_sessions;
create policy live_sessions_read on public.live_sessions for select to anon using (true);
drop policy if exists live_sessions_write on public.live_sessions;
create policy live_sessions_write on public.live_sessions for all to anon using (true) with check (true);

drop policy if exists live_questions_read on public.live_questions;
create policy live_questions_read on public.live_questions for select to anon using (true);
drop policy if exists live_questions_write on public.live_questions;
create policy live_questions_write on public.live_questions for all to anon using (true) with check (true);

drop policy if exists live_players_read on public.live_players;
create policy live_players_read on public.live_players for select to anon using (true);
drop policy if exists live_players_write on public.live_players;
create policy live_players_write on public.live_players for all to anon using (true) with check (true);

drop policy if exists live_answers_read on public.live_answers;
create policy live_answers_read on public.live_answers for select to anon using (true);
drop policy if exists live_answers_write on public.live_answers;
create policy live_answers_write on public.live_answers for all to anon using (true) with check (true);
