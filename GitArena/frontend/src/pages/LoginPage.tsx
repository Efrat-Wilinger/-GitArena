import React, { useState } from 'react';

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || 'your-github-client-id';
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || 'http://localhost:3000/auth/callback';

const LoginPage: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);

    const handleGitHubLogin = () => {
        if (GITHUB_CLIENT_ID === 'your-github-client-id') {
            console.error('GitHub Client ID is not configured');
            alert('Please configure VITE_GITHUB_CLIENT_ID in your .env file');
            return;
        }

        const params = new URLSearchParams({
            client_id: GITHUB_CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            scope: 'repo user',
            prompt: 'login',
        });
        const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
        console.log('Redirecting to GitHub Auth:', githubAuthUrl);
        window.location.assign(githubAuthUrl);
    };

    return (
        <div className="min-h-screen bg-gradient-dark text-white flex flex-col font-sans relative overflow-hidden">
            {/* Animated Grid Background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>

            {/* Gradient Orbs */}
            <div className="absolute top-20 left-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>

            {/* Navigation Bar */}
            <nav className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-blue rounded-xl shadow-lg glow-blue">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                        </svg>
                    </div>
                    <span className="font-bold text-2xl tracking-tight">GitArena</span>
                </div>
                <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
                    <button className="hover:text-white transition-colors">Platform</button>
                    <button className="hover:text-white transition-colors">Features</button>
                    <button className="hover:text-white transition-colors">Docs</button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-4 w-full">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 animate-slide-up">

                    {/* Left Side - Text Content */}
                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">

                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-semibold mb-8 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            Powered by AI & Gamification
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
                            Drive Your Team<br />
                            <span className="text-gradient-blue">
                                with Intelligence
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className="max-w-xl text-lg md:text-xl text-slate-300 font-light leading-relaxed mb-12">
                            GitArena measures performance, analyzes code quality, and motivates developers
                            with real-time insights, AI feedback, and intelligent gamification.
                        </p>

                        {/* CTA Button */}
                        <button
                            onClick={handleGitHubLogin}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            className="btn-primary flex items-center justify-center gap-3 text-lg"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            Connect with GitHub
                            <svg
                                className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>

                        <p className="mt-8 text-sm text-slate-400 font-medium">
                            Open source project for team collaboration
                        </p>
                    </div>

                    {/* Right Side - CodeBuddy Character */}
                    <div className="flex-1 hidden md:flex items-center justify-center">
                        <div className="relative">
                            {/* Gradient background circle */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-indigo-500/20 to-purple-500/30 blur-3xl rounded-full scale-150"></div>

                            {/* Character */}
                            <div className="relative animate-float">
                                <img
                                    src="/codebuddy.png"
                                    alt="CodeBuddy - Your AI Companion"
                                    className="w-72 h-72 lg:w-96 lg:h-96 object-contain drop-shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 w-full py-8 border-t border-white/5 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
                    <p>© 2025 GitArena. Built with ❤️ for developers.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Security</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LoginPage;
