# Asset Hub v2 architecture

Asset Hub keeps the existing React UX while domain ownership moves to specialized self-hosted applications.

## Runtime

```text
Browser
  |
  v
Asset Hub (React static + thin Node BFF)
  |             |              |
  v             v              v
Sure        NutriTrace      LiftTrace
finance     nutrition       workout
```

Grafana and Queqiao are not runtime dependencies. Queqiao may still call the domain applications directly for AI-assisted workflows.

## BFF responsibility

The BFF is a compatibility and integration layer, not a source of truth. It:

- keeps the current `/api/trans/*`, `/api/meal/*`, and `/api/exercise/*` frontend contracts;
- holds server-side domain credentials so they never reach the browser;
- maps native domain records into the existing Asset UI record shapes;
- combines LiftTrace workout structure with NutriTrace calorie projections.

It must not introduce a canonical record database.

## First-run setup

1. Start the domain services with `docker compose up -d sure-db sure-redis sure-web sure-worker nutritrace lifttrace`.
2. Complete the normal first-run setup in Sure, NutriTrace and LiftTrace.
3. In Sure, create a read/write API key and select the account Asset Hub should use for manually created transactions.
4. Put that key/account ID in `.env`. If TraceApps user management is enabled, also set the local usernames/passwords. Leave them blank for TraceApps single-user mode.
5. Start Asset Hub with `docker compose up -d app`.

## Known upstream limitation

NutriTrace currently exposes workout projection upsert but no projection delete/tombstone endpoint. Asset Hub therefore refuses to delete a LiftTrace record while a corresponding NutriTrace kcal projection exists, returning HTTP 409 rather than leaving the two sources inconsistent.
