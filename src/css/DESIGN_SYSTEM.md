# Vodoley Design System (VDS)

Single source of truth for UI styling.

## Where to edit

- `src/css/quasar.variables.scss` — Quasar theme variables (brand colors, radiuses).
- `src/css/tokens.scss` — CSS variables for app-wide tokens (colors, spacing, radius, shadows, container width).
- `src/css/app.scss` — global styles and utility classes.

## Utility classes

- `vds-container` — max width container.
- `vds-card` — consistent card border/radius/shadow.
- `vds-muted` — muted text color.

## Notes

- Keep tokens stable and reuse them in components/pages.
- Prefer Quasar spacing helpers (`q-pa-md`, `q-gutter-md`) for local spacing; use VDS tokens for global look & feel.
