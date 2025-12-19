import React, { useState, useEffect } from 'react';
import { githubApi } from '../api/github';

interface InsightCard {
    id: string;
    type: 'positive' | 'warning' | 'info';
    title: string;
    description: string;
    metric?: string;
    icon: string;
    trend?: 'up' | 'down';
}

export const AIInsights: React.FC<{ userId?: number }> = ({ userId }) => {
    const [insights, setInsights] = useState<InsightCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeInsight, setActiveInsight] = useState<number>(0);

    useEffect(() => {
        const fetchInsights = async () => {
            setLoading(true);
            try {
                const data = await githubApi.getAIInsights(userId);
                // Map icons based on type
                const insightsWithIcons = data.map(insight => ({
                    ...insight,
                    icon: insight.type === 'positive' ? '✨' : insight.type === 'warning' ? '⚠️' : 'ℹ️'
                }));
                setInsights(insightsWithIcons);
            } catch (error) {
                console.error('Failed to fetch AI insights:', error);
                // Fallback to empty array on error
                setInsights([]);
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, [userId]);

    const getTypeStyles = (type: InsightCard['type']) => {
        switch (type) {
            case 'positive':
                return 'border-blue-500/30 bg-blue-500/5';
            case 'warning':
                return 'border-orange-500/30 bg-orange-500/5';
            case 'info':
                return 'border-blue-400/30 bg-blue-400/5';
        }
    };

    if (loading) {
        return (
            <div className="modern-card p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-blue animate-pulse"></div>
                    <div className="flex-1">
                        <div className="h-6 bg-slate-800 rounded w-48 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-slate-800 rounded w-64 animate-pulse"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-slate-800/50 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="modern-card p-8 relative overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 animate-pulse"></div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-blue flex items-center justify-center shadow-lg shadow-blue-500/30 animate-float">
                            <span className="text-2xl">🤖</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">AI Insights</h3>
                            <p className="text-sm text-slate-400">Powered by advanced analytics</p>
                        </div>
                    </div>
                    <button className="btn-secondary text-sm">View All</button>
                </div>

                {/* Insights Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insights.map((insight, index) => (
                        <div
                            key={insight.id}
                            className={`relative p-5 rounded-xl border ${getTypeStyles(insight.type)} 
                                hover:scale-[1.02] transition-all duration-300 cursor-pointer group
                                ${activeInsight === index ? 'ring-2 ring-blue-500/50' : ''}`}
                            onClick={() => setActiveInsight(index)}
                            style={{
                                animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
                            }}
                        >
                            {/* Gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="text-3xl">{insight.icon}</div>
                                    {insight.metric && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold text-blue-400">
                                                {insight.metric}
                                            </span>
                                            {insight.trend && (
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center
                                                    ${insight.trend === 'up' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                                    <svg className={`w-4 h-4 ${insight.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}
                                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d={insight.trend === 'up' ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-white font-semibold mb-1">{insight.title}</h4>
                                <p className="text-sm text-slate-400">{insight.description}</p>
                            </div>

                            {/* Shine effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shine"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom action */}
                <div className="mt-6 flex items-center justify-center">
                    <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2">
                        <span>Get detailed recommendations</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes shine {
                    from {
                        transform: translateX(-100%) skewX(-12deg);
                    }
                    to {
                        transform: translateX(200%) skewX(-12deg);
                    }
                }

                .animate-shine {
                    animation: shine 3s infinite;
                }
            `}</style>
        </div>
    );
};

export default AIInsights;
