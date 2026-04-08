"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaUserEdit,
  FaEnvelope,
  FaArrowLeft,
  FaCheckCircle,
  FaCamera,
  FaAt,
  FaUser,
  FaLock,
  FaBell,
  FaBellSlash,
  FaTrophy,
  FaChevronDown,
  FaLink,
  FaShareAlt,
  FaGift,
  FaBirthdayCake,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import InfoTooltip from "@/components/InfoTooltip";
import {
  readPopupPreferenceState,
  setNewsletterPopupEnabled,
  setWelcomePopupEnabled,
} from "@/lib/popupPreferences";

/* ─── Accordion section component ─── */
const AccordionSection = ({
  id,
  icon: Icon,
  iconColor = "text-green-400",
  title,
  summary,
  isOpen,
  onToggle,
  children,
}) => (
  <div
    className="bg-gray-900 border border-gray-800 rounded-2xl mb-3 overflow-hidden"
    style={{ borderLeft: `3px solid ${isOpen ? "#22c55e" : "#374151"}` }}
  >
    {/* Header */}
    <motion.button
      type="button"
      onClick={() => onToggle(id)}
      className="w-full flex items-center gap-3 px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-2xl"
      whileHover={{ backgroundColor: "rgba(31,41,55,0.6)" }}
      transition={{ duration: 0.15 }}
    >
      <Icon className={`shrink-0 text-base ${iconColor}`} />
      <span className="flex-1 min-w-0">
        <span className="block text-white font-black text-xs uppercase tracking-widest">
          {title}
        </span>
        {!isOpen && summary && (
          <span className="block text-gray-500 text-xs mt-0.5 truncate">
            {summary}
          </span>
        )}
      </span>
      <motion.span
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="shrink-0 text-gray-500"
      >
        <FaChevronDown size={12} />
      </motion.span>
    </motion.button>

    {/* Body */}
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="body"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{ overflow: "hidden" }}
        >
          <div className="px-5 pb-5 pt-1 space-y-4">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/* ─── Input helper ─── */
const Field = ({ label, labelExtra, children, hint }) => (
  <div>
    <label className="text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide flex items-center gap-1.5 flex-wrap">
      {label}
      {labelExtra}
    </label>
    {children}
    {hint && <p className="text-gray-600 text-xs mt-1">{hint}</p>}
  </div>
);

const inputCls =
  "block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder-gray-500";

