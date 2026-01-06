import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { authApi, User } from '../api/auth';
import { useProject } from '../contexts/ProjectContext';

interface Space {
    id: number;
    name: string;
    description: string;
    members_count: number;
    updated_at: string;
}

const ProjectSelectionPage: React.FC = () => {
    const navigate = useNavigate();
    const { setCurrentProjectId, setCurrentProjectName, fetchAndSetUserRole, currentUserRole } = useProject();

    const { data: user } = useQuery<User>({
        queryKey: ['currentUser'],
        queryFn: authApi.getCurrentUser,
    });

    const { data: spaces, isLoading } = useQuery<Space[]>({
        queryKey: ['spaces'],
        queryFn: async () => {
            const response = await apiClient.get('/spaces/');
            return response.data;
        },
    });

    // Get most recent project
    const mostRecentProject = spaces && spaces.length > 0
        ? [...spaces].sort((a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )[0]
        : null;

    const handleContinue = async (project?: Space) => {
        const selectedProject = project || mostRecentProject;
        console.log('🔵 handleContinue called!', selectedProject);
        if (selectedProject) {
            // Set project context
            setCurrentProjectId(selectedProject.id);
            setCurrentProjectName(selectedProject.name);

            // Fetch role and redirect
            try {
                console.log('🟢 Fetching role for project:', selectedProject.id);
                const roleResponse = await apiClient.get(`/spaces/${selectedProject.id}/my-role`);
                const role = roleResponse.data.role;
                console.log('🟢 Role received:', role);
                await fetchAndSetUserRole(selectedProject.id);

                if (role === 'manager') {
                    console.log('🟢 Redirecting to /manager/dashboard');
                    navigate('/manager/dashboard');
                } else {
                    console.log('🟢 Redirecting to /member/dashboard');
                    navigate('/member/dashboard');
                }
            } catch (error) {
                console.error('🔴 Failed to fetch role:', error);
                navigate('/projects');
            }
        } else {
            // If no projects exist, go to projects page
            navigate('/projects');
        }
    };

    const handleNewProject = () => {
        navigate('/projects/new');
    };

    const handleGoToDashboard = () => {
        // Use current role if available, otherwise default to member
        navigate(currentUserRole === 'manager' ? '/manager/dashboard' : '/member/dashboard');
    };


    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px] opacity-50"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-900/20 rounded-full blur-[100px] opacity-40"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
                {/* Header */}
                <div className="text-center mb-16 animate-fade-in">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-blue-500/20 shadow-xl">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt={user.name || 'User'} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-200">
                        Welcome back, {user?.name?.split(' ')[0] || 'Developer'}!
                    </h1>
                    <p className="text-xl text-gray-400">
                        What would you like to work on today?
                    </p>
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Continue with Recent Project */}
                    <div className="group relative bg-gradient-to-br from-cyan-600/10 via-blue-600/10 to-purple-600/10 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 overflow-hidden transition-all duration-300 hover:border-cyan-500 hover:shadow-2xl hover:shadow-cyan-500/20">
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/5 group-hover:to-blue-500/5 transition-all duration-500"></div>

                        <div className="relative z-10">
                            {/* Icon */}
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>

                            {/* Content */}
                            <h3 className="text-2xl font-bold text-white mb-3">
                                Continue Working
                            </h3>

                            {spaces && spaces.length > 0 ? (
                                <>
                                    <p className="text-gray-400 mb-4">
                                        Pick up where you left off
                                    </p>
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {[...spaces].sort((a, b) =>
                                            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                                        ).map((project) => (
                                            <div
                                                key={project.id}
                                                onClick={() => handleContinue(project)}
                                                className="bg-black/30 rounded-lg p-4 border border-gray-700/50 hover:border-cyan-500/50 cursor-pointer transition-all duration-200 hover:bg-black/40"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                                                        {project.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-white truncate">{project.name}</h4>
                                                        <p className="text-sm text-gray-500 line-clamp-1">{project.description || 'No description'}</p>
                                                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                            <span>{project.members_count} member{project.members_count !== 1 ? 's' : ''}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-400">
                                    No projects yet. Create your first one!
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Start New Project */}
                    <div
                        onClick={handleNewProject}
                        className="group relative bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-orange-600/10 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 cursor-pointer hover:border-purple-500 transition-all duration-300 overflow-hidden hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20"
                    >
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500"></div>

                        <div className="relative z-10">
                            {/* Icon */}
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>

                            {/* Content */}
                            <h3 className="text-2xl font-bold text-white mb-3">
                                Start New Project
                            </h3>
                            <p className="text-gray-400 mb-6">
                                Create a fresh project and invite your team
                            </p>

                            {/* Features List */}
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Track team progress</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Analytics & insights</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Collaborate seamlessly</span>
                                </li>
                            </ul>
                        </div>

                        {/* Arrow indicator */}
                        <div className="absolute bottom-6 right-6 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="flex items-center justify-center gap-4 text-sm">
                    <button
                        onClick={handleGoToDashboard}
                        className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Go to dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectSelectionPage;
