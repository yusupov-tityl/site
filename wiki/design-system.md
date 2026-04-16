# Design System

Based on [miquido.com](https://www.miquido.com/) audit (2026-04-15).

## Typography
| Element | Font | Size | Weight | Line-height | Tracking |
|---------|------|------|--------|-------------|----------|
| H1 | Inter | clamp(40px,6vw,80px) | 500 (medium) | 1.0 | -0.03em |
| H2 | Inter | clamp(32px,4.5vw,60px) | 500 (medium) | 1.08 | -0.03em |
| H3 | Inter | 20-24px | 600 (semibold) | tight | — |
| Body | Inter | 16px | 400 | 1.7 | — |
| Small | Inter | 14-15px | 400-500 | 1.6 | — |

## Colors
| Token | Value | Usage |
|-------|-------|-------|
| --bg-primary | #0F0F14 | Main background |
| --bg-secondary | #16161D | Alternating sections |
| --bg-card | #1C1C26 | Cards, elevated surfaces |
| --bg-elevated | #222230 | Hover states |
| --brand | #FFE600 | Accent, stats, hover highlights |
| --text-secondary | #A1A1AA | Body text |
| --text-muted | #71717A | Captions, descriptions |

## Spacing
- Container: max-width 1296px, padding 48px horizontal
- Section padding: 100px vertical
- Grid gaps: 48px between cards, gap-px for border grids

## Patterns
- **Two-column headers**: H2 left, description right (lg:grid-cols-2 gap-20)
- **Numbered lists**: 01-06 in 3-column rows (number | title | description)
- **Gap-px grids**: bg-white/[0.06] with gap-px for 1px border effect
- **Arrow-in-circle CTA**: text + ArrowRight(-rotate-45) in circular border span
- **Card hover**: -translate-y-1, border brightens, title turns brand color
- **No decorative gradients/blobs**: clean minimal backgrounds

## Header
- Fixed, 80px height, transparent → blur on scroll
- Centered nav, logo left
- CTA button: white bg, dark text, 4px border-radius, hover → brand yellow

## Footer
- Marquee ticker with tech keywords
- 5-column grid (logo+info, 3 link columns)
- Bottom bar: copyright + social links