/* ─── Page ─── */
const ProfilePage = () => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [statusText, setStatusText] = useState("");
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [phone, setPhone] = useState("");
  const [communicationPreference, setCommunicationPreference] =
    useState("email");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthdayClaimedYear, setBirthdayClaimedYear] = useState(null);
  const [birthdayClaiming, setBirthdayClaiming] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [popupPreferences, setPopupPreferences] = useState({
    welcomeEnabled: true,
    newsletterEnabled: true,
  });

  // Which accordion sections are open — all start collapsed; user clicks to expand
  const [openSections, setOpenSections] = useState({
    profile: false,
    status: false,
    birthday: false,
    security: false,
    comms: false,
    benefits: false,
    refer: false,
  });

  const toggleSection = (id) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Dropdown state for avatar upload
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  // Close avatar menu on outside click (robust)
  useEffect(() => {
    if (!showAvatarMenu) return;
    const handleClick = (e) => {
      const menu = document.getElementById("avatar-upload-menu");
      if (menu && !menu.contains(e.target)) {
        setShowAvatarMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showAvatarMenu]);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setName(data.name || "");
        setEmail(data.email || "");
        setUsername(data.username || "");
        setPhone(data.phone || "");
        setStatusText(data.status || "Ready for 5s Arena");
        setCommunicationPreference(data.communicationPreference || "email");
        setNewsletterOptIn(data.newsletterOptIn || false);
        setBirthDate(
          data.birthDate
            ? new Date(data.birthDate).toISOString().split("T")[0]
            : "",
        );
        setBirthdayClaimedYear(data.birthdayClaimedYear || null);
        setAvatarUrl(data.image || "");
      }
    };
    if (status === "authenticated") loadProfile();
  }, [status]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setPopupPreferences(readPopupPreferenceState(window.localStorage));
  }, []);

  // Avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);

    setUploadLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/profile/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed.");
        setAvatarPreview("");
      } else {
        setAvatarUrl(data.imageUrl);
        // Update the NextAuth session so the new avatar appears immediately everywhere
        await update({ image: data.imageUrl });
        setSuccess("Profile picture updated!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploadLoading(false);
    }
  };

  // OAuth popup helpers for OneDrive/Google Drive
  const handleOneDriveUpload = async () => {
    setUploadLoading(true);
    setError("");
    try {
      // Construct OneDrive OAuth URL (placeholder client_id and redirect_uri)
      const clientId = "YOUR_ONEDRIVE_CLIENT_ID";
      const redirectUri = encodeURIComponent(window.location.origin + "/api/profile/onedrive-callback");
      const scope = encodeURIComponent("files.readwrite offline_access");
      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}`;
      window.open(authUrl, "onedrive-oauth", "width=500,height=700");
      setSuccess("OneDrive OAuth popup opened. Complete authentication to continue.");
    } catch {
      setError("Failed to open OneDrive OAuth popup.");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleGoogleDriveUpload = async () => {
    setUploadLoading(true);
    setError("");
    try {
      // Construct Google Drive OAuth URL (placeholder client_id and redirect_uri)
      const clientId = "YOUR_GOOGLE_CLIENT_ID";
      const redirectUri = encodeURIComponent(window.location.origin + "/api/profile/googledrive-callback");
      const scope = encodeURIComponent("https://www.googleapis.com/auth/drive.file");
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&access_type=offline&prompt=consent`;
      window.open(authUrl, "googledrive-oauth", "width=500,height=700");
      setSuccess("Google Drive OAuth popup opened. Complete authentication to continue.");
    } catch {
      setError("Failed to open Google Drive OAuth popup.");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword && newPassword !== confirmNew) {
      setError("New passwords do not match.");
      return;
    }

    if (username && !/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      setError(
        "Username: 3–30 chars, letters (upper or lower), numbers, underscores only.",
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username: username.trim(),
          status: statusText.trim(),
          phone: phone.trim() || null,
          communicationPreference,
          newsletterOptIn,
          birthDate: birthDate || null,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setSuccess(data.message);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNew("");
        await update({
          name,
          username: username.trim(),
          image: avatarUrl || undefined,
        });
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const syncPopupPreferences = () => {
    if (typeof window === "undefined") {
      return;
    }

    setPopupPreferences(readPopupPreferenceState(window.localStorage));
  };

  const updatePopupPreference = (type, enabled) => {
    if (typeof window === "undefined") {
      return;
    }

    if (type === "welcome") {
      setWelcomePopupEnabled(enabled, window.localStorage);
    } else {
      setNewsletterPopupEnabled(enabled, window.localStorage);
    }

    syncPopupPreferences();
    setSuccess(
      enabled
        ? "Popup prompts have been turned back on for this device."
        : "Popup prompt updated for this device.",
    );
    setTimeout(() => setSuccess(""), 3000);
  };

  const resetAllPopups = () => {
    if (typeof window === "undefined") {
      return;
    }

    setWelcomePopupEnabled(true, window.localStorage);
    setNewsletterPopupEnabled(true, window.localStorage);
    syncPopupPreferences();
    setSuccess("Welcome and newsletter pop-ups have been re-enabled on this device.");
    setTimeout(() => setSuccess(""), 3000);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-green-400 text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  const displayAvatar = avatarPreview || avatarUrl;

  return (
    <div className="min-h-screen bg-gray-950 py-16 px-4">
      <div className="max-w-lg mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-green-400 text-sm mb-8 transition-colors uppercase tracking-wide"
        >
          <FaArrowLeft size={12} /> Back to Home
        </Link>

        {/* Page header card — always visible */}
        <motion.div
          className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl mb-4"
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="bg-gray-800 px-8 py-6 border-b border-gray-700">
            <div className="flex items-center gap-5">
              {/* Avatar with dropdown upload source */}
              <div className="relative shrink-0 group" tabIndex={0} aria-haspopup="menu" aria-expanded={showAvatarMenu}>
                <motion.div
                  className="cursor-pointer"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setShowAvatarMenu((v) => !v)}
                  title="Change profile photo"
                >
                  {displayAvatar ? (
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                      <Image
                        src={displayAvatar}
                        alt="Profile"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-green-700 flex items-center justify-center text-white text-3xl font-black border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                      {name?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {uploadLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaCamera className="text-white text-xl" />
                    )}
                  </div>
                </motion.div>
                {/* Dropdown menu for upload source (with AnimatePresence and id for outside click) */}
                <AnimatePresence>
                  {showAvatarMenu && (
                    <motion.div
                      id="avatar-upload-menu"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 bg-gray-900 border border-green-500/30 rounded-xl shadow-2xl z-50"
                    >
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-gray-800 transition-all rounded-t-xl"
                        onClick={() => {
                          setShowAvatarMenu(false);
                          fileInputRef.current?.click();
                        }}
                      >
                        <FaCamera className="text-green-400" /> Upload from Device
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-gray-800 transition-all"
                        onClick={async () => {
                          setShowAvatarMenu(false);
                          await handleOneDriveUpload();
                        }}
                      >
                        <FaLink className="text-blue-400" /> Upload from OneDrive
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-gray-800 transition-all rounded-b-xl"
                        onClick={async () => {
                          setShowAvatarMenu(false);
                          await handleGoogleDriveUpload();
                        }}
                      >
                        <FaLink className="text-yellow-400" /> Upload from Google Drive
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <div className="flex-1 min-w-0">
                <h1
                  className="text-white font-black text-xl uppercase tracking-wide"
                  style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
                >
                  Edit Profile
                </h1>
                <p className="text-gray-400 text-sm mt-0.5 truncate">{email}</p>
                {username && (
                  <p className="text-green-400 text-xs mt-0.5 font-mono">
                    @{username}
                  </p>
                )}
              </div>
              <FaUserEdit className="shrink-0 text-green-400" size={22} />
            </div>
            <p className="text-gray-500 text-xs mt-3">
              Click your photo to upload a new one (max 3 MB)
            </p>
          </div>
        </motion.div>

        {/* Alerts — outside accordions */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 p-4 bg-red-900/30 border border-red-500/40 rounded-xl text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 p-4 bg-green-900/30 border border-green-500/40 rounded-xl text-green-400 text-sm"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <AccordionSection
            id="profile"
            icon={FaUserEdit}
            iconColor="text-green-400"
            title="Profile Info"
            summary={
              name || username
                ? `${name}${username ? "  @" + username : ""}`
                : "Update your details"
            }
            isOpen={openSections.profile}
            onToggle={toggleSection}
          >
              {/* Full Name */}
              <Field label="Full Name">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={inputCls}
                  placeholder="Your full name"
                />
              </Field>

              {/* Username */}
              <Field
                label={
                  <>
                    <FaAt size={11} /> Username
                  </>
                }
                labelExtra={
                  <>
                    <span className="text-gray-600 font-normal normal-case tracking-normal text-xs ml-1">
                      (your public handle)
                    </span>
                    <InfoTooltip
                      text="Your unique @handle shown on bookings and your profile. 3–30 characters. Letters, numbers and underscores only."
                      position="right"
                    />
                  </>
                }
                hint="3–30 characters. Letters, numbers and underscores only."
              >
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 text-sm font-bold pointer-events-none">
                    @
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))
                    }
                    className={`${inputCls} pl-9 font-mono`}
                    placeholder="YourHandle"
                    minLength={3}
                    maxLength={30}
                  />
                </div>
              </Field>

              {/* Email (read-only) */}
              <Field
                label={
                  <>
                    <FaEnvelope size={12} /> Email Address
                  </>
                }
                labelExtra={
                  <span className="text-gray-600 font-normal normal-case tracking-normal text-xs ml-1">
                    (cannot be changed)
                  </span>
                }
              >
                <input
                  type="email"
                  value={email}
                  disabled
                  className="block w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-500 text-sm cursor-not-allowed"
                />
              </Field>

              {/* Birth Date */}
              <Field
                label={
                  <>
                    <FaBirthdayCake size={11} /> Birth Date
                  </>
                }
                labelExtra={
                  <InfoTooltip
                    text="Get a free 1-hour court booking every year on your birthday! You can claim it within 7 days of the date."
                    position="right"
                  />
                }
                hint="We'll celebrate your birthday with a free booking!"
              >
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className={inputCls}
                  max={
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() - 5),
                    )
                      .toISOString()
                      .split("T")[0]
                  }
                />
              </Field>
            </AccordionSection>
          </motion.div>

          {/* 1b. Birthday */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <AccordionSection
              id="birthday"
              icon={FaBirthdayCake}
              iconColor="text-pink-400"
              title="Birthday"
              summary={
                birthDate
                  ? new Date(birthDate + "T00:00:00").toLocaleDateString(
                      "en-ZA",
                      { day: "numeric", month: "long" },
                    )
                  : "Add your birthday for a free booking!"
              }
              isOpen={openSections.birthday}
              onToggle={toggleSection}
            >
              {/* Birthday celebration & claim */}
              {birthDate &&
                (() => {
                  const bd = new Date(birthDate + "T00:00:00");
                  const now = new Date();
                  const birthdayThisYear = new Date(
                    now.getFullYear(),
                    bd.getMonth(),
                    bd.getDate(),
                  );
                  const diffDays = Math.round(
                    (now - birthdayThisYear) / (1000 * 60 * 60 * 24),
                  );
                  const isBirthdayWindow = diffDays >= -7 && diffDays <= 7;
                  const alreadyClaimed =
                    birthdayClaimedYear === now.getFullYear();
                  const daysUntil =
                    diffDays < -7
                      ? Math.abs(diffDays)
                      : diffDays > 7
                        ? 365 - diffDays
                        : 0;

                  return (
                    <div className="space-y-3">
                      {isBirthdayWindow && !alreadyClaimed && (
                        <motion.div
                          className="bg-linear-to-r from-pink-900/30 to-purple-900/30 border border-pink-500/40 rounded-xl p-5 text-center"
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <motion.div
                            className="text-4xl mb-3"
                            animate={{
                              scale: [1, 1.2, 1],
                              rotate: [0, 10, -10, 0],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            🎂
                          </motion.div>
                          <h4
                            className="text-white font-black text-lg uppercase tracking-wide mb-1"
                            style={{
                              fontFamily: "Impact, Arial Black, sans-serif",
                            }}
                          >
                            Happy Birthday!
                          </h4>
                          <p className="text-pink-300 text-sm mb-4">
                            Claim your FREE 1-hour court booking + 500 bonus
                            points!
                          </p>
                          <motion.button
                            type="button"
                            onClick={async () => {
                              setBirthdayClaiming(true);
                              setError("");
                              try {
                                const res = await fetch(
                                  "/api/profile/birthday-claim",
                                  { method: "POST" },
                                );
                                const data = await res.json();
                                if (!res.ok) {
                                  setError(data.error);
                                } else {
                                  setSuccess(data.message);
                                  setBirthdayClaimedYear(now.getFullYear());
                                }
                              } catch {
                                setError("Failed to claim birthday reward.");
                              } finally {
                                setBirthdayClaiming(false);
                              }
                            }}
                            disabled={birthdayClaiming}
                            className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-black rounded-xl uppercase tracking-wider transition-colors disabled:opacity-50"
                            whileHover={{
                              scale: 1.05,
                              boxShadow: "0 0 30px rgba(236,72,153,0.5)",
                            }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {birthdayClaiming
                              ? "Claiming..."
                              : "🎁 Claim Birthday Reward"}
                          </motion.button>
                        </motion.div>
                      )}

                      {alreadyClaimed && (
                        <div className="bg-green-900/20 border border-green-700/40 rounded-xl p-4 text-center">
                          <p className="text-green-400 text-sm font-bold flex items-center justify-center gap-2">
                            <FaCheckCircle /> Birthday reward claimed for{" "}
                            {now.getFullYear()}!
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            Use code{" "}
                            <span className="text-green-300 font-mono font-bold">
                              BDAY{now.getFullYear()}
                            </span>{" "}
                            when booking
                          </p>
                        </div>
                      )}

                      {!isBirthdayWindow && !alreadyClaimed && (
                        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
                          <p className="text-gray-400 text-sm">
                            🎂 Your birthday reward will be available{" "}
                            {daysUntil} days before your birthday
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            Free 1-hour booking + 500 bonus points
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
            </AccordionSection>
          </motion.div>

          {/* 1c. Online Status Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <AccordionSection
              id="status"
              icon={FaUser}
              iconColor="text-blue-400"
              title="Player Status"
              summary={statusText || "Set your availability"}
              isOpen={openSections.status}
              onToggle={toggleSection}
            >
              <div>
                <Field
                  label="Current Status"
                  hint="Max 100 characters. Visible to teammates."
                >
                  <div className="relative">
                    <input
                      type="text"
                      value={statusText}
                      onChange={(e) => setStatusText(e.target.value)}
                      className={inputCls}
                      placeholder="e.g. Ready for the World Cup!"
                      maxLength={100}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 font-mono">
                      {statusText.length}/100
                    </div>
                  </div>
                </Field>

                <div className="mt-4">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                    Quick Presets
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Ready for Match ⚽",
                      "Looking for Team 👥",
                      "Injured 🤕",
                      "On Fire! 🔥",
                      "Training 🏃‍♂️",
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setStatusText(preset)}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs text-gray-300 transition-all"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionSection>
          </motion.div>

          {/* 2. Security */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <AccordionSection
              id="security"
              icon={FaLock}
              iconColor="text-yellow-400"
              title="Security"
              summary="Password protected"
              isOpen={openSections.security}
              onToggle={toggleSection}
            >
              <Field label="Current Password">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputCls}
                  placeholder="Leave blank to keep current password"
                />
              </Field>

              <Field label="New Password">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputCls}
                  placeholder="Min. 6 characters"
                />
              </Field>

              <Field label="Confirm New Password">
                <input
                  type="password"
                  value={confirmNew}
                  onChange={(e) => setConfirmNew(e.target.value)}
                  className={inputCls}
                  placeholder="Repeat new password"
                />
              </Field>
            </AccordionSection>
          </motion.div>

          {/* 3. Communications */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <AccordionSection
              id="comms"
              icon={newsletterOptIn ? FaBell : FaBellSlash}
              iconColor={newsletterOptIn ? "text-green-400" : "text-gray-500"}
              title="Communications"
              summary={
                newsletterOptIn ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-900/50 text-green-400 rounded-full text-[10px] font-semibold uppercase tracking-wide">
                    Subscribed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-800 text-gray-500 rounded-full text-[10px] font-semibold uppercase tracking-wide">
                    Not subscribed
                  </span>
                )
              }
              isOpen={openSections.comms}
              onToggle={toggleSection}
            >
              {/* Phone number */}
              <Field
                label="Cellphone Number"
                hint="Required for WhatsApp or SMS communication"
              >
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+27 63 782 0245"
                  className={inputCls}
                />
              </Field>

              {/* Communication preference — mandatory pick one */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                  Preferred Communication
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <p className="text-gray-600 text-xs mb-3">
                  Choose how you want to receive booking confirmations and
                  reminders
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      key: "email",
                      label: "Email",
                      icon: <FaEnvelope size={14} />,
                      color: "green",
                    },
                    {
                      key: "whatsapp",
                      label: "WhatsApp",
                      icon: <FaLink size={14} />,
                      color: "green",
                    },
                    {
                      key: "sms",
                      label: "SMS",
                      icon: <FaBell size={14} />,
                      color: "green",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        if (
                          (opt.key === "whatsapp" || opt.key === "sms") &&
                          !phone
                        ) {
                          setError(
                            "Please add your phone number first to use WhatsApp or SMS.",
                          );
                          return;
                        }
                        setCommunicationPreference(opt.key);
                      }}
                      className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                        communicationPreference === opt.key
                          ? "bg-green-900/40 border-green-600 text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.2)]"
                          : "bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-300"
                      }`}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Newsletter toggle */}
              <div
                className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-xl px-5 py-4 cursor-pointer hover:border-green-700 transition-colors"
                onClick={() => setNewsletterOptIn((v) => !v)}
              >
                <div className="flex items-center gap-3">
                  {newsletterOptIn ? (
                    <FaBell className="text-green-400 text-lg shrink-0" />
                  ) : (
                    <FaBellSlash className="text-gray-500 text-lg shrink-0" />
                  )}
                  <div>
                    <p className="text-white text-sm font-semibold">
                      Newsletter &amp; Promotions
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {newsletterOptIn
                        ? "You'll receive offers, fixtures & arena news."
                        : "Subscribe to get deals, fixtures & arena news."}
                    </p>
                  </div>
                </div>
                {/* Toggle pill */}
                <div
                  className="relative shrink-0 w-12 h-6 rounded-full transition-colors duration-300"
                  style={{
                    background: newsletterOptIn ? "#16a34a" : "#374151",
                  }}
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300"
                    style={{ left: newsletterOptIn ? "26px" : "2px" }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-700 bg-gray-800/60 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-white text-sm font-semibold">
                      Site Pop-up Prompts
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Manage the welcome and newsletter prompts for this device. If you muted them earlier, you can turn them back on here.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetAllPopups}
                    className="rounded-full border border-green-700/50 bg-green-600/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-green-400 transition hover:bg-green-600/20"
                  >
                    Turn All Back On
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      key: "welcome",
                      title: "Welcome Popup",
                      description: popupPreferences.welcomeEnabled
                        ? "Ready to show again on your next visit."
                        : "Muted on this device until you re-enable it.",
                      enabled: popupPreferences.welcomeEnabled,
                    },
                    {
                      key: "newsletter",
                      title: "Newsletter Popup",
                      description: popupPreferences.newsletterEnabled
                        ? "The email prompt can appear again when eligible."
                        : "Muted on this device until you re-enable it.",
                      enabled: popupPreferences.newsletterEnabled,
                    },
                  ].map((popup) => (
                    <button
                      key={popup.key}
                      type="button"
                      onClick={() => updatePopupPreference(popup.key, !popup.enabled)}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        popup.enabled
                          ? "border-green-700/50 bg-green-900/20"
                          : "border-gray-700 bg-gray-900/70 hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {popup.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {popup.description}
                          </p>
                        </div>
                        <div
                          className="relative shrink-0 h-6 w-12 rounded-full transition-colors duration-300"
                          style={{
                            background: popup.enabled ? "#16a34a" : "#374151",
                          }}
                        >
                          <div
                            className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300"
                            style={{ left: popup.enabled ? "26px" : "2px" }}
                          />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </AccordionSection>
          </motion.div>

          {/* 4. Member Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <AccordionSection
              id="benefits"
              icon={FaTrophy}
              iconColor="text-yellow-400"
              title="Member Benefits"
              summary="Your stats & perks"
              isOpen={openSections.benefits}
              onToggle={toggleSection}
            >
              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Courts Booked",
                    icon: "⚽",
                    value: session?.user?.totalBookings ?? "—",
                    color: "text-green-400",
                    tip: "Total number of confirmed court bookings on your account.",
                  },
                  {
                    label: "Hours Played",
                    icon: "⏱",
                    value: session?.user?.totalHours
                      ? `${session.user.totalHours}h`
                      : "—",
                    color: "text-blue-400",
                    tip: "Total hours booked across all your sessions.",
                  },
                  {
                    label: "Loyalty Tier",
                    icon: "🏆",
                    value: session?.user?.loyaltyTier ?? "Bronze",
                    color: "text-yellow-400",
                    tip: "Bronze → Silver → Gold → Diamond. Visit the Rewards page to see how to level up!",
                  },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ y: -2, scale: 1.02 }}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-center"
                  >
                    <p className="text-xl mb-1">{stat.icon}</p>
                    <p className={`text-sm font-black ${stat.color}`}>
                      {stat.value}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5 flex items-center justify-center gap-1">
                      {stat.label}{" "}
                      <InfoTooltip
                        text={stat.tip}
                        position="bottom"
                        size={11}
                      />
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Member Perks card */}
              <div className="bg-linear-to-r from-green-900/30 to-gray-800/30 border border-green-800/40 rounded-xl p-4 text-sm">
                <p className="text-green-400 font-bold mb-1 flex items-center gap-2">
                  <span>⭐</span> Member Perks — Active
                  <InfoTooltip
                    text="These perks are active for all registered members. As you climb tiers, you'll unlock additional exclusive benefits on the Rewards page."
                    position="top"
                  />
                </p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>✓ Priority court reservations</li>
                  <li>✓ Booking reminders via email</li>
                  <li>✓ Exclusive member-only promotions</li>
                  <li>✓ 7-day advance booking window</li>
                </ul>
              </div>

              {/* View Full Rewards link */}
              <div className="flex justify-end">
                <Link
                  href="/rewards"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600/20 hover:bg-green-600/40 border border-green-700/50 text-green-400 text-xs font-bold uppercase tracking-wide rounded-full transition-colors"
                >
                  <FaLink size={10} /> View Full Rewards
                </Link>
              </div>
            </AccordionSection>
          </motion.div>

          {/* 5. Share & Refer */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <AccordionSection
              id="refer"
              icon={FaShareAlt}
              iconColor="text-purple-400"
              title="Share & Refer"
              summary="Earn bonus points by inviting friends"
              isOpen={openSections.refer}
              onToggle={toggleSection}
            >
              <div className="bg-linear-to-r from-purple-900/20 to-gray-800/30 border border-purple-800/40 rounded-xl p-4 text-sm">
                <p className="text-purple-400 font-bold mb-2 flex items-center gap-2">
                  <FaGift /> Invite Friends — Earn Rewards
                  <InfoTooltip
                    text="Share your referral link. When someone signs up and books, you earn points. The referral chain goes 5 levels deep — if your friend refers someone, you still earn!"
                    position="top"
                  />
                </p>
                <p className="text-gray-400 text-xs mb-3">
                  Every friend who joins and books earns you{" "}
                  <span className="text-purple-300 font-bold">200 points</span>.
                  The chain goes{" "}
                  <span className="text-purple-300 font-bold">
                    5 levels deep
                  </span>{" "}
                  — their referrals earn you points too!
                </p>
                <div className="grid grid-cols-5 gap-1 mb-3">
                  {[
                    { level: "L1", pts: "200", opacity: "opacity-100" },
                    { level: "L2", pts: "100", opacity: "opacity-85" },
                    { level: "L3", pts: "50", opacity: "opacity-70" },
                    { level: "L4", pts: "25", opacity: "opacity-55" },
                    { level: "L5", pts: "10", opacity: "opacity-40" },
                  ].map((l) => (
                    <div
                      key={l.level}
                      className={`text-center py-2 rounded-lg bg-purple-900/30 border border-purple-800/30 ${l.opacity}`}
                    >
                      <p className="text-purple-300 text-[10px] font-bold">
                        {l.level}
                      </p>
                      <p className="text-white text-xs font-black">+{l.pts}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/rewards"
                  className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-bold transition-colors"
                >
                  <FaShareAlt size={10} /> View Referrals & Share Link →
                </Link>
              </div>
            </AccordionSection>
          </motion.div>

          {/* Submit — outside accordions, full width */}
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 0 35px rgba(34,197,94,0.5)",
            }}
            whileTap={{ scale: 0.97 }}
            className="w-full mt-2 py-3.5 px-4 rounded-xl text-sm font-black text-white bg-green-600 hover:bg-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
          >
            {loading ? "Saving..." : "Save Changes"}
          </motion.button>

        <p className="text-center text-gray-600 text-xs mt-6">
          Need help?{" "}
          <a
            href="https://wa.me/27637820245"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-400"
          >
            WhatsApp us
          </a>
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
