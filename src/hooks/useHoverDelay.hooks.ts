import { useEffect, useRef, useState } from "react";

export function useHoverDelay(openDelay = 250, closeDelay = 120) {
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
