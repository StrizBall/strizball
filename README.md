# 🏀 Strizball — 2026 NCAA Tournament Bracket Challenge

## Setup

### Supabase SQL (run this in SQL Editor)

```sql
-- Profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  email text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Brackets
create table if not exists brackets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  picks jsonb not null default '{}',
  updated_at timestamp with time zone default timezone('utc', now())
);

-- Results (admin enters actual game winners here)
create table if not exists results (
  id uuid default gen_random_uuid() primary key,
  game_id text not null unique,
  winner text not null,
  created_at timestamp with time zone default timezone('utc', now())
);

-- RLS
alter table brackets enable row level security;
alter table profiles enable row level security;
alter table results enable row level security;

create policy "Anyone can view brackets" on brackets for select using (true);
create policy "Users can insert own bracket" on brackets for insert with check (auth.uid() = user_id);
create policy "Users can update own bracket" on brackets for update using (auth.uid() = user_id);

create policy "Anyone can view profiles" on profiles for select using (true);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Anyone can view results" on results for select using (true);
```

### To enter game results (as admin)
In Supabase SQL Editor, run:
```sql
insert into results (game_id, winner) values ('E_R1_1', 'Duke')
on conflict (game_id) do update set winner = excluded.winner;
```

Game IDs follow the pattern: E_R1_1 through E_R1_8 (East Round 1), W_R1_1 (West), M_R1_1 (Midwest), S_R1_1 (South)
Round 2: E_R2_1 through E_R2_4, etc.
Round 3 (Sweet 16): E_R3_1, E_R3_2, etc.
Elite 8: E_R4, W_R4, M_R4, S_R4
Final Four: FF_1 (East/South winner), FF_2 (West/Midwest winner)
Championship: CHAMP

### Environment Variables
You need THREE variables in Vercel (Settings → Environment Variables):
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

The service role key is in Supabase → Settings → API → under "Project API keys" — it's the **service_role** key (the secret one). Only add this to Vercel, never put it in .env.local or commit it to GitHub!

### Deploy
```bash
npm install
npm run dev       # local preview
git add . && git commit -m "update" && git push   # deploy to Vercel
```
