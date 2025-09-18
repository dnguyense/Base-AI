# CI/CD Pipeline Specification

## Triggering Events
- `push` to `main` and `develop` branches.
- `pull_request` targeting `main` and `develop`.
- Performance tests only run when pushing to `main`.

## Stages and Dependencies
1. `lint-and-test` (matrix Node.js 18 & 20)
   - Spins up Postgres service
   - Installs dependencies for server/client/e2e
   - Lints (`npm run lint`)
   - Type-checks (`npm run type-check`)
   - Server/client unit tests
   - Builds server + client
   - Server integration tests
   - Boots server/client for Playwright e2e
   - Runs Playwright suite, uploads artifacts

2. `security-scan`
   - npm audits for server/client
   - GitHub CodeQL analysis

3. `build-and-deploy`
   - Depends on `lint-and-test` + `security-scan`
   - Only on push to `main`
   - Installs prod deps, builds server/client
   - Preps deployment artifact (server dist, client build, package.jsons, node_modules)
   - Uploads artifact (deployment step stubbed for future use)

4. `performance-test`
   - Depends on `lint-and-test`
   - Only on `main`
   - Builds server/client, runs k6 load test against local server/client

5. `notify`
   - Depends on `lint-and-test`, `security-scan`, `build-and-deploy`
   - Always runs, prints ✅/❌ (replace with Slack/etc. later)

## Artifacts
- Unit/integration/e2e coverage reports
- Playwright reports on failure
- Deployment artifact (server dist + client build + node_modules)

## Environments
- Utilizes Postgres service via GitHub runner service containers
- e2e runs expect `/api/health`, `/` to be ready (uses `wait-on`)

## To Do / Enhancements
- Add caching for Playwright browsers
- Add Docker image build & publish
- Hook `notify` steps to Slack/Teams
- Replace npm audit with `npm audit --json` + upload results
- Introduce staging deployment branch flow
