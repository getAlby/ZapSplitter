# ZapSplitter

Forward incoming payments to multiple lightning addresses powered by the Alby [Wallet API](https://guides.getalby.com/alby-wallet-api/reference/getting-started)

Try it here: (coming soon)

## Installation

Run `yarn install`

Run `cp .env.example .env.local && husky install`

Run `$ yarn cloak:generate` and set `PRISMA_FIELD_ENCRYPTION_KEY=<CLOAK_MASTER_KEY>` in `.env.local`

Run `yarn db:migrate:deploy` (if developing with Docker make sure to run Run `yarn docker:start` first)

## Development (Docker)

Run `yarn docker:start`

Run `yarn dev`

## Development (local)

Run `yarn dev`

## NextJS

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
