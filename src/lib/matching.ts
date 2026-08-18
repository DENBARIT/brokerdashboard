import type { OrderRow, SmsMatchResult } from "@/lib/supabase/types";

// Deterministic substring/number matching against a pasted verification
// SMS — not NLP. Appropriate for the short, fairly standardized wording of
// a bank/Telebirr debit-notification SMS. See
// birr_gebeya/migrations/004_broker_dashboard.sql for why this exists: it's
// the "does this SMS actually correspond to this order" check the broker
// leans on before treating an order as legitimate.

const STOPWORDS = new Set(["day", "days", "bond", "bill", "note", "term"]);

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

/** Extracts the most plausible monetary amount from free-form SMS text. */
export function extractAmount(text: string): number | null {
  // Prefer a number immediately followed by a currency word.
  const withCurrency = text.match(
    /([\d,]+(?:\.\d{1,2})?)\s*(?:birr|etb)\b/i,
  );
  if (withCurrency) {
    const value = Number(withCurrency[1].replace(/,/g, ""));
    if (!Number.isNaN(value)) return value;
  }

  // Otherwise a currency word immediately followed by a number.
  const currencyFirst = text.match(
    /\b(?:birr|etb)\s*([\d,]+(?:\.\d{1,2})?)/i,
  );
  if (currencyFirst) {
    const value = Number(currencyFirst[1].replace(/,/g, ""));
    if (!Number.isNaN(value)) return value;
  }

  // Fall back to the largest number in the text (a debit notification's
  // amount is usually the most prominent figure).
  const allNumbers = [...text.matchAll(/[\d,]+(?:\.\d{1,2})?/g)]
    .map((m) => Number(m[0].replace(/,/g, "")))
    .filter((n) => !Number.isNaN(n));
  if (allNumbers.length === 0) return null;
  return Math.max(...allNumbers);
}

function containsName(smsNormalized: string, fullName: string): boolean {
  const nameNormalized = normalize(fullName);
  if (!nameNormalized) return false;
  if (smsNormalized.includes(nameNormalized)) return true;
  // Fall back to matching every individual name part (handles "Last, First"
  // or reordered names some notification templates use).
  const parts = nameNormalized.split(" ").filter((p) => p.length > 1);
  return parts.length > 0 && parts.every((p) => smsNormalized.includes(p));
}

function containsAsset(smsNormalized: string, assetName: string): boolean {
  const assetNormalized = normalize(assetName);
  if (!assetNormalized) return false;
  if (smsNormalized.includes(assetNormalized)) return true;
  // Fall back to any single significant word from the asset name (e.g.
  // "91" or "treasury") — bank templates rarely quote the product name
  // verbatim.
  return assetNormalized
    .split(" ")
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w))
    .some((word) => smsNormalized.includes(word));
}

export interface MatchOutcome {
  result: SmsMatchResult;
  orderId: string | null;
  parsedAmount: number | null;
}

/**
 * Finds the best pending order this SMS corresponds to.
 * - "matched": amount, buyer name, and asset all line up.
 * - "mismatched": the amount matched an order but name/asset didn't — flagged
 *   for the broker to eyeball rather than silently discarded.
 * - "unmatched": nothing lined up.
 */
export function findMatch(
  rawText: string,
  candidates: OrderRow[],
): MatchOutcome {
  const parsedAmount = extractAmount(rawText);
  const smsNormalized = normalize(rawText);

  if (parsedAmount === null) {
    return { result: "unmatched", orderId: null, parsedAmount: null };
  }

  const amountMatches = candidates.filter(
    (order) => Math.abs(order.amount - parsedAmount) < 0.01,
  );
  if (amountMatches.length === 0) {
    return { result: "unmatched", orderId: null, parsedAmount };
  }

  const fullMatch = amountMatches.find(
    (order) =>
      containsName(smsNormalized, order.user_full_name) &&
      containsAsset(smsNormalized, order.asset_name),
  );
  if (fullMatch) {
    return { result: "matched", orderId: fullMatch.id, parsedAmount };
  }

  // Amount matched but nothing else did — surface the newest such order so
  // the broker can review it rather than silently dropping the SMS.
  return { result: "mismatched", orderId: amountMatches[0].id, parsedAmount };
}
