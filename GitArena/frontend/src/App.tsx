import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage';
import CallbackPage from '@/pages/CallbackPage';
import ProfilePage from '@/pages/ProfilePage';
import RepositoriesPage from '@/pages/RepositoriesPage';
import CommitsPage from '@/pages/CommitsPage';
import RepositoryCodePage from './pages/RepositoryCodePage';
import ProjectsPage from './pages/ProjectsPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectDashboardPage from './pages/ProjectDashboardPage';
import Layout from './components/Layout';

const queryClient = new QueryClient();

const ProtectedLayout = () => {
    const isAuthenticated = !!localStorage.getItem('token');
    return isAuthenticated ? <Layout /> : <Navigate to="/login" replace />;
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/auth/callback" element={<CallbackPage />} />

                    <Route path="/" element={<ProtectedLayout />}>
                        <Route index element={<Navigate to="/profile" replace />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="projects" element={<ProjectsPage />} />
                        <Route path="projects/new" element={<CreateProjectPage />} />
                        <Route path="projects/:spaceId" element={<ProjectDashboardPage />} />
                        <Route path="repositories" element={<RepositoriesPage />} />
                        <Route path="repositories/:repoId/commits" element={<CommitsPage />} />
                        <Route path="repositories/:repoId/code" element={<RepositoryCodePage />} />
                    </Route>
                </Routes>
            </Router>
        </QueryClientProvider>
    );
}

export default App;
