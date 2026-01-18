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
    if (members.length === 0) return (
        <div className="modern-card p-8 text-center text-slate-400">
            <h3 className="text-xl font-bold text-white mb-2">No Data Available</h3>
            <p>We couldn't find any commit activity for this project. <br />Ensure your repositories are synced and contain recent commits.</p>
        </div>
    );

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

        </div>
    );
};

export default TeamAIAnalytics;
