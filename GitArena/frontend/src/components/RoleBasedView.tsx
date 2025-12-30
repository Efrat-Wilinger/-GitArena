import React from 'react';
import { useProject, UserRole } from '../contexts/ProjectContext';

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
    const { currentUserRole } = useProject();
    return currentUserRole || 'member'; // Default to 'member' if no role set
};

export type { UserRole };

export default RoleBasedView;
