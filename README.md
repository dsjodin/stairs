# Trappkalkylator

Containerized web app for dimensioning and visualizing stairs. Calculates step geometry, validates against Swedish BBR building code, and renders live SVG visualizations in side-profile and plan views.

---

## Architecture

```
pnpm monorepo
├── packages/
│   └── calc/          Pure calculation logic + Zod types (no UI deps)
└── apps/
    ├── api/           Fastify HTTP API wrapping packages/calc
    └── web/           React + Vite + Tailwind frontend
```

**Two Docker services:**
- `web` - Nginx serving the static frontend on port 8080, proxying `/api/` to the api service
- `api` - Node.js Fastify server on port 3000 (internal only)

---

## Run with Docker

```sh
docker compose up --build
```

App available at http://localhost:8080.

---

## Run locally (development)

Requirements: Node 20+, pnpm 8+

```sh
pnpm install

# Build the shared calc package first
pnpm --filter calc build

# Start API and frontend concurrently
pnpm dev
```

- API: http://localhost:3000
- Frontend: http://localhost:5173 (proxies /api to localhost:3000)

---

## Run tests

```sh
pnpm --filter calc test   # 71 unit tests
pnpm --filter api test    # 4 integration tests
pnpm --filter web test    # 3 snapshot tests
```

E2e tests (requires running docker compose stack):

```sh
pnpm test:e2e
```

---

## API

### POST /api/calculate

Request body:

```json
{
  "type": "straight",
  "style": "closed",
  "totalRise": 2700,
  "desiredStepHeight": 175,
  "desiredStepDepth": 260,
  "stairWidth": 1000,
  "nosing": 20,
  "landingDepth": 1000,
  "wellWidth": 200
}
```

Response:

```json
{
  "numberOfSteps": 16,
  "numberOfTreads": 15,
  "actualStepHeight": 168.75,
  "actualStepDepth": 260,
  "totalRun": 3900,
  "totalFootprint": { "width": 3900, "depth": 1000 },
  "blondelFormula": 597.5,
  "blondelZone": "acceptable",
  "sumRule": 428.75,
  "productRule": 43875,
  "slopeDegrees": 34.7,
  "warnings": [],
  "segments": [...]
}
```

### GET /api/health

```json
{ "status": "ok" }
```

---

## Calculation method

### Step count

```
numberOfSteps = ceil(totalRise / desiredStepHeight)
actualStepHeight = totalRise / numberOfSteps
numberOfTreads = numberOfSteps - 1
totalRun = numberOfTreads * actualStepDepth
```

Using `ceil` ensures the actual step height is always <= the desired height.

### Blondel's Law (ergonomics)

Formulated by Francois Blondel (1675). A comfortable step satisfies:

```
2 * stepHeight + stepDepth = 600-640 mm  (ideal: 620-630 mm)
```

| Zone       | Range (mm)         |
|------------|--------------------|
| Ideal      | 620-630            |
| OK         | 600-640            |
| Acceptable | 580-660            |
| Outside    | < 580 or > 660     |

### BBR checks

Swedish building code validation:
- Riser height <= 175 mm (residential)
- Tread depth >= 250 mm
- Stair width >= 900 mm
- Slope <= 38 degrees
- Landing depth >= max(stairWidth, 900 mm) for L/U stairs

### Segment geometry

The `segments` array describes the 2D layout for SVG rendering:
- `flight` - direction (right/left/up/down), steps, start coords, riser/tread dims
- `landing` - position (x, y) and size (width, depth)

---

## Presets

| Name                    | Type     | Rise  | Width  |
|-------------------------|----------|-------|--------|
| Bostad rak              | straight | 2700  | 900    |
| Villa L-trappa          | L        | 2700  | 1000   |
| Flerbostadshus U-trappa | U        | 2700  | 1200   |

---

## Environment

See `.env.example`:

```
API_PORT=3000
API_HOST=0.0.0.0
```
