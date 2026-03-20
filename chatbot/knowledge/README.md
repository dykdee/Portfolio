# Knowledge Contract

## Purpose

The assistant should answer portfolio-specific questions from normalized knowledge records rather than raw page scraping or prompt-only memory.

## Source Domains

- identity
- positioning
- about
- skills
- projects
- credentials
- contact
- blog
- resume
- social-links

## Normalized Chunk Shape

Each knowledge record should follow this shape:

```json
{
  "id": "skills-core",
  "type": "skills",
  "title": "Core engineering skills",
  "summary": "High-signal summary used during retrieval.",
  "content": "Full normalized content for the assistant.",
  "tags": ["python", "react", "llm"],
  "source": {
    "kind": "site-section",
    "path": "src/Pages/Skills/Skills.jsx",
    "anchor": "skills"
  },
  "priority": 0.9,
  "updatedAt": "2026-03-20T00:00:00.000Z"
}
```

## Citation Requirements

Every retrievable record should expose:

- a stable `id`
- a human-readable `title`
- a `source.kind`
- a `source.anchor`
- a usable path or logical source reference

## Initial Inventory Targets

Stage 2 should extract and normalize these first:

- Dee identity and positioning summary
- skills overview
- featured projects
- contact methods
- resume link and summary
- key credentials
- blog overview