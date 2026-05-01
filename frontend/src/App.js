import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ElectionsPage from './pages/ElectionsPage';
import ElectionDetailPage from './pages/ElectionDetailPage';
import ResultsPage from './pages/ResultsPage';
import PartiesPage from './pages/PartiesPage';
import CandidatesPage from './pages/CandidatesPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminParties from './pages/admin/AdminParties';
import AdminElections from './pages/admin/AdminElections';
import AdminCandidates from './pages/admin/AdminCandidates';
import AdminTally from './pages/admin/AdminTally';
import AdminVoters from './pages/admin/AdminVoters';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminVoteSystem from './pages/admin/AdminVoteSystem';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Voter protected */}
          <Route element={<PrivateRoute />}>
            <Route path="/elections" element={<ElectionsPage />} />
            <Route path="/parties" element={<PartiesPage />} />
            <Route path="/candidates" element={<CandidatesPage />} />
            <Route path="/elections/:id" element={<ElectionDetailPage />} />
            <Route path="/results/:id" element={<ResultsPage />} />
          </Route>

          {/* Admin protected */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/parties" element={<AdminParties />} />
            <Route path="/admin/elections" element={<AdminElections />} />
            <Route path="/admin/candidates" element={<AdminCandidates />} />
            <Route path="/admin/tally" element={<AdminTally />} />
            <Route path="/admin/voters" element={<AdminVoters />} />
            <Route path="/admin/logs" element={<AdminAuditLogs />} />
            <Route path="/admin/system" element={<AdminVoteSystem />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}

export default App;
