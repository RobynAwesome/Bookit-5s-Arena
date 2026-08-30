"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import BottomNavbar from "@/components/BottomNavbar";
import SoccerBallMenu from "@/components/SoccerBallMenu";

/**
 * The Arena Chronicle owns homepage chapter navigation and booking entry.
 * Other routes keep the existing global mobile/navigation affordances.
 * This avoids stacking three floating control systems over the same viewport.
 *
 * `/#courts` is a long-lived public deep link used across the repo. The new
 * reserve chapter has its own internal id, so this shell translates the legacy
 * hash into the governed reservation chapter without breaking old links.
 */
export default function ContextualFloatingNavigation() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/" || window.location.hash !== "#courts") return;

    const revealCourtChapter = () => {
      document.getElementById("arena-reserve")?.scrollIntoView({ block: "start" });
    };

    const frame = window.requestAnimationFrame(revealCourtChapter);
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  if (pathname === "/") return null;

  return (
    <>
      <SoccerBallMenu />
      <BottomNavbar />
    </>
  );
}
