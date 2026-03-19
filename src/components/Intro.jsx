function Intro({ setScreen }) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-4 relative overflow-hidden bg-[#020818]">
      
      {/* Animated background orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-400/15 rounded-full blur-[100px] animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[80px]" />

      {/* Glass Card */}
      <div className="relative z-10 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl px-10 py-14 shadow-[0_8px_80px_rgba(0,255,100,0.08)] max-w-md w-full">
        
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-[0_0_40px_rgba(74,222,128,0.4)] text-4xl">
          💪
        </div>

        <h1 className="text-5xl font-black text-white mb-3 tracking-tight leading-none">
          AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Fitness</span> Coach
        </h1>

        <p className="text-white/50 mb-8 text-sm leading-relaxed font-light">
          Your personal AI trainer for workouts, diet plans, and daily motivation — available 24/7.
        </p>

        {/* Stats row */}
        <div className="flex justify-center gap-6 mb-8">
          {[["10K+", "Users"], ["500+", "Workouts"], ["24/7", "Support"]].map(([val, label]) => (
            <div key={label} className="text-center">
              <div className="text-green-400 font-bold text-lg">{val}</div>
              <div className="text-white/40 text-xs">{label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setScreen("rules")}
          className="w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase bg-gradient-to-r from-green-400 to-emerald-500 text-black shadow-[0_4px_30px_rgba(74,222,128,0.35)] hover:shadow-[0_4px_40px_rgba(74,222,128,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          Get Started 🚀
        </button>
      </div>

      {/* Bottom hint */}
      <p className="relative z-10 mt-6 text-white/20 text-xs">Powered by Gemini AI</p>
    </div>
  );
}

export default Intro;