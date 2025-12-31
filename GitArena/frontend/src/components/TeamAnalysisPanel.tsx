import React from 'react';

interface TeamMemberStats {
    name: string;
    email: string;
    commits: number;
    additions: number;
    deletions: number;
    files_changed: number;
    prs_created: number;
    prs_merged: number;
    reviews_given: number;
    reviews_approved: number;
    performance_score: number;
}

interface AIInsights {
    team_health: string;
    top_performer_analysis: string;
    improvement_suggestions: Record<string, string>;
    collaboration_insights: string;
}

interface TeamAnalysisData {
    repository_id: number;
    repository_name: string;
    analysis_period: string;
    analyzed_at: string;
    developer_stats: Record<string, TeamMemberStats>;
    best_performer: TeamMemberStats | null;
    ai_insights: AIInsights;
}

interface TeamAnalysisPanelProps {
    data: TeamAnalysisData | null;
    isLoading: boolean;
    error?: string;
}

const TeamAnalysisPanel: React.FC<TeamAnalysisPanelProps> = ({ data, isLoading, error }) => {
    if (isLoading) {
        return (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700 animate-pulse">
                <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                    <div className="h-24 bg-gray-700 rounded"></div>
                    <div className="h-24 bg-gray-700 rounded"></div>
                    <div className="h-24 bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">⚠️</span>
                    <h3 className="text-red-400 text-lg font-semibold">Analysis Error</h3>
                </div>
                <p className="text-gray-400">{error}</p>
            </div>
        );
    }

    if (!data || !data.developer_stats || Object.keys(data.developer_stats).length === 0) {
        return (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700 text-center">
                <span className="text-4xl mb-3 block">📊</span>
                <p className="text-gray-400">No team data available yet. Start contributing to see the analysis!</p>
            </div>
        );
    }

    const developerArray = Object.values(data.developer_stats).sort(
        (a, b) => b.performance_score - a.performance_score
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="text-3xl">🤖</span>
                        AI Team Performance Analysis
                    </h2>
                    <span className="text-xs text-gray-400 bg-gray-800/70 px-3 py-1.5 rounded-lg">
                        Last 90 days
                    </span>
                </div>
                <p className="text-sm text-gray-300">
                    Analyzed on {new Date(data.analyzed_at).toLocaleString()} • {developerArray.length} team members
                </p>
            </div>

            {/* Team Health Overview */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">💚</span>
                    Team Health
                </h3>
                <p className="text-gray-300 leading-relaxed">{data.ai_insights.team_health}</p>
            </div>

            {/* Best Performer Spotlight */}
            {data.best_performer && (
                <div className="bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 border-2 border-yellow-500/40 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 text-[120px] opacity-5">🏆</div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="text-2xl">🏆</span>
                            Top Performer
                        </h3>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                                {data.best_performer.name[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                                <h4 className="text-2xl font-bold text-white">{data.best_performer.name}</h4>
                                <p className="text-sm text-gray-400">{data.best_performer.email}</p>
                            </div>
                            <div className="ml-auto">
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-yellow-400">
                                        {data.best_performer.performance_score}
                                    </div>
                                    <div className="text-xs text-gray-400">Performance Score</div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700">
                                <div className="text-xs text-gray-400 mb-1">Commits</div>
                                <div className="text-xl font-bold text-cyan-400">{data.best_performer.commits}</div>
                            </div>
                            <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700">
                                <div className="text-xs text-gray-400 mb-1">PRs Merged</div>
                                <div className="text-xl font-bold text-green-400">{data.best_performer.prs_merged}</div>
                            </div>
                            <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700">
                                <div className="text-xs text-gray-400 mb-1">Reviews</div>
                                <div className="text-xl font-bold text-purple-400">{data.best_performer.reviews_given}</div>
                            </div>
                            <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700">
                                <div className="text-xs text-gray-400 mb-1">Code Changes</div>
                                <div className="text-xl font-bold text-pink-400">
                                    {((data.best_performer.additions + data.best_performer.deletions) / 1000).toFixed(1)}k
                                </div>
                            </div>
                        </div>

                        {/* AI Analysis */}
                        <div className="bg-gray-800/80 rounded-lg p-4 border border-yellow-500/20">
                            <div className="text-sm font-semibold text-yellow-400 mb-2">Why they excel:</div>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                {data.ai_insights.top_performer_analysis}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Team Members Rankings */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Team Rankings
                </h3>
                <div className="space-y-4">
                    {developerArray.map((dev, index) => {
                        const isTopPerformer = dev === data.best_performer;
                        const suggestions = data.ai_insights.improvement_suggestions[dev.email] ||
                            data.ai_insights.improvement_suggestions[dev.name] ||
                            "Keep up the great work!";

                        return (
                            <div
                                key={dev.email}
                                className={`p-4 rounded-xl border transition-all hover:shadow-lg ${isTopPerformer
                                        ? 'bg-yellow-500/5 border-yellow-500/30 hover:border-yellow-500/50'
                                        : 'bg-gray-700/30 border-gray-600 hover:border-gray-500'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Rank Badge */}
                                    <div className="flex-shrink-0">
                                        {index < 3 ? (
                                            <span className="text-3xl">
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                            </span>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold">
                                                #{index + 1}
                                            </div>
                                        )}
                                    </div>

                                    {/* Developer Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                                                {dev.name[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-semibold">{dev.name}</h4>
                                                <p className="text-xs text-gray-400 truncate">{dev.email}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-cyan-400">
                                                    {dev.performance_score}
                                                </div>
                                                <div className="text-xs text-gray-400">Score</div>
                                            </div>
                                        </div>

                                        {/* Mini Stats */}
                                        <div className="grid grid-cols-4 gap-2 mb-3">
                                            <div className="text-center">
                                                <div className="text-sm font-semibold text-gray-300">{dev.commits}</div>
                                                <div className="text-xs text-gray-500">Commits</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm font-semibold text-green-400">
                                                    {dev.prs_merged}/{dev.prs_created}
                                                </div>
                                                <div className="text-xs text-gray-500">PRs</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm font-semibold text-purple-400">{dev.reviews_given}</div>
                                                <div className="text-xs text-gray-500">Reviews</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm font-semibold text-pink-400">
                                                    {((dev.additions + dev.deletions) / 1000).toFixed(1)}k
                                                </div>
                                                <div className="text-xs text-gray-500">Changes</div>
                                            </div>
                                        </div>

                                        {/* AI Suggestions */}
                                        <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-600">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm">💡</span>
                                                <span className="text-xs font-semibold text-gray-400">AI Suggestions</span>
                                            </div>
                                            <p className="text-xs text-gray-300 leading-relaxed">{suggestions}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Collaboration Insights */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">🤝</span>
                    Collaboration Insights
                </h3>
                <p className="text-gray-300 leading-relaxed">{data.ai_insights.collaboration_insights}</p>
            </div>

            {/* Saved to Database Notice */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-cyan-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-semibold">
                        Analysis saved to AI Feedback table • Updated {new Date(data.analyzed_at).toLocaleTimeString()}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TeamAnalysisPanel;
