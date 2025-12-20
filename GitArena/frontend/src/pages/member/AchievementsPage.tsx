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
                // Set fallback data or at least stop loading
                setStats({ level: 1, xp: 0, nextLevelXp: 1000, skills: {}, achievements: [], streak: 0 });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading || !stats) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full"></div>
            </div>
        );
    }

    const levelProgress = (stats.xp / stats.nextLevelXp) * 100;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="modern-card p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold text-white mb-2">Achievements & Progress</h1>
                    <p className="text-slate-400">Track your skills, unlock badges, and complete challenges</p>
                </div>
            </div>

            {/* Level Progress */}
            <div className="modern-card p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-1">Level {stats.level}</h3>
                        <p className="text-slate-400">{stats.nextLevelXp - stats.xp} XP to Level {stats.level + 1}</p>
                    </div>
                    <div className="w-24 h-24 rounded-full bg-gradient-blue flex items-center justify-center shadow-xl">
                        <span className="text-4xl font-bold text-white">{stats.level}</span>
                    </div>
                </div>
                <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ width: `${levelProgress}%`, animation: 'growWidth 1s ease-out' }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                        {stats.xp} / {stats.nextLevelXp} XP
                    </div>
                </div>
            </div>

            {/* Skills */}
            <div className="modern-card p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                    Skills
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(stats.skills || {}).map(([skill, xp]: [string, any], index) => {
                        const skillLevel = Math.floor(xp / 500) + 1;
                        const skillProgress = (xp % 500 / 500) * 100;

                        return (

                            <div key={index} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-white font-semibold">{skill}</span>
                                        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-blue-500/20 text-blue-400">
                                            Lv. {skillLevel}
                                        </span>
                                    </div>
                                    <span className="text-sm text-slate-400">
                                        {xp % 500} / 500 XP
                                    </span>
                                </div>
                                <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="absolute inset-0 bg-gradient-blue rounded-full transition-all duration-1000"
                                        style={{ width: `${skillProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                    {Object.keys(stats.skills || {}).length === 0 && (
                        <p className="text-slate-500 text-sm">No skill data available yet. Start committing!</p>
                    )}
                </div>
            </div>

            {/* Active Challenges */}
            <div className="modern-card p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
                    Active Challenges
                </h3>
                <div className="space-y-4">
                    {challenges.map((challenge) => (
                        <div key={challenge.id} className="p-6 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div>
                                    <h4 className="text-white font-semibold mb-1">{challenge.title}</h4>
                                    <p className="text-sm text-slate-400">Reward: {challenge.reward}</p>
                                </div>
                                <span className="text-2xl font-bold text-blue-400">
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
                        <p className="text-slate-500 text-sm">No active challenges at the moment.</p>
                    )}
                </div>
            </div>

            {/* Achievements */}
            <AchievementsSection achievements={stats.achievements} />

            {/* Leaderboard Position */}
            <div className="modern-card p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                    Your Ranking
                </h3>
                <div className="grid grid-cols-3 gap-6">
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20">
                        <div className="text-4xl mb-2">🥈</div>
                        <div className="text-3xl font-bold text-blue-400 mb-1">#2</div>
                        <div className="text-sm text-slate-400">Team Rank</div>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20">
                        <div className="text-4xl mb-2">⚡</div>
                        <div className="text-3xl font-bold text-orange-400 mb-1">234</div>
                        <div className="text-sm text-slate-400">This Week</div>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20">
                        <div className="text-4xl mb-2">🔥</div>
                        <div className="text-3xl font-bold text-green-400 mb-1">{stats.streak}</div>
                        <div className="text-sm text-slate-400">Day Streak</div>
                    </div>
                </div>
            </div>

            <AchievementUnlockAnimation show={showUnlock} onComplete={() => setShowUnlock(false)} />


            <style>{`
                @keyframes growWidth {
                    from { width: 0; }
                }
            `}</style>
        </div>
    );
};

export default AchievementsPage;
