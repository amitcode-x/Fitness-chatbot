import { useState, useRef, useEffect } from "react";
import Message from "./Message";
import InputBox from "./InputBox";
import { getFitnessResponse } from "../api/gemini";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickOptions = [
    { label: "Lose Weight", emoji: "🔥" },
    { label: "Gain Muscle", emoji: "💪" },
    { label: "Diet Plan", emoji: "🥗" },
    { label: "Home Workout", emoji: "🏠" },
    { label: "Cardio Tips", emoji: "🏃" },
    { label: "Sleep & Recovery", emoji: "😴" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    if (!text) return;
    const userMsg = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    const reply = await getFitnessResponse(text);
    const botMsg = { role: "bot", text: reply };
    setMessages((prev) => [...prev, botMsg]);
    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden relative bg-[#020818]">

      {/* Background orbs — fixed so they don't scroll */}
      <div className="fixed top-[-10%] left-[-5%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse z-0" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none animate-pulse delay-1000 z-0" />

      {/* ── HEADER — shrink-0 so it never squishes ── */}
      <div className="shrink-0 z-20 backdrop-blur-2xl bg-[#020818]/70 border-b border-white/[0.08]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-lg shadow-[0_0_20px_rgba(74,222,128,0.3)]">
              💪
            </div>
            <div>
              <div className="text-white font-black text-base tracking-tight leading-none">FitAI Coach</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-xs font-medium">Online</span>
              </div>
            </div>
          </div>
          <div className="backdrop-blur-xl bg-white/[0.06] border border-white/10 rounded-full px-4 py-2 flex items-center gap-3">
            <span className="text-white/40 text-xs">{messages.length} messages</span>
            <div className="w-px h-3 bg-white/10" />
            <span className="text-green-400 text-xs font-semibold">Gemini AI</span>
          </div>
        </div>
      </div>

      {/* ── MESSAGES — flex-1 + overflow-y-auto = only this scrolls ── */}
      <div className="flex-1 overflow-y-auto z-10">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

          {messages.length === 0 && (
            <div className="flex flex-col items-center text-center pt-8 pb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400/20 to-emerald-600/20 border border-green-500/20 flex items-center justify-center text-3xl mb-5 shadow-[0_0_40px_rgba(74,222,128,0.15)]">
                🏋️
              </div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">What's your goal today?</h2>
              <p className="text-white/40 text-sm mb-8 max-w-xs leading-relaxed">
                Tell me your fitness goal or pick a quick option below to get started.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {quickOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(opt.label)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl backdrop-blur-xl bg-white/[0.06] border border-white/10 text-white/70 text-sm font-medium hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400 active:scale-95 transition-all duration-200"
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <Message key={i} msg={msg} />
          ))}

          {loading && (
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-sm shrink-0 shadow-[0_0_15px_rgba(74,222,128,0.3)] mb-1">
                🤖
              </div>
              <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400/70 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-green-400/70 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-green-400/70 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── FOOTER — shrink-0 so it never squishes ── */}
      <div className="shrink-0 z-20 backdrop-blur-2xl bg-[#020818]/70 border-t border-white/[0.08]">
        <InputBox sendMessage={sendMessage} />
      </div>

    </div>
  );
}

export default Chat;