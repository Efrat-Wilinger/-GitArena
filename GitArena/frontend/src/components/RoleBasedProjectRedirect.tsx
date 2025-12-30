import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useProject } from '../contexts/ProjectContext';

interface Space {
    id: number;
    name: string;
    description: string;
}

interface RoleResponse {
    role: 'manager' | 'member';
    space_id: number;
}

/**
 * Role-Based Project Redirect Component
 * 
 * This component intercepts /projects/:id navigation and redirects users
 * to the appropriate dashboard based on their role in the project:
 * - Managers → /manager/dashboard
 * - Members → /member/dashboard
 */
const RoleBasedProjectRedirect: React.FC = () => {
    const { spaceId } = useParams<{ spaceId: string }>();
    const navigate = useNavigate();
    const { setCurrentProjectId, setCurrentProjectName, setCurrentUserRole } = useProject();

    // Fetch user's spaces to get project name
    const { data: spaces } = useQuery<Space[]>({
        queryKey: ['user-spaces'],
        queryFn: async () => {
            const response = await apiClient.get('/spaces/');
            return response.data;
        },
    });

    // Fetch user's role in this project
    const { data: roleData, isLoading, error } = useQuery<RoleResponse>({
        queryKey: ['project-role', spaceId],
        queryFn: async () => {
            const response = await apiClient.get(`/spaces/${spaceId}/my-role`);
            return response.data;
        },
        enabled: !!spaceId,
        retry: false, // Don't retry on failure
    });

    useEffect(() => {
        if (!spaceId || isLoading) return;

        // Handle errors - redirect to projects page
        if (error) {
            console.error('Failed to fetch role:', error);
            navigate('/projects', { replace: true });
            return;
        }

        // If we have role data, set context and redirect
        if (roleData) {
            const projectId = parseInt(spaceId);

            console.log(`🔍 User role in project ${projectId}:`, roleData.role);

            // Set project context
            setCurrentProjectId(projectId);
            setCurrentUserRole(roleData.role);

            // Set project name from spaces data
            const project = spaces?.find(s => s.id === projectId);
            if (project) {
                setCurrentProjectName(project.name);
            }

            // Redirect based on role
            if (roleData.role === 'manager') {
                console.log('🟢 Redirecting manager to /manager/dashboard');
                navigate('/manager/dashboard', { replace: true });
            } else {
                console.log('🟢 Redirecting member to /member/dashboard');
                navigate('/member/dashboard', { replace: true });
            }
        }
    }, [spaceId, roleData, isLoading, error, spaces, navigate, setCurrentProjectId, setCurrentProjectName, setCurrentUserRole]);

    // Show loading state
    return (
        <div className="flex justify-center items-center h-64 animate-fade-in">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-400">Loading project...</p>
            </div>
        </div>
    );
};

export default RoleBasedProjectRedirect;
