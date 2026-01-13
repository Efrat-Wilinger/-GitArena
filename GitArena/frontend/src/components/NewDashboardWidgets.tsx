import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PeakHoursProps {
    data?: number[];
}

export const PeakHours: React.FC<PeakHoursProps> = ({ data }) => {
    // 24-hour data or zeros
    const hours = data && data.length === 24 ? data : Array(24).fill(0);
    const mostActiveHour = hours.indexOf(Math.max(...hours));

    const chartData = hours.map((count, hour) => ({
        hour: `${hour}h`,
        count,
        fullHour: `${hour}:00`
    }));

    return (
        <div className="modern-card p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                Peak Hours
            </h3>

            <div className="h-[200px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <XAxis
                            dataKey="hour"
                            stroke="#64748b"
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            interval={3}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                            itemStyle={{ color: '#d8b4fe' }}
                            labelStyle={{ color: '#94a3b8' }}
                            formatter={(value: number) => [`${value} commits`, 'Activity']}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {chartData.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={index === mostActiveHour ? '#a855f7' : '#4b5563'}
                                    fillOpacity={index === mostActiveHour ? 1 : 0.5}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm px-2">
                <span className="text-slate-400">Most Active</span>
                <span className="text-purple-400 font-bold bg-purple-500/10 px-3 py-1 rounded-full">
                    {mostActiveHour}:00 ({hours[mostActiveHour]} commits)
                </span>
            </div>
        </div>
    );
};

interface FilesChangedProps {
    data?: {
        filesModified: number;
        linesAdded: number;
        linesDeleted: number;
        netChange: number;
    };
}

export const FilesChanged: React.FC<FilesChangedProps> = ({ data }) => {
    const stats = data || {
        filesModified: 0,
        linesAdded: 0,
        linesDeleted: 0,
        netChange: 0
    };

    const changePercentage = stats.linesAdded > 0
        ? ((stats.linesAdded - stats.linesDeleted) / stats.linesAdded * 100).toFixed(1)
        : 0;

    return (
        <div className="modern-card p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-cyan-500 rounded-full"></span>
                Files Changed
                <span className="text-xs text-slate-500 font-normal">(Last 7 Days)</span>
            </h3>

            <div className="space-y-4">
                {/* Main Stat */}
                <div className="text-center p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
                    <div className="text-5xl font-bold text-cyan-400 mb-2">
                        {stats.filesModified.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-400">Files Modified</div>
                </div>

                {/* Lines Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="text-2xl font-bold text-green-400">
                            +{stats.linesAdded.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Lines Added</div>
                    </div>
                    <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                        <div className="text-2xl font-bold text-red-400">
                            -{stats.linesDeleted.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Lines Deleted</div>
                    </div>
                </div>

                {/* Net Change */}
                <div className="p-3 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Net Change</span>
                        <span className={`text-lg font-bold ${stats.netChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stats.netChange >= 0 ? '+' : ''}{stats.netChange.toLocaleString()}
                        </span>
                    </div>
                    <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${stats.netChange >= 0 ? 'bg-green-500' : 'bg-red-500'} transition-all duration-500`}
                            style={{ width: `${Math.min(Math.abs(Number(changePercentage)), 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
