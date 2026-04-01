import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-8">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Đã xảy ra lỗi</h2>
          <p className="text-gray-400 text-sm text-center mb-6 max-w-md">
            {this.state.error?.message || 'Có lỗi không mong muốn xảy ra'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600 text-black px-6 py-3 rounded-full font-bold transition-colors"
          >
            Tải lại ứng dụng
          </button>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 text-gray-400 text-sm underline hover:text-white"
          >
            Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
