import { useState, useRef, useEffect } from "react";
import Message from "./Message";
import InputBox from "./InputBox";
import { getFitnessResponse } from "../api/gemini";

const GRID_SIZE = 24;

function Chat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const canvasRef = useRef(null);

  const quickOptions = [
    { label: "Lose Weight",     emoji: "🔥" },
    { label: "Gain Muscle",     emoji: "💪" },
    { label: "Diet Plan",       emoji: "🥗" },
    { label: "Home Workout",    emoji: "🏠" },
    { label: "Cardio Tips",     emoji: "🏃" },
    { label: "Sleep & Recovery",emoji: "😴" },
  ];

  /* ── Neural canvas (same as Intro) ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animFrame, t = 0;

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const nodes = [];
    const buildNodes = () => {
      nodes.length = 0;
      const COLS = Math.ceil(canvas.offsetWidth  / GRID_SIZE) + 1;
      const ROWS = Math.ceil(canvas.offsetHeight / GRID_SIZE) + 1;
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
          nodes.push({
            x: c * GRID_SIZE, y: r * GRID_SIZE,
            phase: Math.random() * Math.PI * 2,
            speed: 0.3 + Math.random() * 0.4,
          });
    };
    buildNodes();
    window.addEventListener("resize", buildNodes);

    const draw = () => {
      t += 0.012;
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < nodes.length; i++) {
        const a  = nodes[i];
        const ax = a.x + Math.sin(t * a.speed + a.phase) * 3;
        const ay = a.y + Math.cos(t * a.speed + a.phase) * 3;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          if (Math.hypot(a.x - b.x, a.y - b.y) > GRID_SIZE * 1.6) continue;
          const bx    = b.x + Math.sin(t * b.speed + b.phase) * 3;
          const by    = b.y + Math.cos(t * b.speed + b.phase) * 3;
          const pulse = (Math.sin(t * 1.2 + a.phase + b.phase) + 1) / 2;
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
          ctx.strokeStyle = `rgba(52,211,153,${0.03 + pulse * 0.07})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
      for (const n of nodes) {
        const nx   = n.x + Math.sin(t * n.speed + n.phase) * 3;
        const ny   = n.y + Math.cos(t * n.speed + n.phase) * 3;
        const glow = (Math.sin(t * n.speed + n.phase) + 1) / 2;
        ctx.beginPath(); ctx.arc(nx, ny, 1 + glow * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52,211,153,${0.08 + glow * 0.18})`; ctx.fill();
      }
      animFrame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", buildNodes);
    };
  }, []);

  /* ── Auto-scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);
    const reply = await getFitnessResponse(text);
    setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500&display=swap');
        .chat-root { font-family: 'DM Sans', sans-serif; }

        @keyframes scanLine {
          0%   { transform: translateY(-100%); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(100vh);  opacity: 0; }
        }
        .scan-line { animation: scanLine 6s linear infinite; }

        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(1);   }
          50%       { opacity: 1;   transform: scale(1.5); }
        }
        .dot1 { animation: dotPulse 1.4s ease-in-out 0.0s infinite; }
        .dot2 { animation: dotPulse 1.4s ease-in-out 0.2s infinite; }
        .dot3 { animation: dotPulse 1.4s ease-in-out 0.4s infinite; }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg,#34d399,#6ee7b7,#a7f3d0,#6ee7b7,#34d399);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.15s both; }

        .quick-btn {
          transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s;
        }
        .quick-btn:hover {
          background: rgba(52,211,153,0.1) !important;
          border-color: rgba(52,211,153,0.35) !important;
          color: #34d399 !important;
          transform: translateY(-2px);
        }
        .quick-btn:active { transform: scale(0.95); }

        /* scrollbar */
        .messages-scroll::-webkit-scrollbar { width: 4px; }
        .messages-scroll::-webkit-scrollbar-track { background: transparent; }
        .messages-scroll::-webkit-scrollbar-thumb { background: rgba(52,211,153,0.15); border-radius: 99px; }
        .messages-scroll::-webkit-scrollbar-thumb:hover { background: rgba(52,211,153,0.3); }
      `}</style>

      <div
        className="chat-root h-screen flex flex-col overflow-hidden relative"
        style={{ background: "#020c18" }}
      >
        {/* Neural canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        />

        {/* Scan line */}
        <div
          className="scan-line absolute left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg,transparent,rgba(52,211,153,0.4),transparent)", zIndex: 1 }}
        />

        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(52,211,153,0.05) 0%, transparent 70%)",
          zIndex: 1,
        }} />

        {/* Corner brackets */}
        {[
          { top:"1rem",    left:"1rem",  borderTop:true,    borderLeft:true  },
          { top:"1rem",    right:"1rem", borderTop:true,    borderRight:true },
          { bottom:"1rem", left:"1rem",  borderBottom:true, borderLeft:true  },
          { bottom:"1rem", right:"1rem", borderBottom:true, borderRight:true },
        ].map((s, i) => (
          <div key={i} className="absolute w-8 h-8 pointer-events-none" style={{
            ...s,
            borderTop:    s.borderTop    ? "1px solid rgba(52,211,153,0.25)" : undefined,
            borderLeft:   s.borderLeft   ? "1px solid rgba(52,211,153,0.25)" : undefined,
            borderBottom: s.borderBottom ? "1px solid rgba(52,211,153,0.25)" : undefined,
            borderRight:  s.borderRight  ? "1px solid rgba(52,211,153,0.25)" : undefined,
            zIndex: 2,
          }} />
        ))}

        {/* ── HEADER ── */}
        <div
          className="shrink-0 z-20 border-b"
          style={{
            backdropFilter: "blur(32px)",
            background: "rgba(2,12,24,0.75)",
            borderColor: "rgba(52,211,153,0.1)",
          }}
        >
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{
                  background: "linear-gradient(135deg,#065f46,#10b981)",
                  boxShadow: "0 0 20px rgba(52,211,153,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                💪
              </div>
              <div>
                <div
                  className="font-black text-base tracking-tight leading-none"
                  style={{ fontFamily: "'Syne', sans-serif", color: "#fff" }}
                >
                  FitAI <span className="shimmer-text">Coach</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="dot1 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-xs font-medium" style={{ color: "rgba(52,211,153,0.8)" }}>Online</span>
                </div>
              </div>
            </div>

            <div
              className="border rounded-full px-4 py-2 flex items-center gap-3"
              style={{
                backdropFilter: "blur(16px)",
                background: "rgba(255,255,255,0.04)",
                borderColor: "rgba(52,211,153,0.15)",
              }}
            >
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{messages.length} messages</span>
              <div className="w-px h-3" style={{ background: "rgba(255,255,255,0.1)" }} />
              <span className="text-xs font-semibold" style={{ color: "#34d399", fontFamily: "'Syne',sans-serif" }}>
                AI Coach
              </span>
            </div>
          </div>
        </div>

        {/* ── MESSAGES ── */}
        <div className="messages-scroll flex-1 overflow-y-auto z-10">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

            {/* Empty state */}
            {messages.length === 0 && (
              <div className="fade-up flex flex-col items-center text-center pt-8 pb-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5 border"
                  style={{
                    background: "rgba(52,211,153,0.06)",
                    borderColor: "rgba(52,211,153,0.2)",
                    boxShadow: "0 0 40px rgba(52,211,153,0.1)",
                  }}
                >
                  🏋️
                </div>
                <h2
                  className="text-2xl font-black text-white mb-2 tracking-tight"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  What's your goal today?
                </h2>
                <p className="text-sm mb-8 max-w-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.38)", fontWeight: 300 }}>
                  Tell me your fitness goal or pick a quick option below to get started.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {quickOptions.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(opt.label)}
                      className="quick-btn flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-medium"
                      style={{
                        backdropFilter: "blur(16px)",
                        background: "rgba(255,255,255,0.04)",
                        borderColor: "rgba(52,211,153,0.12)",
                        color: "rgba(255,255,255,0.6)",
                      }}
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

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-end gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 mb-1"
                  style={{
                    background: "linear-gradient(135deg,#065f46,#10b981)",
                    boxShadow: "0 0 16px rgba(52,211,153,0.3)",
                  }}
                >
                  🤖
                </div>
                <div
                  className="px-4 py-3 rounded-2xl rounded-bl-sm border"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(16px)",
                    borderColor: "rgba(52,211,153,0.12)",
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="dot1 w-2 h-2 rounded-full inline-block bg-emerald-400" style={{ opacity: 0.7 }} />
                    <span className="dot2 w-2 h-2 rounded-full inline-block bg-emerald-400" style={{ opacity: 0.7 }} />
                    <span className="dot3 w-2 h-2 rounded-full inline-block bg-emerald-400" style={{ opacity: 0.7 }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div
          className="shrink-0 z-20 border-t"
          style={{
            backdropFilter: "blur(32px)",
            background: "rgba(2,12,24,0.75)",
            borderColor: "rgba(52,211,153,0.1)",
          }}
        >
          <InputBox sendMessage={sendMessage} />
        </div>
      </div>
    </>
  );
}

export default Chat;