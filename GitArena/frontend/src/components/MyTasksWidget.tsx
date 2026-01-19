import { useQuery } from '@tanstack/react-query';
import { githubApi } from '../api/github';

interface Task {
    id: string;
    title: string;
    type: 'pr' | 'issue' | 'review';
    status: string;
    priority?: 'high' | 'medium' | 'low';
    created_at?: string;
    repo: string;
    number: number;
    url: string;
}

interface MyTasksWidgetProps {
    projectId?: number;
    userId?: number;
}

const MyTasksWidget: React.FC<MyTasksWidgetProps> = ({ userId }) => {
    const { data: tasks = [] } = useQuery<Task[]>({
        queryKey: ['userTasks', userId],
        queryFn: () => githubApi.getUserTasks(userId!) as Promise<Task[]>,
        enabled: !!userId,
    });

    const getTypeIcon = (type: string) => {
        return type === 'pr' ? '🔀' : '❗';
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'high': return 'text-red-400 bg-red-500/10 border-red-500/30';
            case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
            case 'low': return 'text-green-400 bg-green-500/10 border-green-500/30';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
        }
    };

    return (
        <div className="modern-card p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                        <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                        My Active Tasks
                    </h3>
                    <p className="text-sm text-slate-400">Work in progress</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold">
                    {tasks.length}
                </div>
            </div>

            <div className="space-y-3">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <div
                            key={task.id}
                            className="group p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 transition-all cursor-pointer"
                        >
                            <div className="flex items-start gap-3">
                                <div className="text-2xl mt-0.5">{getTypeIcon(task.type)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                                            {task.title}
                                        </h4>
                                        {task.priority && (
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${getPriorityColor(task.priority)} whitespace-nowrap`}>
                                                {task.priority}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span className="px-2 py-0.5 rounded bg-slate-700/50 font-mono">
                                            {task.type.toUpperCase()}
                                        </span>
                                        <span>•</span>
                                        <span>{task.status.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-2">✨</div>
                        <p className="text-slate-400 text-sm">No active tasks</p>
                        <p className="text-slate-500 text-xs mt-1">You're all caught up!</p>
                    </div>
                )}
            </div>

            {tasks.length > 0 && (
                <button className="w-full mt-4 py-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                    View All Tasks →
                </button>
            )}
        </div>
    );
};

export default MyTasksWidget;
