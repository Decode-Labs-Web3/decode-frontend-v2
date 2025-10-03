"use client";
import { useEffect, useRef } from "react";

export const INTERESTS = [
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
  "startups",
  "tech_innovation",
  "entrepreneurship",
  "freelancing",
  "open_source",
  "research_learning",
  "coding_development",
  "music",
  "anime_manga",
  "esports",
  "fitness",
  "sport",
  "movies",
  "travel",
  "food_cooking",
  "fashion_style",
  "investing",
  "trading",
  "crypto_arbitrage",
  "personal_finance",
  "global_economy",
  "ai",
  "sustainability",
  "other",
] as const;

export type Interest = (typeof INTERESTS)[number];

export default function InterestModal({
  value,
  onChangeAction,
  onCloseAction,
}: {
  value: Interest[];
  onChangeAction: (v: Interest[]) => void;
  onCloseAction?: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const toFocus = panelRef.current?.querySelector<HTMLElement>(
      "input, button, [href], select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    toFocus?.focus();

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const toggle = (opt: Interest) => {
    const exists = value.includes(opt);
    if (exists) {
      onChangeAction(value.filter((v) => v !== opt));
    } else {
      onChangeAction([...value, opt]);
    }
  };

  const formatLabel = (txt: string) =>
    txt.charAt(0).toUpperCase() + txt.slice(1).replace(/_/g, " ");

  return (
    <div
      id="interest-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="interest-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/60" />

      {/* Modal Panel */}
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-950 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <h2
            id="interest-dialog-title"
            className="text-sm font-medium text-zinc-100"
          >
            Select at least 3 interests
          </h2>
          <span className="text-xs text-zinc-400">
            {value.length}/{INTERESTS.length}
          </span>
        </div>

        {/* Content */}
        <div className="max-h-80 overflow-auto">
          <ul className="divide-y divide-zinc-800">
            {INTERESTS.map((interest) => {
              const selected = value.includes(interest);
              return (
                <li key={interest}>
                  <button
                    type="button"
                    onClick={() => toggle(interest)}
                    className={[
                      "w-full px-4 py-3 text-left text-sm",
                      selected
                        ? "bg-white text-black"
                        : "text-zinc-200 hover:bg-zinc-900",
                    ].join(" ")}
                    aria-pressed={selected}
                  >
                    {formatLabel(interest)}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-zinc-800 px-4 py-3">
          <button
            type="button"
            onClick={onCloseAction}
            disabled={!onCloseAction}
            className={[
              "rounded-lg border border-zinc-700 px-3 py-2 text-sm",
              onCloseAction
                ? "text-zinc-100 hover:bg-zinc-800"
                : "opacity-50 cursor-not-allowed text-zinc-400",
            ].join(" ")}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
