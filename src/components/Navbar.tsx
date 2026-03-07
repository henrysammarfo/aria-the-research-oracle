import { ChevronDown, Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

interface NavItem {
  title: string;
  desc: string;
  href?: string;
  section?: string;
}

const navData: { label: string; items: NavItem[] }[] = [
  {
    label: "Research",
    items: [
      { title: "Web Search", desc: "Multi-source intelligent search", section: "agents" },
      { title: "Source Extraction", desc: "Parse and clean any webpage", section: "agents" },
      { title: "Citation Tracking", desc: "Full provenance for every claim", section: "stats" },
    ],
  },
  {
    label: "Agents",
    items: [
      { title: "Orchestrator", desc: "Task decomposition engine", section: "agents" },
      { title: "Researcher", desc: "Autonomous web research agent", section: "agents" },
      { title: "Analyst", desc: "Deep reasoning engine", section: "agents" },
      { title: "Coder", desc: "Sandboxed Python execution", section: "agents" },
      { title: "Writer", desc: "Structured report synthesis", section: "agents" },
    ],
  },
  {
    label: "How It Works",
    items: [
      { title: "Pipeline Overview", desc: "See the multi-agent flow", section: "how-it-works" },
      { title: "Live Streaming", desc: "Watch agents think in real-time", section: "how-it-works" },
      { title: "PDF Export", desc: "Publication-ready reports", section: "how-it-works" },
    ],
  },
  {
    label: "More",
    items: [
      { title: "Documentation", desc: "API reference, guides & KB", href: "/docs" },
      { title: "FAQ", desc: "Common questions answered", section: "faq" },
      { title: "Dashboard", desc: "Start researching now", href: "/dashboard" },
      { title: "Sign In", desc: "Access your account", href: "/auth" },
    ],
  },
];

const GlowPillButton = ({
  children,
  variant = "dark",
  href,
  onClick,
}: {
  children: React.ReactNode;
  variant?: "dark" | "light";
  href?: string;
  onClick?: () => void;
}) => {
  const isDark = variant === "dark";
  const inner = (
    <span className="relative rounded-full inline-block" style={{ padding: "0.6px" }}>
      <span className="absolute inset-0 rounded-full border border-white/60" />
      <span
        className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-3/5 rounded-full"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)",
          filter: "blur(1px)",
        }}
      />
      <span
        className={`relative z-10 block rounded-full text-sm font-medium ${isDark ? "bg-black text-white" : "bg-white text-black"}`}
        style={{ padding: "11px 29px" }}
      >
        {children}
      </span>
    </span>
  );

  if (href) {
    return <a href={href} className="inline-block">{inner}</a>;
  }
  return <button className="inline-block" onClick={onClick}>{inner}</button>;
};

export { GlowPillButton };

function scrollToSection(sectionId: string) {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

const NavDropdown = ({
  label,
  items,
  onNavigate,
}: {
  label: string;
  items: NavItem[];
  onNavigate: (item: NavItem) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  const handleEnter = () => {
    clearTimeout(timeout.current);
    setOpen(true);
  };
  const handleLeave = () => {
    timeout.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => () => clearTimeout(timeout.current), []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className="flex items-center text-white font-medium hover:opacity-80 transition-opacity"
        style={{ fontSize: 14, gap: 10 }}
        onClick={() => setOpen(!open)}
      >
        {label}
        <ChevronDown
          size={14}
          className={`text-white/60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-200 ${
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
        style={{ width: 260 }}
      >
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "rgba(12,12,12,0.95)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
          }}
        >
          {items.map((item, i) => (
            <button
              key={item.title}
              onClick={() => {
                onNavigate(item);
                setOpen(false);
              }}
              className="block w-full text-left transition-colors duration-150 hover:bg-white/[0.04]"
              style={{
                padding: "14px 18px",
                borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}
            >
              <span className="block text-white font-medium" style={{ fontSize: 13 }}>
                {item.title}
              </span>
              <span
                className="block mt-0.5"
                style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}
              >
                {item.desc}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const MobileAccordion = ({
  label,
  items,
  onNavigate,
}: {
  label: string;
  items: NavItem[];
  onNavigate: (item: NavItem) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <button
        className="w-full flex items-center justify-between text-white font-medium"
        style={{ padding: "18px 0", fontSize: 18 }}
        onClick={() => setOpen(!open)}
      >
        {label}
        <ChevronDown
          size={16}
          className={`text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-4 flex flex-col gap-1">
              {items.map((item) => (
                <button
                  key={item.title}
                  onClick={() => onNavigate(item)}
                  className="block w-full text-left rounded-lg hover:bg-white/[0.04] transition-colors"
                  style={{ padding: "10px 16px" }}
                >
                  <span className="block text-white/80 font-medium" style={{ fontSize: 14 }}>
                    {item.title}
                  </span>
                  <span className="block mt-0.5" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleNavigate = (item: NavItem) => {
    setMobileOpen(false);
    if (item.href) {
      navigate(item.href);
    } else if (item.section) {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => scrollToSection(item.section!), 100);
      } else {
        scrollToSection(item.section);
      }
    }
  };

  return (
    <>
      <nav
        className="relative z-30 flex items-center justify-between w-full px-4 sm:px-6 md:px-10 lg:px-20 xl:px-[120px]"
        style={{ paddingTop: 20, paddingBottom: 20 }}
      >
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); navigate("/"); }}
          className="text-white font-bold tracking-[0.2em] text-lg sm:text-xl uppercase"
          style={{ height: 25, display: "flex", alignItems: "center" }}
        >
          ARIA
        </a>

        {/* Desktop nav — hidden below lg */}
        <div className="hidden lg:flex items-center" style={{ gap: 30 }}>
          {navData.map((nav) => (
            <NavDropdown key={nav.label} label={nav.label} items={nav.items} onNavigate={handleNavigate} />
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:block">
            <GlowPillButton variant="dark" href="/auth">Get Early Access</GlowPillButton>
          </div>

          <button
            className="lg:hidden flex items-center justify-center text-white"
            style={{ width: 40, height: 40 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-20 flex flex-col lg:hidden"
            style={{
              background: "rgba(0,0,0,0.97)",
              backdropFilter: "blur(20px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div style={{ height: 65 }} />

            <motion.div
              className="flex-1 overflow-y-auto px-6 pt-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {navData.map((nav) => (
                <MobileAccordion key={nav.label} label={nav.label} items={nav.items} onNavigate={handleNavigate} />
              ))}

              <div className="mt-8">
                <GlowPillButton variant="light" onClick={() => { setMobileOpen(false); navigate("/auth"); }}>
                  Get Early Access
                </GlowPillButton>
              </div>

              <p
                className="font-mono mt-10"
                style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", letterSpacing: "0.05em" }}
              >
                ARIA — Autonomous Research Intelligence Agent
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
