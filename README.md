# Wallet UI Starter Kit

[English](./README.md) | [简体中文](./README.zh-CN.md)

## Overview

Wallet UI Starter Kit is a minimal React template for building wallet-like web
experiences with the imToken Design System UI Kit.

It is prepared for imToken's 10th anniversary co-creation program: participants
can clone the template, run the demo, and ask an AI agent to extend the UI while
keeping a consistent baseline quality.

This starter focuses on UI composition. It does not include production wallet
connection, signing, custody, backend, or chain-indexing logic.

## Architecture

```text
.
├── apps/
│   └── web/              # Vite + React demo app
├── packages/
│   └── ui/               # Shared UI components, tokens, and global styles
├── tooling/
│   └── tsconfig/         # Shared TypeScript configuration
├── DESIGN.md             # Design rules and component guidance
└── AGENTS.md             # Instructions for AI coding agents
```

## Quick Start

Clone it locally:

```bash
git clone https://github.com/consenlabs/token-ui.git your-project-name
cd your-project-name
```

Install dependencies and start the demo app:

```bash
pnpm install
pnpm dev
```

Open the local URL printed by Vite. The demo imports the UI Kit from
`@repo/ui` and uses mock wallet data only.

Useful commands:

```bash
pnpm build
pnpm typecheck
pnpm check
pnpm verify
```

## Prerequisites

- Node.js `>=22.12.0`
- pnpm `10.33.0`

## Use the UI Kit

Import global styles once in your app entry:

```tsx
import '@repo/ui/globals.css'
```

Import components directly from `@repo/ui/components/*`:

```tsx
import { Button } from '@repo/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card'
```

Toast usage requires both the `Toaster` host and the `toast` helper:

```tsx
import { Toaster } from '@repo/ui/components/sonner'
import { toast } from '@repo/ui/components/toast'

toast.success('Ready')
```

Before changing visual details, read `DESIGN.md` and prefer existing tokens,
spacing, radius, and component variants.

## AI-Assisted Development

This repository includes `AGENTS.md` with project instructions for AI coding
agents. If your tool does not read agent instruction files automatically, ask the
agent to read `AGENTS.md` before making changes.

## License

MIT
