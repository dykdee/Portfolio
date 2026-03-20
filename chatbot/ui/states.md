# UI State Vocabulary

## Chat States

- `idle`
- `submitting`
- `thinking`
- `searching`
- `summarizing`
- `drafting`
- `completed`
- `error`

## Required UI Behaviors

- show when the assistant is actively working
- keep the latest user message visible while the assistant is processing
- render structured sections instead of plain paragraphs when available
- show citations as source pills or links
- show suggested actions when provided
- make failure states recoverable

## Minimum Stage 2 Render Targets

- welcome state
- active response state
- structured assistant message card
- citations row
- suggested action row
- error card