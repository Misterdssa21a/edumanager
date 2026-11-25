
import { useEffect, useState } from 'react';
import {
  Bell,
  Search,
  UserCircle,
  LogOut,
  X,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/alunos': 'Alunos',
  '/disciplinas': 'Disciplinas',
  '/atividades': 'Atividades',
  '/desempenho': 'Desempenho acadêmico',
  '/sobre': 'Sobre o sistema',
};

const pages = [
  { name: 'Dashboard', path: '/' },
  { name: 'Alunos', path: '/alunos' },
  { name: 'Disciplinas', path: '/disciplinas' },
  { name: 'Atividades', path: '/atividades' },
  { name: 'Desempenho acadêmico', path: '/desempenho' },
  { name: 'Sobre o sistema', path: '/sobre' },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const title = pageTitles[location.pathname] || 'EduManager';

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email || '');
    }

    loadUser();
  }, []);

  const filteredPages = pages.filter((page) =>
    page.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function openPage(path: string) {
    navigate(path);
    setSearchOpen(false);
    setSearchTerm('');
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert('Não foi possível encerrar a sessão: ' + error.message);
      return;
    }

    navigate('/login', { replace: true });
  }

  return (
    <header className="topbar">
      <div>
        <span className="breadcrumb">
          EduManager / Visão geral
        </span>
        <h1>{title}</h1>
      </div>

      <div className="topbar-actions" style={{ position: 'relative' }}>
        <button
          className="icon-button"
          aria-label="Pesquisar"
          title="Pesquisar páginas"
          onClick={() => {
            setSearchOpen(!searchOpen);
            setNotificationsOpen(false);
            setProfileOpen(false);
          }}
        >
          <Search size={20} />
        </button>

        <button
          className="icon-button"
          aria-label="Notificações"
          title="Notificações"
          onClick={() => {
            setNotificationsOpen(!notificationsOpen);
            setSearchOpen(false);
            setProfileOpen(false);
          }}
        >
          <Bell size={20} />
        </button>

        <button
          className="icon-button"
          aria-label="Perfil"
          title="Perfil"
          onClick={() => {
            setProfileOpen(!profileOpen);
            setSearchOpen(false);
            setNotificationsOpen(false);
          }}
        >
          <UserCircle size={22} />
        </button>

        {searchOpen && (
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <strong>Pesquisar no sistema</strong>
              <button
                onClick={() => setSearchOpen(false)}
                style={closeButtonStyle}
                aria-label="Fechar pesquisa"
              >
                <X size={18} />
              </button>
            </div>

            <input
              autoFocus
              type="search"
              placeholder="Digite o nome de uma página..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              style={inputStyle}
            />

            <div style={{ marginTop: 12 }}>
              {filteredPages.length > 0 ? (
                filteredPages.map((page) => (
                  <button
                    key={page.path}
                    onClick={() => openPage(page.path)}
                    style={resultButtonStyle}
                  >
                    {page.name}
                  </button>
                ))
              ) : (
                <p style={messageStyle}>
                  Nenhuma página encontrada.
                </p>
              )}
            </div>
          </div>
        )}

        {notificationsOpen && (
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <strong>Notificações</strong>
              <button
                onClick={() => setNotificationsOpen(false)}
                style={closeButtonStyle}
                aria-label="Fechar notificações"
              >
                <X size={18} />
              </button>
            </div>

            <p style={messageStyle}>
              <Bell size={18} />
              Você está na central de notificações do EduManager.
            </p>
            <p style={messageStyle}>
              Não há novas notificações no momento.
            </p>
          </div>
        )}

        {profileOpen && (
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <strong>Minha conta</strong>
              <button
                onClick={() => setProfileOpen(false)}
                style={closeButtonStyle}
                aria-label="Fechar perfil"
              >
                <X size={18} />
              </button>
            </div>

            <p style={messageStyle}>
              {userEmail || 'Usuário conectado'}
            </p>

            <button
              onClick={handleLogout}
              style={logoutButtonStyle}
            >
              <LogOut size={17} />
              Encerrar sessão
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

const panelStyle = {
  position: 'absolute' as const,
  top: 'calc(100% + 12px)',
  right: 0,
  width: '290px',
  maxWidth: '85vw',
  padding: '16px',
  background: 'var(--card-bg, #ffffff)',
  color: 'var(--text-color, #1f2937)',
  border: '1px solid var(--border-color, #e5e7eb)',
  borderRadius: '12px',
  boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
  zIndex: 1000,
};

const panelHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
};

const closeButtonStyle = {
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  padding: '4px',
  color: 'inherit',
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box' as const,
  padding: '10px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  outline: 'none',
};

const resultButtonStyle = {
  display: 'block',
  width: '100%',
  padding: '10px',
  textAlign: 'left' as const,
  border: 'none',
  borderRadius: '6px',
  background: 'transparent',
  cursor: 'pointer',
  color: 'inherit',
};

const messageStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  lineHeight: 1.5,
};

const logoutButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  width: '100%',
  padding: '10px',
  marginTop: '12px',
  border: 'none',
  borderRadius: '8px',
  background: '#dc2626',
  color: '#ffffff',
  cursor: 'pointer',
};
