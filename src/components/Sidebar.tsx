
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  ChartNoAxesCombined,
  Info,
  GraduationCap,
} from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/alunos', label: 'Alunos', icon: Users },
  { to: '/disciplinas', label: 'Disciplinas', icon: BookOpen },
  { to: '/atividades', label: 'Atividades', icon: ClipboardList },
  { to: '/desempenho', label: 'Desempenho', icon: ChartNoAxesCombined },
  { to: '/sobre', label: 'Sobre', icon: Info },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <GraduationCap size={25} />
        </div>
        <div>
          <h2>EduManager</h2>
          <span>GESTÃO ACADÊMICA</span>
        </div>
      </div>

      <div className="sidebar-section">MENU PRINCIPAL</div>

      <nav className="sidebar-nav">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-avatar">VL</div>
        <div>
          <strong>Administrador</strong>
          <span>Gestão do sistema</span>
        </div>
      </div>
    </aside>
  );
}
