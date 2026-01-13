import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface CommitData {
    date: string;
    count: number;
    additions?: number;
    deletions?: number;
}

interface AnimatedCommitGraphProps {
    data?: CommitData[];
    repoId?: string;
}

export const AnimatedCommitGraph: React.FC<AnimatedCommitGraphProps> = ({ data = [] }) => {
    // Ensure we have data to display
    const chartData = data.length > 0 ? data : [];

    const totalCommits = chartData.reduce((acc, curr) => acc + curr.count, 0);
    const totalAdditions = chartData.reduce((acc, curr) => acc + (curr.additions || 0), 0);
    const totalDeletions = chartData.reduce((acc, curr) => acc + (curr.deletions || 0), 0);

    if (chartData.length === 0) {
        return (
            <div className="modern-card p-8 flex items-center justify-center min-h-[300px]">
                <div className="text-center text-slate-500">
                    <div className="text-4xl mb-4">📉</div>
                    <p>No commit activity to display</p>
                </div>
            </div>
        );
    }

    return (
        <div className="modern-card p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-8 bg-blue-500 rounded-full animate-pulse"></span>
                    Commit Activity
                </h3>
                <div className="flex gap-6 text-sm">
                    <div className="text-center">
                        <div className="text-blue-400 font-bold text-lg">{totalCommits}</div>
                        <div className="text-slate-500 text-xs uppercase">Commits</div>
                    </div>
                    <div className="text-center">
                        <div className="text-green-400 font-bold text-lg">+{totalAdditions.toLocaleString()}</div>
                        <div className="text-slate-500 text-xs uppercase">Added</div>
                    </div>
                    <div className="text-center">
                        <div className="text-red-400 font-bold text-lg">-{totalDeletions.toLocaleString()}</div>
                        <div className="text-slate-500 text-xs uppercase">Deleted</div>
                    </div>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#64748b"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            stroke="#64748b"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            itemStyle={{ color: '#e2e8f0' }}
                            labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorCount)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AnimatedCommitGraph;
