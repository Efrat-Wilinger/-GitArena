import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

// Types
interface DashboardStats {
    total_commits: number;
    total_prs: number;
    active_contributors: number;
    total_lines_code: number;
}

interface LanguageStats {
    name: string;
    bytes: number;
    percentage: number;
}

interface ContributorStats {
    username: string;
    avatar_url: string | null;
    commits: number;
    additions: number;
    deletions: number;
}

interface ActivityStats {
    date: string;
    count: number;
}

interface ProjectProgress {
    overall: number;
    planning: number;
    development: number;
    testing: number;
    deployment: number;
}

interface GitHubActivity {
    id: number;
    github_id: string;
    type: string;
    action: string;
    title: string;
    description: string | null;
    user_login: string;
    created_at: string;
}

interface SpaceDashboardResponse {
    overview: DashboardStats;
    languages: LanguageStats[];
    leaderboard: ContributorStats[];
    activity: ActivityStats[];
    progress: ProjectProgress;
    recent_activities: GitHubActivity[];
}

const ProjectDashboardPage: React.FC = () => {
    const { spaceId } = useParams<{ spaceId: string }>();
    const token = localStorage.getItem('token');
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');

    const { data: dashboard, isLoading, error } = useQuery({
        queryKey: ['space-dashboard', spaceId],
        queryFn: async () => {
            const response = await apiClient.get<SpaceDashboardResponse>(`/spaces/${spaceId}/dashboard`);
            return response.data;
        },
        enabled: !!spaceId && !!token
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64 animate-fade-in">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-red-400 text-xl font-semibold mb-2">Error loading dashboard</h3>
                <p className="text-gray-400">Please try again later</p>
            </div>
        );
    }

    if (!dashboard) return null;

    // Use synced progress data with safe fallbacks
    const projectProgress = dashboard.progress || {
        overall: 0,
        planning: 0,
        development: 0,
        testing: 0,
        deployment: 0
    };

    const overview = dashboard.overview || {
        total_commits: 0,
        total_prs: 0,
        active_contributors: 0,
        total_lines_code: 0
    };

    const weeklyTarget = 50; // commits per week
    const currentWeekCommits = Math.floor(overview.total_commits / 4); // mock

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header with Period Selector */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gradient mb-2">
                        Project Dashboard
                    </h1>
                    <p className="text-gray-400">Real-time progress and team analytics</p>
                </div>

                {/* Period Selector */}
                <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-lg p-1">
                    {(['week', 'month', 'all'] as const).map((period) => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${selectedPeriod === period
                                ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                }`}
                        >
                            {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All Time'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Commits"
                    value={overview.total_commits}
                    icon="⚡"
                    color="cyan"
                    trend="+12%"
                />
                <StatCard
                    title="Active Contributors"
                    value={overview.active_contributors}
                    icon="👥"
                    color="purple"
                    trend="+2"
                />
                <StatCard
                    title="Pull Requests"
                    value={overview.total_prs}
                    icon="🔀"
                    color="pink"
                    trend="+5%"
                />
                <StatCard
                    title="Lines of Code"
                    value={(overview.total_lines_code || 0).toLocaleString()}
                    icon="📝"
                    color="green"
                    trend="+8.2K"
                />
            </div>

            {/* Project Progress Overview */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Project Progress
                </h3>

                <div className="space-y-4">
                    <ProgressBar label="Overall Progress" value={projectProgress.overall} color="cyan" />
                    <ProgressBar label="Planning" value={projectProgress.planning} color="green" />
                    <ProgressBar label="Development" value={projectProgress.development} color="purple" />
                    <ProgressBar label="Testing" value={projectProgress.testing} color="orange" />
                    <ProgressBar label="Deployment" value={projectProgress.deployment} color="pink" />
                </div>

                {/* Weekly Goal */}
                <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-300">Weekly Commit Goal</span>
                        <span className="text-cyan-400 font-bold">{currentWeekCommits}/{weeklyTarget}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
                            style={{ width: `${Math.min((currentWeekCommits / weeklyTarget) * 100, 100)}%` }}
                        />
                    </div>
                    {currentWeekCommits >= weeklyTarget && (
                        <p className="text-xs text-green-400 mt-2">🎉 Goal achieved!</p>
                    )}
                </div>
            </div>

            {/* Team Members Cards */}
            <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">👤</span>
                    Team Members ({(dashboard.leaderboard || []).length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(dashboard.leaderboard || []).map((member, index) => (
                        <MemberCard key={member.username || index} member={member} rank={index + 1} />
                    ))}
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Chart - Takes 2 columns */}
                <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-6">Commit Activity</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dashboard.activity || []}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="date" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
                                    itemStyle={{ color: '#e5e7eb' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#06b6d4" fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Language Distribution */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-6">Languages</h3>
                    <div className="h-[220px] mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dashboard.languages || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="bytes"
                                >
                                    {(dashboard.languages || []).map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
                                    itemStyle={{ color: '#e5e7eb' }}
                                    formatter={(value: number) => `${(value / 1024).toFixed(1)} KB`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                        {(dashboard.languages || []).slice(0, 5).map((lang, index) => (
                            <div key={lang.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-gray-300">{lang.name}</span>
                                </div>
                                <span className="text-gray-400">{lang.percentage?.toFixed(1) || 0}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <span className="text-2xl">🏆</span>
                    Top Contributors
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-400 border-b border-gray-700">
                                <th className="pb-4 font-semibold">Rank</th>
                                <th className="pb-4 font-semibold">User</th>
                                <th className="pb-4 font-semibold">Commits</th>
                                <th className="pb-4 font-semibold">Added</th>
                                <th className="pb-4 font-semibold">Removed</th>
                                <th className="pb-4 font-semibold">Activity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {(dashboard.leaderboard || []).map((user, index) => (
                                <tr key={user.username} className="group hover:bg-gray-700/30 transition-colors">
                                    <td className="py-4">
                                        <div className="flex items-center gap-2">
                                            {index < 3 && (
                                                <span className="text-xl">
                                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                                </span>
                                            )}
                                            {index >= 3 && <span className="text-gray-500 font-mono">#{index + 1}</span>}
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                                                {user.username?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <span className="text-gray-200 font-medium">{user.username}</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className="font-semibold text-cyan-400">{user.commits}</span>
                                    </td>
                                    <td className="py-4 text-green-400 font-mono">+{user.additions?.toLocaleString() || 0}</td>
                                    <td className="py-4 text-red-400 font-mono">-{user.deletions?.toLocaleString() || 0}</td>
                                    <td className="py-4">
                                        <div className="w-32 bg-gray-700 rounded-full h-2.5">
                                            <div
                                                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2.5 rounded-full transition-all"
                                                style={{ width: `${dashboard.leaderboard?.[0]?.commits ? Math.min((user.commits / dashboard.leaderboard[0].commits) * 100, 100) : 0}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    Recent Activity Feed
                </h3>
                <div className="space-y-4">
                    {dashboard.recent_activities && dashboard.recent_activities.length > 0 ? (
                        dashboard.recent_activities.map((activity) => (
                            <ActivityItem key={activity.id} activity={activity} />
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">No recent activities found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color, trend }: {
    title: string;
    value: number | string;
    icon: string;
    color: string;
    trend?: string;
}) => {
    const colorClasses = {
        cyan: 'from-cyan-500/20 to-cyan-600/5 text-cyan-400 border-cyan-500/30 hover:border-cyan-500/50',
        purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/30 hover:border-purple-500/50',
        pink: 'from-pink-500/20 to-pink-600/5 text-pink-400 border-pink-500/30 hover:border-pink-500/50',
        green: 'from-green-500/20 to-green-600/5 text-green-400 border-green-500/30 hover:border-green-500/50',
        orange: 'from-orange-500/20 to-orange-600/5 text-orange-400 border-orange-500/30 hover:border-orange-500/50',
    };

    return (
        <div className={`group bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} border rounded-xl p-5 backdrop-blur-xl hover:scale-105 transition-all duration-300 hover:shadow-xl cursor-default`}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{title}</span>
                <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>
            </div>
            <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-white tabular-nums">{value}</div>
                {trend && (
                    <div className="text-green-400 text-sm font-semibold flex items-center gap-1">
                        <span>↑</span>
                        <span>{trend}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// Progress Bar Component
const ProgressBar = ({ label, value, color }: { label: string; value: number; color: string }) => {
    const colorClasses = {
        cyan: 'from-cyan-500 to-cyan-400',
        green: 'from-green-500 to-green-400',
        purple: 'from-purple-500 to-purple-400',
        orange: 'from-orange-500 to-orange-400',
        pink: 'from-pink-500 to-pink-400',
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">{label}</span>
                <span className="text-sm font-bold text-white">{value}%</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} transition-all duration-700 ease-out`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
};

// Member Card Component
const MemberCard = ({ member, rank }: { member: ContributorStats; rank: number }) => {
    const additions = member.additions || 0;
    const deletions = member.deletions || 0;
    const totalChanges = additions + deletions;
    const additionRatio = totalChanges > 0 ? (additions / totalChanges) * 100 : 0;
    const username = member.username || 'Unknown';

    return (
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-5 hover-lift hover:border-cyan-500/50 transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-lg font-bold text-white shadow-lg">
                        {username[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <h4 className="font-semibold text-white">{username}</h4>
                        <p className="text-xs text-gray-400">Rank #{rank}</p>
                    </div>
                </div>
                {rank <= 3 && (
                    <span className="text-2xl">{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</span>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Commits</span>
                    <span className="font-bold text-cyan-400">{member.commits}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Lines Added</span>
                    <span className="font-mono text-green-400">+{additions.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Lines Removed</span>
                    <span className="font-mono text-red-400">-{deletions.toLocaleString()}</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                    <span>Code Balance</span>
                    <span>{additionRatio.toFixed(0)}% positive</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden flex">
                    <div className="bg-green-500" style={{ width: `${additionRatio}%` }} />
                    <div className="bg-red-500" style={{ width: `${100 - additionRatio}%` }} />
                </div>
            </div>
        </div>
    );
};

// Activity Item Component
const ActivityItem = ({ activity }: { activity: GitHubActivity }) => {
    const getIcon = (type: string) => {
        switch (type) {
            case 'PushEvent': return '💻';
            case 'PullRequestEvent': return '🔀';
            case 'IssuesEvent': return '❗';
            case 'ReleaseEvent': return '🚀';
            default: return '🔹';
        }
    };

    const getBadgeColor = (type: string) => {
        switch (type) {
            case 'PushEvent': return 'bg-cyan-500/20 text-cyan-400';
            case 'PullRequestEvent': return 'bg-purple-500/20 text-purple-400';
            case 'IssuesEvent': return 'bg-orange-500/20 text-orange-400';
            case 'ReleaseEvent': return 'bg-pink-500/20 text-pink-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const dateStr = activity.created_at ? new Date(activity.created_at).toLocaleString() : 'Recent';

    return (
        <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-700/30 transition-colors border border-transparent hover:border-gray-700">
            <div className="text-2xl mt-1">{getIcon(activity.type || '')}</div>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <h4 className="text-gray-200 font-medium text-sm">{activity.title || 'Repository Activity'}</h4>
                    <span className="text-[10px] text-gray-500 font-mono">
                        {dateStr}
                    </span>
                </div>
                {activity.description && (
                    <p className="text-xs text-gray-400 mb-2 line-clamp-2">{activity.description}</p>
                )}
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${getBadgeColor(activity.type || '')}`}>
                        {(activity.type || 'Activity').replace('Event', '')}
                    </span>
                    <span className="text-[10px] text-gray-500">by {activity.user_login || 'ghost'}</span>
                </div>
            </div>
        </div>
    );
};

const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

export default ProjectDashboardPage;
