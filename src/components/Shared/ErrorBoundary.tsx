import React, { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50 dark:bg-red-950 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
