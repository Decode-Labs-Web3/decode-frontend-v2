"use client";

type User = {
  name: string;
  username: string;
  bio: string;
  avatar: string;
};

const fakeUser: User = {
  name: "Alice Nguyen",
  username: "alice_dev",
  bio: "Frontend @ Decode • thích Web3, UI/UX, và cà phê sữa đá.",
  avatar:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=256&auto=format&fit=crop",
};

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

function useHoverDelay(openDelay = 250, closeDelay = 120) {
  const [open, setOpen] = useState(false);
  const tOpen = useRef<number | null>(null);
  const tClose = useRef<number | null>(null);

  const clearAll = () => {
    if (tOpen.current) { window.clearTimeout(tOpen.current); tOpen.current = null; }
    if (tClose.current) { window.clearTimeout(tClose.current); tClose.current = null; }
  };

  const onEnter = () => { clearAll(); tOpen.current = window.setTimeout(() => setOpen(true), openDelay); };
  const onLeave = () => { clearAll(); tClose.current = window.setTimeout(() => setOpen(false), closeDelay); };

  useEffect(() => clearAll, []);

  return { open, onEnter, onLeave, setOpen };
}


export default function HoverDemoPage() {
  const hover = useHoverDelay(250, 120);

  return (
    <div className="min-h-[70vh] grid place-items-center bg-neutral-950 text-neutral-100 p-6">
      <div
        className="relative"
        onMouseEnter={hover.onEnter}
        onMouseLeave={hover.onLeave}
      >
        {/* trigger: avatar */}
        <Image
          src={fakeUser.avatar}
          alt="avatar"
          width={112}
          height={112}
          className="w-28 h-28 rounded-2xl object-cover ring-1 ring-white/10 shadow-xl cursor-pointer"
        />

        {/* hover card */}
        {hover.open && (
          <div
            className="absolute z-50 left-1/2 -translate-x-1/2 top-[calc(100%+10px)]
                       w-80 rounded-2xl border border-white/10 bg-neutral-900/95
                       shadow-2xl backdrop-blur p-4"
            onMouseEnter={hover.onEnter}
            onMouseLeave={hover.onLeave}
          >
            {/* mũi tên nhỏ */}
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3
                         rotate-45 bg-neutral-900/95 border-l border-t border-white/10"
            />

            <div className="flex gap-3">
              <Image
                src={fakeUser.avatar}
                alt="avatar"
                width={48}
                height={48}
                className="w-12 h-12 rounded-lg object-cover ring-1 ring-white/10"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate">
                    {fakeUser.name}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/20">
                    Pro
                  </span>
                </div>
                <div className="text-sm text-neutral-400">
                  @{fakeUser.username}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-neutral-200 line-clamp-3">
                  {fakeUser.bio}
                </p>

                <div className="mt-3 flex gap-2">
                  <button className="px-3 py-1.5 text-sm rounded-lg ring-1 ring-white/15 hover:bg-white/5 transition">
                    Follow
                  </button>
                  <button className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 transition">
                    View profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* chú thích nhỏ */}
      <p className="absolute bottom-4 text-xs text-neutral-400">
        Hover vào avatar để thấy card (có delay mở/đóng).
      </p>
    </div>
  );
}
