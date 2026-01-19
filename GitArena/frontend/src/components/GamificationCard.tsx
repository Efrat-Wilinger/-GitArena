import React from 'react';

interface GamificationCardProps {
    xp: number;
    level: number;
    nextLevelXp: number;
    rank?: string;
}

const GamificationCard: React.FC<GamificationCardProps> = ({ xp, level, nextLevelXp, rank = "Developer" }) => {
    const progress = (xp / nextLevelXp) * 100;

    return (
        <div className="modern-card p-6 relative overflow-hidden group">
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                            <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                            Level Progress
                        </h3>
                        <p className="text-sm text-slate-400">Keep coding to level up!</p>
                    </div>
                    <div className="text-4xl">🎮</div>
                </div>

                {/* Level Badge */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <div className="text-center">
                                <div className="text-xs text-purple-200 font-semibold uppercase tracking-wider">Level</div>
                                <div className="text-2xl font-bold text-white">{level}</div>
                            </div>
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-xs">⭐</span>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-purple-300">{rank}</span>
                            <span className="text-xs text-slate-400 font-mono">{xp} / {nextLevelXp} XP</span>
                        </div>
                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 transition-all duration-700 ease-out relative"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{Math.max(0, nextLevelXp - xp)} XP to next level</p>
                    </div>
                </div>

                {/* Next Unlock Preview */}
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center border border-yellow-500/30">
                            <span className="text-xl">🏆</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-400 mb-0.5">Next Achievement</p>
                            <p className="text-sm font-semibold text-white">Code Warrior</p>
                        </div>
                        <div className="text-xs text-purple-400 font-mono">Lvl {level + 1}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamificationCard;
