import React from 'react';
import { LanguageStats, CommitStats, PRStats } from '../api/auth';

export const LanguageDistribution: React.FC<{ data?: LanguageStats[] }> = ({ data }) => {
    const languages = data || [];

    return (
        <div className="modern-card p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                Languages
            </h3>

            <div className="space-y-4">
                {languages.length > 0 ? languages.map((lang, index) => (
                    <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-white font-medium">{lang.name}</span>
                            <span className="text-slate-400">{lang.percentage}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${lang.color} transition-all duration-1000 ease-out rounded-full`}
                                style={{ width: `${lang.percentage}%` }}
                            />
                        </div>
                    </div>
                )) : (
                    <p className="text-slate-500 text-sm">No language data available</p>
                )}
            </div>
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
                    <div key={index} className="group p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm truncate mb-1">
                                    {commit.message}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span className="font-mono">{commit.repo}</span>
                                    <span>•</span>
                                    <span>{commit.time}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs flex-shrink-0">
                                <span className="text-green-400">+{commit.additions}</span>
                                <span className="text-red-400">-{commit.deletions}</span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <p className="text-slate-500 text-sm">No recent commits</p>
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

            <div className="grid grid-cols-3 gap-4">
                {stats.length > 0 && stats.map((stat, index) => (
                    <div key={index} className={`${stat.bgColor} rounded-lg p-4 text-center`}>
                        <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                            {stat.count}
                        </div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide">
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
