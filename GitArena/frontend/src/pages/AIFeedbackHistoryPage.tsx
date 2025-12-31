import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useNavigate } from 'react-router-dom';

interface AnalysisHistoryItem {
    id: number;
    user: {
        id: number;
        username: string;
        email: string;
    };
    repository: {
        id: number;
        name: string;
    };
    content: {
        stats: {
            commits: number;
            prs_merged: number;
            reviews_given: number;
            performance_score: number;
        };
        rank: string;
        improvement_suggestions: string;
    };
    meta_data: {
        performance_score: number;
        is_best_performer: boolean;
    };
    created_at: string;
}

const AIFeedbackHistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedRepo, setSelectedRepo] = useState<number | null>(null);

    // Fetch analysis history
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['ai-feedback-history', selectedRepo],
        queryFn: async () => {
            const params = selectedRepo ? `?repository_id=${selectedRepo}` : '';
            const response = await apiClient.get(`/ai/feedback/history${params}&limit=50`);
            return response.data;
        }
    });

    // Fetch repositories list for filter
    const { data: repositories } = useQuery({
        queryKey: ['repositories-list'],
        queryFn: async () => {
            const response = await apiClient.get('/github/repos');
            return response.data;
        }
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-400">טוען היסטוריית ניתוחים...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-red-400 text-xl font-semibold mb-2">שגיאה בטעינת נתונים</h3>
                <p className="text-gray-400">{error.toString()}</p>
            </div>
        );
    }

    const analyses: AnalysisHistoryItem[] = data?.analyses || [];
    const total = data?.total || 0;

    // Group by repository
    const analysesByRepo = analyses.reduce((acc, item) => {
        const repoName = item.repository?.name || 'Unknown';
        if (!acc[repoName]) {
            acc[repoName] = [];
        }
        acc[repoName].push(item);
        return acc;
    }, {} as Record<string, AnalysisHistoryItem[]>);

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-gradient mb-2">
                        🗂️ היסטוריית ניתוחי AI
                    </h1>
                    <p className="text-gray-400">
                        כל הניתוחים שבוצעו נשמרים בטבלת ai_feedback
                    </p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    רענן
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/5 border border-cyan-500/30 rounded-xl p-5">
                    <div className="text-3xl mb-2">📊</div>
                    <div className="text-2xl font-bold text-white">{total}</div>
                    <div className="text-sm text-gray-400">סה"כ ניתוחים</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/5 border border-purple-500/30 rounded-xl p-5">
                    <div className="text-3xl mb-2">📁</div>
                    <div className="text-2xl font-bold text-white">{Object.keys(analysesByRepo).length}</div>
                    <div className="text-sm text-gray-400">ריפוזיטוריז נותחו</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 border border-yellow-500/30 rounded-xl p-5">
                    <div className="text-3xl mb-2">🏆</div>
                    <div className="text-2xl font-bold text-white">
                        {analyses.filter(a => a.meta_data?.is_best_performer).length}
                    </div>
                    <div className="text-sm text-gray-400">עובדים מצטיינים</div>
                </div>
            </div>

            {/* Filter */}
            {repositories && repositories.length > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <label className="text-sm text-gray-400 mb-2 block">סנן לפי ריפוזיטורי:</label>
                    <select
                        value={selectedRepo || ''}
                        onChange={(e) => setSelectedRepo(e.target.value ? Number(e.target.value) : null)}
                        className="w-full md:w-64 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                        <option value="">כל הריפוזיטוריז</option>
                        {repositories.map((repo: any) => (
                            <option key={repo.id} value={repo.id}>
                                {repo.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Content */}
            {total === 0 ? (
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-12 border border-gray-700 text-center">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-2xl font-bold text-white mb-3">אין ניתוחים עדיין</h3>
                    <p className="text-gray-400 mb-6">
                        הטבלה ריקה. הרץ ניתוח ראשון כדי לראות נתונים פה!
                    </p>
                    <button
                        onClick={() => navigate('/repositories')}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-semibold rounded-lg hover:from-cyan-500 hover:to-purple-500 transition-all"
                    >
                        עבור לריפוזיטוריז
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(analysesByRepo).map(([repoName, repoAnalyses]) => (
                        <div key={repoName} className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="text-3xl">📁</span>
                                {repoName}
                                <span className="text-sm text-gray-400 font-normal">({repoAnalyses.length} ניתוחים)</span>
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {repoAnalyses.map((analysis) => (
                                    <div
                                        key={analysis.id}
                                        className={`p-4 rounded-xl border transition-all hover:shadow-lg ${analysis.meta_data?.is_best_performer
                                                ? 'bg-yellow-500/5 border-yellow-500/30 hover:border-yellow-500/50'
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
                                                    <h4 className="font-semibold text-white">{analysis.user?.username || 'Unknown'}</h4>
                                                    <p className="text-xs text-gray-400 truncate">{analysis.user?.email || 'N/A'}</p>
                                                </div>
                                            </div>
                                            {analysis.meta_data?.is_best_performer && (
                                                <span className="text-2xl">🏆</span>
                                            )}
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            <div className="text-center p-2 bg-gray-800/50 rounded">
                                                <div className="text-lg font-bold text-cyan-400">{analysis.content?.stats?.commits || 0}</div>
                                                <div className="text-xs text-gray-500">Commits</div>
                                            </div>
                                            <div className="text-center p-2 bg-gray-800/50 rounded">
                                                <div className="text-lg font-bold text-green-400">{analysis.content?.stats?.prs_merged || 0}</div>
                                                <div className="text-xs text-gray-500">PRs</div>
                                            </div>
                                            <div className="text-center p-2 bg-gray-800/50 rounded">
                                                <div className="text-lg font-bold text-purple-400">{analysis.content?.stats?.reviews_given || 0}</div>
                                                <div className="text-xs text-gray-500">Reviews</div>
                                            </div>
                                            <div className="text-center p-2 bg-gray-800/50 rounded">
                                                <div className="text-lg font-bold text-yellow-400">
                                                    {analysis.meta_data?.performance_score?.toFixed(1) || 0}
                                                </div>
                                                <div className="text-xs text-gray-500">Score</div>
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-700">
                                            {new Date(analysis.created_at).toLocaleString('he-IL')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AIFeedbackHistoryPage;
