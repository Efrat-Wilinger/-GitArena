import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import apiClient from '../api/client';

interface ProjectFeedbackItem {
    id: number;
    user: {
        username: string;
        email: string;
    };
    content: {
        stats: {
            commits: number;
            prs_merged: number;
            reviews_given: number;
            performance_score: number;
        };
        improvement_suggestions: string;
    };
    meta_data: {
        performance_score: number;
        is_best_performer: boolean;
    };
    created_at: string;
}

const ProjectAIFeedbackTab: React.FC = () => {
    const { spaceId } = useParams<{ spaceId: string }>();

    // Get repositories in this space
    const { data: repositories } = useQuery({
        queryKey: ['space-repos', spaceId],
        queryFn: async () => {
            const response = await apiClient.get(`/spaces/${spaceId}/repositories`);
            return response.data;
        },
        enabled: !!spaceId
    });

    // Get all feedback for repositories in this space
    const { data: feedbackData, isLoading } = useQuery({
        queryKey: ['space-feedback', spaceId],
        queryFn: async () => {
            if (!repositories || repositories.length === 0) return { analyses: [] };

            // Fetch feedback for all repos in this space
            const allFeedback = [];
            for (const repo of repositories) {
                try {
                    const response = await apiClient.get(`/ai/feedback/history?repository_id=${repo.id}&limit=50`);
                    if (response.data.analyses) {
                        allFeedback.push(...response.data.analyses);
                    }
                } catch (error) {
                    console.error(`Failed to fetch feedback for repo ${repo.id}`, error);
                }
            }

            return { analyses: allFeedback };
        },
        enabled: !!repositories && repositories.length > 0
    });

    const analyses: ProjectFeedbackItem[] = feedbackData?.analyses || [];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
            </div>
        );
    }

    if (analyses.length === 0) {
        return (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-12 border border-gray-700 text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-2xl font-bold text-white mb-3">
                    אין ניתוחי AI עדיין
                </h3>
                <p className="text-gray-400 mb-6">
                    הרץ ניתוח ראשון באחד מהריפוזיטוריז בפרויקט זה
                </p>
            </div>
        );
    }

    // Sort by best performer first, then by date
    const sortedAnalyses = [...analyses].sort((a, b) => {
        if (a.meta_data?.is_best_performer && !b.meta_data?.is_best_performer) return -1;
        if (!a.meta_data?.is_best_performer && b.meta_data?.is_best_performer) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const bestPerformers = sortedAnalyses.filter(a => a.meta_data?.is_best_performer);
    const totalAnalyses = analyses.length;
    const avgScore = analyses.reduce((sum, a) => sum + (a.meta_data?.performance_score || 0), 0) / totalAnalyses;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/5 border border-cyan-500/30 rounded-xl p-5">
                    <div className="text-3xl mb-2">📊</div>
                    <div className="text-2xl font-bold text-white">{totalAnalyses}</div>
                    <div className="text-sm text-gray-400">סה"כ ניתוחים</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 border border-yellow-500/30 rounded-xl p-5">
                    <div className="text-3xl mb-2">🏆</div>
                    <div className="text-2xl font-bold text-white">{bestPerformers.length}</div>
                    <div className="text-sm text-gray-400">עובדים מצטיינים</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/5 border border-purple-500/30 rounded-xl p-5">
                    <div className="text-3xl mb-2">⭐</div>
                    <div className="text-2xl font-bold text-white">{avgScore.toFixed(1)}</div>
                    <div className="text-sm text-gray-400">ציון ממוצע</div>
                </div>
            </div>

            {/* Best Performers Spotlight */}
            {bestPerformers.length > 0 && (
                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/40 rounded-2xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-3xl">🏆</span>
                        עובדים מצטיינים
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bestPerformers.map((analysis) => (
                            <div
                                key={analysis.id}
                                className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/30"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xl font-bold text-white">
                                        {analysis.user?.username?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{analysis.user?.username}</h4>
                                        <p className="text-xs text-gray-400">{analysis.user?.email}</p>
                                    </div>
                                    <span className="ml-auto text-3xl">🏆</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-center p-2 bg-gray-800/50 rounded">
                                        <div className="text-lg font-bold text-cyan-400">
                                            {analysis.content?.stats?.commits || 0}
                                        </div>
                                        <div className="text-xs text-gray-500">Commits</div>
                                    </div>
                                    <div className="text-center p-2 bg-gray-800/50 rounded">
                                        <div className="text-lg font-bold text-yellow-400">
                                            {analysis.meta_data?.performance_score?.toFixed(1) || 0}
                                        </div>
                                        <div className="text-xs text-gray-500">Score</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Team Members */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-3xl">👥</span>
                    כל חברי הצוות
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedAnalyses.map((analysis) => (
                        <div
                            key={analysis.id}
                            className={`p-4 rounded-xl border transition-all hover:shadow-lg ${analysis.meta_data?.is_best_performer
                                    ? 'bg-yellow-500/5 border-yellow-500/30'
                                    : 'bg-gray-700/30 border-gray-600 hover:border-gray-500'
                                }`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                                        {analysis.user?.username?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white text-sm">
                                            {analysis.user?.username || 'Unknown'}
                                        </h4>
                                        <p className="text-xs text-gray-400 truncate max-w-[120px]">
                                            {analysis.user?.email || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                {analysis.meta_data?.is_best_performer && (
                                    <span className="text-2xl">🏆</span>
                                )}
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="text-center p-2 bg-gray-800/50 rounded">
                                    <div className="text-sm font-bold text-cyan-400">
                                        {analysis.content?.stats?.commits || 0}
                                    </div>
                                    <div className="text-xs text-gray-500">Commits</div>
                                </div>
                                <div className="text-center p-2 bg-gray-800/50 rounded">
                                    <div className="text-sm font-bold text-green-400">
                                        {analysis.content?.stats?.prs_merged || 0}
                                    </div>
                                    <div className="text-xs text-gray-500">PRs</div>
                                </div>
                                <div className="text-center p-2 bg-gray-800/50 rounded">
                                    <div className="text-sm font-bold text-purple-400">
                                        {analysis.content?.stats?.reviews_given || 0}
                                    </div>
                                    <div className="text-xs text-gray-500">Reviews</div>
                                </div>
                                <div className="text-center p-2 bg-gray-800/50 rounded">
                                    <div className="text-sm font-bold text-yellow-400">
                                        {analysis.meta_data?.performance_score?.toFixed(1) || 0}
                                    </div>
                                    <div className="text-xs text-gray-500">Score</div>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-700">
                                {new Date(analysis.created_at).toLocaleDateString('he-IL')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProjectAIFeedbackTab;
