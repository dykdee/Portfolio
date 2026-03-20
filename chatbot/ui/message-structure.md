# Message Structure

The frontend should render assistant messages from structured data, not infer layout from raw text.

## Assistant Message Model

Fields:

- `id`
- `role`
- `summary`
- `sections`
- `citations`
- `suggestedActions`
- `meta`

## Sections

Each section should have:

- `label`
- `content`

Suggested labels:

- Summary
- Why Dee Fits
- Evidence
- Recommended Next Step

## Citations

Each citation should support:

- `label`
- `sourceId`
- `anchor`
- optional `path`

## Suggested Actions

Action types expected in stage 2:

- `scroll`
- `link`
- `summarize`

## Fallback Behavior

If the assistant only returns `summary`, the UI should still render a clean single-block message.