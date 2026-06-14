# Project Notes

## App
- Nuxt app for the Tam Quốc Chí Chiến Lược Anh Hùng Mệnh Thế guide.
- Use `yarn` for all package and script commands.
- Local dev server normally runs at `http://127.0.0.1:4321/`.
- Production deploy uses PM2 app `sgk-tlh` on port `3006`.
- The production domain is `mua18.thanglonghoi.xyz`.

## Data
- The guide data is loaded through `server/api/season-guide.get.ts`.
- The M18 season team list is fetched from Google Apps Script with `mode=seasons&kind=m18_teams`; metadata-only `mode=seasons` must not be used as the M18 team payload.
- Khai hoang data is loaded through `server/api/khai-hoang.get.ts`, which proxies Google Apps Script `mode=khai-hoang&kind=doi-hinh` and `mode=khai-hoang&kind=cham-su`.
- Frontend data calls use `app/composables/useApiData.ts`, a small `useFetch` wrapper with explicit keys and `getCachedData` from Nuxt payload/static data so revisiting a route can reuse cached data instead of refetching immediately.
- There is no team-detail server route; the drawer reads team builds and lineup directly from the main season payload.
- The server route expects the Google Apps Script season API to return `settings`, `seasons`, and all teams from the current clustered sheet schema. Team rows use `Phe`, `Binh chủng`, `Thẻ`, `Bái sư Đô Úy`, `Phân tích`, `Phản biện`, and `Ghi chú`; legacy crawl confidence fields are not shown as badges.
- Team detail drawer reads from the selected team in the list payload. Do not add a client-side team-detail fetch unless the spreadsheet contract changes again.
- `settings.updating` controls the frontend update-state screen while the spreadsheet schema or guide data is being revised. When it is true, the main guide content is not rendered.
- `settings.notice` shows an optional notice above the team list. Leave it empty to hide the notice.
- Production route rules use `swr: 30` for `/`, `/api/season-guide`, and `/api/season-guide/*` so Google Sheet edits settle quickly.

## Theme And Layout
- Nuxt UI primary color defaults to red and persists in `localStorage` under `thang-long-primary-color`.
- If `localStorage` contains a saved primary color, `app/app.vue` injects a head preflight style that maps Nuxt UI `--ui-color-primary-*` variables with OKLCH fallbacks before paint; `app/plugins/00-theme.ts` then syncs Nuxt UI app config and the same style element after hydration.
- `app/plugins/00-theme.ts` provides `$primaryColor` and updates Nuxt UI through `updateAppConfig`.
- Nuxt UI owns the `--ui-color-primary-*` and `--ui-primary` tokens. Any primary-color preflight must override those Nuxt UI variables directly instead of adding parallel color state.
- The app shell uses a fixed header, sticky left season sidebar, main content list, and a slideover drawer for team details.
- Mobile navigation is owned by `app/app.vue`: the header menu button opens the shared `SeasonSidebar` slideover for every page. Individual pages render only the desktop sticky sidebar and must not add local mobile menu buttons or local menu slideovers.

## Team List
- Team rows use `div role="button"` instead of `<button>` because each row contains a real share `UButton`; nested buttons break browser DOM layout.
- Season detail routes use `/seasons/:season/:team?` through `app/pages/seasons/[season]/[[team]].vue`. The page key is the season slug, so changing only the team param opens the drawer without remounting the team list or resetting search/filter state.
- Opening a team detail from the list uses router push so browser Back returns to the list. Closing the drawer uses router replace so Back does not reopen the closed detail.
- Team list rows should stay compact: rank, team name, tier, three general names, and share action. Detailed tactics, battle books, attributes, mentor, and notes belong in the drawer.
- Team country, troop, and tag badges come only from `factions`, `troopTypes`, and `tags`; country and troop colors are fixed in `app/utils/team-badges.ts` and must not follow the page primary color.
- Team `analysisItems`, `objectionItems`, and notes are newline-split lists shown in the drawer only when present. The drawer order is builds, analysis, objections, then notes.

## Deployment
- GitHub Actions deploys from `main` using `.github/workflows/deploy.yml`.
- Required repository secrets are `VPS_HOST`, `VPS_USER`, and `SSH_PRIVATE_KEY`.
- The deploy workflow syncs source to `/apps/sgk-tlh`, builds with `yarn`, restarts PM2, configures nginx, and requests HTTPS with certbot when DNS resolves to the VPS.
