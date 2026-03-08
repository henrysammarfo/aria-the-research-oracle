import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Maximize, Minimize, X } from "lucide-react";

const slides = [
  // Slide 1: Title
  {
    bg: "from-[hsl(220,60%,8%)] to-[hsl(240,40%,12%)]",
    content: (
      <div className="flex flex-col items-center justify-center h-full gap-12">
        <img src="/aria-logo-480.png" alt="ARIA Logo" className="w-[180px] h-[180px] drop-shadow-2xl" />
        <div className="text-center">
          <h1 className="text-[96px] font-black tracking-tight text-white leading-none">
            ARIA
          </h1>
          <p className="text-[36px] font-light text-cyan-300 mt-4 tracking-wide">
            Autonomous Research Intelligence Agent
          </p>
        </div>
        <div className="mt-8 px-12 py-5 border-2 border-cyan-400/40 rounded-2xl">
          <p className="text-[32px] text-cyan-100 font-medium tracking-wider">
            Don't Google It. <span className="text-cyan-300 font-bold">ARIA It.</span>
          </p>
        </div>
        <p className="text-[22px] text-white/40 mt-12">Z.AI Hackathon 2025</p>
      </div>
    ),
  },
  // Slide 2: The Problem
  {
    bg: "from-[hsl(0,0%,5%)] to-[hsl(220,30%,10%)]",
    content: (
      <div className="flex flex-col justify-center h-full px-[140px]">
        <p className="text-[24px] font-bold text-red-400 uppercase tracking-[6px] mb-8">The Problem</p>
        <h2 className="text-[72px] font-black text-white leading-[1.1] mb-16">
          Research is <span className="text-red-400">broken.</span>
        </h2>
        <div className="grid grid-cols-3 gap-12">
          {[
            { num: "30+", label: "browser tabs per research session" },
            { num: "3.5h", label: "average time for a research report" },
            { num: "72%", label: "of findings are fragmented & uncited" },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center">
              <p className="text-[64px] font-black text-red-400">{stat.num}</p>
              <p className="text-[22px] text-white/60 mt-4">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  // Slide 3: The Solution
  {
    bg: "from-[hsl(200,80%,8%)] to-[hsl(220,60%,12%)]",
    content: (
      <div className="flex flex-col justify-center h-full px-[140px]">
        <p className="text-[24px] font-bold text-cyan-400 uppercase tracking-[6px] mb-8">The Solution</p>
        <h2 className="text-[64px] font-black text-white leading-[1.1] mb-8">
          One question in.<br />
          <span className="text-cyan-300">A cited report out.</span>
        </h2>
        <p className="text-[28px] text-white/60 mb-16 max-w-[1000px]">
          ARIA orchestrates 5 AI agents powered by Z.AI's GLM models to transform any research question into a comprehensive, sourced report — in real time.
        </p>
        <div className="flex gap-8">
          {["Real-time streaming", "Multi-source citations", "Confidence scoring", "Shareable reports"].map((f, i) => (
            <div key={i} className="bg-cyan-400/10 border border-cyan-400/30 rounded-2xl px-8 py-5">
              <p className="text-[22px] text-cyan-200 font-semibold">✦ {f}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  // Slide 4: The Pipeline
  {
    bg: "from-[hsl(260,40%,8%)] to-[hsl(220,50%,10%)]",
    content: (
      <div className="flex flex-col justify-center h-full px-[120px]">
        <p className="text-[24px] font-bold text-purple-400 uppercase tracking-[6px] mb-8">Architecture</p>
        <h2 className="text-[56px] font-black text-white mb-16">5-Agent Pipeline</h2>
        <div className="flex items-center gap-6">
          {[
            { agent: "Orchestrator", model: "GLM-4-Plus", task: "Task decomposition", color: "bg-cyan-500" },
            { agent: "Researcher", model: "GLM-4-Plus", task: "Multi-source synthesis", color: "bg-blue-500" },
            { agent: "Analyst", model: "GLM-4.7", task: "Deep reasoning", color: "bg-purple-500" },
            { agent: "Coder", model: "GLM-4.7", task: "Data analysis", color: "bg-pink-500" },
            { agent: "Writer", model: "GLM-4-Plus", task: "Report generation", color: "bg-emerald-500" },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-6">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 w-[280px] text-center">
                <div className={`w-14 h-14 ${a.color} rounded-2xl mx-auto mb-4 flex items-center justify-center text-[28px] font-black text-white`}>
                  {i + 1}
                </div>
                <p className="text-[26px] font-bold text-white">{a.agent}</p>
                <p className="text-[18px] text-cyan-300 font-mono mt-2">{a.model}</p>
                <p className="text-[18px] text-white/50 mt-3">{a.task}</p>
              </div>
              {i < 4 && <span className="text-[36px] text-white/30">→</span>}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  // Slide 5: Why Z.AI
  {
    bg: "from-[hsl(210,50%,6%)] to-[hsl(230,40%,12%)]",
    content: (
      <div className="flex flex-col justify-center h-full px-[140px]">
        <p className="text-[24px] font-bold text-amber-400 uppercase tracking-[6px] mb-8">Why Z.AI</p>
        <h2 className="text-[60px] font-black text-white mb-16">
          Strategic Model Selection
        </h2>
        <div className="grid grid-cols-2 gap-10">
          <div className="bg-white/5 border border-amber-400/20 rounded-3xl p-12">
            <p className="text-[20px] text-amber-400 font-mono mb-4">HIGH THROUGHPUT</p>
            <p className="text-[40px] font-black text-white mb-4">GLM-4-Plus</p>
            <p className="text-[24px] text-white/60 mb-6">Concurrency: 20 requests</p>
            <div className="space-y-3">
              {["Orchestration & planning", "Research synthesis", "Report writing"].map((t, i) => (
                <p key={i} className="text-[22px] text-amber-200">→ {t}</p>
              ))}
            </div>
          </div>
          <div className="bg-white/5 border border-purple-400/20 rounded-3xl p-12">
            <p className="text-[20px] text-purple-400 font-mono mb-4">ADVANCED REASONING</p>
            <p className="text-[40px] font-black text-white mb-4">GLM-4.7</p>
            <p className="text-[24px] text-white/60 mb-6">Deep analytical capability</p>
            <div className="space-y-3">
              {["Confidence scoring", "Contradiction detection", "Code generation"].map((t, i) => (
                <p key={i} className="text-[22px] text-purple-200">→ {t}</p>
              ))}
            </div>
          </div>
        </div>
        <p className="text-[22px] text-white/40 mt-10">+ Automatic Gemini fallback on 429/402 for resilience</p>
      </div>
    ),
  },
  // Slide 6: Features
  {
    bg: "from-[hsl(180,40%,6%)] to-[hsl(200,50%,10%)]",
    content: (
      <div className="flex flex-col justify-center h-full px-[140px]">
        <p className="text-[24px] font-bold text-emerald-400 uppercase tracking-[6px] mb-8">Features</p>
        <h2 className="text-[56px] font-black text-white mb-14">Production-Ready</h2>
        <div className="grid grid-cols-3 gap-8">
          {[
            { icon: "⚡", title: "Real-time SSE", desc: "Watch agents think live" },
            { icon: "🧠", title: "Intent Routing", desc: "Quick chat vs deep research" },
            { icon: "📊", title: "Shareable Reports", desc: "Unique links & markdown export" },
            { icon: "📎", title: "File Attachments", desc: "Context-aware research" },
            { icon: "💾", title: "Session History", desc: "Persistent conversations" },
            { icon: "🔐", title: "Authentication", desc: "Full auth with email verification" },
          ].map((f, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <p className="text-[40px] mb-4">{f.icon}</p>
              <p className="text-[26px] font-bold text-white">{f.title}</p>
              <p className="text-[20px] text-white/50 mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  // Slide 7: Live Demo
  {
    bg: "from-[hsl(200,80%,8%)] to-[hsl(260,50%,12%)]",
    content: (
      <div className="flex flex-col items-center justify-center h-full gap-12">
        <p className="text-[24px] font-bold text-cyan-400 uppercase tracking-[6px]">Live Demo</p>
        <h2 className="text-[72px] font-black text-white text-center leading-[1.1]">
          Let's watch ARIA<br />
          <span className="text-cyan-300">in action.</span>
        </h2>
        <div className="bg-white/5 border border-cyan-400/30 rounded-3xl px-16 py-8 mt-4">
          <p className="text-[28px] text-cyan-200 font-mono text-center">
            ariaoracle.lovable.app
          </p>
        </div>
        <p className="text-[24px] text-white/40 mt-8">
          "What is the current state of quantum computing and its commercial viability?"
        </p>
      </div>
    ),
  },
  // Slide 8: Closing
  {
    bg: "from-[hsl(220,60%,8%)] to-[hsl(240,40%,14%)]",
    content: (
      <div className="flex flex-col items-center justify-center h-full gap-10">
        <img src="/aria-logo-480.png" alt="ARIA Logo" className="w-[140px] h-[140px] drop-shadow-2xl" />
        <h2 className="text-[80px] font-black text-white">
          Don't Google It.
        </h2>
        <h2 className="text-[80px] font-black text-cyan-300 -mt-6">
          ARIA It.
        </h2>
        <div className="flex gap-6 mt-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-10 py-5">
            <p className="text-[20px] text-white/40 mb-1">Powered by</p>
            <p className="text-[28px] font-bold text-white">Z.AI GLM</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-10 py-5">
            <p className="text-[20px] text-white/40 mb-1">Built with</p>
            <p className="text-[28px] font-bold text-white">Lovable</p>
          </div>
        </div>
        <p className="text-[22px] text-white/30 mt-12">Thank you.</p>
      </div>
    ),
  },
];

export default function Pitch() {
  const [current, setCurrent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();

  const goNext = useCallback(() => setCurrent((c) => Math.min(c + 1, slides.length - 1)), []);
  const goPrev = useCallback(() => setCurrent((c) => Math.max(c - 1, 0)), []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "Escape" && !document.fullscreenElement) navigate("/");
      if (e.key === "f" || e.key === "F5") { e.preventDefault(); toggleFullscreen(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, navigate, toggleFullscreen]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none">
      {/* Slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={`absolute inset-0 bg-gradient-to-br ${slides[current].bg}`}
        >
          <div className="w-full h-full" style={{ aspectRatio: "16/9" }}>
            {slides[current].content}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls overlay */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <button onClick={goPrev} disabled={current === 0}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 flex items-center justify-center text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <span className="text-white/50 text-sm font-mono px-4">
          {current + 1} / {slides.length}
        </span>
        <button onClick={goNext} disabled={current === slides.length - 1}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 flex items-center justify-center text-white transition-colors">
          <ArrowRight size={20} />
        </button>
        <button onClick={toggleFullscreen}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors ml-4">
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
        <button onClick={() => navigate("/")}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
