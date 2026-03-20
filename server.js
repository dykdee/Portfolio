const express = require('express');
const cors = require('cors');
const multer = require('multer');
const admin = require('firebase-admin');
const dns = require('node:dns');
const { put } = require('@vercel/blob');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const dotenvResult = require('dotenv').config();

// Prefer IPv4 for outbound API calls. On some networks, IPv6 to Gemini times out.
dns.setDefaultResultOrder('ipv4first');

// Keep normal env precedence for most keys (e.g., PORT), but force local Gemini key if present.
if (dotenvResult?.parsed?.GEMINI_API_KEY) {
  process.env.GEMINI_API_KEY = dotenvResult.parsed.GEMINI_API_KEY;
}

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const FIREBASE_SECRET_KEYS = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'storageBucket', 'messagingSenderId', 'appId', 'measurementId'];
const FIREBASE_ENV_KEY_MAP = {
  apiKey: ['VITE_FIREBASE_API_KEY', 'FIREBASE_WEB_API_KEY'],
  authDomain: ['VITE_FIREBASE_AUTH_DOMAIN', 'FIREBASE_WEB_AUTH_DOMAIN'],
  databaseURL: ['VITE_FIREBASE_DATABASE_URL', 'FIREBASE_WEB_DATABASE_URL'],
  projectId: ['VITE_FIREBASE_PROJECT_ID', 'FIREBASE_WEB_PROJECT_ID'],
  storageBucket: ['VITE_FIREBASE_STORAGE_BUCKET', 'FIREBASE_WEB_STORAGE_BUCKET'],
  messagingSenderId: ['VITE_FIREBASE_MESSAGING_SENDER_ID', 'FIREBASE_WEB_MESSAGING_SENDER_ID'],
  appId: ['VITE_FIREBASE_APP_ID', 'FIREBASE_WEB_APP_ID'],
  measurementId: ['VITE_FIREBASE_MEASUREMENT_ID', 'FIREBASE_WEB_MEASUREMENT_ID']
};

const runtimeEnvPath = path.resolve(__dirname, '.env');
const secretsStorePath = path.resolve(__dirname, '.admin-secrets-store.json');
const legacySecretsStorePath = path.resolve(__dirname, '..', '.admin-secrets-store.json');
const chatbotRootPath = path.resolve(__dirname, 'chatbot');
const chatbotPromptsPath = path.join(chatbotRootPath, 'prompts');
const chatbotKnowledgePath = path.join(chatbotRootPath, 'knowledge', 'portfolio-profile.json');
const chatbotSessions = new Map();

const CHATBOT_STAGE_TRACE = ['thinking', 'searching', 'drafting'];
const CHATBOT_RECENT_TURN_LIMIT = 10;

