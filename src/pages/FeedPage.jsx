import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";
import { useLogout } from "@/hooks/useLogout";
import { useFeed } from "@/hooks/useFeed";
import logoImg from "@/assets/Logo.png";

const formatProfile = (p, index) => {
  // Use user's real avatar (or default placeholder if none exists) - do not use fake/mock photos!
  const avatar = p?.avatar?.trim() || "https://via.placeholder.com/150";

  // Extract only uploaded images from gallery
  const uploadedGallery = Array.isArray(p?.gallery)
    ? p.gallery
        .map((g) => (typeof g === "string" ? g : g?.img || g?.url || ""))
        .filter(Boolean)
    : [];

  // If nothing is uploaded in gallery, show its avatar, that's all!
  const gallery = uploadedGallery.length > 0 ? uploadedGallery : [avatar];

  const defaultSkills = ["JavaScript", "React", "Node.js"];
  const skillsList = p.skills && p.skills.length > 0 ? p.skills : defaultSkills;

  const interests = skillsList.map((skill, idx) => ({
    emoji: ["💻", "⚡", "🚀", "🔥", "🛠️"][idx % 5],
    text: skill,
    highlight: idx === 0,
  }));

  return {
    id: p._id || `profile-${index}`,
    name: `${p.firstName || "Developer"} ${p.lastName || ""}`.trim(),
    age: p.age || 25,
    role: p.about || "Software Developer",
    location: "Active nearby",
    avatar: gallery[0] || avatar,
    gallery,
    bio:
      p.bio ||
      p.about ||
      "Hello! I am excited to connect and collaborate with other developers on devBumble.",
    sharedText: `You both love ${skillsList[0] || "Code"}`,
    interests,
  };
};

