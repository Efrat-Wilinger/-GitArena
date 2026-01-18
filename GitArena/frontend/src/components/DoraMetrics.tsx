import React from 'react';
// Recharts removed as we switched to simple metrics cards


interface DoraMetricsProps {
    deploymentFrequency?: number;
    leadTime?: number;
    deploymentsHistory?: { day: string; count: number }[];
    leadTimeHistory?: { date: string; hours: number }[];
    totalCommits?: number;
    totalLoc?: number;
    avgCommitSize?: number;
    contributorsCount?: number;
}

export const DoraMetrics: React.FC<DoraMetricsProps> = ({
    totalCommits = 0,
    totalLoc = 0,
    avgCommitSize = 0,
    contributorsCount = 0
}) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-3xl">🧬</span>
                Project Vitality (All Time)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Code Volume (Total LOC) */}
                <div className="modern-card p-6 relative overflow-hidden bg-gradient-to-br from-blue-900/40 to-slate-900 border-blue-500/20">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <div className="text-6xl">🧱</div>
                    </div>
                    <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-2">
                        Codebase Scale
                    </h3>
                    <div className="text-4xl font-bold text-white mb-1">
                        {totalLoc.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-400">Total Lines of Code</div>

                    <div className="mt-4 w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full w-full opacity-50"></div>
                    </div>
                </div>

                {/* 2. Activity (Total Commits) */}
                <div className="modern-card p-6 relative overflow-hidden bg-gradient-to-br from-purple-900/40 to-slate-900 border-purple-500/20">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <div className="text-6xl">⚡</div>
                    </div>
                    <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-2">
                        Total Activity
                    </h3>
                    <div className="text-4xl font-bold text-white mb-1">
                        {totalCommits.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-400">Commits Pushed</div>

                    <div className="mt-4 w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full w-3/4 opacity-50"></div>
                    </div>
                </div>

                {/* 3. Complexity (Avg Commit Size) */}
                <div className="modern-card p-6 relative overflow-hidden bg-gradient-to-br from-emerald-900/40 to-slate-900 border-emerald-500/20">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <div className="text-6xl">📏</div>
                    </div>
                    <h3 className="text-sm font-semibold text-emerald-300 uppercase tracking-wider mb-2">
                        Avg. Complexity
                    </h3>
                    <div className="text-4xl font-bold text-white mb-1">
                        {avgCommitSize}
                    </div>
                    <div className="text-sm text-slate-400">Lines per Commit</div>

                    <div className="mt-4 w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full w-1/2 opacity-50"></div>
                    </div>
                </div>

                {/* 4. Team Size (Contributors) */}
                <div className="modern-card p-6 relative overflow-hidden bg-gradient-to-br from-orange-900/40 to-slate-900 border-orange-500/20">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <div className="text-6xl">👥</div>
                    </div>
                    <h3 className="text-sm font-semibold text-orange-300 uppercase tracking-wider mb-2">
                        Contributors
                    </h3>
                    <div className="text-4xl font-bold text-white mb-1">
                        {contributorsCount}
                    </div>
                    <div className="text-sm text-slate-400">Active Developers</div>

                    <div className="mt-4 w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full rounded-full w-full opacity-50"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
