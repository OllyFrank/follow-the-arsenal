import { useEffect, useState } from "react";

export type LogbookPageId = "att" | "grd" | "eur" | "his";

const PAGE_IDS: LogbookPageId[] = ["att", "grd", "eur", "his"];
const DEFAULT_PAGE: LogbookPageId = "att";

function readHash(): LogbookPageId {
  const hash = window.location.hash.replace("#", "");
  return (PAGE_IDS as string[]).includes(hash) ? (hash as LogbookPageId) : DEFAULT_PAGE;
}

/** Mobile shows one logbook page at a time, selected via real links whose
 * href is the page's hash — kept in the URL so the active page survives a
 * refresh and the back/forward buttons (design-handoff/BADGES.md). Desktop
 * stacks every page and the same hashes become jump links; this hook only
 * needs to track which one's "active" for the mobile show/hide. */
export function useLogbookPage(): LogbookPageId {
  const [page, setPage] = useState<LogbookPageId>(() => readHash());

  useEffect(() => {
    const onHashChange = () => setPage(readHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return page;
}
