import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import InterviewsPage from './pages/InterviewsPage';
import InterviewRunnerPage from './pages/InterviewRunnerPage';
import InterviewReviewPage from './pages/InterviewReviewPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/interviews" element={<InterviewsPage />} />
          <Route path="/run/:id" element={<InterviewRunnerPage />} />
          <Route path="/review/:id" element={<InterviewReviewPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;