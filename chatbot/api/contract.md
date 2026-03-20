# API Contract Draft

## Endpoint: POST /api/chatbot/session

Creates a new assistant session.

Response shape:

```json
{
  "sessionId": "string",
  "message": {
    "id": "string",
    "role": "assistant",
    "summary": "Welcome message",
    "sections": [],
    "citations": [],
    "suggestedActions": [],
    "meta": {
      "intent": "welcome",
      "usedMemory": false,
      "usedRetrieval": false
    }
  }
}
```

## Endpoint: POST /api/chatbot/message

Sends a user message into an existing session.

Request shape:

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

Response shape:

```json
{
  "sessionId": "string",
  "status": "completed",
  "assistantMessage": {
    "id": "string",
    "role": "assistant",
    "summary": "string",
    "sections": [],
    "citations": [],
    "suggestedActions": [],
    "meta": {
      "intent": "string",
      "usedMemory": true,
      "usedRetrieval": true,
      "stageTrace": ["thinking", "searching", "drafting"]
    }
  }
}
```

## Endpoint: POST /api/chatbot/summarize

Produces structured summaries for a declared target.

Request shape:

```json
{
  "sessionId": "string",
  "target": "portfolio|dee|skills|project|blog",
  "audience": "recruiter|client|collaborator|general",
  "subjectId": "optional-string"
}
```

## Endpoint: GET /api/chatbot/config/status

Returns whether chatbot runtime configuration is ready.

Status checks should eventually cover:

- Gemini API key presence
- prompt availability
- knowledge availability
- session capability availability