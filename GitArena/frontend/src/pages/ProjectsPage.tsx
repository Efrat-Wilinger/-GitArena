import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

interface Space {
    id: number;
    name: string;
    description: string;
    members_count: number;
    created_at: string;
}

const ProjectsPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: spaces, isLoading } = useQuery<Space[]>({
        queryKey: ['spaces'],
        queryFn: async () => {
            const response = await apiClient.get('/spaces/');
            return response.data;
        },
    });

    if (isLoading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div></div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Projects</h1>
                    <p className="text-gray-400 mt-1">Manage your team spaces and repositories</p>
                </div>
                <button
                    onClick={() => navigate('/projects/new')}
                    className="bg-cyan-500 hover:bg-cyan-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Project
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {spaces?.map((space) => (
                    <div
                        key={space.id}
                        onClick={() => navigate(`/projects/${space.id}`)}
                        className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all group cursor-pointer"
                    >
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{space.name}</h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{space.description || 'No description'}</p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {space.members_count} Members
                            </div>
                            <button className="text-cyan-400 text-sm font-medium hover:text-cyan-300">
                                Open Dashboard →
                            </button>
                        </div>
                    </div>
                ))}

                {spaces?.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700 border-dashed">
                        <p className="text-gray-400 mb-4">You haven't created any projects yet.</p>
                        <button
                            onClick={() => navigate('/projects/new')}
                            className="text-cyan-400 hover:text-cyan-300 font-medium"
                        >
                            Create your first project
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectsPage;
