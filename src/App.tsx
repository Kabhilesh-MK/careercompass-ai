import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { NotFoundPage } from '@/components/NotFoundPage';
import { ToastContainer } from '@/components/Toast';
import { ToastProvider } from '@/context/ToastContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AppStateProvider } from '@/context/AppStateContext';
import PageSkeleton from '@/components/PageSkeleton';

// Auth pages — small, load eagerly
import LoginPage from '@/pages/auth/Login';
import RegisterPage from '@/pages/auth/Register';
import ForgotPasswordPage from '@/pages/auth/ForgotPassword';

// Onboarding and dashboard pages
const OnboardingPage        = lazy(() => import('@/pages/auth/Onboarding'));
const DashboardPage         = lazy(() => import('@/pages/dashboard/Dashboard'));

// Career Intelligence
const CareerPredictionPage  = lazy(() => import('@/pages/career/CareerPrediction'));
const CareerExplorerPage    = lazy(() => import('@/pages/career/CareerExplorer'));
const CareerComparisonPage  = lazy(() => import('@/pages/career/CareerComparisonView'));

// Skill Intelligence
const SkillOverviewPage     = lazy(() => import('@/pages/skills/SkillOverview'));
const SkillAssessmentPage   = lazy(() => import('@/pages/skills/SkillAssessment'));
const SkillGapPage          = lazy(() => import('@/pages/skills/SkillGapView'));

// Learning Hub
const LearningHubPage       = lazy(() => import('@/pages/learning/LearningHub'));
const LearningPathsPage     = lazy(() => import('@/pages/learning/LearningPathsView'));
const ExperienceLabPage     = lazy(() => import('@/pages/learning/ExperienceLab'));

// Roadmap & Progress
const RoadmapPage           = lazy(() => import('@/pages/roadmap/Roadmap'));
const LearningProgressPage  = lazy(() => import('@/pages/progress/LearningProgress'));

// Portfolio
const PortfolioDashboardPage = lazy(() => import('@/pages/portfolio/PortfolioDashboard'));

// Account & History
const PredictionHistoryPage = lazy(() => import('@/pages/predictions/PredictionHistory'));
const ProfilePage           = lazy(() => import('@/pages/profile/Profile'));
const SettingsPage          = lazy(() => import('@/pages/settings/Settings'));

// Preserved Existing Tools & Workflows
const ResumeAnalyzerPage    = lazy(() => import('@/pages/resume/ResumeAnalyzer'));
const PlacementPage         = lazy(() => import('@/pages/reports/Placement'));
const MentorPage            = lazy(() => import('@/pages/dashboard/Mentor'));
const ReportsPage           = lazy(() => import('@/pages/reports/Reports'));
const AdminPage             = lazy(() => import('@/pages/admin/Admin'));
const FavoritesPage         = lazy(() => import('@/pages/favorites/Favorites'));
const AnalyticsPage         = lazy(() => import('@/pages/analytics/Analytics'));

function ProtectedRoute() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <PageSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !user.profile_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}

function PublicRoute() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <PageSkeleton />;
  }

  if (isAuthenticated) {
    if (user && !user.profile_completed) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function RootRedirect() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <PageSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !user.profile_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

function OnboardingRoute() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <PageSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.profile_completed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppStateProvider>
            <BrowserRouter>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route path="/" element={<RootRedirect />} />
                
                {/* Public auth routes */}
                <Route element={<PublicRoute />}>
                  <Route path="/login"            element={<LoginPage />} />
                  <Route path="/register"         element={<RegisterPage />} />
                  <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
                </Route>

                {/* Onboarding wizard */}
                <Route element={<OnboardingRoute />}>
                  <Route path="/onboarding"       element={<OnboardingPage />} />
                </Route>
 
                {/* Protected dashboard routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<DashboardLayout />}>
                    {/* Overview */}
                    <Route path="/dashboard"                element={<DashboardPage />} />

                    {/* Career Intelligence */}
                    <Route path="/career"                   element={<Navigate to="/career/prediction" replace />} />
                    <Route path="/career/prediction"        element={<CareerPredictionPage />} />
                    <Route path="/career/explorer"          element={<CareerExplorerPage />} />
                    <Route path="/career/compare"           element={<CareerComparisonPage />} />
                    <Route path="/career-comparison"        element={<Navigate to="/career/compare" replace />} />
                    <Route path="/career/:careerId"         element={<CareerExplorerPage />} />

                    {/* Skill Intelligence */}
                    <Route path="/skills"                   element={<SkillOverviewPage />} />
                    <Route path="/skills/assessment"        element={<SkillAssessmentPage />} />
                    <Route path="/skills/gap"               element={<SkillGapPage />} />
                    <Route path="/skill-gap"                element={<Navigate to="/skills/gap" replace />} />

                    {/* Learning Hub */}
                    <Route path="/learning"                 element={<LearningHubPage />} />
                    <Route path="/learning/courses"         element={<LearningHubPage />} />
                    <Route path="/learning/paths"           element={<LearningPathsPage />} />
                    <Route path="/learning/projects"        element={<LearningHubPage />} />
                    <Route path="/learning/experience"      element={<ExperienceLabPage />} />

                    {/* Roadmap & Progress */}
                    <Route path="/roadmap"                  element={<RoadmapPage />} />
                    <Route path="/progress"                 element={<LearningProgressPage />} />

                    {/* Portfolio */}
                    <Route path="/portfolio"                element={<PortfolioDashboardPage />} />
                    <Route path="/portfolio/projects"       element={<PortfolioDashboardPage />} />
                    <Route path="/portfolio/certificates"   element={<PortfolioDashboardPage />} />
                    <Route path="/portfolio/achievements"   element={<PortfolioDashboardPage />} />
                    <Route path="/projects"                 element={<Navigate to="/portfolio/projects" replace />} />
                    <Route path="/certifications"           element={<Navigate to="/portfolio/certificates" replace />} />
                    <Route path="/achievements"             element={<Navigate to="/portfolio/achievements" replace />} />

                    {/* Account */}
                    <Route path="/predictions/history"      element={<PredictionHistoryPage />} />
                    <Route path="/profile"                  element={<ProfilePage />} />
                    <Route path="/settings"                 element={<SettingsPage />} />

                    {/* Preserved tools */}
                    <Route path="/resume"                   element={<ResumeAnalyzerPage />} />
                    <Route path="/placement"                element={<PlacementPage />} />
                    <Route path="/mentor"                   element={<MentorPage />} />
                    <Route path="/reports"                  element={<ReportsPage />} />
                    <Route path="/admin"                    element={<AdminPage />} />
                    <Route path="/favorites"                element={<FavoritesPage />} />
                    <Route path="/analytics"                element={<AnalyticsPage />} />
                  </Route>
                </Route>
 
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
            <ToastContainer />
          </BrowserRouter>
        </AppStateProvider>
      </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
