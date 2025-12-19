import React from 'react';

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: string;
    progress?: number;
    maxProgress?: number;
}

interface AchievementBadgeProps {
    achievement: Achievement;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement }) => {
    const { title, description, icon, unlocked, unlockedAt, progress, maxProgress } = achievement;

    const progressPercentage = maxProgress ? (progress! / maxProgress) * 100 : 100;

    return (
        <div
            className={`group relative modern-card p-4 transition-all duration-300 ${unlocked
                ? 'hover:border-blue-500/50'
                : 'opacity-50'
                }`}
        >
            {/* Icon */}
            <div className={`w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center text-3xl transition-all duration-300 ${unlocked
                ? 'bg-gradient-blue shadow-lg shadow-blue-500/20 group-hover:scale-110'
                : 'bg-slate-800 border border-slate-700 grayscale'
                }`}>
                {unlocked ? icon : '🔒'}
            </div>

            {/* Title & Description */}
            <div className="text-center">
                <h4 className={`font-semibold mb-1 text-sm ${unlocked ? 'text-white' : 'text-slate-500'}`}>
                    {title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2">
                    {description}
                </p>
            </div>

            {/* Progress Bar (if not fully unlocked) */}
            {!unlocked && maxProgress && progress !== undefined && (
                <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Progress</span>
                        <span>{progress}/{maxProgress}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-blue rounded-full transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Unlocked Date */}
            {unlocked && unlockedAt && (
                <div className="mt-3 text-xs text-blue-400 text-center">
                    {new Date(unlockedAt).toLocaleDateString()}
                </div>
            )}
        </div>
    );
};

// Sample Achievements Component
export const AchievementsSection: React.FC<{ achievements?: string[] }> = ({ achievements: unlockedIds }) => {
    const defaultAchievements: Achievement[] = [

        {
            id: '1',
            title: 'Early Adopter',
            description: 'Joined GitArena',
            icon: '🚀',
            unlocked: true,
            unlockedAt: '2024-01-15',
        },
        {
            id: '2',
            title: 'Commit Master',
            description: '100+ commits',
            icon: '⚡',
            unlocked: true,
            unlockedAt: '2024-02-20',
        },
        {
            id: '3',
            title: 'Code Reviewer',
            description: '50+ reviews',
            icon: '👀',
            unlocked: true,
            unlockedAt: '2024-03-10',
        },
        {
            id: '4',
            title: 'Team Player',
            description: '10+ collaborators',
            icon: '🤝',
            unlocked: true,
            unlockedAt: '2024-04-05',
        },
        {
            id: '5',
            title: 'Streak Master',
            description: '30-day streak',
            icon: '🔥',
            unlocked: false,
            progress: 18,
            maxProgress: 30,
        },
        {
            id: '6',
            title: 'Repository King',
            description: '20+ repos',
            icon: '👑',
            unlocked: false,
            progress: 12,
            maxProgress: 20,
        },
    ];

    const currentAchievements = defaultAchievements.map(a => ({
        ...a,
        unlocked: unlockedIds ? unlockedIds.includes(a.id) : a.unlocked
    }));

    const unlockedCount = currentAchievements.filter(a => a.unlocked).length;


    return (
        <div className="modern-card p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                        Achievements
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        {unlockedCount} of {currentAchievements.length} unlocked
                    </p>
                </div>

                {/* Progress Ring */}
                <div className="relative w-16 h-16">
                    <svg className="transform -rotate-90 w-16 h-16">
                        <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            className="text-slate-800"
                        />
                        <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - unlockedCount / currentAchievements.length)}`}
                            className="text-blue-500 transition-all duration-1000"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                            {Math.round((unlockedCount / currentAchievements.length) * 100)}%
                        </span>
                    </div>

                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {currentAchievements.map((achievement) => (
                    <AchievementBadge key={achievement.id} achievement={achievement} />
                ))}
            </div>

        </div>
    );
};

export default AchievementBadge;
