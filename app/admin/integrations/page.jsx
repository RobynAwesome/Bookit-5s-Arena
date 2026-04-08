"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  FaBasketballBall,
  FaBolt,
  FaBroadcastTower,
  FaCheckCircle,
  FaCloud,
  FaExternalLinkAlt,
  FaGlobeAfrica,
  FaPlus,
  FaSearch,
  FaSyncAlt,
  FaTrash,
  FaVideo,
} from "react-icons/fa";
import { motion } from "framer-motion";

function StatusBadge({ status }) {
  const styles = {
    ok: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    degraded: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    unconfigured: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
    missing: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${styles[status] || styles.missing}`}
    >
      {status || "unknown"}
    </span>
  );
}

export default function AdminIntegrationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [health, setHealth] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    searchQuery: "",
    teamFocus: "",
    priority: "100",
  });

  async function loadPageData() {
    setLoading(true);
    setError("");

    try {
      const [healthResponse, channelsResponse] = await Promise.all([
        fetch("/api/admin/integrations/health", { cache: "no-store" }),
        fetch("/api/admin/media/reactors", { cache: "no-store" }),
      ]);

      const healthPayload = await healthResponse.json();
      const channelsPayload = await channelsResponse.json();

      if (!healthResponse.ok) {
        throw new Error(healthPayload.error || "Failed to load integrations health");
      }

      if (!channelsResponse.ok) {
        throw new Error(channelsPayload.error || "Failed to load reactor channels");
      }

      setHealth(healthPayload);
      setChannels(channelsPayload.channels || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session.user.activeRole !== "admin") {
      router.push("/");
      return;
    }

    if (status === "authenticated") {
      loadPageData();
    }
  }, [status, session, router]);

  async function handleCreateChannel(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/media/reactors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          searchQuery: form.searchQuery,
          teamFocus: form.teamFocus
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean),
          priority: Number(form.priority),
          enabled: true,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to create channel");
      }

      setForm({
        name: "",
        slug: "",
        searchQuery: "",
        teamFocus: "",
        priority: "100",
      });
      await loadPageData();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleChannel(channel) {
    if (!channel._id) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/media/reactors/${channel._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !channel.enabled }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to update channel");
      }

      await loadPageData();
    } catch (toggleError) {
      setError(toggleError.message);
    }
  }

  async function handleDeleteChannel(channel) {
    if (!channel._id) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/media/reactors/${channel._id}`, {
        method: "DELETE",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to delete channel");
      }

      await loadPageData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  if (loading || !health) {
    return (
      <div className="min-h-screen bg-gray-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl rounded-3xl border border-gray-800 bg-gray-900 p-8 text-center text-sm text-gray-400">
          Loading integrations…
        </div>
      </div>
    );
  }

  const providerCards = [
    {
      title: "Core Auth",
      body: health.providers?.system?.auth,
      icon: <FaCheckCircle className="text-emerald-300" />,
    },
    {
      title: "MongoDB",
      body: health.providers?.system?.database,
      icon: <FaCloud className="text-green-300" />,
    },
    {
      title: "iSports",
      body: health.providers?.sports,
      icon: <FaBroadcastTower className="text-orange-300" />,
    },
    {
      title: "YouTube",
      body: health.providers?.youtube,
      icon: <FaVideo className="text-red-300" />,
    },
    {
      title: "AI Gateway",
      body: health.providers?.aiGateway,
      icon: <FaBolt className="text-violet-300" />,
    },
    {
      title: "Braintrust",
      body: health.providers?.braintrust,
      icon: <FaCheckCircle className="text-sky-300" />,
    },
    {
      title: "Mux",
      body: health.providers?.mux,
      icon: <FaVideo className="text-pink-300" />,
    },
    {
      title: "BallDontLie",
      body: health.providers?.balldontlie,
      icon: <FaBasketballBall className="text-amber-300" />,
    },
    {
      title: "Google Search74",
      body: health.providers?.googleSearch,
      icon: <FaSearch className="text-blue-300" />,
    },
    {
      title: "Weather",
      body: health.providers?.weather,
      icon: <FaGlobeAfrica className="text-cyan-300" />,
    },
    {
      title: "Vercel Sandbox",
      body: health.sandbox,
      icon: <FaCloud className="text-cyan-300" />,
    },
  ];

  return (
    <motion.div
      className="min-h-screen bg-gray-950 px-4 py-10 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest text-white">
              Integrations
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Provider health, runtime cache visibility, weather/search coverage, and curated reactor management.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadPageData}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-300 transition hover:border-gray-500 hover:text-white"
            >
              <FaSyncAlt size={11} />
              Refresh
            </button>
            <Link
              href="/admin/sandbox"
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-cyan-200 transition hover:border-cyan-400 hover:bg-cyan-500/20"
            >
              Sandbox Console
              <FaExternalLinkAlt size={11} />
            </Link>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {providerCards.map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-gray-800 bg-gray-900 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.25)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                    {card.title}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="text-2xl">{card.icon}</div>
                    <StatusBadge status={card.body?.status} />
                  </div>
                </div>
                {card.body?.configured || card.body?.hasToken || card.body?.hasOidcToken ? (
                  <FaCheckCircle className="text-emerald-400" />
                ) : null}
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                {card.body?.baseUrl ? <div>Base URL: {card.body.baseUrl}</div> : null}
                {card.body?.url ? <div>URL: {card.body.url}</div> : null}
                {card.body?.host ? <div>Host: {card.body.host}</div> : null}
                {card.body?.defaultModel ? <div>Default model: {card.body.defaultModel}</div> : null}
                {card.body?.modelCount !== undefined ? <div>Model count: {card.body.modelCount}</div> : null}
                {card.body?.sampleCount !== undefined ? <div>Sample count: {card.body.sampleCount}</div> : null}
                {card.body?.projectCount !== undefined ? <div>Projects: {card.body.projectCount}</div> : null}
                {card.body?.projectName ? <div>Project name: {card.body.projectName}</div> : null}
                {card.body?.projectId ? <div>Project: {card.body.projectId}</div> : null}
                {card.body?.teamId ? <div>Team: {card.body.teamId}</div> : null}
                {card.body?.assetCount !== undefined ? <div>Assets: {card.body.assetCount}</div> : null}
                {card.body?.hasSecret !== undefined ? <div>Secret: {card.body.hasSecret ? "present" : "missing"}</div> : null}
                {card.body?.authMode ? <div>Auth mode: {card.body.authMode}</div> : null}
                {card.body?.error ? <div className="text-amber-300">{card.body.error}</div> : null}
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-5">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
              Runtime Cache
            </div>
            <div className="mt-2 text-3xl font-black text-white">
              {health.runtimeCache?.totalEntries || 0}
            </div>
            <div className="mt-1 text-sm text-gray-400">cached adapter entries</div>

            <div className="mt-5 space-y-3">
              {(health.runtimeCache?.namespaces || []).map((namespace) => (
                <div
                  key={namespace.namespace}
                  className="rounded-2xl border border-gray-800 bg-gray-950/70 px-4 py-3 text-sm text-gray-300"
                >
                  <div className="font-semibold text-white">{namespace.namespace}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-500">
                    {namespace.entries} entries · next expiry {Math.round((namespace.nextExpiryMs || 0) / 1000)}s
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                  Curated Reactors
                </div>
                <h2 className="mt-2 text-2xl font-black text-white">
                  Approved channel registry
                </h2>
              </div>
              <div className="rounded-full border border-gray-700 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                {channels.length} channels
              </div>
            </div>

            <form onSubmit={handleCreateChannel} className="mt-5 grid gap-3 rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Channel name"
                  className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none transition focus:border-green-500"
                  required
                />
                <input
                  value={form.slug}
                  onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                  placeholder="slug"
                  className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none transition focus:border-green-500"
                  required
                />
              </div>
              <input
                value={form.searchQuery}
                onChange={(event) => setForm((current) => ({ ...current, searchQuery: event.target.value }))}
                placeholder="Search query"
                className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none transition focus:border-green-500"
              />
              <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                <input
                  value={form.teamFocus}
                  onChange={(event) => setForm((current) => ({ ...current, teamFocus: event.target.value }))}
                  placeholder="Team focus, comma-separated"
                  className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none transition focus:border-green-500"
                />
                <input
                  type="number"
                  min="1"
                  value={form.priority}
                  onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                  placeholder="Priority"
                  className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white outline-none transition focus:border-green-500"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaPlus size={11} />
                {saving ? "Saving…" : "Add Channel"}
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {channels.map((channel) => (
                <div
                  key={channel._id || channel.slug}
                  className="rounded-2xl border border-gray-800 bg-gray-950/70 px-4 py-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-bold text-white">{channel.name}</div>
                        <StatusBadge status={channel.enabled === false ? "missing" : "ok"} />
                      </div>
                      <div className="mt-1 text-sm text-gray-400">
                        {channel.searchQuery || "No search query saved"}
                      </div>
                      <div className="mt-2 text-xs uppercase tracking-[0.18em] text-gray-500">
                        {(channel.teamFocus || []).join(", ") || "General coverage"} · Priority {channel.priority ?? 100}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleToggleChannel(channel)}
                        disabled={!channel._id}
                        className="rounded-xl border border-gray-700 px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-300 transition hover:border-gray-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {channel.enabled === false ? "Enable" : "Disable"}
                      </button>
                      <button
                        onClick={() => handleDeleteChannel(channel)}
                        disabled={!channel._id}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 px-3 py-2 text-xs font-bold uppercase tracking-widest text-rose-200 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FaTrash size={11} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-5">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
              AI Gateway Models
            </div>
            <div className="mt-4 space-y-3">
              {(health.providers?.aiGateway?.models || []).map((model) => (
                <div
                  key={model.id}
                  className="rounded-2xl border border-gray-800 bg-gray-950/70 px-4 py-3 text-sm text-gray-300"
                >
                  <div className="font-semibold text-white">{model.id}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-500">
                    {model.ownedBy || "provider-managed"}
                  </div>
                </div>
              ))}
              {!(health.providers?.aiGateway?.models || []).length ? (
                <div className="rounded-2xl border border-gray-800 bg-gray-950/70 px-4 py-3 text-sm text-gray-500">
                  No AI Gateway model preview is available yet.
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-5">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
              Weather Locations
            </div>
            <div className="mt-4 space-y-3">
              {(health.providers?.weather?.locations || []).map((location) => (
                <div
                  key={location.slug}
                  className="rounded-2xl border border-gray-800 bg-gray-950/70 px-4 py-3 text-sm text-gray-300"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">{location.label}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-500">
                        {location.subtitle}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-white">
                        {location.temperature}°C
                      </div>
                      <div className="text-xs text-gray-500">{location.condition}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-5">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
              Search and Media Samples
            </div>
            <div className="mt-4 space-y-3">
              {(health.providers?.googleSearch?.sampleResults || []).map((result) => (
                <div
                  key={result.url}
                  className="rounded-2xl border border-gray-800 bg-gray-950/70 px-4 py-3 text-sm text-gray-300"
                >
                  <div className="font-semibold text-white">{result.title}</div>
                  <div className="mt-1 text-xs text-gray-500">{result.source || result.url}</div>
                </div>
              ))}
              {(health.providers?.mux?.assets || []).map((asset) => (
                <div
                  key={asset.id}
                  className="rounded-2xl border border-gray-800 bg-gray-950/70 px-4 py-3 text-sm text-gray-300"
                >
                  <div className="font-semibold text-white">Mux asset {asset.id}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-500">
                    {asset.status || "unknown"} · {Math.round(asset.duration || 0)}s
                  </div>
                </div>
              ))}
              {!((health.providers?.googleSearch?.sampleResults || []).length || (health.providers?.mux?.assets || []).length) ? (
                <div className="rounded-2xl border border-gray-800 bg-gray-950/70 px-4 py-3 text-sm text-gray-500">
                  Search and Mux previews will appear here once those providers respond.
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
