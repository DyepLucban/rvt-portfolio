# Cyber Drive Design Reference

Imported from the Claude Design project **"Cyber Drive Design System"**. This is an **external inspiration reference**, not a spec for this portfolio's current live theme — the site's active palette ("Cool Waters", navy/teal/emerald) is defined in `src/index.css` and is unrelated to what follows. Keep this doc for later, if a redesign wants to borrow from this aesthetic.

## Concept & source material

A from-scratch design system for **Cyber Drive**, a fan-made brand around classic lightweight RWD (rear-wheel-drive) car culture, touge (mountain-pass) driving, and drift/build-log communities. There is no real company, product, or codebase behind it.

- Built from a single fan-made "Cyber Drive" moodboard poster (retro-futuristic data-card/dashboard layout, red-and-black palette, corner-tick frames, stat-bar readouts, mixed English/Japanese type) — used as **loose visual inspiration only**. The poster's own car photography and Initial D references are not reproduced anywhere in this system.
- No Figma file, codebase, or brand guideline doc was attached; every token and component here is original work matching the poster's mood, not copied from a production source.
- Intended use case: a website design system for a build-log + meetup community site for classic RWD car culture.

## Content voice

Plain, declarative, slightly clipped — short sentences, concrete nouns (chassis, drivetrain, weight), no hype adjectives. Second person is avoided in favor of describing the car/community directly ("A build log and meetup community," not "Join us today!"). No emoji anywhere. Headlines are uppercase and terse ("Built For The Mountain Pass," "The Build Sheet"); body copy is sentence case and factual. Numbers and specs are always shown as real data (kg, L, RWD) rather than vague superlatives.

## Design tokens

### Color — neutrals & text

| Token | Value |
|---|---|
| `--black-0` | `oklch(12% 0.008 40)` |
| `--black-1` | `oklch(16% 0.01 35)` |
| `--black-2` | `oklch(20% 0.012 35)` |
| `--black-3` | `oklch(26% 0.014 35)` |
| `--line-1` | `oklch(32% 0.016 35)` |
| `--line-2` | `oklch(40% 0.02 35)` |
| `--cream-0` | `oklch(96% 0.015 80)` |
| `--cream-1` | `oklch(88% 0.018 75)` |
| `--cream-2` | `oklch(70% 0.02 65)` |
| `--cream-3` | `oklch(52% 0.018 60)` |

### Color — accent & semantic

| Token | Value |
|---|---|
| `--red-1` | `oklch(62% 0.20 18)` |
| `--red-2` | `oklch(52% 0.21 18)` |
| `--red-3` | `oklch(30% 0.14 18)` |
| `--red-tint` | `oklch(22% 0.05 18)` |
| `--amber-1` | `oklch(75% 0.15 70)` |
| `--green-1` | `oklch(65% 0.15 145)` |
| `--blue-1` | `oklch(65% 0.09 230)` |
| `--danger` | `oklch(58% 0.22 25)` |
| `--warning` | `var(--amber-1)` |
| `--success` | `var(--green-1)` |
| `--info` | `var(--blue-1)` |
| `--focus-ring` | `oklch(62% 0.20 18 / 0.55)` |

### Color — semantic aliases

| Token | Value |
|---|---|
| `--bg-page` | `var(--black-0)` |
| `--bg-surface` | `var(--black-1)` |
| `--bg-surface-raised` | `var(--black-2)` |
| `--bg-surface-sunken` | `var(--black-0)` |
| `--bg-overlay` | `oklch(10% 0.01 40 / 0.72)` |
| `--border-subtle` | `var(--line-1)` |
| `--border-strong` | `var(--line-2)` |
| `--text-primary` | `var(--cream-0)` |
| `--text-secondary` | `var(--cream-1)` |
| `--text-muted` | `var(--cream-2)` |
| `--text-faint` | `var(--cream-3)` |
| `--text-on-accent` | `var(--black-0)` |
| `--accent` | `var(--red-1)` |
| `--accent-hover` | `oklch(68% 0.19 18)` |
| `--accent-active` | `var(--red-2)` |
| `--accent-fill-subtle` | `var(--red-tint)` |
| `--accent-border` | `oklch(45% 0.18 18)` |

**Rule:** near-black warm neutrals dominate as surface, warm cream carries text, a single red-orange accent (hue ≈18°) is used sparingly for CTAs, active states, and stat fills. Semantic colors are muted, not neon. Max two background tones per screen (page black + one raised surface tone).

### Typography

Fonts: **Rajdhani** (display/headings, condensed technical, always uppercase with slight letter-spacing), **Inter** (body), **IBM Plex Mono** (data readouts, spec labels, eyebrow tags — always uppercase, wide letter-spacing, small size). *Substitution flag: these are close Google Fonts matches for a poster face that wasn't available as a file — swap in real brand fonts via local `@font-face` if they ever exist.*

