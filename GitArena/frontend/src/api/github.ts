import apiClient from './client';

export interface Repository {
    id: number;
    github_id: string;
    name: string;
    full_name: string;
    description?: string;
    url: string;
    language?: string;
    stargazers_count: number;
    forks_count: number;
    is_synced: boolean;
    last_synced_at?: string;
    created_at: string;
}

export interface Commit {
    id: number;
    sha: string;
    message: string;
    author_name: string;
    author_email: string;
    committed_date: string;
    repository_id: number;
    additions: number;
    deletions: number;
    files_changed: number;
    created_at: string;
}

export interface PullRequest {
    id: number;
    number: number;
    title: string;
    state: 'open' | 'closed' | 'merged';
    author: string;
    created_at: string;
    merged_at?: string;
    additions: number;
    deletions: number;
}

export interface ActivityItem {
    id: string;
    type: 'commit' | 'pr' | 'review' | 'issue' | 'merge' | 'deploy';
    actor: {
        name: string;
        avatar: string;
    };
    action: string;
    target: string;
    timestamp: string;
    metadata?: any;
}

export interface TeamMember {
    id: string;
    username: string;
    name: string;
    email: string;
    avatar_url: string;
    role: 'manager' | 'member';
    joined_at: string;
    stats: {
        commits: number;
        prs: number;
        reviews: number;
    };
}

export interface AnalyticsData {
    commitTrend: Array<{ date: string; count: number }>;
    languageDistribution: Array<{ name: string; percentage: number }>;
    teamMetrics: {
        totalCommits: number;
        totalPRs: number;
        avgReviewTime: number;
    };
}

export const githubApi = {
    // Existing methods
    getRepositories: async (sync: boolean = false): Promise<Repository[]> => {
        const response = await apiClient.get('/github/repos', {
            params: { sync },
        });
        return response.data;
    },

    getCommits: async (repoId: number, sync: boolean = false, limit: number = 50): Promise<Commit[]> => {
        const response = await apiClient.get(`/github/repos/${repoId}/commits`, {
            params: { sync, limit },
        });
        return response.data;
    },

    getRepositoryTree: async (repoId: number, path?: string): Promise<any[]> => {
        const response = await apiClient.get(`/github/repos/${repoId}/tree`, {
            params: { path }
        });
        return response.data;
    },

    getCommitForPath: async (repoId: number, path: string): Promise<any> => {
        const response = await apiClient.get(`/github/repos/${repoId}/commits/path`, {
            params: { path }
        });
        return response.data;
    },

    // New methods for advanced features
    getPullRequests: async (repoId: number): Promise<PullRequest[]> => {
        const response = await apiClient.get(`/github/repos/${repoId}/pulls`);
        return response.data;
    },

    getReadme: async (repoId: number): Promise<{ content: string }> => {
        const response = await apiClient.get(`/github/repos/${repoId}/readme`);
        return response.data;
    },


    updateReadme: async (repoId: number, content: string): Promise<void> => {
        await apiClient.put(`/github/repos/${repoId}/readme`, { content });
    },

    getTeamMembers: async (projectId: string): Promise<TeamMember[]> => {
        const response = await apiClient.get(`/projects/${projectId}/members`);
        return response.data;
    },

    addTeamMember: async (projectId: string, username: string, role: string): Promise<void> => {
        await apiClient.post(`/projects/${projectId}/members`, { username, role });
    },

    removeTeamMember: async (projectId: string, userId: string): Promise<void> => {
        await apiClient.delete(`/projects/${projectId}/members/${userId}`);
    },


    getActivityLog: async (projectId: string, filters?: {
        type?: string;
        dateRange?: string;
        memberId?: string;
    }): Promise<ActivityItem[]> => {
        const response = await apiClient.get(`/projects/${projectId}/activity`, {
            params: filters
        });
        return response.data;
    },

    getAnalytics: async (projectId: string, timeRange?: string): Promise<AnalyticsData> => {
        const response = await apiClient.get(`/projects/${projectId}/analytics`, {
            params: { timeRange }
        });
        return response.data;
    },

    getCommitActivity: async (repoId: number, days: number = 30): Promise<Array<{
        date: string;
        count: number;
        additions: number;
        deletions: number;
    }>> => {
        const response = await apiClient.get(`/github/repos/${repoId}/activity`, {
            params: { days }
        });
        return response.data;
    },

    getLanguageStats: async (repoId: number): Promise<Array<{
        name: string;
        percentage: number;
        bytes: number;
    }>> => {
        const response = await apiClient.get(`/github/repos/${repoId}/languages`);
        return response.data;
    },

    getUserTasks: async (userId: number): Promise<Array<{
        id: string;
        type: 'pr' | 'issue' | 'review';
        title: string;
        repo: string;
        status: string;
        priority: string;
        dueDate?: string;
        url: string;
        number: number;
    }>> => {
        const response = await apiClient.get(`/users/${userId}/tasks`);
        return response.data;
    },

    getGamificationStats: async (): Promise<{
        level: number;
        xp: number;
        totalXp: number;
        nextLevelXp: number;
        skills: Record<string, number>;
        achievements: string[];
        streak: number;
    }> => {
        const response = await apiClient.get('/gamification/stats');
        return response.data;
    },

    getChallenges: async (): Promise<Array<{
        id: number;
        title: string;
        progress: number;
        total: number;
        reward: string;
        active: boolean;
    }>> => {
        const response = await apiClient.get('/gamification/challenges');
        return response.data;
    },


    getAIInsights: async (userId?: number): Promise<Array<{
        id: string;
        type: 'positive' | 'warning' | 'info';
        title: string;
        description: string;
        metric?: string;
        trend?: 'up' | 'down';
    }>> => {
        const response = await apiClient.get('/ai/insights', {
            params: { userId }
        });
        return response.data;
    }
};
