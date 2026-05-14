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

## Security Protocol

This repository is a UI starter kit. It must never handle real custody-grade
material. The following are hard red lines; do not cross them without explicit,
written user approval.

### Secrets (private keys, mnemonics, passwords)

- Never write, read, generate, derive, decrypt, persist, or transmit private
  keys, mnemonics/seed phrases, keystore JSON, wallet passwords, or any other
  secret material in this codebase.
- Do not add inputs, forms, storage (localStorage, IndexedDB, cookies),
  clipboard handlers, logs, telemetry, or network requests that accept or move
  such secrets, even as a "demo" or "placeholder".
- Treat any value that looks like a secret in tests/fixtures as a smell; use
  obvious mock strings (for example `0xMOCK...`) and document them as
  non-functional.

### Signing and on-chain actions

- Do not implement real transaction signing, message signing (`personal_sign`,
  EIP-712, and similar), broadcasting, or RPC calls to live networks.
- Do not integrate real wallet providers (WalletConnect, injected providers,
  hardware wallet SDKs) or signing libraries (`ethers`, `viem`, `web3.js`,
  `bitcoinjs`, and similar) into this template; keep all wallet interactions
  UI-only with mock data.
- If a feature appears to require signing, stop and propose a plan instead of
  silently wiring it up.

### Third-party dependencies

- Do not install, upgrade, downgrade, or replace dependencies (including
  transitive pinning, `resolutions`, `overrides`, or new `package.json`
  entries) without explicit user approval, per the Commands section.
- Before proposing a new dependency, prefer `@repo/ui/components/*` and
  existing libraries already in `package.json` or `pnpm-lock.yaml`.
- When a new dependency is genuinely needed, justify it with: source
  (publisher and repo), maintenance status, license, install size, and
  security posture. Avoid packages that touch cryptography, key material, or
  network egress unless explicitly scoped by the user.
- Never run post-install scripts, fetch remote code at build/runtime, or pipe
  `curl | sh`-style installers from agent actions.

### Data egress and privacy

- Do not add analytics, error reporting, or any outbound network calls to
  third-party services that were not already configured in the repo.
- Do not transmit user input, addresses, balances, or device data off-device;
  this template runs locally against mock data only.
