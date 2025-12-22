import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/auth';

const CallbackPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<string>('Initializing...');
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');

            if (!code) {
                setError('No authorization code received from GitHub.');
                return;
            }

            try {
                setStatus('Received code. Exchanging for access token...');
                const response = await authApi.githubLogin(code);

                setStatus('Token received. Saving session...');
                // Store token and user in localStorage
                localStorage.setItem('token', response.access_token);
                localStorage.setItem('user', JSON.stringify(response.user));

                setStatus('Login successful! Redirecting...');
                setIsSuccess(true);

                // Delay redirect slightly to show success message
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);

            } catch (err: any) {
                console.error('Login failed:', err);
                const errorMsg = err.response?.data?.detail
                    || err.message
                    || 'Failed to complete authentication.';

                // Detailed debug info
                const debugInfo = JSON.stringify({
                    status: err.response?.status,
                    statusText: err.response?.statusText,
                    data: err.response?.data,
                    headers: err.response?.headers,
                    message: err.message
                }, null, 2);

                setError(`${errorMsg}\n\nDebug Info:\n${debugInfo}`);
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    const handleManualRedirect = () => {
        window.location.href = '/';
    };

    const handleRetry = () => {
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white p-4 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px] opacity-50 animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[100px] opacity-40"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>

            <div className="max-w-md w-full bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-800/50 relative z-10">
                <div className="text-center">
                    {error ? (
                        <>
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 mb-6 animate-bounce-in">
                                <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Authentication Failed</h3>
                            <div className="text-left bg-black/30 rounded-lg p-4 mb-6 border border-gray-800 overflow-auto max-h-60">
                                <pre className="text-red-400 text-xs font-mono whitespace-pre-wrap break-all">{error}</pre>
                            </div>
                            <button
                                onClick={handleRetry}
                                className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-red-900/20"
                            >
                                Return to Login
                            </button>
                        </>
                    ) : (
                        <>
                            {isSuccess ? (
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-500/10 mb-6 animate-bounce-in">
                                    <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="relative mx-auto mb-8 w-16 h-16">
                                    <div className="absolute inset-0 rounded-full border-4 border-gray-800"></div>
                                    <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 border-r-purple-500 border-b-transparent border-l-transparent animate-spin"></div>
                                </div>
                            )}

                            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
                                {isSuccess ? 'Welcome Back!' : 'Authenticating...'}
                            </h3>
                            <p className="text-gray-400 text-sm mb-8 font-mono tracking-wide">{status}</p>

                            {isSuccess && (
                                <button
                                    onClick={handleManualRedirect}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-cyan-900/20 animate-fade-in-up"
                                >
                                    Continue to Dashboard
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.05); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 8s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default CallbackPage;
