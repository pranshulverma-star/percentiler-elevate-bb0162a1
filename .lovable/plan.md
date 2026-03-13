

## Making Your Web App Into a Mobile App

You already have a fully functional web application. There are two paths to make it installable as an "app" on phones:

### Option 1: Installable Web App (PWA) — Recommended

Your app can be installed directly from the browser to the home screen, just like a real app.

**What it gives you:**
- Works on all phones (iPhone and Android)
- No app store submission needed
- Offline support and fast loading
- Home screen icon, splash screen, full-screen mode

**What needs to be done:**
- Install and configure `vite-plugin-pwa`
- Add a web app manifest (name, icons, theme colors, etc.)
- Add mobile-optimized meta tags to `index.html`
- Create PWA icons (192x192 and 512x512 versions of your logo)
- Ensure the `/~oauth` route is excluded from service worker caching (critical for Google sign-in)
- Optional: Create an `/install` page with instructions for users

**Constraints:**
- Push notifications are limited on iOS Safari
- No access to advanced hardware (NFC, Bluetooth)
- Users install via browser menu, not an app store

**Publishing:** You already have a published URL. Once PWA is configured, users visiting your site on mobile will be prompted to "Add to Home Screen." No app store needed.

---

### Option 2: Native Mobile App (Capacitor)

A real app published to Apple App Store and Google Play.

**What it gives you:**
- Full access to phone features (push notifications, camera, etc.)
- App store presence and discoverability

**What needs to be done:**
- Install Capacitor (`@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`)
- Initialize Capacitor config
- Export project to GitHub, clone locally
- Build and sync with `npx cap sync`
- Run on emulator or device via Xcode (iOS) or Android Studio (Android)
- Submit to Apple App Store ($99/year developer account) and Google Play ($25 one-time)

**Constraints:**
- Requires a Mac with Xcode for iOS builds
- Requires Android Studio for Android builds
- App store review process (Apple can take days)
- Ongoing maintenance for store compliance

---

### Recommendation

**PWA is the fastest, simplest path.** Your app is already a web app with Google OAuth, database, and all features working. A PWA wraps it with offline support and an install prompt — no app stores, no native tooling. Most ed-tech apps in India work great as PWAs.

Go native only if you specifically need push notifications on iOS or app store presence for marketing.

