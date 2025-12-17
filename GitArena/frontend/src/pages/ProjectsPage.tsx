import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import Button from '../components/Button';

interface Space {
    id: number;
    name: string;
    description: string;
    members_count: number;
    created_at: string;
}

const ProjectsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'members' | 'date'>('date');

    const { data: spaces, isLoading } = useQuery<Space[]>({
        queryKey: ['spaces'],
        queryFn: async () => {
            const response = await apiClient.get('/spaces/');
            return response.data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-3 border-cyan-500 border-t-transparent"></div>
            </div>
        );
    }

    // Filter and sort projects
    const filteredSpaces = spaces?.filter(space =>
        space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const sortedSpaces = [...filteredSpaces].sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'members') return b.members_count - a.members_count;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const totalMembers = spaces?.reduce((acc, space) => acc + space.members_count, 0) || 0;

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Hero Section with Stats */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600/20 via-purple-600/20 to-pink-600/20 border border-cyan-500/30 p-8 backdrop-blur-xl animate-stagger-1">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-bold text-gradient mb-2">My Projects</h1>
                            <p className="text-gray-300">Collaborate, track, and analyze your team's progress</p>
                        </div>
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() => navigate('/projects/new')}
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            }
                        >
                            Create New Project
                        </Button>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm font-medium">Total Projects</p>
                                    <p className="text-3xl font-bold text-white mt-1">{spaces?.length || 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm font-medium">Team Members</p>
                                    <p className="text-3xl font-bold text-white mt-1">{totalMembers}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm font-medium">Active This Week</p>
                                    <p className="text-3xl font-bold text-white mt-1">{Math.min(spaces?.length || 0, 3)}</p>
                                </div>
                                <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 animate-stagger-2">
                {/* Search */}
                <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                </div>

                {/* Sort */}
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all cursor-pointer"
                >
                    <option value="date">Sort by: Recent</option>
                    <option value="name">Sort by: Name</option>
                    <option value="members">Sort by: Members</option>
                </select>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger-3">
                {sortedSpaces.map((space, index) => (
                    <div
                        key={space.id}
                        onClick={() => navigate(`/projects/${space.id}`)}
                        className="group relative bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer card-hover-lift overflow-hidden"
                        style={{ animation: `slideInUp 0.4s ease-out ${0.1 * index}s both` }}
                    >
                        {/* Gradient Glow on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10 transition-all duration-500 rounded-xl pointer-events-none"></div>

                        <div className="relative z-10">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    {space.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-xs font-semibold">
                                    Active
                                </span>
                            </div>

                            {/* Title & Description */}
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gradient-cyan-purple transition-all">
                                {space.name}
                            </h3>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                                {space.description || 'No description provided'}
                            </p>

                            {/* Metadata */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-700 group-hover:border-gray-600 transition-colors">
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {[...Array(Math.min(space.members_count, 3))].map((_, i) => (
                                            <div key={i} className={`w-7 h-7 rounded-full bg-gradient-to-br ${i === 0 ? 'from-cyan-500 to-blue-600' :
                                                    i === 1 ? 'from-purple-500 to-pink-600' :
                                                        'from-orange-500 to-red-600'
                                                } border-2 border-gray-800 flex items-center justify-center text-white text-xs font-bold`}>
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-500 ml-1">
                                        {space.members_count} member{space.members_count !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-cyan-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    Open
                                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {sortedSpaces.length === 0 && !isLoading && (
                    <div className="col-span-full text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700 border-dashed">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-400 mb-2">
                                    {searchQuery ? 'No projects found matching your search' : 'You haven\'t created any projects yet'}
                                </p>
                                {!searchQuery && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => navigate('/projects/new')}
                                    >
                                        Create your first project
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectsPage;
