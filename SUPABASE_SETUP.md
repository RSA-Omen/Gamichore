# Supabase Setup for GamiChore

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project (choose org, name, region, password)
3. Wait for the project to be ready

## 2. Run the migration

1. Install Supabase CLI: `npm install -g supabase`
2. Link your project: `supabase link --project-ref YOUR_PROJECT_REF`
3. Run migrations: `supabase db push`

Or run the SQL manually in Supabase Dashboard → SQL Editor:

- Copy the contents of `supabase/migrations/20250225000000_initial.sql`
- Paste and run

## 3. Configure auth (optional)

By default Supabase requires email confirmation. To skip it for easier testing:

1. Supabase Dashboard → Authentication → Providers → Email
2. Turn off "Confirm email"

## 4. Add env vars

Create `.env.local` in the project root:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find these in: Supabase Dashboard → Settings → API

For Vercel: add the same vars in Project Settings → Environment Variables

## 5. Deploy

The app will work with Supabase. Each user gets their own household on signup. Data is isolated by row-level security.
