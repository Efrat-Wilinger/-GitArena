import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

interface KnowledgeBaseMetrics {
    health_score: number;
    last_update: string | null;
    readme_exists: boolean;
    contributing_exists: boolean;
    documentation_ratio: number;
    recent_updates_count: number;
}

interface KnowledgeBaseWidgetProps {
    projectId?: number;
}

export const KnowledgeBaseWidget: React.FC<KnowledgeBaseWidgetProps> = ({ projectId }) => {
    const { data, isLoading, error } = useQuery<KnowledgeBaseMetrics>({
        queryKey: ['knowledgeBase', projectId],
        queryFn: async () => {
            const params = projectId ? { project_id: projectId } : {};
            const response = await apiClient.get('/analytics/knowledge-base', { params });
            return response.data;
        }
    });

    if (isLoading) {
        return (
            <div className="modern-card p-6 rounded-2xl animate-pulse">
                <div className="h-6 w-32 bg-slate-700/50 rounded mb-4"></div>
                <div className="h-24 bg-slate-700/30 rounded-xl"></div>
            </div>
        );
    }

    if (error || !data) {
        return null;
    }

    const getHealthColor = (score: number) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getHealthLabel = (score: number) => {
        if (score >= 80) return 'Excellent';
        if (score >= 50) return 'Needs Work';
        return 'Critical';
    };

    return (
        <div className="modern-card p-6 rounded-2xl relative overflow-hidden group">
            {/* Background pattern */}
            <div className="absolute -right-10 -top-10 text-[150px] opacity-5 select-none pointer-events-none rotate-12">
                📚
            </div>

            <div className="flex items-center justify-between mb-6 relative">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">📚</span>
                    <h3 className="text-lg font-bold text-white">Knowledge Base</h3>
                </div>
                <div className={`text-sm font-bold px-3 py-1 rounded-full bg-slate-800 ${getHealthColor(data.health_score)}`}>
                    {getHealthLabel(data.health_score)}
                </div>
            </div>

            <div className="flex items-center justify-between mb-8 relative">
                <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-1">{data.health_score}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Health Score</div>
                </div>

                <div className="h-12 w-px bg-slate-700"></div>

                <div className="text-center">
                    <div className="text-4xl font-bold text-blue-400">{data.recent_updates_count}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Updates (30d)</div>
                </div>

                <div className="h-12 w-px bg-slate-700"></div>

                <div className="text-center">
                    <div className="text-4xl font-bold text-purple-400">{Math.round(data.documentation_ratio * 100)}%</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Doc Ratio</div>
                </div>
            </div>

            <div className="space-y-3 relative">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">📄</span>
                        <span className="text-slate-300">README.md</span>
                    </div>
                    {data.readme_exists ? (
                        <span className="text-green-400 text-sm font-bold flex items-center gap-1">
                            ✅ Present
                        </span>
                    ) : (
                        <span className="text-red-400 text-sm font-bold flex items-center gap-1">
                            Missing
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">🤝</span>
                        <span className="text-slate-300">CONTRIBUTING.md</span>
                    </div>
                    {data.contributing_exists ? (
                        <span className="text-green-400 text-sm font-bold flex items-center gap-1">
                            ✅ Present
                        </span>
                    ) : (
                        <span className="text-red-400 text-sm font-bold flex items-center gap-1">
                            Missing
                        </span>
                    )}
                </div>
            </div>

            {data.last_update && (
                <div className="mt-4 text-center text-xs text-slate-500">
                    Last document update: {new Date(data.last_update).toLocaleDateString()}
                </div>
            )}
        </div>
    );
};

export default KnowledgeBaseWidget;
