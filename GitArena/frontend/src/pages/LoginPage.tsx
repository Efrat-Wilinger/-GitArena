import React from 'react';

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || 'your-github-client-id';
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || 'http://localhost:3000/auth/callback';

const LoginPage: React.FC = () => {
    const handleGitHubLogin = () => {
        const params = new URLSearchParams({
            client_id: GITHUB_CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            scope: 'repo,user',
            prompt: 'login',
            ts: Date.now().toString()
        });
        const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
        console.log('Redirecting to GitHub Auth:', githubAuthUrl);
        window.location.assign(githubAuthUrl);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

            <div className="max-w-md w-full relative z-10">
                {/* Logo and title */}
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl mb-6 shadow-2xl shadow-purple-500/50">
                        <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                        GitArena
                    </h1>
                    <p className="text-gray-300 text-lg font-light tracking-wide">
                        GitHub Analytics <span className="text-cyan-400 font-mono">&</span> AI Platform
                    </p>
                </div>

                {/* Main card */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
                    {/* Code-like decorative elements */}
                    <div className="mb-6 font-mono text-xs text-gray-500">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-purple-400">const</span>
                            <span className="text-cyan-400">authenticate</span>
                            <span className="text-gray-400">=</span>
                            <span className="text-yellow-400">async</span>
                            <span className="text-gray-400">() =&gt; {'{'}</span>
                        </div>
                        <div className="ml-4 text-gray-600">// Initialize GitHub OAuth flow</div>
                    </div>

                    {/* GitHub login button */}
                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={handleGitHubLogin}
                            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 p-[2px] transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/50"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>
                            <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl px-6 py-4 flex items-center justify-center gap-3">
                                <svg className="w-6 h-6 text-white group-hover:text-cyan-400 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-white font-semibold text-lg group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all">
                                    Sign in with GitHub
                                </span>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-800 text-gray-500">or</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => window.open('https://github.com/logout', '_blank')}
                            className="w-full px-4 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 hover:bg-gray-700/50 transition-all duration-200 flex items-center justify-center gap-2 group"
                        >
                            <svg className="w-5 h-5 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="font-medium">Switch GitHub Account</span>
                        </button>
                        <p className="text-xs text-center text-gray-500">
                            (Requires signing out of GitHub)
                        </p>
                    </div>

                    {/* Code-like decorative elements */}
                    <div className="mt-6 font-mono text-xs text-gray-500">
                        <div className="ml-4 text-gray-600">// Secure OAuth 2.0 authentication</div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">{'}'}</span>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="mt-8 pt-6 border-t border-gray-700/50 grid grid-cols-3 gap-4 text-center">
                        <div className="group cursor-default">
                            <div className="text-cyan-400 text-2xl mb-1 group-hover:scale-110 transition-transform">⚡</div>
                            <div className="text-xs text-gray-400 group-hover:text-cyan-400 transition-colors">Fast</div>
                        </div>
                        <div className="group cursor-default">
                            <div className="text-purple-400 text-2xl mb-1 group-hover:scale-110 transition-transform">🔒</div>
                            <div className="text-xs text-gray-400 group-hover:text-purple-400 transition-colors">Secure</div>
                        </div>
                        <div className="group cursor-default">
                            <div className="text-pink-400 text-2xl mb-1 group-hover:scale-110 transition-transform">🤖</div>
                            <div className="text-xs text-gray-400 group-hover:text-pink-400 transition-colors">AI-Powered</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm font-mono">
                        <span className="text-purple-400">Sprint 1</span>
                        <span className="text-gray-600 mx-2">•</span>
                        <span className="text-cyan-400">Story 205</span>
                        <span className="text-gray-600 mx-2">•</span>
                        <span className="text-gray-400">OAuth Login</span>
                    </p>
                </div>
            </div>

            <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
        </div>
    );
};

export default LoginPage;
