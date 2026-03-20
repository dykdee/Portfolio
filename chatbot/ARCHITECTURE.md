# Chatbot Architecture

## Purpose

This directory is the source of truth for the portfolio AI assistant.

The assistant is intended to:

- answer questions about Dee, the portfolio, projects, skills, blog, and contact channels
- summarize any major area of the website in different tones and levels of depth
- maintain meaningful session memory so conversations are not stateless
- use Google Gemini as the LLM provider
- ground its claims in portfolio knowledge rather than relying on model guesswork
- expose an editable prompt and behavior configuration so tone and strategy can be tuned over time
- return structured responses with visible reasoning stages, source references, and clear next actions

This module must remain separate from the React presentation layer in `src/`.
The React app should render the UI and call the chatbot APIs, but the chatbot behavior, prompt design, memory model, knowledge model, and orchestration rules should live here.

## Scope

## Current Implementation Snapshot

As implemented in this repository today:

- `server.js` owns Gemini orchestration and chatbot APIs
- `src/Components/Chatbot/Chatbot.jsx` is an API-driven frontend adapter
- prompts are loaded from `chatbot/prompts/`
- grounded knowledge is loaded from `chatbot/knowledge/portfolio-profile.json`
- session memory is server-side and in-memory for runtime sessions
- response payloads include structured sections, citations, suggested actions, and provider diagnostics

Known limitation:

- memory is not yet durable across server restarts

This chatbot module owns:

- prompt files
- knowledge and retrieval definitions
- memory strategy
- API contract
- response schema
- assistant behavior rules
- implementation notes for admin configurability

This chatbot module does not own:

- site-wide routing
- generic portfolio layout
- unrelated server endpoints
- admin authentication model

## Product Goals

The assistant should act like a portfolio strategist, not a generic help bot.

It should be able to:

- explain what Dee does in plain language
- persuade recruiters, clients, or collaborators using grounded portfolio evidence
- summarize projects, skills, and experience with different levels of detail
- answer follow-up questions while preserving session context
- identify what the user is likely asking for even when the request is vague
- suggest the next best action, such as viewing projects, contacting Dee, or opening the resume

## Non-Goals

The first implementation should not attempt:

- model fine-tuning in the literal training sense
- exposing raw chain-of-thought to users
- cross-device user identity memory without an explicit product decision
- autonomous browsing or open web search unless intentionally added later
- unrestricted claims that are not grounded in site content

## Core Constraints

1. The assistant must not be stateless.
2. The assistant must preserve conversation context across many turns within a session.
3. The system prompt must be editable without editing core UI files.
4. The assistant must use Gemini through server-side orchestration.
5. The assistant must be grounded in real portfolio content.
6. The UI must visibly communicate phases such as thinking, searching, summarizing, and responding.
7. The assistant must be able to reference the sources or sections behind its claims.

## Implementation Interpretation

"Fine tuned" in this project means prompt-tuned plus retrieval-grounded plus memory-aware.

It does not mean training a custom Gemini model.

The correct implementation is:

- Gemini model invocation on the server
- curated system prompt
- portfolio knowledge retrieval
- short-term and rolling-summary memory
- structured response output
- configurable tone and persuasion rules

## Directory Plan

The intended structure for this directory is:

```text
chatbot/
├── ARCHITECTURE.md
├── STAGE_1_TODO.md
├── prompts/
│   ├── system.md
│   ├── tone.md
│   ├── retrieval.md
│   ├── summarization.md
│   └── safety.md
├── knowledge/
│   ├── portfolio-profile.json
│   ├── sections/
│   ├── projects/
│   ├── skills/
│   ├── blog/
│   └── contact/
├── schemas/
│   ├── response.schema.json
│   ├── session.schema.json
│   └── citation.schema.json
├── retrieval/
│   ├── chunking.md
│   ├── ranking.md
│   └── sources.md
├── memory/
│   ├── strategy.md
│   ├── summarization.md
│   └── limits.md
├── api/
│   ├── contract.md
│   └── examples.md
└── ui/
    ├── states.md
    └── message-structure.md
```

Not every file needs to exist on day one. The structure defines ownership and future direction.

## System Components

### 1. Frontend Adapter

The current component in `src/Components/Chatbot/Chatbot.jsx` should become a thin client.

Responsibilities:

- render the panel, messages, status indicators, citations, and actions
- send user input to the server
- maintain client-local transient state such as open or closed panel and optimistic message rendering
- render session output returned by the server

It should not own:

- business logic for answer generation
- retrieval logic
- prompt text
- long-lived memory decisions

### 2. Server Orchestrator

The server should manage all Gemini access.

Responsibilities:

- receive chat requests
- load prompt configuration
- load session memory
- retrieve relevant portfolio context
- assemble a model-ready prompt
- call Gemini
- normalize the model response into a strict UI shape
- update memory after each turn

This should be added to `server.js` first, with the option to extract to dedicated modules later.

### 3. Knowledge Layer

The assistant should answer from curated portfolio knowledge.

Knowledge inputs should include:

- hero copy
- about content
- credentials and certifications
- project descriptions and outcomes
- skills and technologies
- contact details and links
- blog summaries and topical themes
- resume metadata

Each knowledge chunk should carry:

- `id`
- `type`
- `title`
- `summary`
- `content`
- `tags`
- `source`
- `priority`
- `updatedAt`

### 4. Memory Layer

The assistant must keep context beyond a single turn.

Recommended model:

- recent turns window for precise conversational continuity
- rolling summary memory for long sessions
- optional pinned facts gathered from the conversation

Session memory should live server-side.

The browser may cache the visible transcript, but it should not be the sole source of memory.

### 5. Admin Configuration Layer

