"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

/** Delay that lets a tab switch made in onTarget render before the card is looked up. */
const RENDER_DELAY_MS = 80;

/**
 * Brings the item a header search result points at into view. A result links to its list page with
 * ?<param>=<id>; the page marks each card with data-search-target={id}. The card is scrolled to and
 * briefly ringed (see [data-search-focused] in globals.css), then the parameter is dropped from the
 * address so picking the same result again works. onTarget runs first, for pages that need to
 * switch a tab or open a drawer.
 */
export function useSearchFocus(param: string, onTarget?: (id: string) => void) {
  const targetId = useSearchParams()?.get(param) ?? null;
  const onTargetRef = useRef(onTarget);
  onTargetRef.current = onTarget;

  useEffect(() => {
    if (!targetId) return;
    onTargetRef.current?.(targetId);

    const timer = window.setTimeout(() => {
      const card = document.querySelector<HTMLElement>(`[data-search-target="${CSS.escape(targetId)}"]`);
      if (card) {
        // An instant jump: the router re-renders on replaceState below and cancels a smooth scroll.
        card.scrollIntoView({ block: "center", behavior: "auto" });
        // Restart the ring animation when the same card is picked twice.
        card.removeAttribute("data-search-focused");
        void card.offsetWidth;
        card.setAttribute("data-search-focused", "true");
      }
      const url = new URL(window.location.href);
      url.searchParams.delete(param);
      window.history.replaceState(window.history.state, "", url);
    }, RENDER_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [param, targetId]);
}
