import Navbar from "./Navbar";
import { GlowPillButton } from "./Navbar";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4";

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-screen overflow-hidden" style={{ background: "#000" }}>
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        {/* Hero Content */}
        <div
          className="flex flex-1 flex-col items-center justify-center text-center"
          style={{ paddingTop: 120, paddingBottom: 102 }}
        >
          <div className="flex flex-col items-center" style={{ gap: 40 }}>
            {/* Badge */}
            <div
              className="inline-flex items-center rounded-full font-medium"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 20,
                padding: "8px 18px",
                fontSize: 13,
                gap: 8,
              }}
            >
              <span
                className="inline-block rounded-full bg-white animate-pulse"
                style={{ width: 4, height: 4 }}
              />
              <span className="text-white/60">Autonomous Research Agent</span>
              <span className="text-white font-medium">Powered by GLM</span>
            </div>

            {/* Heading */}
            <h1
              className="font-medium"
              style={{
                fontSize: "clamp(36px, 5vw, 56px)",
                lineHeight: 1.28,
                maxWidth: 613,
                background:
                  "linear-gradient(144.5deg, #FFFFFF 28%, rgba(0,0,0,0) 115%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Don't Google It. ARIA It.
            </h1>

            {/* Subtitle */}
            <p
              className="text-white/70 font-normal"
              style={{
                fontSize: 15,
                maxWidth: 680,
                marginTop: -16,
              }}
            >
              ARIA autonomously decomposes complex research tasks, deploys
              specialized AI agents — Researcher, Analyst, Coder, Synthesizer —
              and streams reasoning live, producing structured, cited, exportable
              reports in minutes, not hours.
            </p>

            {/* CTA */}
            <GlowPillButton variant="light">Try ARIA Now</GlowPillButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
