# GitHub Student Developer Pack — plan for this project

Scope note: this file only tracks what touches **this repository**. The pack
contains far more than a portfolio needs, and activating a benefit you will not
use this week is how the good ones expire unused.

## The rule that orders everything

Some benefits last as long as the student verification holds. Others start a
countdown the moment they are claimed. Claim the second group late.

### Safe to claim now — no countdown

They live as long as the pack does, so there is no cost to holding them.

| Benefit | Why it matters here |
| --- | --- |
| GitHub Pro | Already the deploy target; Pages + Actions on private repos |
| Copilot | Editor tooling |
| JetBrains (WebStorm) | Editor tooling |
| Codespaces | Reproducible dev environment for this repo |
| Doppler | Secrets management — see "Secrets" below |
| Sentry | Error reporting — see "Observability" below |
| 1Password, Termius | Personal tooling, unrelated to this repo |
| Datadog (2 years), New Relic, LocalStack | Infrastructure practice, a separate project |

### Claim only when the work is actually scheduled

| Benefit | Clock | Claim when |
| --- | --- | --- |
| InterviewCake | 1 week | Interviews already on the calendar |
| Scrimba | 1 month | Starting an intensive frontend month |
| DataCamp, Boot.dev, Visme, Icons8 | 3 months | Starting that specific project |
| FrontendMasters, Educative, Codedex | 6 months | One at a time, never all three |
| Azure ($100), Heroku ($13/mo) | Credits expire | Something real is ready to deploy |

Leave AlgoExpert, InterviewCake and Educative untouched until an active job
search begins.

## Applies directly to this repository

### Domain

Three free-for-one-year registrations can each be claimed:

- Namecheap — `.me`
- Name.com — `.dev`, `.software`, `.studio`, `.app`
- .TECH — `.tech`

`.me` or `.dev` is the choice for a personal site. GitHub Pages issues its own
HTTPS certificate for a custom domain, so the bundled Namecheap SSL certificate
is not needed here — keep it for something that is not on Pages.

Wiring it up: add a `CNAME` file to the published output and point the registrar
at the Pages IPs, then enable "Enforce HTTPS" in the repository settings.

> Set a calendar reminder for **11 months after registration**. Year two renews
> at list price.

### Contact form — Pageclip

The site is statically hosted and has no backend, which is a deliberate
constraint, not an oversight. Pageclip accepts a form POST and stores the
submission, so a working contact form does not require introducing a server.

It fits behind the existing `ContactChannel` port rather than being wired
directly into a component.

### Images — Imgbot

Runs on push and opens a pull request with losslessly compressed images. The
gain here is modest today because the visual weight of this site is WebGL rather
than bitmaps, but it costs nothing to leave installed and it will matter when
project screenshots are added.

### Analytics — SimpleAnalytics

No cookies, so no consent banner. That matters here beyond privacy preference: a
consent modal is precisely the kind of overlay that would fight a scroll-driven
narrative for control of the viewport.

### Observability — Sentry

Worth wiring for one specific reason. The 3D layer degrades across four quality
tiers on hardware that cannot be reproduced locally. Sentry with the quality tier
attached as a tag turns "it looked wrong on someone's laptop" into a report.

Keep the SDK out of the `static` tier path so a visitor who never downloads the
3D chunk does not download error reporting for it either.

### Secrets — Doppler

There is nothing secret in the build today, and that should be stated rather
than assumed. When Pageclip, SimpleAnalytics and Sentry keys arrive, they belong
in Doppler and in GitHub Actions secrets — not in `.env` files that drift.

### Cross-browser checking — Polypane

Renders several viewport sizes at once. Directly useful for the `compact`
branch in `Stage.tsx`, where a narrow viewport changes both the camera field of
view and its distance.

## Explicitly rejected: migrating to Astro

The general advice to build a portfolio in Astro is sound advice for a
different site. It does not apply here, and the reasons are worth recording so
the question does not get reopened later.

- The stated benefit of Astro for a portfolio is static HTML output. This
  project already ships static HTML with all content in the DOM, which is the
  requirement that the progressive-enhancement rule exists to guarantee.
- The site is a scroll-driven WebGL narrative with a hexagonal domain and a test
  suite that enforces its boundaries. Astro's islands model has nothing to
  offer a single continuous canvas that spans the whole document.
- The cost is total: domain, application, infrastructure and presentation layers
  plus their tests would all be rewritten to reach the same rendered output.

A migration would spend the entire budget of this project to arrive where it
already is.

## Order of work

1. Claim the no-countdown benefits. Register the domain and point it at Pages.
2. Wire the contact form through Pageclip behind the existing port.
3. Add SimpleAnalytics. Install Imgbot.
4. Add Sentry, tagged with quality tier, excluded from the `static` path.
5. Move every key introduced by steps 2-4 into Doppler and Actions secrets.

Steps 2 through 5 each carry a test obligation like any other change in this
repository. The pack supplies services, not an exemption from the architecture.
