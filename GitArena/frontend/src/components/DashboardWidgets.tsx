import React from 'react';

interface LanguageStats {
    name: string;
    percentage: number;
    color: string;
}

export const LanguageDistribution: React.FC = () => {
    const languages: LanguageStats[] = [
        { name: 'TypeScript', percentage: 45, color: 'bg-blue-500' },
        { name: 'JavaScript', percentage: 25, color: 'bg-blue-400' },
        { name: 'Python', percentage: 20, color: 'bg-blue-600' },
        { name: 'Other', percentage: 10, color: 'bg-slate-600' },
    ];

    return (
        <div className="modern-card p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                Languages
            </h3>

            <div className="space-y-4">
                {languages.map((lang, index) => (
                    <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-white font-medium">{lang.name}</span>
                            <span className="text-slate-400">{lang.percentage}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${lang.color} transition-all duration-1000 ease-out rounded-full`}
                                style={{ width: `${lang.percentage}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const RecentCommits: React.FC = () => {
    const commits = [
        { message: 'Add user authentication', repo: 'GitArena', time: '2h ago', additions: 45, deletions: 12 },
        { message: 'Fix dashboard layout', repo: 'Frontend', time: '5h ago', additions: 23, deletions: 8 },
        { message: 'Update API endpoints', repo: 'Backend', time: '1d ago', additions: 67, deletions: 34 },
    ];

    return (
        <div className="modern-card p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                Recent Commits
            </h3>

            <div className="space-y-4">
                {commits.map((commit, index) => (
                    <div key={index} className="group p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm truncate mb-1">
                                    {commit.message}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span className="font-mono">{commit.repo}</span>
                                    <span>•</span>
                                    <span>{commit.time}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs flex-shrink-0">
                                <span className="text-green-400">+{commit.additions}</span>
                                <span className="text-red-400">-{commit.deletions}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const PullRequestStatus: React.FC = () => {
    const stats = [
        { label: 'Open', count: 5, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
        { label: 'Merged', count: 23, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
        { label: 'Closed', count: 8, color: 'text-slate-400', bgColor: 'bg-slate-500/10' },
    ];

    return (
        <div className="modern-card p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                Pull Requests
            </h3>

            <div className="grid grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className={`${stat.bgColor} rounded-lg p-4 text-center`}>
                        <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                            {stat.count}
                        </div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide">
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const TopRepositories: React.FC = () => {
    const repos = [
        { name: 'GitArena', stars: 1234, language: 'TypeScript', trend: '+12%' },
        { name: 'DevOps-Pipeline', stars: 856, language: 'Python', trend: '+8%' },
        { name: 'Frontend-v2', stars: 542, language: 'JavaScript', trend: '+5%' },
    ];

    return (
        <div className="modern-card p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                Top Repositories
            </h3>

            <div className="space-y-3">
                {repos.map((repo, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-gradient-blue flex items-center justify-center text-white font-bold text-sm">
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm truncate group-hover:text-blue-400 transition-colors">
                                    {repo.name}
                                </p>
                                <p className="text-xs text-slate-500">{repo.language}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="flex items-center gap-1 text-slate-400 text-sm">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {repo.stars}
                            </div>
                            <span className="text-green-400 text-xs font-medium">{repo.trend}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const WeeklyActivity: React.FC = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const activity = [45, 72, 58, 90, 65, 30, 15]; // commits per day
    const maxActivity = Math.max(...activity);

    return (
        <div className="modern-card p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                This Week
            </h3>

            <div className="flex items-end justify-between gap-2 h-32">
                {days.map((day, index) => {
                    const heightPercentage = (activity[index] / maxActivity) * 100;
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full flex items-end justify-center flex-1">
                                <div
                                    className="w-full bg-gradient-blue rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer relative group"
                                    style={{ height: `${heightPercentage}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {activity[index]} commits
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-slate-500">{day}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
