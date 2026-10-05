# Life OS

A mobile-first personal dashboard for daily routines, health, focus, habits, and spending. It stores each day's information in the browser's LocalStorage, so no account or backend is required.

## Health-inspired redesign

- Summary, Daily, Trends and Settings views with AMOLED dark and light themes.
- Editable daily water, sleep and meal goals, focus duration, name and currency.
- Add or rename habits; hide and reorder favourite cards.
- Trends for water, sleep, workouts, meals, spending, habits and completed focus minutes over 7, 30 and 90 days.
- Tap chart bars or daily records to inspect and correct entries. Missing days are excluded from averages, while explicitly logged zero values are included.
- Existing `life-os-v1` entries are migrated in place. Older automatic sleep and mood defaults are preserved and disclosed in Trends.
- Habit percentages use the target list saved for each logged day. Removed habit records are retained.
- Focus uses an end timestamp, persists across reloads and saves completed minutes to the session's start date.
- Settings provides a JSON export of all entries and preferences. This is a manual tracker, with no Apple Health integration or cross-device sync. Clearing browser storage removes entries; keep an exported backup.

## Verify

```bash
npm test
npm run build
```

## Deploy

The included GitHub Actions workflow tests, builds and publishes `dist` on pushes to `main`. In repository Settings → Pages, select GitHub Actions. Vite uses relative asset paths for project Pages URLs.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