Font-size ramp:

| Token | Value | Token | Value |
|---|---|---|---|
| `--fs-100` | `0.75rem` | `--fs-600` | `1.75rem` |
| `--fs-200` | `0.8125rem` | `--fs-700` | `2.5rem` |
| `--fs-300` | `0.9375rem` | `--fs-800` | `3.5rem` |
| `--fs-400` | `1rem` | `--fs-900` | `5rem` |
| `--fs-500` | `1.25rem` | | |

Line-height / letter-spacing / weight:

| Token | Value | Token | Value |
|---|---|---|---|
| `--lh-tight` | `1.02` | `--ls-tight` | `-0.01em` |
| `--lh-snug` | `1.2` | `--ls-normal` | `0` |
| `--lh-normal` | `1.5` | `--ls-wide` | `0.04em` |
| `--lh-relaxed` | `1.65` | `--ls-wider` | `0.14em` |
| `--fw-regular` | `400` | `--fw-semibold` | `600` |
| `--fw-medium` | `500` | `--fw-bold` | `700` |

Composed text styles:

| Style | family | weight | line-height | letter-spacing | transform |
|---|---|---|---|---|---|
| `type-eyebrow` | mono | medium | — | wider | uppercase |
| `type-display` | display | semibold | tight | normal | uppercase |
| `type-heading` | display | semibold | snug | normal | — |
| `type-body` | body | regular | relaxed | normal | — |
| `type-data` | mono | regular | normal | normal | — |

### Spacing

4px base grid:

| Token | Value | Token | Value |
|---|---|---|---|
| `--space-1` | `4px` | `--space-7` | `32px` |
| `--space-2` | `8px` | `--space-8` | `40px` |
| `--space-3` | `12px` | `--space-9` | `56px` |
| `--space-4` | `16px` | `--space-10` | `72px` |
| `--space-5` | `20px` | `--space-11` | `96px` |
| `--space-6` | `24px` | `--space-12` | `128px` |

Semantic aliases: `--space-xs` = space-2, `--space-sm` = space-3, `--space-md` = space-5, `--space-lg` = space-7, `--space-xl` = space-9, `--space-2xl` = space-11. Layout: `--container-max: 1200px`, `--gutter: var(--space-6)`.

### Radius & borders

| Token | Value |
|---|---|
| `--radius-none` | `0px` |
| `--radius-sm` | `2px` |
| `--radius-md` | `4px` |
| `--radius-lg` | `8px` |
| `--radius-pill` | `999px` |
| `--border-thin` | `1px` |
| `--border-thick` | `2px` |

Mostly sharp — radius scale tops out at 8px, most UI uses 0–4px. Hairline 1px borders do most of the separating work, not shadows.

### Shadows

| Token | Value |
|---|---|
| `--shadow-sm` | `0 1px 2px oklch(0% 0 0 / 0.4)` |
| `--shadow-md` | `0 4px 12px oklch(0% 0 0 / 0.45)` |
| `--shadow-lg` | `0 12px 32px oklch(0% 0 0 / 0.5)` |
| `--glow-accent` | `0 0 0 1px var(--accent-border), 0 0 24px oklch(62% 0.2 18 / 0.35)` |
| `--inset-hairline` | `inset 0 1px 0 oklch(100% 0 0 / 0.04)` |

Flat by default — shadows reserved for genuinely floating surfaces (dialogs, toasts). `--glow-accent` is sparing, used only on focus states and one brand specimen, never decoratively.

## Visual principles

- **Backgrounds**: flat color only. No gradients except a single dark scrim behind hero images for text legibility. No textures/patterns — the poster's halftone/noise texture was deliberately not recreated (reads as clutter/AI-slop at UI scale).
- **Corners**: mostly sharp, 0–4px typical.
- **Separation**: hairline borders do the work shadows would otherwise do.
- **Signature motif**: accent-colored corner tick marks (the `Frame` component) — a restrained nod to the poster's technical bracket framing, used around photography and feature panels only, not everywhere.
- **Animation**: fast, functional only — ~120ms ease for hover/focus color/background changes, no bounce, no entrance animation.
- **Hover**: buttons/links darken or lighten one step (`--accent` → `--accent-hover`); outlined controls fill with `--bg-surface-raised`. No opacity fades.
- **Press**: primary buttons nudge down 1px on active; no scale/shrink effects.
- **Transparency/blur**: used once, for the modal scrim (`--bg-overlay`, ~72% opacity black). No blur anywhere.
- **Cards**: flat fill or hairline-outlined, sharp 4px corners, no colored left border (avoided as an overused pattern).
- **Imagery**: warm/dusk color grading implied by the reference (not token-enforced) — UI kit photo spots are placeholders for real photography.

## Component library

