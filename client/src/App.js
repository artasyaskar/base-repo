import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DataStructures from './pages/DataStructures';
import Algorithms from './pages/Algorithms';
import DataStructureDetail from './pages/DataStructureDetail';
import AlgorithmDetail from './pages/AlgorithmDetail';
import Compiler from './pages/Compiler';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              } />
              
              <Route path="/datastructures" element={
                <PrivateRoute>
                  <Layout>
                    <DataStructures />
                  </Layout>
                </PrivateRoute>
              } />
              
              <Route path="/datastructures/:id" element={
                <PrivateRoute>
                  <Layout>
                    <DataStructureDetail />
                  </Layout>
                </PrivateRoute>
              } />
              
              <Route path="/algorithms" element={
                <PrivateRoute>
                  <Layout>
                    <Algorithms />
                  </Layout>
                </PrivateRoute>
              } />
              
              <Route path="/algorithms/:id" element={
                <PrivateRoute>
                  <Layout>
                    <AlgorithmDetail />
                  </Layout>
                </PrivateRoute>
              } />
              
              <Route path="/compiler" element={
                <PrivateRoute>
                  <Layout>
                    <Compiler />
                  </Layout>
                </PrivateRoute>
              } />
              
              <Route path="/profile" element={
                <PrivateRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </PrivateRoute>
              } />
              
              <Route path="/leaderboard" element={
                <PrivateRoute>
                  <Layout>
                    <Leaderboard />
                  </Layout>
                </PrivateRoute>
              } />
              
              {/* 404 route */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
            
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
