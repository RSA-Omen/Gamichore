# GamiChore: Deploy to Vercel + Week Plan for Sharing & Security

## Part 1: Deploy to Vercel (Today, ~15 min)

### Step 1: Push to GitHub
```bash
cd gamichore
git init
git add .
git commit -m "Initial GamiChore app"
# Create a repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/gamichore.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in (GitHub works).
2. **Add New Project** → Import your `gamichore` repo.
3. Vercel auto-detects Vite. Build command: `npm run build`. Output: `dist`.
4. Click **Deploy**.

### Step 3: Confirm
- You’ll get a URL like `gamichore-xxx.vercel.app`.
- SPA routing is handled by the `vercel.json` config in the repo.

---

## Part 2: Current State (Important)

**Right now, GamiChore:**
- Stores everything in **localStorage** on the device.
- Uses a **local PIN** for “parent auth” (no accounts).
- Has **no backend** – no cloud database, no user signup.
- **No separation between families** – everyone using the same device shares one dataset.

**Implications:**
- Data never leaves the device.
- Different parents on different devices naturally have different data.
- But: clearing browser data wipes everything, and there’s no sync across devices.

---

## Part 3: What “Different Parents, Own Profiles, Data Safe” Means

| Need | What It Requires | Effort |
|------|------------------|--------|
| Each family sees only their kids | Family/household as a unit; data partitioned by family ID | Backend + DB |
| Parent-specific login | Email/password or OAuth signup | Auth provider |
| Data persists across devices | Cloud DB instead of localStorage | Backend |
| Data “safe” (privacy, security) | Auth, HTTPS, row-level security, no cross-family access | Backend + policies |

So “real” multi-tenant, secure sharing needs a backend. The current version is fine for single-device, single-family use.

---

## Part 4: Week Plan – Two Paths

### Path A: Ship Fast (No Backend)

**Goal:** Live URL, shareable, good enough for early users.

**Days 1–2**
- [x] Deploy to Vercel.
- Add a short “How it works” / FAQ on the home screen or a `/about` page.
- Make it clear: “Your data stays on this device. Use on your own phone/tablet for your family.”

**Days 3–4**
- Share the link with 3–5 families.
- Ask them to use it on their own devices (each device = one family).
- Collect feedback.

**Days 5–7**
- Fix critical bugs.
- Optionally add a “Share” or “Feedback” link.
- Document how to add to home screen (PWA).

**Data “safety” in this model:**
- Data never leaves the device.
- No accounts = no credentials to steal.
- Each family’s data is isolated per device.

---

### Path B: Add Backend for Real Multi-Tenant (Longer Term)

**Goal:** Accounts, families, cloud data, proper sharing.

**Backend choice:** Supabase (Auth + Postgres + RLS).

**Architecture sketch:**
```
Users (Supabase Auth)
  └── households (one per family)
        └── kids
        └── chores, chore_sets, completions, shop_items, redemptions
```

**Security model:**
- Row-level security (RLS) so each household only sees its own rows.
- `auth.uid()` ties each user to a household.
- API access only returns data for that household.

**Rough timeline:** 1–2 weeks for:
- Supabase project + schema + RLS.
- Auth flow (signup/login).
- Migrate read/write from localStorage to Supabase.
- Household creation and joining flow.

---

## Part 5: Recommended Next Week

1. **Deploy to Vercel** – get a live URL.
2. **Path A** – ship as single-device, single-family.
3. **Add a short note** – “Data stays on your device. No accounts.”
4. **Share with a few families** – use their own devices.
5. **If people want sync or accounts** → plan Path B (Supabase).

---

## Part 6: Quick Security Checklist (Even for Path A)

- [x] App served over **HTTPS** (Vercel handles this).
- [x] No API keys or secrets in the frontend.
- [x] No sensitive data sent to external servers.
- [ ] Add a privacy note: “We don’t collect or store your data” (once that’s true).
- [ ] Consider a simple Terms/Privacy page before scaling.

---

## Summary

| Phase | Timeline | What You Get |
|-------|----------|--------------|
| **Now** | 1 day | Live URL, shareable, single-device per family |
| **Week 1** | 5–7 days | Feedback, small improvements, clearer messaging |
| **Later** | 1–2 weeks | Supabase backend, accounts, sync, multi-device |
