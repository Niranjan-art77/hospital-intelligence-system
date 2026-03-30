import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Critical Component Error:", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className={`p-6 rounded-[2rem] border border-red-500/20 bg-red-500/5 backdrop-blur-xl flex flex-col items-center justify-center text-center ${this.props.className}`}>
                    <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Interface Failure</h3>
                    <p className="text-xs text-slate-500 mb-6 max-w-[200px]">
                        This data module failed to synchronize with the neural grid.
                    </p>
                    <button 
                        onClick={this.handleRetry}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95"
                    >
                        <RefreshCcw className="w-3 h-3" /> Re-Sync Module
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
