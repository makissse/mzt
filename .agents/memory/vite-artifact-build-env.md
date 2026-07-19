---
name: Vite artifact build environment variables
description: Why Vite artifact build scripts need PORT and BASE_PATH set for the monorepo build to succeed.
---

Vite artifacts in this project read `PORT` and `BASE_PATH` from the environment at config-load time. If the `build` script does not set them, `pnpm run build` at the workspace root fails with a missing env error.

**Why:** The Vite config validates both variables up front and throws if they are absent. The dev workflow sets them, but the build workflow (used by `pnpm -r --if-present run build`) invokes the package's `build` script directly, so the script must inline the defaults.

**How to apply:**
- Update each Vite artifact's `build` script to something like `PORT=<port> BASE_PATH=/ vite build --config vite.config.ts`.
- Choose a port that will not collide with other artifacts or the production port; it is only used during the build step.
- Keep the `dev` script unchanged so it continues to receive the env vars from the workflow.
