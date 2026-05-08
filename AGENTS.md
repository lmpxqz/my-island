# AGENTS.md

## Working Agreement

- Read the closest relevant files before editing, then make the smallest focused
  change that solves the request.
- Prefer existing local patterns, components, and tokens over new abstractions or
  dependencies.
- Ask or propose a short plan when requirements are ambiguous, architectural, or
  likely to touch several areas.

## UI Implementation Protocol

- Before building or changing UI, read `DESIGN.md` and treat it as the source of
  truth for visual style, typography, spacing, radius, color roles, motion, and
  responsive behavior.
- Prefer components from `@repo/ui/components/*` and tokens from
  `@repo/ui/globals.css` before creating app-level styles or new components.
- Import global styles once from `@repo/ui/globals.css`; do not duplicate design
  tokens in app-level CSS.

## Commands

- Use the existing pnpm workspace; do not switch package managers.
- After substantive code changes, run `pnpm verify`.
- For quick checks, run at least `pnpm check` and `pnpm typecheck`.
- For web-only feedback, prefer scoped commands such as
  `pnpm --filter @repo/web test` or `pnpm --filter @repo/web typecheck`.
- Do not install dependencies, push, delete files, or run destructive git
  commands without explicit user approval.
