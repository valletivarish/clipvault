// Shared board-name rules. Used on BOTH the create side (BoardGenerator)
// and the read side (board page) so validation can never drift between them.

// Confusable characters (I, O, 0, 1) are excluded so generated codes are
// easy to read aloud and type.
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const BOARD_MIN = 3;
export const BOARD_MAX = 40;

// Generate a short, shareable code (shown uppercase, stored lowercase).
export function generateBoardCode(): string {
  return Array.from(
    { length: 6 },
    () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)],
  ).join('');
}

// Turn any raw input into a safe, URL-clean, lowercase slug, or null if it
// cannot be made into a valid name. A valid slug is 3-40 chars of lowercase
// letters, digits, and single hyphens, starting and ending alphanumeric.
//
// Lowercasing makes names case-insensitive so "TeamBoard" and "teamboard"
// resolve to the same board instead of two split ones. The strict charset
// sidesteps every Firestore document-ID hazard ('/', '.', '..', reserved
// patterns, length) and needs no URL encoding.
export function slugifyBoardName(raw: string): string | null {
  if (!raw) return null;
  let s = raw.trim().toLowerCase();
  try { s = s.normalize('NFKC'); } catch {}
  s = s.replace(/[^a-z0-9]+/g, '-'); // any run of disallowed chars -> one hyphen
  s = s.replace(/-+/g, '-');         // collapse repeats
  s = s.replace(/^-+|-+$/g, '');     // trim hyphens
  s = s.slice(0, BOARD_MAX).replace(/-+$/g, ''); // cap length, re-trim
  if (s.length < BOARD_MIN) return null;
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(s)) return null;
  return s;
}

export function isValidBoardName(raw: string): boolean {
  return slugifyBoardName(raw) !== null;
}
