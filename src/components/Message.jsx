function Message({ msg }) {
  const isUser = msg.role === "user";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .msg-root { font-family: 'DM Sans', sans-serif; }

        @keyframes msgIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .msg-anim { animation: msgIn 0.3s cubic-bezier(0.22,1,0.36,1) both; }

        .bot-bubble {
          position: relative;
          transition: border-color 0.2s;
        }
        .bot-bubble:hover {
          border-color: rgba(52,211,153,0.3) !important;
        }

        .user-bubble {
          position: relative;
          overflow: hidden;
        }
        .user-bubble::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%);
          transform: translateX(-100%);
          transition: transform 0.5s ease;
        }
        .user-bubble:hover::before { transform: translateX(100%); }
      `}</style>

      <div className={`msg-root msg-anim flex items-end gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>

        {/* Bot Avatar */}
        {!isUser && (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 mb-1"
            style={{
              background: "linear-gradient(135deg, #065f46, #10b981)",
              boxShadow: "0 0 16px rgba(52,211,153,0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            🤖
          </div>
        )}

        {/* Message Bubble */}
        {isUser ? (
          <div
            className="user-bubble px-4 py-3 rounded-2xl rounded-br-sm max-w-[75%] md:max-w-[60%] text-sm leading-relaxed font-medium text-black"
            style={{
              background: "linear-gradient(135deg, #34d399, #10b981, #059669)",
              boxShadow: "0 4px 20px rgba(52,211,153,0.3)",
            }}
          >
            {msg.text}
          </div>
        ) : (
          <div
            className="bot-bubble px-4 py-3 rounded-2xl rounded-bl-sm max-w-[75%] md:max-w-[60%] text-sm leading-relaxed border"
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(16px)",
              borderColor: "rgba(52,211,153,0.12)",
              color: "rgba(255,255,255,0.88)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}
          >
            {msg.text}
          </div>
        )}

        {/* User Avatar */}
        {isUser && (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 mb-1 border"
            style={{
              background: "rgba(255,255,255,0.06)",
              borderColor: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
            }}
          >
            🙋
          </div>
        )}
      </div>
    </>
  );
}

export default Message;