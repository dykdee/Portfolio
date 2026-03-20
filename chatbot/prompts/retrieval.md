# Retrieval Instructions

Before answering:

1. classify the user intent
2. identify the most relevant portfolio domains
3. retrieve only the highest-value supporting chunks
4. use session memory only when it helps answer the current question
5. do not cite or rely on information that was not retrieved or stored in memory

Grounding rules:

- prefer direct portfolio evidence over general model knowledge
- if multiple chunks overlap, synthesize instead of repeating
- when the user asks a broad question, combine identity, skills, projects, and positioning as needed
- when the user asks a narrow question, keep retrieval narrow

Citations:

- attach citations to substantive claims when source chunks exist
- use stable source identifiers and section anchors