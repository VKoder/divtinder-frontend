import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { usePendingRequests } from "@/hooks/useRequests";
import { useConnections } from "@/hooks/useConnections";

export default function BottomNav({ activeTab: explicitTab }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: rawRequests = [] } = usePendingRequests();
  const { data: rawConnections = [] } = useConnections();

  const pendingCount = Array.isArray(rawRequests) ? rawRequests.length : 0;
  const connectionsCount = Array.isArray(rawConnections) ? rawConnections.length : 0;

  // Resolve active tab based on pathname
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

  // Sync state if URL changes externally (e.g. back/forward navigation)
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
      label: "Likes",
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
    <nav
      aria-label="Main Navigation"
      className="fixed bottom-4 inset-x-0 z-50 pb-safe px-4 pointer-events-none select-none"
    >
      {/* Apple visionOS Ultra-Translucent Frosted Glass Dock */}
      <div className="w-full max-w-[364px] md:max-w-md mx-auto pointer-events-auto relative p-1.5 rounded-full bg-white/70 md:bg-white/80 backdrop-blur-2xl backdrop-saturate-[190%] border border-white/60 shadow-[0_20px_48px_-10px_rgba(40,10,30,0.14),0_6px_20px_rgba(0,0,0,0.06),inset_0_1px_1.5px_rgba(255,255,255,0.75)] flex items-center justify-between">
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
              {/* Apple Floating Lens Pill */}
              {isActive && (
                <motion.div
                  layoutId="appleFloatingLens"
                  className="absolute inset-0 rounded-full bg-white/65 backdrop-blur-xl shadow-[0_4px_16px_rgba(180,0,102,0.12),0_1.5px_4px_rgba(0,0,0,0.03),inset_0_1px_1.5px_rgba(255,255,255,0.92),inset_0_-1px_1px_rgba(255,255,255,0.3)] border border-white/75 -z-10"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 28,
                    mass: 0.75,
                  }}
                />
              )}

              {/* Filled Icon with Spring Micro-Bounce & Notification Badge */}
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

                {/* Apple Badge */}
                {item.badge && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-r from-[#b40066] to-[#dc1a80] text-white text-[9px] font-extrabold flex items-center justify-center leading-none shadow-[0_2px_6px_rgba(180,0,102,0.4)] ring-2 ring-white"
                  >
                    {item.badge}
                  </motion.span>
                )}
              </motion.div>

              {/* Tab Label */}
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
  );
}
