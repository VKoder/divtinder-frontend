import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";

const PRESET_SKILLS = [
  { emoji: "⚛️", name: "React" },
  { emoji: "🟢", name: "Node.js" },
  { emoji: "🔷", name: "TypeScript" },
  { emoji: "🦀", name: "Rust" },
  { emoji: "🐍", name: "Python" },
  { emoji: "🐳", name: "Docker" },
  { emoji: "🐘", name: "PostgreSQL" },
  { emoji: "🎨", name: "TailwindCSS" },
  { emoji: "🚀", name: "Next.js" },
  { emoji: "☁️", name: "AWS" },
];

const PRESET_GALLERY_SAMPLES = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const fileInputRef = useRef(null);

  // Parse existing gallery images from user or fallback to avatar
  const parseInitialGallery = () => {
    if (Array.isArray(user?.gallery) && user.gallery.length > 0) {
      return user.gallery
        .map((item) => {
          if (!item) return null;
          if (typeof item === "string") return { img: item };
          const imgUrl = item.img || item.url || item.image || item.imgUrl || "";
          return { ...item, img: imgUrl };
        })
        .filter((item) => item && item.img)
        .slice(0, 6);
    }
    if (user?.avatar && !user.avatar.includes("via.placeholder.com")) {
      return [{ img: user.avatar }];
    }
    return [];
  };

  const [gallery, setGallery] = useState(parseInitialGallery);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [age, setAge] = useState(user?.age || 25);
  const [gender, setGender] = useState(user?.gender?.toLowerCase() || "male");
  const [avatar, setAvatar] = useState(
    gallery[0]?.img || user?.avatar || ""
  );
  const [about, setAbout] = useState(user?.about || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [skills, setSkills] = useState(
    Array.isArray(user?.skills) && user.skills.length > 0
      ? user.skills
      : ["React", "Node.js"]
  );
  const [customSkill, setCustomSkill] = useState("");

  // Photo modal state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "replace"
  const [targetSlotIndex, setTargetSlotIndex] = useState(0);
  const [photoInputUrl, setPhotoInputUrl] = useState("");
  const [photoModalTab, setPhotoModalTab] = useState("upload"); // "upload" | "url" | "presets"

  const toggleSkill = (skillName) => {
    if (skills.includes(skillName)) {
      setSkills(skills.filter((s) => s !== skillName));
    } else {
      setSkills([...skills, skillName]);
    }
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills([...skills, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  // Gallery Actions
  const handleOpenAddModal = (index) => {
    setModalMode("add");
    setTargetSlotIndex(index);
    setPhotoInputUrl("");
    setPhotoModalTab("upload");
    setIsPhotoModalOpen(true);
  };

  const handleOpenReplaceModal = (index, e) => {
    e?.stopPropagation();
    setModalMode("replace");
    setTargetSlotIndex(index);
    setPhotoInputUrl(gallery[index]?.img || "");
    setPhotoModalTab("url");
    setIsPhotoModalOpen(true);
  };

  const handleDeletePhoto = (index, e) => {
    e?.stopPropagation();
    const updated = gallery.filter((_, idx) => idx !== index);
    setGallery(updated);
    if (index === 0) {
      const newMain = updated[0]?.img || "";
      setAvatar(newMain);
    }
    toast.success(`Photo ${index + 1} removed`);
  };

  const handleMakeMain = (index, e) => {
    e?.stopPropagation();
    if (index === 0) return;
    const targetItem = gallery[index];
    const rest = gallery.filter((_, idx) => idx !== index);
    const updated = [targetItem, ...rest];
    setGallery(updated);
    setAvatar(targetItem.img);
    toast.success("Set as main profile photo!");
  };

  const handleConfirmPhoto = (imgUrl) => {
    const finalUrl = (imgUrl || photoInputUrl).trim();
    if (!finalUrl) {
      toast.error("Please provide or select an image");
      return;
    }

    if (modalMode === "replace") {
      const updated = [...gallery];
      updated[targetSlotIndex] = {
        ...(updated[targetSlotIndex] || {}),
        img: finalUrl,
      };
      setGallery(updated);
      if (targetSlotIndex === 0) {
        setAvatar(finalUrl);
      }
      toast.success(`Photo ${targetSlotIndex + 1} updated!`);
    } else {
      if (gallery.length >= 6) {
        toast.error("You can add up to 6 photos maximum");
        return;
      }
      const updated = [...gallery, { img: finalUrl }];
      setGallery(updated);
      if (updated.length === 1) {
        setAvatar(finalUrl);
      }
      toast.success("Photo added to gallery!");
    }

    setIsPhotoModalOpen(false);
    setPhotoInputUrl("");
  };

  // Handle local file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (base64) {
        handleConfirmPhoto(base64);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be selected again
    e.target.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Clean gallery to array of objects with img
    const cleanedGallery = gallery
      .filter((item) => item && item.img)
      .slice(0, 6)
      .map((item) => ({
        ...item,
        img: item.img,
      }));

    const finalAvatar = cleanedGallery[0]?.img || avatar;

    updateProfile({
      firstName,
      lastName,
      age: Number(age),
      gender,
      avatar: finalAvatar,
      about,
      bio,
      skills,
      gallery: cleanedGallery,
    });
  };

  // Calculate 6 slots: existing photos + empty slots
  const totalSlots = 6;
  const slots = Array.from({ length: totalSlots }, (_, idx) => gallery[idx] || null);

  return (
    <div className="bg-[#fff7fa] font-['Plus_Jakarta_Sans',sans-serif] text-[#261626] antialiased min-h-screen flex flex-col select-none">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-[#fff7fa]/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
          <button
            aria-label="Go back"
            className="min-w-[44px] min-h-[44px] -ml-1 flex items-center justify-center rounded-full text-[#261626] hover:bg-[#ffe7fa] active:scale-95 transition-all cursor-pointer"
            onClick={() => navigate(-1)}
            type="button"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <div className="flex-1 flex flex-col items-center justify-center text-center px-1">
            <span className="text-base font-bold text-[#261626] truncate">
              Edit Profile
            </span>
          </div>
          <div className="min-w-[44px] min-h-[44px] flex items-center justify-end">
            <div className="w-8 h-8 rounded-full bg-[#b40066] flex items-center justify-center overflow-hidden ring-2 ring-[#dc1a80]/20">
              {gallery[0]?.img || avatar ? (
                <img
                  src={gallery[0]?.img || avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-white text-[18px]">
                  person
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="flex flex-col relative w-full pt-16 bg-[#fff7fa] flex-1">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-full px-4 pb-safe max-w-lg mx-auto"
        >
          {/* Header Section */}
          <div className="pt-4 pb-3 flex flex-col gap-1">
            <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-[#fce0f7] text-[#b40066]">
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                badge
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide">
                Tell us who you are
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#261626] tracking-tight mt-1">
              Edit your profile
            </h1>
            <p className="text-xs sm:text-sm text-[#594048]">
              Manage your photos, bio, and skills visible on devBumble.
            </p>
          </div>

          {/* GALLERY SECTION (Up to 6 photos) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white shadow-[0_4px_20px_rgba(180,0,102,0.06)] border border-[#e1bdc7]/40 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#b40066] text-[20px]">
                  photo_library
                </span>
                <h3 className="font-['Sora',sans-serif] text-sm sm:text-base font-bold text-[#261626]">
                  Profile Photos
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#ffeffa] text-[#b40066]">
                {gallery.length}/6 added
              </span>
            </div>
            <p className="text-[11px] text-[#594048] mb-3 leading-relaxed">
              Add up to 6 photos. The first photo will be your main profile photo. Tap to replace or remove.
            </p>

            {/* 6-Photo Grid (3x2) */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {slots.map((item, index) => {
                const isMain = index === 0 && item;
                const isFilled = Boolean(item?.img);

                return (
                  <div
                    key={index}
                    className="aspect-[3/4] relative rounded-2xl overflow-hidden group shadow-xs transition-all"
                  >
                    {isFilled ? (
                      /* Filled Photo Slot */
                      <div className="w-full h-full relative bg-[#ffe7fa]">
                        <img
                          src={item.img}
                          alt={`Gallery photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Gradient Scrim for action buttons */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-80 group-hover:opacity-100 transition-opacity" />

                        {/* Top Badge: Main or Slot Number */}
                        <div className="absolute top-2 left-2 z-10">
                          {isMain ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#b40066] text-white text-[9px] font-extrabold uppercase shadow-sm tracking-wider">
                              <span
                                className="material-symbols-outlined text-[11px]"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                star
                              </span>
                              Main
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-black/50 backdrop-blur-xs text-white text-[10px] font-bold flex items-center justify-center">
                              {index + 1}
                            </span>
                          )}
                        </div>

                        {/* Top Right: Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => handleDeletePhoto(index, e)}
                          title="Delete photo"
                          className="absolute top-1.5 right-1.5 z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/60 hover:bg-[#ba1a1a] text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-90"
                        >
                          <span className="material-symbols-outlined text-[15px] sm:text-[18px]">
                            close
                          </span>
                        </button>

                        {/* Bottom Actions */}
                        <div className="absolute bottom-1.5 inset-x-1.5 z-10 flex items-center justify-between gap-1">
                          {/* Make Main Button (if not already main) */}
                          {!isMain && (
                            <button
                              type="button"
                              onClick={(e) => handleMakeMain(index, e)}
                              title="Make main photo"
                              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/60 hover:bg-amber-500 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-90"
                            >
                              <span
                                className="material-symbols-outlined text-[14px] sm:text-[16px]"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                star
                              </span>
                            </button>
                          )}

                          {/* Replace Button */}
                          <button
                            type="button"
                            onClick={(e) => handleOpenReplaceModal(index, e)}
                            title="Replace photo"
                            className="ml-auto w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/60 hover:bg-[#b40066] text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-90"
                          >
                            <span className="material-symbols-outlined text-[14px] sm:text-[16px]">
                              sync
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Empty Slot */
                      <button
                        type="button"
                        onClick={() => handleOpenAddModal(index)}
                        className="w-full h-full border-2 border-dashed border-[#e1bdc7] hover:border-[#b40066] bg-[#fff7fa]/60 hover:bg-[#ffe7fa]/40 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group active:scale-95"
                      >
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white shadow-xs flex items-center justify-center text-[#b40066] group-hover:bg-[#b40066] group-hover:text-white transition-all">
                          <span className="material-symbols-outlined text-[20px] sm:text-[22px]">
                            add
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-[#8d6f78] group-hover:text-[#b40066]">
                          {index === 0 ? "Add Main" : `Slot ${index + 1}`}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick helper badge */}
            <div className="mt-3 pt-2.5 border-t border-[#e1bdc7]/30 flex items-center justify-between text-[11px] text-[#594048]">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#b40066]">
                  tips_and_updates
                </span>
                <span>Tip: Tap the star icon to set any photo as main</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="text-[#b40066] font-bold hover:underline cursor-pointer"
              >
                Upload File
              </button>
            </div>
          </div>

          {/* Hidden File Input for Device Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Form Fields Container */}
          <div className="flex flex-col gap-5 mb-8">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* First Name */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-bold text-[#261626] flex items-center justify-between"
                  htmlFor="first-name-input"
                >
                  <span>First name</span>
                  <span className="text-[10px] text-[#b40066] uppercase font-bold">
                    Required
                  </span>
                </label>
                <div className="relative flex items-center">
                  <input
                    className="w-full h-13 px-4 rounded-2xl bg-white text-[#261626] text-sm shadow-[0_4px_16px_rgba(180,0,102,0.06)] focus:outline-none focus:bg-[#ffeffa] transition-all"
                    id="first-name-input"
                    placeholder="e.g. Alex"
                    required
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  {firstName && (
                    <div className="absolute right-3.5 w-6 h-6 rounded-full bg-[#ffe7fa] flex items-center justify-center text-[#b40066]">
                      <span
                        className="material-symbols-outlined text-[16px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Last Name */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-bold text-[#261626]"
                  htmlFor="last-name-input"
                >
                  Last name
                </label>
                <input
                  className="w-full h-13 px-4 rounded-2xl bg-white text-[#261626] text-sm shadow-[0_4px_16px_rgba(180,0,102,0.06)] focus:outline-none focus:bg-[#ffeffa] transition-all"
                  id="last-name-input"
                  placeholder="e.g. Sharma"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            {/* Age Input Section */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#261626]" htmlFor="age-input">
                  Age
                </label>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#b5005e] bg-[#ffe7fa] px-2 py-0.5 rounded-full">
                  <span
                    className="material-symbols-outlined text-[14px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified_user
                  </span>
                  18+ Required
                </span>
              </div>
              <input
                className="w-full h-13 px-4 rounded-2xl bg-white text-[#261626] text-sm shadow-[0_4px_16px_rgba(180,0,102,0.06)] focus:outline-none focus:bg-[#ffeffa] transition-all"
                id="age-input"
                max="100"
                min="18"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
              <div className="p-3 rounded-2xl bg-[#ffeffa] flex items-center gap-3 mt-1">
                <div className="w-8 h-8 rounded-full bg-[#dc1a80] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">cake</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#261626] font-semibold">
                    You'll show as{" "}
                    <span className="text-[#b40066] font-bold">{age || 18} years old</span>
                  </p>
                  <p className="text-[11px] text-[#594048] truncate">
                    Visible to developers matching with you
                  </p>
                </div>
                <span
                  className="material-symbols-outlined text-[#b5005e] text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
            </div>

            {/* Gender Selection Chips */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#261626]">
                Gender identity
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { id: "male", label: "Man" },
                  { id: "female", label: "Woman" },
                  { id: "others", label: "Non-binary / Other" },
                ].map((g) => {
                  const isActive = gender === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGender(g.id)}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                        isActive
                          ? "bg-gradient-to-r from-[#b40066] to-[#dc1a80] text-white shadow-[0_8px_20px_rgba(180,0,102,0.24)]"
                          : "bg-white text-[#261626] shadow-[0_4px_12px_rgba(41,17,38,0.04)] hover:bg-[#ffe7fa]"
                      }`}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direct Avatar Photo URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#261626]" htmlFor="avatar-input">
                Main Avatar Photo URL
              </label>
              <div className="flex items-center gap-3">
                <div className="w-13 h-13 rounded-2xl overflow-hidden ring-2 ring-[#dc1a80]/30 shrink-0 bg-[#ffe7fa] flex items-center justify-center shadow-sm">
                  {gallery[0]?.img || avatar ? (
                    <img
                      src={gallery[0]?.img || avatar}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[#b40066] text-[24px]">
                      image
                    </span>
                  )}
                </div>
                <input
                  className="w-full h-13 px-4 rounded-2xl bg-white text-[#261626] text-xs shadow-[0_4px_16px_rgba(180,0,102,0.06)] focus:outline-none focus:bg-[#ffeffa] transition-all"
                  id="avatar-input"
                  placeholder="https://images.unsplash.com/photo-..."
                  type="url"
                  value={gallery[0]?.img || avatar}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAvatar(val);
                    if (gallery.length > 0) {
                      const updated = [...gallery];
                      updated[0] = { ...(updated[0] || {}), img: val };
                      setGallery(updated);
                    } else if (val) {
                      setGallery([{ img: val }]);
                    }
                  }}
                />
              </div>
            </div>

            {/* About / Headline */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#261626]" htmlFor="about-input">
                About (Short Headline)
              </label>
              <input
                className="w-full h-13 px-4 rounded-2xl bg-white text-[#261626] text-sm shadow-[0_4px_16px_rgba(180,0,102,0.06)] focus:outline-none focus:bg-[#ffeffa] transition-all"
                id="about-input"
                placeholder="e.g. Full-Stack Developer & open-source enthusiast"
                type="text"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
              />
            </div>

            {/* Bio Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#261626]" htmlFor="bio-input">
                Bio
              </label>
              <textarea
                className="w-full p-4 rounded-2xl bg-white text-[#261626] text-xs sm:text-sm shadow-[0_4px_16px_rgba(180,0,102,0.06)] focus:outline-none focus:bg-[#ffeffa] transition-all resize-none leading-relaxed"
                id="bio-input"
                placeholder="Write a few lines about what you're building, your favorite tech stack, and what you're looking for..."
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            {/* Skills & Tech Stack Chips */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#261626]">
                  Pick your tech stack & skills
                </label>
                <span className="text-[11px] text-[#b40066] font-bold">
                  {skills.length} selected
                </span>
              </div>
              <p className="text-[11px] text-[#594048]">
                Developers with matching stacks connect up to 3x faster.
              </p>

              {/* Skills preset pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {PRESET_SKILLS.map((item) => {
                  const isSelected = skills.includes(item.name);
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => toggleSkill(item.name)}
                      className={`px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                        isSelected
                          ? "bg-[#b5005e] text-white shadow-[0_4px_14px_rgba(181,0,94,0.22)]"
                          : "bg-white text-[#261626] shadow-[0_2px_8px_rgba(41,17,38,0.04)] hover:bg-[#ffeffa]"
                      }`}
                    >
                      <span>{item.emoji}</span>
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Add custom skill input */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  className="flex-1 h-11 px-3.5 rounded-full bg-white text-[#261626] text-xs shadow-sm focus:outline-none focus:bg-[#ffeffa] transition-all"
                  placeholder="Add another skill (e.g. GraphQL)..."
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddCustomSkill(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="px-4 h-11 rounded-full bg-[#fce0f7] text-[#b40066] font-bold text-xs hover:bg-[#ffd9e3] transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Privacy Respect Card */}
            <div className="w-full p-4 rounded-3xl bg-[#ffeffa] shadow-[0_6px_20px_rgba(180,0,102,0.05)] flex items-start gap-3.5 border border-[#e1bdc7]/30">
              <div className="w-10 h-10 rounded-2xl bg-[#f6daf1] text-[#b40066] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">lock</span>
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-bold text-[#261626]">
                  Your privacy is respected
                </h2>
                <p className="text-[11px] text-[#594048] mt-0.5 leading-relaxed">
                  We will never share your private contact info, sell data, or post without your consent.
                </p>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Action Footer */}
          <div className="sticky bottom-0 left-0 right-0 pt-3 pb-24 bg-[#fff7fa]/90 backdrop-blur-md">
            <div className="flex flex-col items-center gap-2.5 max-w-lg mx-auto">
              <button
                disabled={isPending}
                className="w-full h-14 rounded-full bg-gradient-to-r from-[#b40066] via-[#dc1a80] to-[#b5005e] text-white font-bold text-base flex items-center justify-center gap-2 shadow-[0_10px_24px_-4px_rgba(255,61,154,0.36),0_4px_8px_-2px_rgba(41,17,38,0.08)] active:scale-[0.98] transition-transform cursor-pointer disabled:opacity-60"
                type="submit"
              >
                <span>{isPending ? "Saving changes..." : "Save Profile"}</span>
                <span className="material-symbols-outlined text-[22px]">
                  arrow_forward
                </span>
              </button>
              <div className="flex items-center gap-1.5 text-[#594048]">
                <span className="material-symbols-outlined text-[16px] text-[#8d6f78]">
                  verified
                </span>
                <span className="text-[11px]">
                  Profile updates are immediately visible to matches
                </span>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Interactive Photo Add / Replace Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-[28px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-[#fff7fa] border-b border-[#e1bdc7]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#b40066] text-[22px]">
                  {modalMode === "replace" ? "sync" : "add_photo_alternate"}
                </span>
                <h3 className="font-['Sora',sans-serif] text-base font-bold text-[#261626]">
                  {modalMode === "replace"
                    ? `Replace Photo ${targetSlotIndex + 1}`
                    : `Add Photo to Slot ${targetSlotIndex + 1}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#ffe7fa] flex items-center justify-center text-[#8d6f78] hover:text-[#261626] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-[#e1bdc7]/30 px-4 pt-2 bg-[#fff7fa]">
              <button
                type="button"
                onClick={() => setPhotoModalTab("upload")}
                className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                  photoModalTab === "upload"
                    ? "border-[#b40066] text-[#b40066]"
                    : "border-transparent text-[#8d6f78] hover:text-[#261626]"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setPhotoModalTab("url")}
                className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                  photoModalTab === "url"
                    ? "border-[#b40066] text-[#b40066]"
                    : "border-transparent text-[#8d6f78] hover:text-[#261626]"
                }`}
              >
                Image URL
              </button>
              <button
                type="button"
                onClick={() => setPhotoModalTab("presets")}
                className={`flex-1 py-2 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                  photoModalTab === "presets"
                    ? "border-[#b40066] text-[#b40066]"
                    : "border-transparent text-[#8d6f78] hover:text-[#261626]"
                }`}
              >
                Quick Presets
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-5">
              {/* Tab 1: Upload File */}
              {photoModalTab === "upload" && (
                <div className="flex flex-col items-center justify-center">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-44 border-2 border-dashed border-[#e1bdc7] hover:border-[#b40066] rounded-2xl bg-[#fff7fa] flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors p-4 text-center group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#fce0f7] text-[#b40066] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[26px]">
                        cloud_upload
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#261626]">
                      Click to choose photo from device
                    </span>
                    <span className="text-[10px] text-[#8d6f78]">
                      Supports PNG, JPG, WEBP • Max 5MB
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 2: URL Input */}
              {photoModalTab === "url" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#261626]">
                      Paste Web Image URL
                    </label>
                    <input
                      value={photoInputUrl}
                      onChange={(e) => setPhotoInputUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full h-12 px-3.5 rounded-xl bg-[#ffeffa] text-xs text-[#261626] border border-[#e1bdc7]/50 focus:outline-none focus:ring-1 focus:ring-[#b40066]"
                    />
                  </div>

                  {/* Preview */}
                  {photoInputUrl && (
                    <div className="flex flex-col items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-bold text-[#8d6f78]">Preview:</span>
                      <div className="w-24 h-32 rounded-xl overflow-hidden ring-2 ring-[#b40066]/30 bg-[#ffe7fa]">
                        <img
                          src={photoInputUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/150?text=Invalid+Image";
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleConfirmPhoto(photoInputUrl)}
                    disabled={!photoInputUrl.trim()}
                    className="w-full py-3 rounded-full bg-[#b40066] text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-40"
                  >
                    Confirm Photo
                  </button>
                </div>
              )}

              {/* Tab 3: Presets */}
              {photoModalTab === "presets" && (
                <div className="space-y-3">
                  <p className="text-xs text-[#594048]">
                    Select any developer portrait to add immediately:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_GALLERY_SAMPLES.map((sampleUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleConfirmPhoto(sampleUrl)}
                        className="aspect-[3/4] rounded-xl overflow-hidden ring-2 ring-transparent hover:ring-[#b40066] transition-all cursor-pointer group active:scale-95 relative"
                      >
                        <img
                          src={sampleUrl}
                          alt={`Preset ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
