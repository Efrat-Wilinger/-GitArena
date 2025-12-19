import React from 'react';

interface ContributionDay {
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
}

interface ContributionHeatmapProps {
    data?: ContributionDay[];
}

const ContributionHeatmap: React.FC<ContributionHeatmapProps> = ({ data }) => {
    // Generate sample data for last 365 days if not provided
    const generateSampleData = (): ContributionDay[] => {
        const days: ContributionDay[] = [];
        const today = new Date();

        for (let i = 364; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const count = Math.random() > 0.3 ? Math.floor(Math.random() * 20) : 0;
            const level = count === 0 ? 0 : count < 5 ? 1 : count < 10 ? 2 : count < 15 ? 3 : 4;

            days.push({
                date: date.toISOString().split('T')[0],
                count,
                level: level as 0 | 1 | 2 | 3 | 4,
            });
        }

        return days;
    };

    const contributions = data || generateSampleData();

    // Group by weeks
    const weeks: ContributionDay[][] = [];
    let currentWeek: ContributionDay[] = [];

    contributions.forEach((day, index) => {
        const dayOfWeek = new Date(day.date).getDay();

        if (dayOfWeek === 0 && currentWeek.length > 0) {
            weeks.push(currentWeek);
            currentWeek = [];
        }

        currentWeek.push(day);

        if (index === contributions.length - 1) {
            weeks.push(currentWeek);
        }
    });

    const getLevelColor = (level: number) => {
        const colors = {
            0: 'bg-slate-800 border-slate-700',
            1: 'bg-blue-900/40 border-blue-800/40',
            2: 'bg-blue-700/60 border-blue-600/60',
            3: 'bg-blue-500/80 border-blue-400/80',
            4: 'bg-blue-400 border-blue-300',
        };
        return colors[level as keyof typeof colors] || colors[0];
    };

    const totalContributions = contributions.reduce((sum, day) => sum + day.count, 0);
    const currentStreak = (() => {
        let streak = 0;
        for (let i = contributions.length - 1; i >= 0; i--) {
            if (contributions[i].count > 0) streak++;
            else break;
        }
        return streak;
    })();

    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div>
            <div className="flex items-center justify-end gap-4 mb-4">
                <div className="flex gap-4 text-sm">
                    <div className="text-center px-4 py-2 modern-card">
                        <div className="text-2xl font-bold text-blue-400">{totalContributions}</div>
                        <div className="text-slate-500 text-xs mt-1">Total</div>
                    </div>
                    <div className="text-center px-4 py-2 modern-card">
                        <div className="text-2xl font-bold text-blue-400">{currentStreak}</div>
                        <div className="text-slate-500 text-xs mt-1">Day Streak</div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto pb-2">
                <div className="inline-flex flex-col gap-1">
                    {/* Month labels */}
                    <div className="flex gap-1 pl-8 mb-1">
                        {weeks.map((week, weekIndex) => {
                            const firstDay = week[0];
                            const date = new Date(firstDay.date);
                            const isFirstWeekOfMonth = date.getDate() <= 7;

                            return (
                                <div key={weekIndex} className="w-3 text-xs text-slate-500">
                                    {isFirstWeekOfMonth ? monthLabels[date.getMonth()] : ''}
                                </div>
                            );
                        })}
                    </div>

                    {/* Grid */}
                    <div className="flex gap-1">
                        {/* Day labels */}
                        <div className="flex flex-col gap-1 justify-around pr-2">
                            {dayLabels.filter((_, i) => i % 2 === 1).map((day, i) => (
                                <div key={i} className="text-xs text-slate-500 h-3 flex items-center">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Contribution cells */}
                        <div className="flex gap-1">
                            {weeks.map((week, weekIndex) => (
                                <div key={weekIndex} className="flex flex-col gap-1">
                                    {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
                                        const day = week.find(d => new Date(d.date).getDay() === dayIndex);

                                        if (!day) {
                                            return <div key={dayIndex} className="w-3 h-3" />;
                                        }

                                        return (
                                            <div
                                                key={dayIndex}
                                                className={`group relative w-3 h-3 rounded-sm border transition-all duration-200 hover:scale-125 hover:z-10 cursor-pointer ${getLevelColor(day.level)}`}
                                            >
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                                                    <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-xl border border-slate-700">
                                                        <div className="font-semibold">{day.count} contribution{day.count !== 1 ? 's' : ''}</div>
                                                        <div className="text-slate-400">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContributionHeatmap;
