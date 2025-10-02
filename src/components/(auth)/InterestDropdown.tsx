"use client";
import { useEffect, useMemo, useRef, useState } from "react";

export const INTERESTS = [
  // 🌐 Web3 & Communities
  "networking",
  "creator_economy",
  "social_tokens",
  "community_building",
  "online_gaming",
  "digital_collectibles",
  "metaverse",
  "memes",
  "defi",
  "dao",
  "security",

  // 💼 Career & Growth
  "startups",
  "tech_innovation",
  "entrepreneurship",
  "freelancing",
  "open_source",
  "research_learning",
  "coding_development",

  // 🎨 Lifestyle & Hobbies
  "music",
  "anime_manga",
  "esports",
  "fitness",
  "sport",
  "movies",
  "travel",
  "food_cooking",
  "fashion_style",

  // 📈 Finance & Future
  "investing",
  "trading",
  "crypto_arbitrage",
  "personal_finance",
  "global_economy",
  "ai",
  "sustainability",
] as const;

export type Interest = (typeof INTERESTS)[number];

export default function InterestDropdown({
  value,
  onChange,
}: {
  value: Interest[];
  onChange: (v: Interest[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const maxed = value.length >= 3;

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const toggle = (opt: Interest) => {
    const exists = value.includes(opt);
    if (exists) {
      onChange(value.filter((v) => v !== opt));
    } else {
      if (value.length >= 3) return; // cứng tối đa 3
      onChange([...value, opt]);
    }
  };

  const pill = (txt: string) =>
    txt.charAt(0).toUpperCase() + txt.slice(1).replace(/_/g, " ");

  const buttonLabel = useMemo(() => {
    if (value.length === 0) return "Select (3)";
    return value.map(pill).join(", ");
  }, [value]);

  return (
    <div className="mb-4 relative" ref={ref}>
      {/* Nút mở dropdown */}
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-left text-sm text-zinc-100 hover:bg-zinc-800"
      >
        {buttonLabel}
      </button>

      {/* Danh sách lựa chọn */}
      {open && (
        <div className="absolute z-50 mt-2 max-h-64 w-full overflow-auto rounded-lg border border-zinc-700 bg-black shadow-lg">
          <ul className="divide-y divide-zinc-800">
            {INTERESTS.map((opt) => {
              const selected = value.includes(opt);
              const disabled = !selected && maxed;
              return (
                <li key={opt}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => toggle(opt)}
                    className={[
                      "w-full px-3 py-2 text-sm text-left",
                      selected
                        ? "bg-white text-black"
                        : "text-zinc-200 hover:bg-zinc-900",
                      disabled ? "opacity-40 cursor-not-allowed" : "",
                    ].join(" ")}
                    aria-pressed={selected}
                    aria-disabled={disabled}
                  >
                    {pill(opt)}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
