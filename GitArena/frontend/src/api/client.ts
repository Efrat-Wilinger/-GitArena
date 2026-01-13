import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log(`[API] Auth token added to ${config.url}`);
        } else {
            console.warn(`[API] No token found for ${config.url}`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const analytics = {
    getManagerDeepDive: (timeRange: string = '30days', projectId?: number) => {
        return apiClient.get(`/analytics/manager/analytics-report`, { params: { timeRange, project_id: projectId } });
    },
    getDoraMetrics: (projectId?: number) => {
        return apiClient.get(`/analytics/dora`, { params: { project_id: projectId } });
    },
    getBurnoutMetrics: (projectId?: number) => {
        return apiClient.get(`/analytics/burnout`, { params: { project_id: projectId } });
    }
};

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
