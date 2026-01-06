import React from 'react';

interface PeakHoursProps {
    data?: number[];
}

export const PeakHours: React.FC<PeakHoursProps> = ({ data }) => {
    // 24-hour data or zeros
    const hours = data && data.length === 24 ? data : Array(24).fill(0);
    const maxActivity = Math.max(...hours, 1);

    // Group hours into segments for better visualization
    const timeLabels = ['0h', '3h', '6h', '9h', '12h', '15h', '18h', '21h'];

    return (
        <div className="modern-card p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                Peak Hours
            </h3>

            <div className="space-y-4">
                <div className="flex items-end justify-between gap-1 h-32">
                    {hours.map((count, index) => {
                        const heightPercentage = (count / maxActivity) * 100;
                        return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full flex items-end justify-center flex-1">
                                    <div
                                        className="w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-t transition-all duration-500 hover:opacity-80 cursor-pointer relative group"
                                        style={{ height: `${heightPercentage}%`, minHeight: count > 0 ? '4px' : '0' }}
                                    >
                                        {count > 0 && (
                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                {index}:00 - {count} commits
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Hour labels */}
                <div className="flex justify-between text-xs text-slate-500 px-1">
                    {timeLabels.map((label, i) => (
                        <span key={i}>{label}</span>
                    ))}
                </div>

                {/* Summary */}
                <div className="mt-4 p-3 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Most Active Hour</span>
                        <span className="text-purple-400 font-semibold">
                            {hours.indexOf(Math.max(...hours))}:00 ({Math.max(...hours)} commits)
                        </span>
                    </div>
                </div>
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
