"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toastError } from "@/utils/index.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
  const router = useRouter();

  const [themeMode, setThemeMode] = useState(false);

  useEffect(() => {
    const storedThemeMode = localStorage.getItem("themeMode");
    if (storedThemeMode) {
      setThemeMode(JSON.parse(storedThemeMode));
    } else {
      setThemeMode(false);
    }
  }, []);

  const handleTheme = () => {
    setThemeMode(prevThemeMode => !prevThemeMode);
    localStorage.setItem(
      "themeMode",
      themeMode.toString()
    );
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
        toastError(data.message || "Logout failed");
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
      toastError("Logout failed. Please try again.");
    } finally {
      console.log("Logout operation completed");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-2xl">
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Navbar */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 border border-white/20 rounded-lg p-1.5 backdrop-blur-sm">
              <Image
                src="/images/tokens/3d_token_nobg.png"
                width={28}
                height={28}
                alt="Logo Icon"
                className="w-7 h-7"
                unoptimized
              />
            </div>
            <h1 className="text-sm md:text-base font-semibold text-white">
              Decode Protocol
            </h1>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center flex-1 max-w-xl mx-6">
            <input
              type="text"
              placeholder="Search settings, security, devices..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
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
