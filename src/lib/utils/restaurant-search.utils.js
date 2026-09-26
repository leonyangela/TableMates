/**
 * Restaurant search over the whole Firestore collection, not just the
 * page that's loaded. Firestore has no full-text search, so each
 * restaurant doc stores `searchKeywords`: every lowercase prefix of every
 * word in its name and category ("Riverbar & Kitchen" -> "r", "ri", ...,
 * "riverbar", "k", "ki", ..., "kitchen"). A search then queries
 * `searchKeywords array-contains <term>`, which finds "Restaurant 35"
 * whether or not it's in the first page of results.
 *
 * array-contains takes one value, so a multi-word search queries by its
 * longest word and checks the rest client-side on those (already narrowed)
 * results — see matchesSearch.
 */

const MAX_PREFIX_LENGTH = 20;

function toWords(text) {
  return String(text ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents: "café" -> "cafe"
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function searchableWords(restaurant) {
  return [...toWords(restaurant?.name), ...toWords(restaurant?.category)];
}

/** Every prefix of every name/category word — the value stored on each doc. */
export function buildSearchKeywords(restaurant) {
  const keywords = new Set();

  searchableWords(restaurant).forEach((word) => {
    const max = Math.min(word.length, MAX_PREFIX_LENGTH);
    for (let length = 1; length <= max; length += 1) {
      keywords.add(word.slice(0, length));
    }
  });

  return [...keywords];
}

/** A search string -> its normalized words ("  Sushi  Bar " -> ["sushi", "bar"]). */
export function getSearchTokens(searchText) {
  return toWords(searchText).map((word) => word.slice(0, MAX_PREFIX_LENGTH));
}

/** The single token Firestore queries by: the longest, i.e. most selective. */
export function getPrimarySearchToken(tokens) {
  return tokens.reduce(
    (longest, token) => (token.length > longest.length ? token : longest),
    "",
  );
}

/** Whether every search token is the start of some name/category word. */
export function matchesSearch(restaurant, tokens) {
  if (!tokens?.length) return true;

  const words = searchableWords(restaurant);
  return tokens.every((token) => words.some((word) => word.startsWith(token)));
}
