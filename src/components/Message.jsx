import { useState } from "react";

/* ── Inline markdown renderer: **bold**, *italic*, bullet/numbered lists ── */
function renderInline(text) {
  const parts = [];
  let rem = text, k = 0;
  while (rem.length > 0) {
    const bm = rem.match(/\*\*(.+?)\*\*/);
    const im = rem.match(/\*(.+?)\*/);
    let first = null;
    if (bm) first = { type:"bold",   m:bm, idx:bm.index };
    if (im && (!first || im.index < first.idx)) first = { type:"italic", m:im, idx:im.index };
    if (!first) { parts.push(<span key={k++}>{rem}</span>); break; }
    if (first.idx > 0) parts.push(<span key={k++}>{rem.slice(0, first.idx)}</span>);
    if (first.type === "bold")
      parts.push(<strong key={k++} style={{fontWeight:700,color:"rgba(255,255,255,0.97)"}}>{first.m[1]}</strong>);
    else
      parts.push(<em key={k++} style={{fontStyle:"italic",color:"rgba(52,211,153,0.85)"}}>{first.m[1]}</em>);
    rem = rem.slice(first.idx + first.m[0].length);
  }
  return parts;
}

function BotText({ text }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {text.split("\n").map((line, i) => {
        const num = line.match(/^(\d+)\.\s(.+)/);
        const bul = line.match(/^[-•]\s(.+)/);
        const head = line.match(/^#{1,3}\s(.+)/);
        if (head) return (
          <div key={i} style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:800,color:"#34d399",marginTop:4}}>
            {renderInline(head[1])}
          </div>
        );
        if (num) return (
          <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
            <span style={{color:"#34d399",fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:700,minWidth:18,paddingTop:2}}>{num[1]}.</span>
            <span>{renderInline(num[2])}</span>
          </div>
        );
        if (bul) return (
          <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
            <span style={{color:"#34d399",fontSize:10,paddingTop:3}}>▸</span>
            <span>{renderInline(bul[1])}</span>
          </div>
        );
        if (!line.trim()) return <div key={i} style={{height:3}} />;
        return <div key={i}>{renderInline(line)}</div>;
      })}
    </div>
  );
}

const REACTIONS = ["👍","🔥","💪","❤️","🤔","😮"];

