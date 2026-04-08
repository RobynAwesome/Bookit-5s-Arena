"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isSuperAdmin } from "@/lib/accessControl";
import {
  FaUserShield,
  FaSearch,
  FaUsers,
  FaTimes,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaToggleOn,
  FaToggleOff,
  FaLock,
  FaChevronDown,
} from "react-icons/fa";

const ROLE_CONFIG = {
  admin:   { label: "Admin",   color: "#f97316" },
  manager: { label: "Manager", color: "#3b82f6" },
  user:    { label: "Player",  color: "#22c55e" },
};

const TIER_ORDER = ["guest", "user", "manager", "admin"];
const TIER_COLORS = {
  guest:   { color: "#6b7280", label: "Guest" },
  user:    { color: "#22c55e", label: "User" },
  manager: { color: "#3b82f6", label: "Manager" },
  admin:   { color: "#f97316", label: "Admin" },
};

/* ─── User Management ─────────────────────────────────────────── */

function UserRow({ user, onRolesUpdate }) {
  const [editing, setEditing] = useState(false);
  const [roles, setRoles] = useState(user.roles || ["user"]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isSA = isSuperAdmin(user.email);

  const toggleRole = (role) => {
    if (role === "user") return;
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/rights/users/${user._id}/roles`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update roles");
      onRolesUpdate(user._id, data.user.roles);
      setEditing(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-800/50 hover:bg-gray-900/40 transition-all">
      <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-white text-sm font-black shrink-0">
        {user.name?.[0]?.toUpperCase() || "?"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-white text-sm font-bold truncate">{user.name}</p>
          {isSA && (
            <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
              Super Admin
            </span>
          )}
        </div>
        <p className="text-gray-500 text-xs truncate">{user.email}</p>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
        {(editing ? roles : user.roles || ["user"]).map((r) => {
          const cfg = ROLE_CONFIG[r] || { label: r, color: "#6b7280" };
          return (
            <span
              key={r}
              className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
              style={{ color: cfg.color, background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
              {cfg.label}
            </span>
          );
        })}
      </div>
      {!isSA && (
        <div className="shrink-0">
          {editing ? (
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-2">
                {["manager", "admin"].map((role) => (
                  <button
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border transition-all ${
                      roles.includes(role)
                        ? "border-green-500 bg-green-500/10 text-green-400"
                        : "border-gray-700 text-gray-500 hover:border-gray-600"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
              {error && <p className="text-red-400 text-[10px]">{error}</p>}
              <div className="flex gap-1.5">
                <button
                  onClick={() => { setEditing(false); setRoles(user.roles || ["user"]); setError(""); }}
                  className="px-2.5 py-1 rounded bg-gray-800 text-gray-400 text-[10px] font-bold hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="px-2.5 py-1 rounded bg-green-600 text-white text-[10px] font-black disabled:opacity-60 hover:bg-green-500"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:bg-gray-700 hover:text-white transition-all"
            >
              Edit Roles
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Feature Access ──────────────────────────────────────────── */

// 3-state toggle: null = default, true = force on, false = force off
function OverridePill({ value, onSet }) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-700 text-[9px] font-black uppercase tracking-widest shrink-0">
      {[
        { v: null,  label: "—",  active: value === null,  cls: "bg-gray-800 text-gray-500 hover:bg-gray-700" },
        { v: true,  label: "ON", active: value === true,  cls: "bg-green-900/40 text-green-400 border-l border-gray-700 hover:bg-green-900/60" },
        { v: false, label: "OFF",active: value === false, cls: "bg-red-900/40 text-red-400 border-l border-gray-700 hover:bg-red-900/60" },
      ].map(({ v, label, active, cls }) => (
        <button
          key={String(v)}
          onClick={() => onSet(v)}
          className={`px-2 py-1 transition-all ${cls} ${active ? "ring-1 ring-inset ring-white/20 brightness-125" : ""}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function FeatureRow({ feature, onUpdate }) {
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const userOverrides = feature.userOverrides || {};
  const overrideCount = Object.keys(userOverrides).length;

  const handleRoleOverride = async (role, value) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/rights/features/${feature.featureKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleOverrides: { [role]: value } }),
      });
      if (res.ok) {
        const data = await res.json();
        onUpdate(feature.featureKey, data);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDefaultToggle = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/rights/features/${feature.featureKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultEnabled: !feature.defaultEnabled }),
      });
      if (res.ok) {
        const data = await res.json();
        onUpdate(feature.featureKey, data);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUserOverride = async (email, value) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/rights/features/${feature.featureKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userOverrides: { [email]: value } }),
      });
      if (res.ok) {
        const data = await res.json();
        onUpdate(feature.featureKey, data);
      }
    } finally {
      setSaving(false);
    }
  };

  const searchUsers = async (q) => {
    setUserSearch(q);
    if (q.length < 2) { setUserResults([]); return; }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/admin/rights/users?search=${encodeURIComponent(q)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setUserResults(data.users || []);
      }
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className={`border-b border-gray-800/40 transition-all ${saving ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-gray-900/30 transition-all">
        {/* Label + default state */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button onClick={handleDefaultToggle} className="shrink-0">
            {feature.defaultEnabled
              ? <FaToggleOn className="text-green-500" size={16} />
              : <FaToggleOff className="text-gray-600" size={16} />}
          </button>
          <div className="min-w-0">
            <p className="text-white text-xs font-bold truncate">{feature.label}</p>
            <p className="text-gray-600 text-[9px] uppercase tracking-widest">{feature.section}</p>
          </div>
        </div>

        {/* Per-role overrides */}
        <div className="flex items-center gap-2 flex-wrap">
          {["admin", "manager", "user"].map((role) => {
            const cfg = ROLE_CONFIG[role];
            const current = feature.roleOverrides?.[role] ?? null;
            return (
              <div key={role} className="flex items-center gap-1">
                <span className="text-[8px] font-black uppercase tracking-widest w-10 text-right" style={{ color: cfg.color }}>
                  {cfg.label}
                </span>
                <OverridePill value={current === undefined ? null : current} onSet={(v) => handleRoleOverride(role, v)} />
              </div>
            );
          })}
        </div>

        {/* User overrides expand button */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-gray-700 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:border-gray-600 transition-all"
        >
          <FaUsers size={9} />
          {overrideCount > 0 && <span className="text-purple-400">{overrideCount}</span>}
          <FaChevronDown
            size={8}
            className="transition-transform"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>
      </div>

      {/* Expanded user overrides section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-3 bg-gray-900/40 border-t border-gray-800/30">
              <p className="text-[9px] font-black uppercase tracking-widest text-purple-400 mb-2">User Overrides</p>

              {/* Existing overrides as removable pills */}
              {overrideCount > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {Object.entries(userOverrides).map(([email, val]) => (
                    <span
                      key={email}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold border ${
                        val ? "bg-green-900/20 text-green-400 border-green-800/40" : "bg-red-900/20 text-red-400 border-red-800/40"
                      }`}
                    >
                      {email} — {val ? "ON" : "OFF"}
                      <button
                        onClick={() => handleUserOverride(email, null)}
                        className="ml-0.5 hover:text-white transition-colors"
                      >
                        <FaTimes size={8} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Search to add user override */}
              <div className="relative">
                <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600" size={10} />
                <input
                  type="text"
                  placeholder="Search user by name or email..."
                  value={userSearch}
                  onChange={(e) => searchUsers(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              {searchLoading && <p className="text-[10px] text-gray-500 mt-1">Searching...</p>}
              {userResults.length > 0 && (
                <div className="mt-2 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                  {userResults.map((u) => (
                    <div key={u._id} className="flex items-center justify-between px-3 py-2 border-b border-gray-700/50 last:border-0 hover:bg-gray-700/30">
                      <div>
                        <p className="text-xs text-white font-bold">{u.name}</p>
                        <p className="text-[10px] text-gray-500">{u.email}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => { handleUserOverride(u.email, true); setUserSearch(""); setUserResults([]); }}
                          className="px-2 py-0.5 rounded text-[9px] font-black bg-green-900/30 text-green-400 border border-green-800/40 hover:bg-green-900/50"
                        >
                          ON
                        </button>
                        <button
                          onClick={() => { handleUserOverride(u.email, false); setUserSearch(""); setUserResults([]); }}
                          className="px-2 py-0.5 rounded text-[9px] font-black bg-red-900/30 text-red-400 border border-red-800/40 hover:bg-red-900/50"
                        >
                          OFF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabAccordion({ tabName, features, onUpdate }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden mb-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-900/60 hover:bg-gray-900 transition-all"
      >
        <span className="text-xs font-black uppercase tracking-widest text-gray-400">{tabName}</span>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-gray-600 font-bold">{features.length} features</span>
          <FaChevronDown
            size={10}
            className="text-gray-600 transition-transform"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {features.map((f) => (
              <FeatureRow key={f.featureKey} feature={f} onUpdate={onUpdate} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FeaturesPanel() {
  const [grouped, setGrouped] = useState({});
  const [activeTier, setActiveTier] = useState("admin");
  const [loading, setLoading] = useState(true);

  const fetchFeatures = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/rights/features");
      if (res.ok) {
        const data = await res.json();
        setGrouped(data.grouped || {});
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFeatures(); }, [fetchFeatures]);

  const handleUpdate = (featureKey, updated) => {
    setGrouped((prev) => {
      const next = { ...prev };
      for (const tier of Object.keys(next)) {
        for (const tab of Object.keys(next[tier])) {
          next[tier][tab] = next[tier][tab].map((f) =>
            f.featureKey === featureKey ? { ...f, ...updated } : f
          );
        }
      }
      return next;
    });
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <FaSpinner className="text-green-500 animate-spin" size={20} />
    </div>
  );

  const tierTabs = TIER_ORDER.filter((t) => grouped[t]);
  const currentTabs = grouped[activeTier] || {};

  return (
    <div>
      {/* Tier selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tierTabs.map((tier) => {
          const cfg = TIER_COLORS[tier];
          const isActive = tier === activeTier;
          const count = Object.values(grouped[tier] || {}).flat().length;
          return (
            <button
              key={tier}
              onClick={() => setActiveTier(tier)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest transition-all"
              style={isActive
                ? { color: cfg.color, borderColor: `${cfg.color}60`, background: `${cfg.color}15` }
                : { color: "#4b5563", borderColor: "#374151", background: "transparent" }
              }
            >
              {cfg.label}
              <span className="text-[9px]">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 px-1">
        <div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-bold uppercase tracking-widest">
          <FaToggleOn className="text-green-500" size={12} /> Default toggle
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-bold uppercase tracking-widest">
          <span className="text-gray-400">—</span> No override
          <span className="text-green-400 ml-1">ON</span> Force on
          <span className="text-red-400 ml-1">OFF</span> Force off
        </div>
      </div>

      {/* Tab accordions */}
      {Object.entries(currentTabs).map(([tabName, features]) => (
        <TabAccordion key={tabName} tabName={tabName} features={features} onUpdate={handleUpdate} />
      ))}

      {Object.keys(currentTabs).length === 0 && (
        <p className="text-gray-600 text-sm text-center py-12">No features in this tier.</p>
      )}
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */

export default function RightsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 20;

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated" && !isSuperAdmin(session.user.email)) {
      router.push("/");
    }
  }, [status, session, router]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/rights/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
      );
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    if (status === "authenticated" && isSuperAdmin(session?.user?.email)) {
      fetchUsers();
    }
  }, [fetchUsers, status, session]);

  const handleRolesUpdate = (userId, newRoles) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, roles: newRoles } : u))
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <FaSpinner className="text-green-500 animate-spin" size={24} />
      </div>
    );
  }

  if (!isSuperAdmin(session?.user?.email)) return null;

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-950 pt-28 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <FaUserShield className="text-yellow-400" size={22} />
            <h1
              className="text-2xl font-black uppercase tracking-widest text-white"
              style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
            >
              Rights Management
            </h1>
          </div>
          <p className="text-gray-500 text-xs uppercase tracking-widest">
            Super Admin Only — Manage users & feature access
          </p>
        </motion.div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "users",    label: "Interface Access", icon: FaUsers,      color: "#22c55e" },
            { key: "features", label: "Feature Access",   icon: FaLock,       color: "#a855f7" },
          ].map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all"
              style={activeTab === key
                ? { color, borderColor: `${color}60`, background: `${color}15` }
                : { color: "#4b5563", borderColor: "#374151", background: "transparent" }
              }
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>

        {/* Tab description */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 mb-8">
          {activeTab === "users" ? (
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="text-white font-bold">Granting a role gives access to that entire interface.</span>{" "}
              Users with <span className="text-orange-400 font-bold">Admin</span> can access{" "}
              <span className="text-orange-400">/admin/*</span>, users with{" "}
              <span className="text-blue-400 font-bold">Manager</span> can access{" "}
              <span className="text-blue-400">/manager/*</span>. Toggle specific features within each interface in the Feature Access tab.
            </p>
          ) : (
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="text-white font-bold">Control granular features per role or per user.</span>{" "}
              Override the default state for any role, or expand a feature to set user-specific overrides. User overrides take highest priority.
            </p>
          )}
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Total Users", value: total,                                                           icon: FaUsers,      color: "#22c55e" },
                { label: "Managers",    value: users.filter((u) => u.roles?.includes("manager")).length,        icon: FaUsers,      color: "#3b82f6" },
                { label: "Admins",      value: users.filter((u) => u.roles?.includes("admin")).length,          icon: FaUserShield, color: "#f97316" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={12} style={{ color }} />
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>{label}</p>
                  </div>
                  <p className="text-2xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={12} />
              <input
                type="text"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50"
              />
            </div>

            {/* User table */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-800">
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">{total} Users</p>
              </div>
              {users.length === 0 ? (
                <div className="py-12 text-center text-gray-600 text-sm">No users found.</div>
              ) : (
                users.map((user) => (
                  <UserRow key={user._id} user={user} onRolesUpdate={handleRolesUpdate} />
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-gray-700 transition-all"
                >
                  <FaChevronLeft size={10} /> Prev
                </button>
                <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-gray-700 transition-all"
                >
                  Next <FaChevronRight size={10} />
                </button>
              </div>
            )}
          </>
        )}

        {/* Features Tab */}
        {activeTab === "features" && <FeaturesPanel />}
      </div>
    </div>
  );
}
