import { useState } from "react";
import { motion } from "framer-motion";

/**
 * ScavengerLogo — Huge, centered, interactive logo for scavenger hunt.
 * Props:
 *   id: unique string for this logo location (e.g. 'manager', 'home', 'profile')
 *   onFound: callback when found (optional)
 *   disabled: if true, not clickable
 *   size: px size (default 320)
 */
export default function ScavengerLogo({
  id,
  onFound,
  disabled = false,
  size = 320,
}) {
  const [spinning, setSpinning] = useState(false);
  const [found, setFound] = useState(
    typeof window !== "undefined" &&
      localStorage.getItem(`logo_found_${id}`) === "1",
  );

  const handleClick = () => {
    if (disabled || spinning || found) return;
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
      setFound(true);
      if (typeof window !== "undefined") {
        localStorage.setItem(`logo_found_${id}`, "1");
      }
      if (onFound) onFound();
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full my-8 select-none">
      <motion.img
        src="/images/logo.png"
        alt="Bookit 5s Arena Logo"
        className="drop-shadow-[0_0_60px_rgba(34,197,94,0.25)] rounded-full cursor-pointer"
        style={{ width: size, height: size, background: "none" }}
        animate={spinning ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        onClick={handleClick}
        draggable={false}
      />
      {found && (
        <span className="mt-2 text-green-400 font-black uppercase tracking-widest text-xs">
          Found!
        </span>
      )}
    </div>
  );
}