export default function FeedPage() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const { mutate: logout } = useLogout();
  const { data: feedData, isLoading, isError, refetch } = useFeed();

  const [profiles, setProfiles] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("discover");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Sync React Query data into local swiping state
  useEffect(() => {
    if (feedData && Array.isArray(feedData)) {
      setProfiles(feedData.map(formatProfile));
    }
  }, [feedData]);

  // Framer Motion drag gestures
  const dragX = useMotionValue(0);
  const cardRotate = useTransform(dragX, [-200, 200], [-18, 18]);
  const likeOpacity = useTransform(dragX, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(dragX, [-20, -100], [0, 1]);

  const currentProfile = profiles[0];
  const nextProfile = profiles[1];

  const currentGallery = currentProfile?.gallery || [];
  const activeImgUrl = currentGallery[currentImgIndex] || currentProfile?.avatar;

  const handlePrevImage = (e) => {
    e?.stopPropagation();
    setCurrentImgIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextImage = (e) => {
    e?.stopPropagation();
    setCurrentImgIndex((prev) =>
      prev < currentGallery.length - 1 ? prev + 1 : prev
    );
  };

  const triggerAction = (type) => {
    if (!currentProfile) return;

    if (type === "like") {
      toast.success(`Liked ${currentProfile.name}!`);
    } else if (type === "nope") {
      toast.info(`Passed on ${currentProfile.name}`);
    } else if (type === "superlike") {
      toast.success(`Superliked ${currentProfile.name}! ⭐`);
    }

    setHistory((prev) => [currentProfile, ...prev]);
    setProfiles((prev) => prev.slice(1));
    setCurrentImgIndex(0); // Reset to first photo of next profile
    setIsDrawerOpen(false);
  };

  const handleRewind = () => {
    if (history.length === 0) {
      toast.info("No previous profiles to rewind.");
      return;
    }
    const last = history[0];
    setHistory((prev) => prev.slice(1));
    setProfiles((prev) => [last, ...prev]);
    setCurrentImgIndex(0); // Reset to first photo of restored profile
    toast.success(`Restored ${last.name}`);
  };

  const handleDragEnd = (e, info) => {
    if (info.offset.x > 110) {
      triggerAction("like");
    } else if (info.offset.x < -110) {
      triggerAction("nope");
    }
  };

  return (
    <div className="bg-[#fff7fa] font-['Plus_Jakarta_Sans',sans-serif] text-[#261626] antialiased flex flex-col min-h-screen select-none">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#fff7fa]/85 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(41,17,38,0.04)]">
        <div className="h-16 px-4 flex items-center justify-between max-w-lg mx-auto">
          {/* User profile avatar / name */}
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 min-w-[44px] min-h-[44px] justify-center transition-transform active:scale-95 cursor-pointer"
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#dc1a80]/20"
              src={
                user?.avatar ||
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAuQ0GXRQGiLY65SrQcOC4o21oAFmzidr29gUUGLfPQJu8rfD5Diolv49DI3xMKb5e8Zy8P86wSFtGLywgXPyGKyDK9JZsVgX8Ujs185UKyP2nkTwf2lnhMpiz_I7QbkAFs2ngMzf8RwbOcuk-ZLEsgJizmSP7w2tInc_AuAlBa8tYKbHhanOgZaHTv9sGxuujuZ8uukEeXULNx423RFosdUda1c1G1P98SEcpN"
              }
            />
            <span className="text-xs font-bold text-[#261626] tracking-tight hidden sm:inline">
              {user?.firstName || "devBumble"}
            </span>
          </button>

          {/* devBumble Logo */}
          <div className="flex items-center justify-center cursor-pointer" onClick={() => setActiveTab("discover")}>
            <img
              alt="devBumble Logo"
              className="h-12 w-auto object-contain drop-shadow-sm transition-transform active:scale-95"
              src={logoImg}
            />
            <span className="sr-only">devBumble</span>
          </div>

          {/* Tune / Settings / Logout menu toggle */}
          <div className="flex items-center justify-end min-w-[44px] min-h-[44px] relative">
            <button
              onClick={() => setShowLogoutConfirm((prev) => !prev)}
              aria-label="Settings"
              className="w-11 h-11 flex items-center justify-center text-[#8d6f78] hover:text-[#261626] rounded-full transition-colors active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">tune</span>
            </button>

            {/* Logout dropdown */}
            {showLogoutConfirm && (
              <div className="absolute right-0 top-12 w-40 bg-white rounded-2xl shadow-xl border border-[#e1bdc7]/50 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-[#c54d46] hover:bg-[#ffeffa] rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-24 bg-[#fff7fa]">
        <div className="flex flex-col w-full px-4 pb-6 select-none max-w-lg mx-auto">
          {/* Card Stack Container (Fixed height - never resizes on photo change) */}
          <div className="relative w-full max-w-[400px] h-[540px] max-h-[calc(100dvh-220px)] min-h-[480px] mx-auto flex items-center justify-center shrink-0">
            {/* Loading Skeleton */}
            {isLoading && (
              <div className="w-full h-full rounded-[28px] bg-white border border-[#e1bdc7]/40 shadow-lg flex flex-col items-center justify-center gap-3 animate-pulse">
                <span className="material-symbols-outlined text-[42px] text-[#dc1a80] animate-spin">
                  progress_activity
                </span>
                <span className="text-xs font-bold text-[#8d6f78]">Loading feed...</span>
              </div>
            )}

            {/* Error State */}
            {!isLoading && isError && (
              <div className="text-center p-8 bg-white rounded-[28px] shadow-xl border border-[#e1bdc7]/40 w-full h-full flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-[32px]">error</span>
                </div>
                <h3 className="text-lg font-bold text-[#261626]">Failed to load feed</h3>
                <p className="text-xs text-[#594048] mt-1 mb-5">
                  Make sure your backend server is running on localhost:7777.
                </p>
                <button
                  onClick={() => refetch()}
                  className="px-5 py-2.5 rounded-full bg-[#b40066] text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Background Card (Stack depth illusion) */}
            {!isLoading && !isError && nextProfile && (
              <div className="absolute inset-0 rounded-[28px] bg-[#ffe7fa] overflow-hidden scale-[0.95] translate-y-3 opacity-80 pointer-events-none transition-all duration-300">
                <img
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  alt={nextProfile.name}
                  src={nextProfile.gallery?.[0] || nextProfile.avatar}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#261626]/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-white/70 text-lg font-bold">
                  {nextProfile.name}, {nextProfile.age}
                </div>
              </div>
            )}

            {/* Active Swipable Card */}
            {!isLoading && !isError && (
              <AnimatePresence>
                {currentProfile ? (
                  <motion.div
                    key={currentProfile.id}
                    style={{
                      x: dragX,
                      rotate: cardRotate,
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.7}
                    onDragEnd={handleDragEnd}
                    className="relative w-full h-full rounded-[28px] overflow-hidden bg-white shadow-[0_16px_36px_-8px_rgba(220,26,128,0.18),0_6px_16px_-2px_rgba(38,22,38,0.06)] cursor-grab active:cursor-grabbing will-change-transform z-10"
                  >
                    {/* Top Image Scrub Indicators (Only when multiple photos uploaded) */}
                    {currentGallery.length > 1 && (
                      <div className="absolute top-3 inset-x-3 z-30 flex items-center gap-1.5 px-1 pointer-events-none">
                        {currentGallery.map((_, idx) => (
                          <div
                            key={idx}
                            className={`h-1 flex-1 rounded-full transition-all duration-200 ${
                              idx === currentImgIndex
                                ? "bg-white shadow-sm"
                                : idx < currentImgIndex
                                ? "bg-white/80"
                                : "bg-white/35 backdrop-blur-sm"
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Verified Match Highlight Badge */}
                    <div className="absolute top-7 left-4 z-30 flex items-center gap-1 bg-white/85 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm pointer-events-none">
                      <span
                        className="material-symbols-outlined text-[15px] text-[#0095F6]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        verified
                      </span>
                      <span className="text-[10px] font-bold text-[#261626] uppercase tracking-wider">
                        Active Today
                      </span>
                    </div>

                    {/* Photo Counter Badge (Only when multiple photos uploaded) */}
                    {currentGallery.length > 1 && (
                      <div className="absolute top-7 right-4 z-30 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white text-[11px] font-bold pointer-events-none shadow-sm">
                        <span className="material-symbols-outlined text-[13px]">photo_camera</span>
                        <span>
                          {currentImgIndex + 1}/{currentGallery.length}
                        </span>
                      </div>
                    )}

                    {/* Card Discovery Image (Fixed to card bounds) */}
                    <img
                      key={activeImgUrl}
                      alt={`${currentProfile.name}'s photo ${currentImgIndex + 1}`}
                      className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-opacity duration-200"
                      src={activeImgUrl}
                    />

                    {/* Left & Right Tap Zones for Photo Navigation (Only when multiple photos uploaded) */}
                    {currentGallery.length > 1 && (
                      <div className="absolute inset-x-0 top-14 bottom-44 z-20 flex pointer-events-auto">
                        {/* Left Tap Zone (Previous Photo) */}
                        <div
                          role="button"
                          tabIndex={0}
                          aria-label="Previous photo"
                          onClick={handlePrevImage}
                          className="w-1/2 h-full cursor-pointer flex items-center justify-start pl-3 text-white/0 hover:text-white/80 transition-all select-none group/left"
                        >
                          {currentImgIndex > 0 && (
                            <div className="w-9 h-9 rounded-full bg-black/35 backdrop-blur-md flex items-center justify-center opacity-0 group-hover/left:opacity-100 transition-opacity shadow-md text-white">
                              <span className="material-symbols-outlined text-[24px]">
                                chevron_left
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Right Tap Zone (Next Photo) */}
                        <div
                          role="button"
                          tabIndex={0}
                          aria-label="Next photo"
                          onClick={handleNextImage}
                          className="w-1/2 h-full cursor-pointer flex items-center justify-end pr-3 text-white/0 hover:text-white/80 transition-all select-none group/right"
                        >
                          {currentImgIndex < currentGallery.length - 1 && (
                            <div className="w-9 h-9 rounded-full bg-black/35 backdrop-blur-md flex items-center justify-center opacity-0 group-hover/right:opacity-100 transition-opacity shadow-md text-white">
                              <span className="material-symbols-outlined text-[24px]">
                                chevron_right
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* LIKE Drag Stamp */}
                    <motion.div
                      style={{ opacity: likeOpacity }}
                      className="absolute top-12 left-6 z-40 px-4 py-1.5 rounded-2xl border-[3px] border-[#70DBB0] text-[#70DBB0] -rotate-12 text-2xl font-extrabold tracking-wider uppercase pointer-events-none shadow-sm bg-white/30 backdrop-blur-sm"
                    >
                      LIKE
                    </motion.div>

                    {/* NOPE Drag Stamp */}
                    <motion.div
                      style={{ opacity: nopeOpacity }}
                      className="absolute top-12 right-6 z-40 px-4 py-1.5 rounded-2xl border-[3px] border-[#dd1d77] text-[#dd1d77] rotate-12 text-2xl font-extrabold tracking-wider uppercase pointer-events-none shadow-sm bg-white/30 backdrop-blur-sm"
                    >
                      NOPE
                    </motion.div>

                    {/* Scrim & Detailed Profile Info Overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-[#261626] via-[#261626]/80 to-transparent flex flex-col justify-end p-5 text-white pointer-events-none">
                      <div className="flex items-end justify-between gap-3 pointer-events-auto">
                        <div className="flex flex-col min-w-0">
                          {/* Name & Verified Check */}
                          <div className="flex items-center gap-2">
                            <h2 className="text-2xl text-white font-extrabold tracking-tight">
                              {currentProfile.name}
                            </h2>
                            <span className="text-2xl text-white/90 font-normal">
                              {currentProfile.age}
                            </span>
                            <span
                              className="material-symbols-outlined text-[22px] text-[#0095F6] drop-shadow-sm select-none"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                              title="Verified Developer"
                            >
                              verified
                            </span>
                          </div>

                          {/* Profession / Vibe Tagline */}
                          <p className="text-sm text-white/90 font-medium truncate mt-0.5">
                            {currentProfile.role}
                          </p>

                          <div className="flex items-center gap-1 text-white/70 text-xs mt-0.5">
                            <span className="material-symbols-outlined text-[16px]">location_on</span>
                            <span>{currentProfile.location}</span>
                          </div>
                        </div>

                        {/* Glass Info Button */}
                        <button
                          onClick={() => setIsDrawerOpen(true)}
                          aria-label={`Open ${currentProfile.name}'s full bio`}
                          className="w-11 h-11 flex-shrink-0 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-95 shadow-sm cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[22px]">info</span>
                        </button>
                      </div>

                      {/* Shared Interests Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-3 pointer-events-auto">
                        {currentProfile.interests.map((item, idx) => (
                          <span
                            key={idx}
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                              item.highlight
                                ? "bg-[#dc1a80] text-white shadow-sm"
                                : "bg-white/15 backdrop-blur-md text-white"
                            }`}
                          >
                            <span>{item.emoji}</span> {item.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* Empty Stack State (Matches exact card height) */
                  <div className="text-center p-8 bg-white rounded-[28px] shadow-xl border border-[#e1bdc7]/40 w-full h-full flex flex-col items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#ffeffa] text-[#b40066] flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-[32px]">style</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#261626]">No more profiles</h3>
                    <p className="text-xs text-[#594048] mt-1 mb-5">
                      You've reviewed all profiles in your feed!
                    </p>
                    <button
                      onClick={() => refetch()}
                      className="px-5 py-2.5 rounded-full bg-[#b40066] text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                      Refresh Feed
                    </button>
                  </div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* Tinder-style Action Cluster */}
          <div className="w-full max-w-[380px] mx-auto mt-4 flex items-center justify-center gap-5">
            {/* Rewind Button */}
            <div className="relative flex flex-col items-center">
              <button
                onClick={handleRewind}
                disabled={history.length === 0}
                aria-label="Rewind card"
                className="w-12 h-12 rounded-full bg-white text-[#8d6f78] shadow-sm flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-90"
              >
                <span className="material-symbols-outlined text-[22px]">replay</span>
              </button>
              <span className="absolute -bottom-4 text-[9px] uppercase tracking-wide font-bold text-[#8d6f78]/60 whitespace-nowrap">
                Rewind
              </span>
            </div>

            {/* Nope Action Button */}
            <button
              onClick={() => triggerAction("nope")}
              disabled={!currentProfile}
              aria-label="Pass profile"
              className="w-16 h-16 rounded-full bg-white text-[#c54d46] shadow-[0_8px_20px_rgba(197,77,70,0.18)] hover:bg-[#ffeffa] active:scale-90 flex items-center justify-center transition-all cursor-pointer disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[32px] font-bold">close</span>
            </button>

            {/* Super Star / Boost Button */}
            <div className="relative flex flex-col items-center">
              <button
                onClick={() => triggerAction("superlike")}
                disabled={!currentProfile}
                aria-label="Super Like"
                className="w-12 h-12 rounded-full bg-white text-[#3794FF] shadow-sm hover:bg-[#ffeffa] active:scale-90 flex items-center justify-center transition-all cursor-pointer disabled:opacity-40"
              >
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
              </button>
              <span className="absolute -top-2.5 px-1.5 py-0.5 rounded-full bg-[#ffd9e3] text-[#3e001f] text-[8px] uppercase tracking-wider font-bold shadow-sm">
                Soon
              </span>
              <span className="absolute -bottom-4 text-[9px] uppercase tracking-wide font-bold text-[#8d6f78]/80 whitespace-nowrap">
                Super
              </span>
            </div>

            {/* Like Action Button */}
            <button
              onClick={() => triggerAction("like")}
              disabled={!currentProfile}
              aria-label="Like profile"
              className="w-16 h-16 rounded-full bg-white text-[#dd1d77] shadow-[0_10px_24px_-4px_rgba(221,29,119,0.28)] hover:bg-[#ffeffa] active:scale-90 flex items-center justify-center transition-all cursor-pointer disabled:opacity-40"
            >
              <span
                className="material-symbols-outlined text-[34px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
            </button>

            {/* Boost Button */}
            <div className="relative flex flex-col items-center">
              <button
                onClick={() => toast.info("Lightning Boost coming soon!")}
                aria-label="Lightning Boost"
                className="w-12 h-12 rounded-full bg-white text-[#9945FF] shadow-sm hover:bg-[#ffeffa] active:scale-90 flex items-center justify-center transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">bolt</span>
              </button>
              <span className="absolute -bottom-4 text-[9px] uppercase tracking-wide font-bold text-[#8d6f78]/80 whitespace-nowrap">
                Boost
              </span>
            </div>
          </div>

          {/* Micro UX Helper Pill */}
          <div className="mt-7 flex items-center justify-center">
            <div className="px-3.5 py-1.5 rounded-full bg-[#fce0f7] text-[#594048] text-[11px] font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">swipe</span>
              <span>Swipe right or tap heart on devBumble</span>
            </div>
          </div>

          {/* Interactive Card Drawer / Modal */}
          <AnimatePresence>
            {isDrawerOpen && currentProfile && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsDrawerOpen(false)}
                  className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 240 }}
                  className="fixed inset-x-0 bottom-0 z-50 max-w-[440px] mx-auto bg-white rounded-t-[28px] shadow-2xl p-6"
                >
                  <div className="w-12 h-1 rounded-full bg-[#e1bdc7] mx-auto mb-4" />
                  <div className="flex items-center justify-between pb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xl font-bold text-[#261626]">
                          About {currentProfile.name}
                        </h3>
                        <span
                          className="material-symbols-outlined text-[19px] text-[#0095F6]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          verified
                        </span>
                      </div>
                      <p className="text-xs text-[#8d6f78] mt-0.5">
                        Active nearby • Verified Developer
                      </p>
                    </div>
                    <button
                      onClick={() => setIsDrawerOpen(false)}
                      aria-label="Close drawer"
                      className="w-9 h-9 rounded-full bg-[#ffe7fa] flex items-center justify-center text-[#8d6f78] hover:text-[#261626] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">expand_more</span>
                    </button>
                  </div>
                  <p className="text-sm text-[#594048] mt-2 leading-relaxed">
                    "{currentProfile.bio}"
                  </p>
                  <div className="mt-4 pt-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#b40066]">
                      auto_awesome
                    </span>
                    <span className="text-xs font-bold text-[#b40066]">
                      {currentProfile.sharedText}
                    </span>
                  </div>

                  {/* Photo Gallery Grid */}
                  {currentGallery.length > 1 && (
                    <div className="mt-4 pt-3 border-t border-[#e1bdc7]/40">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-[#8d6f78] uppercase tracking-wider">
                          Photos ({currentGallery.length})
                        </h4>
                        <span className="text-[10px] text-[#b40066] font-semibold">
                          Tap to view
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {currentGallery.map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setCurrentImgIndex(i);
                              setIsDrawerOpen(false);
                            }}
                            className={`aspect-[3/4] rounded-xl overflow-hidden ring-2 transition-all cursor-pointer relative ${
                              i === currentImgIndex
                                ? "ring-[#b40066] scale-102"
                                : "ring-transparent opacity-80 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={img}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            {i === 0 && (
                              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-[#b40066] text-white text-[9px] font-bold">
                                Main
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
