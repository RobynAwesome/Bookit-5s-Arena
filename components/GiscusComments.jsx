"use client";

import { useEffect, useRef } from "react";

export default function GiscusComments() {
  const ref = useRef(null);
  const [giscusReady, setGiscusReady] = useEffect(() => {
    // Check for required environment variables
    const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
    const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

    if (
      !repoId ||
      !categoryId ||
      repoId.includes("YOUR_") ||
      categoryId.includes("YOUR_")
    ) {
      console.warn(
        "⚠️ Giscus comments disabled: Missing or placeholder environment variables. Configure NEXT_PUBLIC_GISCUS_REPO_ID and NEXT_PUBLIC_GISCUS_CATEGORY_ID.",
      );
      return false;
    }
    return true;
  }, []);

  useEffect(() => {
    if (!ref.current || ref.current.hasChildNodes() || !giscusReady) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute(
      "data-repo",
      "KholofeloRobynRababalela/bookit-5s-arena",
    );
    script.setAttribute(
      "data-repo-id",
      process.env.NEXT_PUBLIC_GISCUS_REPO_ID || "",
    );
    script.setAttribute("data-category", "General");
    script.setAttribute(
      "data-category-id",
      process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || "",
    );
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", "transparent_dark");
    script.setAttribute("data-lang", "en");
    script.crossOrigin = "anonymous";
    script.async = true;

    ref.current.appendChild(script);
  }, [giscusReady]);

  if (!giscusReady) {
    return (
      <div className="mx-auto mt-12 mb-8 min-h-62.5 w-full max-w-4xl rounded-2xl border border-red-900/30 bg-gray-900 p-6 shadow-xl">
        <h3
          className="mb-6 border-b border-gray-800 pb-3 text-xl font-black tracking-widest text-white uppercase"
          style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
        >
          Fan <span className="text-red-400">Zone</span>
        </h3>
        <p className="text-sm text-gray-400">
          Comments are currently unavailable. Please configure Giscus with your
          GitHub repository details.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-12 mb-8 w-full max-w-4xl rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-xl">
      <h3
        className="mb-6 border-b border-gray-800 pb-3 text-xl font-black tracking-widest text-white uppercase"
        style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
      >
        Fan <span className="text-green-400">Zone</span>
      </h3>
      <div ref={ref} className="giscus-frame-container min-h-62.5" />
    </div>
  );
}
