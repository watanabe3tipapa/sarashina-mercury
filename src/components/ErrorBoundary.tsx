import { Component, type ErrorInfo, type ReactNode } from "react"

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled error", error, info)
  }

  handleRetry = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full space-y-4 text-center">
            <h1 className="text-xl font-bold">問題が発生しました</h1>
            <p className="text-sm text-slate-400">
              予期しないエラーで画面を表示できませんでした。もう一度お試しください。
            </p>
            {import.meta.env.DEV && (
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded border border-slate-800 bg-slate-900 p-3 text-left text-xs text-red-400">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={this.handleRetry}
                className="rounded border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                再試行
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                再読み込み
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
