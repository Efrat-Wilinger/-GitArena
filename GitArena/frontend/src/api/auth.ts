import apiClient from './client';

export interface User {
    id: number;
    username: string;
    email?: string;
    name?: string;
    avatar_url?: string;
    github_id: string;
    created_at: string;
    bio?: string;
    location?: string;
    company?: string;
    blog?: string;
    twitter_username?: string;
    stats?: {
        total_repositories: number;
        total_commits: number;
        total_prs: number;
        total_issues: number;
    };
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
    user: User;
}

export const authApi = {
    githubLogin: async (code: string): Promise<TokenResponse> => {
        const response = await apiClient.post('/auth/github/login', null, {
            params: { code },
        });
        return response.data;
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await apiClient.get('/users/me');
        return response.data;
    },

    getUserDashboard: async (): Promise<UserDashboardResponse> => {
        const response = await apiClient.get('/users/dashboard/stats');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },
};

export interface LanguageStats {
    name: string;
    percentage: number;
    color: string;
}

export interface CommitStats {
    message: string;
    repo: string;
    time: string;
    additions: number;
    deletions: number;
}

export interface PRStats {
    label: string;
    count: number;
    color: string;
    bgColor: string;
}

export interface RepoStats {
    name: string;
    stars: number;
    language: string;
    trend: string;
}

export interface ActivityStats {
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
}

export interface UserDashboardResponse {
    languages: LanguageStats[];
    recent_commits: CommitStats[];
    pr_status: PRStats[];
    top_repos: RepoStats[];
    weekly_activity: number[];
    heatmap_data: ActivityStats[];
}
