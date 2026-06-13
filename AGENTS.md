# Project Notes

## App
- Nuxt app for the Tam Quốc Chí Chiến Lược Anh Hùng Mệnh Thế guide.
- Use `yarn` for all package and script commands.
- Local dev server normally runs at `http://127.0.0.1:4321/`.
- Production deploy uses PM2 app `sgk-tlh` on port `3006`.
- The production domain is `mua18.thanglonghoi.xyz`.

## Data
- The guide data is loaded through `server/api/season-guide.get.ts`.
- The server route expects Google Apps Script API v3: `GET /exec?season=<slug>` returns settings, seasons, active season, and all teams with `builds` and `lineup` already included.
- Team detail drawer reads from the selected team in the list payload. Do not add a client-side team-detail fetch unless the spreadsheet contract changes again.
- `settings.updating` controls the frontend update-state screen while the spreadsheet schema or guide data is being revised. When it is true, the main guide content is not rendered.
- `settings.notice` shows an optional notice above the team list. Leave it empty to hide the notice.
- Production route rules use `swr: 30` for `/`, `/api/season-guide`, and `/api/season-guide/*` so Google Sheet edits settle quickly.

## Theme And Layout
- Nuxt UI primary color defaults to red and persists in the `thang-long-primary-color` cookie, with `localStorage` written as a client-side mirror.
- `app/plugins/00-theme.ts` provides `$primaryColor` and updates Nuxt UI through `updateAppConfig`.
- Nuxt UI owns the `--ui-color-primary-*` and `--ui-primary` tokens. Do not add separate style tags or CSS variable overrides for primary colors because they conflict with Nuxt UI's light/dark token generation.
- The app shell uses a fixed header, sticky left season sidebar, main content list, and a slideover drawer for team details.

## Team List
- Team rows use `div role="button"` instead of `<button>` because each row contains a real share `UButton`; nested buttons break browser DOM layout.
- Team detail state is stored in the `team` query param so refresh keeps the selected drawer open.
- Team list rows should stay compact: rank, team name, tier, three general names, and share action. Detailed tactics, battle books, attributes, mentor, and notes belong in the drawer.

## Deployment
- GitHub Actions deploys from `main` using `.github/workflows/deploy.yml`.
- Required repository secrets are `VPS_HOST`, `VPS_USER`, and `SSH_PRIVATE_KEY`.
- The deploy workflow syncs source to `/apps/sgk-tlh`, builds with `yarn`, restarts PM2, configures nginx, and requests HTTPS with certbot when DNS resolves to the VPS.
