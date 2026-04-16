# Decision Log

## [2026-04-15] Visual style: Miquido reference
**Decision**: Adopt miquido.com design language for the entire landing page.
**Rationale**: User requested "один в один" (pixel-perfect) match of Miquido's visual style.
**Impact**: Rewrote 12 section components + global CSS. Adopted Inter font, dark palette, two-column headers, numbered lists, gap-px grids.

## [2026-04-15] H2 typography: 60px/500
**Decision**: Changed H2 from 56px/600 to 60px/500 after Miquido audit revealed exact specs.
**Rationale**: Miquido uses Sofia-Pro at 60px weight 500. Matched with Inter at same size/weight.

## [2026-04-15] Remove gradient blobs
**Decision**: Removed decorative gradient blobs from AISection and CTABanner.
**Rationale**: Miquido audit confirmed clean minimal design with no gradient effects.

## [2026-04-15] Header CTA: white button
**Decision**: Changed header CTA from gray pill (#32373C, border-radius 9999) to white rect (#fff, border-radius 4px).
**Rationale**: Miquido uses white bg, dark text, small radius for header CTA.

## [2026-04-16] Hero video: golden 3D animation
**Decision**: Replaced neural network video with golden abstract 3D sphere animation (Seedance 2).
**Rationale**: User wanted Miquido-like 3D abstract hero but in golden brand tones.

## [2026-04-16] LLM Wiki pattern
**Decision**: Adopted Karpathy's LLM Wiki pattern for persistent knowledge management.
**Rationale**: User requested setup from Karpathy's gist. Wiki accumulates project knowledge incrementally.
