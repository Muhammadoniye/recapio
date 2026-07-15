# AI Workflow Rules

## Approach

Build Recapio incrementally using a spec-driven workflow. The
context files define what to build and how it fits together.
`context/specs/00-build-plan.md` defines the ordered list of
units. Each unit has (or will have) its own spec file in
`context/specs/`. Always implement against the current unit's
spec file — do not infer or invent behavior from scratch, and do
not build ahead of the current unit.

## Scoping Rules

- Work on one unit at a time, exactly as defined in
  `context/specs/00-build-plan.md`.
- Prefer small, verifiable increments over large speculative
  changes.
- Do not combine unrelated system boundaries in a single
  implementation step (e.g. do not touch the transcription
  pipeline while implementing the dashboard UI shell).
- Do not add features, packages, or UI states that are not
  described in the current unit's spec, even if they seem like an
  obvious next step. Add them as a note in `progress-tracker.md`
  under Open Questions instead.

## When to Split Work

Split an implementation step if it combines:

- UI changes and pipeline/processing logic changes
- Multiple unrelated API routes (e.g. upload handling and action
  item toggling)
- Database schema changes with unrelated feature work
- Behavior not clearly defined in the context files or the
  current spec

If a change cannot be verified end to end quickly, the scope is
too broad — split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files
  or the current spec.
- If a requirement is ambiguous (e.g. what happens if Whisper
  returns an empty transcript), resolve it in the relevant spec
  or `architecture.md` before implementing — do not guess silently.
- If a requirement is genuinely missing, add it as an open
  question in `progress-tracker.md` and flag it before continuing
  rather than making an undocumented assumption.

## Protected Files

Do not modify the following unless explicitly instructed:

- `components/ui/*` — shadcn-generated primitives
- `prisma/migrations/*` — never hand-edit generated migration
  files; change the schema and regenerate instead
- Any third-party library internals in `node_modules`

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- `architecture.md` — if system boundaries, storage model, or an
  invariant changes
- `code-standards.md` — if a new convention is introduced
- `project-overview.md` — if scope changes (a feature is added,
  removed, or moved in/out of scope)
- `ui-context.md` — if a new color token, component pattern, or
  layout convention is introduced

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope.
2. No invariant defined in `architecture.md` was violated.
3. The unit's verification checklist (in its spec file) is fully
   checked off.
4. `progress-tracker.md` reflects the completed work, including
   any architecture decisions made along the way.
5. `npm run build` passes with no TypeScript errors.
6. No console errors appear during the unit's core interaction.
