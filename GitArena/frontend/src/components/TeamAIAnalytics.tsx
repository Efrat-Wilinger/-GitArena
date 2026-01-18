import React, { useEffect, useState } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { githubApi, TeamMember } from '../api/github';

interface TeamAIAnalyticsProps {
    projectId?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const TeamAIAnalytics: React.FC<TeamAIAnalyticsProps> = ({ projectId }) => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!projectId) return;
            setLoading(true);
            try {
                const data = await githubApi.getManagerTeamMembers(projectId);
                setMembers(data);
            } catch (error) {
                console.error("Failed to fetch team stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [projectId]);

    if (!projectId) return null;
    if (loading) return <div className="text-center text-slate-400 p-8">Loading team intelligence...</div>;
    if (members.length === 0) return <div className="text-center text-slate-400 p-8">No team data available.</div>;

    // derived data for charts
    const activityData = members.map(m => ({
        name: m.name || m.username,
        commits: m.stats.commits,
        prs: m.stats.prs,
        reviews: m.stats.reviews,
        total: m.stats.commits + m.stats.prs + m.stats.reviews
    })).sort((a, b) => b.total - a.total).slice(0, 5);

    const workDistribution = [
        { name: 'Commits', value: members.reduce((acc, m) => acc + m.stats.commits, 0) },
        { name: 'PRs', value: members.reduce((acc, m) => acc + m.stats.prs, 0) },
        { name: 'Reviews', value: members.reduce((acc, m) => acc + m.stats.reviews, 0) }
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">📊</span> Team Activity Analysis
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Leaderboard Chart */}
                <div className="modern-card p-6 min-h-[400px]">
                    <h3 className="text-lg font-semibold text-white mb-4">Top Contributors</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                                <XAxis type="number" stroke="#9CA3AF" />
                                <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={100} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#E5E7EB' }}
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                />
                                <Bar dataKey="commits" name="Commits" stackId="a" fill="#0088FE" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="prs" name="PRs" stackId="a" fill="#00C49F" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Work Distribution Pie Chart */}
                <div className="modern-card p-6 min-h-[400px]">
                    <h3 className="text-lg font-semibold text-white mb-4">Activity Breakdown</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={workDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {workDistribution.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#E5E7EB' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Team Stats Table */}
            <div className="modern-card p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span>🏆</span> Team Leaderboard
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700 text-slate-400">
                                <th className="pb-4 pl-4">Member</th>
                                <th className="pb-4">Role</th>
                                <th className="pb-4 text-center">Commits</th>
                                <th className="pb-4 text-center">PRs</th>
                                <th className="pb-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {members.map((member) => (
                                <tr key={member.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="py-4 pl-4 flex items-center gap-3">
                                        <img src={member.avatar_url} alt={member.name} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <div className="font-medium text-white">{member.name || member.username}</div>
                                            <div className="text-xs text-slate-500">{member.email}</div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-slate-300">
                                        <span className={`px-2 py-1 rounded text-xs ${member.role === 'manager' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-300'}`}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td className="py-4 text-center font-mono text-blue-400">{member.stats.commits}</td>
                                    <td className="py-4 text-center font-mono text-green-400">{member.stats.prs}</td>
                                    <td className="py-4">
                                        <span className={`text-xs ${member.stats.commits > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                                            {member.stats.commits > 0 ? 'Active' : 'Inactive'}
                                        </span>
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

export default TeamAIAnalytics;
