import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    name?: string;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`Uncaught error in ${this.props.name || 'component'}:`, error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-lg text-center">
                    <h3 className="text-red-400 font-semibold mb-1">Component Error</h3>
                    <p className="text-xs text-slate-500">
                        {this.props.name ? `Error in ${this.props.name}` : 'Something went wrong.'}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export const withErrorBoundary = <P extends object>(
    Component: React.ComponentType<P>,
    name?: string
): React.FC<P> => {
    return (props: P) => (
        <ErrorBoundary name={name || Component.displayName || Component.name}>
            <Component {...props} />
        </ErrorBoundary>
    );
};
