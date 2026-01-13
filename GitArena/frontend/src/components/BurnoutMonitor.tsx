import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';

interface BurnoutMember {
    name: string;
    avatar: string;
    riskScore: number;
    status: 'Healthy' | 'Warning' | 'Critical';
    factors: string[];
    recentStressors: string[]; // Commit messages suggesting stress
    metrics: {
        lateNight: number;
        weekend: number;
        stressCommits: number;
    };
}

interface BurnoutMonitorProps {
    data?: {
        members: BurnoutMember[];
        overallRisk: number;
    };
    loading?: boolean;
}

export const BurnoutMonitor: React.FC<BurnoutMonitorProps> = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="modern-card p-6 h-[400px] flex items-center justify-center animate-pulse">
                <div className="text-slate-500">Analyze Team Health...</div>
            </div>
        );
    }

    const { members = [], overallRisk = 0 } = data || {};

    return (
        <div className="modern-card p-6 border-red-500/10 relative overflow-hidden">
            {/* Background Gradient for High Risk */}
            {overallRisk > 50 && (
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-red-500/5 blur-[100px] rounded-full pointer-events-none -mr-20 -mt-20"></div>
            )}

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span>🩺</span>
                        Team Pulse & Burnout Monitor
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        AI-driven analysis of work hours and commit sentiment
                    </p>
                </div>
                <div className={`px-4 py-2 rounded-xl border ${overallRisk > 60 ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    }`}>
                    <div className="text-xs uppercase tracking-wider font-semibold">Team Risk</div>
                    <div className="text-2xl font-bold">{overallRisk}%</div>
                </div>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                {members.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        <div className="text-4xl mb-2">🧘</div>
                        No risk detected. Everyone seems zen.
                    </div>
                ) : (
                    members.map((member, idx) => (
                        <div key={idx} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all">
                            <div className="flex items-center gap-4">
                                <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full border-2 border-slate-700" />

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-bold text-white truncate">{member.name}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${member.status === 'Critical' ? 'bg-red-500 text-white' :
                                                member.status === 'Warning' ? 'bg-yellow-500 text-black' :
                                                    'bg-emerald-500 text-white'
                                            }`}>
                                            {member.riskScore}% {member.status}
                                        </span>
                                    </div>

                                    {/* Risk Factors Tags */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {member.factors.map((factor, i) => (
                                            <span key={i} className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300 border border-slate-600">
                                                {factor}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Stress Messages Preview */}
                                    {member.recentStressors.length > 0 && (
                                        <div className="bg-red-500/10 p-2 rounded text-xs text-red-300 italic border-l-2 border-red-500">
                                            "{member.recentStressors[0]}"
                                        </div>
                                    )}

                                    {/* Mini Metrics */}
                                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-700/50">
                                        <div className="text-center">
                                            <div className="text-xs text-slate-500">Late Night</div>
                                            <div className="text-sm font-semibold text-purple-400">{member.metrics.lateNight}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-slate-500">Weekend</div>
                                            <div className="text-sm font-semibold text-orange-400">{member.metrics.weekend}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-slate-500">Stress commits</div>
                                            <div className="text-sm font-semibold text-red-400">{member.metrics.stressCommits}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
