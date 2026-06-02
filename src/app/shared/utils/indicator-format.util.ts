/**
 * Custom display names for indicator codes that don't follow standard title-case rules.
 */
const INDICATOR_DISPLAY_NAMES: Readonly<Record<string, string>> = {
  PVP: 'P/VP',
  PL: 'PL',
};

/**
 * Converts an indicator code like "DIVIDEND_YIELD" to a human-readable label.
 * Uses custom display names for codes that have special formatting (e.g. PVP -> P/VP).
 * Falls back to replacing underscores with spaces and applying title case.
 */
export function formatIndicatorCode(code: string): string {
  if (INDICATOR_DISPLAY_NAMES[code]) {
    return INDICATOR_DISPLAY_NAMES[code];
  }
  return code
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
