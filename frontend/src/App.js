import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Invoices from './pages/Invoices';
import Insurance from './pages/Insurance';
import InsuranceInvoicePrint from './components/InsuranceInvoicePrint';
import Pharmacy from './pages/Pharmacy';
import Accounting from './pages/Accounting';
import Configuration from './pages/Configuration';
import Test from './pages/Test';
import Layout from './components/Layout';
import './App.css';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role_name)) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />

      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Home />} />
        <Route path="dashboard" element={
          <PrivateRoute roles={['ADMIN', 'SUPERVISOR']}>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="patients" element={<Patients />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="invoices" element={
          <PrivateRoute roles={['ADMIN', 'SUPERVISOR', 'CAISSE']}>
            <Invoices />
          </PrivateRoute>
        } />
        <Route path="insurance" element={
          <PrivateRoute roles={['ADMIN', 'SUPERVISOR', 'ASSURANCE']}>
            <Insurance />
          </PrivateRoute>
        } />
        <Route path="pharmacy" element={
          <PrivateRoute roles={['ADMIN', 'SUPERVISOR', 'PHARMACIE']}>
            <Pharmacy />
          </PrivateRoute>
        } />
        <Route path="accounting" element={
          <PrivateRoute roles={['ADMIN', 'SUPERVISOR']}>
            <Accounting />
          </PrivateRoute>
        } />
        <Route path="configuration" element={
          <PrivateRoute roles={['ADMIN']}>
            <Configuration />
          </PrivateRoute>
        } />
        <Route path="test" element={<Test />} />
      </Route>

      <Route path="/insurance-invoice-print/:id" element={
        <PrivateRoute roles={['ADMIN', 'SUPERVISOR', 'ASSURANCE']}>
          <InsuranceInvoicePrint />
        </PrivateRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
