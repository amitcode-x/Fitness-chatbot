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

  return (
    <div className="p-4 pb-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 backdrop-blur-2xl bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3 shadow-[0_4px_40px_rgba(0,0,0,0.4)] focus-within:border-green-500/40 focus-within:shadow-[0_4px_40px_rgba(74,222,128,0.1)] transition-all duration-300">

          {/* Emoji / mic icon */}
          <span className="text-white/30 text-lg select-none">🎯</span>

          <input
            type="text"
            placeholder="Ask your fitness coach anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-sm"
          />

          {/* Character count hint */}
          {input.length > 0 && (
            <span className="text-white/20 text-xs shrink-0">{input.length}</span>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={`
              w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200
              ${input.trim()
                ? "bg-gradient-to-br from-green-400 to-emerald-500 text-black shadow-[0_0_20px_rgba(74,222,128,0.4)] hover:scale-110 active:scale-95"
                : "bg-white/10 text-white/30 cursor-not-allowed"
              }
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>

        <p className="text-center text-white/15 text-xs mt-2">Press Enter to send • AI may make mistakes</p>
      </div>
    </div>
  );
}

export default InputBox;