import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi, User } from '../api/auth';
import ContributionHeatmap from '../components/ContributionHeatmap';
import { AchievementsSection } from '../components/AchievementBadge';

const ProfilePage: React.FC = () => {
    const { data: user, isLoading, error } = useQuery<User>({
        queryKey: ['currentUser'],
        queryFn: authApi.getCurrentUser,
    });

    const [counters, setCounters] = useState({
        repos: 0,
        commits: 0,
        prs: 0,
        reviews: 0,
    });

    // Animated counters
    useEffect(() => {
        if (user && user.stats) {
            const targetValues = {
                repos: user.stats.total_repositories,
                commits: user.stats.total_commits,
                prs: user.stats.total_prs,
                reviews: user.stats.total_issues
            };
            const stepTime = 20;

            const timer = setInterval(() => {
                setCounters(prev => {
                    const next = { ...prev };
                    let complete = true;

                    (['repos', 'commits', 'prs', 'reviews'] as const).forEach(key => {
                        if (prev[key] < targetValues[key]) {
                            complete = false;
                            next[key] = Math.min(prev[key] + Math.max(1, Math.ceil((targetValues[key] - prev[key]) / 10)), targetValues[key]);
                        }
                    });

                    if (complete) clearInterval(timer);
                    return next;
                });
            }, stepTime);

            return () => clearInterval(timer);
        }
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
                <div className="modern-card p-8 border-red-500/20 bg-red-500/5 max-w-md">
                    <h2 className="text-xl font-bold text-red-400 mb-2">Sync Error</h2>
                    <p className="text-slate-400 mb-4">Could not retrieve profile data. Please try again.</p>
                    <button onClick={() => window.location.reload()} className="btn-secondary text-sm">Retry Connection</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-slide-up">

                {/* 1. Profile Card */}
                <div className="lg:col-span-8 modern-card p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="relative">
                            <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden ring-2 ring-blue-500/20 shadow-xl">
                                <img src={user?.avatar_url} alt={user?.username} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-gradient-blue rounded-lg p-1.5 shadow-lg">
                                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
                                    {user?.name}
                                </h1>
                                <div className="flex items-center gap-3 text-lg text-slate-400 font-medium">
                                    <span className="text-blue-400">@{user?.username}</span>
                                    <span>•</span>
                                    <span>{user?.company || 'Developer'}</span>
                                </div>
                            </div>

                            <p className="text-slate-400 leading-relaxed max-w-2xl">
                                {user?.bio || "No bio provided."}
                            </p>

                            <div className="pt-2 flex gap-4">
                                <a href={`https://github.com/${user?.username}`} target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-2 text-sm">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                    GitHub Profile
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Stats Cards */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Total Impact Card */}
                    <div className="modern-card p-6">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Commits</span>
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                        </div>
                        <div className="text-4xl font-bold text-white mb-1 tracking-tight">{counters.commits.toLocaleString()}</div>
                        <div className="text-sm text-blue-300 font-medium">All time contributions</div>
                    </div>

                    {/* PRs and Repos Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="modern-card p-5">
                            <div className="text-slate-400 text-xs font-bold uppercase mb-2">Repositories</div>
                            <div className="text-3xl font-bold text-white mb-1">{counters.repos}</div>
                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-3/4"></div>
                            </div>
                        </div>
                        <div className="modern-card p-5">
                            <div className="text-slate-400 text-xs font-bold uppercase mb-2">Pull Requests</div>
                            <div className="text-3xl font-bold text-white mb-1">{counters.prs}</div>
                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-1/2"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Contribution Heatmap */}
                <div className="lg:col-span-12 modern-card p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                            Contribution Matrix
                        </h3>
                        <div className="flex gap-2">
                            <span className="w-3 h-3 bg-slate-800 rounded-sm"></span>
                            <span className="w-3 h-3 bg-blue-900 rounded-sm"></span>
                            <span className="w-3 h-3 bg-blue-700 rounded-sm"></span>
                            <span className="w-3 h-3 bg-blue-500 rounded-sm"></span>
                            <span className="w-3 h-3 bg-blue-300 rounded-sm"></span>
                        </div>
                    </div>

                    <div className="w-full overflow-x-auto pb-2">
                        <ContributionHeatmap />
                    </div>
                </div>

                {/* 4. Activity Stream */}
                <div className="lg:col-span-8">
                    <div className="modern-card p-8 h-full">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                            Activity Stream
                        </h3>

                        <div className="relative space-y-8 pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                            {[
                                { title: 'Pushed to main', repo: 'GitArena', time: '2h ago' },
                                { title: 'Opened Pull Request', repo: 'DevOps-Pipeline', time: '5h ago' },
                                { title: 'Code Review', repo: 'Frontend-v2', time: '1d ago' }
                            ].map((item, i) => (
                                <div key={i} className="relative group">
                                    <div className="absolute -left-[39px] top-1 w-6 h-6 rounded-full border-4 border-primary-900 bg-blue-500 shadow-lg shadow-blue-500/30"></div>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 -m-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                                        <div>
                                            <div className="text-white font-medium">{item.title}</div>
                                            <div className="text-sm text-slate-500 font-mono">{item.repo}</div>
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium px-2 py-1 bg-slate-900 rounded-md border border-slate-800">
                                            {item.time}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 5. Achievements */}
                <div className="lg:col-span-4">
                    <AchievementsSection />
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;
