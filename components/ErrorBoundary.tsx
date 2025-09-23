import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A1024] text-white p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-red-400 mb-4">Something went wrong</h1>
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Error Details:</h2>
              {this.state.error && (
                <div className="mb-4">
                  <p className="text-red-300 font-mono text-sm">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}
              {this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-gray-300 hover:text-white">
                    Stack Trace (click to expand)
                  </summary>
                  <pre className="mt-2 text-xs text-gray-400 overflow-auto bg-gray-900 p-4 rounded">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
            <div className="mt-6">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-semibold"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;