function Rules({ setScreen }) {
  const rules = [
    { icon: "✅", title: "General Advice Only", desc: "Provides general fitness guidance, not medical advice." },
    { icon: "🏋️", title: "Not a Pro Trainer", desc: "Always consult a certified trainer for personalized plans." },
    { icon: "💧", title: "Stay Hydrated", desc: "Drink water before, during, and after every workout." },
    { icon: "🔥", title: "Warm Up First", desc: "Always warm up 5–10 mins before starting any exercise." },
    { icon: "🥗", title: "Diet Matters", desc: "80% of results come from what you eat. Track it." },
  ];

  return (
    <div className="min-h-screen flex justify-center items-center px-4 py-8 relative overflow-hidden bg-[#020818]">

      {/* Background orbs */}
      <div className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] bg-green-500/15 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[350px] h-[350px] bg-teal-500/10 rounded-full blur-[100px] animate-pulse delay-700" />

      <div className="relative z-10 w-full max-w-md">

        {/* Glass Card */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-[0_8px_80px_rgba(0,255,100,0.06)]">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(250,200,0,0.3)]">
              ⚠️
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Before You Start</h2>
            <p className="text-white/40 text-sm mt-1">Please read these guidelines carefully</p>
          </div>

          {/* Rules list */}
          <div className="space-y-3 mb-8">
            {rules.map((rule, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.07] hover:border-green-500/20 transition-all duration-200"
              >
                <span className="text-xl mt-0.5 shrink-0">{rule.icon}</span>
                <div>
                  <div className="text-white font-semibold text-sm">{rule.title}</div>
                  <div className="text-white/40 text-xs mt-0.5 leading-relaxed">{rule.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setScreen("chat")}
            className="w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase bg-gradient-to-r from-green-400 to-emerald-500 text-black shadow-[0_4px_30px_rgba(74,222,128,0.3)] hover:shadow-[0_4px_40px_rgba(74,222,128,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            I Understand — Let's Go 💬
          </button>
        </div>
      </div>
    </div>
  );
}

export default Rules;