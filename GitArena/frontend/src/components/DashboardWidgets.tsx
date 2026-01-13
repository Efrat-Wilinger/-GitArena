import React from 'react';
import { LanguageStats, CommitStats, PRStats } from '../api/auth';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

export const LanguageDistribution: React.FC<{ data?: LanguageStats[] }> = ({ data }) => {
    const languages = data || [];

    // Colors mapping ensuring they match the data color prop or fallback
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const chartData = languages.map(lang => ({
        name: lang.name,
        value: lang.percentage
    }));

    return (
        <div className="modern-card p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                Languages
            </h3>

            {languages.length > 0 ? (
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                iconType="circle"
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <p className="text-slate-500 text-sm text-center py-10">No language data available</p>
            )}
        </div>
    );
};

export const RecentCommits: React.FC<{ data?: CommitStats[] }> = ({ data }) => {
    const commits = data || [];

    return (
        <div className="modern-card p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                Recent Commits
            </h3>

            <div className="space-y-4">
                {commits.length > 0 ? commits.map((commit, index) => (
                    <div key={index} className="group p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-slate-700">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm truncate mb-1">
                                    {commit.message}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">{commit.repo}</span>
                                    <span>•</span>
                                    <span>{commit.time}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs flex-shrink-0 font-mono">
                                <span className="text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">+{commit.additions}</span>
                                <span className="text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">-{commit.deletions}</span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <p className="text-slate-500 text-sm text-center py-4">No recent commits</p>
                )}
            </div>
        </div>
    );
};

export const PullRequestStatus: React.FC<{ data?: PRStats[] }> = ({ data }) => {
    const stats = data || [];

    return (
        <div className="modern-card p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                Pull Requests
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.length > 0 && stats.map((stat, index) => (
                    <div key={index} className={`${stat.bgColor} rounded-xl p-5 text-center transition-transform hover:scale-105 duration-300`}>
                        <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                            {stat.count}
                        </div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


export const WeeklyActivity: React.FC<{ data?: number[] }> = ({ data }) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // Use real data or empty array
    const activity = data && data.length === 7 ? data : [0, 0, 0, 0, 0, 0, 0];
    const maxActivity = Math.max(...activity, 1); // prevent div by zero

    return (
        <div className="modern-card p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                This Week
            </h3>

            <div className="flex items-end justify-between gap-2 h-32">
                {days.map((day, index) => {
                    const heightPercentage = (activity[index] / maxActivity) * 100;
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full flex items-end justify-center flex-1">
                                <div
                                    className="w-full bg-gradient-blue rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer relative group"
                                    style={{ height: `${heightPercentage}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {activity[index]} commits
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-slate-500">{day}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
