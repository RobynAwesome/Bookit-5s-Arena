"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { getProviders, signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import { FaGoogle, FaLock, FaSignInAlt, FaTrophy, FaUserPlus } from "react-icons/fa";

function AuthPageInner() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const recaptchaRef = useRef(null);
  const recaptchaSiteKey =
    typeof process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY === "string"
      ? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY.trim()
      : "";

  const [mode, setMode] = useState(
    searchParams.get("mode") === "register" ? "register" : "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      const callbackUrl = searchParams.get("callbackUrl");
      router.replace(callbackUrl || "/role-select");
    }
  }, [router, searchParams, status]);

  useEffect(() => {
    let cancelled = false;

    getProviders()
      .then((providers) => {
        if (!cancelled) setGoogleEnabled(Boolean(providers?.google));
      })
      .catch(() => {
        if (!cancelled) setGoogleEnabled(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const resetVerification = () => {
    recaptchaRef.current?.reset();
    setRecaptchaToken("");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      router.push(searchParams.get("callbackUrl") || "/role-select");
      router.refresh();
    } catch {
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (recaptchaSiteKey && !recaptchaToken) {
      setError("Please complete the verification check.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, recaptchaToken }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed.");
        resetVerification();
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      router.push(searchParams.get("callbackUrl") || "/role-select");
      router.refresh();
    } catch {
      setError("Unable to create the account right now. Please try again.");
      resetVerification();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", {
      callbackUrl: searchParams.get("callbackUrl") || "/role-select",
    });
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-14 text-white sm:px-6">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2 lg:items-center">
        <section className="rounded-[2rem] border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-950 to-black p-7 sm:p-9">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-green-400">
            Account access
          </p>
          <h1 className="mt-4 text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl">
            Sign in to the arena.
          </h1>
          <p className="mt-5 text-sm leading-7 text-gray-400 sm:text-base">
            Account access is for current 5s Arena features such as booking history and role-based
            tools. Authentication does not imply that a court, league, event, price, or competition
            is currently available; those states must be confirmed by their own source.
          </p>

          <div data-tournament-state="archive" aria-label="World Cup 5s 2026 archive notice" className="mt-7 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
            <div className="flex items-center gap-3 text-yellow-300">
              <FaTrophy />
              <p className="text-xs font-black uppercase tracking-widest">World Cup 5s 2026</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-400">
              The 29–31 May 2026 tournament is historical. Registration closed 22 May 2026; this
              login page no longer advertises entry fees, prize claims, or team signup as current.
            </p>
            <Link
              href="/tournament"
              className="mt-4 inline-flex text-xs font-black uppercase tracking-widest text-yellow-300 hover:text-yellow-200"
            >
              Open tournament archive →
            </Link>
          </div>
        </section>

        <section className="rounded-[2rem] border border-gray-800 bg-gray-900/80 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="mb-7 flex rounded-xl border border-gray-800 bg-gray-950 p-1">
            {[
              { key: "login", label: "Sign In", icon: FaSignInAlt },
              { key: "register", label: "Register", icon: FaUserPlus },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setMode(key);
                  setError("");
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-3 text-xs font-black uppercase tracking-widest transition ${
                  mode === key
                    ? "bg-green-600 text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <Icon size={11} /> {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-800/50 bg-red-950/40 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {googleEnabled && (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3.5 text-sm font-black uppercase tracking-widest text-gray-900 transition hover:bg-gray-100 disabled:opacity-50"
              >
                <FaGoogle className="text-red-500" />
                {googleLoading ? "Opening Google..." : "Continue with Google"}
              </button>
              <div className="my-5 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-700">
                <span className="h-px flex-1 bg-gray-800" /> or <span className="h-px flex-1 bg-gray-800" />
              </div>
            </>
          )}

          <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
            {mode === "register" && (
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">
                Name
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-green-500"
                />
              </label>
            )}

            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-green-500"
              />
            </label>

            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">
              Password
              <input
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-green-500"
              />
            </label>

            {mode === "register" && (
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">
                Confirm Password
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-green-500"
                />
              </label>
            )}

            {mode === "register" && recaptchaSiteKey && (
              <div className="overflow-hidden rounded-xl bg-white p-2">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={recaptchaSiteKey}
                  onChange={(token) => setRecaptchaToken(token || "")}
                  onExpired={() => setRecaptchaToken("")}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:bg-green-500 disabled:opacity-50"
            >
              <FaLock size={11} />
              {loading
                ? "Working..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-[10px] leading-5 text-gray-600">
            Account creation is not a reservation. Current booking and competition states are
            validated separately.
          </p>
        </section>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
      <AuthPageInner />
    </Suspense>
  );
}
