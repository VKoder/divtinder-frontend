import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Globe,
  ArrowRight,
  Heart,
  Navigation,
  Check,
} from "lucide-react";
import logoImg from "@/assets/Logo.png";

export default function LandingPage() {
  const navigate = useNavigate();
  const [bursts, setBursts] = useState([]);

  // Framer motion values for interactive card dragging
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const cardRotate = useTransform(dragX, [-180, 180], [-18, 18]);
  const secondaryX = useTransform(dragX, [-180, 180], [32 - 15, 32 + 15]);
  const secondaryRotate = useTransform(dragX, [-180, 180], [8 - 4, 8 + 4]);

  const handleHeartClick = (e) => {
    e.stopPropagation();
    const id = Date.now();
    setBursts((prev) => [...prev, id]);
    setTimeout(() => {
      setBursts((prev) => prev.filter((bId) => bId !== id));
    }, 800);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center bg-[#fff7fa] text-[#261626] font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden select-none px-4 py-5 sm:py-6">
      {/* Dynamic Atmospheric Glow Traps (Framer Motion Mesh) */}
      <motion.div
        aria-hidden="true"
        className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-[#b40066]/35 via-[#dc1a80]/25 to-[#b5005e]/30 blur-3xl pointer-events-none"
        animate={{
          x: [0, 30, 0],
          y: [0, 20, 0],
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-gradient-to-bl from-[#dd1d77]/30 via-[#ffd9e3]/20 to-[#edd2e9]/40 blur-3xl pointer-events-none"
        animate={{
          x: [0, -25, 0],
          y: [0, -35, 0],
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm h-64 rounded-full bg-gradient-to-t from-[#b40066]/25 via-[#dc1a80]/25 to-transparent blur-[90px] pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating Particles */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[
          { char: "♥", left: "14%", bottom: "28%", delay: 0, size: 16, color: "text-[#b40066]/40" },
          { char: "♥", left: "82%", bottom: "34%", delay: 2.2, size: 14, color: "text-[#b5005e]/35" },
          { char: "✦", left: "22%", bottom: "45%", delay: 3.8, size: 12, color: "text-[#00694c]/40" },
          { char: "♥", left: "74%", bottom: "20%", delay: 1.4, size: 18, color: "text-[#b40066]/30" },
          { char: "✦", left: "48%", bottom: "38%", delay: 4.5, size: 10, color: "text-[#dd1d77]/40" },
        ].map((p, i) => (
          <motion.div
            key={i}
            className={`absolute font-bold ${p.color}`}
            style={{ left: p.left, bottom: p.bottom, fontSize: p.size }}
            animate={{
              y: [0, -220],
              opacity: [0, 0.7, 0.7, 0],
              scale: [0.6, 1, 1.1],
              rotate: [0, 25],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeIn",
              delay: p.delay,
            }}
          >
            {p.char}
          </motion.div>
        ))}
      </div>

      {/* Top Bar: 18+ Verification & Help Badge */}
      <header className="w-full max-w-sm md:max-w-md lg:max-w-lg flex items-center justify-between z-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fce0f7]/70 backdrop-blur-md shadow-sm border border-white/40">
          <span className="w-2 h-2 rounded-full bg-[#008561] inline-block shadow-[0_0_8px_rgba(0,133,97,0.8)] animate-pulse" />
          <span className="text-[11px] tracking-wider uppercase font-bold text-[#261626]">
            18+ Verified Space
          </span>
        </div>
        <button
          aria-label="Language & Help"
          className="w-10 h-10 rounded-full bg-[#fce0f7]/70 backdrop-blur-md flex items-center justify-center text-[#594048] hover:text-[#b40066] transition-colors border border-white/40 shadow-sm active:scale-95 cursor-pointer"
          type="button"
        >
          <Globe className="w-5 h-5" />
        </button>
      </header>

      {/* Center Stage: Branding & Floating Card Deck */}
      <main className="w-full max-w-sm md:max-w-md lg:max-w-lg flex flex-col items-center my-auto z-10 py-4">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2.5 mb-1 cursor-default group">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#b40066] to-[#dd1d77] flex items-center justify-center shadow-lg shadow-[#b40066]/30 transform group-hover:rotate-12 group-hover:scale-105 transition-all duration-300 p-2">
            <img src={logoImg} alt="devBumble Logo" className="w-full h-full object-contain drop-shadow-sm" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight font-['Sora',sans-serif] leading-none text-[#261626]">
            devBumble
          </h1>
        </div>
        <p className="text-[15px] font-medium text-[#594048] text-center tracking-tight mb-4">
          Swipe. Match. Start something.
        </p>

        {/* Layered Kinetic Deck */}
        <div className="relative w-full max-w-[310px] h-[330px] my-2 flex items-center justify-center">
          {/* Backing Ambient Glow */}
          <div
            aria-hidden="true"
            className="absolute inset-4 rounded-[32px] bg-gradient-to-b from-[#ffb0cb]/50 via-[#f6daf1]/40 to-transparent blur-2xl animate-pulse"
            style={{ animationDuration: "4s" }}
          />

          {/* Back Card (Maya, 24) */}
          <motion.div
            className="absolute w-[220px] h-[290px] rounded-[28px] overflow-hidden bg-[#ffe7fa] shadow-md opacity-75 pointer-events-none"
            animate={{
              rotate: [-12, -14, -12],
              x: [-36, -39, -36],
              y: [-8, -15, -8],
            }}
            transition={{
              duration: 6.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <img
              alt="Maya"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXIQ0jkzDd9j9IQHI3toBQzlv4uvP2j_lfnuSoYd7FeYAsJ9phUG1CnFSzbLiLqb4XuJ2WnXLTGhI9s_jTJa4ZK3xZgrZwXL0vdKbD2WBKBGiWKgr5z_OcxQg_xPNq10i_8Wh3pqxDRNq-iMD47rkeEv1o4Qn1L6dSoaBVVj4_ClfXb0_qFuxBUNXbdzbV7ZZBrHzFXow_QTD6yyyQG9pXoNItqzNS7MHUZJLs6gHf"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
              <span className="font-['Sora',sans-serif] font-bold text-lg">Maya, 24</span>
              <Navigation className="w-4 h-4 fill-white" />
            </div>
          </motion.div>

          {/* Middle Card (Julian, 27) */}
          <motion.div
            className="absolute w-[235px] h-[305px] rounded-[28px] overflow-hidden bg-[#fce0f7] shadow-lg opacity-85 pointer-events-none"
            style={{ x: secondaryX, rotate: secondaryRotate }}
            animate={{
              y: [-4, -12, -4],
            }}
            transition={{
              duration: 5.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4,
            }}
          >
            <img
              alt="Julian"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUwYYT0KmxKKyEYM-PQeIQ-DlCed5V0nKz8NC05KmSBUZfnOnAmL5H4kMQwzSAGY4tS8dmIbplSqJGi8mLwFmPr4dAYlNh5xHAq7Ae5K951xgEIK7UMHIL1SAMtjjhSsx0SiicoUZ8R1qGrkW8wuJaUBuJHIYlfgh7kdMwbCs64jtQv6pByiO5Sel8tmMs1QzAydO8gg3g5aB_Wo4ejBGLpdsfgygQs8lT-FyIuNR1"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
              <span className="font-['Sora',sans-serif] font-bold text-lg">Julian, 27</span>
              <div className="w-6 h-6 rounded-full bg-[#8cf7ca] flex items-center justify-center text-[#002115] shadow-sm">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
          </motion.div>

          {/* Hero Focal Card (Clara, 25) - Interactive Draggable */}
          <motion.div
            className="relative w-[250px] h-[320px] rounded-[30px] overflow-hidden bg-white shadow-2xl cursor-grab active:cursor-grabbing will-change-transform z-10"
            style={{
              x: dragX,
              y: dragY,
              rotate: cardRotate,
              boxShadow: "0 18px 45px -8px rgba(180, 0, 102, 0.42)",
            }}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.65}
            animate={{
              y: [0, -7, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2,
            }}
          >
            <img
              alt="Clara"
              className="w-full h-full object-cover pointer-events-none transition-transform duration-500 hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6sNZ6APIUmLqgTiA6sFZRP5YJ4rJcwMdOwChP1ui5DSV5R1wVJ7bLlmtjG7cNQEnbGxx9EX5vQUrlVif3Ac11lH6yOFFUKZ-XfOKiSWeQ1JZCSplJ5NsuW3jj0a2tn7tlOAKy9Kj88Bcw7oUYgAkNDYmOZgJR6mUAQuo0cr05f1UPz8lxyz-sAnUt6AjIA5GAWxbFDlNcmHWjHfSda_a58npNStKGPh6qND7hiTQs"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

            {/* "Active now" Badge */}
            <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md flex items-center gap-1.5 shadow-md border border-white/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#dc1a80] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#dc1a80]" />
              </span>
              <span className="text-[11px] font-medium tracking-wide text-white">
                Active now
              </span>
            </div>

            {/* Profile Info */}
            <div className="absolute bottom-4 left-4 right-4 pointer-events-none text-white">
              <div className="flex items-center gap-1.5 mb-1.5">
                <h2 className="font-['Sora',sans-serif] text-2xl font-bold leading-tight drop-shadow-sm">
                  Clara
                </h2>
                <span className="text-lg font-semibold text-white/90">25</span>
                <div className="w-5 h-5 rounded-full bg-[#8cf7ca] flex items-center justify-center text-[#002115] shadow-sm ml-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-white bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 shadow-sm">
                  Architecture
                </span>
                <span className="text-[11px] font-semibold text-white bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 shadow-sm">
                  Vinyl Bars
                </span>
              </div>
            </div>

            {/* Floating Like Button with Heartbeat */}
            <motion.button
              aria-label="Like Clara"
              className="absolute -bottom-1 -right-1 w-12 h-12 rounded-full bg-gradient-to-br from-[#b40066] to-[#dd1d77] flex items-center justify-center text-white shadow-lg shadow-[#b40066]/60 cursor-pointer pointer-events-auto"
              animate={{
                scale: [1, 1.15, 1, 1.1, 1],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleHeartClick}
            >
              <Heart className="w-6 h-6 fill-white drop-shadow-md" />

              {/* Heart burst animations */}
              <AnimatePresence>
                {bursts.map((bId) => (
                  <motion.span
                    key={bId}
                    className="absolute text-[#b40066] font-bold text-2xl pointer-events-none"
                    initial={{ y: 0, opacity: 1, scale: 0.8 }}
                    animate={{ y: -60, opacity: 0, scale: 1.8 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                  >
                    ♥
                  </motion.span>
                ))}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </div>

        {/* Trust Proof Indicator */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ffeffa]/90 backdrop-blur-sm shadow-sm border border-[#e1bdc7]/40 hover:border-[#b40066]/40 transition-colors mt-3">
          <div className="flex -space-x-1.5">
            <div className="w-5 h-5 rounded-full bg-[#ffb0cb] flex items-center justify-center text-[9px] text-[#3e001f] font-bold border border-white">
              L
            </div>
            <div className="w-5 h-5 rounded-full bg-[#ffd9e2] flex items-center justify-center text-[9px] text-[#3e001c] font-bold border border-white">
              R
            </div>
            <div className="w-5 h-5 rounded-full bg-[#8cf7ca] flex items-center justify-center text-[9px] text-[#002115] font-bold border border-white">
              A
            </div>
          </div>
          <span className="text-[11px] text-[#594048] font-semibold">
            Over 70B+ matches made
          </span>
        </div>
      </main>

      {/* Bottom Actions & Footer */}
      <footer className="w-full max-w-sm md:max-w-md lg:max-w-lg flex flex-col items-center gap-2.5 z-20">
        {/* Primary CTA: Create Account with Shimmer sweep */}
        <motion.button
          className="relative w-full h-[54px] rounded-full bg-gradient-to-r from-[#b40066] via-[#dc1a80] to-[#dd1d77] text-white font-['Sora',sans-serif] font-bold text-lg flex items-center justify-center gap-2 shadow-xl hover:shadow-[#b40066]/50 overflow-hidden cursor-pointer group"
          style={{ boxShadow: "0 12px 36px -6px rgba(180, 0, 102, 0.45)" }}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/login")}
        >
          <span className="relative z-10 flex items-center gap-2 group-hover:translate-x-0.5 transition-transform">
            Create account
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
          {/* Shimmer sweep */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none -skew-x-12"
            animate={{
              x: ["-150%", "250%"],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.button>

        {/* Secondary CTA: Log in */}
        <motion.button
          className="w-full h-[52px] rounded-full bg-[#f6daf1]/80 hover:bg-[#f6daf1] text-[#261626] font-['Sora',sans-serif] font-bold text-lg flex items-center justify-center shadow-sm border border-[#e1bdc7]/40 hover:shadow-md transition-all cursor-pointer"
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/login")}
        >
          Log in
        </motion.button>

        {/* Trouble signing in? */}
        <button
          className="text-xs font-semibold text-[#594048] hover:text-[#b40066] transition-colors py-0.5 hover:underline underline-offset-2 cursor-pointer"
          type="button"
          onClick={() => navigate("/login")}
        >
          Trouble signing in?
        </button>

        {/* Policy disclaimer */}
        <div className="w-full text-center px-1">
          <p className="text-[11px] leading-relaxed text-[#594048]">
            By tapping Create account or Log in, you agree to our{" "}
            <span className="font-semibold text-[#b40066] underline underline-offset-2 cursor-pointer">
              Terms
            </span>
            . Learn how we process your data in our{" "}
            <span className="font-semibold text-[#b40066] underline underline-offset-2 cursor-pointer">
              Privacy Policy
            </span>{" "}
            and{" "}
            <span className="font-semibold text-[#b40066] underline underline-offset-2 cursor-pointer">
              Cookies Policy
            </span>
            .
          </p>
        </div>

        {/* Safety micro footer */}
        <div className="flex items-center gap-3 pt-1 text-[#594048]/70">
          <span className="text-[10px] tracking-widest uppercase font-semibold">
            Safe &amp; Encrypted
          </span>
          <span className="w-1 h-1 rounded-full bg-[#8d6f78]" />
          <span className="text-[10px] tracking-widest uppercase font-semibold">
            Strictly 18+
          </span>
        </div>
      </footer>
    </div>
  );
}
