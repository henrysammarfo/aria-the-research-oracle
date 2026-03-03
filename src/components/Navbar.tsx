import { ChevronDown } from "lucide-react";

const navLinks = ["Research", "Agents", "Features", "Docs"];

const GlowPillButton = ({
  children,
  variant = "dark",
}: {
  children: React.ReactNode;
  variant?: "dark" | "light";
}) => {
  const isDark = variant === "dark";
  return (
    <button
      className="relative rounded-full"
      style={{ padding: "0.6px" }}
    >
      {/* Outer border */}
      <span className="absolute inset-0 rounded-full border border-white/60" />
      {/* Top glow streak */}
      <span
        className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-3/5 rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)",
          filter: "blur(1px)",
        }}
      />
      {/* Inner pill */}
      <span
        className={`relative z-10 block rounded-full text-sm font-medium ${
          isDark
            ? "bg-black text-white"
            : "bg-white text-black"
        }`}
        style={{ padding: "11px 29px" }}
      >
        {children}
      </span>
    </button>
  );
};

export { GlowPillButton };

const Navbar = () => {
  return (
    <nav
      className="relative z-20 flex items-center justify-between w-full"
      style={{ padding: "20px 120px" }}
    >
      {/* Responsive padding override */}
      <style>{`
        @media (max-width: 768px) {
          nav { padding: 20px 24px !important; }
        }
      `}</style>

      {/* Logo */}
      <div
        className="text-white font-bold tracking-[0.2em] text-xl uppercase"
        style={{ height: 25, display: "flex", alignItems: "center" }}
      >
        ARIA
      </div>

      {/* Nav Links */}
      <div className="hidden md:flex items-center" style={{ gap: 30 }}>
        {navLinks.map((link) => (
          <a
            key={link}
            href="#"
            className="flex items-center text-white font-medium hover:opacity-80 transition-opacity"
            style={{ fontSize: 14, gap: 14 }}
          >
            {link}
            <ChevronDown size={14} className="text-white" />
          </a>
        ))}
      </div>

      {/* CTA */}
      <GlowPillButton variant="dark">Get Early Access</GlowPillButton>
    </nav>
  );
};

export default Navbar;
