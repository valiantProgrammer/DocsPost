"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/app/providers/ThemeProvider";
import {
  FiSliders,
  FiMoon,
  FiSun,
  FiBell,
  FiShield,
  FiLink,
  FiUser,
  FiTerminal,
  FiCode,
  FiGlobe,
  FiMapPin,
  FiMail,
  FiFileText,
  FiUsers,
  FiCamera,
  FiCheck,
  FiRefreshCw,
  FiLock,
  FiExternalLink,
  FiKey,
  FiTrash2,
  FiDownload,
  FiAlertTriangle,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiSmartphone,
  FiMonitor,
  FiCpu,
  FiDatabase,
  FiLayers,
  FiZap,
  FiCheckCircle,
  FiXCircle,
  FiHelpCircle,
  FiVolume2,
  FiArrowRight,
  FiShare2
} from "react-icons/fi";
import "./DashboardSettings.css";

export default function DashboardSettings({ userEmail = "", userName = "", userData = null }) {
  const { isDark, toggleTheme } = useTheme();

  // Active sub-nav tab (General, Appearance, Notifications, Privacy, Connected, Account, Advanced)
  const [activeSubtab, setActiveSubtab] = useState("general");

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
    }, 3200);
  };

  // Appearance states
  const [selectedTheme, setSelectedTheme] = useState(isDark ? "dark" : "light");
  const [useSystemTheme, setUseSystemTheme] = useState(false);
  const [accentColor, setAccentColor] = useState("#2563eb");
  const [interfaceDensity, setInterfaceDensity] = useState("Standard");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [syntaxTheme, setSyntaxTheme] = useState("One Dark Pro");
  const [reduceMotion, setReduceMotion] = useState(false);

  // Profile Information
  const [name, setName] = useState(userName || "Rupayan Dey");
  const [username, setUsername] = useState("rupayanDey");
  const [bio, setBio] = useState(
    "Passionate about building cleaner and smarter documentation. Sharing knowledge with the developer community."
  );
  const [location, setLocation] = useState("Kolkata, India");
  const [website, setWebsite] = useState("https://docspost.dev");
  const [profilePicture, setProfilePicture] = useState(userData?.profilePicture || null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Editor Preferences
  const [editorMode, setEditorMode] = useState("Rich Text (TipTap)");
  const [autoSave, setAutoSave] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [spellCheck, setSpellCheck] = useState(true);

  // Language & Region
  const [language, setLanguage] = useState("English (US)");
  const [timeZone, setTimeZone] = useState("(GMT+05:30) Kolkata");
  const [dateFormat, setDateFormat] = useState("Apr 20, 2025");
  const [timeFormat, setTimeFormat] = useState("12-hour (AM/PM)");

  // Notifications
  const [pauseAllNotifications, setPauseAllNotifications] = useState(false);
  const [emailNotify, setEmailNotify] = useState(true);
  const [docUpdates, setDocUpdates] = useState(true);
  const [followerNotify, setFollowerNotify] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [communityNotify, setCommunityNotify] = useState(false);
  const [desktopPush, setDesktopPush] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [notifFrequency, setNotifFrequency] = useState("Instant (Real-time)");

  // Privacy & Security
  const [profileVisibility, setProfileVisibility] = useState("Public");
  const [searchEngineIndexing, setSearchEngineIndexing] = useState(true);
  const [showEmailAddress, setShowEmailAddress] = useState(false);
  const [readReceipts, setReadReceipts] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  // Password Update
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  // Connected Accounts
  const [connectedState, setConnectedState] = useState({
    google: true,
    github: true,
    twitter: false,
    discord: false,
    gitlab: false,
  });

  // Account tab states
  const [accountEmail, setAccountEmail] = useState(userEmail || "rupayan.dey@gmail.com");
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState(accountEmail);

  // Advanced tab states
  const [apiKey, setApiKey] = useState("dp_live_9f7a4b82c1e649d038e1b");
  const [webhookUrl, setWebhookUrl] = useState("https://api.myapp.com/webhooks/docspost");
  const [webhookSecret, setWebhookSecret] = useState("whsec_98f12a450c76");
  const [testWebhookStatus, setTestWebhookStatus] = useState("");
  const [aiAssistantBeta, setAiAssistantBeta] = useState(true);
  const [multiplayerCursors, setMultiplayerCursors] = useState(true);
  const [mermaidLatex, setMermaidLatex] = useState(true);
  const [oledDark, setOledDark] = useState(false);
  const [telemetry, setTelemetry] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("docspost-username");
      if (storedName) {
        setName(storedName);
        setUsername(storedName.toLowerCase().replace(/\s+/g, ""));
      }
      const storedEmail = localStorage.getItem("docspost-email");
      if (storedEmail) {
        setAccountEmail(storedEmail);
        setNewEmailInput(storedEmail);
      }
    }
  }, []);

  // Sync theme changes with app theme context
  const handleThemeChange = (mode) => {
    setSelectedTheme(mode);
    if (mode === "dark" && !isDark) {
      toggleTheme();
    } else if (mode === "light" && isDark) {
      toggleTheme();
    } else if (mode === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark && !isDark) toggleTheme();
      if (!prefersDark && isDark) toggleTheme();
    }
    showToast(`Switched theme to ${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("docspost-username", name);
    }
    setSavedSuccess(true);
    showToast("Profile details updated successfully!");
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const toggleConnect = (provider) => {
    const isNowConnected = !connectedState[provider];
    setConnectedState((prev) => ({
      ...prev,
      [provider]: isNowConnected,
    }));
    const providerNames = {
      google: "Google",
      github: "GitHub",
      twitter: "X (Twitter)",
      discord: "Discord",
      gitlab: "GitLab",
    };
    showToast(
      isNowConnected
        ? `Connected to ${providerNames[provider]}`
        : `Disconnected from ${providerNames[provider]}`,
      isNowConnected ? "success" : "info"
    );
  };

  const handleSaveEmail = (e) => {
    e.preventDefault();
    if (!newEmailInput || !newEmailInput.includes("@")) {
      showToast("Please enter a valid email address", "error");
      return;
    }
    setAccountEmail(newEmailInput);
    if (typeof window !== "undefined") {
      localStorage.setItem("docspost-email", newEmailInput);
    }
    setEditingEmail(false);
    showToast("Account email updated successfully!");
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast("Please enter your current password", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast("New password must be at least 8 characters long", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showToast("Password updated successfully!");
  };

  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "None", color: "#94a3b8" };
    if (pass.length < 6) return { score: 1, label: "Weak", color: "#ef4444" };
    if (pass.length < 10) return { score: 2, label: "Fair", color: "#f59e0b" };
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    const hasNum = /\d/.test(pass);
    if (hasSpecial && hasNum) return { score: 4, label: "Very Strong", color: "#10b981" };
    return { score: 3, label: "Strong", color: "#10b981" };
  };

  const handleExportData = () => {
    const exportData = {
      exportVersion: "2.4",
      exportDate: new Date().toISOString(),
      user: {
        name,
        username,
        email: accountEmail,
        bio,
        location,
        website,
      },
      settings: {
        theme: selectedTheme,
        accentColor,
        editorMode,
        autoSave,
        language,
        timeZone,
        profileVisibility,
        connectedProviders: connectedState,
      },
      documentsCount: 24,
      bookmarksCount: 18,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `docspost-account-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Account archive exported successfully!");
  };

  const handleClearCache = () => {
    showToast("Local cache and offline drafts cleared!");
  };

  const handleTestWebhook = () => {
    setTestWebhookStatus("sending");
    setTimeout(() => {
      setTestWebhookStatus("success");
      showToast("Webhook test ping delivered (200 OK)!");
      setTimeout(() => setTestWebhookStatus(""), 3500);
    }, 1200);
  };

  const handleRegenerateApiKey = () => {
    const randomHex = Array.from({ length: 24 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    setApiKey(`dp_live_${randomHex}`);
    showToast("New API key generated!");
  };

  const copyToClipboard = (text, label) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`${label} copied to clipboard!`);
    }
  };

  // Sub-navigation tabs list matching the provided reference image
  const subTabs = [
    { id: "general", label: "General", icon: FiSliders },
    { id: "appearance", label: "Appearance", icon: FiMoon },
    { id: "notifications", label: "Notifications", icon: FiBell },
    { id: "privacy", label: "Privacy & Security", icon: FiShield },
    { id: "connected", label: "Connected Accounts", icon: FiLink },
    { id: "account", label: "Account", icon: FiUser },
    { id: "advanced", label: "Advanced", icon: FiTerminal },
  ];

  const accentColors = [
    { color: "#2563eb", name: "Blue" },
    { color: "#7c3aed", name: "Purple" },
    { color: "#059669", name: "Emerald" },
    { color: "#d97706", name: "Amber" },
    { color: "#e11d48", name: "Rose" },
    { color: "#0891b2", name: "Cyan" },
    { color: "#4f46e5", name: "Indigo" },
  ];

  return (
    <div className="settings-root-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`settings-toast-pill ${toastType}`}>
          {toastType === "success" && <FiCheckCircle size={16} />}
          {toastType === "info" && <FiHelpCircle size={16} />}
          {toastType === "error" && <FiXCircle size={16} />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= 1. PANORAMIC BANNER ================= */}
      <section className="settings-panoramic-banner">
        <div className="settings-banner-content">
          <h1 className="settings-banner-title">Settings</h1>
          <p className="settings-banner-subtitle">
            Manage your account, preferences and security settings.
          </p>
        </div>

        {/* 3D Gear Graphic Illustration */}
        <div className="settings-banner-illustration" aria-hidden="true">
          <svg className="settings-gear-svg" viewBox="0 0 240 100" fill="none">
            <defs>
              <linearGradient id="gearGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </linearGradient>
              <linearGradient id="cardGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.45)" />
                <stop offset="100%" stopColor="rgba(30, 58, 138, 0.2)" />
              </linearGradient>
              <filter id="gearGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="glow" />
                <feComposite in="SourceGraphic" in2="glow" operator="over" />
              </filter>
            </defs>

            {/* Floating backdrop cards */}
            <rect
              x="140"
              y="10"
              width="85"
              height="55"
              rx="10"
              fill="url(#cardGradient)"
              stroke="rgba(96, 165, 250, 0.5)"
              strokeWidth="1"
              transform="rotate(-6 140 10)"
            />
            <rect
              x="150"
              y="24"
              width="45"
              height="6"
              rx="3"
              fill="rgba(255, 255, 255, 0.6)"
              transform="rotate(-6 140 10)"
            />
            <rect
              x="150"
              y="36"
              width="30"
              height="5"
              rx="2.5"
              fill="rgba(255, 255, 255, 0.3)"
              transform="rotate(-6 140 10)"
            />

            {/* Glowing 3D Cog Wheel */}
            <g transform="translate(90, 48) scale(0.95)" filter="url(#gearGlow)">
              <circle cx="0" cy="0" r="26" fill="url(#gearGradient)" stroke="#60a5fa" strokeWidth="2" />
              <circle cx="0" cy="0" r="11" fill="#090e1a" stroke="#3b82f6" strokeWidth="1.5" />
              {/* Teeth */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <rect
                  key={i}
                  x="-4"
                  y="-34"
                  width="8"
                  height="10"
                  rx="2"
                  fill="#3b82f6"
                  transform={`rotate(${angle})`}
                />
              ))}
            </g>

            {/* Ambient particles */}
            <circle cx="45" cy="30" r="1.5" fill="#60a5fa" opacity="0.8" />
            <circle cx="70" cy="65" r="2" fill="#93c5fd" opacity="0.6" />
            <circle cx="120" cy="18" r="1.5" fill="#3b82f6" opacity="0.9" />
            <circle cx="215" cy="68" r="2" fill="#3b82f6" opacity="0.7" />
          </svg>
        </div>
      </section>

      {/* ================= 2. SUB-NAVIGATION TABS BAR ================= */}
      <nav className="settings-subnav-bar" aria-label="Settings Categories">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubtab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`settings-tab-pill ${isActive ? "active" : ""}`}
              onClick={() => setActiveSubtab(tab.id)}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ================= 3. TAB VIEWS CONTENT ================= */}

      {/* TAB 1: GENERAL */}
      {activeSubtab === "general" && (
        <div className="settings-tab-panel">
          {/* Top 2-Column Grid */}
          <div className="settings-grid-two-col">
            {/* Profile Information Card */}
            <section className="settings-card" aria-label="Profile Information Settings">
              <div className="settings-card-header">
                <div className="settings-header-icon-box blue">
                  <FiUser size={20} />
                </div>
                <div className="settings-header-titles">
                  <h3>Profile Information</h3>
                  <p>Update your public profile and biographical details.</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="profile-card-body">
                <div className="profile-avatar-row">
                  <div className="profile-avatar-wrap">
                    {profilePicture ? (
                      <img src={profilePicture} alt={name} className="profile-avatar-img" />
                    ) : (
                      <div className="profile-avatar-placeholder">
                        {name ? name.charAt(0).toUpperCase() : "R"}
                      </div>
                    )}
                    <button
                      type="button"
                      className="profile-camera-btn"
                      title="Upload profile picture"
                      aria-label="Upload profile picture"
                      onClick={() => showToast("Avatar upload modal opened")}
                    >
                      <FiCamera size={14} />
                    </button>
                  </div>

                  <div className="profile-two-inputs-grid">
                    <div className="profile-field-group">
                      <label className="profile-field-label">Display Name</label>
                      <input
                        type="text"
                        className="profile-text-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="profile-field-group">
                      <label className="profile-field-label">Username</label>
                      <input
                        type="text"
                        className="profile-text-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="profile-field-group">
                  <label className="profile-field-label">Bio</label>
                  <textarea
                    className="profile-bio-textarea"
                    value={bio}
                    maxLength={200}
                    onChange={(e) => setBio(e.target.value)}
                  />
                  <div className="bio-footer-counter">
                    <span>{bio.length}/200</span>
                  </div>
                </div>

                <div className="profile-two-inputs-grid">
                  <div className="profile-field-group">
                    <label className="profile-field-label">Location</label>
                    <div className="profile-input-with-icon">
                      <FiMapPin className="profile-input-icon" size={16} />
                      <input
                        type="text"
                        className="profile-text-input"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="profile-field-group">
                    <label className="profile-field-label">Website</label>
                    <div className="profile-input-with-icon">
                      <FiLink className="profile-input-icon" size={16} />
                      <input
                        type="text"
                        className="profile-text-input"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="profile-card-actions">
                  <button type="submit" className="btn-save-settings">
                    {savedSuccess ? "Saved!" : "Save Changes"}
                  </button>
                </div>
              </form>
            </section>

            {/* Quick Appearance Preview Card */}
            <section className="settings-card" aria-label="Appearance Quick Setting">
              <div className="settings-card-header">
                <div className="settings-header-icon-box purple">
                  <FiMoon size={20} />
                </div>
                <div className="settings-header-titles">
                  <h3>Appearance & Theme</h3>
                  <p>Choose your workspace theme and accent style.</p>
                </div>
              </div>

              <div className="theme-mockup-options-row">
                <div
                  className={`theme-mockup-card ${selectedTheme === "light" ? "active" : ""}`}
                  onClick={() => handleThemeChange("light")}
                >
                  <div className="mockup-preview-canvas light-canvas">
                    <div className="mock-sidebar"></div>
                    <div className="mock-main">
                      <div className="mock-line-h"></div>
                      <div className="mock-card-box"></div>
                    </div>
                  </div>
                  <div className="theme-mockup-info">
                    <div className="theme-radio-circle">
                      {selectedTheme === "light" && <div className="theme-radio-dot" />}
                    </div>
                    <div className="theme-label-group">
                      <span className="theme-name">Light</span>
                      <span className="theme-desc">Clean and bright</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`theme-mockup-card ${selectedTheme === "dark" ? "active" : ""}`}
                  onClick={() => handleThemeChange("dark")}
                >
                  <div className="mockup-preview-canvas dark-canvas">
                    <div className="mock-sidebar"></div>
                    <div className="mock-main">
                      <div className="mock-line-h"></div>
                      <div className="mock-card-box"></div>
                    </div>
                  </div>
                  <div className="theme-mockup-info">
                    <div className="theme-radio-circle">
                      {selectedTheme === "dark" && <div className="theme-radio-dot" />}
                    </div>
                    <div className="theme-label-group">
                      <span className="theme-name">Dark</span>
                      <span className="theme-desc">Easy on the eyes</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`theme-mockup-card ${selectedTheme === "system" ? "active" : ""}`}
                  onClick={() => handleThemeChange("system")}
                >
                  <div className="mockup-preview-canvas system-canvas">
                    <div className="mock-sidebar"></div>
                    <div className="mock-main">
                      <div className="mock-line-h"></div>
                      <div className="mock-card-box"></div>
                    </div>
                  </div>
                  <div className="theme-mockup-info">
                    <div className="theme-radio-circle">
                      {selectedTheme === "system" && <div className="theme-radio-dot" />}
                    </div>
                    <div className="theme-label-group">
                      <span className="theme-name">System</span>
                      <span className="theme-desc">Follows device</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="setting-horizontal-row">
                <div className="setting-row-left">
                  <FiRefreshCw className="setting-row-icon" />
                  <div className="setting-row-text">
                    <h4>Use system theme</h4>
                    <p>Sync automatically with your operating system preference.</p>
                  </div>
                </div>
                <label className="ios-toggle-switch">
                  <input
                    type="checkbox"
                    checked={useSystemTheme}
                    onChange={(e) => {
                      setUseSystemTheme(e.target.checked);
                      if (e.target.checked) handleThemeChange("system");
                    }}
                  />
                  <span className="ios-toggle-slider" />
                </label>
              </div>

              <div className="setting-horizontal-row">
                <div className="setting-row-left">
                  <FiSliders className="setting-row-icon" />
                  <div className="setting-row-text">
                    <h4>Accent Color</h4>
                    <p>Highlight buttons, pills and focus rings.</p>
                  </div>
                </div>
                <div className="accent-colors-swatch-list">
                  {accentColors.slice(0, 5).map((item) => (
                    <button
                      key={item.color}
                      type="button"
                      className={`accent-color-btn ${accentColor === item.color ? "active" : ""}`}
                      style={{ backgroundColor: item.color }}
                      onClick={() => {
                        setAccentColor(item.color);
                        showToast(`Accent color set to ${item.name}`);
                      }}
                      aria-label={`Select ${item.name} accent`}
                      title={item.name}
                    />
                  ))}
                </div>
              </div>

              <div className="quick-tab-link-box">
                <button
                  type="button"
                  className="quick-tab-link-btn"
                  onClick={() => setActiveSubtab("appearance")}
                >
                  <span>More Appearance options (Fonts, Code Theme)</span>
                  <FiArrowRight size={15} />
                </button>
              </div>
            </section>
          </div>

          {/* Middle 2-Column Grid */}
          <div className="settings-grid-two-col">
            {/* Editor Preferences */}
            <section className="settings-card" aria-label="Editor Preferences">
              <div className="settings-card-header">
                <div className="settings-header-icon-box blue">
                  <FiCode size={20} />
                </div>
                <div className="settings-header-titles">
                  <h3>Editor Preferences</h3>
                  <p>Configure your default document editing experience.</p>
                </div>
              </div>

              <div className="editor-prefs-body">
                <div className="editor-mode-col">
                  <label className="profile-field-label">Default Editor Mode</label>
                  <select
                    className="setting-select-dropdown"
                    value={editorMode}
                    onChange={(e) => {
                      setEditorMode(e.target.value);
                      showToast(`Default editor mode set to ${e.target.value}`);
                    }}
                  >
                    <option value="Rich Text (TipTap)">Rich Text (TipTap)</option>
                    <option value="Markdown Only">Markdown Only</option>
                    <option value="Side-by-Side Split">Side-by-Side Split</option>
                  </select>
                  <span className="theme-desc">Choose how documents open by default.</span>
                </div>

                <div className="editor-toggles-col">
                  <div className="setting-toggle-item">
                    <div className="setting-toggle-info">
                      <h4>Auto Save</h4>
                      <p>Automatically save your changes while typing.</p>
                    </div>
                    <label className="ios-toggle-switch">
                      <input
                        type="checkbox"
                        checked={autoSave}
                        onChange={(e) => {
                          setAutoSave(e.target.checked);
                          showToast(e.target.checked ? "Auto save enabled" : "Auto save disabled");
                        }}
                      />
                      <span className="ios-toggle-slider" />
                    </label>
                  </div>

                  <div className="setting-toggle-item">
                    <div className="setting-toggle-info">
                      <h4>Show Line Numbers</h4>
                      <p>Display line numbers in code blocks.</p>
                    </div>
                    <label className="ios-toggle-switch">
                      <input
                        type="checkbox"
                        checked={showLineNumbers}
                        onChange={(e) => setShowLineNumbers(e.target.checked)}
                      />
                      <span className="ios-toggle-slider" />
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* Language & Region */}
            <section className="settings-card" aria-label="Language & Region Preferences">
              <div className="settings-card-header">
                <div className="settings-header-icon-box green">
                  <FiGlobe size={20} />
                </div>
                <div className="settings-header-titles">
                  <h3>Language & Region</h3>
                  <p>Configure language, timezone, and formatting standards.</p>
                </div>
              </div>

              <div className="language-region-grid">
                <div className="profile-field-group">
                  <label className="profile-field-label">Language</label>
                  <select
                    className="setting-select-dropdown"
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                      showToast(`Language set to ${e.target.value}`);
                    }}
                  >
                    <option value="English (US)">English (US)</option>
                    <option value="English (UK)">English (UK)</option>
                    <option value="Spanish">Español</option>
                    <option value="French">Français</option>
                    <option value="German">Deutsch</option>
                    <option value="Hindi">हिन्दी (Hindi)</option>
                    <option value="Japanese">日本語 (Japanese)</option>
                  </select>
                </div>

                <div className="profile-field-group">
                  <label className="profile-field-label">Time Zone</label>
                  <select
                    className="setting-select-dropdown"
                    value={timeZone}
                    onChange={(e) => {
                      setTimeZone(e.target.value);
                      showToast("Timezone updated");
                    }}
                  >
                    <option value="(GMT+05:30) Kolkata">(GMT+05:30) Kolkata</option>
                    <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
                    <option value="(GMT-05:00) Eastern Time">(GMT-05:00) Eastern Time</option>
                    <option value="(GMT-08:00) Pacific Time">(GMT-08:00) Pacific Time</option>
                    <option value="(GMT+01:00) London, Paris">(GMT+01:00) London, Paris</option>
                    <option value="(GMT+09:00) Tokyo">(GMT+09:00) Tokyo</option>
                  </select>
                </div>

                <div className="profile-field-group">
                  <label className="profile-field-label">Date Format</label>
                  <select
                    className="setting-select-dropdown"
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                  >
                    <option value="Apr 20, 2025">Apr 20, 2025 (Standard)</option>
                    <option value="20/04/2025">20/04/2025 (DD/MM/YYYY)</option>
                    <option value="2025-04-20">2025-04-20 (ISO 8601)</option>
                  </select>
                </div>

                <div className="profile-field-group">
                  <label className="profile-field-label">Time Format</label>
                  <select
                    className="setting-select-dropdown"
                    value={timeFormat}
                    onChange={(e) => setTimeFormat(e.target.value)}
                  >
                    <option value="12-hour (AM/PM)">12-hour (AM/PM)</option>
                    <option value="24-hour">24-hour (Military)</option>
                  </select>
                </div>
              </div>
            </section>
          </div>

          {/* Quick Shortcuts to other tabs */}
          <div className="settings-shortcuts-banner">
            <h4 className="shortcuts-title">Explore Detailed Configuration</h4>
            <div className="shortcuts-grid">
              <button
                type="button"
                className="shortcut-card"
                onClick={() => setActiveSubtab("notifications")}
              >
                <div className="shortcut-icon amber">
                  <FiBell size={18} />
                </div>
                <div className="shortcut-text">
                  <span className="shortcut-name">Notifications</span>
                  <span className="shortcut-hint">Email & push alerts</span>
                </div>
                <FiArrowRight className="shortcut-arrow" size={14} />
              </button>

              <button
                type="button"
                className="shortcut-card"
                onClick={() => setActiveSubtab("privacy")}
              >
                <div className="shortcut-icon purple">
                  <FiShield size={18} />
                </div>
                <div className="shortcut-text">
                  <span className="shortcut-name">Privacy & Security</span>
                  <span className="shortcut-hint">2FA & password change</span>
                </div>
                <FiArrowRight className="shortcut-arrow" size={14} />
              </button>

              <button
                type="button"
                className="shortcut-card"
                onClick={() => setActiveSubtab("connected")}
              >
                <div className="shortcut-icon green">
                  <FiLink size={18} />
                </div>
                <div className="shortcut-text">
                  <span className="shortcut-name">Connected Accounts</span>
                  <span className="shortcut-hint">Google, GitHub, X</span>
                </div>
                <FiArrowRight className="shortcut-arrow" size={14} />
              </button>

              <button
                type="button"
                className="shortcut-card"
                onClick={() => setActiveSubtab("account")}
              >
                <div className="shortcut-icon blue">
                  <FiUser size={18} />
                </div>
                <div className="shortcut-text">
                  <span className="shortcut-name">Account & Quota</span>
                  <span className="shortcut-hint">Email & data export</span>
                </div>
                <FiArrowRight className="shortcut-arrow" size={14} />
              </button>

              <button
                type="button"
                className="shortcut-card"
                onClick={() => setActiveSubtab("advanced")}
              >
                <div className="shortcut-icon cyan">
                  <FiTerminal size={18} />
                </div>
                <div className="shortcut-text">
                  <span className="shortcut-name">Advanced & API</span>
                  <span className="shortcut-hint">API tokens & cache</span>
                </div>
                <FiArrowRight className="shortcut-arrow" size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPEARANCE */}
      {activeSubtab === "appearance" && (
        <div className="settings-tab-panel">
          <div className="settings-grid-two-col">
            {/* Theme & Display Mode */}
            <section className="settings-card" aria-label="Theme Selection">
              <div className="settings-card-header">
                <div className="settings-header-icon-box blue">
                  <FiMoon size={20} />
                </div>
                <div className="settings-header-titles">
                  <h3>Theme & Visual Mode</h3>
                  <p>Choose your preferred interface theme and appearance mode.</p>
                </div>
              </div>

              <div className="theme-mockup-options-row">
                <div
                  className={`theme-mockup-card ${selectedTheme === "light" ? "active" : ""}`}
                  onClick={() => handleThemeChange("light")}
                >
                  <div className="mockup-preview-canvas light-canvas">
                    <div className="mock-sidebar"></div>
                    <div className="mock-main">
                      <div className="mock-line-h"></div>
                      <div className="mock-card-box"></div>
                    </div>
                  </div>
                  <div className="theme-mockup-info">
                    <div className="theme-radio-circle">
                      {selectedTheme === "light" && <div className="theme-radio-dot" />}
                    </div>
                    <div className="theme-label-group">
                      <span className="theme-name">Light Theme</span>
                      <span className="theme-desc">Crisp white and clean slate</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`theme-mockup-card ${selectedTheme === "dark" ? "active" : ""}`}
                  onClick={() => handleThemeChange("dark")}
                >
                  <div className="mockup-preview-canvas dark-canvas">
                    <div className="mock-sidebar"></div>
                    <div className="mock-main">
                      <div className="mock-line-h"></div>
                      <div className="mock-card-box"></div>
                    </div>
                  </div>
                  <div className="theme-mockup-info">
                    <div className="theme-radio-circle">
                      {selectedTheme === "dark" && <div className="theme-radio-dot" />}
                    </div>
                    <div className="theme-label-group">
                      <span className="theme-name">Dark Theme</span>
                      <span className="theme-desc">Deep navy signature aesthetic</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`theme-mockup-card ${selectedTheme === "system" ? "active" : ""}`}
                  onClick={() => handleThemeChange("system")}
                >
                  <div className="mockup-preview-canvas system-canvas">
                    <div className="mock-sidebar"></div>
                    <div className="mock-main">
                      <div className="mock-line-h"></div>
                      <div className="mock-card-box"></div>
                    </div>
                  </div>
                  <div className="theme-mockup-info">
                    <div className="theme-radio-circle">
                      {selectedTheme === "system" && <div className="theme-radio-dot" />}
                    </div>
                    <div className="theme-label-group">
                      <span className="theme-name">System Default</span>
                      <span className="theme-desc">Syncs with OS day/night</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="setting-horizontal-row">
                <div className="setting-row-left">
                  <FiRefreshCw className="setting-row-icon" />
                  <div className="setting-row-text">
                    <h4>Automatic System Synchronisation</h4>
                    <p>Switch between light and dark according to OS schedule.</p>
                  </div>
                </div>
                <label className="ios-toggle-switch">
                  <input
                    type="checkbox"
                    checked={useSystemTheme}
                    onChange={(e) => {
                      setUseSystemTheme(e.target.checked);
                      if (e.target.checked) handleThemeChange("system");
                    }}
                  />
                  <span className="ios-toggle-slider" />
                </label>
              </div>

              {/* Accent Color Picker */}
              <div className="setting-horizontal-row">
                <div className="setting-row-left">
                  <FiSliders className="setting-row-icon" />
                  <div className="setting-row-text">
                    <h4>Signature Accent Color</h4>
                    <p>Personalize buttons, highlights, and active borders.</p>
                  </div>
                </div>
                <div className="accent-colors-swatch-list">
                  {accentColors.map((item) => (
                    <button
                      key={item.color}
                      type="button"
                      className={`accent-color-btn ${accentColor === item.color ? "active" : ""}`}
                      style={{ backgroundColor: item.color }}
                      onClick={() => {
                        setAccentColor(item.color);
                        showToast(`Accent color set to ${item.name}`);
                      }}
                      aria-label={`Select ${item.name} accent`}
                      title={item.name}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Typography & Code Theme */}
            <section className="settings-card" aria-label="Typography and Code Styles">
              <div className="settings-card-header">
                <div className="settings-header-icon-box purple">
                  <FiCode size={20} />
                </div>
                <div className="settings-header-titles">
                  <h3>Typography & Code Styling</h3>
                  <p>Fine-tune font rendering and syntax highlight themes.</p>
                </div>
              </div>

              <div className="appearance-prefs-list">
                <div className="profile-field-group">
                  <label className="profile-field-label">Interface Font Family</label>
                  <select
                    className="setting-select-dropdown"
                    value={fontFamily}
                    onChange={(e) => {
                      setFontFamily(e.target.value);
                      showToast(`Interface font changed to ${e.target.value}`);
                    }}
                  >
                    <option value="Inter">Inter (Clean Modern Sans)</option>
                    <option value="Fira Code">Fira Code (Developer Monospace)</option>
                    <option value="Roboto">Roboto (Editorial & Crisp)</option>
                    <option value="System">System Native (SF Pro / Segoe UI)</option>
                  </select>
                </div>

                <div className="profile-field-group">
                  <label className="profile-field-label">Interface Density</label>
                  <div className="density-toggle-group">
                    {["Compact", "Standard", "Relaxed"].map((density) => (
                      <button
                        key={density}
                        type="button"
                        className={`density-pill-btn ${interfaceDensity === density ? "active" : ""}`}
                        onClick={() => {
                          setInterfaceDensity(density);
                          showToast(`Density set to ${density}`);
                        }}
                      >
                        {density}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="profile-field-group">
                  <label className="profile-field-label">Code Block Syntax Theme</label>
                  <select
                    className="setting-select-dropdown"
                    value={syntaxTheme}
                    onChange={(e) => {
                      setSyntaxTheme(e.target.value);
                      showToast(`Code syntax theme set to ${e.target.value}`);
                    }}
                  >
                    <option value="One Dark Pro">One Dark Pro</option>
                    <option value="GitHub Light / Dark">GitHub Adaptive</option>
                    <option value="Dracula">Dracula Official</option>
                    <option value="Night Owl">Night Owl (Sarah Drasner)</option>
                    <option value="Monokai Pro">Monokai Pro</option>
                  </select>
                </div>

                <div className="setting-toggle-item" style={{ paddingTop: "8px" }}>
                  <div className="setting-toggle-info">
                    <h4>Reduce Motion & Animations</h4>
                    <p>Minimize UI transitions and micro-animations.</p>
                  </div>
                  <label className="ios-toggle-switch">
                    <input
                      type="checkbox"
                      checked={reduceMotion}
                      onChange={(e) => {
                        setReduceMotion(e.target.checked);
                        showToast(e.target.checked ? "Reduced motion enabled" : "Full animations enabled");
                      }}
                    />
                    <span className="ios-toggle-slider" />
                  </label>
                </div>
              </div>

              <div className="profile-card-actions">
                <button
                  type="button"
                  className="btn-save-settings"
                  onClick={() => showToast("Appearance settings saved successfully!")}
                >
                  Save Appearance
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS */}
      {activeSubtab === "notifications" && (
        <div className="settings-tab-panel">
          <div className="settings-grid-two-col">
            {/* Email Notifications */}
            <section className="settings-card" aria-label="Email Notifications">
              <div className="settings-card-header">
                <div className="settings-header-icon-box amber">
                  <FiMail size={20} />
                </div>
                <div className="settings-header-titles">
                  <h3>Email Notifications</h3>
                  <p>Choose what alerts are dispatched to {accountEmail}.</p>
                </div>
              </div>

              <div className="notification-settings-list">
                <div className="notify-setting-row">
                  <div className="notify-setting-left">
                    <FiFileText className="notify-setting-icon" />
                    <div className="notify-setting-text">
                      <h4>Weekly Knowledge Digest</h4>
                      <p>Curated top articles and trending developer tutorials.</p>
                    </div>
                  </div>
                  <label className="ios-toggle-switch">
                    <input
                      type="checkbox"
                      checked={emailNotify}
                      onChange={(e) => setEmailNotify(e.target.checked)}
                    />
                    <span className="ios-toggle-slider" />
                  </label>
                </div>

                <div className="notify-setting-row">
                  <div className="notify-setting-left">
                    <FiUsers className="notify-setting-icon" />
                    <div className="notify-setting-text">
                      <h4>Document Interactions</h4>
                      <p>Get notified when someone upvotes or comments on your docs.</p>
                    </div>
                  </div>
                  <label className="ios-toggle-switch">
                    <input
                      type="checkbox"
                      checked={docUpdates}
                      onChange={(e) => setDocUpdates(e.target.checked)}
                    />
                    <span className="ios-toggle-slider" />
                  </label>
                </div>

                <div className="notify-setting-row">
                  <div className="notify-setting-left">
                    <FiUser className="notify-setting-icon" />
                    <div className="notify-setting-text">
                      <h4>New Followers & Mentions</h4>
                      <p>Receive an email when someone starts following your profile.</p>
                    </div>
                  </div>
                  <label className="ios-toggle-switch">
                    <input
                      type="checkbox"
                      checked={followerNotify}
                      onChange={(e) => setFollowerNotify(e.target.checked)}
                    />
                    <span className="ios-toggle-slider" />
                  </label>
                </div>

                <div className="notify-setting-row">
                  <div className="notify-setting-left">
                    <FiShield className="notify-setting-icon" />
                    <div className="notify-setting-text">
                      <h4>Security & Login Alerts</h4>
                      <p>Instant alerts when logins from new devices occur.</p>
                    </div>
                  </div>
                  <label className="ios-toggle-switch">
                    <input
                      type="checkbox"
                      checked={securityAlerts}
                      onChange={(e) => setSecurityAlerts(e.target.checked)}
                    />
                    <span className="ios-toggle-slider" />
                  </label>
                </div>

                <div className="notify-setting-row">
                  <div className="notify-setting-left">
                    <FiGlobe className="notify-setting-icon" />
                    <div className="notify-setting-text">
                      <h4>DocsPost Product Updates</h4>
                      <p>Monthly changelogs and early access invitations.</p>
                    </div>
                  </div>
                  <label className="ios-toggle-switch">
                    <input
                      type="checkbox"
                      checked={communityNotify}
                      onChange={(e) => setCommunityNotify(e.target.checked)}
                    />
                    <span className="ios-toggle-slider" />
                  </label>
                </div>
              </div>
            </section>

            {/* Push & In-App Notifications */}
            <section className="settings-card" aria-label="Push Notifications">
              <div className="settings-card-header">
                <div className="settings-header-icon-box blue">
                  <FiBell size={20} />
                </div>
                <div className="settings-header-titles">
                  <h3>Push & Real-time Alerts</h3>
                  <p>Configure in-browser toasts and notification frequency.</p>
                </div>
              </div>

              <div className="notification-settings-list">
                <div className="notify-setting-row">
                  <div className="notify-setting-left">
                    <FiMonitor className="notify-setting-icon" />
                    <div className="notify-setting-text">
                      <h4>Browser Desktop Notifications</h4>
                      <p>Receive notifications even when DocsPost is in background.</p>
                    </div>
                  </div>
                  <label className="ios-toggle-switch">
                    <input
                      type="checkbox"
                      checked={desktopPush}
                      onChange={(e) => {
                        setDesktopPush(e.target.checked);
                        showToast(e.target.checked ? "Desktop push notifications enabled" : "Desktop push disabled");
                      }}
                    />
                    <span className="ios-toggle-slider" />
                  </label>
                </div>

                <div className="notify-setting-row">
                  <div className="notify-setting-left">
                    <FiVolume2 className="notify-setting-icon" />
                    <div className="notify-setting-text">
                      <h4>Sound Effects</h4>
                      <p>Play a soft chime when comments or mentions arrive.</p>
                    </div>
                  </div>
                  <label className="ios-toggle-switch">
                    <input
                      type="checkbox"
                      checked={soundEffects}
                      onChange={(e) => setSoundEffects(e.target.checked)}
                    />
                    <span className="ios-toggle-slider" />
                  </label>
                </div>

                <div className="profile-field-group" style={{ paddingTop: "10px" }}>
                  <label className="profile-field-label">Email Digest Frequency</label>
                  <select
                    className="setting-select-dropdown"
                    value={notifFrequency}
                    onChange={(e) => {
                      setNotifFrequency(e.target.value);
                      showToast(`Digest frequency set to ${e.target.value}`);
                    }}
                  >
                    <option value="Instant (Real-time)">Instant (Real-time)</option>
                    <option value="Hourly Batch">Hourly Batch</option>
                    <option value="Daily Digest">Daily Digest (9:00 AM)</option>
                    <option value="Weekly Summary">Weekly Summary (Mondays)</option>
                  </select>
                </div>

                <div className="notification-pause-box">
                  <div className="notify-setting-left">
                    <FiZap className="notify-setting-icon" style={{ color: "#f59e0b" }} />
                    <div className="notify-setting-text">
                      <h4 style={{ color: "#f59e0b" }}>Pause All Notifications</h4>
                      <p>Mute all emails and browser push alerts temporarily.</p>
                    </div>
                  </div>
                  <label className="ios-toggle-switch">
                    <input
                      type="checkbox"
                      checked={pauseAllNotifications}
                      onChange={(e) => {
                        setPauseAllNotifications(e.target.checked);
                        showToast(e.target.checked ? "All notifications paused" : "Notifications resumed");
                      }}
                    />
                    <span className="ios-toggle-slider" />
                  </label>
                </div>
              </div>

              <div className="profile-card-actions">
                <button
                  type="button"
                  className="btn-save-settings"
                  onClick={() => showToast("Notification preferences updated successfully!")}
                >
                  Save Notification Preferences
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* TAB 4: PRIVACY & SECURITY */}
      {activeSubtab === "privacy" && (
        <div className="settings-tab-panel">
          <div className="settings-grid-two-col">
            {/* Privacy Controls */}
            <section className="settings-card" aria-label="Privacy Controls">
              <div className="settings-card-header">
                <div className="settings-header-icon-box purple">
                  <FiShield size={20} />
                </div>
                <div className="settings-header-titles">
                  <h3>Privacy & Visibility</h3>
                  <p>Control who can discover your profile and content.</p>
                </div>
              </div>

              <div className="privacy-settings-list">
                <div className="privacy-setting-row">
                  <div className="privacy-setting-left">
                    <h4>Profile Visibility</h4>
                    <p>Determine who can discover your author profile.</p>
                  </div>
                  <select
                    className="setting-select-dropdown"
                    style={{ width: "130px", height: "38px" }}
                    value={profileVisibility}
                    onChange={(e) => {
                      setProfileVisibility(e.target.value);
                      showToast(`Visibility set to ${e.target.value}`);
                    }}
                  >
                    <option value="Public">Public</option>
                    <option value="Followers Only">Followers Only</option>
                    <option value="Private">Private</option>
                  </select>
                </div>

                <div className="privacy-setting-row">
                  <div className="privacy-setting-left">
                    <h4>Search Engine Indexing</h4>
                    <p>Allow Google and other engines to index your published docs.</p>
                  </div>
                  <label className="ios-toggle-switch">
                    <input
                      type="checkbox"
                      checked={searchEngineIndexing}
                      onChange={(e) => setSearchEngineIndexing(e.target.checked)}
                    />
                    <span className="ios-toggle-slider" />
                  </label>
                </div>

                <div className="privacy-setting-row">
                  <div className="privacy-setting-left">
                    <h4>Show Email Address</h4>
                    <p>Make your contact email visible on public docs.</p>
                  </div>
                  <label className="ios-toggle-switch">
                    <input
                      type="checkbox"
                      checked={showEmailAddress}
                      onChange={(e) => setShowEmailAddress(e.target.checked)}
                    />
                    <span className="ios-toggle-slider" />
                  </label>
                </div>

                <div className="privacy-setting-row">
                  <div className="privacy-setting-left">
                    <h4>Document Read Receipts</h4>
                    <p>Share anonymous read analytics with document authors.</p>
                  </div>
                  <label className="ios-toggle-switch">
                    <input
                      type="checkbox"
                      checked={readReceipts}
                      onChange={(e) => setReadReceipts(e.target.checked)}
                    />
                    <span className="ios-toggle-slider" />
                  </label>
                </div>
              </div>

              {/* Two-Factor Authentication Box */}
              <div className="security-highlight-card">
                <div className="security-highlight-header">
                  <div className="sec-icon-box">
                    <FiLock size={20} />
                  </div>
                  <div className="sec-text-box">
                    <h4>Two-Factor Authentication (2FA)</h4>
                    <p>
                      {twoFactorEnabled
                        ? "Active: Your account is protected with Google Authenticator."
                        : "Protect your account with an extra verification code on login."}
                    </p>
                  </div>
                </div>
                <div className="sec-action-row">
                  <span className={`status-badge ${twoFactorEnabled ? "active" : "inactive"}`}>
                    {twoFactorEnabled ? "2FA Enabled" : "Not Configured"}
                  </span>
                  <button
                    type="button"
                    className="btn-setup-action"
                    onClick={() => {
                      if (twoFactorEnabled) {
                        setTwoFactorEnabled(false);
                        showToast("Two-factor authentication disabled", "info");
                      } else {
                        setTwoFactorModalOpen(true);
                      }
                    }}
                  >
                    {twoFactorEnabled ? "Disable 2FA" : "Configure 2FA"}
                  </button>
                </div>

                {/* 2FA Setup Drawer */}
                {twoFactorModalOpen && (
                  <div className="two-factor-setup-panel">
                    <h5>Scan with Authenticator App</h5>
                    <p className="theme-desc">
                      Open Google Authenticator, 1Password or Authy and scan the barcode:
                    </p>
                    <div className="two-factor-qr-mock">
                      <div className="mock-qr-code">
                        <div className="qr-pattern"></div>
                      </div>
                      <div className="qr-secret-key">
                        <code>JBSWY3DPEHPK3PXP</code>
                        <button
                          type="button"
                          className="btn-copy-small"
                          onClick={() => copyToClipboard("JBSWY3DPEHPK3PXP", "Secret key")}
                        >
                          <FiCopy size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="qr-verify-row">
                      <input
                        type="text"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="profile-text-input qr-code-input"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                      />
                      <button
                        type="button"
                        className="btn-save-settings"
                        onClick={() => {
                          if (twoFactorCode.length === 6) {
                            setTwoFactorEnabled(true);
                            setTwoFactorModalOpen(false);
                            setTwoFactorCode("");
                            showToast("Two-factor authentication verified & activated!");
                          } else {
                            showToast("Please enter a 6-digit verification code", "error");
                          }
                        }}
                      >
                        Verify & Enable
                      </button>
                      <button
                        type="button"
                        className="btn-cancel-small"
                        onClick={() => setTwoFactorModalOpen(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Password Update & Active Sessions */}
            <div className="security-right-col">
              {/* Change Password Card */}
              <section className="settings-card" aria-label="Password Update">
                <div className="settings-card-header">
                  <div className="settings-header-icon-box blue">
                    <FiKey size={20} />
                  </div>
                  <div className="settings-header-titles">
                    <h3>Change Password</h3>
                    <p>Update your password to keep your account safe.</p>
                  </div>
                </div>

                <form onSubmit={handleUpdatePassword} className="password-form-body">
                  <div className="profile-field-group">
                    <label className="profile-field-label">Current Password</label>
                    <div className="profile-input-with-icon password-wrap">
                      <input
                        type={showPasswords ? "text" : "password"}
                        className="profile-text-input"
                        placeholder="••••••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">New Password</label>
                    <input
                      type={showPasswords ? "text" : "password"}
                      className="profile-text-input"
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="password-strength-bar-wrap">
                        <div className="strength-bar-track">
                          <div
                            className="strength-bar-fill"
                            style={{
                              width: `${(calculatePasswordStrength(newPassword).score / 4) * 100}%`,
                              backgroundColor: calculatePasswordStrength(newPassword).color,
                            }}
                          />
                        </div>
                        <span
                          className="strength-text"
                          style={{ color: calculatePasswordStrength(newPassword).color }}
                        >
                          {calculatePasswordStrength(newPassword).label}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-field-label">Confirm New Password</label>
                    <input
                      type={showPasswords ? "text" : "password"}
                      className="profile-text-input"
                      placeholder="Re-type new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <div className="profile-card-actions">
                    <button type="submit" className="btn-save-settings">
                      Update Password
                    </button>
                  </div>
                </form>
              </section>

              {/* Active Sessions */}
              <section className="settings-card" aria-label="Active Devices">
                <div className="settings-card-header">
                  <div className="settings-header-icon-box green">
                    <FiMonitor size={20} />
                  </div>
                  <div className="settings-header-titles">
                    <h3>Active Login Sessions</h3>
                    <p>Devices currently authenticated to your account.</p>
                  </div>
                </div>

                <div className="sessions-list">
                  <div className="session-item-row active-now">
                    <div className="session-device-icon">
                      <FiMonitor size={18} />
                    </div>
                    <div className="session-details">
                      <div className="session-title-line">
                        <span className="session-device-name">Windows 11 • Chrome 124</span>
                        <span className="session-current-pill">Current Session</span>
                      </div>
                      <span className="session-meta">Kolkata, India • Active now</span>
                    </div>
                  </div>

                  <div className="session-item-row">
                    <div className="session-device-icon">
                      <FiSmartphone size={18} />
                    </div>
                    <div className="session-details">
                      <div className="session-title-line">
                        <span className="session-device-name">iPhone 15 Pro • DocsPost Mobile</span>
                      </div>
                      <span className="session-meta">Mumbai, India • 4 hours ago</span>
                    </div>
                  </div>
                </div>

                <div className="session-actions-footer">
                  <button
                    type="button"
                    className="btn-terminate-sessions"
                    onClick={() => showToast("Terminated all other active sessions")}
                  >
                    Log Out All Other Devices
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CONNECTED ACCOUNTS */}
      {activeSubtab === "connected" && (
        <div className="settings-tab-panel">
          <section className="settings-card" aria-label="Third-Party Integrations">
            <div className="settings-card-header">
              <div className="settings-header-icon-box green">
                <FiLink size={20} />
              </div>
              <div className="settings-header-titles">
                <h3>Connected Accounts</h3>
                <p>Manage third-party single sign-on providers and linked developer services.</p>
              </div>
            </div>

            <div className="connected-accounts-grid">
              {/* Google */}
              <div className="account-provider-card">
                <div className="provider-card-main">
                  <div className="account-provider-logo">
                    <svg width="22" height="22" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.1L1.6 16.1C3.5 20 7.4 23 12 23z"
                      />
                    </svg>
                  </div>
                  <div className="provider-info-text">
                    <h4>Google</h4>
                    <p>One-click authentication & Google Drive document imports.</p>
                    <span className="provider-status-text">
                      {connectedState.google ? `Linked as ${accountEmail}` : "Not linked"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className={`btn-connect-account ${connectedState.google ? "connected" : ""}`}
                  onClick={() => toggleConnect("google")}
                >
                  {connectedState.google ? "Disconnect" : "Connect Account"}
                </button>
              </div>

              {/* GitHub */}
              <div className="account-provider-card">
                <div className="provider-card-main">
                  <div className="account-provider-logo">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  </div>
                  <div className="provider-info-text">
                    <h4>GitHub</h4>
                    <p>Sync code repositories, import READMEs, and display verified developer badge.</p>
                    <span className="provider-status-text">
                      {connectedState.github ? "Linked as @rupayanDey" : "Not linked"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className={`btn-connect-account ${connectedState.github ? "connected" : ""}`}
                  onClick={() => toggleConnect("github")}
                >
                  {connectedState.github ? "Disconnect" : "Connect Account"}
                </button>
              </div>

              {/* X (Twitter) */}
              <div className="account-provider-card">
                <div className="provider-card-main">
                  <div className="account-provider-logo">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <div className="provider-info-text">
                    <h4>X (formerly Twitter)</h4>
                    <p>Auto-share published articles and showcase your handle on your profile.</p>
                    <span className="provider-status-text">
                      {connectedState.twitter ? "Linked" : "Not linked"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className={`btn-connect-account ${connectedState.twitter ? "connected" : ""}`}
                  onClick={() => toggleConnect("twitter")}
                >
                  {connectedState.twitter ? "Disconnect" : "Connect Account"}
                </button>
              </div>

              {/* Discord */}
              <div className="account-provider-card">
                <div className="provider-card-main">
                  <div className="account-provider-logo">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#5865F2">
                      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.894.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </div>
                  <div className="provider-info-text">
                    <h4>Discord</h4>
                    <p>Unlock verified DocsPost author role in the community developer server.</p>
                    <span className="provider-status-text">
                      {connectedState.discord ? "Linked" : "Not linked"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className={`btn-connect-account ${connectedState.discord ? "connected" : ""}`}
                  onClick={() => toggleConnect("discord")}
                >
                  {connectedState.discord ? "Disconnect" : "Connect Account"}
                </button>
              </div>
            </div>

            <div className="connected-accounts-footer">
              <button
                type="button"
                className="btn-sync-all"
                onClick={() => showToast("Account metadata synchronized successfully!")}
              >
                <FiRefreshCw size={15} />
                <span>Sync Third-Party Profile Data</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* TAB 6: ACCOUNT */}
      {activeSubtab === "account" && (
        <div className="settings-tab-panel">
          <div className="settings-grid-two-col">
            {/* Account Credentials */}
            <section className="settings-card" aria-label="Account Credentials">
              <div className="settings-card-header">
                <div className="settings-header-icon-box blue">
                  <FiUser size={20} />
                </div>
                <div className="settings-header-titles">
                  <h3>Account Credentials</h3>
                  <p>Manage your login email and public profile handle.</p>
                </div>
              </div>

              <div className="account-details-body">
                {/* Email row */}
                <div className="account-info-row">
                  <div className="account-info-left">
                    <span className="info-label">Primary Email Address</span>
                    <div className="info-value-with-badge">
                      <span className="info-value">{accountEmail}</span>
                      <span className="verified-badge">
                        <FiCheck size={12} /> Verified
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-text-action"
                    onClick={() => setEditingEmail(!editingEmail)}
                  >
                    {editingEmail ? "Cancel" : "Change Email"}
                  </button>
                </div>

                {editingEmail && (
                  <form onSubmit={handleSaveEmail} className="inline-email-edit-form">
                    <input
                      type="email"
                      className="profile-text-input"
                      placeholder="Enter new email"
                      value={newEmailInput}
                      onChange={(e) => setNewEmailInput(e.target.value)}
                    />
                    <button type="submit" className="btn-save-settings">
                      Update Email
                    </button>
                  </form>
                )}

                {/* Username URL row */}
                <div className="account-info-row">
                  <div className="account-info-left">
                    <span className="info-label">Public Profile URL</span>
                    <span className="info-value">https://docspost.dev/@{username}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-text-action"
                    onClick={() =>
                      copyToClipboard(`https://docspost.dev/@${username}`, "Profile link")
                    }
                  >
                    Copy Link
                  </button>
                </div>

                {/* Account ID */}
                <div className="account-info-row">
                  <div className="account-info-left">
                    <span className="info-label">User Identifier (UID)</span>
                    <span className="info-value font-mono">usr_892f4c19a3b7</span>
                  </div>
                  <button
                    type="button"
                    className="btn-text-action"
                    onClick={() => copyToClipboard("usr_892f4c19a3b7", "User ID")}
                  >
                    Copy UID
                  </button>
                </div>

                {/* Member Since */}
                <div className="account-info-row">
                  <div className="account-info-left">
                    <span className="info-label">Member Since</span>
                    <span className="info-value">March 14, 2024 (Active Author)</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Storage Quota & Data Export */}
            <div className="account-right-stack">
              {/* Storage Quota */}
              <section className="settings-card" aria-label="Storage Usage">
                <div className="settings-card-header">
                  <div className="settings-header-icon-box green">
                    <FiDatabase size={20} />
                  </div>
                  <div className="settings-header-titles">
                    <h3>Storage & Usage Quota</h3>
                    <p>Current cloud document and asset allocation.</p>
                  </div>
                </div>

                <div className="quota-meter-wrap">
                  <div className="quota-progress-track">
                    <div className="quota-progress-fill" style={{ width: "1.5%" }} />
                  </div>
                  <div className="quota-labels-row">
                    <span>14.8 MB of 1,000 MB used</span>
                    <span>1.5%</span>
                  </div>
                </div>

                <div className="quota-breakdown-grid">
                  <div className="quota-stat-chip">
                    <span className="stat-chip-label">Documents</span>
                    <span className="stat-chip-val">24 Docs (2.8 MB)</span>
                  </div>
                  <div className="quota-stat-chip">
                    <span className="stat-chip-label">Media Assets</span>
                    <span className="stat-chip-val">42 Images (12.0 MB)</span>
                  </div>
                  <div className="quota-stat-chip">
                    <span className="stat-chip-label">Monthly Views</span>
                    <span className="stat-chip-val">18.4K Requests</span>
                  </div>
                </div>
              </section>

              {/* Data Export Archive */}
              <section className="settings-card" aria-label="Data Export">
                <div className="settings-card-header">
                  <div className="settings-header-icon-box purple">
                    <FiDownload size={20} />
                  </div>
                  <div className="settings-header-titles">
                    <h3>Export Your Data</h3>
                    <p>Download a complete archive of your documents, drafts, and profile.</p>
                  </div>
                </div>

                <p className="theme-desc">
                  Generate a portable JSON archive containing all published documents, revision
                  histories, and preferences.
                </p>

                <div className="profile-card-actions">
                  <button type="button" className="btn-save-settings" onClick={handleExportData}>
                    <FiDownload size={15} style={{ marginRight: "6px" }} />
                    Download Account Archive (JSON)
                  </button>
                </div>
              </section>
            </div>
          </div>

          {/* Danger Zone */}
          <section className="settings-card danger-zone-card" aria-label="Danger Zone">
            <div className="settings-card-header">
              <div className="settings-header-icon-box rose">
                <FiAlertTriangle size={20} />
              </div>
              <div className="settings-header-titles">
                <h3 className="danger-title">Danger Zone</h3>
                <p>Irreversible actions related to your account presence.</p>
              </div>
            </div>

            <div className="danger-zone-actions-list">
              <div className="danger-action-item">
                <div className="danger-item-info">
                  <h4>Deactivate Account</h4>
                  <p>Temporarily unpublish your articles and hide your public profile.</p>
                </div>
                <button
                  type="button"
                  className="btn-danger-secondary"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to deactivate your account?")) {
                      showToast("Account deactivated. You can sign in anytime to restore.");
                    }
                  }}
                >
                  Deactivate Account
                </button>
              </div>

              <div className="danger-action-item">
                <div className="danger-item-info">
                  <h4>Delete Account & Data</h4>
                  <p>Permanently remove your account, articles, comments, and uploaded assets.</p>
                </div>
                <button
                  type="button"
                  className="btn-danger-primary"
                  onClick={() => {
                    if (
                      window.confirm(
                        "WARNING: This action is permanent and cannot be undone. Are you sure you wish to delete your account?"
                      )
                    ) {
                      showToast("Account deletion request registered.", "error");
                    }
                  }}
                >
                  <FiTrash2 size={14} style={{ marginRight: "4px" }} /> Delete Account
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 7: ADVANCED */}
      {activeSubtab === "advanced" && (
        <div className="settings-tab-panel">
          <div className="settings-grid-two-col">
            {/* Developer & API Keys */}
            <section className="settings-card" aria-label="Developer Settings">
              <div className="settings-card-header">
                <div className="settings-header-icon-box cyan">
                  <FiTerminal size={20} />
                </div>
                <div className="settings-header-titles">
                  <h3>Developer API Tokens</h3>
                  <p>Authenticate CLI tools, GitHub Actions, and headless CMS pipelines.</p>
                </div>
              </div>

              <div className="api-key-box">
                <div className="api-key-label-row">
                  <span className="profile-field-label">Personal Access Token (Live)</span>
                  <span className="token-tier-badge">Free Tier • 60 req/min</span>
                </div>
                <div className="api-key-display-field">
                  <code className="api-token-code">
                    {apiKey.slice(0, 8)}••••••••••••{apiKey.slice(-5)}
                  </code>
                  <button
                    type="button"
                    className="btn-copy-small"
                    title="Copy API Token"
                    onClick={() => copyToClipboard(apiKey, "API Token")}
                  >
                    <FiCopy size={15} />
                  </button>
                </div>
                <div className="api-key-actions-row">
                  <button
                    type="button"
                    className="btn-text-action"
                    onClick={handleRegenerateApiKey}
                  >
                    <FiRefreshCw size={13} style={{ marginRight: "4px" }} /> Regenerate Key
                  </button>
                  <span className="theme-desc">Last used: 2 hours ago</span>
                </div>
              </div>

              {/* Webhook Configuration */}
              <div className="setting-horizontal-row" style={{ flexDirection: "column", alignItems: "stretch", gap: "10px" }}>
                <div className="setting-row-text">
                  <h4>Outgoing Webhook Integration</h4>
                  <p>Dispatch payload events when documents are published or modified.</p>
                </div>
                <div className="profile-field-group">
                  <label className="profile-field-label">Payload URL</label>
                  <input
                    type="text"
                    className="profile-text-input"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                </div>
                <div className="profile-field-group">
                  <label className="profile-field-label">Webhook Secret</label>
                  <input
                    type="text"
                    className="profile-text-input font-mono"
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                  />
                </div>
                <div className="webhook-events-check-list">
                  <span className="profile-field-label">Trigger Events:</span>
                  <div className="events-checkbox-row">
                    <label className="event-check-label">
                      <input type="checkbox" defaultChecked /> doc.published
                    </label>
                    <label className="event-check-label">
                      <input type="checkbox" defaultChecked /> doc.updated
                    </label>
                    <label className="event-check-label">
                      <input type="checkbox" /> comment.created
                    </label>
                  </div>
                </div>
                <div className="profile-card-actions">
                  <button
                    type="button"
                    className="btn-secondary-action"
                    onClick={handleTestWebhook}
                  >
                    {testWebhookStatus === "sending" ? "Testing..." : "Send Test Ping"}
                  </button>
                  <button
                    type="button"
                    className="btn-save-settings"
                    onClick={() => showToast("Webhook configuration saved successfully!")}
                  >
                    Save Webhook
                  </button>
                </div>
              </div>
            </section>

            {/* Performance, Cache & Beta Flags */}
            <div className="advanced-right-stack">
              {/* Local Storage & Cache */}
              <section className="settings-card" aria-label="Cache and Performance">
                <div className="settings-card-header">
                  <div className="settings-header-icon-box amber">
                    <FiDatabase size={20} />
                  </div>
                  <div className="settings-header-titles">
                    <h3>Offline Cache & Performance</h3>
                    <p>Manage browser offline storage and local indices.</p>
                  </div>
                </div>

                <div className="cache-info-box">
                  <div className="cache-stat-item">
                    <span className="cache-stat-label">Offline Drafts Cache</span>
                    <span className="cache-stat-value">3.4 MB</span>
                  </div>
                  <div className="cache-stat-item">
                    <span className="cache-stat-label">Syntax Highlighter Grammars</span>
                    <span className="cache-stat-value">1.8 MB</span>
                  </div>
                </div>

                <div className="profile-card-actions">
                  <button
                    type="button"
                    className="btn-secondary-action"
                    onClick={handleClearCache}
                  >
                    <FiTrash2 size={14} style={{ marginRight: "6px" }} />
                    Clear Local Storage Cache
                  </button>
                </div>
              </section>

              {/* Experimental Beta Features */}
              <section className="settings-card" aria-label="Experimental Features">
                <div className="settings-card-header">
                  <div className="settings-header-icon-box purple">
                    <FiZap size={20} />
                  </div>
                  <div className="settings-header-titles">
                    <h3>Experimental Beta Features</h3>
                    <p>Preview next-generation writing tools before general release.</p>
                  </div>
                </div>

                <div className="beta-features-list">
                  <div className="setting-toggle-item">
                    <div className="setting-toggle-info">
                      <h4>AI Writing Companion (TipTap)</h4>
                      <p>Inline ghost-text suggestions and automatic grammar polish.</p>
                    </div>
                    <label className="ios-toggle-switch">
                      <input
                        type="checkbox"
                        checked={aiAssistantBeta}
                        onChange={(e) => {
                          setAiAssistantBeta(e.target.checked);
                          showToast(e.target.checked ? "AI Assistant enabled" : "AI Assistant disabled");
                        }}
                      />
                      <span className="ios-toggle-slider" />
                    </label>
                  </div>

                  <div className="setting-toggle-item">
                    <div className="setting-toggle-info">
                      <h4>Real-time Multiplayer Cursors</h4>
                      <p>View live collaborator cursors and selections in shared docs.</p>
                    </div>
                    <label className="ios-toggle-switch">
                      <input
                        type="checkbox"
                        checked={multiplayerCursors}
                        onChange={(e) => setMultiplayerCursors(e.target.checked)}
                      />
                      <span className="ios-toggle-slider" />
                    </label>
                  </div>

                  <div className="setting-toggle-item">
                    <div className="setting-toggle-info">
                      <h4>Mermaid & KaTeX Math Rendering</h4>
                      <p>Live render flowcharts, sequence diagrams, and mathematical formulas.</p>
                    </div>
                    <label className="ios-toggle-switch">
                      <input
                        type="checkbox"
                        checked={mermaidLatex}
                        onChange={(e) => setMermaidLatex(e.target.checked)}
                      />
                      <span className="ios-toggle-slider" />
                    </label>
                  </div>

                  <div className="setting-toggle-item">
                    <div className="setting-toggle-info">
                      <h4>Anonymous Diagnostic Telemetry</h4>
                      <p>Help improve DocsPost by sharing crash reports.</p>
                    </div>
                    <label className="ios-toggle-switch">
                      <input
                        type="checkbox"
                        checked={telemetry}
                        onChange={(e) => setTelemetry(e.target.checked)}
                      />
                      <span className="ios-toggle-slider" />
                    </label>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
