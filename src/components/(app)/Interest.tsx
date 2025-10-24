"use client";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    <Dialog open={true} onOpenChange={() => onCloseAction?.()}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Select at least 3 interests
            <Badge variant="secondary" className="text-xs">
              {value.length}/{INTERESTS.length}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Choose your interests to personalize your experience
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="max-h-80 overflow-auto">
          <ul className="space-y-1">
            {INTERESTS.map((interest) => {
              const selected = value.includes(interest);
              return (
                <li key={interest}>
                  <Button
                    type="button"
                    onClick={() => toggle(interest)}
                    variant={selected ? "default" : "ghost"}
                    className="w-full justify-start text-left h-auto py-3 px-4"
                    aria-pressed={selected}
                  >
                    {formatLabel(interest)}
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            onClick={onCloseAction}
            disabled={!onCloseAction}
            variant="outline"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
