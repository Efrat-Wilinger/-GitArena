import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

// Types (move to types file later)
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

interface SpaceDashboardResponse {
    overview: DashboardStats;
    languages: LanguageStats[];
    leaderboard: ContributorStats[];
    activity: ActivityStats[];
}

const ProjectDashboardPage: React.FC = () => {
    const { spaceId } = useParams<{ spaceId: string }>();
    const token = localStorage.getItem('token');

    const { data: dashboard, isLoading, error } = useQuery({
        queryKey: ['space-dashboard', spaceId],
        queryFn: async () => {
            const response = await axios.get<SpaceDashboardResponse>(
                `${import.meta.env.VITE_API_URL}/spaces/${spaceId}/dashboard`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        },
        enabled: !!spaceId && !!token
    });

    if (isLoading) return (
        <div className="text-white">Loading dashboard...</div>
    );
    if (error) return (
        <div className="text-red-500">Error loading dashboard</div>
    );
    if (!dashboard) return null;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="mb-2">
                <h2 className="text-lg text-gray-400 font-medium mb-2">Welcome back, User!</h2>
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-gradient mb-2">
                    Project Dashboard
                </h1>
                <p className="text-gray-400 text-sm">Real-time analytics and team insights</p>
            </div>

            <style>{`
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }
            `}</style>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Commits"
                    value={dashboard.overview.total_commits}
                    icon="⚡"
                    color="cyan"
                />
                <StatCard
                    title="Active Contributors"
                    value={dashboard.overview.active_contributors}
                    icon="👥"
                    color="purple"
                />
                <StatCard
                    title="Pull Requests"
                    value={dashboard.overview.total_prs}
                    icon="🔀"
                    color="pink"
                />
                <StatCard
                    title="Lines of Code"
                    value={dashboard.overview.total_lines_code.toLocaleString()}
                    icon="📝"
                    color="green"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Graph (Main Chart) */}
                <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-6">Commit Activity (30 Days)</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dashboard.activity}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="date" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
                                    itemStyle={{ color: '#e5e7eb' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Language Distribution */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-6">Languages</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dashboard.languages}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="bytes"
                                >
                                    {dashboard.languages.map((_, index) => (
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
                    <div className="mt-4 space-y-2">
                        {dashboard.languages.map((lang, index) => (
                            <div key={lang.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-gray-300">{lang.name}</span>
                                </div>
                                <span className="text-gray-400">{lang.percentage.toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Team Leaderboard */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-6">Top Contributors</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-400 border-b border-gray-700">
                                <th className="pb-4">User</th>
                                <th className="pb-4">Commits</th>
                                <th className="pb-4">Additions</th>
                                <th className="pb-4">Deletions</th>
                                <th className="pb-4">Impact Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {dashboard.leaderboard.map((user, index) => (
                                <tr key={user.username} className="group hover:bg-gray-700/30 transition-colors">
                                    <td className="py-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                                            {user.username[0].toUpperCase()}
                                        </div>
                                        <span className="text-gray-200 font-medium">{user.username}</span>
                                        {index === 0 && <span className="text-yellow-400">👑</span>}
                                    </td>
                                    <td className="py-4 text-gray-300">{user.commits}</td>
                                    <td className="py-4 text-green-400">+{user.additions}</td>
                                    <td className="py-4 text-red-400">-{user.deletions}</td>
                                    <td className="py-4">
                                        <div className="w-full bg-gray-700 rounded-full h-2 max-w-[100px]">
                                            <div
                                                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                                                style={{ width: `${Math.min((user.commits / dashboard.leaderboard[0].commits) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: number | string, icon: string, color: string }) => {
    const colorClasses = {
        cyan: 'from-cyan-500/20 to-cyan-600/5 text-cyan-400 border-cyan-500/30 hover:border-cyan-500/50 hover:shadow-cyan-500/20',
        purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/30 hover:border-purple-500/50 hover:shadow-purple-500/20',
        pink: 'from-pink-500/20 to-pink-600/5 text-pink-400 border-pink-500/30 hover:border-pink-500/50 hover:shadow-pink-500/20',
        green: 'from-green-500/20 to-green-600/5 text-green-400 border-green-500/30 hover:border-green-500/50 hover:shadow-green-500/20',
    };

    return (
        <div className={`group bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} border rounded-2xl p-6 backdrop-blur-xl hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl cursor-default`}>
            <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider">{title}</span>
                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
            </div>
            <div className="text-4xl font-bold text-white tabular-nums">{value}</div>
        </div>
    );
};

const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

export default ProjectDashboardPage;
