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
            className={`group relative bg-gray-800/50 backdrop-blur-xl border rounded-xl p-4 transition-all duration-300 hover:scale-105 ${unlocked
                    ? 'border-cyan-500/50 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20'
                    : 'border-gray-700 opacity-60 hover:opacity-80'
                }`}
        >
            {/* Icon */}
            <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-4xl transition-all duration-300 ${unlocked
                    ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20 group-hover:scale-110'
                    : 'bg-gray-800 border-2 border-gray-700 grayscale'
                }`}>
                {unlocked ? icon : '🔒'}
            </div>

            {/* Title & Description */}
            <div className="text-center">
                <h4 className={`font-semibold mb-1 ${unlocked ? 'text-white' : 'text-gray-500'}`}>
                    {title}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2">
                    {description}
                </p>
            </div>

            {/* Progress Bar (if not fully unlocked) */}
            {!unlocked && maxProgress && progress !== undefined && (
                <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{progress}/{maxProgress}</span>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Unlocked Date */}
            {unlocked && unlockedAt && (
                <div className="mt-3 text-xs text-cyan-400 text-center">
                    Unlocked {new Date(unlockedAt).toLocaleDateString()}
                </div>
            )}

            {/* Unlock Animation Effect */}
            {unlocked && (
                <div className="absolute inset-0 rounded-xl pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-cyan-500/5 to-purple-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
            )}

            {/* Tooltip */}
            <div className="tooltip -top-12 left-1/2 transform -translate-x-1/2 w-48">
                <div className="text-center">
                    <div className="font-semibold">{title}</div>
                    <div className="text-gray-400">{description}</div>
                    {unlocked && unlockedAt && (
                        <div className="text-cyan-400 mt-1">
                            {new Date(unlockedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Sample Achievements Component
export const AchievementsSection: React.FC = () => {
    const achievements: Achievement[] = [
        {
            id: '1',
            title: 'Early Adopter',
            description: 'Joined GitArena in its early days',
            icon: '🚀',
            unlocked: true,
            unlockedAt: '2024-01-15',
        },
        {
            id: '2',
            title: 'Commit Master',
            description: 'Made 100+ commits in a month',
            icon: '⚡',
            unlocked: true,
            unlockedAt: '2024-02-20',
        },
        {
            id: '3',
            title: 'Code Reviewer',
            description: 'Reviewed 50+ pull requests',
            icon: '👀',
            unlocked: true,
            unlockedAt: '2024-03-10',
        },
        {
            id: '4',
            title: 'Team Player',
            description: 'Collaborated with 10+ developers',
            icon: '🤝',
            unlocked: true,
            unlockedAt: '2024-04-05',
        },
        {
            id: '5',
            title: 'Streak Master',
            description: 'Maintain a 30-day contribution streak',
            icon: '🔥',
            unlocked: false,
            progress: 18,
            maxProgress: 30,
        },
        {
            id: '6',
            title: 'Repository King',
            description: 'Create and maintain 20+ repositories',
            icon: '👑',
            unlocked: false,
            progress: 12,
            maxProgress: 20,
        },
    ];

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 hover-lift">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <span className="text-2xl">🏆</span>
                        Achievements
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                        {unlockedCount} of {achievements.length} unlocked
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
                            className="text-gray-700"
                        />
                        <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - unlockedCount / achievements.length)}`}
                            className="text-cyan-500 transition-all duration-1000"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                            {Math.round((unlockedCount / achievements.length) * 100)}%
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {achievements.map((achievement, index) => (
                    <div
                        key={achievement.id}
                        style={{ animation: `bounce-in 0.5s ease-out ${index * 0.1}s both` }}
                    >
                        <AchievementBadge achievement={achievement} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AchievementBadge;
