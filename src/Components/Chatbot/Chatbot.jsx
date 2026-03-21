import { useState, useRef, useEffect } from 'react';
import { getActiveHomeSectionId, scrollToSectionById } from '../../utils/scrollToSection';
import './Chatbot.css';

const API_BASE = '/api/chatbot';
const STAGES = ['thinking', 'searching', 'drafting'];
const STAGE_LABELS = {
  thinking: 'Thinking',
  searching: 'Searching portfolio',
  drafting: 'Drafting answer'
};

function getPageContext() {
  return {
    route: window.location.pathname,
    section: window.location.pathname === '/' ? getActiveHomeSectionId() : 'home'
  };
}

async function postJson(url, body, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Assistant request timed out. Check backend connectivity and try again.');
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || 'Request failed.');
  }

  return data;
}

function scrollToAnchor(anchor) {
  return scrollToSectionById(anchor);
}

function createUserMessage(text) {
  return {
    id: `${Date.now()}-user`,
    role: 'user',
    text
  };
}

function createErrorMessage(text) {
  return {
    id: `${Date.now()}-error`,
    role: 'assistant',
    summary: text,
    sections: [],
    citations: [],
    suggestedActions: [],
    meta: {
      intent: 'error',
      usedMemory: false,
      usedRetrieval: false,
      stageTrace: []
    },
    isError: true
  };
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeStage, setActiveStage] = useState(STAGES[0]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const sessionIdRef = useRef('');

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isSending) {
      setActiveStage(STAGES[0]);
      return undefined;
    }

    let stageIndex = 0;
    const intervalId = window.setInterval(() => {
      stageIndex = (stageIndex + 1) % STAGES.length;
      setActiveStage(STAGES[stageIndex]);
    }, 900);

    return () => window.clearInterval(intervalId);
  }, [isSending]);

  useEffect(() => {
    if (!isOpen || sessionIdRef.current) {
      return;
    }

    let isCancelled = false;

    async function bootstrapSession() {
      setIsBootstrapping(true);
      try {
        const data = await postJson(`${API_BASE}/session`, {});
        if (isCancelled) {
          return;
        }

        sessionIdRef.current = data.sessionId;
        setMessages([data.message]);
      } catch (error) {
        if (!isCancelled) {
          setMessages([createErrorMessage(error.message || 'Failed to start assistant session.')]);
        }
      } finally {
        if (!isCancelled) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrapSession();

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  async function send() {
    const text = input.trim();
    if (!text || isSending) return;

    if (!sessionIdRef.current) {
      try {
        const data = await postJson(`${API_BASE}/session`, {});
        sessionIdRef.current = data.sessionId;
        setMessages((prev) => (prev.length ? prev : [data.message]));
      } catch (error) {
        setMessages((prev) => [...prev, createErrorMessage(error.message || 'Failed to start assistant session.')]);
        return;
      }
    }

    const userMsg = createUserMessage(text);
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setIsSending(true);

    try {
      const data = await postJson(`${API_BASE}/message`, {
        sessionId: sessionIdRef.current,
        message: text,
        pageContext: getPageContext()
      });

      setMessages((prev) => [...prev, data.assistantMessage]);
    } catch (error) {
      setMessages((prev) => [...prev, createErrorMessage(error.message || 'Failed to get assistant response.')]);
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  async function handleAction(action) {
    if (!action) {
      return;
    }

    if (action.type === 'scroll') {
      const didScroll = scrollToAnchor(action.target);
      if (didScroll) {
        setIsOpen(false);
      }
    } else if (action.type === 'link' && action.href) {
      window.open(action.href, '_blank', 'noopener,noreferrer');
    } else if (action.type === 'summarize' && sessionIdRef.current && !isSending) {
      setIsSending(true);
      try {
        const data = await postJson(`${API_BASE}/summarize`, {
          sessionId: sessionIdRef.current,
          target: action.target || 'portfolio',
          subjectId: action.subjectId
        });
        setMessages((prev) => [...prev, data.assistantMessage]);
      } catch (error) {
        setMessages((prev) => [...prev, createErrorMessage(error.message || 'Failed to summarize this topic.')]);
      } finally {
        setIsSending(false);
      }
    }
  }

  function handleCitationClick(citation) {
    if (!citation?.anchor) {
      return;
    }

    const didScroll = scrollToAnchor(citation.anchor);
    if (didScroll) {
      setIsOpen(false);
    }
  }

  const headerStatus = isSending
    ? STAGE_LABELS[activeStage]
    : sessionIdRef.current
      ? 'Memory active'
      : isBootstrapping
        ? 'Connecting'
        : 'Ready';

  return (
    <>
      <button
        className={`chatbot-fab${isOpen ? ' active' : ''}`}
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? 'Close chat' : 'Open chat assistant'}
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
        )}
      </button>

      <div className={`chatbot-panel${isOpen ? ' is-open' : ''}`} role="dialog" aria-label="Chat assistant">
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <span className="chatbot-avatar">D</span>
            <div>
              <p className="chatbot-header-name">Dee's Assistant</p>
              <p className="chatbot-header-status">{headerStatus}</p>
            </div>
          </div>
          <button className="chatbot-close" onClick={() => setIsOpen(false)} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="chatbot-messages">
          <div className="chatbot-session-note">
            Please allow ~3 minutes between requests for best results.
          </div>
          {messages.map((msg) => (
            <div key={msg.id} className={`chatbot-msg chatbot-msg--${msg.role}${msg.isError ? ' chatbot-msg--error' : ''}`}>
              {msg.role === 'user' ? (
                <p>{msg.text}</p>
              ) : (
                <div className="chatbot-response-card">
                  <p className="chatbot-response-summary">{msg.summary}</p>

                  {msg.sections?.length ? (
                    <div className="chatbot-sections">
                      {msg.sections.map((section) => (
                        <div key={`${msg.id}-${section.label}`} className="chatbot-section-block">
                          <p className="chatbot-section-label">{section.label}</p>
                          <p className="chatbot-section-copy">{section.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {msg.citations?.length ? (
                    <div className="chatbot-citations">
                      <p className="chatbot-meta-label">Sources</p>
                      <div className="chatbot-pill-row">
                        {msg.citations.map((citation) => (
                          <button
                            key={`${msg.id}-${citation.sourceId}`}
                            type="button"
                            className="chatbot-citation-pill"
                            onClick={() => handleCitationClick(citation)}
                          >
                            {citation.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {msg.suggestedActions?.length ? (
                    <div className="chatbot-actions">
                      <p className="chatbot-meta-label">Next Actions</p>
                      <div className="chatbot-pill-row">
                        {msg.suggestedActions.map((action, index) => (
                          <button
                            key={`${msg.id}-${action.label}-${index}`}
                            type="button"
                            className="chatbot-action-btn"
                            onClick={() => handleAction(action)}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}

          {isSending ? (
            <div className="chatbot-msg chatbot-msg--assistant-status">
              <div className="chatbot-status-card">
                <div className="chatbot-status-dots" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p className="chatbot-status-label">{STAGE_LABELS[activeStage]}</p>
                <p className="chatbot-status-copy">Grounding the response in portfolio context and session memory.</p>
              </div>
            </div>
          ) : null}

          <div ref={bottomRef} />
        </div>

        <div className="chatbot-input-row">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Dee, skills, projects, fit, or ask for a summary..."
            aria-label="Message input"
          />
          <button onClick={send} aria-label="Send" disabled={!input.trim() || isSending || isBootstrapping}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    </>
  );
}
