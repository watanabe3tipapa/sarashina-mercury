interface SourceCitationProps {
  index: number
  excerpt: string
  relevance: number
  active?: boolean
}

export default function SourceCitation({
  index,
  excerpt,
  relevance,
  active = false,
}: SourceCitationProps) {
  const pct = Math.round(Math.max(0, Math.min(1, relevance)) * 100)

  return (
    <div
      id={`source-${index}`}
      className={`scroll-mt-4 rounded-lg border p-3 transition-colors ${
        active
          ? "border-blue-500 bg-slate-800"
          : "border-slate-700 bg-slate-900"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-300">[{index}]</span>
        <span className="text-xs text-slate-500">関連度 {pct}%</span>
      </div>
      <p className="text-sm text-slate-200 whitespace-pre-wrap">{excerpt}</p>
      <div className="mt-2 h-1.5 w-full rounded bg-slate-700">
        <div
          className="h-1.5 rounded bg-blue-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