Grouped as in the source project. Variant/prop contracts are enforced by the project's own lint rules.

### Core

| Component | Purpose | Variants / props |
|---|---|---|
| **Button** | Primary CTA — sharp corners, uppercase Rajdhani label, flat fill, no gradient/shadow. | `variant`: primary (solid accent), secondary (outlined), ghost (text-only, muted), danger. `size`: sm/md/lg. Optional leading `icon`. `disabled` dims to muted surface. |
| **IconButton** | Square icon-only button for toolbars/card actions. | `variant`: solid, outline (default), ghost. `size`: sm/md/lg. Always pass `label` (aria-label/title). |
| **Badge** | Small status pill with dot indicator, monospace uppercase label — echoes the poster's "MAX / LEGENDARY" data tags. | `tone`: accent, neutral, success, warning, danger, info. |
| **Tag** | Pill-shaped filter/category chip, optionally removable or selected. | `selected`, `onRemove`. |
| **Card** | Generic flat container, sharp 4px corners, hairline border, no shadow by default. | `variant`: default (subtle fill), raised (lighter fill + shadow), outline (border-forward). `padding`: sm/md/lg. |

```jsx
<Button variant="primary" size="md" onClick={() => {}}>Enter Garage</Button>
<Badge tone="success">Online</Badge>
<Card variant="outline" padding="md">Content</Card>
```

### Data (signature additions — not standard primitives, added to match the reference poster's data-card motif)

| Component | Purpose |
|---|---|
| **StatBar** | Horizontal stat/spec bar — the poster's "SPEED / HANDLING / DRIFT" readout. |
| **DataRow** | Monospace label/value spec table — the poster's "DATA CARD" (MODEL / ENGINE / DRIVETRAIN...). |
| **Frame** | Decorative wrapper with accent corner-tick marks, echoing the poster's technical bracket framing. |

```jsx
<StatBar label="Handling" value={92} />
<DataRow title="Data Card" rows={[{label:'Model',value:'AE86 Trueno'},{label:'Drivetrain',value:'RWD'}]} />
<Frame ticks><img src="..." /></Frame>
```

### Feedback

| Component | Purpose | Variants / props |
|---|---|---|
| **Dialog** | Centered modal, scrim overlay, flat panel, uppercase display heading. | `open`, `title`, `onClose`. |
| **Toast** | Transient notification panel, left accent stripe, uppercase display title. | `tone`: default, success, danger, warning. |
| **Tooltip** | Hover tooltip, monospace label, flat panel with hairline border. | `side`: top/bottom/left/right. |

```jsx
<Dialog open={open} title="Confirm Build" onClose={close}>Are you sure?</Dialog>
<Toast tone="success" title="Saved" description="Build sheet updated" onClose={dismiss} />
<Tooltip content="940 KG" side="top"><span>Weight</span></Tooltip>
```

### Forms

| Component | Purpose | Notes |
|---|---|---|
| **Input** | Single-line text field, mono uppercase label matching the "DATA CARD" spec-sheet style. | `type`: text/email/password/number. `error` shows red border + helper text. Focus shows a subtle accent glow. |
| **Select** | Native-backed dropdown styled to match Input. | |
| **Checkbox** | Square checkbox, sharp corners, solid accent fill when checked. | |
| **Radio** | Circular radio group, one selection. | |
| **Switch** | Toggle switch, pill track, sliding knob. | |

```jsx
<Input label="Callsign" placeholder="Enter name" onChange={setName} />
<Checkbox checked={v} label="No traction control" onChange={setV} />
<Switch checked={v} label="Launch control" onChange={setV} />
```

### Navigation

| Component | Purpose |
|---|---|
| **Tabs** | Underline tab bar, uppercase display labels, accent underline on active tab. |

```jsx
<Tabs items={[{label:'Specs',value:'specs'},{label:'Gallery',value:'gallery'}]} value={v} onChange={setV} />
```

## Iconography & fonts

- **Icons**: no icon source was provided; the reference UI kit uses a small hand-built stroke icon set (2px stroke, round joins, 24×24) in a Lucide-equivalent style — menu, close, arrow, camera, calendar, map pin, users, mail, Instagram, play. *Substitution flag*: for production use, swap these for the actual Lucide set (`lucide-react`) — same stroke weight, should be a seamless swap. No emoji or unicode-glyph icons anywhere.
- **Fonts**: Rajdhani (display), Inter (body), IBM Plex Mono (data/mono) are Google Fonts stand-ins for an unavailable original poster face — replace with real brand font files (`@font-face`) if they ever surface.

## Caveats

- No logo exists for "Cyber Drive" — the wordmark is always set in Rajdhani, nowhere is a logo drawn or implied.
- This is a single-poster-inspired, from-scratch build — a starting point, not a locked brand, meant to be iterated on with real feedback.
