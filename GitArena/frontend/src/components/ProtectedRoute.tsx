import React from 'react';
import { Navigate } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole: 'manager' | 'member';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    const { currentUserRole, currentProjectId } = useProject();

    // If no project is selected, redirect to project selection
    if (!currentProjectId) {
        return <Navigate to="/" replace />;
    }

    // If role doesn't match required role, redirect to appropriate dashboard
    if (currentUserRole !== requiredRole) {
        if (currentUserRole === 'manager') {
            return <Navigate to="/manager/dashboard" replace />;
        } else {
            return <Navigate to="/member/dashboard" replace />;
        }
    }

    // Role matches, render children
    return <>{children}</>;
};

export default ProtectedRoute;
