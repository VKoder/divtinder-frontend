import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";
import { useLogout } from "@/hooks/useLogout";
import { usePendingRequests, useReviewRequest } from "@/hooks/useRequests";
import logoImg from "@/assets/Logo.png";

export default function PendingRequestsPage() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const { mutate: logout } = useLogout();
  const { data: rawRequests = [], isLoading, isError, refetch } = usePendingRequests();
  const { mutate: reviewReq, isPending: isReviewing } = useReviewRequest();

  const [activeTab, setActiveTab] = useState("received"); // "received" | "sent"
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // Normalize request items (handles either direct user objects or populated request documents)
  const requests = (Array.isArray(rawRequests) ? rawRequests : []).map((item, idx) => {
    // In backend response:
    // item._id is the connection requestId needed for /request/receive/:status/:requestId
    // item.fromUserId is the sender user object
    const profile =
      item.fromUserId && typeof item.fromUserId === "object"
        ? item.fromUserId
        : item;
    const requestId = item._id;

    // Use user's real avatar (or default placeholder if none exists) - do not use fake/mock photos!
    const rawAvatar = profile?.avatar?.trim() || "https://via.placeholder.com/150";

    // Extract only uploaded images from gallery
    const galleryImgs = Array.isArray(profile?.gallery)
      ? profile.gallery
          .map((g) => (typeof g === "string" ? g : g?.img || g?.url || ""))
          .filter(Boolean)
      : [];

    // If there are uploaded gallery images, use the first one; otherwise use its avatar!
    const avatar = galleryImgs.length > 0 ? galleryImgs[0] : rawAvatar;

    const fullName = `${profile.firstName || "Developer"} ${profile.lastName || ""}`.trim();

    return {
      requestId,
      userId: profile._id,
      firstName: profile.firstName || "Developer",
      lastName: profile.lastName || "",
      fullName,
      age: profile.age || 26,
      avatar,
      gallery: galleryImgs,
      about: profile.about || "New to devBumble",
      bio: profile.bio || "Hello! Excited to connect on devBumble.",
      skills: profile.skills || [],
      isSuperLike: idx % 3 === 1,
    };
  });

  const handleAction = (status, req, e) => {
    e?.stopPropagation();
    if (processingId) return;

    setProcessingId(req.requestId);
    reviewReq(
      { status, requestId: req.requestId },
      {
        onSettled: () => {
          setProcessingId(null);
          if (selectedRequest?.requestId === req.requestId) {
            setSelectedRequest(null);
          }
        },
      }
    );
  };

  return (
    <div className="bg-[#fff7fa] font-['Plus_Jakarta_Sans',sans-serif] text-[#261626] antialiased flex flex-col min-h-screen selection:bg-[#b40066] selection:text-white select-none">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#fff7fa]/85 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(41,17,38,0.04)]">
        <div className="h-16 px-4 flex items-center justify-between max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
          {/* User Profile Link */}
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 min-w-[44px] min-h-[44px] justify-center cursor-pointer active:scale-95 transition-transform"
            data-path="profile"
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#dc1a80]/20"
              src={
                user?.avatar ||
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAuQ0GXRQGiLY65SrQcOC4o21oAFmzidr29gUUGLfPQJu8rfD5Diolv49DI3xMKb5e8Zy8P86wSFtGLywgXPyGKyDK9JZsVgX8Ujs185UKyP2nkTwf2lnhMpiz_I7QbkAFs2ngMzf8RwbOcuk-ZLEsgJizmSP7w2tInc_AuAlBa8tYKbHhanOgZaHTv9sGxuujuZ8uukEeXULNx423RFosdUda1c1G1P98SEcpN"
              }
            />
            <span className="font-bold text-xs text-[#261626] tracking-tight hidden sm:inline">
              {user?.firstName || "devBumble"}
            </span>
          </button>

          {/* App Logo */}
          <div
            onClick={() => navigate("/feed")}
            className="flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <img
              alt="devBumble Logo"
              className="h-8 w-auto object-contain transition-transform active:scale-95"
              src={logoImg}
            />
            <span className="font-['Sora',sans-serif] text-base font-bold text-[#b40066] tracking-tight">
              Likes
            </span>
          </div>

          {/* Settings / Menu */}
          <div className="relative flex items-center justify-end min-w-[44px] min-h-[44px]">
            <button
              onClick={() => setShowSettingsMenu((prev) => !prev)}
              aria-label="Settings"
              className="w-11 h-11 flex items-center justify-center text-[#8d6f78] hover:text-[#261626] rounded-full transition-colors active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">tune</span>
            </button>

            {/* Dropdown Menu */}
            {showSettingsMenu && (
              <div className="absolute right-0 top-12 w-44 bg-white rounded-2xl shadow-xl border border-[#e1bdc7]/50 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setShowSettingsMenu(false);
                    refetch();
                    toast.success("Requests refreshed!");
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-[#261626] hover:bg-[#ffeffa] rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#b40066]">
                    refresh
                  </span>
                  <span>Refresh Requests</span>
                </button>
                <button
                  onClick={() => {
                    setShowSettingsMenu(false);
                    navigate("/profile");
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-[#261626] hover:bg-[#ffeffa] rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#b40066]">
                    tune
                  </span>
                  <span>Preferences</span>
                </button>
                <div className="h-px bg-[#e1bdc7]/40 my-1" />
                <button
                  onClick={() => {
                    setShowSettingsMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
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
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-28 bg-[#fff7fa] max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
        <div className="flex flex-col w-full px-4 pb-8">
          {/* Segmented Top Tabs */}
          <div className="w-full pt-2 pb-3">
            <div className="flex p-1 bg-[#ffe7fa] rounded-full shadow-inner max-w-xs mx-auto border border-[#e1bdc7]/30">
              <button
                onClick={() => setActiveTab("received")}
                className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                  activeTab === "received"
                    ? "bg-white text-[#b40066] shadow-sm"
                    : "text-[#594048] hover:text-[#261626]"
                }`}
              >
                <span>Received</span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#ffd9e3] text-[#3e001f] text-[10px] leading-none font-extrabold">
                  {requests.length}
                </span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("sent");
                  toast.info("Sent requests history coming soon!");
                }}
                className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                  activeTab === "sent"
                    ? "bg-white text-[#b40066] shadow-sm"
                    : "text-[#594048] hover:text-[#261626]"
                }`}
              >
                <span>Sent</span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#f6daf1] text-[#594048] text-[10px] leading-none font-extrabold">
                  0
                </span>
              </button>
            </div>
          </div>

          {/* Header & Context */}
          <div className="flex flex-col gap-0.5 pt-1 pb-4">
            <h1 className="font-['Sora',sans-serif] text-xl sm:text-[22px] leading-tight font-bold text-[#261626] tracking-tight">
              People who liked your profile
            </h1>
            <p className="text-xs text-[#594048]">
              Tap to inspect or choose an action to decide your spark.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="material-symbols-outlined text-[40px] text-[#b40066] animate-spin">
                progress_activity
              </span>
              <p className="text-xs font-bold text-[#8d6f78]">
                Loading connection requests...
              </p>
            </div>
          )}

          {/* Error State */}
          {!isLoading && isError && (
            <div className="p-6 rounded-3xl bg-white border border-[#e1bdc7]/50 shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-[28px]">error</span>
              </div>
              <h3 className="font-['Sora',sans-serif] text-base font-bold text-[#261626]">
                Unable to load pending requests
              </h3>
              <p className="text-xs text-[#594048] mt-1 mb-4">
                Please make sure your backend server is running on localhost:7777.
              </p>
              <button
                onClick={() => refetch()}
                className="px-5 py-2 rounded-full bg-[#b40066] text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Likes Grid */}
          {!isLoading && !isError && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
              {requests.map((req) => {
                const isItemProcessing = processingId === req.requestId;

                return (
                  <div
                    key={req.requestId}
                    onClick={() => setSelectedRequest(req)}
                    className="group relative flex flex-col aspect-[3/4.4] rounded-[20px] overflow-hidden bg-[#fce0f7] shadow-[0_12px_28px_-6px_rgba(41,17,38,0.08)] transform transition-transform duration-300 hover:scale-[1.01] cursor-pointer"
                  >
                    {/* Discovery Profile Image */}
                    <img
                      alt={req.fullName}
                      className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                      src={req.avatar}
                    />

                    {/* Gradient Scrim for Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#261626]/95 via-[#261626]/40 to-transparent pointer-events-none" />

                    {/* Top Tag: Super Like or Verified */}
                    <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                      {req.isSuperLike ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#dc1a80] text-white text-[10px] font-bold shadow-sm">
                          <span
                            className="material-symbols-outlined text-[13px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            bolt
                          </span>
                          Super Like
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#261626]/60 backdrop-blur-md text-white text-[10px] font-bold">
                          <span
                            className="material-symbols-outlined text-[13px] text-[#0095F6]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            verified
                          </span>
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Processing Overlay */}
                    {isItemProcessing && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs z-30 flex flex-col items-center justify-center text-white gap-2">
                        <span className="material-symbols-outlined text-[30px] animate-spin">
                          progress_activity
                        </span>
                        <span className="text-[10px] font-bold">Updating...</span>
                      </div>
                    )}

                    {/* Metadata & Info */}
                    <div className="relative z-10 mt-auto px-3 pb-1.5 text-white flex flex-col pointer-events-none">
                      <div className="flex items-center gap-1">
                        <span className="font-['Sora',sans-serif] text-[15px] font-bold text-white tracking-tight leading-snug drop-shadow-sm truncate">
                          {req.fullName}, {req.age}
                        </span>
                        <span
                          className="material-symbols-outlined text-[15px] text-[#0095F6] drop-shadow-sm select-none"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                          title="Verified"
                        >
                          verified
                        </span>
                      </div>
                      <p className="text-[11px] text-white/90 line-clamp-1 leading-tight drop-shadow-sm mt-0.5">
                        {req.about || req.bio}
                      </p>
                    </div>

                    {/* Floating Action Buttons: REJECT & ACCEPT */}
                    <div className="relative z-20 px-3 pb-3 pt-1 flex items-center justify-between gap-2">
                      {/* REJECT BUTTON */}
                      <button
                        type="button"
                        aria-label={`Pass on ${req.firstName}`}
                        disabled={isItemProcessing || isReviewing}
                        onClick={(e) => handleAction("rejected", req, e)}
                        className="w-11 h-11 rounded-full bg-white text-[#8d6f78] hover:text-[#ba1a1a] flex items-center justify-center shadow-[0_4px_12px_rgba(41,17,38,0.18)] hover:bg-[#ffeffa] active:scale-90 transition-transform cursor-pointer disabled:opacity-50"
                        title="Reject request"
                      >
                        <span className="material-symbols-outlined text-[20px] font-bold">
                          close
                        </span>
                      </button>

                      {/* ACCEPT BUTTON */}
                      <button
                        type="button"
                        aria-label={`Accept ${req.firstName}`}
                        disabled={isItemProcessing || isReviewing}
                        onClick={(e) => handleAction("accepted", req, e)}
                        className="w-11 h-11 rounded-full bg-white text-[#70DBB0] hover:text-[#008561] flex items-center justify-center shadow-[0_4px_12px_rgba(41,17,38,0.18)] hover:bg-emerald-50 active:scale-90 transition-transform cursor-pointer disabled:opacity-50"
                        title="Accept request"
                      >
                        <span
                          className="material-symbols-outlined text-[22px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          favorite
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Blush Teaser Mystery Card (from template) */}
              <div className="relative flex flex-col aspect-[3/4.4] rounded-[20px] overflow-hidden bg-[#ffe7fa] shadow-[0_8px_24px_-6px_rgba(41,17,38,0.05)] p-3 justify-between border border-[#e1bdc7]/30">
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#ffd9e2]/50 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-[#ffd9e3]/40 blur-xl pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#b5005e] text-white text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    New Like
                  </span>
                  <span className="material-symbols-outlined text-[#8d6f78] text-[18px]">
                    lock
                  </span>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto px-1">
                  <div className="w-14 h-14 rounded-full bg-[#f6daf1] flex items-center justify-center shadow-inner relative mb-2">
                    <span className="material-symbols-outlined text-[#b40066] text-[28px]">
                      favorite_border
                    </span>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#b40066]/10 to-transparent" />
                  </div>
                  <p className="font-bold text-xs text-[#261626]">Someone new liked you!</p>
                  <p className="text-[11px] text-[#594048] mt-0.5">Keep swiping to reveal</p>
                </div>

                <div className="relative z-10 w-full pt-1">
                  <button
                    onClick={() => navigate("/feed")}
                    className="w-full py-2 px-3 rounded-full bg-white text-[#b40066] text-[11px] font-bold shadow-sm flex items-center justify-center gap-1 active:scale-95 transition-transform cursor-pointer hover:bg-[#ffeffa]"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      auto_awesome
                    </span>
                    Discover Now
                  </button>
                </div>
              </div>

              {/* Extra Space / Boost Card (from template) */}
              <div className="relative flex flex-col aspect-[3/4.4] rounded-[20px] overflow-hidden bg-[#ffeffa] shadow-[0_8px_24px_-6px_rgba(41,17,38,0.05)] p-3 justify-between border border-[#e1bdc7]/30">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#b40066] text-[18px]">
                    electric_bolt
                  </span>
                  <span className="text-[#b40066] uppercase tracking-wider text-[10px] font-bold">
                    Boost Profile
                  </span>
                </div>

                <div className="flex flex-col items-center text-center px-1 my-auto">
                  <div className="w-12 h-12 rounded-full bg-[#ffd9e3] flex items-center justify-center text-[#3e001f] mb-2 shadow-xs">
                    <span className="material-symbols-outlined text-[24px]">
                      rocket_launch
                    </span>
                  </div>
                  <p className="font-bold text-xs text-[#261626]">Get 3x more likes</p>
                  <p className="text-[11px] text-[#594048] mt-0.5">
                    Be the top profile in your city
                  </p>
                </div>

                <button
                  onClick={() => toast.info("Lightning Boost coming soon!")}
                  className="w-full py-2 px-3 rounded-full bg-[#b40066] text-white text-[11px] font-bold shadow-sm flex items-center justify-center gap-1 active:scale-95 transition-transform cursor-pointer"
                >
                  Supercharge
                </button>
              </div>
            </div>
          )}

          {/* Empty State when no requests */}
          {!isLoading && !isError && requests.length === 0 && (
            <div className="p-8 rounded-3xl bg-white border border-[#e1bdc7]/40 shadow-sm text-center flex flex-col items-center mt-2">
              <div className="w-14 h-14 rounded-full bg-[#ffeffa] text-[#b40066] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[32px]">favorite_border</span>
              </div>
              <h3 className="font-['Sora',sans-serif] text-base font-bold text-[#261626]">
                No pending requests right now
              </h3>
              <p className="text-xs text-[#594048] mt-1 mb-5 max-w-xs leading-relaxed">
                When developers like your profile on devBumble, their pending requests will appear here so you can accept or pass.
              </p>
              <button
                onClick={() => navigate("/feed")}
                className="px-6 py-2.5 rounded-full bg-[#b40066] text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">style</span>
                <span>Discover Developers</span>
              </button>
            </div>
          )}

          {/* Bottom Delight Helper State */}
          <div className="w-full mt-6">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white shadow-[0_4px_16px_rgba(41,17,38,0.04)] border border-[#e1bdc7]/30">
              <div className="w-9 h-9 rounded-full bg-[#ffd9e3] flex items-center justify-center text-[#b40066] shrink-0">
                <span className="material-symbols-outlined text-[20px]">all_inclusive</span>
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-xs font-bold text-[#261626]">Mutual Match Notice</p>
                <p className="text-[11px] text-[#594048] leading-snug">
                  Accepting creates an instant mutual match, allowing you both to message.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Inspect Profile Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm md:max-w-md bg-white rounded-[28px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="relative h-64 bg-[#ffe7fa]">
              <img
                alt={selectedRequest.fullName}
                className="w-full h-full object-cover"
                src={selectedRequest.avatar}
              />
              <button
                onClick={() => setSelectedRequest(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-black/60"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#261626] to-transparent text-white">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-['Sora',sans-serif] text-xl font-bold">
                    {selectedRequest.fullName}, {selectedRequest.age}
                  </h3>
                  <span
                    className="material-symbols-outlined text-[20px] text-[#0095F6] drop-shadow-sm select-none"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    title="Verified Developer"
                  >
                    verified
                  </span>
                </div>
                <p className="text-xs text-white/80">{selectedRequest.about}</p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-[#8d6f78] uppercase tracking-wider mb-1">
                  Bio
                </h4>
                <p className="text-sm text-[#261626] leading-relaxed">
                  {selectedRequest.bio}
                </p>
              </div>

              {selectedRequest.skills?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#8d6f78] uppercase tracking-wider mb-1.5">
                    Skills & Tech
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRequest.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-full bg-[#ffeffa] text-[#b40066] text-xs font-bold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons inside modal */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={(e) => handleAction("rejected", selectedRequest, e)}
                  className="flex-1 py-3 rounded-full border border-[#ba1a1a]/40 bg-[#ffdad6]/20 text-[#ba1a1a] text-xs font-bold hover:bg-[#ffdad6]/50 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                  <span>Pass</span>
                </button>
                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={(e) => handleAction("accepted", selectedRequest, e)}
                  className="flex-1 py-3 rounded-full bg-[#b40066] text-white text-xs font-bold shadow-md hover:bg-[#dc1a80] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    favorite
                  </span>
                  <span>Accept Match</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
