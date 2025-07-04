import { Event, Match, Group } from "../types";

// Utility to robustly extract and normalize an event with matches from group data
export async function getEventWithMatches(
  groupData: Group,
  eventId: string
): Promise<Event | null> {
  // Helper to extract event from any structure
  const extractEvent = (container: any): Event | null => {
    if (!container) return null;
    let found: any = null;
    if (Array.isArray(container)) {
      found = container.find((ev: any) => ev && ev.id === eventId) || null;
    } else if (typeof container === "object") {
      // Try direct key (eventId as key)
      if (Object.prototype.hasOwnProperty.call(container, eventId)) {
        found = container[eventId];
      } else {
        // Try values (for legacy/array-like objects)
        found =
          Object.values(container).find((ev: any) => ev && ev.id === eventId) ||
          null;
      }
    }
    // Accept event if it has id, date, groupId, matches, status (title can be missing)
    if (
      found &&
      typeof found === "object" &&
      typeof found.id === "string" &&
      typeof found.date === "string" &&
      typeof found.groupId === "string" &&
      (Array.isArray(found.matches) ||
        typeof found.matches === "object" ||
        found.matches === undefined) &&
      typeof found.status === "string" &&
      typeof found.createdAt === "string"
    ) {
      return found as Event;
    }
    return null;
  };

  let foundEvent =
    extractEvent(groupData.events) || extractEvent(groupData.ppvs);
  if (!foundEvent) {
    console.warn("Event not found in group data:", groupData, eventId);
    return null;
  }

  // --- Normalize matches to array, handle all structures (object or array) ---
  let matches: Match[] = [];
  if (foundEvent) {
    if (Array.isArray(foundEvent.matches) && foundEvent.matches.length > 0) {
      matches = foundEvent.matches.filter(Boolean);
    } else if (
      foundEvent.matches &&
      typeof foundEvent.matches === "object" &&
      Object.keys(foundEvent.matches).length > 0
    ) {
      matches = Object.values(foundEvent.matches).filter(Boolean) as Match[];
    } else if (
      Array.isArray(foundEvent.fights) &&
      foundEvent.fights.length > 0 &&
      foundEvent.apiSlug &&
      foundEvent.date
    ) {
      // If matches missing/empty but fights array exists, fetch matches from API using fight IDs
      try {
        const apiModule = await import("../services/firebaseService");
        if (apiModule.fetchEventFromApi) {
          const apiEvent = await apiModule.fetchEventFromApi(
            foundEvent.apiSlug,
            foundEvent.date,
            foundEvent.fights
          );
          matches = apiEvent.matches || [];
        }
      } catch (err) {
        console.warn("Failed to fetch matches from API (with fights)", err);
      }
    }
  }
  // Defensive: sort matches by order if present
  if (matches && matches.length > 0 && matches[0].order !== undefined) {
    matches = matches.slice().sort((a, b) => a.order - b.order);
  }

  // --- Only fall back to API if no matches found ---
  if (
    (!matches || matches.length === 0) &&
    foundEvent &&
    foundEvent.fights &&
    Array.isArray(foundEvent.fights) &&
    foundEvent.fights.length > 0 &&
    foundEvent.apiSlug &&
    foundEvent.date
  ) {
    try {
      const apiModule = await import("../services/firebaseService");
      if (apiModule.fetchEventFromApi) {
        const apiEvent = await apiModule.fetchEventFromApi(
          foundEvent.apiSlug,
          foundEvent.date,
          foundEvent.fights
        );
        matches = apiEvent.matches || [];
      }
    } catch (err) {
      console.warn("Failed to fetch matches from API (with fights)", err);
    }
  }
  // Fallback: If no fights array, but apiSlug and date exist, fetch all fights for the date and slug
  else if (
    (!matches || matches.length === 0) &&
    foundEvent &&
    foundEvent.apiSlug &&
    foundEvent.date
  ) {
    try {
      const apiModule = await import("../services/firebaseService");
      if (apiModule.fetchEventFromApi) {
        const apiEvent = await apiModule.fetchEventFromApi(
          foundEvent.apiSlug,
          foundEvent.date
        );
        matches = apiEvent.matches || [];
      }
    } catch (err) {
      console.warn("Failed to fetch matches from API (fallback)", err);
    }
  }

  // Defensive: If still no matches, set to empty array
  if (foundEvent) {
    return {
      ...foundEvent,
      matches: matches || [],
    };
  }
  return null;
}
