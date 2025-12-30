import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage';
import CallbackPage from '@/pages/CallbackPage';
import RepositoriesPage from '@/pages/RepositoriesPage';
import CommitsPage from '@/pages/CommitsPage';
import RepositoryCodePage from './pages/RepositoryCodePage';
import ProjectsPage from './pages/ProjectsPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectSelectionPage from './pages/ProjectSelectionPage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useUserRole } from './components/RoleBasedView';
import { ProjectProvider } from './contexts/ProjectContext';


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
import RoleBasedProjectRedirect from './components/RoleBasedProjectRedirect';

const queryClient = new QueryClient();

const ProtectedLayout = () => {
    const isAuthenticated = !!localStorage.getItem('token');
    return isAuthenticated ? <Layout /> : <Navigate to="/login" replace />;
};

// Role-based redirect for legacy routes
const RoleBasedDashboard = () => {
    const role = useUserRole();
    return role === 'manager'
        ? <Navigate to="/manager/dashboard" replace />
        : <Navigate to="/member/dashboard" replace />;
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ProjectProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/auth/callback" element={<CallbackPage />} />

                        <Route path="/" element={<ProtectedLayout />}>
                            {/* Project Selection Welcome Screen */}
                            <Route index element={<ProjectSelectionPage />} />

                            {/* Manager Routes - Protected */}
                            <Route path="manager">
                                <Route path="dashboard" element={
                                    <ProtectedRoute requiredRole="manager">
                                        <ProfilePage />
                                    </ProtectedRoute>
                                } />
                                <Route path="team" element={
                                    <ProtectedRoute requiredRole="manager">
                                        <TeamManagementPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="activity" element={
                                    <ProtectedRoute requiredRole="manager">
                                        <ActivityJournalPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="analytics" element={
                                    <ProtectedRoute requiredRole="manager">
                                        <AnalyticsPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="settings" element={
                                    <ProtectedRoute requiredRole="manager">
                                        <SettingsPage />
                                    </ProtectedRoute>
                                } />
                            </Route>

                            {/* Member Routes - Protected */}
                            <Route path="member">
                                <Route path="dashboard" element={
                                    <ProtectedRoute requiredRole="member">
                                        <MemberDashboardPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="my-work" element={
                                    <ProtectedRoute requiredRole="member">
                                        <MyWorkPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="achievements" element={
                                    <ProtectedRoute requiredRole="member">
                                        <AchievementsPage />
                                    </ProtectedRoute>
                                } />
                            </Route>

                            {/* Shared Routes */}
                            <Route path="readme/:repoId" element={<ReadmeViewerPage />} />
                            <Route path="repositories" element={<RepositoriesPage />} />
                            <Route path="repositories/:repoId/commits" element={<CommitsPage />} />
                            <Route path="repositories/:repoId/code" element={<RepositoryCodePage />} />
                            <Route path="projects" element={<ProjectsPage />} />
                            <Route path="projects/new" element={<CreateProjectPage />} />
                            <Route path="projects/:spaceId" element={<RoleBasedProjectRedirect />} />

                            {/* Legacy profile route - redirect based on role */}
                            <Route path="profile" element={<RoleBasedDashboard />} />
                        </Route>
                    </Routes>
                </Router>
            </ProjectProvider>
        </QueryClientProvider>
    );
}

export default App;

