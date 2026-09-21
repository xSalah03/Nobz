# Nobz

**Play. Analyze. Improve.**

Nobz is a League of Legends player statistics and coaching platform. The current V0.1/P0 implementation provides a responsive Riot ID search flow, a server-side Riot API service layer, ranked profile data, and recent match loading with controlled concurrency and resilient error handling.

## Requirements

- Node.js 22+
- pnpm 11+
- A Riot Games development API key

## Local setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

3. Add your Riot API key to `.env.local`:

```env
RIOT_API_KEY=your_riot_api_key
```

4. Start the development server:

```bash
pnpm dev
```

Never commit `.env.local` or expose `RIOT_API_KEY` in client-side code.

## Quality checks

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

## Current scope

P0 stabilization is complete. The next V0.2 milestone is end-to-end verification with a real EUW account, followed by real match details. Analytics, AI Coach, authentication, Supabase, champion pages, and leaderboards are intentionally out of scope for now.
