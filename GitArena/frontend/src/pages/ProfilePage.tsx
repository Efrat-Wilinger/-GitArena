import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi, User } from '../api/auth';

const ProfilePage: React.FC = () => {
    const { data: user, isLoading, error } = useQuery<User>({
        queryKey: ['currentUser'],
        queryFn: authApi.getCurrentUser,
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                Failed to load profile data
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Cover Banner with Gradient */}
            <div className="relative h-48 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 animate-gradient"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>

                {/* Avatar positioned at bottom */}
                <div className="absolute -bottom-16 left-8">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 shadow-2xl">
                            <img
                                src={user?.avatar_url}
                                alt={user?.username}
                                className="w-full h-full rounded-full object-cover border-4 border-gray-900 bg-gray-900"
                            />
                        </div>
                        <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-gray-900 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* User Info */}
            <div className="pt-20 px-8">
                <h1 className="text-3xl font-bold text-white mb-1">
                    {user?.name || user?.username}
                </h1>
                <p className="text-gray-400 font-mono text-sm mb-4">@{user?.username}</p>

                <div className="flex flex-wrap gap-3 mb-6">
                    {user?.email && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-800/80 text-gray-300 border border-gray-700">
                            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {user.email}
                        </span>
                    )}
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-800/80 text-gray-300 border border-gray-700">
                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Joined {new Date(user?.created_at || '').toLocaleDateString()}
                    </span>
                </div>
            </div>

            {/* Stats Grid - Enhanced */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="group bg-gradient-to-br from-cyan-500/20 to-cyan-600/5 border border-cyan-500/30 rounded-xl p-5 hover:border-cyan-500/50 hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20 cursor-default backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Repositories</div>
                        <div className="text-2xl group-hover:scale-110 transition-transform">📁</div>
                    </div>
                    <div className="text-3xl font-bold text-white tabular-nums">12</div>
                    <div className="text-xs text-cyan-400 mt-1">+2 this month</div>
                </div>

                <div className="group bg-gradient-to-br from-purple-500/20 to-purple-600/5 border border-purple-500/30 rounded-xl p-5 hover:border-purple-500/50 hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 cursor-default backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Commits This Month</div>
                        <div className="text-2xl group-hover:scale-110 transition-transform">⚡</div>
                    </div>
                    <div className="text-3xl font-bold text-white tabular-nums">247</div>
                    <div className="text-xs text-purple-400 mt-1">+15% from last month</div>
                </div>

                <div className="group bg-gradient-to-br from-pink-500/20 to-pink-600/5 border border-pink-500/30 rounded-xl p-5 hover:border-pink-500/50 hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/20 cursor-default backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Pull Requests</div>
                        <div className="text-2xl group-hover:scale-110 transition-transform">🔀</div>
                    </div>
                    <div className="text-3xl font-bold text-white tabular-nums">34</div>
                    <div className="text-xs text-pink-400 mt-1">8 merged this week</div>
                </div>

                <div className="group bg-gradient-to-br from-green-500/20 to-green-600/5 border border-green-500/30 rounded-xl p-5 hover:border-green-500/50 hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20 cursor-default backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Code Reviews</div>
                        <div className="text-2xl group-hover:scale-110 transition-transform">✅</div>
                    </div>
                    <div className="text-3xl font-bold text-white tabular-nums">89</div>
                    <div className="text-xs text-green-400 mt-1">12 pending</div>
                </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Recent Activity
                </h3>
                <div className="space-y-4">
                    {[
                        { type: 'commit', message: 'Fixed authentication bug in login flow', repo: 'GitArena', time: '2 hours ago', color: 'cyan' },
                        { type: 'pr', message: 'Added new dashboard analytics', repo: 'GitArena', time: '5 hours ago', color: 'purple' },
                        { type: 'review', message: 'Reviewed PR #42: Update README', repo: 'GitArena', time: '1 day ago', color: 'pink' },
                        { type: 'commit', message: 'Improved UI responsiveness', repo: 'GitArena', time: '2 days ago', color: 'cyan' },
                    ].map((activity, index) => (
                        <div key={index} className="flex items-start gap-4 group hover:bg-gray-700/30 p-3 rounded-lg transition-colors">
                            <div className={`w-10 h-10 rounded-full bg-${activity.color}-500/20 border border-${activity.color}-500/30 flex items-center justify-center flex-shrink-0`}>
                                {activity.type === 'commit' && <span className="text-lg">💾</span>}
                                {activity.type === 'pr' && <span className="text-lg">🔀</span>}
                                {activity.type === 'review' && <span className="text-lg">👀</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm">{activity.message}</p>
                                <p className="text-gray-400 text-xs mt-1">
                                    <span className="font-mono">{activity.repo}</span>
                                    <span className="mx-2">•</span>
                                    <span>{activity.time}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills/Technologies */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <span className="text-2xl">🛠️</span>
                    Skills & Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                    {['Python', 'TypeScript', 'React', 'FastAPI', 'PostgreSQL', 'Docker', 'Git', 'TailwindCSS'].map((skill) => (
                        <span key={skill} className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 rounded-full text-sm font-medium text-gray-200 hover:border-cyan-500/50 hover:text-cyan-400 transition-all cursor-default">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 5s ease infinite;
                }
                .bg-grid-pattern {
                    background-image: 
                        linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
            `}</style>
        </div>
    );
};

export default ProfilePage;
