import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Header from './components/Header.jsx';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import LessonBrowser from './pages/LessonBrowser.jsx';
import QuizPage from './pages/QuizPage.jsx';
import ProgressPage from './pages/ProgressPage.jsx';
import PracticeMode from './pages/PracticeMode.jsx';
import PracticeSession from './pages/PracticeSession.jsx';

import { seedLessons } from "@/lib/seedLessons";
seedLessons();

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/lessons" element={
                <ProtectedRoute>
                  <LessonBrowser />
                </ProtectedRoute>
              } />

              <Route path="/quiz/:quizId" element={
                <ProtectedRoute>
                  <QuizPage />
                </ProtectedRoute>
              } />

              <Route path="/progress" element={
                <ProtectedRoute>
                  <ProgressPage />
                </ProtectedRoute>
              } />

              <Route path="/practice" element={
                <ProtectedRoute>
                  <PracticeMode />
                </ProtectedRoute>
              } />

              <Route path="/practice/:conceptName" element={
                <ProtectedRoute>
                  <PracticeSession />
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                  <h1 className="text-4xl font-bold mb-4">404</h1>
                  <p className="text-xl text-muted-foreground mb-8">Page not found</p>
                  <a href="/" className="text-primary hover:underline">Return to Home</a>
                </div>
              } />
            </Routes>
          </main>
        </div>
        <Toaster position="top-center" />
      </AuthProvider>
    </Router>
  );
}

export default App;