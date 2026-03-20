function Message({ msg }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>

      {/* Bot Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-sm shrink-0 shadow-[0_0_15px_rgba(74,222,128,0.3)] mb-1">
          🤖
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`
          px-4 py-3 rounded-2xl max-w-[75%] md:max-w-[60%] text-sm leading-relaxed
          ${isUser
            ? "rounded-br-sm bg-gradient-to-br from-green-400 to-emerald-500 text-black font-medium shadow-[0_4px_20px_rgba(74,222,128,0.25)]"
            : "rounded-bl-sm backdrop-blur-xl bg-white/[0.07] border border-white/10 text-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
          }
        `}
      >
        {msg.text}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-white/20 to-white/10 border border-white/15 flex items-center justify-center text-sm shrink-0 mb-1">
          🙋
        </div>
      )}
    </div>     
  );
}

export default Message;