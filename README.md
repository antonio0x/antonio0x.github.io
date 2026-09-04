# Antonio Quintanilla — Personal Portfolio

A narrative portfolio built as a 3D network. Scrolling travels a constellation of
nodes that assembles itself chapter by chapter: education, training, roles,
stack, the configured environment, projects, what comes next, contact.

The metaphor is not decoration. The author is a Computer Systems and Networks
engineer, so the site is shaped like the thing he studied.

## The one rule that shapes everything

> **The 3D layer is progressive enhancement. It never carries content.**

The site is authored as semantic HTML first — real sections, real headings, real
links — and the WebGL scene is painted behind it. That single decision covers
four problems that are usually solved separately:

| Problem | How this solves it |
| --- | --- |
| SEO | Every word is in the DOM, plus JSON-LD `Person` structured data |
| Screen readers | Proper document outline; the canvas is `aria-hidden` |
| No WebGL | The canvas is never mounted, and its chunk never downloads |
| `prefers-reduced-motion` | Same path: quality tier resolves to `static` |

There is no separate "accessible version" to keep in sync. There is one site
that degrades with dignity.

## Stack

| Concern | Choice |
| --- | --- |
| Build | Vite 8, TypeScript 6 |
| UI | React 19 |
| 3D | three, @react-three/fiber, @react-three/postprocessing |
| Scroll | GSAP ScrollTrigger |
| State | zustand |
| Styles | Tailwind CSS 4 |
| Tests | Vitest, Testing Library |
| Hosting | GitHub Pages via Actions |

TypeScript is pinned to 6.0.x rather than 7.x because `typescript-eslint`
declares a peer range of `>=4.8.4 <6.1.0`. Newest is not the same as supported.

## Architecture

Hexagonal, with the dependency rule enforced by the linter rather than by good
intentions. `eslint.config.js` makes an inward-pointing import a build failure:

- `src/domain/**` may not import React, Three.js, GSAP, zustand, or any outer layer.
- `src/application/**` depends on ports, never on concrete adapters.
- `src/presentation/components/**` may not reach for stores or repositories — a
  presentational component that fetches its own data cannot be rendered from a
  fixture, and one that cannot be rendered from a fixture never gets tested.

```
src/
├── domain/            TypeScript only. Knows no framework.
│   ├── narrative/     Journey (aggregate root), Chapter, NarrativeNode, Edge
│   ├── profile/       Profile, Experience, Education, Skill, Period, ContactChannel
│   ├── projects/      Project
│   └── ports/         Interfaces the domain needs from the outside world
├── application/       Use cases: BuildJourney, LoadPortfolio
├── infrastructure/    Adapters: JSON content, helix layout, composition root
└── presentation/      React, R3F, GSAP — the only layer that knows they exist
content/               The CV and project copy, per locale
```

### Patterns, and what each one is actually for

- **Ports & Adapters** — `ProfileRepository` is an interface in the domain. Today
  it reads bundled JSON; moving to a CMS would not change a line of the domain.
- **Aggregate Root** — nothing outside `Journey` may assemble chapters, nodes and
  edges. That is what lets its invariants hold: an orphan edge is not a rendering
  bug to chase later, it is a `Journey` that was never constructed.
- **Strategy** — `GraphLayoutService`. `HelixGraphLayout` ships; a force-directed
  layout could replace it without the scene components noticing.
- **Container / Presentational** — every id-to-entity lookup happens in a
  container, so organisms take props and nothing else.
- **Composition Root** — `infrastructure/di/container.ts` is the only file that
  chooses concrete adapters.

### The decision that prevents the classic 3D-scroll bug

**GSAP never touches a Three.js object.** It animates exactly one number:
`progress`, between 0 and 1, written into the zustand store. `CameraRig` reads
that number inside R3F's own `useFrame` and does the interpolation itself.

Two libraries both want to own the render loop. The moment they both write to
the same `position.x` you get jitter that only reproduces on someone else's
machine. One writer, one scalar, no contention — and the scroll logic becomes
testable without a WebGL context.

## Performance

Quality is chosen from device capability and adjusted live.

| Tier | Chosen when | Effect |
| --- | --- | --- |
| `high` | Desktop, 8+ cores, ample memory | Full DPR, bloom, packet traffic |
| `medium` | Modest desktop or a fast tablet | Reduced DPR, fewer packets |
| `low` | Few cores, low memory, or Save-Data | No post-processing, DPR 1 |
| `static` | No WebGL **or** reduced motion | No canvas, no 3D download |

`PerformanceGuard` watches the frame rate and drops one tier if it cannot hold —
ignoring the first second, since shader compilation makes every device look slow
at startup.

The 3D stack is behind a dynamic import. It is roughly 880 kB of Three.js, and
only devices that will actually render it ever pay for it.

## Running it

```bash
pnpm install
pnpm dev            # http://localhost:5173
pnpm test           # unit, integration and safety-floor tests
pnpm test:coverage  # domain and application are held to 90%
pnpm lint           # includes the architecture boundary rules
pnpm typecheck
pnpm build
```

## Editing the content

Everything the site says lives in `content/`:

- `profile.es.json` / `profile.en.json` — the CV, the portrait and the setup
- `projects.json` — curated projects, both locales
- `journey.json` — the prose for each chapter

The `setup` block is the "workshop" chapter: the distro, shell, multiplexer and
editor the author actually works in, each with the reason it was chosen. It is
its own entity rather than another skill because it answers a different
question — a skill says what someone can do, a setup item says what they chose
and why, which is why the note is required rather than optional.

The `portrait` block carries intrinsic `width` and `height`. Those are not
styling: they are what lets the browser reserve the box before the image
arrives, so the text underneath does not jump. The modern encoding is named
explicitly rather than derived from the fallback's filename, because guessing a
`.webp` sibling produces a silent 404 the day an asset is renamed.

These are validated by the domain at load time, and
`src/infrastructure/content/realContent.test.ts` runs those invariants against
the real files in CI. A skill id that does not exist, a contact link that will
not open, an education entry whose status contradicts its dates — all fail the
build rather than the visitor.

Projects are curated by hand rather than pulled from the GitHub API. A generated
list ranks by commit date; a portfolio ranks by what the author is willing to be
judged on.

## Deployment

Pushing to `main` builds and publishes to GitHub Pages. For a project site
rather than a user site, set the repository variable `VITE_BASE` to
`/<repo-name>/`.
