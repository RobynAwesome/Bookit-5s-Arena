"use client";

import { usePathname } from "next/navigation";
import BottomNavbar from "@/components/BottomNavbar";
import SoccerBallMenu from "@/components/SoccerBallMenu";

/**
 * The Arena Chronicle owns homepage chapter navigation and booking entry.
 * Other routes keep the existing global mobile/navigation affordances.
 * This avoids stacking three floating control systems over the same viewport.
 */
export default function ContextualFloatingNavigation() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <>
      <SoccerBallMenu />
      <BottomNavbar />
    </>
  );
}
