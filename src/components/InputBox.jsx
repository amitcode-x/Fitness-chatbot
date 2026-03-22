import { useState, useRef, useEffect } from "react";

const SUGGESTIONS = [
  { label: "Beginner workout plan", emoji: "🏃" },
  { label: "High protein meals",    emoji: "🥩" },
  { label: "Lose belly fat fast",   emoji: "🔥" },
  { label: "Best chest exercises",  emoji: "💪" },
  { label: "Sleep & recovery tips", emoji: "😴" },
  { label: "Stretch routine",       emoji: "🧘" },
];

const MAX_CHARS = 500;

function InputBox({ sendMessage }) {
  const [input,     setInput]     = useState("");
  const [showSugg,  setShowSugg]  = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  const textareaRef   = useRef(null);
  const recognitionRef = useRef(null);

  /* ── Check voice support on mount ── */
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
      const recog = new SpeechRecognition();
      recog.continuous      = false;
      recog.interimResults  = true;
      recog.lang            = "en-IN"; // Indian English

      recog.onresult = (e) => {
        let transcript = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recog.onend = () => {
        setListening(false);
      };

      recog.onerror = (e) => {
        setListening(false);
        if (e.error === "not-allowed") {
          setVoiceError("Mic permission denied. Please allow microphone access.");
        } else if (e.error === "no-speech") {
          setVoiceError("No speech detected. Try again.");
        } else {
          setVoiceError("Voice error: " + e.error);
        }
        setTimeout(() => setVoiceError(""), 3000);
      };

      recognitionRef.current = recog;
    }

    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  /* ── Auto-resize textarea ── */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || input.length > MAX_CHARS) return;
    sendMessage(input.trim());
    setInput("");
    setShowSugg(false);
    recognitionRef.current?.abort();
    setListening(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleSuggestion = (text) => {
    setInput(text);
    setShowSugg(false);
    textareaRef.current?.focus();
  };

  const toggleVoice = () => {
    if (!voiceSupported) {
      setVoiceError("Voice not supported in this browser. Try Chrome.");
      setTimeout(() => setVoiceError(""), 3000);
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      setInput("");
      setVoiceError("");
      try {
        recognitionRef.current?.start();
        setListening(true);
      } catch (e) {
        setVoiceError("Could not start voice. Try again.");
        setTimeout(() => setVoiceError(""), 3000);
      }
    }
  };

  const active    = input.trim().length > 0;
  const overLimit = input.length > MAX_CHARS;
  const nearLimit = input.length > MAX_CHARS * 0.8;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .ib-root { font-family: 'DM Sans', sans-serif; }

        @keyframes borderGlow {
          0%,100% { border-color:rgba(52,211,153,0.15); box-shadow:0 4px 40px rgba(0,0,0,0.4); }
          50%      { border-color:rgba(52,211,153,0.38); box-shadow:0 4px 40px rgba(52,211,153,0.08); }
        }
        .wrap-idle   { animation: borderGlow 3s ease-in-out infinite; }
        .wrap-active { border-color:rgba(52,211,153,0.45)!important; box-shadow:0 4px 40px rgba(52,211,153,0.15)!important; animation:none; }
        .wrap-over   { border-color:rgba(239,68,68,0.5)!important;   box-shadow:0 4px 40px rgba(239,68,68,0.12)!important;  animation:none; }
        .wrap-listen { border-color:rgba(239,68,68,0.5)!important;   box-shadow:0 0 0 3px rgba(239,68,68,0.12)!important;   animation:none; }

        .ib-textarea { resize:none; overflow-y:auto; min-height:24px; max-height:120px; line-height:1.5; }
        .ib-textarea::placeholder { color:rgba(255,255,255,0.22); }
        .ib-textarea:focus { outline:none; }
        .ib-textarea::-webkit-scrollbar { width:3px; }
        .ib-textarea::-webkit-scrollbar-thumb { background:rgba(52,211,153,0.2); border-radius:99px; }

        .send-btn { transition:transform 0.15s, box-shadow 0.15s; }
        .send-btn:not(:disabled):hover  { transform:scale(1.1); box-shadow:0 0 24px rgba(52,211,153,0.5); }
        .send-btn:not(:disabled):active { transform:scale(0.92); }

        @keyframes voicePulse {
          0%,100% { box-shadow: 0 0 0 0   rgba(239,68,68,0.5); }
          50%      { box-shadow: 0 0 0 8px rgba(239,68,68,0);   }
        }
        .voice-pulse { animation: voicePulse 1s ease-in-out infinite; }

        @keyframes ripple {
          0%   { transform:scale(1);   opacity:0.6; }
          100% { transform:scale(2.2); opacity:0;   }
        }
        .mic-ripple {
          position:absolute; inset:0; border-radius:inherit;
          background:rgba(239,68,68,0.3);
          animation: ripple 1.2s ease-out infinite;
          pointer-events:none;
        }

        @keyframes suggIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .sugg-tray { animation: suggIn 0.2s ease both; }
        .sugg-chip { transition:background 0.18s, border-color 0.18s, color 0.18s, transform 0.12s; }
        .sugg-chip:hover  { background:rgba(52,211,153,0.1)!important; border-color:rgba(52,211,153,0.35)!important; color:#34d399!important; transform:translateY(-1px); }
        .sugg-chip:active { transform:scale(0.95); }

        .voice-btn { transition:transform 0.15s; }
        .voice-btn:hover  { transform:scale(1.08); }
        .voice-btn:active { transform:scale(0.92); }

        @keyframes listeningDot { 0%,100%{opacity:0.3;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
        .ld1 { animation:listeningDot 0.8s ease-in-out 0s   infinite; }
        .ld2 { animation:listeningDot 0.8s ease-in-out 0.15s infinite; }
        .ld3 { animation:listeningDot 0.8s ease-in-out 0.3s  infinite; }

        @keyframes errorShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
        .error-shake { animation: errorShake 0.3s ease; }
      `}</style>

      <div className="ib-root px-4 pt-2 pb-5">
        <div className="max-w-3xl mx-auto">

          {/* ── Quick suggestion chips ── */}
          {showSugg && (
            <div className="sugg-tray mb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button key={s.label} onClick={() => handleSuggestion(s.label)}
                  className="sugg-chip flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium"
                  style={{background:"rgba(255,255,255,0.04)",borderColor:"rgba(52,211,153,0.12)",color:"rgba(255,255,255,0.55)"}}>
                  <span>{s.emoji}</span><span>{s.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* ── Voice error toast ── */}
          {voiceError && (
            <div className="error-shake mb-2 px-3 py-2 rounded-xl text-xs"
              style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",color:"rgba(239,68,68,0.85)"}}>
              ⚠️ {voiceError}
            </div>
          )}

          {/* ── Main input wrapper ── */}
          <div className={`border rounded-2xl px-4 py-3 transition-all duration-300
            ${overLimit ? "wrap-over" : listening ? "wrap-listen" : active ? "wrap-active" : "wrap-idle"}`}
            style={{background:"rgba(255,255,255,0.04)",backdropFilter:"blur(32px)",borderColor:"rgba(52,211,153,0.15)"}}>

            {/* Listening indicator bar */}
            {listening && (
              <div className="flex items-center gap-2 mb-2 pb-2"
                style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                <div className="flex gap-1 items-center">
                  <span className="ld1 inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span className="ld2 inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span className="ld3 inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
                </div>
                <span style={{fontSize:11,color:"rgba(239,68,68,0.85)",fontFamily:"'Syne',sans-serif",letterSpacing:"0.06em"}}>
                  LISTENING… speak now
                </span>
                <button onClick={toggleVoice}
                  className="ml-auto text-xs px-2 py-0.5 rounded-lg"
                  style={{color:"rgba(239,68,68,0.7)",border:"1px solid rgba(239,68,68,0.2)",background:"rgba(239,68,68,0.07)"}}>
                  stop
                </button>
              </div>
            )}

            <div className="flex items-end gap-3">

              {/* ⚡ Suggestions toggle */}
              <button onClick={() => setShowSugg(v => !v)} title="Quick suggestions"
                className="shrink-0 self-end mb-0.5 text-lg"
                style={{opacity: showSugg ? 1 : 0.35, transition:"opacity 0.2s,transform 0.15s"}}
                onMouseEnter={e => e.currentTarget.style.transform="scale(1.15)"}
                onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}>
                ⚡
              </button>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder={listening ? "Speak now… (auto-fills here)" : "Ask Amit anything about fitness…"}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="ib-textarea flex-1 bg-transparent text-sm"
                style={{color:"rgba(255,255,255,0.9)",fontFamily:"'DM Sans',sans-serif"}}
              />

              {/* Char counter */}
              {(active || overLimit) && (
                <span className="shrink-0 self-end mb-0.5 text-xs tabular-nums"
                  style={{
                    color: overLimit ? "rgba(239,68,68,0.85)" : nearLimit ? "rgba(251,146,60,0.75)" : "rgba(52,211,153,0.4)",
                    fontFamily:"'Syne',sans-serif"
                  }}>
                  {MAX_CHARS - input.length}
                </span>
              )}

              {/* 🎤 Voice button */}
              <div className="relative shrink-0 self-end">
                {listening && <span className="mic-ripple" />}
                <button onClick={toggleVoice}
                  className={`voice-btn w-8 h-8 rounded-xl flex items-center justify-center ${listening ? "voice-pulse" : ""}`}
                  title={voiceSupported ? (listening ? "Stop listening" : "Voice input") : "Voice not supported"}
                  style={{
                    background: listening ? "rgba(239,68,68,0.18)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${listening ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
                    transition:"background 0.2s,border-color 0.2s",
                    position:"relative",
                  }}>
                  {listening ? (
                    /* Stop icon when listening */
                    <svg style={{width:12,height:12,color:"#f87171"}} fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="2"/>
                    </svg>
                  ) : (
                    /* Mic icon */
                    <svg style={{width:14,height:14,color: voiceSupported ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.2)"}}
                      fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4zm-1 17.93A8.001 8.001 0 014 11H2a10 10 0 0010 10v-2.07zM20 11h2a8.001 8.001 0 01-9 7.93V21a10 10 0 0010-10h-3z"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* ➤ Send button */}
              <button onClick={handleSend} disabled={!active || overLimit}
                className="send-btn shrink-0 w-9 h-9 rounded-xl flex items-center justify-center self-end"
                style={active && !overLimit
                  ? {background:"linear-gradient(135deg,#34d399,#059669)",color:"#000",boxShadow:"0 0 20px rgba(52,211,153,0.4)",cursor:"pointer"}
                  : {background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.22)",cursor:"not-allowed"}}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width:15,height:15}}>
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Footer hint */}
          <div className="flex items-center justify-between mt-2 px-1">
            <p style={{fontSize:10,color:"rgba(255,255,255,0.12)"}}>
              Shift+Enter new line · Enter send
              {voiceSupported && !listening && (
                <span style={{color:"rgba(52,211,153,0.25)"}}> · 🎤 voice ready</span>
              )}
            </p>
            {overLimit && (
              <p style={{fontSize:10,color:"rgba(239,68,68,0.75)",fontFamily:"'Syne',sans-serif"}}>
                Message too long
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default InputBox;