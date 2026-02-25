# GamiChore

Gamify chores for kids: assign tasks with star values, create kid profiles, and a shop where they spend stars on rewards (with optional Rands price and picture for each item).

## Run locally

Your shell is using **Windows Node** from `/mnt/e/node.js/`, which breaks on WSL paths (UNC errors). Use **Node installed inside WSL** for this project.

### One-time setup (WSL terminal, as root or with sudo)

1. **Install Node inside WSL** (so `node` and `npm` live under `/usr`):
   ```bash
   sudo apt-get update
   sudo apt-get install -y nodejs npm
   ```
2. **Use that Node for this project** (so it’s found before `/mnt/e`):
   ```bash
   export PATH="/usr/bin:$PATH"
   which node   # should show /usr/bin/node
   which npm    # should show /usr/bin/npm or /usr/bin/npx
   ```
3. **Clean and install** (close Cursor first if you get EPERM on `node_modules`). Use the install script so WSL’s npm is used, not Windows’s:
   ```bash
   cd /home/lauchlan/gamichore
   rm -rf node_modules package-lock.json
   bash install-wsl.sh
   ```
4. **Start the app:**
   ```bash
   bash dev-wsl.sh
   ```
   Open the URL Vite prints (e.g. http://localhost:5173).

**From your phone on the same Wi‑Fi (when dev server runs in WSL):** WSL2 uses a virtual network, so Vite only shows WSL IPs (10.x, 172.x), not your PC’s LAN IP (e.g. 192.168.88.x). Your phone must use the **Windows PC’s** LAN IP.

- **Option A – Port forwarding (Windows):** Run **as Administrator** (PowerShell or CMD):  
  `scripts\forward-port-5173.bat`  
  That forwards port 5173 from all interfaces to localhost so WSL’s server is reachable. Then on your phone open `http://<PC-LAN-IP>:5173` (e.g. `http://192.168.88.254:5173`). To remove the rule later, run `scripts\forward-port-5173-remove.bat` as Admin.
- **Option B – Tunnel:** In WSL, with the dev server running, run `npx localtunnel --port 5173` and open the printed URL on your phone (no firewall changes).

**Tip:** Use `bash install-wsl.sh` and `bash dev-wsl.sh` (not `./script.sh`) so the script is run by bash regardless of line endings. If you see `'bash\r': No such file or directory`, the script has Windows line endings; fix with:
   ```bash
   sed -i 's/\r$//' dev-wsl.sh install-wsl.sh
   ```

## Features

- **Kids** — Create profiles (name, optional avatar emoji/initial). Each kid has a star balance derived from completed chores minus redemptions.
- **Chores** — Create tasks with a star value and optional assignment to a kid. Use **Done** to award those stars to the assigned kid.
- **Manage shop** — Add items: name, price in stars, price in Rands (for your reference), and an optional picture (uploaded and stored in the browser).
- **Shop** — Kid-facing view: choose who is shopping, see their balance, and a grid of items in bordered cards. Affordable items get a gold border; **Get it!** redeems and deducts stars.

Data is stored in Supabase (see `.env.example`). Pictures are stored as base64.

### Supabase setup

1. Create a project at supabase.com.
2. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Run migrations in Supabase SQL Editor (in order):
   - `supabase/migrations/20250225000000_initial.sql`
   - `supabase/migrations/20250225000001_handle_new_user.sql`
   - `supabase/migrations/20250225000002_backfill_profiles.sql` (backfills profiles for users created before the trigger)
4. In Supabase Dashboard → Authentication → Providers → Email: disable "Confirm email" if you want immediate sign-in after signup.

## Mobile browser and installable PWA

The app works in any mobile browser (Chrome, Firefox, Safari, etc.) and is responsive: viewport, safe areas, and touch-friendly targets are already set.

**Install on your phone from the browser (no app store):**

1. Deploy the built app to HTTPS (e.g. Vercel, Netlify, or your server), or run locally and use your machine’s LAN URL on the phone (e.g. `https://192.168.1.x:5173` with `npm run preview` and a tunnel if needed).
2. Open the app URL in the phone’s browser.
3. Use **“Add to Home Screen”** (Android Chrome: menu → Install app / Add to Home Screen). The app will open in standalone full-screen and can work offline (cached by the service worker).

The project is a **PWA**: it has a web app manifest and a service worker (via `vite-plugin-pwa`). Icons are in `public/icon-192.png` and `public/icon-512.png` (placeholders). Replace them with real 192×192 and 512×512 PNGs for a proper install icon.

## Android app (native)

The same app runs as a native Android build via [Capacitor](https://capacitorjs.com/). One codebase for web and mobile.

### Requirements

- Android Studio (with Android SDK)
- Node 18+

### Build and run on Android

1. **Build the web app and sync to Android:**
   ```bash
   npm run build:android
   ```
   This runs `vite build` then copies `dist/` into the Android project.

2. **Open in Android Studio and run on device/emulator:**
   ```bash
   npm run android
   ```
   Or open the `android/` folder in Android Studio, then Run on a connected device or AVD.

3. To rebuild after code changes, run `npm run build:android` again, then run the app from Android Studio (or sync in Android Studio).

### Mobile behaviour

- **Parents** and **Kids** use the same login screen; choose "I'm a parent" or "I'm a kid".
- Parent mode is protected by a local 4-8 digit PIN (set on first use, required each session).
- Layout uses safe-area insets for notched devices and gesture navigation.
- Buttons and tap targets are at least 44px on small screens.
- Data is stored in the WebView’s local storage (per install); no backend.

## Play Store readiness

See `PLAY_STORE_CHECKLIST.md` for the release and policy checklist used before submission.
For build/sign/upload commands, use `PLAYSTORE_RELEASE.md`.
# Gamichore
