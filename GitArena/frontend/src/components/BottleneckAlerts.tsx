import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

interface BottleneckAlert {
    id: string;
    type: string;
    severity: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    repository: string;
    url?: string;
    created_at: string;
}

interface BottleneckResponse {
    alerts: BottleneckAlert[];
    total_high_severity: number;
    total_medium_severity: number;
}

interface BottleneckAlertsProps {
    projectId?: number;
}

export const BottleneckAlerts: React.FC<BottleneckAlertsProps> = ({ projectId }) => {
    const { data, isLoading, error } = useQuery<BottleneckResponse>({
        queryKey: ['bottlenecks', projectId],
        queryFn: async () => {
            const params = projectId ? { project_id: projectId } : {};
            const response = await apiClient.get('/analytics/bottlenecks', { params });
            return response.data;
        }
    });

    if (isLoading) {
        return (
            <div className="modern-card p-6 rounded-2xl animate-pulse">
                <div className="h-6 w-48 bg-slate-700/50 rounded mb-4"></div>
                <div className="space-y-3">
                    <div className="h-20 bg-slate-700/30 rounded-xl"></div>
                    <div className="h-20 bg-slate-700/30 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return null; // Don't show anything on error? Or show error state
    }

    if (!data?.alerts || data.alerts.length === 0) {
        return (
            <div className="modern-card p-6 rounded-2xl bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-500/10">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">✅</span>
                    <h3 className="text-lg font-bold text-white">No Bottlenecks Detected</h3>
                </div>
                <p className="text-slate-400">Everything is flowing smoothly! Great job team.</p>
            </div>
        );
    }

    return (
        <div className="modern-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    <h3 className="text-lg font-bold text-white">Potential Bottlenecks</h3>
                </div>

                <div className="flex gap-2 text-xs font-bold">
                    {data.total_high_severity > 0 && (
                        <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/20">
                            {data.total_high_severity} critical
                        </span>
                    )}
                    {data.total_medium_severity > 0 && (
                        <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">
                            {data.total_medium_severity} warnings
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {data.alerts.map((alert) => (
                    <div
                        key={alert.id}
                        className={`p-4 rounded-xl border transition-all hover:bg-white/5 group ${alert.severity === 'high'
                                ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                                : 'bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40'
                            }`}
                    >
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs px-1.5 py-0.5 rounded font-mono uppercase ${alert.severity === 'high' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
                                        }`}>
                                        {alert.severity}
                                    </span>
                                    <span className="text-xs text-slate-500 font-mono bg-slate-800 px-2 py-0.5 rounded">
                                        {alert.repository}
                                    </span>
                                </div>

                                <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                    {alert.title}
                                </h4>
                                <p className="text-sm text-slate-400 mt-1">
                                    {alert.description}
                                </p>
                            </div>

                            {alert.url && (
                                <a
                                    href={alert.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-blue-600 transition-all opacity-0 group-hover:opacity-100"
                                    title="View on GitHub"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BottleneckAlerts;
