import React, { useState, useEffect } from 'react';
import { githubApi } from '../../api/github';
import { AchievementsSection } from '../../components/AchievementBadge';
import { AchievementUnlockAnimation } from '../../components/ParticleEffect';

const AchievementsPage: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [challenges, setChallenges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUnlock, setShowUnlock] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [statsData, challengesData] = await Promise.all([
                    githubApi.getGamificationStats(),
                    githubApi.getChallenges()
                ]);
                setStats(statsData);
                setChallenges(challengesData);
            } catch (error) {
                console.error('Failed to fetch achievements data:', error);
                setStats({ level: 1, xp: 0, nextLevelXp: 1000, skills: {}, achievements: [], streak: 0 });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading || !stats) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-blue-400/20 border-t-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    const levelProgress = (stats.xp / stats.nextLevelXp) * 100;

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <span className="text-4xl">🏆</span>
                        Achievements & Progress
                    </h1>
                    <p className="text-slate-400">Track your skills, unlock badges, and complete challenges</p>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Current XP', value: stats.xp || 0, icon: '📊', color: 'blue', subtext: `${stats.nextLevelXp - stats.xp} to next level` },
                    { label: 'Level', value: stats.level, icon: '⭐', color: 'purple', subtext: 'Current rank' },
                    { label: 'Achievements', value: stats.achievements?.length || 0, icon: '🎯', color: 'orange', subtext: 'Unlocked' },
                    { label: 'Streak', value: stats.streak, icon: '🔥', color: 'green', subtext: 'days active' },
                ].map((stat, i) => (
                    <div key={i} className="modern-card p-6 text-center hover:scale-105 transition-transform group cursor-default">
                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{stat.icon}</div>
                        <div className={`text-3xl font-bold text-${stat.color}-400 mb-1`}>{stat.value}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{stat.label}</div>
                        <div className="text-xs text-slate-500 mt-1">{stat.subtext}</div>
                    </div>
                ))}
            </div>

            {/* Main Bento Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* Left Column - 8 cols */}
                <div className="xl:col-span-8 space-y-6">
                    {/* Level Progress Card */}
                    <div className="modern-card p-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                                        <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                                        Level {stats.level}
                                    </h3>
                                    <p className="text-slate-400">{stats.nextLevelXp - stats.xp} XP to Level {stats.level + 1}</p>
                                </div>
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-xl shadow-purple-500/30">
                                    <span className="text-4xl font-bold text-white">{stats.level}</span>
                                </div>
                            </div>
                            <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${levelProgress}%` }}>
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                                    {stats.xp} / {stats.nextLevelXp} XP
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Skills Grid */}
                    <div className="modern-card p-8">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                            Skills Mastery
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(stats.skills || {}).map(([skill, xp]: [string, any], index) => {
                                const skillLevel = Math.floor(xp / 500) + 1;
                                const skillProgress = (xp % 500 / 500) * 100;

                                return (
                                    <div key={index} className="space-y-3 p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-white font-semibold">{skill}</span>
                                                <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-blue-500/20 text-blue-400">
                                                    Lv. {skillLevel}
                                                </span>
                                            </div>
                                            <span className="text-sm text-slate-400 font-mono">
                                                {xp % 500} / 500 XP
                                            </span>
                                        </div>
                                        <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${skillProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                            {Object.keys(stats.skills || {}).length === 0 && (
                                <div className="col-span-2 text-center py-8">
                                    <div className="text-4xl mb-2">💪</div>
                                    <p className="text-slate-400">No skill data available yet.</p>
                                    <p className="text-slate-500 text-sm mt-1">Start committing to build your skills!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Achievements Section */}
                    <AchievementsSection achievements={stats.achievements} />
                </div>

                {/* Right Column - 4 cols */}
                <div className="xl:col-span-4 space-y-6">
                    {/* Active Challenges */}
                    <div className="modern-card p-6">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
                            Active Challenges
                        </h3>
                        <div className="space-y-4">
                            {challenges.map((challenge) => (
                                <div key={challenge.id} className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all border border-slate-700 hover:border-orange-500/50">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex-1">
                                            <h4 className="text-white font-semibold mb-1 text-sm">{challenge.title}</h4>
                                            <p className="text-xs text-slate-400">🎁 {challenge.reward}</p>
                                        </div>
                                        <span className="text-lg font-bold text-orange-400 font-mono">
                                            {challenge.progress}/{challenge.total}
                                        </span>
                                    </div>
                                    <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"
                                            style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            {challenges.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-2">🎯</div>
                                    <p className="text-slate-400 text-sm">No active challenges</p>
                                    <p className="text-slate-500 text-xs mt-1">Check back later!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Leaderboard Preview */}
                    <div className="modern-card p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span className="w-2 h-8 bg-yellow-500 rounded-full"></span>
                            Leaderboard
                        </h3>
                        <div className="text-center py-8">
                            <div className="text-4xl mb-2">👑</div>
                            <p className="text-slate-400 text-sm">Coming Soon</p>
                            <p className="text-slate-500 text-xs mt-1">Compete with your team!</p>
                        </div>
                    </div>
                </div>
            </div>

            <AchievementUnlockAnimation show={showUnlock} onComplete={() => setShowUnlock(false)} />
        </div>
    );
};

export default AchievementsPage;
