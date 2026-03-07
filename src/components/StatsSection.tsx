import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Zap, Target, Clock, FileCheck, Globe, Layers } from "lucide-react";

const stats = [
  { icon: Clock, value: 10, suffix: "x", label: "Faster Research", description: "vs manual search & synthesis" },
  { icon: Target, value: 95, suffix: "%", label: "Citation Accuracy", description: "Source-grounded findings" },
  { icon: Layers, value: 5, suffix: "", label: "Specialized Agents", description: "Working in dependency order" },
  { icon: Globe, value: 50, suffix: "+", label: "Sources Analyzed", description: "Per research session" },
  { icon: FileCheck, value: 3, suffix: "min", label: "Avg Report Time", description: "From question to PDF" },
  { icon: Zap, value: 2, suffix: "", label: "GLM Models", description: "GLM-4-Plus & GLM-4.7" },
];

const CountUp = ({ target, suffix }: { target: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
};

const StatsSection = () => {
  return (
    <section id="stats" className="relative w-full overflow-hidden" style={{ background: "#000", padding: "120px 0" }}>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px"
        style={{ width: "60%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }}
      />

      <motion.div
        className="text-center mx-auto px-6"
        style={{ maxWidth: 600 }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      >
        <span
          className="inline-flex items-center rounded-full font-medium mb-6"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20,
            padding: "6px 16px",
            fontSize: 12,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          By The Numbers
        </span>
        <h2
          className="font-medium mt-4"
          style={{
            fontSize: "clamp(28px, 4vw, 42px)",
            lineHeight: 1.2,
            background: "linear-gradient(144.5deg, #FFFFFF 28%, rgba(255,255,255,0.4) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Research at Machine Speed
        </h2>
        <p className="text-white/50 font-normal mt-5" style={{ fontSize: 15, lineHeight: 1.7 }}>
          Real performance metrics from ARIA's multi-agent pipeline.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mx-auto mt-14 px-6" style={{ maxWidth: 860 }}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="relative group rounded-2xl text-center transition-all duration-300 hover:scale-[1.03]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "32px 20px",
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.5,
              delay: i * 0.08,
              ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
            }}
          >
            <div
              className="flex items-center justify-center mx-auto mb-4 rounded-xl text-white/40"
              style={{ width: 40, height: 40, background: "rgba(255,255,255,0.04)" }}
            >
              <stat.icon size={18} />
            </div>
            <div className="text-white font-semibold" style={{ fontSize: "clamp(28px, 3vw, 38px)", lineHeight: 1 }}>
              <CountUp target={stat.value} suffix={stat.suffix} />
            </div>
            <div className="text-white/60 font-medium mt-2" style={{ fontSize: 14 }}>
              {stat.label}
            </div>
            <div className="text-white/25 font-normal mt-1" style={{ fontSize: 12 }}>
              {stat.description}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
