import React, { useState, useEffect } from 'react';

interface CommitData {
    date: string;
    count: number;
    additions?: number;
    deletions?: number;
}

interface AnimatedCommitGraphProps {
    data?: CommitData[];
    repoId?: string; // Keep for backward compatibility if needed, though data prop is preferred
}

export const AnimatedCommitGraph: React.FC<AnimatedCommitGraphProps> = ({ data: initialData }) => {
    const [data, setData] = useState<CommitData[]>([]);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useEffect(() => {
        if (initialData && initialData.length > 0) {
            setData(initialData);
        } else {
            // Fallback or empty state if no data provided
            setData([]);
        }
    }, [initialData]);

    const maxCount = Math.max(...data.map(d => d.count), 1);



    return (
        <div className="modern-card p-8 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 to-transparent"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-8 bg-blue-500 rounded-full animate-pulse"></span>
                        Commit Activity
                    </h3>
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            <span className="text-slate-400">Additions</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <span className="text-slate-400">Deletions</span>
                        </div>
                    </div>
                </div>

                {/* Graph */}
                <div className="relative h-64">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-slate-500 pr-4">
                        {[maxCount, Math.floor(maxCount * 0.75), Math.floor(maxCount * 0.5), Math.floor(maxCount * 0.25), 0].map((val, i) => (
                            <div key={i}>{val}</div>
                        ))}
                    </div>

                    {/* Grid lines */}
                    <div className="absolute left-12 right-0 top-0 bottom-0">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div key={i} className="absolute w-full border-t border-slate-800/50"
                                style={{ top: `${i * 25}%` }}></div>
                        ))}
                    </div>

                    {/* Bars */}
                    <div className="absolute left-12 right-0 top-0 bottom-0 flex items-end gap-1">
                        {data.map((item, index) => {
                            const heightPercentage = (item.count / maxCount) * 100;
                            const isHovered = hoveredIndex === index;

                            return (
                                <div
                                    key={index}
                                    className="flex-1 flex flex-col items-center gap-1 cursor-pointer group"
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    {/* Tooltip */}
                                    {isHovered && (
                                        <div className="absolute -top-24 bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl z-20 min-w-[180px]"
                                            style={{
                                                left: `${(index / data.length) * 100}%`,
                                                transform: 'translateX(-50%)',
                                                animation: 'fadeIn 0.2s ease-out'
                                            }}>
                                            <div className="text-xs text-slate-400 mb-1">{item.date}</div>
                                            <div className="text-white font-bold mb-2">{item.count} commits</div>
                                            <div className="flex gap-3 text-xs">
                                                <span className="text-green-400">+{item.additions}</span>
                                                <span className="text-red-400">-{item.deletions}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Bar */}
                                    <div className="w-full relative">
                                        <div
                                            className={`w-full bg-gradient-blue rounded-t transition-all duration-500 ease-out
                                                ${isHovered ? 'opacity-100 scale-x-110' : 'opacity-80 hover:opacity-100'}`}
                                            style={{
                                                height: `${heightPercentage}%`,
                                                minHeight: '2px',
                                                animation: `growUp 0.8s ease-out ${index * 0.02}s both`,
                                                boxShadow: isHovered ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none'
                                            }}
                                        />

                                        {/* Glow effect on hover */}
                                        {isHovered && (
                                            <div className="absolute inset-0 bg-blue-500/20 rounded-t blur-sm"></div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* X-axis labels */}
                <div className="mt-4 ml-12 flex justify-between text-xs text-slate-500">
                    <span>{data[0]?.date}</span>
                    <span>{data[Math.floor(data.length / 2)]?.date}</span>
                    <span>{data[data.length - 1]?.date}</span>
                </div>

                {/* Stats Summary */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total Commits', value: data.reduce((sum, d) => sum + d.count, 0), color: 'text-blue-400' },
                        { label: 'Lines Added', value: data.reduce((sum, d) => sum + (d.additions || 0), 0), color: 'text-green-400' },
                        { label: 'Lines Removed', value: data.reduce((sum, d) => sum + (d.deletions || 0), 0), color: 'text-red-400' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center p-3 rounded-lg bg-slate-800/30">
                            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value.toLocaleString()}</div>
                            <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes growUp {
                    from {
                        transform: scaleY(0);
                        transform-origin: bottom;
                    }
                    to {
                        transform: scaleY(1);
                        transform-origin: bottom;
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-5px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default AnimatedCommitGraph;
