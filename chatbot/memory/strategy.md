# Memory Strategy

## Goal

Make the assistant non-stateless without allowing session context to grow without control.

## Layers

### Recent Turns

Keep the most recent detailed conversation turns for precise follow-up handling.

Recommended initial policy:

- retain the last 8 to 12 turns in full

### Rolling Summary

Compress older turns into a concise running summary.

The rolling summary should preserve:

- what the visitor is trying to learn
- any audience framing that emerged
- what the assistant has already explained
- any constraints or preferences expressed by the visitor

### Pinned Facts

Store compact, durable session facts that matter across the conversation.

Examples:

- audience appears to be recruiter
- visitor is focused on AI engineering fit
- visitor asked about project depth already

## Storage Boundary

- source of truth: server-side session store
- client-side: current transcript and transient UI state only

## What Memory Must Not Do

- invent facts the user never gave
- silently overwrite known portfolio truth
- grow indefinitely without summarization
- become the only grounding source when retrieval is available