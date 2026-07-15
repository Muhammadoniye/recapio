# UI Context

## Theme

Light mode only. No dark mode for this version. The design
language is a calm, focused productivity workspace — think "a
tool you'd trust to hold your meeting notes," not a flashy
consumer app. Neutral off-white backgrounds, a single confident
accent color for interactive elements, generous whitespace, and
minimal visual noise so the summary and action items stay the
focus, not the chrome around them.

## Colors

Define these as CSS custom properties. All components must use
these tokens — no hardcoded hex values.

| Role            | CSS Variable       | Value     |
| ---------------- | ------------------- | --------- |
| Page background  | `--bg-base`         | `#F7F8FA` |
| Surface (cards)  | `--bg-surface`      | `#FFFFFF` |
| Primary text     | `--text-primary`    | `#111827` |
| Muted text       | `--text-muted`      | `#6B7280` |
| Primary accent   | `--accent-primary`  | `#4F46E5` |
| Accent hover     | `--accent-hover`    | `#4338CA` |
| Border           | `--border-default`  | `#E5E7EB` |
| Error            | `--state-error`     | `#DC2626` |
| Success          | `--state-success`   | `#16A34A` |
| Warning/pending  | `--state-warning`   | `#D97706` |

## Typography

| Role         | Font          | Variable      |
| ------------- | ------------- | ------------- |
| UI text       | Inter         | `--font-sans` |
| Transcript / code | JetBrains Mono | `--font-mono` |

Use `--font-sans` everywhere by default. Use `--font-mono` only
inside the transcript viewer, where a monospace feel makes long
blocks of spoken text easier to scan.

## Border Radius

| Context            | Class           |
| -------------------- | --------------- |
| Inline / small UI    | `rounded-md`    |
| Cards / panels       | `rounded-xl`    |
| Modals / overlays    | `rounded-2xl`   |

## Component Library

shadcn/ui on top of Tailwind. Components live in
`components/ui/`. Use the shadcn CLI to add new components
(Button, Card, Badge, Checkbox, Dialog, Input, Skeleton) rather
than writing them from scratch.

## Layout Patterns

- **Dashboard**: Top bar with app name and a "New Recap" button
  on the right. Below it, a vertical list of RecapCard components
  (title, date, status badge, short summary preview once
  available). Empty state shown when there are no recaps yet.
- **New Recap**: A centered modal (Dialog) with a title field and
  a file drop zone. Does not navigate away from the dashboard.
- **Recap Detail**: Two-column layout on desktop — left column
  (roughly 40% width) holds the summary card and the action item
  checklist; right column (roughly 60% width) holds the
  collapsible, searchable transcript viewer. On mobile, stacks
  into a single column: summary, then action items, then
  transcript.
- **Status Badge**: A small pill component used on both the
  dashboard and detail page, color-coded by status
  (`--state-warning` for processing states, `--state-success` for
  `complete`, `--state-error` for `failed`).
- **Modals / overlays**: Centered with a backdrop blur, consistent
  with shadcn Dialog defaults.

## Icons

Lucide React. Stroke-based icons only, no filled icons. Sizes:
`h-4 w-4` for inline icons (inside badges, list items), `h-5 w-5`
for icons inside buttons.