function getRuntimeConfigValue(configKey) {
  const envKeys = FIREBASE_ENV_KEY_MAP[configKey] || [];
  for (const envKey of envKeys) {
    const value = process.env[envKey];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

function firstNonEmptyString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

const firebaseWebConfig = {
  apiKey: getRuntimeConfigValue('apiKey'),
  authDomain: getRuntimeConfigValue('authDomain'),
  databaseURL: getRuntimeConfigValue('databaseURL'),
  projectId: getRuntimeConfigValue('projectId'),
  storageBucket: getRuntimeConfigValue('storageBucket'),
  messagingSenderId: getRuntimeConfigValue('messagingSenderId'),
  appId: getRuntimeConfigValue('appId'),
  measurementId: getRuntimeConfigValue('measurementId')
};

function readChatbotPrompt(fileName) {
  const targetPath = path.join(chatbotPromptsPath, fileName);
  if (!fs.existsSync(targetPath)) {
    return '';
  }

  return fs.readFileSync(targetPath, 'utf8').trim();
}

function loadChatbotKnowledge() {
  if (!fs.existsSync(chatbotKnowledgePath)) {
    return { site: null, records: [] };
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(chatbotKnowledgePath, 'utf8'));
    return {
      site: parsed.site || null,
      records: Array.isArray(parsed.records) ? parsed.records : []
    };
  } catch (error) {
    console.warn('⚠️  Failed to load chatbot knowledge:', error.message);
    return { site: null, records: [] };
  }
}

function summarizeText(value, maxLength = 220) {
  if (!value) {
    return '';
  }

  const normalized = String(value).replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 3).trim()}...`;
}

function tokenizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function inferIntent(message) {
  const q = String(message || '').toLowerCase();

  if (/\b(hi|hello|hey|yo|good\s*(morning|afternoon|evening))\b/.test(q)) return 'greeting';
  if (/\b(recruiter|hire|hiring|fit for role|candidate|role fit|strong fit|fit for|job|position)\b/.test(q)) return 'recruiter-fit';
  if (/\b(client|agency|contract|freelance|project help)\b/.test(q)) return 'client-fit';
  if (/\b(summary|summarize|overview|snapshot)\b/.test(q)) return 'summarization';
  if (/\b(skill|stack|technology|tool|framework)\b/.test(q)) return 'skills';
  if (/\b(project|built|case study|work)\b/.test(q)) return 'projects';
  if (/\b(contact|email|reach|linkedin|github|telegram|whatsapp)\b/.test(q)) return 'contact';
  if (/\b(resume|cv)\b/.test(q)) return 'resume';
  if (/\b(blog|article|writing)\b/.test(q)) return 'blog';
  if (/\b(about|who is|who are|background|experience)\b/.test(q)) return 'about';

  return 'general';
}

function inferAudience(message, priorAudience = 'unknown') {
  const q = String(message || '').toLowerCase();

  if (/\b(recruiter|hiring|role|candidate|employ)\b/.test(q)) return 'recruiter';
  if (/\b(client|business|company|product|contract)\b/.test(q)) return 'client';
  if (/\b(collaborat|partner|team up|open source)\b/.test(q)) return 'collaborator';
  if (priorAudience && priorAudience !== 'unknown') return priorAudience;

  return 'general';
}

function scoreKnowledgeRecord(record, messageTokens, intent) {
  const text = [record.title, record.summary, record.content, ...(record.tags || [])].join(' ').toLowerCase();
  let score = Number(record.priority || 0);
  const explicitContactQuery = messageTokens.some((token) => ['contact', 'email', 'reach', 'linkedin', 'github', 'telegram', 'whatsapp'].includes(token));

  messageTokens.forEach((token) => {
    if (text.includes(token)) {
      score += token.length > 4 ? 1.4 : 0.8;
    }
  });

  if (intent !== 'general' && record.type === intent) {
    score += 2.5;
  }

  if (intent === 'recruiter-fit' && ['identity', 'positioning', 'skills', 'projects', 'about'].includes(record.type)) {
    score += 1.8;
  }

  if (intent === 'recruiter-fit' && record.type === 'contact' && !explicitContactQuery) {
    score -= 2.5;
  }

  if (intent === 'client-fit' && ['positioning', 'projects', 'skills', 'contact'].includes(record.type)) {
    score += 1.8;
  }

  if (intent === 'summarization') {
    score += 0.5;
  }

  return score;
}

function retrieveKnowledge(message, intent) {
  const knowledge = loadChatbotKnowledge();
  const messageTokens = tokenizeText(message);
  const ranked = knowledge.records
    .map((record) => ({ record, score: scoreKnowledgeRecord(record, messageTokens, intent) }))
    .sort((left, right) => right.score - left.score);

  return {
    site: knowledge.site,
    records: ranked.slice(0, 5).map((entry) => entry.record)
  };
}

function createSessionId() {
  return crypto.randomUUID();
}

function createMessageId() {
  return crypto.randomUUID();
}

function getWelcomeMessage() {
  return {
    id: createMessageId(),
    role: 'assistant',
    summary: "Hi, I'm Dee's assistant. Ask about Dee's background, skills, projects, blog, or how Dee fits a role or project.",
    sections: [],
    citations: [],
    suggestedActions: [
      { type: 'scroll', label: 'View Skills', target: 'skills' },
      { type: 'scroll', label: 'See Projects', target: 'projects' },
      { type: 'scroll', label: 'Contact Dee', target: 'contact' }
    ],
    meta: {
      intent: 'welcome',
      usedMemory: false,
      usedRetrieval: false,
      stageTrace: []
    }
  };
}

function createSession() {
  const timestamp = new Date().toISOString();
  const session = {
    sessionId: createSessionId(),
    createdAt: timestamp,
    updatedAt: timestamp,
    recentTurns: [],
    rollingSummary: '',
    pinnedFacts: [],
    userIntentProfile: {
      audience: 'unknown',
      goal: ''
    }
  };

  chatbotSessions.set(session.sessionId, session);
  return session;
}

function getSession(sessionId) {
  if (!sessionId) {
    return null;
  }

  return chatbotSessions.get(sessionId) || null;
}

function compactTurnsForPrompt(turns) {
  return turns
    .map((turn) => `${turn.role.toUpperCase()}: ${turn.content}`)
    .join('\n');
}

function updateRollingSummary(session) {
  const olderTurns = session.recentTurns.slice(0, Math.max(session.recentTurns.length - 4, 0));
  if (!olderTurns.length) {
    return;
  }

  session.rollingSummary = summarizeText(compactTurnsForPrompt(olderTurns), 700);
}

function storeTurn(session, role, content) {
  session.recentTurns.push({ role, content });
  if (session.recentTurns.length > CHATBOT_RECENT_TURN_LIMIT) {
    session.recentTurns = session.recentTurns.slice(-CHATBOT_RECENT_TURN_LIMIT);
    updateRollingSummary(session);
  }
  session.updatedAt = new Date().toISOString();
}

function buildPromptEnvelope({ session, message, retrieval, audience, intent }) {
  const promptSections = [
    readChatbotPrompt('system.md'),
    readChatbotPrompt('tone.md'),
    readChatbotPrompt('retrieval.md'),
    readChatbotPrompt('summarization.md'),
    readChatbotPrompt('safety.md')
  ].filter(Boolean);

  const knowledgeBlock = retrieval.records
    .map((record) => `SOURCE ${record.id} (${record.type})\nTITLE: ${record.title}\nSUMMARY: ${record.summary}\nCONTENT: ${record.content}`)
    .join('\n\n');

  const memoryBlock = [
    `Audience: ${audience}`,
    `Intent: ${intent}`,
    session.rollingSummary ? `Rolling summary: ${session.rollingSummary}` : '',
    session.pinnedFacts.length ? `Pinned facts: ${session.pinnedFacts.join('; ')}` : '',
    session.recentTurns.length ? `Recent turns:\n${compactTurnsForPrompt(session.recentTurns.slice(-6))}` : ''
  ].filter(Boolean).join('\n');

  return `${promptSections.join('\n\n')}

