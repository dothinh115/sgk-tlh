# Project Notes

## App
- Nuxt app for the Tam Quốc Chí Chiến Lược Anh Hùng Mệnh Thế guide.
- Use `yarn` for all package and script commands.
- Local dev server normally runs at `http://127.0.0.1:4321/`.
- Production deploy uses PM2 app `sgk-tlh` on port `3006`.
- The production domain is `sgk.enfyra.io`.

## Data
- The guide data is loaded through `server/api/season-guide.get.ts`.
- The server route expects Google Apps Script API v2: `GET /exec` returns settings, seasons, active season, and a lightweight team list.
- `settings.updating` controls the frontend update-state banner while the spreadsheet schema or guide data is being revised.
- `/api/season-guide` uses short SWR caching for data refresh.

## Theme And Layout
- Nuxt UI primary color defaults to red and persists in `localStorage` under `thang-long-primary-color`.
- `app/plugins/00-theme.ts` provides `$primaryColor` and updates Nuxt UI through `updateAppConfig`.
- Nuxt UI owns the `--ui-color-primary-*` and `--ui-primary` tokens. Do not add separate style tags or CSS variable overrides for primary colors because they conflict with Nuxt UI's light/dark token generation.
- The app shell uses a fixed header, sticky left season sidebar, main content list, and a slideover drawer for team details.

## Team List
- Team rows use `div role="button"` instead of `<button>` because each row contains a real share `UButton`; nested buttons break browser DOM layout.
- Team detail state is stored in the `team` query param so refresh keeps the selected drawer open.

## Deployment
- GitHub Actions deploys from `main` using `.github/workflows/deploy.yml`.
- Required repository secrets are `VPS_HOST`, `VPS_USER`, and `SSH_PRIVATE_KEY`.
- The deploy workflow syncs source to `/apps/sgk-tlh`, builds with `yarn`, restarts PM2, configures nginx, and requests HTTPS with certbot when DNS resolves to the VPS.
