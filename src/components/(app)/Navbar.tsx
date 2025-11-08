"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// import { toastError } from "@/utils/index.utils";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
  const router = useRouter();

  const [theme, setTheme] = useState(false);

  const handleTheme = () => {
    setTheme((prev) => !prev);
    const next = theme ? "light" : "dark";
    localStorage.setItem("theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (!saved) {
      localStorage.setItem("theme", "dark");
      setTheme(false);
      document.documentElement.classList.add("dark");
      return;
    }
    if (saved === "light") {
      setTheme(true);
      document.documentElement.classList.remove("dark");
      return;
    }
    setTheme(false);
    document.documentElement.classList.add("dark");
  }, []);

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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-(--border) bg-(--navbar-bg) backdrop-blur-2xl">
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Navbar */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleToggleSidebar}
              variant="outline"
              size="icon"
              className="md:pointer-events-none"
              aria-label="Open sidebar"
            >
              <Image
                src="/images/tokens/3d_token_nobg.png"
                width={28}
                height={28}
                alt="Logo Icon"
                className="w-7 h-7 object-contain"
                unoptimized
              />
            </Button>
            <h1 className="text-sm md:text-base font-semibold">
              Decode Protocol
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {theme && (
              <Button
                onClick={handleTheme}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <FontAwesomeIcon icon={faMoon} className="w-4 h-4" />
                Dark Mode
              </Button>
            )}
            {!theme && (
              <Button
                onClick={handleTheme}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <FontAwesomeIcon icon={faSun} className="w-4 h-4" />
                Light Mode
              </Button>
            )}

            <Button
              onClick={handleLogout}
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
