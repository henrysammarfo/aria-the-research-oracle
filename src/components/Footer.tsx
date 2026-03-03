import { motion } from "framer-motion";
import { GlowPillButton } from "./Navbar";
import { Github, Twitter, Linkedin, ArrowUpRight } from "lucide-react";

const footerLinks = {
  Product: ["Research Agent", "Live Demo", "API Access", "Pricing"],
  Developers: ["Documentation", "GitHub", "Changelog", "Status"],
  Company: ["About", "Blog", "Careers", "Contact"],
};

const socials = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

const Footer = () => {
  return (
    <footer
      className="relative w-full overflow-hidden"
      style={{ background: "#000" }}
    >
      {/* Divider */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px"
        style={{
          width: "60%",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
        }}
      />

      {/* CTA Banner */}
      <motion.div
        className="mx-auto px-6 text-center"
        style={{ maxWidth: 800, paddingTop: 100, paddingBottom: 80 }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      >
        <h2
          className="font-medium"
          style={{
            fontSize: "clamp(28px, 4vw, 48px)",
            lineHeight: 1.2,
            background:
              "linear-gradient(144.5deg, #FFFFFF 28%, rgba(255,255,255,0.3) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Stop Searching. Start Knowing.
        </h2>
        <p
          className="text-white/50 font-normal mx-auto mt-5"
          style={{ fontSize: 15, maxWidth: 520, lineHeight: 1.7 }}
        >
          ARIA transforms hours of research into minutes of structured insight.
          Powered by Z.AI's GLM model ecosystem.
        </p>
        <div className="mt-8">
          <GlowPillButton variant="light">Try ARIA Now</GlowPillButton>
        </div>
      </motion.div>

      {/* Footer Grid */}
      <div
        className="mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10"
        style={{
          maxWidth: 960,
          paddingBottom: 60,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 60,
        }}
      >
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <span
            className="text-white font-bold tracking-[0.2em] text-lg uppercase"
          >
            ARIA
          </span>
          <p
            className="text-white/30 font-normal mt-3"
            style={{ fontSize: 13, lineHeight: 1.6 }}
          >
            Autonomous Research Intelligence Agent. Don't google it. ARIA it.
          </p>

          {/* Socials */}
          <div className="flex items-center gap-3 mt-5">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="flex items-center justify-center rounded-lg text-white/30 hover:text-white/70 transition-colors"
                style={{
                  width: 36,
                  height: 36,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <s.icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Link Columns */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4
              className="text-white/60 font-medium mb-4"
              style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              {title}
            </h4>
            <ul className="flex flex-col gap-3">
              {links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="group flex items-center gap-1 text-white/30 hover:text-white/70 transition-colors font-normal"
                    style={{ fontSize: 14 }}
                  >
                    {link}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div
        className="mx-auto px-6 flex flex-col md:flex-row items-center justify-between"
        style={{
          maxWidth: 960,
          paddingTop: 24,
          paddingBottom: 24,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          gap: 12,
        }}
      >
        <span className="text-white/20 font-normal" style={{ fontSize: 12 }}>
          © 2026 ARIA. All rights reserved.
        </span>
        <div className="flex items-center gap-6">
          <a href="#" className="text-white/20 hover:text-white/50 transition-colors font-normal" style={{ fontSize: 12 }}>
            Privacy Policy
          </a>
          <a href="#" className="text-white/20 hover:text-white/50 transition-colors font-normal" style={{ fontSize: 12 }}>
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
