import type { LucideIcon } from "lucide-react"
import {
  Bot,
  EyeOff,
  FlaskConical,
  Landmark,
  Lock,
  Megaphone,
  MessageSquareWarning,
  Newspaper,
  PencilLine,
  RefreshCw,
  Scale,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Swords,
  TriangleAlert,
  UserX,
} from "lucide-react"
import type { GuardResult } from "@/lib/api/sarashina"

interface CategoryMeta {
  icon: LucideIcon
  label: string
  hint: string
}

// Harmful-content taxonomy of sarashina3-guard (T1–T12), per the SB Intuitions
// tech blog "Sarashina3 guard: 日本語特化ガードレールモデル".
const CATEGORIES: Record<string, CategoryMeta> = {
  T1: {
    icon: MessageSquareWarning,
    label: "過激な性的コンテンツ",
    hint: "不適切な性的表現が含まれています。",
  },
  T2: {
    icon: Swords,
    label: "過激な暴力描写",
    hint: "暴力や危害を詳細に描写・助長する内容が含まれています。",
  },
  T3: {
    icon: UserX,
    label: "ステレオタイプと差別",
    hint: "特定の属性に対する偏見・差別を含む表現が検出されました。",
  },
  T4: {
    icon: TriangleAlert,
    label: "有害表現",
    hint: "侮蔑・脅迫・ハラスメントなど他者を害する表現が含まれています。",
  },
  T5: {
    icon: Bot,
    label: "エージェントへの過度な依存",
    hint: "AI への過度な依存を招く内容が含まれています。",
  },
  T6: {
    icon: Lock,
    label: "個人情報漏洩とプライバシー侵害",
    hint: "個人情報の流出やプライバシー侵害につながる内容が含まれています。",
  },
  T7: {
    icon: Landmark,
    label: "組織や政府からの情報漏洩",
    hint: "組織・行政の機密情報の漏洩につながる内容が含まれています。",
  },
  T8: {
    icon: Scale,
    label: "違法行為の幇助",
    hint: "法令に触れる行為の実行・支援を求める内容が含まれています。",
  },
  T9: {
    icon: ShieldAlert,
    label: "非倫理的・危険な行為の幇助",
    hint: "倫理に反する、または危険な行為を助長する内容が含まれています。",
  },
  T10: {
    icon: Megaphone,
    label: "悪意ある情報の拡散の幇助",
    hint: "他者を害する情報の拡散を助長する内容が含まれています。",
  },
  T11: {
    icon: FlaskConical,
    label: "専門的知識を要する分野での重大な被害リスク",
    hint: "医療・法務など専門分野で重大な被害につながる恐れがあります。",
  },
  T12: {
    icon: Newspaper,
    label: "虚偽情報・誤解を招く情報の拡散の幇助",
    hint: "誤情報の拡散につながる内容が含まれています。",
  },
}

const DEFAULT_CATEGORY: CategoryMeta = {
  icon: EyeOff,
  label: "要確認",
  hint: "取り扱いに注意が必要な表現が含まれている可能性があります。",
}

function describeCategory(raw: string): CategoryMeta & { code: string } {
  const code = raw.trim().toUpperCase()
  return { code, ...(CATEGORIES[code] ?? { ...DEFAULT_CATEGORY, label: raw }) }
}

interface GuardNoticeProps {
  result: GuardResult
  onRevise?: () => void
  onRetry?: () => void
  onProceed?: () => void
  proceedLabel?: string
  retrying?: boolean
  compact?: boolean
}

export default function GuardNotice({
  result,
  onRevise,
  onRetry,
  onProceed,
  proceedLabel = "このまま送信",
  retrying = false,
  compact = false,
}: GuardNoticeProps) {
  const harmful = !result.safe
  const categories = result.categories.map(describeCategory)
  const showActions = harmful && (onRevise || onRetry || onProceed)

  return (
    <section
      aria-live="polite"
      className={`rounded-lg border space-y-4 ${
        compact ? "p-3" : "p-4"
      } ${
        harmful
          ? "border-amber-700/60 bg-amber-950/40"
          : "border-emerald-700/60 bg-emerald-950/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 shrink-0 ${
            harmful ? "text-amber-300" : "text-emerald-300"
          }`}
        >
          {harmful ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
        </span>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-100">
              {harmful ? "表現を調整すると安全に使えます" : "安全性チェックを通過しました"}
            </h2>
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${
                harmful
                  ? "bg-amber-900/60 text-amber-200"
                  : "bg-emerald-900/60 text-emerald-200"
              }`}
            >
              {harmful ? "要確認" : "安全"}
            </span>
          </div>
          <p className="text-sm text-slate-300">
            {harmful
              ? "このテキストには、そのまま扱うとリスクのある表現が含まれている可能性があります。内容を否定するものではなく、安心して使える形に整えるためのご案内です。"
              : "有害と判定される表現は検出されませんでした。そのままご利用いただけます。"}
          </p>
        </div>
      </div>

      {harmful && categories.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {categories.map((c, i) => {
            const Icon = c.icon
            return (
              <li
                key={i}
                className="flex items-start gap-2 rounded border border-amber-800/50 bg-slate-950/40 p-2.5"
              >
                <Icon size={16} className="mt-0.5 shrink-0 text-amber-300" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-medium text-amber-100">{c.label}</p>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                      {c.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{c.hint}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {showActions && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {onRevise && (
            <button
              type="button"
              onClick={onRevise}
              className="flex items-center gap-2 rounded bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-amber-400"
            >
              <PencilLine size={16} />
              別の表現を試す
            </button>
          )}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={retrying}
              className="flex items-center gap-2 rounded border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={16} className={retrying ? "animate-spin" : ""} />
              {retrying ? "再判定中..." : "もう一度判定"}
            </button>
          )}
          {onProceed && (
            <button
              type="button"
              onClick={onProceed}
              className="flex items-center gap-2 rounded border border-amber-700 px-3 py-2 text-sm text-amber-200 hover:bg-amber-900/40"
            >
              <Send size={16} />
              {proceedLabel}
            </button>
          )}
        </div>
      )}

      {harmful && !compact && (
        <details className="rounded border border-slate-700/60 bg-slate-950/40 p-3 text-sm text-slate-300">
          <summary className="flex cursor-pointer items-center gap-2 text-slate-200">
            <Sparkles size={15} className="text-amber-300" />
            言い換えのヒント
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-400">
            <li>攻撃的な語句を中立的・客観的な表現に置き換える</li>
            <li>誰が・何を・なぜ行うのかを具体的に書き、意図を明確にする</li>
            <li>創作・引用・仮定の説明である場合は、その旨を文脈に明記する</li>
            <li>固有名詞や個人情報を一般化・匿名化してから再入力する</li>
          </ul>
        </details>
      )}

      <p className="text-xs text-slate-500">
        Guard の判定は確実ではありません。妥当な内容が誤って検出される場合もあります。
      </p>
    </section>
  )
}
