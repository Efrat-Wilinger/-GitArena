import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProjectContextType {
    currentProjectId: number | null;
    setCurrentProjectId: (id: number | null) => void;
    currentProjectName: string | null;
    setCurrentProjectName: (name: string | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentProjectId, setCurrentProjectIdState] = useState<number | null>(() => {
        const saved = localStorage.getItem('currentProjectId');
        return saved ? parseInt(saved, 10) : null;
    });

    const [currentProjectName, setCurrentProjectNameState] = useState<string | null>(() => {
        return localStorage.getItem('currentProjectName');
    });

    const setCurrentProjectId = (id: number | null) => {
        setCurrentProjectIdState(id);
        if (id !== null) {
            localStorage.setItem('currentProjectId', id.toString());
        } else {
            localStorage.removeItem('currentProjectId');
        }
    };

    const setCurrentProjectName = (name: string | null) => {
        setCurrentProjectNameState(name);
        if (name !== null) {
            localStorage.setItem('currentProjectName', name);
        } else {
            localStorage.removeItem('currentProjectName');
        }
    };

    return (
        <ProjectContext.Provider value={{
            currentProjectId,
            setCurrentProjectId,
            currentProjectName,
            setCurrentProjectName
        }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};
