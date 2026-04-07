"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";

const FeatureContext = createContext({});

/**
 * Wrap your app (or layout) with this provider to cache feature flags once
 * per session. Individual components call useFeatureAccess(key) → boolean.
 */
export function FeatureAccessProvider({ children }) {
  const { data: session, status } = useSession();
  const [features, setFeatures] = useState({});
  const fetchedRef = useRef(false);

  const fetchFeatures = useCallback(async () => {
    try {
      const res = await fetch("/api/user/features");
      if (res.ok) setFeatures(await res.json());
    } catch {}
  }, []);

  const prevRoleRef = useRef(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    const currentRole = session?.user?.activeRole;
    const roleChanged = prevRoleRef.current !== null && prevRoleRef.current !== currentRole;
    prevRoleRef.current = currentRole;

    // Fetch on first auth or when active role actually changes
    if (!fetchedRef.current || roleChanged) {
      fetchedRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchFeatures();
    }
  }, [status, session?.user?.activeRole, fetchFeatures]);

  return (
    <FeatureContext.Provider value={features}>
      {children}
    </FeatureContext.Provider>
  );
}

/**
 * Returns true if the feature is enabled for the current user/role.
 * Falls back to true for unknown features (fail open).
 *
 * @param {string} featureKey — e.g. "admin.bookings.export"
 * @returns {boolean}
 */
export function useFeatureAccess(featureKey) {
  const features = useContext(FeatureContext);
  // If features haven't loaded yet or key is unknown, default to true (non-blocking)
  if (!(featureKey in features)) return true;
  return features[featureKey];
}
