
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  ArrowRight,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import './Auth.css';

function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">
            <GraduationCap size={28} />
          </div>
          <span>EduManager</span>
        </div>

        <header className="auth-header">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>

        {children}
      </section>
    </main>
  );
}

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Bem-vindo de volta!"
      subtitle="Entre na sua conta para acessar o EduManager."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <p className="auth-error">{error}</p>}

        <div className="auth-field">
          <label htmlFor="email">E-mail</label>
          <div className="auth-input-wrapper">
            <Mail size={18} />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="password">Senha</label>
          <div className="auth-input-wrapper">
            <Lock size={18} />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </div>
        </div>

        <div className="auth-extra">
          <Link to="/recuperar-senha">Esqueceu sua senha?</Link>
        </div>

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
          <ArrowRight size={18} />
        </button>

        <p className="auth-footer">
          Ainda não tem uma conta? <Link to="/cadastro">Criar conta</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, name.trim());
      setSuccess(
        'Cadastro realizado! Verifique seu e-mail para confirmar sua conta.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle="Cadastre-se para começar a utilizar o EduManager."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <p className="auth-error">{error}</p>}
        {success && <p className="auth-success">{success}</p>}

        <div className="auth-field">
          <label htmlFor="name">Nome completo</label>
          <div className="auth-input-wrapper">
            <User size={18} />
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="register-email">E-mail</label>
          <div className="auth-input-wrapper">
            <Mail size={18} />
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="register-password">Senha</label>
          <div className="auth-input-wrapper">
            <Lock size={18} />
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              minLength={6}
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="confirm-password">Confirmar senha</label>
          <div className="auth-input-wrapper">
            <Lock size={18} />
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite a senha novamente"
              minLength={6}
              required
            />
          </div>
        </div>

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? 'Criando conta...' : 'Criar conta'}
          <ArrowRight size={18} />
        </button>

        <p className="auth-footer">
          Já possui uma conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess('Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar o e-mail.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Informe seu e-mail para receber as instruções."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <p className="auth-error">{error}</p>}
        {success && <p className="auth-success">{success}</p>}

        <div className="auth-field">
          <label htmlFor="recovery-email">E-mail</label>
          <div className="auth-input-wrapper">
            <Mail size={18} />
            <input
              id="recovery-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
        </div>

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar instruções'}
          <ArrowRight size={18} />
        </button>

        <p className="auth-footer">
          <Link to="/login">Voltar para o login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export function ResetPasswordPage() {
  const { supabaseUpdatePassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      await supabaseUpdatePassword(password);
      setSuccess('Senha atualizada com sucesso!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar a senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Nova senha"
      subtitle="Escolha uma nova senha para sua conta."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <p className="auth-error">{error}</p>}
        {success && <p className="auth-success">{success}</p>}

        <div className="auth-field">
          <label htmlFor="new-password">Nova senha</label>
          <div className="auth-input-wrapper">
            <Lock size={18} />
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              minLength={6}
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="confirm-new-password">Confirmar nova senha</label>
          <div className="auth-input-wrapper">
            <Lock size={18} />
            <input
              id="confirm-new-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite a senha novamente"
              minLength={6}
              required
            />
          </div>
        </div>

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? 'Atualizando...' : 'Atualizar senha'}
          <ArrowRight size={18} />
        </button>
      </form>
    </AuthLayout>
  );
}
