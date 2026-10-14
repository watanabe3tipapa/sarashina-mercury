import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type Ref,
} from "react"
import {
  LexicalComposer,
  type InitialConfigType,
} from "@lexical/react/LexicalComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical"

export interface EditorPaneHandle {
  getParagraphs: () => string[]
  getText: () => string
  setParagraphs: (paragraphs: string[]) => void
  clear: () => void
  focus: () => void
}

interface EditorPaneProps {
  placeholder?: string
  ariaLabel?: string
  className?: string
  highlightIndex?: number | null
  onParagraphHover?: (index: number | null) => void
  onSubmitShortcut?: () => void
}

const theme = {
  paragraph: "editor-paragraph",
  text: {
    bold: "editor-bold",
    italic: "editor-italic",
    underline: "editor-underline",
    strikethrough: "editor-strike",
  },
}

const initialConfig: InitialConfigType = {
  namespace: "sarashina-editor",
  theme,
  onError: (error: Error) => {
    console.error(error)
  },
}

function readParagraphs() {
  return $getRoot()
    .getChildren()
    .map((node) => node.getTextContent())
}

function PaneBridge({ handleRef }: { handleRef: Ref<EditorPaneHandle> }) {
  const [editor] = useLexicalComposerContext()

  useImperativeHandle(
    handleRef,
    () => ({
      getParagraphs: () => editor.getEditorState().read(readParagraphs),
      getText: () =>
        editor
          .getEditorState()
          .read(() => readParagraphs().join("\n\n").trim()),
      setParagraphs: (paragraphs) =>
        editor.update(() => {
          const root = $getRoot()
          root.clear()
          const list = paragraphs.length ? paragraphs : [""]
          for (const text of list) {
            const paragraph = $createParagraphNode()
            if (text) paragraph.append($createTextNode(text))
            root.append(paragraph)
          }
        }),
      clear: () =>
        editor.update(() => {
          const root = $getRoot()
          root.clear()
          root.append($createParagraphNode())
        }),
      focus: () => editor.focus(),
    }),
    [editor]
  )

  return null
}

export const EditorPane = forwardRef<EditorPaneHandle, EditorPaneProps>(
  function EditorPane(
    {
      placeholder,
      ariaLabel,
      className,
      highlightIndex = null,
      onParagraphHover,
      onSubmitShortcut,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const container = containerRef.current
      if (!container) return
      const paragraphs = container.querySelectorAll("p")
      paragraphs.forEach((node, index) =>
        node.classList.toggle("editor-synced", index === highlightIndex)
      )
    }, [highlightIndex])

    const handleMouseOver = (e: React.MouseEvent) => {
      if (!onParagraphHover) return
      const paragraph = (e.target as HTMLElement).closest("p")
      if (!paragraph || !containerRef.current) return
      const list = Array.from(containerRef.current.querySelectorAll("p"))
      onParagraphHover(list.indexOf(paragraph))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault()
        onSubmitShortcut?.()
      }
    }

    return (
      <LexicalComposer initialConfig={initialConfig}>
        <div
          ref={containerRef}
          onMouseOver={handleMouseOver}
          onMouseLeave={() => onParagraphHover?.(null)}
          onKeyDown={handleKeyDown}
          className={`relative ${className ?? ""}`}
        >
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                aria-label={ariaLabel}
                className="editor-content min-h-64 px-4 py-3 text-sm leading-relaxed focus:outline-none"
              />
            }
            placeholder={
              placeholder ? (
                <div className="editor-placeholder">{placeholder}</div>
              ) : null
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
        </div>
        <PaneBridge handleRef={ref} />
      </LexicalComposer>
    )
  }
)