function Message({ msg }) {
  const isUser = msg.role === "user";
  const [copied, setCopied]           = useState(false);
  const [reaction, setReaction]       = useState(null);
  const [showReactions, setShowReac]  = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(msg.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const time = msg.time || new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });

  const CopyIcon = () => copied
    ? <svg style={{width:11,height:11,color:"#34d399"}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.8}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
    : <svg style={{width:11,height:11,color:"rgba(255,255,255,0.38)"}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .msg-root{font-family:'DM Sans',sans-serif;}
        @keyframes msgIn{from{opacity:0;transform:translateY(12px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        .msg-anim{animation:msgIn 0.35s cubic-bezier(0.22,1,0.36,1) both}
        @keyframes reactionPop{0%{transform:scale(0.4);opacity:0}70%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
        .reaction-pop{animation:reactionPop 0.25s cubic-bezier(0.22,1,0.36,1) both}
        @keyframes trayIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        .tray-in{animation:trayIn 0.18s ease both}
        .action-btn{opacity:0;transition:opacity 0.18s,transform 0.12s;cursor:pointer;}
        .msg-wrap:hover .action-btn{opacity:1}
        .action-btn:hover{transform:scale(1.15)!important}
        .action-btn:active{transform:scale(0.9)!important}
        .bot-bubble{transition:border-color 0.2s,box-shadow 0.2s}
        .bot-bubble:hover{border-color:rgba(52,211,153,0.28)!important;box-shadow:0 4px 30px rgba(52,211,153,0.08)!important}
        .user-bubble{position:relative;overflow:hidden}
        .user-bubble::before{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.12) 50%,transparent 60%);transform:translateX(-100%);transition:transform 0.5s ease}
        .user-bubble:hover::before{transform:translateX(100%)}
        .react-emoji:hover{transform:scale(1.3);transition:transform 0.12s}
      `}</style>

      <div className={`msg-root msg-anim msg-wrap flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>

        <div className={`flex items-end gap-2 w-full ${isUser ? "justify-end" : "justify-start"}`}>

          {/* ── Bot avatar ── */}
          {!isUser && (
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 mb-1"
              style={{background:"linear-gradient(135deg,#065f46,#10b981)",boxShadow:"0 0 16px rgba(52,211,153,0.35),inset 0 1px 0 rgba(255,255,255,0.1)"}}>
              🤖
            </div>
          )}

          {/* ── Action buttons (bot, left of bubble) ── */}
          {!isUser && (
            <div className="flex flex-col gap-1.5 self-center mb-1">
              <button className="action-btn w-6 h-6 rounded-lg flex items-center justify-center"
                style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}
                onClick={handleCopy} title="Copy message">
                <CopyIcon />
              </button>
              <div className="relative">
                <button className="action-btn w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}
                  onClick={() => setShowReac(v => !v)} title="React">
                  <span style={{fontSize:10,lineHeight:1}}>{reaction ?? "🙂"}</span>
                </button>
                {showReactions && (
                  <div className="tray-in absolute left-7 top-0 flex gap-1 px-2 py-1.5 rounded-2xl z-30"
                    style={{background:"rgba(4,16,30,0.97)",border:"1px solid rgba(52,211,153,0.2)",backdropFilter:"blur(20px)",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",whiteSpace:"nowrap"}}>
                    {REACTIONS.map(r => (
                      <button key={r} className="react-emoji text-base" onClick={() => { setReaction(r); setShowReac(false); }}>{r}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Bubble ── */}
          {isUser ? (
            <div className="user-bubble px-4 py-3 rounded-2xl rounded-br-sm max-w-[75%] md:max-w-[60%] text-sm leading-relaxed font-medium text-black"
              style={{background:"linear-gradient(135deg,#34d399,#10b981,#059669)",boxShadow:"0 4px 20px rgba(52,211,153,0.3)"}}>
              {msg.text}
            </div>
          ) : (
            <div className="bot-bubble px-4 py-3 rounded-2xl rounded-bl-sm max-w-[75%] md:max-w-[60%] text-sm leading-relaxed border"
              style={{background:"rgba(255,255,255,0.04)",backdropFilter:"blur(16px)",borderColor:"rgba(52,211,153,0.12)",color:"rgba(255,255,255,0.88)",boxShadow:"0 4px 24px rgba(0,0,0,0.3)"}}>
              <BotText text={msg.text} />
            </div>
          )}

          {/* ── User avatar + copy ── */}
          {isUser && (
            <div className="flex flex-col-reverse gap-1.5 items-center mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 border"
                style={{background:"rgba(255,255,255,0.06)",borderColor:"rgba(255,255,255,0.12)",backdropFilter:"blur(8px)"}}>
                🙋
              </div>
              <button className="action-btn w-6 h-6 rounded-lg flex items-center justify-center"
                style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}
                onClick={handleCopy} title="Copy">
                <CopyIcon />
              </button>
            </div>
          )}
        </div>

        {/* ── Timestamp + reaction badge ── */}
        <div className={`flex items-center gap-2 ${isUser ? "pr-11" : "pl-11"}`}>
          <span style={{fontSize:10,color:"rgba(255,255,255,0.18)",fontFamily:"'DM Sans',sans-serif"}}>{time}</span>
          {reaction && (
            <span className="reaction-pop text-xs px-1.5 py-0.5 rounded-full"
              style={{background:"rgba(52,211,153,0.09)",border:"1px solid rgba(52,211,153,0.18)"}}>
              {reaction}
            </span>
          )}
          {copied && (
            <span className="reaction-pop text-xs" style={{color:"#34d399",fontFamily:"'Syne',sans-serif"}}>Copied!</span>
          )}
        </div>
      </div>
    </>
  );
}

export default Message;