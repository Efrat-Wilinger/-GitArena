import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

interface LeaderboardEntry {
    rank: number;
    name: string;
    avatar_url?: string;
    commits: number;
    prs: number;
    reviews: number;
    total_score: number;
}

interface LeaderboardWidgetProps {
    projectId?: number;
}

export const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({ projectId }) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['leaderboard', projectId],
        queryFn: async () => {
            const params = projectId ? { project_id: projectId } : {};
            const response = await apiClient.get('/analytics/leaderboard', { params });
            return response.data;
        }
    });

    if (isLoading) {
        return (
            <div className="modern-card p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🏆</span>
                    <h3 className="text-lg font-bold text-white">Team Leaderboard</h3>
                </div>
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            </div>
        );
    }

    if (error || !data?.entries) {
        return (
            <div className="modern-card p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🏆</span>
                    <h3 className="text-lg font-bold text-white">Team Leaderboard</h3>
                </div>
                <p className="text-slate-400">No leaderboard data available</p>
            </div>
        );
    }

    const getMedalEmoji = (rank: number) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `#${rank}`;
        }
    };

    return (
        <div className="modern-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🏆</span>
                    <h3 className="text-lg font-bold text-white">Team Leaderboard</h3>
                </div>
                <span className="text-xs text-slate-500 uppercase tracking-wide">{data.period}</span>
            </div>

            <div className="space-y-3">
                {data.entries.map((entry: LeaderboardEntry) => (
                    <div
                        key={entry.rank}
                        className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 hover:scale-102 ${entry.rank <= 3
                                ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20'
                                : 'bg-slate-800/30 hover:bg-slate-800/50'
                            }`}
                    >
                        {/* Rank Badge */}
                        <div className="flex-shrink-0 w-12 text-center">
                            <span className={`text-xl font-bold ${entry.rank === 1 ? 'text-yellow-400' :
                                    entry.rank === 2 ? 'text-gray-300' :
                                        entry.rank === 3 ? 'text-amber-600' :
                                            'text-slate-400'
                                }`}>
                                {getMedalEmoji(entry.rank)}
                            </span>
                        </div>

                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            {entry.avatar_url ? (
                                <img
                                    src={entry.avatar_url}
                                    alt={entry.name}
                                    className="w-10 h-10 rounded-full ring-2 ring-blue-500/30"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                    {entry.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Name & Stats */}
                        <div className="flex-1">
                            <p className="font-semibold text-white">{entry.name}</p>
                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                <span title="Commits">💻 {entry.commits}</span>
                                <span title="Pull Requests">🔀 {entry.prs}</span>
                                <span title="Reviews">👀 {entry.reviews}</span>
                            </div>
                        </div>

                        {/* Score */}
                        <div className="flex-shrink-0 text-right">
                            <p className="text-lg font-bold text-blue-400">{entry.total_score}</p>
                            <p className="text-xs text-slate-500">pts</p>
                        </div>
                    </div>
                ))}
            </div>

            {data.entries.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                    <p>🏜️ No contributors yet</p>
                    <p className="text-sm mt-2">Start contributing to appear on the leaderboard!</p>
                </div>
            )}
        </div>
    );
};

export default LeaderboardWidget;
