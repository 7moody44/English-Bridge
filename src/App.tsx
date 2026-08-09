import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthContextProvider } from '@/context/AuthContext';
import { ThemeContextProvider } from '@/context/ThemeContext';
import { ErrorBoundary } from '@/components/Shared/ErrorBoundary';
import { LoadingSpinner } from '@/components/Shared/LoadingSpinner';
import { LearnPage } from '@/pages/LearnPage';
import { authService } from '@/services/authService';
import { installDebugTools } from '@/utils/debugger';

// Install debug tools
installDebugTools();

// Custom Pages
const VocabPage = React.lazy(() => import('@/pages/VocabPage').then(m => ({ default: m.VocabPage })));
const GrammarPage = React.lazy(() => import('@/pages/GrammarPage').then(m => ({ default: m.GrammarPage })));
const GrammarLessonPage = React.lazy(() => import('@/pages/GrammarLessonPage').then(m => ({ default: m.GrammarLessonPage })));
const MistakesPage = React.lazy(() => import('@/pages/MistakesPage').then(m => ({ default: m.MistakesPage })));
const AssessmentPage = React.lazy(() => import('@/pages/AssessmentPage').then(m => ({ default: m.AssessmentPage })));

// Auth Pages
const LoginPage = React.lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('@/pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = React.lazy(() => import('@/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ChangePasswordPage = React.lazy(() => import('@/pages/ChangePasswordPage').then(m => ({ default: m.ChangePasswordPage })));
const ProfilePage = React.lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const CourseLessonsPage = React.lazy(() => import('@/pages/CourseLessonsPage').then(m => ({ default: m.CourseLessonsPage })));
const LessonPage = React.lazy(() => import('@/pages/LessonPage').then(m => ({ default: m.LessonPage })));
const ExamPage = React.lazy(() => import('@/pages/ExamPage').then(m => ({ default: m.ExamPage })));

// Practice Pages
const PracticePage = React.lazy(() => import('@/pages/PracticePage').then(m => ({ default: m.PracticePage })));
const ReadingAloudPage = React.lazy(() => import('@/pages/ReadingAloudPage').then(m => ({ default: m.ReadingAloudPage })));
const SpeakingPage = React.lazy(() => import('@/pages/SpeakingPage').then(m => ({ default: m.SpeakingPage })));
const SpeakingPracticePage = React.lazy(() => import('@/pages/SpeakingPracticePage').then(m => ({ default: m.SpeakingPracticePage })));
const WritingPracticePage = React.lazy(() => import('@/pages/WritingPracticePage').then(m => ({ default: m.WritingPracticePage })));
const ReadingPassagePage = React.lazy(() => import('@/pages/ReadingPassagePage').then(m => ({ default: m.ReadingPassagePage })));
const ListeningSkillsPage = React.lazy(() => import('@/pages/ListeningSkillsPage').then(m => ({ default: m.ListeningSkillsPage })));
const ListeningExercisePage = React.lazy(() => import('@/pages/ListeningExercisePage').then(m => ({ default: m.ListeningExercisePage })));
const GamesPage = React.lazy(() => import('@/pages/GamesPage').then(m => ({ default: m.GamesPage })));
const WordMatchGame = React.lazy(() => import('@/pages/games/WordMatchGame').then(m => ({ default: m.WordMatchGame })));
const HangmanGame = React.lazy(() => import('@/pages/games/HangmanGame').then(m => ({ default: m.HangmanGame })));
const WordSearchGame = React.lazy(() => import('@/pages/games/WordSearchGame').then(m => ({ default: m.WordSearchGame })));
const FillBlankGame = React.lazy(() => import('@/pages/games/FillBlankGame').then(m => ({ default: m.FillBlankGame })));
const MemoryCardsGame = React.lazy(() => import('@/pages/games/MemoryCardsGame').then(m => ({ default: m.MemoryCardsGame })));
const SentenceBuilderGame = React.lazy(() => import('@/pages/games/SentenceBuilderGame').then(m => ({ default: m.SentenceBuilderGame })));
const VocabularyRaceGame = React.lazy(() => import('@/pages/games/VocabularyRaceGame').then(m => ({ default: m.VocabularyRaceGame })));
const CrosswordGame = React.lazy(() => import('@/pages/games/CrosswordGame').then(m => ({ default: m.CrosswordGame })));
const SpeakingChallengeGame = React.lazy(() => import('@/pages/games/SpeakingChallengeGame').then(m => ({ default: m.SpeakingChallengeGame })));
const DailyChallengeGame = React.lazy(() => import('@/pages/games/DailyChallengeGame').then(m => ({ default: m.DailyChallengeGame })));
const ProgressPage = React.lazy(() => import('@/pages/ProgressPage').then(m => ({ default: m.ProgressPage })));
const DetailedReportPage = React.lazy(() => import('@/pages/DetailedReportPage').then(m => ({ default: m.DetailedReportPage })));
const AchievementsPage = React.lazy(() => import('@/pages/AchievementsPage').then(m => ({ default: m.AchievementsPage })));
const CertificatesPage = React.lazy(() => import('@/pages/CertificatesPage').then(m => ({ default: m.CertificatesPage })));
const HomePage = React.lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })));
const AITutorPage = React.lazy(() => import('@/pages/AITutorPage').then(m => ({ default: m.AITutorPage })));

const AssessmentGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [checking, setChecking] = React.useState(!sessionStorage.getItem('eb_assessment_completed'));
  const location = useLocation();

  React.useEffect(() => {
    if (sessionStorage.getItem('eb_assessment_completed') === 'true' || location.pathname === '/assessment') {
      setChecking(false);
      return;
    }
    let isMounted = true;
    import('@/services/assessmentService').then(({ assessmentService }) => {
       assessmentService.getStatus().then((res) => {
         if (res.hasCompletedAssessment) {
           sessionStorage.setItem('eb_assessment_completed', 'true');
         } else {
           sessionStorage.setItem('eb_assessment_completed', 'false');
         }
         if (isMounted) setChecking(false);
       }).catch(() => {
         if (isMounted) setChecking(false);
       });
    });
    return () => { isMounted = false; };
  }, [location.pathname]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#010410]">
        <LoadingSpinner message="Checking placement..." />
      </div>
    );
  }

  if (sessionStorage.getItem('eb_assessment_completed') === 'false' && location.pathname !== '/assessment') {
    return <Navigate to="/assessment?onboarding=1" replace />;
  }

  return <>{children}</>;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AssessmentGuard>{children}</AssessmentGuard>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading, login } = useAuth();

  // Consume a Google OAuth token if the backend redirected back with one.
  // URL looks like: /?token=XXX&provider=google
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const provider = params.get('provider');
    const oauthError = params.get('oauth_error');

    if (oauthError) {
      // Clean the URL so the error doesn't persist on refresh.
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (token && provider === 'google') {
      // Fetch full profile, then log in and strip the query params.
      authService
        .fetchProfileFromToken(token)
        .then((user) => {
          login(token, user);
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((err) => {
          console.error('Google OAuth login failed:', err);
          window.history.replaceState({}, document.title, window.location.pathname);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
        <LoadingSpinner message="Loading..." />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/home" replace /> : <RegisterPage />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to="/home" replace /> : <ForgotPasswordPage />}
      />

      {/* Protected Routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vocab"
        element={
          <ProtectedRoute>
            <VocabPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mistakes"
        element={
          <ProtectedRoute>
            <MistakesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assessment"
        element={
          <ProtectedRoute>
            <AssessmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/grammar"
        element={
          <ProtectedRoute>
            <GrammarPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/grammar/:lessonId"
        element={
          <ProtectedRoute>
            <GrammarLessonPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learn"
        element={
          <ProtectedRoute>
            <LearnPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learn/:levelId/:lessonNumber"
        element={
          <ProtectedRoute>
            <LessonPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learn/:levelId/exam"
        element={
          <ProtectedRoute>
            <ExamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learn/:levelId"
        element={
          <ProtectedRoute>
            <CourseLessonsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice"
        element={
          <ProtectedRoute>
            <PracticePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice/reading"
        element={
          <ProtectedRoute>
            <ReadingAloudPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice/reading/:passageId"
        element={
          <ProtectedRoute>
            <ReadingPassagePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice/speaking"
        element={
          <ProtectedRoute>
            <SpeakingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice/speaking/:topicId"
        element={
          <ProtectedRoute>
            <SpeakingPracticePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice/writing"
        element={
          <ProtectedRoute>
            <WritingPracticePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice/listening"
        element={
          <ProtectedRoute>
            <ListeningSkillsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice/listening/:exerciseId"
        element={
          <ProtectedRoute>
            <ListeningExercisePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games"
        element={
          <ProtectedRoute>
            <GamesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/word-match"
        element={
          <ProtectedRoute>
            <WordMatchGame />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/hangman"
        element={
          <ProtectedRoute>
            <HangmanGame />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/word-search"
        element={
          <ProtectedRoute>
            <WordSearchGame />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/fill-blank"
        element={
          <ProtectedRoute>
            <FillBlankGame />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/memory-cards"
        element={
          <ProtectedRoute>
            <MemoryCardsGame />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/sentence-builder"
        element={
          <ProtectedRoute>
            <SentenceBuilderGame />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/vocabulary-race"
        element={
          <ProtectedRoute>
            <VocabularyRaceGame />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/crossword"
        element={
          <ProtectedRoute>
            <CrosswordGame />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/speaking-challenge"
        element={
          <ProtectedRoute>
            <SpeakingChallengeGame />
          </ProtectedRoute>
        }
      />
      <Route
        path="/games/daily-challenge"
        element={
          <ProtectedRoute>
            <DailyChallengeGame />
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <ProgressPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress/detailed"
        element={
          <ProtectedRoute>
            <DetailedReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/achievements"
        element={
          <ProtectedRoute>
            <AchievementsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/certificates"
        element={
          <ProtectedRoute>
            <CertificatesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/password"
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tutor"
        element={
          <ProtectedRoute>
            <AITutorPage />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="/" element={<Navigate to={isAuthenticated ? '/home' : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeContextProvider>
        <AuthContextProvider>
          <Router>
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
                  <LoadingSpinner message="Loading..." />
                </div>
              }
            >
              <AppRoutes />
            </React.Suspense>
          </Router>
        </AuthContextProvider>
      </ThemeContextProvider>
    </ErrorBoundary>
  );
};

export default App;
