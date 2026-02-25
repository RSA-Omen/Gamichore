# GamiChore Play Store release steps

This is the exact path from local code to Play Console upload.

## 1) Create an upload keystore (one-time)

Run this once and keep the file and passwords safe.

```bash
keytool -genkeypair \
  -v \
  -keystore gamichore-upload.keystore \
  -alias gamichore-upload \
  -keyalg RSA \
  -keysize 4096 \
  -validity 10000
```

Recommended location: `~/.android/keystores/gamichore-upload.keystore`

## 2) Export signing and version env vars

Set these in your shell before building release:

```bash
export GAMICHORE_UPLOAD_STORE_FILE="$HOME/.android/keystores/gamichore-upload.keystore"
export GAMICHORE_UPLOAD_STORE_PASSWORD="replace-me"
export GAMICHORE_UPLOAD_KEY_ALIAS="gamichore-upload"
export GAMICHORE_UPLOAD_KEY_PASSWORD="replace-me"

export GAMICHORE_VERSION_CODE=2
export GAMICHORE_VERSION_NAME="1.0.1"
```

Notes:
- `GAMICHORE_VERSION_CODE` must increase on every Play upload.
- `GAMICHORE_VERSION_NAME` is what users see.

## 3) Build signed release AAB

From project root:

```bash
npm run build:aab
```

Expected output:

`android/app/build/outputs/bundle/release/app-release.aab`

## 4) Upload to Google Play

1. Open Play Console and create/select the app.
2. Go to **Testing** (internal) first and upload the `.aab`.
3. Complete required sections:
   - Privacy policy URL
   - Data safety
   - Content rating
   - Target audience
   - Ads declaration
4. After internal verification, promote to production.

## 5) Pre-upload check

Use `PLAY_STORE_CHECKLIST.md` as the release gate before each upload.
