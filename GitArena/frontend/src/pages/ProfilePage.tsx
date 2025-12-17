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

    // Animated counters on mount
    useEffect(() => {
        if (user) {
            const targetValues = { repos: 12, commits: 247, prs: 34, reviews: 89 };
            const duration = 2000;
            const steps = 60;
            const stepDuration = duration / steps;

            let currentStep = 0;
            const interval = setInterval(() => {
                currentStep++;
                const progress = currentStep / steps;

                setCounters({
                    repos: Math.floor(targetValues.repos * progress),
                    commits: Math.floor(targetValues.commits * progress),
                    prs: Math.floor(targetValues.prs * progress),
                    reviews: Math.floor(targetValues.reviews * progress),
                });

                if (currentStep >= steps) {
                    clearInterval(interval);
                    setCounters(targetValues);
                }
            }, stepDuration);

            return () => clearInterval(interval);
        }
    }, [user]);

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
            {/* Cover Banner with Gradient - Enhanced */}
            <div className="relative h-56 rounded-2xl overflow-hidden animate-stagger-1">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 animate-gradient"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>

                {/* Floating particles effect */}
                <div className="absolute inset-0">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 bg-white/20 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 2}s`,
                            }}
                        ></div>
                    ))}
                </div>

                {/* Avatar positioned at bottom */}
                <div className="absolute -bottom-20 left-8">
                    <div className="relative group">
                        <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 shadow-2xl hover:scale-105 transition-transform duration-300">
                            <img
                                src={user?.avatar_url}
                                alt={user?.username}
                                className="w-full h-full rounded-full object-cover border-4 border-gray-900 bg-gray-900"
                            />
                        </div>
                        {/* Online status indicator */}
                        <div className="absolute bottom-3 right-3 w-7 h-7 bg-emerald-500 border-4 border-gray-900 rounded-full animate-pulse"></div>

                        {/* Hover tooltip */}
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Active now
                        </div>
                    </div>
                </div>

                {/* Badge */}
                <div className="absolute top-4 right-4">
                    <span className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-full text-yellow-300 text-sm font-semibold backdrop-blur-xl flex items-center gap-2">
                        <span className="text-lg">⭐</span>
                        Pro Developer
                    </span>
                </div>
            </div>

            {/* User Info - Enhanced */}
            <div className="pt-24 px-8 animate-stagger-2">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            {user?.name || user?.username}
                        </h1>
                        <p className="text-gray-400 font-mono text-sm mb-3">@{user?.username}</p>

                        {/* Bio */}
                        <p className="text-gray-300 text-base max-w-2xl mb-4 leading-relaxed">
                            🚀 Full-stack developer passionate about building amazing things with code.
                            Love working with React, TypeScript & Python.
                        </p>

                        <div className="flex flex-wrap gap-3 mb-6">
                            {user?.email && (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-800/80 text-gray-300 border border-gray-700 hover:border-cyan-500/50 transition-colors">
                                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {user.email}
                                </span>
                            )}
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-800/80 text-gray-300 border border-gray-700 hover:border-purple-500/50 transition-colors">
                                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Joined {new Date(user?.created_at || '').toLocaleDateString()}
                            </span>
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-800/80 text-gray-300 border border-gray-700 hover:border-pink-500/50 transition-colors">
                                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Tel Aviv, Israel
                            </span>
                        </div>

                        {/* Social Links */}
                        <div className="flex gap-3">
                            <a href={`https://github.com/${user?.username}`} target="_blank" rel="noopener noreferrer"
                                className="w-10 h-10 bg-gray-800/80 border border-gray-700 rounded-lg flex items-center justify-center hover:border-cyan-500 hover:bg-gray-700 transition-all hover-lift">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-800/80 border border-gray-700 rounded-lg flex items-center justify-center hover:border-purple-500 hover:bg-gray-700 transition-all hover-lift">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-800/80 border border-gray-700 rounded-lg flex items-center justify-center hover:border-pink-500 hover:bg-gray-700 transition-all hover-lift">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid - Super Enhanced */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="group animate-stagger-3 bg-gradient-to-br from-cyan-500/20 to-cyan-600/5 border border-cyan-500/30 rounded-xl p-5 hover:border-cyan-500/70 hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/30 cursor-default backdrop-blur-xl hover-lift relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent shimmer-effect opacity-0 group-hover:opacity-100"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Repositories</div>
                            <div className="text-2xl group-hover:scale-110 transition-transform">📁</div>
                        </div>
                        <div className="text-4xl font-bold text-white tabular-nums mb-2">{counters.repos}</div>
                        <div className="progress-bar mb-2">
                            <div className="progress-bar-fill" style={{ width: '60%' }}></div>
                        </div>
                        <div className="text-xs text-cyan-400 mt-1">+2 this month</div>
                    </div>
                </div>

                <div className="group animate-stagger-4 bg-gradient-to-br from-purple-500/20 to-purple-600/5 border border-purple-500/30 rounded-xl p-5 hover:border-purple-500/70 hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/30 cursor-default backdrop-blur-xl hover-lift relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent shimmer-effect opacity-0 group-hover:opacity-100"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Commits This Month</div>
                            <div className="text-2xl group-hover:scale-110 transition-transform">⚡</div>
                        </div>
                        <div className="text-4xl font-bold text-white tabular-nums mb-2">{counters.commits}</div>
                        <div className="progress-bar mb-2">
                            <div className="progress-bar-fill" style={{ width: '85%' }}></div>
                        </div>
                        <div className="text-xs text-purple-400 mt-1">+15% from last month</div>
                    </div>
                </div>

                <div className="group animate-stagger-5 bg-gradient-to-br from-pink-500/20 to-pink-600/5 border border-pink-500/30 rounded-xl p-5 hover:border-pink-500/70 hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/30 cursor-default backdrop-blur-xl hover-lift relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/10 to-transparent shimmer-effect opacity-0 group-hover:opacity-100"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Pull Requests</div>
                            <div className="text-2xl group-hover:scale-110 transition-transform">🔀</div>
                        </div>
                        <div className="text-4xl font-bold text-white tabular-nums mb-2">{counters.prs}</div>
                        <div className="progress-bar mb-2">
                            <div className="progress-bar-fill" style={{ width: '70%' }}></div>
                        </div>
                        <div className="text-xs text-pink-400 mt-1">8 merged this week</div>
                    </div>
                </div>

                <div className="group animate-stagger-6 bg-gradient-to-br from-green-500/20 to-green-600/5 border border-green-500/30 rounded-xl p-5 hover:border-green-500/70 hover:scale-[1.03] transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/30 cursor-default backdrop-blur-xl hover-lift relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent shimmer-effect opacity-0 group-hover:opacity-100"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Code Reviews</div>
                            <div className="text-2xl group-hover:scale-110 transition-transform">✅</div>
                        </div>
                        <div className="text-4xl font-bold text-white tabular-nums mb-2">{counters.reviews}</div>
                        <div className="progress-bar mb-2">
                            <div className="progress-bar-fill" style={{ width: '90%' }}></div>
                        </div>
                        <div className="text-xs text-green-400 mt-1">12 pending</div>
                    </div>
                </div>
            </div>

            {/* Activity Timeline - Enhanced */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-xl animate-stagger-3 hover-lift">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Recent Activity
                    <span className="ml-auto text-sm text-gray-400 font-normal">Last 7 days</span>
                </h3>
                <div className="space-y-3">
                    {[
                        { type: 'commit', message: 'Fixed authentication bug in login flow', repo: 'GitArena', time: '2 hours ago', color: 'cyan', icon: '💾' },
                        { type: 'pr', message: 'Added new dashboard analytics', repo: 'GitArena', time: '5 hours ago', color: 'purple', icon: '🔀' },
                        { type: 'review', message: 'Reviewed PR #42: Update README', repo: 'GitArena', time: '1 day ago', color: 'pink', icon: '👀' },
                        { type: 'commit', message: 'Improved UI responsiveness on mobile', repo: 'GitArena', time: '2 days ago', color: 'cyan', icon: '💾' },
                        { type: 'star', message: 'Starred Repository: awesome-react', repo: 'GitHub', time: '3 days ago', color: 'yellow', icon: '⭐' },
                    ].map((activity, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-4 group hover:bg-gray-700/30 p-3 rounded-lg transition-all hover:translate-x-1 cursor-pointer border border-transparent hover:border-gray-600"
                            style={{ animation: `fadeInScale 0.4s ease-out ${0.1 * index}s both` }}
                        >
                            <div className={`w-11 h-11 rounded-full bg-${activity.color}-500/20 border border-${activity.color}-500/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                <span className="text-lg">{activity.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm group-hover:text-cyan-300 transition-colors">{activity.message}</p>
                                <p className="text-gray-400 text-xs mt-1 flex items-center gap-2">
                                    <span className="font-mono">{activity.repo}</span>
                                    <span>•</span>
                                    <span>{activity.time}</span>
                                </p>
                            </div>
                            <svg className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contribution Heatmap */}
            <div className="animate-stagger-5">
                <ContributionHeatmap />
            </div>

            {/* Achievements */}
            <div className="animate-stagger-6">
                <AchievementsSection />
            </div>

            {/* Skills/Technologies - Enhanced */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-xl animate-stagger-4 hover-lift">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <span className="text-2xl">🛠️</span>
                    Skills & Technologies
                </h3>

                <div className="space-y-6">
                    {/* Frontend */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Frontend</h4>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { name: 'React', level: 95, color: 'cyan' },
                                { name: 'TypeScript', level: 90, color: 'blue' },
                                { name: 'TailwindCSS', level: 85, color: 'teal' },
                            ].map((skill) => (
                                <div key={skill.name} className="group relative">
                                    <span className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 rounded-full text-sm font-medium text-gray-200 hover:border-cyan-500/70 hover:text-cyan-400 transition-all cursor-pointer hover:scale-105 block">
                                        {skill.name}
                                    </span>
                                    {/* Tooltip with level */}
                                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                        <div className="flex items-center gap-2">
                                            <span>Proficiency:</span>
                                            <span className="text-cyan-400 font-bold">{skill.level}%</span>
                                        </div>
                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Backend */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Backend</h4>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { name: 'Python', level: 92 },
                                { name: 'FastAPI', level: 88 },
                                { name: 'PostgreSQL', level: 85 },
                            ].map((skill) => (
                                <div key={skill.name} className="group relative">
                                    <span className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 rounded-full text-sm font-medium text-gray-200 hover:border-purple-500/70 hover:text-purple-400 transition-all cursor-pointer hover:scale-105 block">
                                        {skill.name}
                                    </span>
                                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                        <div className="flex items-center gap-2">
                                            <span>Proficiency:</span>
                                            <span className="text-purple-400 font-bold">{skill.level}%</span>
                                        </div>
                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tools & DevOps */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Tools & DevOps</h4>
                        <div className="flex flex-wrap gap-2">
                            {['Docker', 'Git', 'GitHub Actions', 'VS Code'].map((skill) => (
                                <span key={skill} className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 rounded-full text-sm font-medium text-gray-200 hover:border-pink-500/70 hover:text-pink-400 transition-all cursor-pointer hover:scale-105">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
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
