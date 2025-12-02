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
                    window.location.href = '/profile';
                }, 1500);

            } catch (err: any) {
                console.error('Login failed:', err);
                setError(err.response?.data?.detail || 'Failed to complete authentication.');
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    const handleManualRedirect = () => {
        window.location.href = '/profile';
    };

    const handleRetry = () => {
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
            <div className="max-w-md w-full bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
                <div className="text-center">
                    {error ? (
                        <>
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 mb-4">
                                <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-red-400 mb-2">Authentication Failed</h3>
                            <p className="text-gray-400 text-sm mb-6">{error}</p>
                            <button
                                onClick={handleRetry}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                                Return to Login
                            </button>
                        </>
                    ) : (
                        <>
                            {isSuccess ? (
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-900/50 mb-4">
                                    <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                            )}

                            <h3 className="text-lg font-medium text-white mb-2">
                                {isSuccess ? 'Welcome Back!' : 'Authenticating...'}
                            </h3>
                            <p className="text-gray-400 text-sm mb-6 font-mono">{status}</p>

                            {isSuccess && (
                                <button
                                    onClick={handleManualRedirect}
                                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                >
                                    Continue to Dashboard
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CallbackPage;
