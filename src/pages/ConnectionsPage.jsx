import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";
import { useLogout } from "@/hooks/useLogout";
import { useConnections } from "@/hooks/useConnections";
import logoImg from "@/assets/Logo.png";

export default function ConnectionsPage() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const { mutate: logout } = useLogout();
  const { data: rawConnections = [], isLoading, isError, refetch } = useConnections();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [activeModalPhoto, setActiveModalPhoto] = useState(null);
  const [activeChatConn, setActiveChatConn] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [inputMsg, setInputMsg] = useState("");
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  // Normalize connection data
  const connections = useMemo(() => {
    if (!Array.isArray(rawConnections)) return [];
    return rawConnections.map((item, idx) => {
      // Use user's real avatar (or default placeholder if none exists) - do not use fake/mock photos!
      const rawAvatar = item?.avatar?.trim() || "https://via.placeholder.com/150";

      const rawGallery = Array.isArray(item?.gallery) && item.gallery.length > 0
        ? item.gallery.map((g) => (typeof g === "string" ? g : g?.img || g?.url || "")).filter(Boolean)
        : [];
      const gallery = rawGallery.length > 0 ? rawGallery : [rawAvatar];
      const avatar = gallery[0] || rawAvatar;

      const fullName = `${item?.firstName || "Developer"} ${item?.lastName || ""}`.trim();
      const skills = item?.skills || [];

      const messageTypes = ["unread", "normal", "icebreaker", "photo"];
      const messageType = messageTypes[idx % messageTypes.length];

      const timeOptions = ["2m ago", "1h ago", "Yesterday", "3d ago", "5d ago"];
      const time = timeOptions[idx % timeOptions.length];

      return {
        id: item._id || `conn-${idx}`,
        firstName: item.firstName || "Developer",
        lastName: item.lastName || "",
        fullName,
        avatar,
        gallery,
        about: item.about || "New to devBumble",
        bio: item.bio || "Hello! Excited to connect on devBumble.",
        skills,
        age: item.age || 26,
        statusText: idx === 0 ? "Active now" : idx === 1 ? "Recent" : "Yesterday",
        isActive: idx % 2 === 0,
        messageType,
        time,
        lastMessage:
          idx === 0
            ? "Coffee this Thursday at Blue Bottle? ✨"
            : idx === 1
            ? "Haha that repo is incredible! Thanks for sharing."
            : item.bio || "Let's connect and build something cool!",
      };
    });
  }, [rawConnections]);

  // Filter connections by search query
  const filteredConnections = useMemo(() => {
    if (!searchQuery.trim()) return connections;
    const q = searchQuery.toLowerCase();
    return connections.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.about.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q))
    );
  }, [connections, searchQuery]);

  // Handle sending a quick chat message
  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputMsg.trim() || !activeChatConn) return;

    const connId = activeChatConn.id;
    const newMsg = {
      id: Date.now(),
      sender: "me",
      text: inputMsg.trim(),
      time: "Just now",
    };

    setChatMessages((prev) => ({
      ...prev,
      [connId]: [...(prev[connId] || []), newMsg],
    }));

    setInputMsg("");
    toast.success(`Message sent to ${activeChatConn.firstName}!`);
  };

  const currentChatHistory = activeChatConn
    ? chatMessages[activeChatConn.id] || [
        {
          id: 1,
          sender: "them",
          text: activeChatConn.lastMessage,
          time: activeChatConn.time,
        },
      ]
    : [];

  return (
    <div className="bg-[#fff7fa] font-['Plus_Jakarta_Sans',sans-serif] text-[#261626] min-h-screen flex flex-col antialiased selection:bg-[#b40066] selection:text-white">
      {/* Mobile-only Header */}
      <header className="md:hidden fixed top-0 inset-x-0 z-50 pt-safe bg-[#fff7fa]/85 backdrop-blur-xl shadow-[0_4px_24px_-4px_rgba(41,17,38,0.04)]">
        <div className="h-16 px-4 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto flex items-center justify-between">
          {/* User Profile Avatar Link */}
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full transition-transform active:scale-95 cursor-pointer"
            data-path="profile"
            aria-label="Profile"
          >
            <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#b40066] to-[#dd1d77]">
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-white"
                src={
                  user?.avatar ||
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuAuQ0GXRQGiLY65SrQcOC4o21oAFmzidr29gUUGLfPQJu8rfD5Diolv49DI3xMKb5e8Zy8P86wSFtGLywgXPyGKyDK9JZsVgX8Ujs185UKyP2nkTwf2lnhMpiz_I7QbkAFs2ngMzf8RwbOcuk-ZLEsgJizmSP7w2tInc_AuAlBa8tYKbHhanOgZaHTv9sGxuujuZ8uukEeXULNx423RFosdUda1c1G1P98SEcpN"
                }
              />
            </div>
          </button>

          {/* Logo & Screen Title */}
          <div
            onClick={() => navigate("/feed")}
            className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-90"
          >
            <img
              alt="devBumble Logo"
              className="h-8 w-auto object-contain"
              src={logoImg}
            />
            <span className="font-['Sora',sans-serif] text-lg sm:text-[20px] leading-[26px] text-[#b40066] tracking-tight font-bold">
              Matches And Messages
            </span>
          </div>

          {/* Filter Preferences / Settings button */}
          <div className="relative">
            <button
              onClick={() => setShowSettingsMenu((prev) => !prev)}
              aria-label="Filter Preferences"
              className="flex items-center justify-center w-11 h-11 rounded-full text-[#594048] hover:text-[#b40066] transition-colors bg-[#ffe7fa]/60 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">tune</span>
            </button>

            {/* Dropdown Menu */}
            {showSettingsMenu && (
              <div className="absolute right-0 top-12 w-44 bg-white rounded-2xl shadow-xl border border-[#e1bdc7]/50 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setShowSettingsMenu(false);
                    refetch();
                    toast.success("Connections refreshed!");
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-[#261626] hover:bg-[#ffeffa] rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#b40066]">
                    refresh
                  </span>
                  <span>Refresh Matches</span>
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-28 bg-[#fff7fa] max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
        <div className="flex flex-col w-full px-4 space-y-6 pb-8">
          {/* Search Field */}
          <div className="relative w-full pt-2">
            <div className="flex items-center w-full h-12 px-4 rounded-2xl bg-[#ffeffa] shadow-[0_4px_16px_-4px_rgba(41,17,38,0.04)] focus-within:bg-white focus-within:shadow-[0_8px_24px_-4px_rgba(255,61,154,0.15)] transition-all duration-300 border border-transparent focus-within:border-[#e1bdc7]/50">
              <span className="material-symbols-outlined text-[#8d6f78] text-[22px] mr-2 select-none">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent font-['Plus_Jakarta_Sans',sans-serif] text-[15px] text-[#261626] placeholder:text-[#8d6f78] focus:outline-none"
                placeholder={
                  connections.length > 0
                    ? `Search ${connections.length} matches...`
                    : "Search matches..."
                }
                type="text"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-[#8d6f78] hover:text-[#b40066] p-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              ) : (
                <button
                  aria-label="Voice search or audio filters"
                  onClick={() => toast.info("Voice search is active for audio filters!")}
                  className="text-[#8d6f78] hover:text-[#b40066] transition-colors p-1 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">mic</span>
                </button>
              )}
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <span className="material-symbols-outlined text-[40px] text-[#b40066] animate-spin">
                progress_activity
              </span>
              <p className="text-xs font-semibold text-[#8d6f78]">
                Loading your matches and conversations...
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
                Unable to load connections
              </h3>
              <p className="text-xs text-[#594048] mt-1 mb-4">
                Please make sure you are logged in and the server is running on localhost:7777.
              </p>
              <button
                onClick={() => refetch()}
                className="px-5 py-2 rounded-full bg-[#b40066] text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Section 1: New Matches */}
          {!isLoading && !isError && (
            <section className="flex flex-col space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-['Sora',sans-serif] text-[20px] leading-[26px] text-[#261626] font-bold tracking-tight">
                    New Matches
                  </h2>
                  <span className="flex items-center justify-center px-2 py-0.5 rounded-full bg-[#dd1d77] text-white text-[11px] leading-[14px] font-bold shadow-sm">
                    {connections.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (connections.length === 0) {
                      navigate("/feed");
                    } else {
                      toast.info(`Showing all ${connections.length} matches!`);
                    }
                  }}
                  className="text-[13px] leading-[16px] text-[#b40066] font-bold hover:opacity-80 transition-opacity cursor-pointer"
                >
                  See All
                </button>
              </div>

              {/* Horizontal Matches Scroll */}
              <div className="flex items-start gap-4 overflow-x-auto pt-1 pb-2 -mx-4 px-4 select-none scrollbar-none">
                {/* Real Connections from API */}
                {filteredConnections.map((conn) => (
                  <button
                    key={conn.id}
                    onClick={() => setSelectedConnection(conn)}
                    className="flex flex-col items-center gap-1.5 flex-shrink-0 group active:scale-95 transition-transform text-left cursor-pointer"
                  >
                    <div className="relative p-[3px] rounded-full bg-gradient-to-tr from-[#b40066] via-[#dc1a80] to-[#b5005e] shadow-[0_6px_20px_-2px_rgba(220,26,128,0.35)]">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#fce0f7]">
                        <img
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          alt={conn.fullName}
                          src={conn.avatar}
                        />
                      </div>
                      {/* Active indicator */}
                      {conn.isActive && (
                        <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#008561] shadow-sm border-2 border-[#fff7fa]" />
                      )}
                    </div>
                    <span className="font-['Sora',sans-serif] text-[13px] text-[#261626] font-bold text-center max-w-[70px] truncate">
                      {conn.firstName}
                    </span>
                    <span
                      className={`text-[11px] -mt-1 font-semibold ${
                        conn.isActive ? "text-[#b5005e]" : "text-[#8d6f78]"
                      }`}
                    >
                      {conn.statusText}
                    </span>
                  </button>
                ))}

                {/* If no connections found matching filter */}
                {connections.length > 0 && filteredConnections.length === 0 && (
                  <div className="flex items-center text-xs text-[#8d6f78] py-4 px-2 italic">
                    No matches for "{searchQuery}"
                  </div>
                )}

                {/* If user has zero connections yet */}
                {connections.length === 0 && (
                  <button
                    onClick={() => navigate("/feed")}
                    className="flex flex-col items-center justify-center gap-1.5 flex-shrink-0 p-2 cursor-pointer group active:scale-95"
                  >
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#e1bdc7] flex items-center justify-center text-[#b40066] group-hover:border-[#b40066] transition-colors">
                      <span className="material-symbols-outlined text-[28px]">add</span>
                    </div>
                    <span className="text-[13px] font-bold text-[#261626]">Find Matches</span>
                    <span className="text-[11px] text-[#b40066] -mt-1 font-medium">Swipe feed</span>
                  </button>
                )}
              </div>
            </section>
          )}

          {/* Section 2: Messages */}
          {!isLoading && !isError && (
            <section className="flex flex-col space-y-2">
              <div className="flex items-center justify-between px-1 mb-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-['Sora',sans-serif] text-[20px] leading-[26px] text-[#261626] font-bold tracking-tight">
                    Messages
                  </h2>
                  <span className="w-2 h-2 rounded-full bg-[#b40066] animate-pulse" />
                </div>
                <button
                  aria-label="Sort or mark messages"
                  onClick={() => toast.info("Filter applied: Sorted by newest interaction")}
                  className="text-[#594048] hover:text-[#b40066] transition-colors p-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">filter_list</span>
                </button>
              </div>

              {/* Active Conversations Feed */}
              <div className="flex flex-col space-y-2.5">
                {filteredConnections.length > 0 ? (
                  filteredConnections.map((conn, idx) => {
                    const isUnread = conn.messageType === "unread";
                    const isIcebreaker = conn.messageType === "icebreaker";
                    const isPhoto = conn.messageType === "photo";

                    return (
                      <div
                        key={conn.id}
                        onClick={() => setActiveChatConn(conn)}
                        className={`relative flex items-center gap-3.5 p-3.5 rounded-3xl transition-all duration-200 cursor-pointer active:scale-[0.99] ${
                          isUnread
                            ? "bg-[#ffeffa] hover:bg-[#fce0f7] shadow-[0_4px_20px_-4px_rgba(220,26,128,0.08)] border border-[#ffd9e3]/50"
                            : "bg-white hover:bg-[#ffeffa]/60 shadow-[0_2px_12px_rgba(41,17,38,0.03)] border border-[#e1bdc7]/30"
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`relative flex-shrink-0 ${
                            isUnread
                              ? "p-[2.5px] rounded-full bg-gradient-to-tr from-[#b40066] to-[#dd1d77] shadow-[0_4px_16px_rgba(220,26,128,0.3)]"
                              : ""
                          }`}
                        >
                          <div className="w-14 h-14 rounded-full overflow-hidden bg-[#ffe7fa]">
                            <img
                              className="w-full h-full object-cover"
                              alt={conn.fullName}
                              src={conn.avatar}
                            />
                          </div>
                          {conn.isActive && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#008561] border-2 border-[#fff7fa]" />
                          )}
                        </div>

                        {/* Content text */}
                        <div className="flex flex-col flex-1 min-w-0 pr-1">
                          <div className="flex items-baseline justify-between mb-0.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <h3 className="font-['Sora',sans-serif] text-[15px] text-[#261626] font-bold truncate">
                                {conn.fullName}, {conn.age}
                              </h3>
                              <span
                                className="material-symbols-outlined text-[15px] text-[#0095F6] shrink-0"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                                title="Verified"
                              >
                                verified
                              </span>
                            </div>
                            <span
                              className={`text-[11px] font-bold ml-2 flex-shrink-0 ${
                                isUnread ? "text-[#b40066]" : "text-[#8d6f78]"
                              }`}
                            >
                              {conn.time}
                            </span>
                          </div>

                          {/* Message snippet variations */}
                          {isIcebreaker ? (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffd9e3] text-[#3e001f] text-[11px] font-semibold truncate">
                                <span
                                  className="material-symbols-outlined text-[13px] text-[#b40066]"
                                  style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                  favorite
                                </span>
                                You matched! Send the first message
                              </span>
                            </div>
                          ) : isPhoto ? (
                            <div className="flex items-center gap-1 text-[#594048] text-[14px]">
                              <span className="material-symbols-outlined text-[16px] text-[#b5005e]">
                                photo_camera
                              </span>
                              <span className="truncate">Sent a photo</span>
                            </div>
                          ) : (
                            <p
                              className={`text-[14px] truncate tracking-tight ${
                                isUnread
                                  ? "text-[#261626] font-bold"
                                  : "text-[#594048] font-normal"
                              }`}
                            >
                              {conn.lastMessage}
                            </p>
                          )}
                        </div>

                        {/* Unread Indicator Dot */}
                        {isUnread && (
                          <div className="flex-shrink-0 flex items-center justify-center pl-1">
                            <span className="w-3 h-3 rounded-full bg-[#b40066] shadow-[0_0_12px_rgba(180,0,102,0.6)]" />
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : connections.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-white border border-[#e1bdc7]/40 shadow-sm text-center flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-[#ffe7fa] text-[#b40066] flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-[32px]">favorite</span>
                    </div>
                    <h3 className="font-['Sora',sans-serif] text-base font-bold text-[#261626]">
                      No connections yet
                    </h3>
                    <p className="text-xs text-[#594048] mt-1 mb-5 max-w-xs leading-relaxed">
                      Start swiping on developers to connect, exchange code ideas, and chat!
                    </p>
                    <button
                      onClick={() => navigate("/feed")}
                      className="px-6 py-2.5 rounded-full bg-[#b40066] text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">style</span>
                      <span>Discover Developers</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-[#8d6f78] bg-white rounded-2xl border border-[#e1bdc7]/40">
                    No conversations match your search.
                  </div>
                )}
              </div>
            </section>
          )}

        </div>
      </main>

      {/* Interactive Chat Drawer */}
      {activeChatConn && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-lg md:max-w-xl bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col h-[82vh] overflow-hidden animate-in slide-in-from-bottom duration-250">
            {/* Chat Header */}
            <div className="p-4 bg-[#fff7fa] border-b border-[#e1bdc7]/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    alt={activeChatConn.fullName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#b40066]/30"
                    src={activeChatConn.avatar}
                  />
                  {activeChatConn.isActive && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#008561] border border-white" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="font-['Sora',sans-serif] text-sm font-bold text-[#261626]">
                      {activeChatConn.fullName}
                    </h3>
                    <span
                      className="material-symbols-outlined text-[15px] text-[#0095F6]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                      title="Verified"
                    >
                      verified
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8d6f78]">
                    {activeChatConn.about || "Active on devBumble"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setSelectedConnection(activeChatConn);
                  }}
                  className="w-9 h-9 rounded-full bg-[#ffe7fa] flex items-center justify-center text-[#b40066] hover:bg-[#ffd9e3] cursor-pointer"
                  title="View Profile"
                >
                  <span className="material-symbols-outlined text-[20px]">info</span>
                </button>
                <button
                  onClick={() => setActiveChatConn(null)}
                  className="w-9 h-9 rounded-full bg-[#ffe7fa] flex items-center justify-center text-[#594048] hover:text-[#261626] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fff7fa]/40">
              <div className="text-center my-2">
                <span className="inline-block px-3 py-1 rounded-full bg-[#ffe7fa] text-[#8d6f78] text-[10px] font-bold">
                  Connected on devBumble
                </span>
              </div>

              {currentChatHistory.map((m) => {
                const isMe = m.sender === "me";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-xs ${
                        isMe
                          ? "bg-[#b40066] text-white rounded-br-xs"
                          : "bg-white text-[#261626] border border-[#e1bdc7]/40 rounded-bl-xs"
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-[#8d6f78] mt-1 px-1">{m.time}</span>
                  </div>
                );
              })}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-white border-t border-[#e1bdc7]/30 flex items-center gap-2"
            >
              <input
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder={`Message ${activeChatConn.firstName}...`}
                className="flex-1 h-11 px-4 rounded-full bg-[#ffeffa] text-[14px] text-[#261626] placeholder:text-[#8d6f78] focus:outline-none focus:ring-1 focus:ring-[#b40066]"
              />
              <button
                type="submit"
                disabled={!inputMsg.trim()}
                className="w-11 h-11 rounded-full bg-[#b40066] text-white flex items-center justify-center disabled:opacity-40 shadow-sm active:scale-95 transition-transform cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Profile Detail Modal */}
      {selectedConnection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm md:max-w-md bg-white rounded-[28px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="relative h-64 bg-[#ffe7fa]">
              <img
                alt={selectedConnection.fullName}
                className="w-full h-full object-cover transition-all duration-200"
                src={activeModalPhoto || selectedConnection.avatar}
              />
              <button
                onClick={() => {
                  setSelectedConnection(null);
                  setActiveModalPhoto(null);
                }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-black/60"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#261626] to-transparent text-white">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-['Sora',sans-serif] text-xl font-bold">
                    {selectedConnection.fullName}, {selectedConnection.age}
                  </h3>
                  <span
                    className="material-symbols-outlined text-[20px] text-[#0095F6] drop-shadow-sm select-none"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    title="Verified Developer"
                  >
                    verified
                  </span>
                </div>
                <p className="text-xs text-white/80">{selectedConnection.about}</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {/* Gallery Thumbnails */}
              {selectedConnection.gallery?.length > 1 && (
                <div>
                  <h4 className="text-xs font-bold text-[#8d6f78] uppercase tracking-wider mb-1.5">
                    Photos ({selectedConnection.gallery.length})
                  </h4>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {selectedConnection.gallery.map((photo, i) => {
                      const isCurrent =
                        (activeModalPhoto || selectedConnection.avatar) === photo;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveModalPhoto(photo)}
                          className={`w-14 h-18 rounded-xl overflow-hidden shrink-0 ring-2 transition-all cursor-pointer ${
                            isCurrent
                              ? "ring-[#b40066] scale-102"
                              : "ring-transparent opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={photo}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold text-[#8d6f78] uppercase tracking-wider mb-1">
                  Bio
                </h4>
                <p className="text-sm text-[#261626] leading-relaxed">
                  {selectedConnection.bio}
                </p>
              </div>

              {selectedConnection.skills?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#8d6f78] uppercase tracking-wider mb-1.5">
                    Skills & Tech
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedConnection.skills.map((s, idx) => (
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

              <button
                onClick={() => {
                  const target = selectedConnection;
                  setSelectedConnection(null);
                  setActiveChatConn(target);
                }}
                className="w-full py-3 rounded-full bg-[#b40066] text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Send Message</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
