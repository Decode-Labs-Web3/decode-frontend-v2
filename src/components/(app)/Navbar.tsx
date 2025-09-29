"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// import { toastError } from "@/utils/index.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
  const router = useRouter();

  const [themeMode, setThemeMode] = useState(false);

  // Initialize theme from storage or system preference
  useEffect(() => {
    try {
      const storedThemeMode = localStorage.getItem("themeMode");
      let isDark = false;
      if (storedThemeMode !== null) {
        isDark = JSON.parse(storedThemeMode) === true;
      } else if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        isDark = true;
      }
      setThemeMode(isDark);
      document.documentElement.setAttribute(
        "data-theme",
        isDark ? "dark" : "light"
      );
    } catch {
      // ignore
    }
  }, []);

  const handleTheme = () => {
    setThemeMode((prevThemeMode) => {
      const next = !prevThemeMode;
      try {
        localStorage.setItem("themeMode", JSON.stringify(next));
      } catch {
        // ignore
      }
      document.documentElement.setAttribute(
        "data-theme",
        next ? "dark" : "light"
      );
      return next;
    });
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Frontend-Internal-Request": "true",
        },
        credentials: "include",
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      const data = await response.json();
      console.log("Logout response:", data);
      if (data.success && data.statusCode === 200) {
        router.push("/");
      } else {
        console.log("Logout failed:", data.message);
        // toastError(data.message || "Logout failed");
        router.push("/");
      }
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        (error.name === "AbortError" || error.name === "TimeoutError")
      ) {
        console.error("Request timeout/aborted");
      } else {
        console.error(error);
      }
      // toastError("Logout failed. Please try again.");
    } finally {
      console.log("Logout operation completed");
    }
  };

  const handleToggleSidebar = () => {
    try {
      window.dispatchEvent(new CustomEvent("toggle-sidebar"));
    } catch {
      // ignore
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--navbar-bg)] backdrop-blur-2xl">
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Navbar */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSidebar}
              className="bg-[color:var(--surface-muted)] border border-[color:var(--border)] rounded-lg p-1.5 backdrop-blur-sm md:pointer-events-none"
              aria-label="Open sidebar"
            >
              <Image
                src="/images/tokens/3d_token_nobg.png"
                width={28}
                height={28}
                alt="Logo Icon"
                className="w-7 h-7"
                unoptimized
              />
            </button>
            <h1 className="text-sm md:text-base font-semibold">
              Decode Protocol
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {themeMode && (
              <button
                onClick={handleTheme}
                className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors"
              >
                Dark Mode <FontAwesomeIcon icon={faMoon} className="w-4 h-4" />
              </button>
            )}
            {!themeMode && (
              <button
                onClick={handleTheme}
                className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors"
              >
                Light Mode <FontAwesomeIcon icon={faSun} className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors"
            >
              Logout{" "}
              <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
