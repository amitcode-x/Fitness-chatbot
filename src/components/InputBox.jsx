import { useState } from "react";

function InputBox({ sendMessage }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const active = input.trim().length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .input-root { font-family: 'DM Sans', sans-serif; }

        @keyframes borderGlow {
          0%, 100% { border-color: rgba(52,211,153,0.15); box-shadow: 0 4px 40px rgba(0,0,0,0.4); }
          50%       { border-color: rgba(52,211,153,0.4);  box-shadow: 0 4px 40px rgba(52,211,153,0.1); }
        }
        .input-wrap-idle { animation: borderGlow 3s ease-in-out infinite; }
        .input-wrap-active {
          border-color: rgba(52,211,153,0.45) !important;
          box-shadow: 0 4px 40px rgba(52,211,153,0.15) !important;
          animation: none;
        }

        .send-btn {
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .send-btn:hover  { transform: scale(1.1); box-shadow: 0 0 24px rgba(52,211,153,0.5); }
        .send-btn:active { transform: scale(0.93); }

        .input-field::placeholder { color: rgba(255,255,255,0.25); }
        .input-field:focus { outline: none; }
      `}</style>

      <div className="input-root p-4 pb-6">
        <div className="max-w-3xl mx-auto">
          <div
            className={`flex items-center gap-3 border rounded-2xl px-4 py-3 transition-all duration-300 ${active ? "input-wrap-active" : "input-wrap-idle"}`}
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(32px)",
              borderColor: "rgba(52,211,153,0.15)",
            }}
          >
            {/* Left icon */}
            <span className="text-lg select-none" style={{ opacity: active ? 0.7 : 0.3 }}>🎯</span>

            {/* Input */}
            <input
              type="text"
              placeholder="Ask your fitness coach anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input-field flex-1 bg-transparent text-sm"
              style={{ color: "rgba(255,255,255,0.9)", fontFamily: "'DM Sans', sans-serif" }}
            />

            {/* Char count */}
            {active && (
              <span className="text-xs shrink-0" style={{ color: "rgba(52,211,153,0.4)", fontFamily: "'Syne', sans-serif" }}>
                {input.length}
              </span>
            )}

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!active}
              className="send-btn w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={
                active
                  ? {
                      background: "linear-gradient(135deg, #34d399, #059669)",
                      color: "#000",
                      boxShadow: "0 0 20px rgba(52,211,153,0.4)",
                      cursor: "pointer",
                    }
                  : {
                      background: "rgba(255,255,255,0.07)",
                      color: "rgba(255,255,255,0.25)",
                      cursor: "not-allowed",
                    }
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}>
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>

          <p className="text-center text-xs mt-2" style={{ color: "rgba(255,255,255,0.13)" }}>
            Press Enter to send · AI may make mistakes
          </p>
        </div>
      </div>
    </>
  );
}

export default InputBox;