
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';

import {
  Dashboard,
  Students,
  Subjects,
  Activities,
  Performance,
  About,
} from './pages/Pages';

import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from './pages/AuthPages';

import './App.css';

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="auth-loading">Carregando EduManager...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="auth-loading">Carregando EduManager...</div>;
  }

  return user ? <Navigate to="/" replace /> : <Outlet />;
}

function App() {
  return (
    <Routes>
      {/* Páginas públicas */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route
          path="/recuperar-senha"
          element={<ForgotPasswordPage />}
        />
      </Route>

      <Route
        path="/redefinir-senha"
        element={<ResetPasswordPage />}
      />

      {/* Páginas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/alunos" element={<Students />} />
          <Route path="/disciplinas" element={<Subjects />} />
          <Route path="/atividades" element={<Activities />} />
          <Route path="/desempenho" element={<Performance />} />
          <Route path="/sobre" element={<About />} />
        </Route>
      </Route>

      {/* Rota não encontrada */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