You must return valid JSON with this shape:
{
  "summary": "string",
  "sections": [{ "label": "string", "content": "string" }],
  "citationIds": ["source-id"],
  "suggestedActions": [{ "type": "scroll|link|summarize", "label": "string", "target": "optional", "href": "optional", "subjectId": "optional" }],
  "pinnedFacts": ["string"]
}

Use only the retrieved knowledge and memory below. Do not invent claims.

MEMORY
${memoryBlock}

KNOWLEDGE
${knowledgeBlock}

USER MESSAGE
${message}`;
}

function createFallbackResponse({ message, retrieval, intent, audience }) {
  if (intent === 'greeting') {
    return {
      summary: 'Hey, happy to help. Ask me anything about Dee\u2019s work, skills, or background.',
      sections: [
        {
          label: 'How I Can Help',
          content: 'Ask about skills, projects, role fit, contact, or request a portfolio summary. Please allow a few minutes between requests so responses stay accurate.'
        }
      ],
      citationIds: [],
      suggestedActions: [
        { type: 'scroll', label: 'View Skills', target: 'skills' },
        { type: 'scroll', label: 'See Projects', target: 'projects' },
        { type: 'summarize', label: 'Summarize Portfolio', target: 'portfolio' }
      ],
      pinnedFacts: []
    };
  }

  const topRecords = retrieval.records;
  const summary = topRecords.length
    ? summarizeText(topRecords.map((record) => record.content).join(' '), 240)
    : "I can help explain Dee's background, skills, projects, contact options, and portfolio direction, but I need more portfolio context to answer this precisely.";

  const sections = buildFallbackSections(topRecords, intent, audience);
  const suggestedActions = [];

  if (intent === 'recruiter-fit') {
    suggestedActions.push({ type: 'scroll', label: 'See Projects', target: 'projects' });
    suggestedActions.push({ type: 'link', label: 'Open Resume', href: '/media/Files/MyResume.pdf' });
  }

  if (/\b(skill|stack|technology|tool)\b/i.test(message)) {
    suggestedActions.push({ type: 'scroll', label: 'View Skills', target: 'skills' });
  }
  if (/\b(project|work|built)\b/i.test(message)) {
    suggestedActions.push({ type: 'scroll', label: 'See Projects', target: 'projects' });
  }
  if (/\b(contact|email|reach|hire)\b/i.test(message)) {
    suggestedActions.push({ type: 'scroll', label: 'Contact Dee', target: 'contact' });
  }
  if (/\b(resume|cv)\b/i.test(message)) {
    suggestedActions.push({ type: 'link', label: 'Open Resume', href: '/media/Files/MyResume.pdf' });
  }

  return {
    summary,
    sections,
    citationIds: topRecords.map((record) => record.id),
    suggestedActions,
    pinnedFacts: []
  };
}

function safeJsonParse(rawText) {
  try {
    return JSON.parse(rawText);
  } catch (error) {
    return null;
  }
}

function extractJsonPayload(rawText) {
  if (typeof rawText !== 'string' || !rawText.trim()) {
    return null;
  }

  const direct = safeJsonParse(rawText);
  if (direct) {
    return direct;
  }

  const fencedMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    const fromFence = safeJsonParse(fencedMatch[1].trim());
    if (fromFence) {
      return fromFence;
    }
  }

  const firstBrace = rawText.indexOf('{');
  const lastBrace = rawText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return safeJsonParse(rawText.slice(firstBrace, lastBrace + 1));
  }

  return null;
}

function buildFallbackSections(topRecords, intent, audience) {
  const sections = [];
  const evidencePoints = topRecords.slice(0, 4).map((record) => `- ${record.title}: ${summarizeText(record.summary || record.content, 140)}`);

  if (intent === 'recruiter-fit') {
    sections.push({
      label: 'Why Dee Fits',
      content: topRecords.length
        ? summarizeText(topRecords.map((record) => record.content).join(' '), 360)
        : 'Dee is positioned around AI systems, modern web engineering, and practical delivery.'
    });
  } else if (intent === 'summarization') {
    sections.push({
      label: 'Portfolio Summary',
      content: topRecords.length
        ? summarizeText(topRecords.map((record) => record.content).join(' '), 420)
        : 'The portfolio highlights Dee as an AI Product & Systems Engineer with modern web and backend capabilities.'
    });
  } else if (topRecords.length) {
    sections.push({
      label: 'Direct Answer',
      content: summarizeText(topRecords.map((record) => record.content).join(' '), 360)
    });
  }

  if (evidencePoints.length) {
    sections.push({
      label: 'Evidence',
      content: evidencePoints.join('\n')
    });
  }

  if (audience === 'recruiter') {
    sections.push({
      label: 'Why This Matters',
      content: 'For a recruiter, the strongest signals on this portfolio are Dee\'s AI positioning, full-stack range, visible problem-solving emphasis, and direct access to projects, resume, and contact channels.'
    });
  }

  return sections;
}

async function generateChatbotResponse({ session, message, intent, audience, retrieval }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      payload: createFallbackResponse({ message, retrieval, intent, audience }),
      provider: 'fallback',
      providerError: 'Missing GEMINI_API_KEY'
    };
  }

  try {
    const prompt = buildPromptEnvelope({ session, message, retrieval, audience, intent });
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        generationConfig: {
          responseMimeType: 'application/json'
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    const rawResponseText = await response.text();
    if (!response.ok) {
      return {
        payload: createFallbackResponse({ message, retrieval, intent, audience }),
        provider: 'fallback',
        providerError: `Gemini HTTP ${response.status}: ${summarizeText(rawResponseText, 220)}`
      };
    }

    const body = safeJsonParse(rawResponseText);
    const modelText = body?.candidates?.[0]?.content?.parts?.map((part) => part?.text || '').join('\n').trim() || '';

    const parsed = extractJsonPayload(modelText);
    if (parsed && typeof parsed.summary === 'string') {
      return {
        payload: parsed,
        provider: 'gemini',
        providerError: null
      };
    }

    return {
      payload: createFallbackResponse({ message, retrieval, intent, audience }),
      provider: 'fallback',
      providerError: 'Gemini response was not valid JSON'
    };
  } catch (error) {
    console.warn('⚠️  Gemini generation failed, using fallback response:', error.message);
    return {
      payload: createFallbackResponse({ message, retrieval, intent, audience }),
      provider: 'fallback',
      providerError: error?.message || 'Gemini request failed'
    };
  }
}

function toCitations(records, citationIds) {
  const set = new Set(Array.isArray(citationIds) ? citationIds : []);
  return records
    .filter((record) => set.has(record.id))
    .map((record) => ({
      label: record.title,
      sourceId: record.id,
      anchor: record.source?.anchor || 'home',
      path: record.source?.path || ''
    }));
}

function normalizeSuggestedActions(actions) {
  if (!Array.isArray(actions)) {
    return [];
  }

  return actions
    .filter((action) => action && typeof action.type === 'string' && typeof action.label === 'string')
    .map((action) => ({
      type: action.type,
      label: action.label,
      target: action.target,
      href: action.href,
      subjectId: action.subjectId
    }));
}

function buildAssistantMessage(payload, retrieval, intent, session, providerMeta = {}) {
  return {
    id: createMessageId(),
    role: 'assistant',
    summary: summarizeText(payload.summary || 'I found some relevant portfolio context for that question.', 280),
    sections: Array.isArray(payload.sections) ? payload.sections.filter((section) => section && section.label && section.content) : [],
    citations: toCitations(retrieval.records, payload.citationIds),
    suggestedActions: normalizeSuggestedActions(payload.suggestedActions),
    meta: {
      intent,
      usedMemory: Boolean(session?.rollingSummary || session?.pinnedFacts?.length || (session?.recentTurns?.length || 0) > 2),
      usedRetrieval: Boolean(retrieval.records.length),
      stageTrace: CHATBOT_STAGE_TRACE,
      provider: providerMeta.provider || 'unknown',
      providerError: providerMeta.providerError || null
    }
  };
}

function mergePinnedFacts(session, nextPinnedFacts) {
  if (!Array.isArray(nextPinnedFacts) || !nextPinnedFacts.length) {
    return;
  }

  const merged = new Set(session.pinnedFacts);
  nextPinnedFacts.forEach((item) => {
    if (typeof item === 'string' && item.trim()) {
      merged.add(item.trim());
    }
  });
  session.pinnedFacts = Array.from(merged).slice(-12);
}


const secretCipherKey = process.env.ADMIN_SECRETS_KEY
  ? crypto.createHash('sha256').update(process.env.ADMIN_SECRETS_KEY).digest()
  : null;

const runtimeSecretMeta = {
  firebaseWebConfig: {}
};

function encryptSecret(plainText) {
  if (!secretCipherKey) {
    return null;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', secretCipherKey, iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    content: encrypted.toString('base64')
  };
}

function decryptSecret(payload) {
  if (!secretCipherKey || !payload?.iv || !payload?.tag || !payload?.content) {
    return null;
  }

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    secretCipherKey,
    Buffer.from(payload.iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.content, 'base64')),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}

function resolveSecretsReadPath() {
  if (fs.existsSync(secretsStorePath)) {
    return secretsStorePath;
  }

  if (fs.existsSync(legacySecretsStorePath)) {
    return legacySecretsStorePath;
  }

  return secretsStorePath;
}

function shouldSyncEnvFile() {
  if (process.env.DISABLE_ENV_SYNC === 'true') {
    return false;
  }

  // Serverless environments like Vercel have immutable runtime filesystems.
  if (process.env.VERCEL === '1' || process.env.VERCEL) {
    return false;
  }

  return true;
}

function shouldPersistSecretsFile() {
  if (process.env.DISABLE_SECRET_STORE === 'true') {
    return false;
  }

  // Serverless runtimes (like Vercel) do not provide durable writable files.
  if (process.env.VERCEL === '1' || process.env.VERCEL) {
    return false;
  }

  return true;
}

function escapeEnvValue(value) {
  const safe = String(value).replace(/\r?\n/g, '');
  if (/^[A-Za-z0-9_./:@-]+$/.test(safe)) {
    return safe;
  }

  return JSON.stringify(safe);
}

function upsertEnvLines(fileContent, updates) {
  let next = fileContent;

  Object.entries(updates).forEach(([key, value]) => {
    const serialized = `${key}=${escapeEnvValue(value)}`;
    const matcher = new RegExp(`^${key}=.*$`, 'm');

    if (matcher.test(next)) {
      next = next.replace(matcher, serialized);
      return;
    }

    if (next.length > 0 && !next.endsWith('\n')) {
      next += '\n';
    }

    next += `${serialized}\n`;
  });

  return next;
}

function applyFirebaseConfigToRuntimeEnv(values) {
  Object.entries(values).forEach(([configKey, configValue]) => {
    const envKeys = FIREBASE_ENV_KEY_MAP[configKey] || [];
    envKeys.forEach((envKey) => {
      process.env[envKey] = configValue;
    });
  });
}

function syncFirebaseConfigToEnvFile(values) {
  if (!shouldSyncEnvFile()) {
    return { synced: false, reason: 'Runtime filesystem is not writable (or sync disabled).' };
  }

  const envUpdates = {};
  Object.entries(values).forEach(([configKey, configValue]) => {
    const envKeys = FIREBASE_ENV_KEY_MAP[configKey] || [];
    envKeys.forEach((envKey) => {
      envUpdates[envKey] = configValue;
    });
  });

  const currentContent = fs.existsSync(runtimeEnvPath)
    ? fs.readFileSync(runtimeEnvPath, 'utf8')
    : '';

  const nextContent = upsertEnvLines(currentContent, envUpdates);
  fs.writeFileSync(runtimeEnvPath, nextContent, 'utf8');

  return { synced: true, path: runtimeEnvPath };
}

function loadPersistedFirebaseSecrets() {
  const readPath = resolveSecretsReadPath();
  if (!fs.existsSync(readPath)) {
    return;
  }

  try {
    const raw = JSON.parse(fs.readFileSync(readPath, 'utf8'));
    const saved = raw?.firebaseWebConfig || {};

    FIREBASE_SECRET_KEYS.forEach((key) => {
      const savedEntry = saved[key];
      if (!savedEntry) {
        return;
      }

      runtimeSecretMeta.firebaseWebConfig[key] = {
        configured: true,
        updatedAt: savedEntry.updatedAt || null
      };

      const decrypted = decryptSecret(savedEntry.encrypted);
      if (typeof decrypted === 'string') {
        firebaseWebConfig[key] = decrypted;
      }
    });
  } catch (error) {
    console.warn('⚠️  Failed to load persisted admin secrets:', error.message);
  }
}

function persistFirebaseSecrets(values) {
  if (!secretCipherKey) {
    throw new Error('ADMIN_SECRETS_KEY is required for secrets storage.');
  }

  let existing = {};
  if (fs.existsSync(secretsStorePath)) {
    existing = JSON.parse(fs.readFileSync(secretsStorePath, 'utf8'));
  }

  if (!existing.firebaseWebConfig) {
    existing.firebaseWebConfig = {};
  }

  Object.entries(values).forEach(([key, value]) => {
    existing.firebaseWebConfig[key] = {
      encrypted: encryptSecret(value),
      updatedAt: new Date().toISOString()
    };
  });

  fs.writeFileSync(secretsStorePath, JSON.stringify(existing, null, 2), 'utf8');
}

async function requireAuthenticatedAdmin(req, res, next) {
  if (!admin.apps.length) {
    return res.status(503).json({ error: 'Admin authentication unavailable.' });
  }

  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Bearer token.' });
  }

  try {
    const token = authHeader.slice('Bearer '.length);
    const decoded = await admin.auth().verifyIdToken(token);
    const allowedUids = (process.env.ADMIN_UIDS || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    if (allowedUids.length > 0 && !allowedUids.includes(decoded.uid)) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    req.adminUser = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
}

loadPersistedFirebaseSecrets();

// Initialize Firebase Admin SDK
try {
  let serviceAccount;
  
  // Try environment variable first (for Vercel/cloud deployment)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log('Loading service account from environment variable');
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Fall back to local file (for local development)
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    console.log('Loading service account from file:', serviceAccountPath);
    
    if (!fs.existsSync(serviceAccountPath)) {
      console.warn('⚠️  Warning: Firebase Admin SDK not initialized (no service account found)');
      console.warn('Upload functionality will not work. Add FIREBASE_SERVICE_ACCOUNT env var or serviceAccountKey.json file.');
    } else {
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    }
  }
  
  if (serviceAccount) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log('✅ Firebase Admin SDK initialized successfully');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  console.warn('Upload functionality will not work.');
}

app.use(cors());
app.use(express.json());

app.get('/firebase-config.js', (req, res) => {
  const missingKeys = Object.entries(firebaseWebConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  const warning = missingKeys.length
    ? `console.warn('Missing Firebase web config keys at runtime: ${missingKeys.join(', ')}');`
    : '';

  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(`${warning}\nwindow.FIREBASE_CONFIG = ${JSON.stringify(firebaseWebConfig)};`);
});

app.use(express.static(__dirname));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

function getChatbotConfigStatus() {
  const knowledge = loadChatbotKnowledge();
  return {
    gemini: {
      configured: Boolean(process.env.GEMINI_API_KEY)
    },
    prompts: {
      configured: ['system.md', 'tone.md', 'retrieval.md', 'summarization.md', 'safety.md'].every((fileName) => {
        return fs.existsSync(path.join(chatbotPromptsPath, fileName));
      })
    },
    knowledge: {
      configured: knowledge.records.length > 0,
      records: knowledge.records.length
    },
    sessions: {
      configured: true,
      active: chatbotSessions.size
    }
  };
}

function updateSessionIntent(session, message, intent) {
  session.userIntentProfile.audience = inferAudience(message, session.userIntentProfile.audience);

  if (intent !== 'general') {
    session.userIntentProfile.goal = intent;
  } else if (!session.userIntentProfile.goal) {
    session.userIntentProfile.goal = 'general';
  }
}

async function handleChatbotSessionCreate(req, res) {
  const session = createSession();
  return res.json({
    sessionId: session.sessionId,
    message: getWelcomeMessage()
  });
}

async function handleChatbotMessage(req, res) {
  const session = getSession(req.body?.sessionId);
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

  if (!session) {
    return res.status(404).json({ error: 'Session not found.' });
  }

  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const intent = inferIntent(message);
  updateSessionIntent(session, message, intent);

  const retrieval = retrieveKnowledge(message, intent);
  const audience = session.userIntentProfile.audience;

  storeTurn(session, 'user', message);

  const generated = await generateChatbotResponse({
    session,
    message,
    intent,
    audience,
    retrieval
  });

  mergePinnedFacts(session, generated.payload.pinnedFacts);

  const assistantMessage = buildAssistantMessage(generated.payload, retrieval, intent, session, generated);
  storeTurn(session, 'assistant', [assistantMessage.summary, ...assistantMessage.sections.map((section) => `${section.label}: ${section.content}`)].join(' '));

  return res.json({
    sessionId: session.sessionId,
    status: 'completed',
    assistantMessage
  });
}

async function handleChatbotSummarize(req, res) {
  const session = getSession(req.body?.sessionId) || createSession();
  const target = typeof req.body?.target === 'string' ? req.body.target.trim() : 'portfolio';
  const audience = typeof req.body?.audience === 'string' ? req.body.audience.trim() : session.userIntentProfile.audience || 'general';
  const subjectId = typeof req.body?.subjectId === 'string' ? req.body.subjectId.trim() : '';

  const syntheticMessageParts = [`Summarize ${target}`];
  if (subjectId) syntheticMessageParts.push(subjectId);
  if (audience && audience !== 'unknown') syntheticMessageParts.push(`for ${audience}`);
  const message = syntheticMessageParts.join(' ');

  const retrieval = subjectId
    ? {
        site: loadChatbotKnowledge().site,
        records: loadChatbotKnowledge().records.filter((record) => record.id === subjectId || record.type === target).slice(0, 5)
      }
    : retrieveKnowledge(message, 'summarization');

  const generated = await generateChatbotResponse({
    session,
    message,
    intent: 'summarization',
    audience,
    retrieval
  });

  const assistantMessage = buildAssistantMessage(generated.payload, retrieval, 'summarization', session, generated);

  return res.json({
    sessionId: session.sessionId,
    status: 'completed',
    assistantMessage
  });
}

function handleChatbotConfigStatus(req, res) {
  return res.json({ status: getChatbotConfigStatus() });
}

app.post('/chatbot/session', handleChatbotSessionCreate);
app.post('/api/chatbot/session', handleChatbotSessionCreate);

app.post('/chatbot/message', handleChatbotMessage);
app.post('/api/chatbot/message', handleChatbotMessage);

app.post('/chatbot/summarize', handleChatbotSummarize);
app.post('/api/chatbot/summarize', handleChatbotSummarize);

app.get('/chatbot/config/status', handleChatbotConfigStatus);
app.get('/api/chatbot/config/status', handleChatbotConfigStatus);

function handleFirebaseSecretStatus(req, res) {
  const status = {};

  FIREBASE_SECRET_KEYS.forEach((key) => {
    status[key] = {
      configured: Boolean(firebaseWebConfig[key]),
      updatedAt: runtimeSecretMeta.firebaseWebConfig[key]?.updatedAt || null
    };
  });

  res.json({ status });
}

function handleFirebaseSecretUpdate(req, res) {
  if (!secretCipherKey) {
    return res.status(503).json({ error: 'Server secret key is not configured. Set ADMIN_SECRETS_KEY.' });
  }

  const values = req.body?.values || {};
  const filtered = {};

  FIREBASE_SECRET_KEYS.forEach((key) => {
    const nextValue = values[key];
    if (typeof nextValue === 'string' && nextValue.trim()) {
      filtered[key] = nextValue.trim();
    }
  });

  if (Object.keys(filtered).length === 0) {
    return res.status(400).json({ error: 'No valid keys provided.' });
  }

  try {
    Object.entries(filtered).forEach(([key, value]) => {
      firebaseWebConfig[key] = value;
      runtimeSecretMeta.firebaseWebConfig[key] = {
        configured: true,
        updatedAt: new Date().toISOString()
      };
    });

    applyFirebaseConfigToRuntimeEnv(filtered);

    let secretStore = { persisted: false, reason: 'Not attempted.' };
    if (shouldPersistSecretsFile()) {
      persistFirebaseSecrets(filtered);
      secretStore = { persisted: true, path: secretsStorePath };
    } else {
      secretStore = { persisted: false, reason: 'Runtime filesystem is not durable (or persistence disabled).' };
    }

    let envSync = { synced: false, reason: 'Not attempted.' };
    try {
      envSync = syncFirebaseConfigToEnvFile(filtered);
    } catch (syncError) {
      envSync = { synced: false, reason: syncError.message };
    }

    return res.json({
      success: true,
      updatedKeys: Object.keys(filtered),
      envSync,
      secretStore
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

app.get('/admin/secrets/firebase-config/status', requireAuthenticatedAdmin, handleFirebaseSecretStatus);
app.get('/api/admin/secrets/firebase-config/status', requireAuthenticatedAdmin, handleFirebaseSecretStatus);

app.post('/admin/secrets/firebase-config', requireAuthenticatedAdmin, handleFirebaseSecretUpdate);
app.post('/api/admin/secrets/firebase-config', requireAuthenticatedAdmin, handleFirebaseSecretUpdate);

// Upload endpoint
async function handleUpload(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'User ID required in x-user-id header' });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: 'Upload service not available. BLOB_READ_WRITE_TOKEN not configured.' });
  }

  const fileName = `${Date.now()}-${req.file.originalname}`;
  const pathname = `post-images/${userId}/${fileName}`;

  try {
    const blob = await put(pathname, req.file.buffer, {
      access: 'public',
      contentType: req.file.mimetype,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    console.log(`Upload complete: ${blob.url}`);
    res.json({ success: true, url: blob.url, path: pathname, mimeType: req.file.mimetype });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
}

app.post('/upload', upload.single('file'), handleUpload);
app.post('/api/upload', upload.single('file'), handleUpload);

// SPA history fallback for BrowserRouter routes.
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  if (['/firebase-config.js', '/health', '/upload'].includes(req.path)) {
    return next();
  }

  if (path.extname(req.path)) {
    return next();
  }

  return res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn('⚠️  BLOB_READ_WRITE_TOKEN is not set — uploads will not work.');
  }

  console.log(`Upload server running on http://localhost:${PORT}`);
});