The assistant should be tunable without direct source edits.

Editable settings should eventually include:

- Gemini API configuration
- base system prompt
- tone rules
- persuasion guidance
- maximum context window strategy
- citation behavior
- summarization style

The active admin surface for settings and future chatbot diagnostics is under `src/Pages/Admin/`.

## Knowledge Model

The assistant must be able to answer and summarize using curated site facts.

Recommended source categories:

- `identity`
- `positioning`
- `skills`
- `projects`
- `credentials`
- `contact`
- `blog`
- `resume`
- `social-links`

Recommended retrieval behavior:

1. classify the user request
2. determine relevant content domains
3. retrieve the top ranked chunks
4. assemble context with concise source descriptors
5. ask Gemini to answer only from retrieved context and known session memory unless explicitly labeled as a general opinion

## Memory Model

Session memory should support long conversations without unbounded token growth.

Recommended session shape:

```json
{
  "sessionId": "string",
  "createdAt": "ISO date",
  "updatedAt": "ISO date",
  "recentTurns": [],
  "rollingSummary": "string",
  "pinnedFacts": [],
  "userIntentProfile": {
    "audience": "recruiter|client|collaborator|general|unknown",
    "goal": "string"
  }
}
```

Memory policy:

- keep the last several detailed turns
- periodically summarize older turns into a compact memory block
- preserve explicit user goals and high-value context
- do not fabricate facts about the user or Dee

## Prompt Model

The assistant prompt should be split into layers instead of one giant string.

Recommended prompt layers:

1. base system prompt
2. tone and brand voice prompt
3. retrieval grounding instructions
4. citation and answer formatting rules
5. current session memory summary
6. current retrieved knowledge chunks
7. latest user turn

This makes tuning safer and easier.

## API Contract

Initial server endpoints should be minimal and explicit.

### `POST /api/chatbot/session`

Purpose:

- create a new chat session

Response:

- `sessionId`
- initial assistant greeting
- initial UI capabilities

### `POST /api/chatbot/message`

Purpose:

- send a user message into an existing session

Request body:

```json
{
  "sessionId": "string",
  "message": "string",
  "pageContext": {
    "route": "/",
    "section": "skills"
  }
}
```

Response body:

```json
{
  "sessionId": "string",
  "status": "completed",
  "assistantMessage": {
    "id": "string",
    "role": "assistant",
    "summary": "string",
    "sections": [
      {
        "label": "Summary",
        "content": "string"
      }
    ],
    "citations": [
      {
        "label": "Skills",
        "sourceId": "skills-core",
        "anchor": "skills"
      }
    ],
    "suggestedActions": [
      {
        "type": "scroll",
        "label": "View Skills",
        "target": "skills"
      }
    ],
    "meta": {
      "stages": ["thinking", "searching", "drafting"],
      "memoryUpdated": true
    }
  }
}
```

### `POST /api/chatbot/summarize`

Purpose:

- generate structured summaries of the portfolio, a project, a skill set, or Dee's positioning for a given audience

### `GET /api/chatbot/config/status`

Purpose:

- expose whether Gemini and chatbot prompt configuration are available

## Response Schema

The response should be render-friendly and not just a blob of text.

Recommended message shape:

```json
{
  "id": "string",
  "role": "assistant",
  "summary": "one-sentence answer",
  "sections": [
    {
      "label": "Why Dee Fits",
      "content": "grounded explanation"
    },
    {
      "label": "Evidence",
      "content": "skills, projects, credentials"
    }
  ],
  "citations": [
    {
      "label": "Projects",
      "sourceId": "projects-featured",
      "anchor": "projects"
    }
  ],
  "suggestedActions": [
    {
      "type": "scroll",
      "label": "See Projects",
      "target": "projects"
    }
  ],
  "meta": {
    "intent": "recruiter-fit",
    "confidence": "high",
    "usedMemory": true,
    "usedRetrieval": true
  }
}
```

## UI State Model

The UI should display assistant workflow stages rather than pretending replies are instantaneous.

Recommended stages:

- `idle`
- `thinking`
- `searching`
- `summarizing`
- `drafting`
- `completed`
- `error`

Recommended visible elements:

- stage indicator
- structured response cards
- citations and source pills
- suggested next actions
- memory-aware continuity between turns
- collapsible details if the answer is long

## Persuasion Rules

The assistant may be persuasive, but only in grounded ways.

Allowed:

- reframing Dee's experience for different audiences
- emphasizing relevant skills and projects
- connecting capabilities to user goals
- summarizing strengths confidently

Not allowed:

- inventing experience
- overstating results without evidence
- claiming certifications, roles, or outcomes not present in the portfolio knowledge

## Reference Rules

The assistant should be able to reference what it says.

For this portfolio, references should point to:

- section names
- project records
- skill groups
- credential entries
- blog entries
- resume metadata

It should not pretend to cite invisible sources.

## Open Decisions

The following are still product decisions and should be confirmed before deeper implementation:

1. Should session memory persist only during one browser session, or across visits?
2. Should admin prompt edits be stored in files, environment-backed secrets, database records, or a hybrid model?
3. Should the assistant have explicit audience modes such as recruiter, client, and collaborator?
4. Should summarization be exposed as dedicated quick actions in the UI?
5. Should the assistant use strict citations for every answer, or only when claims are made?

## Stage 1 Definition

Stage 1 is architecture and infrastructure preparation.

Stage 1 should deliver:

- chatbot module scaffolding
- prompt file scaffolding
- knowledge source plan
- API contract definition
- response schema definition
- session and memory strategy definition
- no production Gemini orchestration yet unless needed for validation

Stage 1 should not yet attempt final visual polish or advanced admin editing.