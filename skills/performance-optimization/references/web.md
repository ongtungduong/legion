# Web front-end performance

Read this only for browser-facing work: page load, interaction latency,
layout shift, bundle size, rendering.

## Targets (Core Web Vitals, p75 of real users)

| Metric | Good | Poor |
|---|---|---|
| LCP (Largest Contentful Paint) | <= 2.5 s | > 4.0 s |
| INP (Interaction to Next Paint) | <= 200 ms | > 500 ms |
| CLS (Cumulative Layout Shift) | <= 0.1 | > 0.25 |

Field data (real users: the `web-vitals` library, CrUX) and lab data (one
synthetic run: Lighthouse, a DevTools trace) are different sources. Label
each number with which one it is; a lab run does not prove a field gain.

## Where to measure first

- Slow first load: measure TTFB in the network waterfall. Long server wait
  -> profile the backend; render-blocking CSS or JS -> defer or inline the
  critical part; large bundle -> measure it.
- Sluggish interaction: record a performance trace and look for long tasks
  (over 50 ms) on the main thread.
- Layout shift: read the layout-shift attribution in the trace.
- Slow page after navigation: look for request waterfalls and per-item
  fetches (the front-end N+1).

## Usual fixes

- **Images:** every image declares `width` and `height`; the LCP image gets
  `fetchpriority="high"` and is never lazy; others get `loading="lazy"` and
  `decoding="async"`; serve AVIF or WebP with `srcset` and `sizes`.
- **JavaScript:** split by route; lazy-load heavy, rarely used features;
  check what a dependency adds before adding it. Bundlers already tree-shake
  named ESM imports; changing import style rarely helps.
- **Main thread:** break long tasks into chunks that yield; move heavy
  computation to a Web Worker.
- **Rendering:** a new object or function created on every render
  re-renders every child that receives it; hoist constants first, and keep
  memoization for what the profile shows is expensive.
- **Layout thrashing:** batch DOM reads, then writes.
- **Fonts:** subset, `font-display: swap`, preload the one above the fold.

## Budgets

Start from these unless the spec sets others, and enforce them in CI:
initial JavaScript under 200 KB gzipped, CSS under 50 KB, above-the-fold
images under 200 KB each, API p95 under 200 ms. Lab gates are noisy:
compare a median of several runs, not one.

## Tools

- Lighthouse CLI or CI: `npx --package=@lhci/cli lhci autorun` (the
  unscoped `lhci` package on npm is a different project).
- Bundle size: an analyzer for the bundler in use (`rollup-plugin-visualizer`
  for Vite and Rollup, `webpack-bundle-analyzer`), or `source-map-explorer`
  on the built output.
- Field data: the `web-vitals` library reporting LCP, INP, CLS with
  attribution.
