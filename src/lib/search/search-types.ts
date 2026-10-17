/** Result groups the header search queries on the server, in display order. */
export const SEARCH_GROUPS = ["projects", "tasks", "events", "hackathons", "members"] as const;
export type SearchGroup = (typeof SEARCH_GROUPS)[number];

export const SEARCH_QUERY_MIN = 2;
export const SEARCH_QUERY_MAX = 80;
/** Results returned per group. */
export const SEARCH_GROUP_LIMIT = 5;

/** One search hit. Members carry memberId (opens their card); everything else links somewhere. */
export interface SearchHit {
  id: string;
  title: string;
  subtitle: string | null;
  href?: string;
  memberId?: string;
  avatarUrl?: string | null;
  /** ISO date the client formats in the viewer's time zone (events, hackathons, task due dates). */
  date?: string | null;
}

export type PortalSearchResults = Record<SearchGroup, SearchHit[]>;

/** Query parameter each list page reads to scroll to (or open) the item a search result points at. */
export const SEARCH_FOCUS_PARAM = {
  projects: "project",
  tasks: "task",
  events: "event",
  hackathons: "hackathon",
} as const;
