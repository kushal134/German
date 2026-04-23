# German A1 Quiz Arena

Live classroom quiz app with:
- teacher-hosted sessions,
- student join via code/link,
- synchronized question flow (polling-based),
- session leaderboard stored in Supabase,
- optional AI-generated question expansion.
- Vercel API proxy (students never handle Supabase keys).

## Run locally (frontend only)

```bash
cd "/Users/kkejriwal/Documents/German Website"
python3 -m http.server 5500
```

Open: `http://localhost:5500`

Note: live session DB calls now go through `/api/db` (Vercel serverless route), so full multiplayer flow works after Vercel deployment.

## Deploy on Vercel

1. Push this folder to a GitHub repo.
2. Import repo in Vercel.
3. In Vercel project settings -> Environment Variables, add:
   - `SUPABASE_URL` = `https://<your-project-ref>.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key
4. Deploy (no build command needed for static files).

`vercel.json` is included for static hosting config.

## Configure Supabase (required for live mode)

1. Create a Supabase project.
2. Run `supabase-schema.sql` in SQL Editor.
Live mode uses these tables from `supabase-schema.sql`:
- `live_sessions`
- `live_questions`
- `live_players`
- `live_answers`

## Configure AI question generation (optional)

In the setup screen:
- API Key
- API Base URL (OpenAI-compatible)
- Model

If API fails or is blank, app uses local generated bank.

## Live classroom flow

1. Teacher selects **I am Teacher**.
2. Teacher picks topics/settings and clicks **Create Live Session**.
3. Teacher gets:
   - Join code
   - Join link (copy/share/QR)
4. Students select **I am Student**, enter code + nickname, and join.
5. Teacher starts quiz from host lobby.
6. Teacher controls next question / end quiz.
7. Final leaderboard shows all players by score.

## Notes

- This app is static frontend + Vercel serverless API + Supabase.
- Sync is done by short polling every 2 seconds.
- For smoother real-time updates, upgrade later to Supabase Realtime channels or WebSockets.
