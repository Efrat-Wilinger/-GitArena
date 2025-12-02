import apiClient from './client';

export interface User {
    id: number;
    username: string;
    email?: string;
    name?: string;
    avatar_url?: string;
    github_id: string;
    created_at: string;
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
};
