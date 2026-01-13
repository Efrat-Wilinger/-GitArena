import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, RadialBarChart, RadialBar, Legend
} from 'recharts';

interface DoraMetricsProps {
    deploymentFrequency?: number; // e.g., deployments per day
    leadTime?: number; // hours
    failureRate?: number; // percentage 0-100
    mttr?: number; // minutes
    deploymentsHistory?: { day: string; count: number }[];
    leadTimeHistory?: { date: string; hours: number }[];
}

export const DoraMetrics: React.FC<DoraMetricsProps> = ({
    deploymentFrequency = 0,
    leadTime = 0,
    failureRate = 0,
    mttr = 0,
    deploymentsHistory = [],
    leadTimeHistory = []
}) => {
    // Derived simple data for charts
    const failureData = [
        { name: 'Success', value: failureRate > 0 ? 100 - failureRate : 100, fill: '#10b981' },
        { name: 'Failure', value: failureRate, fill: '#ef4444' }
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-3xl">🚀</span>
                DORA Metrics (Engineering Health)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Deployment Frequency */}
                <div className="modern-card p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <div className="text-6xl">📦</div>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Deployment Frequency
                    </h3>
                    <div className="text-3xl font-bold text-white mb-4">
                        {deploymentFrequency > 0 ? (
                            <>
                                {deploymentFrequency.toFixed(1)}/day <span className="text-slate-500 text-sm font-normal">avg</span>
                            </>
                        ) : (
                            <span className="text-slate-500 text-xl font-normal">No deployments yet</span>
                        )}
                    </div>

                    <div className="h-[100px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deploymentsHistory.length > 0 ? deploymentsHistory : [{ day: '-', count: 0 }]}>
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {deploymentsHistory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.count > 5 ? '#3b82f6' : '#64748b'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Lead Time for Changes */}
                <div className="modern-card p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <div className="text-6xl">⏱️</div>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Lead Time for Changes
                    </h3>
                    <div className="text-3xl font-bold text-white mb-4">
                        {leadTime > 0 ? (
                            <>
                                {Math.round(leadTime)}h <span className="text-green-400 text-sm font-normal">avg</span>
                            </>
                        ) : (
                            <span className="text-slate-500 text-xl font-normal">No data</span>
                        )}
                    </div>

                    <div className="h-[100px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={leadTimeHistory.length > 0 ? leadTimeHistory : [{ date: '-', hours: 0 }]}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                />
                                <Area type="monotone" dataKey="hours" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorHours)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Change Failure Rate */}
                <div className="modern-card p-6 relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            Change Failure Rate
                        </h3>
                        <div className="text-3xl font-bold text-white">
                            {failureRate}% <span className={`${failureRate > 15 ? 'text-red-400' : 'text-yellow-400'} text-sm font-normal`}>
                                {failureRate > 15 ? '(Critical)' : '(Needs Focus)'}
                            </span>
                        </div>
                    </div>

                    <div className="h-[120px] w-full flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart
                                cx="50%"
                                cy="50%"
                                innerRadius="60%"
                                outerRadius="100%"
                                barSize={10}
                                data={failureData}
                                startAngle={180}
                                endAngle={0}
                            >
                                <RadialBar
                                    background
                                    dataKey="value"
                                    cornerRadius={10}
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/3 text-center">
                            <div className="text-xs text-slate-500">Stability</div>
                            <div className="text-xl font-bold text-emerald-400">{100 - failureRate}%</div>
                        </div>
                    </div>
                </div>

                {/* 4. Time to Restore Service */}
                <div className="modern-card p-6 relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <div className="text-6xl">🚑</div>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                        Mean Time to Recovery
                    </h3>

                    <div className="flex items-end gap-2 mb-2">
                        <div className="text-4xl font-bold text-white">{mttr}</div>
                        <div className="text-lg text-slate-400 mb-1">min</div>
                    </div>

                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mb-2">
                        <div
                            className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
                            style={{ width: `${Math.max(10, 100 - (mttr / 2))}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                        <span>▼</span> 15% faster than last week
                    </p>
                </div>
            </div>
        </div>
    );
};
