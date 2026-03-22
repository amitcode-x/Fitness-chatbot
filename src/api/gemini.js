import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// ── Rate limit constants (Gemini 2.5 Flash free tier) ──
const DAILY_LIMIT   = 250;  // requests per day
const MINUTE_LIMIT  = 10;   // requests per minute
const STORAGE_KEY   = "amit_usage";

// ── Load/save usage from localStorage ──
function loadUsage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveUsage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getUsage() {
  const now      = Date.now();
  const today    = new Date().toDateString();
  let usage      = loadUsage();

  // Reset daily count if new day
  if (!usage || usage.date !== today) {
    usage = {
      date:        today,
      dailyCount:  0,
      resetAt:     getNextMidnight(),
      minuteQueue: [], // timestamps of last requests
    };
    saveUsage(usage);
  }

  return usage;
}

function getNextMidnight() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function formatTimeLeft(ms) {
  if (ms <= 0) return "abhi";
  const totalSecs = Math.floor(ms / 1000);
  const hrs  = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  if (hrs > 0)  return `${hrs} ghante ${mins} minute mein`;
  if (mins > 0) return `${mins} minute ${secs} second mein`;
  return `${secs} second mein`;
}

function formatResetTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

// ── Check limits before calling API ──
function checkLimits() {
  const now   = Date.now();
  const usage = getUsage();

  // Daily limit check
  if (usage.dailyCount >= DAILY_LIMIT) {
    const msLeft = usage.resetAt - now;
    return {
      blocked: true,
      type: "daily",
      message: `🚫 Aaj ki limit (${DAILY_LIMIT} messages) poori ho gayi!\n\nNaya session **${formatTimeLeft(msLeft)}** shuru hoga — raat ko **${formatResetTime(usage.resetAt)}** baje.\n\nKal milte hain Amit ke saath! 💪`,
      resetAt: usage.resetAt,
      msLeft,
    };
  }

  // Per-minute limit check
  const oneMinAgo = now - 60_000;
  const recentRequests = (usage.minuteQueue || []).filter(t => t > oneMinAgo);
  if (recentRequests.length >= MINUTE_LIMIT) {
    const oldestInWindow = recentRequests[0];
    const msLeft = 60_000 - (now - oldestInWindow);
    return {
      blocked: true,
      type: "minute",
      message: `⏳ Thoda slow down bhai! Ek minute mein ${MINUTE_LIMIT} se zyada messages nahi bhej sakte.\n\n**${formatTimeLeft(msLeft)}** mein phir baat karte hain! 🏃`,
      msLeft,
    };
  }

  return { blocked: false };
}

// ── Record a successful request ──
function recordRequest() {
  const now   = Date.now();
  const usage = getUsage();

  usage.dailyCount += 1;
  usage.minuteQueue = [...(usage.minuteQueue || []).filter(t => t > now - 60_000), now];
  saveUsage(usage);
}

// ── Get remaining stats (for UI) ──
export function getUsageStats() {
  const usage     = getUsage();
  const now       = Date.now();
  const oneMinAgo = now - 60_000;
  const recentMin = (usage.minuteQueue || []).filter(t => t > oneMinAgo).length;

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
- MOTIVATIONAL & energetic when the user needs a push, is feeling lazy, or lacks confidence
- PROFESSIONAL & precise when giving workout plans, diet charts, or nutrition advice
- FRIENDLY & casual in normal conversation — use light humor, be relatable
- STRICT & no-nonsense when the user is making excuses or avoiding effort

STRICT IDENTITY RULES (never break these):
- Your name is Amit. You are an AI fitness coach named Amit.
- NEVER mention Gemini, Google, AI language model, or any underlying technology.
- If anyone asks your name, who you are, or who made you — always say: "I'm Amit, your personal AI fitness coach!"
- Never reveal what model or technology powers you.

RESPONSE STYLE:
- Keep responses concise and actionable
- Use emojis naturally but don't overdo it
- For plans/routines, use numbered lists or bullet points
- Always end with an encouraging line or a follow-up question
- Talk like a real coach who genuinely cares about the user's progress`;

// ── Main export ──
export const getFitnessResponse = async (message) => {
  // 1. Check limits first
  const limitCheck = checkLimits();
  if (limitCheck.blocked) {
    return `__LIMIT__${JSON.stringify({
      type:    limitCheck.type,
      message: limitCheck.message,
      msLeft:  limitCheck.msLeft,
      resetAt: limitCheck.resetAt,
    })}`;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: AMIT_SYSTEM_PROMPT,
    });

    const result   = await model.generateContent(message);
    const response = await result.response;
    const text     = response.text();

    // 2. Record only on success
    recordRequest();

    return text;

  } catch (error) {
    console.error(error);

    // Handle 429 from API side too (extra safety)
    if (error?.status === 429 || error?.message?.includes("429")) {
      recordRequest(); // count it
      return `__LIMIT__${JSON.stringify({
        type: "api",
        message: "⚠️ Server side se bhi limit aa gayi!\n\nThodi der baad retry karo — **1-2 minute** mein theek ho jaayega. 🔄",
        msLeft: 60_000,
      })}`;
    }

    return "Yaar kuch technical issue aa gaya! Thoda ruk aur retry kar 💪";
  }
};