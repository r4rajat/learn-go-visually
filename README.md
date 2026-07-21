# Learn Go, Visually

An interactive, visual introduction to the Go programming language, built as a static
site for GitHub Pages. Every topic is taught three ways at once: a plain-English
explanation, an interactive visual you can click through at your own pace, and a real
Go code example.

## Current scope

All six sections in the homepage roadmap are built end to end:

- **Basics** (`basics.html`) — Hello Go, variables & types, control flow, functions
- **Core** (`core.html`) — structs & methods, slices & maps, interfaces, error handling
- **Concurrency** (`concurrency.html`) — goroutines, unbuffered channels, buffered
  channels, closing channels, `select`
- **Advanced** (`advanced.html`) — generics, context, testing
- **Operators** (`operators.html`) — building a real Kubernetes operator in Go end to
  end: CRD design, the reconcile loop, owner references, finalizers, testing with
  envtest, and a genuine deployment to a real `kind` cluster

Not every topic gets the same depth of custom interactive visualization — Concurrency
and a few core-type gotchas (slices, structs, the nil-interface trap, context
cancellation, the operator reconcile loop and owner-reference GC) have purpose-built
animated diagrams because a visual genuinely clarifies those specific behaviors; more
procedural topics (hello world, control flow, testing) lean on clean code-first
treatment instead of a forced animation. Every topic, without exception, has real
verified code, real captured output, and (except Testing — see below) a working
Playground link.

**Operators is verified differently from everything else on this site**, since a
Kubernetes operator can't be proven with just `go run`. It was checked at three
increasing levels of realism: the Go code compiles and passes `go vet` against the real
current controller-runtime v0.24.1 API; the reconciler's actual logic was proven against
a real embedded Kubernetes API server (`envtest` — genuine `kube-apiserver` and `etcd`
processes, but no kubelet or controller-manager); and anything that specifically
requires those missing pieces (real running Pods, real cascading garbage collection on
delete) was verified separately against an actual `kind` cluster created for this page,
with the exact `kubectl` output captured. The page states plainly which claims rest on
which of the three.

## Accuracy methodology

Every code example on every page was actually compiled and run against a real Go 1.26
toolchain, not just described — including deliberately triggering the deadlock, the two
panics, and the nil-map-write panic to capture their exact runtime text verbatim, and
running the loop-variable-capture example five times in a row to empirically confirm
Go 1.22's per-iteration variable semantics rather than just citing the release notes.
Every non-code factual claim (spec language on slices/receivers/maps/interfaces,
the Go 1.13 error-wrapping and Go 1.18 generics/Go 1.22 loop-variable version history,
context cancellation propagation) was independently re-verified against the live
go.dev/ref/spec, go.dev blog, and pkg.go.dev sources by a dedicated adversarial pass
before publishing, specifically hunting for anything false, stale, or misquoted.

## Why there's no in-page "Run" button

Tour of Go and the Go blog have live "Run" buttons because they're served from `go.dev`
itself, so their JavaScript can call `go.dev/_/compile` same-origin. A GitHub
Pages site is a different origin, and testing directly against the real endpoints
confirmed two things: `go.dev/_/compile` sends no CORS headers for cross-origin callers,
and `go.dev/play/` pages send `Content-Security-Policy: frame-ancestors 'self'`, which
blocks embedding them in an iframe from any other domain too. Both are hard,
browser-enforced blocks, not something a static site can route around.

Instead, each code example here shows its real, pre-verified output inline, plus an
"Open in Go Playground" link to a permanent `go.dev/play/p/<hash>` snippet (created via
the public share API) where anyone can edit and actually run it live.

**Note on the share API:** it requires `Content-Type: text/plain` on the POST body.
Sending it with curl's default `application/x-www-form-urlencoded` content type (e.g.
plain `curl --data-binary @file.go ...`) gets a 200 response back, but the stored
snippet renders as mangled percent-encoded text instead of source code. Always set the
header explicitly:
```
curl -X POST -H "Content-Type: text/plain; charset=utf-8" --data-binary @file.go https://go.dev/_/share
```

### Possible future upgrades for live execution
- **A small backend proxy** (e.g. a Cloudflare Worker) that adds proper CORS headers in
  front of `go.dev/_/compile` — closest to a real in-page Run button, but means the
  project is no longer purely static.
- **Yaegi** (`github.com/traefik/yaegi`), a real Go interpreter whose source tree
  includes `js/wasm`-targeted build files — could plausibly run arbitrary user-typed Go
  fully client-side with no backend, at the cost of being an interpreter rather than the
  real toolchain (some stdlib/reflect/unsafe behavior differs from compiled Go). Neither
  option is built here yet.

## Running locally

No build step. From this directory:
```
python3 -m http.server 8000
```
Then open `http://localhost:8000/index.html`.

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. In the repo's Settings → Pages, set Source to "Deploy from a branch", branch `main`,
   folder `/ (root)`.
3. The site will publish at `https://<your-username>.github.io/<repo-name>/`.

## Structure

```
index.html              Home page / topic roadmap
basics.html             Hello Go, variables & types, control flow, functions
core.html               Structs & methods, slices & maps, interfaces, error handling
concurrency.html        Goroutines, channels, buffered channels, closing channels, select
advanced.html           Generics, context, testing
operators.html          Building a Kubernetes operator in Go, end to end
assets/css/style.css    Design system (design tokens, light/dark mode, components)
assets/js/theme.js      Light/dark mode toggle (persisted in localStorage)
assets/js/basics.js     Basics page interactive visuals
assets/js/core.js       Core page interactive visuals
assets/js/visuals.js    Concurrency page interactive visuals
assets/js/advanced.js   Advanced page interactive visuals
assets/js/operators.js  Operators page interactive visuals
```
