# Learn Go, Visually — Project Guide

## Overview

An interactive, visual Go learning website — a pure static site (no build step, no
dependencies) deployed on GitHub Pages. Every Go code example is verified against a real
Go 1.26 toolchain before publishing.

**Domain:** `https://learn-go.r4rajat.com`
**Repository:** `github.com/r4rajat/learn-go-visually`
**Author:** r4rajat (Rajat Gupta) — hello@r4rajat.com
**Deployment:** GitHub Pages from `main` branch, root directory

## Architecture

Zero build step. No npm, no package.json, no bundler, no framework, no Go toolchain
needed to build the site itself (Go is only used for verifying code examples).

```
index.html              Home page / topic roadmap
basics.html             Hello Go, variables & types, control flow, functions
core.html               Structs & methods, slices & maps, interfaces, errors
concurrency.html        Goroutines, channels, buffered channels, closing channels, select
advanced.html           Generics, context, testing
operators.html          Building a Kubernetes operator in Go, end to end

assets/css/style.css    Full design system (design tokens, light/dark, components, responsive)
assets/js/theme.js      Light/dark mode toggle with localStorage persistence
assets/js/basics.js     Basics page interactive visuals
assets/js/core.js       Core page interactive visuals
assets/js/visuals.js    Concurrency page interactive visuals
assets/js/advanced.js   Advanced page interactive visuals
assets/js/operators.js  Operators page interactive visuals
```

## Code Conventions

### HTML
- HTML5 `<!doctype html>`, UTF-8, viewport meta tag
- Consistent `<header>` with site nav across all pages — active page gets `.active` class
- Every page has `<footer class="site-footer">` with a verification attestation
- Content layout: `.page` (narrow, max-width 780px) for home, `.page-wide` (max-width 980px)
  for content pages
- Each topic section: optional `.viz` (interactive visual) + `.code-panel` (Go code) +
  optional `.callout` (tips/mistakes)
- Go syntax highlighting via manual `<span class="tok-*">` tags:
  `tok-kw` (keywords), `tok-str` (strings), `tok-com` (comments),
  `tok-fn` (functions), `tok-type` (types)
- All code panels have "Open in Go Playground" links to `go.dev/play/p/<hash>`
- Code output shown inline in `<div class="code-output show">`
- Error output gets additional `.is-error` class
- Every page loads `assets/js/theme.js` in the footer; content pages also load their page-
  specific JS file

### CSS
- Design tokens via CSS custom properties on `:root`/`:root[data-theme="dark"]`
- Dark mode: `data-theme="dark"` attribute on `<html>`, with `prefers-color-scheme: dark`
  media query fallback
- Key color: `--gopher-cyan: #00acd7` (Go brand color, used for primary buttons, accent fills)
- Mobile-responsive: `@media (max-width: 640px)` breakpoint at end of stylesheet
- Components: `.viz` (interactive visual shell), `.code-panel` (code block),
  `.callout-*` (tip/mistake/ok), `.btn`/`.btn-primary`, `.roadmap-*` (home page)
- Transitions on `background-color 0.15s ease, color 0.15s ease` for smooth theme switching
- Box shadows use `--shadow` / `--shadow-lg` variables

### JavaScript
- **ES5-compatible style**: uses `var`, `function` expressions, no `const`/`let`/arrow
  functions — works without transpilation on all modern browsers
- Pattern: `function init*Viz(root)` takes a `.viz` container element, sets up DOM event
  listeners internally
- Wired up on `DOMContentLoaded` via:
  ```js
  document.querySelectorAll('[data-viz="viz-name"]').forEach(initVizFunction);
  ```
- `theme.js` is a self-contained IIFE, not an init-function pattern
- No ES modules, no bundling, no import/export — all functions are global
- Event listeners use `addEventListener`, never inline `onclick` attributes
- Animation: uses `setTimeout`/`requestAnimationFrame`, CSS transitions, and class
  toggling — never raw CSS-in-JS or imperative style manipulation beyond `transition`
  resets
- Captions rendered via `innerHTML` on `[data-role="caption"]` elements

### Interactive Visuals Pattern
Each `.viz` block uses a `data-viz="...` attribute to identify the visual type:
- `data-viz="hello-anno"` — annotation click-through
- `data-viz="type-zero"` — zero value toggle
- `data-viz="loop-step"` — for-loop step-through
- `data-viz="fn-flow"` — function call animation
- `data-viz="struct-receiver"` — value vs pointer receiver
- `data-viz="slice-header"` — shared backing array
- `data-viz="interface-nil"` — nil interface gotcha
- `data-viz="goroutines"` — sequential vs concurrent comparison
- `data-viz="unbuffered"` — channel handshake
- `data-viz="buffered"` — buffered channel queue
- `data-viz="select"` — channel multiplexing
- `data-viz="generics-sub"` — generic type substitution
- `data-viz="ctx-tree"` — context cancellation tree
- `data-viz="recon-loop"` — operator reconcile loop
- `data-viz="owner-tree"` — GC cascading deletion

## Content Standards

- Every code example is compiled and run against Go 1.26 before publishing
- Code output is the real, captured stdout — never fabricated
- Deliberately triggered runtime errors (panics, deadlocks) have their exact error text
  captured verbatim
- FAQ items are `.callout-mistake` or `.callout-tip`
- The "Open in Go Playground" links are permanent go.dev/play/p/ snippets created via
  the public share API at `https://go.dev/_/share`
- Operators page has a 3-tier verification methodology (compile, envtest, kind cluster)

### No "Run" Button
The site has no live "Run" button because:
- `go.dev/_/compile` sends no CORS headers for cross-origin calls
- `go.dev/play/` pages send `Content-Security-Policy: frame-ancestors 'self'`
  (can't embed in iframe)
- Both are hard browser-enforced blocks, not workaroundable from a static site

## Running Locally

```sh
python3 -m http.server 8000
# Open http://localhost:8000/index.html
```

No build step, no npm install needed.

## Deployment

GitHub Pages: Settings → Pages → Source: "Deploy from a branch", branch `main`,
folder `/ (root)`. Custom domain `learn-go.r4rajat.com` configured via `CNAME` file.

## Git Conventions

- Branch from `main`, PR into `main`
- Signed off with `-s` (DCO)
- Co-authored-by footer in commit messages
- No AI tool names in commits

## Versioning / Go Target

- Site targets Go 1.26 for all code examples
- Operators page targets controller-runtime v0.24.1, Kubebuilder v4.15.0
- All tool versions, API signatures, and marker-comments verified against their real
  current documentation before use
