import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

interface MemberLoad {
    user_id: number;
    username: string;
    avatar_url: string | null;
    velocity: number;
    status: 'Overloaded' | 'Optimal' | 'Underutilized';
}

interface TeamCapacityResponse {
    total_capacity_score: number;
    active_members_count: number;
    average_velocity: number;
    predicted_sprint_output: number;
    sprint_risk: 'Low' | 'Medium' | 'High';
    member_loads: MemberLoad[];
}

interface CapacityPlanningWidgetProps {
    projectId?: number;
}

export const CapacityPlanningWidget: React.FC<CapacityPlanningWidgetProps> = ({ projectId }) => {
    const { data, isLoading, error } = useQuery<TeamCapacityResponse>({
        queryKey: ['teamCapacity', projectId],
        queryFn: async () => {
            const params = projectId ? { project_id: projectId } : {};
            const response = await apiClient.get('/analytics/capacity', { params });
            return response.data;
        }
    });

    if (isLoading) {
        return (
            <div className="modern-card p-6 rounded-2xl animate-pulse">
                <div className="h-6 w-48 bg-slate-700/50 rounded mb-4"></div>
                <div className="space-y-3">
                    <div className="h-12 bg-slate-700/30 rounded-xl"></div>
                    <div className="h-12 bg-slate-700/30 rounded-xl"></div>
                    <div className="h-12 bg-slate-700/30 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return null;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Overloaded': return 'text-red-400 bg-red-400/10';
            case 'Optimal': return 'text-green-400 bg-green-400/10';
            case 'Underutilized': return 'text-yellow-400 bg-yellow-400/10';
            default: return 'text-slate-400 bg-slate-400/10';
        }
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'High': return 'text-red-500';
            case 'Medium': return 'text-yellow-500';
            case 'Low': return 'text-green-500';
            default: return 'text-slate-500';
        }
    };

    return (
        <div className="modern-card p-6 rounded-2xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between mb-8 relative">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span>⚖️</span>
                        Team Capacity
                    </h3>
                    <p className="text-sm text-slate-400">Sprint planning assistant</p>
                </div>

                <div className="text-right">
                    <div className="text-sm text-slate-400">Sprint Risk</div>
                    <div className={`text-lg font-bold ${getRiskColor(data.sprint_risk)}`}>
                        {data.sprint_risk}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-800/50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-white">{data.total_capacity_score}</div>
                    <div className="text-xs text-slate-500 uppercase">Health Score</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-blue-400">{data.average_velocity}</div>
                    <div className="text-xs text-slate-500 uppercase">Avg Velocity</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-purple-400">{data.predicted_sprint_output}</div>
                    <div className="text-xs text-slate-500 uppercase">Est. Output</div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Member Workload</h4>

                <div className="space-y-3">
                    {data.member_loads.map((member) => (
                        <div key={member.user_id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden ring-2 ring-slate-700/50">
                                    {member.avatar_url ? (
                                        <img src={member.avatar_url} alt={member.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            {member.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="font-medium text-white">{member.username}</div>
                                    <div className="text-xs text-slate-500">
                                        Velocity: {member.velocity} / day
                                    </div>
                                </div>
                            </div>

                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(member.status)}`}>
                                {member.status}
                            </div>
                        </div>
                    ))}

                    {data.member_loads.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                            No active members found for capacity planning.
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/50 text-center">
                <p className="text-xs text-slate-500">
                    💡 <strong>Tip:</strong> Assign tasks to "Underutilized" members to balance the load.
                </p>
            </div>
        </div>
    );
};

export default CapacityPlanningWidget;
