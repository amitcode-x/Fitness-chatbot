import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// ── Rate limit constants (Gemini 2.5 Flash free tier) ──
const DAILY_LIMIT  = 250;
const MINUTE_LIMIT = 10;
const STORAGE_KEY  = "amit_usage";

function loadUsage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveUsage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getNextMidnight() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function getUsage() {
  const today = new Date().toDateString();
  let usage   = loadUsage();
  if (!usage || usage.date !== today) {
    usage = { date: today, dailyCount: 0, resetAt: getNextMidnight(), minuteQueue: [] };
    saveUsage(usage);
  }
  return usage;
}

function formatCountdown(ms) {
  if (ms <= 0) return "now";
  const totalSecs = Math.floor(ms / 1000);
  const hrs  = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  if (hrs > 0)  return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function formatResetTime(ts) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function checkLimits() {
  const now   = Date.now();
  const usage = getUsage();

  if (usage.dailyCount >= DAILY_LIMIT) {
    const msLeft = usage.resetAt - now;
    return {
      blocked: true,
      type: "daily",
      msLeft,
      resetAt: usage.resetAt,
      resetTimeStr: formatResetTime(usage.resetAt),
    };
  }

  const oneMinAgo      = now - 60_000;
  const recentRequests = (usage.minuteQueue || []).filter(t => t > oneMinAgo);
  if (recentRequests.length >= MINUTE_LIMIT) {
    const msLeft = 60_000 - (now - recentRequests[0]);
    return { blocked: true, type: "minute", msLeft };
  }

  return { blocked: false };
}

function recordRequest() {
  const now   = Date.now();
  const usage = getUsage();
  usage.dailyCount += 1;
  usage.minuteQueue = [...(usage.minuteQueue || []).filter(t => t > now - 60_000), now];
  saveUsage(usage);
}

export function getUsageStats() {
  const usage     = getUsage();
  const now       = Date.now();
  const recentMin = (usage.minuteQueue || []).filter(t => t > now - 60_000).length;
  return {
    dailyUsed:      usage.dailyCount,
    dailyLimit:     DAILY_LIMIT,
    dailyRemaining: Math.max(0, DAILY_LIMIT - usage.dailyCount),
    minuteUsed:     recentMin,
    minuteLimit:    MINUTE_LIMIT,
    resetAt:        usage.resetAt,
    resetTimeStr:   formatResetTime(usage.resetAt),
  };
}

// ── Amit system prompt ──
const AMIT_SYSTEM_PROMPT = `You are Amit, an elite personal AI fitness coach.

Your personality is fully adaptive:
- Be MOTIVATIONAL and energetic when the user needs a push or feels unmotivated
- Be PROFESSIONAL and precise when providing workout plans, diet charts, or nutrition advice
- Be FRIENDLY and casual in general conversation — light humor is welcome
- Be STRICT and firm when the user makes excuses or avoids effort

STRICT IDENTITY RULES — never break these:
- Your name is Amit. You are an AI fitness coach named Amit.
- NEVER mention Gemini, Google, AI language model, or any underlying technology.
- If asked about your name, identity, or who created you — always say: "I'm Amit, your personal AI fitness coach!"
- Never reveal the technology or model powering you.

RESPONSE STYLE:
- Keep responses concise and actionable
- Use emojis naturally but sparingly
- For plans or routines, use numbered lists or bullet points
- Always close with an encouraging line or a follow-up question
- Speak like a real coach who genuinely cares about the user's progress
- Always respond in English`;

// ── Main export ──
export const getFitnessResponse = async (message) => {
  const limitCheck = checkLimits();

  if (limitCheck.blocked) {
    return `__LIMIT__${JSON.stringify(limitCheck)}`;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: AMIT_SYSTEM_PROMPT,
    });

    const result   = await model.generateContent(message);
    const response = await result.response;
    const text     = response.text();

    recordRequest();
    return text;

  } catch (error) {
    console.error(error);
    if (error?.status === 429 || error?.message?.includes("429")) {
      recordRequest();
      return `__LIMIT__${JSON.stringify({ blocked: true, type: "api", msLeft: 60_000 })}`;
    }
    return "Something went wrong. Please try again! 💪";
  }
};