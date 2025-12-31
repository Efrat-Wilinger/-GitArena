import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import TeamAnalysisPanel from '../components/TeamAnalysisPanel';

interface TeamAnalysisData {
    repository_id: number;
    repository_name: string;
    analysis_period: string;
    analyzed_at: string;
    developer_stats: Record<string, any>;
    best_performer: any;
    ai_insights: {
        team_health: string;
        top_performer_analysis: string;
        improvement_suggestions: Record<string, string>;
        collaboration_insights: string;
    };
}

const RepositoryTeamAnalysisPage: React.FC = () => {
    const { repositoryId } = useParams<{ repositoryId: string }>();
    const navigate = useNavigate();
    const [isGenerating, setIsGenerating] = useState(false);

    // Fetch team analysis
    const {
        data: analysisData,
        isLoading,
        error,
        refetch
    } = useQuery<TeamAnalysisData>({
        queryKey: ['team-analysis', repositoryId],
        queryFn: async () => {
            const response = await apiClient.get(`/ai/repository/${repositoryId}/team-analysis`);
            return response.data;
        },
        enabled: false, // Don't auto-fetch, only on button click
        retry: false
    });

    const handleGenerateAnalysis = async () => {
        setIsGenerating(true);
        try {
            await refetch();
        } catch (err) {
            console.error('Failed to generate analysis:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <h1 className="text-4xl font-bold text-gradient mb-2">
                        Team Performance Analysis
                    </h1>
                    <p className="text-gray-400">
                        AI-powered insights into your team's productivity and collaboration
                    </p>
                </div>

                {!analysisData && (
                    <button
                        onClick={handleGenerateAnalysis}
                        disabled={isGenerating}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-semibold rounded-lg hover:from-cyan-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Generate Analysis
                            </>
                        )}
                    </button>
                )}

                {analysisData && (
                    <button
                        onClick={handleGenerateAnalysis}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                Refreshing...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh Analysis
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Info Cards */}
            {!analysisData && !isGenerating && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-5 border border-gray-700">
                        <div className="text-3xl mb-2">📊</div>
                        <h3 className="text-white font-semibold mb-1">Performance Metrics</h3>
                        <p className="text-sm text-gray-400">
                            Detailed analysis of commits, PRs, reviews, and code changes
                        </p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-5 border border-gray-700">
                        <div className="text-3xl mb-2">🏆</div>
                        <h3 className="text-white font-semibold mb-1">Top Performers</h3>
                        <p className="text-sm text-gray-400">
                            Identify and celebrate your team's best contributors
                        </p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-5 border border-gray-700">
                        <div className="text-3xl mb-2">💡</div>
                        <h3 className="text-white font-semibold mb-1">AI Suggestions</h3>
                        <p className="text-sm text-gray-400">
                            Personalized improvement recommendations for each team member
                        </p>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <TeamAnalysisPanel
                data={analysisData || null}
                isLoading={isLoading || isGenerating}
                error={error ? 'Failed to load team analysis' : undefined}
            />

            {/* How it Works Section */}
            {!analysisData && !isGenerating && (
                <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 mt-8">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">ℹ️</span>
                        How It Works
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                        <div>
                            <h4 className="font-semibold text-white mb-2">📈 Data Collection</h4>
                            <p>
                                We analyze the last 90 days of activity including commits, pull requests,
                                code reviews, and contributions from all team members.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-2">🤖 AI Analysis</h4>
                            <p>
                                Our AI evaluates team dynamics, individual performance, and provides
                                actionable insights based on industry best practices.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-2">💾 Saved Results</h4>
                            <p>
                                All analysis results are automatically saved to the AI Feedback table,
                                creating a historical record of team performance.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-2">🎯 Personalized Feedback</h4>
                            <p>
                                Each team member receives tailored suggestions for improvement,
                                helping everyone grow and collaborate better.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RepositoryTeamAnalysisPage;
