import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/ui/toast';
import LoadingSpinner from './components/ui/LoadingSpinner';
import './index.css';

// Lazy load page components for code splitting with webpack chunk names
const HomePage = lazy(() => import(/* webpackChunkName: "home" */ './pages/HomePage'));
const AuthPage = lazy(() => import(/* webpackChunkName: "auth" */ './pages/AuthPage'));
const DashboardPage = lazy(() => import(/* webpackChunkName: "dashboard" */ './pages/DashboardPage'));
const PricingPage = lazy(() => import(/* webpackChunkName: "pricing" */ './pages/PricingPage'));
const UploadPage = lazy(() => import(/* webpackChunkName: "upload" */ './pages/UploadPage'));
const CompressPage = lazy(() => import(/* webpackChunkName: "compress" */ './pages/CompressPage'));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
          <div className="min-h-screen bg-background text-foreground">
            <Header />
            
            <main className="flex-1">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/upload" element={<UploadPage />} />
                  <Route path="/compress" element={<CompressPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                </Routes>
              </Suspense>
            </main>
            
            <Footer />
          </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;