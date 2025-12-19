import React from 'react';

export type UserRole = 'manager' | 'member';

interface RoleBasedViewProps {
    role: UserRole;
    managerView: React.ReactNode;
    memberView: React.ReactNode;
}

export const RoleBasedView: React.FC<RoleBasedViewProps> = ({ role, managerView, memberView }) => {
    return (
        <>
            {role === 'manager' ? managerView : memberView}
        </>
    );
};

export const useUserRole = (): UserRole => {
    // TODO: Get real role from API/context
    // For now, determine from localStorage or user data
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Determine if user is manager based on project creator
    // This should come from the backend
    return user.isProjectCreator ? 'manager' : 'member';
};

export default RoleBasedView;
