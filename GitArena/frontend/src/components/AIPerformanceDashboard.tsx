import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { aiApi } from '../api/ai';

interface PerformanceMetrics {
    code_quality_score: number | null;
    code_volume: number | null;
    effort_score: number | null;
    velocity_score: number | null;
    consistency_score: number | null;
}

interface AIFeedbackAnalysis {
    id: number;
    feedback_type: string;
    metrics: PerformanceMetrics;
    improvement_areas: string[];
    strengths: string[];
    created_at: string;
    content: string;
}

interface PerformanceMetricCardProps {
    label: string;
    value: number | null;
    icon: string;
    unit?: string;
    color: string;
}

const PerformanceMetricCard: React.FC<PerformanceMetricCardProps> = ({ label, value, icon, unit = '', color }) => {
    const scoreClass = value === null ? 'text-slate-600' :
        value >= 80 ? 'text-green-400' :
            value >= 60 ? 'text-yellow-400' :
                value >= 40 ? 'text-orange-400' : 'text-red-400';

    return (
        <div className="modern-card p-6 text-center hover:scale-105 transition-transform group">
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
            <div className={`text-3xl font-bold mb-1 ${scoreClass}`}>
                {value !== null ? `${value.toFixed(1)}${unit}` : 'N/A'}
            </div>
            <div className="text-xs text-slate-400 uppercase">{label}</div>

            {/* Progress Bar */}
            {value !== null && (
                <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${color}`}
                        style={{ width: `${Math.min(value, 100)}%` }}
                    />
                </div>
            )}
        </div>
    );
};

interface AIPerformanceDashboardProps {
    userId?: number;
    repositoryId?: number;
}

const AIPerformanceDashboard: React.FC<AIPerformanceDashboardProps> = ({ userId, repositoryId }) => {
    const { data: feedbackHistory, isLoading } = useQuery({
        queryKey: ['aiFeedbackHistory', userId, repositoryId],
        queryFn: () => aiApi.getFeedbackHistory({ userId, repositoryId, limit: 1 }),
        enabled: !!userId || !!repositoryId,
    });

    if (isLoading) {
        return (
            <div className="modern-card p-8 animate-pulse">
                <div className="h-8 bg-slate-700 rounded w-1/3 mb-6"></div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-32 bg-slate-700 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    const latestAnalysis = feedbackHistory?.analyses?.[0] as AIFeedbackAnalysis | undefined;

    if (!latestAnalysis) {
        return (
            <div className="modern-card p-8 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-white mb-2">No Analysis Yet</h3>
                <p className="text-slate-400">Performance metrics will appear here once analysis is available.</p>
            </div>
        );
    }

    const { metrics, improvement_areas, strengths } = latestAnalysis;

    // Parse content if it's a string containing JSON
    let contentData: any = {};
    try {
        contentData = typeof latestAnalysis.content === 'string'
            ? JSON.parse(latestAnalysis.content)
            : latestAnalysis.content;
    } catch (e) {
        // Ignore parse errors
    }

    const aiInsight = contentData?.ai_insight || '';

    return (
        <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="modern-card p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                    AI Performance Analysis
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <PerformanceMetricCard
                        label="Code Quality"
                        value={metrics?.code_quality_score}
                        icon="✨"
                        color="bg-gradient-to-r from-blue-500 to-cyan-500"
                    />
                    <PerformanceMetricCard
                        label="Code Volume"
                        value={metrics?.code_volume}
                        icon="📝"
                        unit=" lines"
                        color="bg-gradient-to-r from-green-500 to-emerald-500"
                    />
                    <PerformanceMetricCard
                        label="Effort Score"
                        value={metrics?.effort_score}
                        icon="💪"
                        color="bg-gradient-to-r from-purple-500 to-pink-500"
                    />
                    <PerformanceMetricCard
                        label="Velocity"
                        value={metrics?.velocity_score}
                        icon="⚡"
                        color="bg-gradient-to-r from-yellow-500 to-orange-500"
                    />
                    <PerformanceMetricCard
                        label="Consistency"
                        value={metrics?.consistency_score}
                        icon="📈"
                        color="bg-gradient-to-r from-indigo-500 to-blue-500"
                    />
                </div>
            </div>

            {/* AI Insight */}
            {aiInsight && (
                <div className="modern-card p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                    <div className="flex items-start gap-4">
                        <div className="text-3xl">🤖</div>
                        <div className="flex-1">
                            <h4 className="text-lg font-bold text-white mb-2">AI Insight</h4>
                            <p className="text-slate-300 leading-relaxed">{aiInsight}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Strengths and Improvement Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                {strengths && strengths.length > 0 && (
                    <div className="modern-card p-6">
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-2xl">🏆</span>
                            Your Strengths
                        </h4>
                        <ul className="space-y-2">
                            {strengths.map((strength, i) => (
                                <li key={i} className="flex items-start gap-2 text-green-300">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>{strength}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Improvement Areas */}
                {improvement_areas && improvement_areas.length > 0 && (
                    <div className="modern-card p-6">
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-2xl">🎯</span>
                            Growth Opportunities
                        </h4>
                        <ul className="space-y-2">
                            {improvement_areas.map((area, i) => (
                                <li key={i} className="flex items-start gap-2 text-yellow-300">
                                    <span className="text-yellow-400 mt-1">→</span>
                                    <span>{area}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Last Updated */}
            <div className="text-center text-slate-500 text-sm">
                Last analyzed: {new Date(latestAnalysis.created_at).toLocaleString()}
            </div>
        </div>
    );
};

export default AIPerformanceDashboard;
