import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { usePendingRequests } from "@/hooks/useRequests";
import { useConnections } from "@/hooks/useConnections";
import { useUserStore } from "@/store/useUserStore";
import { useLogout } from "@/hooks/useLogout";
import logoImg from "@/assets/Logo.png";

export default function AppNavbar({ activeTab: explicitTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUserStore((state) => state.user);
  const { mutate: logout } = useLogout();

  const { data: rawRequests = [] } = usePendingRequests();
  const { data: rawConnections = [] } = useConnections();

  const pendingCount = Array.isArray(rawRequests) ? rawRequests.length : 0;
  const connectionsCount = Array.isArray(rawConnections) ? rawConnections.length : 0;

  const getTabFromPath = (path) => {
    if (path.startsWith("/feed")) return "discover";
    if (
      path.startsWith("/likes") ||
      path.startsWith("/requests") ||
      path.startsWith("/user/pending/requests")
    )
      return "likes";
    if (path.startsWith("/connections") || path.startsWith("/matches")) return "matches";
    if (path.startsWith("/profile")) return "profile";
    return "discover";
  };

  const resolvedTab = explicitTab || getTabFromPath(location.pathname);
  const [activeTab, setActiveTab] = useState(resolvedTab);

  useEffect(() => {
    setActiveTab(resolvedTab);
  }, [resolvedTab]);

  const NAV_ITEMS = [
    {
      id: "discover",
      label: "Discover",
      icon: "style",
      path: "/feed",
    },
    {
      id: "likes",
      label: "Requests",
      icon: "favorite",
      path: "/likes",
      badge: pendingCount > 0 ? (pendingCount > 9 ? "9+" : pendingCount) : null,
    },
    {
      id: "matches",
      label: "Matches",
      icon: "forum",
      path: "/connections",
      badge: connectionsCount > 0 ? (connectionsCount > 9 ? "9+" : connectionsCount) : null,
    },
    {
      id: "profile",
      label: "Profile",
      icon: "account_circle",
      path: "/profile",
    },
  ];

  return (
    <>
      {/* ─── DESKTOP & TABLET TOP HEADER (Hidden on mobile) ─────────────────────────── */}
      <header className="hidden md:block fixed top-0 inset-x-0 z-50 bg-[#fff7fa]/90 backdrop-blur-xl border-b border-[#e1bdc7]/30 shadow-[0_1px_12px_rgba(40,10,30,0.03)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo brand */}
          <Link to="/feed" className="flex items-center gap-3 group active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#b40066] to-[#dd1d77] flex items-center justify-center p-1.5 shadow-sm shadow-[#b40066]/20">
              <img src={logoImg} alt="devBumble Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-['Sora',sans-serif] text-xl font-bold tracking-tight text-[#261626]">
              devBumble
            </span>
          </Link>

          {/* Desktop Navigation Links (Center Tabs) */}
          <nav className="flex items-center gap-1 bg-[#ffeffa]/80 p-1 rounded-full border border-[#e1bdc7]/40">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (location.pathname !== item.path) {
                      navigate(item.path);
                    }
                  }}
                  className={`relative px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? "text-white shadow-sm"
                      : "text-[#6f5660] hover:text-[#261626] hover:bg-white/60"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="desktopNavPill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#b40066] to-[#dd1d77] -z-10 shadow-[0_4px_14px_rgba(180,0,102,0.25)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold leading-none ${
                        isActive ? "bg-white text-[#b40066]" : "bg-[#dc1a80] text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop User Profile & Logout */}
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-white/80 border border-transparent hover:border-[#e1bdc7]/40 transition-all"
            >
              <img
                src={
                  user?.avatar ||
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuAuQ0GXRQGiLY65SrQcOC4o21oAFmzidr29gUUGLfPQJu8rfD5Diolv49DI3xMKb5e8Zy8P86wSFtGLywgXPyGKyDK9JZsVgX8Ujs185UKyP2nkTwf2lnhMpiz_I7QbkAFs2ngMzf8RwbOcuk-ZLEsgJizmSP7w2tInc_AuAlBa8tYKbHhanOgZaHTv9sGxuujuZ8uukEeXULNx423RFosdUda1c1G1P98SEcpN"
                }
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#dc1a80]/20"
              />
              <span className="text-xs font-bold text-[#261626]">
                {user?.firstName || "Developer"}
              </span>
            </Link>
            <button
              onClick={() => logout()}
              title="Sign out"
              className="h-9 px-3 rounded-full text-xs font-bold text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── MOBILE BOTTOM FLOATING DOCK (Shown only on mobile screens) ───────────── */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-4 inset-x-0 z-50 pb-safe px-4 pointer-events-none select-none"
      >
        <div className="w-full max-w-[364px] mx-auto pointer-events-auto relative p-1.5 rounded-full bg-white/70 backdrop-blur-2xl backdrop-saturate-[190%] border border-white/60 shadow-[0_20px_48px_-10px_rgba(40,10,30,0.14),0_6px_20px_rgba(0,0,0,0.06),inset_0_1px_1.5px_rgba(255,255,255,0.75)] flex items-center justify-between">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  setActiveTab(item.id);
                  if (location.pathname !== item.path) {
                    navigate(item.path);
                  }
                }}
                className={`relative flex-1 py-1.5 px-2 flex flex-col items-center justify-center rounded-full transition-colors duration-200 cursor-pointer select-none ${
                  isActive ? "text-[#b40066]" : "text-[#6f5660] hover:text-[#261626]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileFloatingLens"
                    className="absolute inset-0 rounded-full bg-white/65 backdrop-blur-xl shadow-[0_4px_16px_rgba(180,0,102,0.12),0_1.5px_4px_rgba(0,0,0,0.03),inset_0_1px_1.5px_rgba(255,255,255,0.92),inset_0_-1px_1px_rgba(255,255,255,0.3)] border border-white/75 -z-10"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 28,
                      mass: 0.75,
                    }}
                  />
                )}

                <motion.div
                  animate={{
                    scale: isActive ? 1.08 : 0.95,
                    y: isActive ? -1 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 26,
                  }}
                  className="relative flex items-center justify-center"
                >
                  <span
                    className="material-symbols-outlined text-[24px]"
                    style={{
                      fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24",
                    }}
                  >
                    {item.icon}
                  </span>

                  {item.badge && (
                    <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-r from-[#b40066] to-[#dc1a80] text-white text-[9px] font-extrabold flex items-center justify-center leading-none shadow-[0_2px_6px_rgba(180,0,102,0.4)] ring-2 ring-white">
                      {item.badge}
                    </span>
                  )}
                </motion.div>

                <span
                  className={`text-[10px] tracking-tight leading-none mt-0.5 transition-all duration-200 ${
                    isActive ? "font-bold text-[#b40066]" : "font-semibold text-[#7c636d]"
                  }`}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
