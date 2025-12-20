import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage';
import CallbackPage from '@/pages/CallbackPage';
import RepositoriesPage from '@/pages/RepositoriesPage';
import CommitsPage from '@/pages/CommitsPage';
import RepositoryCodePage from './pages/RepositoryCodePage';
import ProjectsPage from './pages/ProjectsPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectDashboardPage from './pages/ProjectDashboardPage';
import Layout from './components/Layout';
import { useUserRole } from './components/RoleBasedView';

// Manager pages
import TeamManagementPage from './pages/manager/TeamManagementPage';
import ActivityJournalPage from './pages/manager/ActivityJournalPage';
import SettingsPage from './pages/manager/SettingsPage';
import AnalyticsPage from './pages/AnalyticsPage';

// Member pages
import MemberDashboardPage from './pages/member/MemberDashboardPage';
import MyWorkPage from './pages/member/MyWorkPage';
import AchievementsPage from './pages/member/AchievementsPage';

// Shared pages
import ProfilePage from '@/pages/ProfilePage';
import ReadmeViewerPage from './pages/shared/ReadmeViewerPage';

const queryClient = new QueryClient();

const ProtectedLayout = () => {
    const isAuthenticated = !!localStorage.getItem('token');
    return isAuthenticated ? <Layout /> : <Navigate to="/login" replace />;
};

// Role-based redirect
const RoleBasedDashboard = () => {
    const role = useUserRole();
    return role === 'manager'
        ? <Navigate to="/manager/dashboard" replace />
        : <Navigate to="/member/dashboard" replace />;
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/auth/callback" element={<CallbackPage />} />

                    <Route path="/" element={<ProtectedLayout />}>
                        {/* Root redirect based on role */}
                        <Route index element={<RoleBasedDashboard />} />

                        {/* Manager Routes */}
                        <Route path="manager">
                            <Route path="dashboard" element={<ProfilePage />} />
                            <Route path="team" element={<TeamManagementPage />} />
                            <Route path="activity" element={<ActivityJournalPage />} />
                            <Route path="analytics" element={<AnalyticsPage />} />
                            <Route path="settings" element={<SettingsPage />} />
                        </Route>

                        {/* Member Routes */}
                        <Route path="member">
                            <Route path="dashboard" element={<MemberDashboardPage />} />
                            <Route path="my-work" element={<MyWorkPage />} />
                            <Route path="achievements" element={<AchievementsPage />} />
                        </Route>

                        {/* Shared Routes */}
                        <Route path="readme/:repoId" element={<ReadmeViewerPage />} />
                        <Route path="repositories" element={<RepositoriesPage />} />
                        <Route path="repositories/:repoId/commits" element={<CommitsPage />} />
                        <Route path="repositories/:repoId/code" element={<RepositoryCodePage />} />
                        <Route path="projects" element={<ProjectsPage />} />
                        <Route path="projects/new" element={<CreateProjectPage />} />
                        <Route path="projects/:spaceId" element={<ProjectDashboardPage />} />

                        {/* Legacy profile route - redirect based on role */}
                        <Route path="profile" element={<RoleBasedDashboard />} />
                    </Route>
                </Routes>
            </Router>
        </QueryClientProvider>
    );
}

export default App;
