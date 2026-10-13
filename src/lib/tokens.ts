const CJK_RE =
  /[\u3040-\u30ff\u4e00-\u9fff\u3400-\u4dbf\uac00-\ud7af\u3000-\u303f\uff01-\uff5e]/g

export function estimateTokens(text: string): number {
  if (!text) return 0
  const cjkChars = text.match(CJK_RE)?.length ?? 0
  const asciiChars = text.length - cjkChars
  return Math.max(1, Math.ceil(cjkChars * 0.7 + asciiChars / 4))
}

export function estimateCost(tokens: number, yenPerMillion: number): number {
  return (tokens / 1_000_000) * yenPerMillion
}

export const DEFAULT_PRICES_YEN_PER_MILLION: Record<string, number> = {
  "sarashina3-mini": 0,
  "sarashina3-nano": 0,
}