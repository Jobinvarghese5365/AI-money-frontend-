// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./store/authStore";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Debt from "./pages/Debt";
import Savings from "./pages/Savings";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  const { token, fetchMe } = useAuth();
  
  useEffect(() => { 
    if (token) {
      console.log('Token found, fetching user data...');
      fetchMe();
    } else {
      console.log('No token found');
    }
  }, [token, fetchMe]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
        
        {/* If user is logged in, redirect to dashboard */}
        <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/signup" element={token ? <Navigate to="/dashboard" replace /> : <Signup />} />
        
        {/* Protected routes - require authentication */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        
        <Route path="/expenses" element={
          <ProtectedRoute><Expenses /></ProtectedRoute>
        } />
        
        <Route path="/debt" element={
          <ProtectedRoute><Debt /></ProtectedRoute>
        } />
        
        <Route path="/savings" element={
          <ProtectedRoute><Savings /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}