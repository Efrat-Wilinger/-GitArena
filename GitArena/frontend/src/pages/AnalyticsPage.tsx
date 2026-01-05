import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { githubApi } from '../api/github';
import { useProject } from '../contexts/ProjectContext';

interface AnalyticsData {
    commitTrend: Array<{ date: string; count: number }>;
    languageDistribution: Array<{ name: string; percentage: number }>;
    teamMetrics: {
        totalCommits: number;
        totalPRs: number;
        avgReviewTime: number;
    };
    teamMembers?: Array<{
        name: string;
        commits: number;
        prs: number;
        reviews: number;
        avatar: string;
    }>;
    insights?: Array<{
        icon: string;
        title: string;
        description: string;
        color: string;
    }>;
}

const AnalyticsPage: React.FC = () => {
    const { spaceId: routeSpaceId } = useParams<{ spaceId: string }>();
    const { currentProjectId } = useProject();
    const token = localStorage.getItem('token');

    // Prioritize route param, then context project, then fallback (which we might prevent)
    const activeSpaceId = routeSpaceId || currentProjectId?.toString();

    const { data: analytics, isLoading, error } = useQuery<AnalyticsData>({
        queryKey: ['analytics', activeSpaceId],
        queryFn: async () => {
            if (activeSpaceId) {
                return githubApi.getAnalytics(activeSpaceId, '6months');
            } else {
                // Return empty or throw error if no project selected
                throw new Error("No project selected");
            }
        },
        enabled: !!token && !!activeSpaceId
    });

    if (!activeSpaceId) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-white mb-2">No Project Selected</h3>
                <p className="text-slate-400">Please select a project from the top bar to view analytics.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto space-y-8 pb-12">
                <div className="modern-card p-8 animate-pulse">
                    <div className="h-8 bg-slate-800 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="modern-card p-6 animate-pulse">
                            <div className="h-24 bg-slate-800 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto">
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-8 text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-red-400 text-xl font-semibold mb-2">Error loading analytics</h3>
                    <p className="text-gray-400">Please try again later</p>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="max-w-7xl mx-auto">
                <div className="modern-card p-8 text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-gray-400 text-xl font-semibold mb-2">No analytics data available</h3>
                    <p className="text-gray-500">Start contributing to see analytics</p>
                </div>
            </div>
        );
    }

    const monthlyCommits = analytics.commitTrend || [];
    const maxCommits = monthlyCommits.length > 0 ? Math.max(...monthlyCommits.map(m => m.count)) : 1;
    const teamMembers = analytics.teamMembers || [];
    const insights = analytics.insights || [];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">

            {/* Page Header */}
            <div className="modern-card p-8">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
                    <p className="text-slate-400">Insights and metrics for your team</p>
                </div>
            </div>

            {/* Insights Cards */}
            {insights.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {insights.map((insight, index) => (
                        <div key={index} className="modern-card p-6 hover:border-blue-500/50 transition-all group">
                            <div className="text-4xl mb-4">{insight.icon}</div>
                            <h3 className="text-lg font-bold text-white mb-2">{insight.title}</h3>
                            <p className="text-sm text-slate-400">{insight.description}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Monthly Commits Chart */}
            {monthlyCommits.length > 0 ? (
                <div className="modern-card p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                        Commit Trend
                    </h3>

                    <div className="flex items-end justify-between gap-4 h-64">
                        {monthlyCommits.map((data, index) => {
                            const heightPercentage = (data.count / maxCommits) * 100;
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center gap-3">
                                    <div className="w-full flex items-end justify-center flex-1">
                                        <div
                                            className="w-full bg-gradient-blue rounded-t-xl transition-all duration-700 hover:opacity-80 cursor-pointer relative group"
                                            style={{ height: `${heightPercentage}%` }}
                                        >
                                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-900 px-3 py-1.5 rounded-lg text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700">
                                                {data.count} commits
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text font-medium text-white">{data.count}</div>
                                        <div className="text-sm text-slate-500 mt-1">{data.date}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="modern-card p-8 text-center">
                    <p className="text-slate-500">No commit trend data available</p>
                </div>
            )}

            {/* Team Leaderboard */}
            {teamMembers.length > 0 ? (
                <div className="modern-card p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                        Team Leaderboard
                    </h3>

                    <div className="space-y-4">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group">
                                {/* Rank */}
                                <div className="w-8 h-8 rounded-lg bg-gradient-blue flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    {index + 1}
                                </div>

                                {/* Avatar & Name */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="text-3xl">{member.avatar}</div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-white font-semibold truncate group-hover:text-blue-400 transition-colors">
                                            {member.name}
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex gap-6 text-sm flex-shrink-0">
                                    <div className="text-center">
                                        <div className="text-blue-400 font-bold">{member.commits}</div>
                                        <div className="text-slate-500 text-xs">Commits</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-blue-400 font-bold">{member.prs}</div>
                                        <div className="text-slate-500 text-xs">PRs</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-blue-400 font-bold">{member.reviews}</div>
                                        <div className="text-slate-500 text-xs">Reviews</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="modern-card p-8 text-center">
                    <p className="text-slate-500">No team member data available</p>
                </div>
            )}

            {/* Team Metrics Summary */}
            {analytics.teamMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="modern-card p-6">
                        <div className="text-4xl mb-3">📊</div>
                        <div className="text-3xl font-bold text-blue-400 mb-1">
                            {analytics.teamMetrics.totalCommits}
                        </div>
                        <div className="text-sm text-slate-400">Total Commits</div>
                    </div>
                    <div className="modern-card p-6">
                        <div className="text-4xl mb-3">🔀</div>
                        <div className="text-3xl font-bold text-blue-400 mb-1">
                            {analytics.teamMetrics.totalPRs}
                        </div>
                        <div className="text-sm text-slate-400">Pull Requests</div>
                    </div>
                    <div className="modern-card p-6">
                        <div className="text-4xl mb-3">⚡</div>
                        <div className="text-3xl font-bold text-blue-400 mb-1">
                            {analytics.teamMetrics.avgReviewTime}h
                        </div>
                        <div className="text-sm text-slate-400">Avg Review Time</div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AnalyticsPage;

