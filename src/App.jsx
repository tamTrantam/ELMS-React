import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// 🔒 THE SECURITY GUARD COMPONENT
const ProtectedRoute = ({ children }) => {
  const localToken = localStorage.getItem('userToken');
  const sessionToken = sessionStorage.getItem('userToken');

  console.log("=== ProtectedRoute Security Check ===");
  console.log("localStorage token exists?:", !!localToken);
  console.log("sessionStorage token exists?:", !!sessionToken);

  if (!localToken && !sessionToken) {
    console.warn("❌ Access Denied: No tokens found. Bouncing to login.");
    return <Navigate to="/Login" replace />;
  }

  console.log("✅ Access Granted. Loading component...");
  return children;
};
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Base URL Route: Redirects straight to /Dashboard */}
        <Route path="/" element={<Navigate to="/Dashboard" replace />} />
        
        {/* Public Route: Anyone can visit */}
        <Route path="/Login" element={<Login/>} />
        
        {/* 🔒 Protected Route: Wrapped inside our guard component */}
        <Route 
          path="/Dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback Catch-All Route. This will redirect any unmatched routes to the Login page */}
        <Route path="*" element={<Navigate to="/Login" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
}