
import { useEffect, useState, type FormEvent } from 'react';
import {
  Users,
  BookOpen,
  ClipboardList,
  ChartNoAxesCombined,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  CalendarDays,
  CheckCircle2,
  Clock,
} from 'lucide-react';

import StatCard from '../components/StatCard';
import PerformanceChart from '../components/PerformanceChart';
import RecentActivities from '../components/RecentActivities';
import { supabase } from '../services/supabase';
import './Students.css';

interface Student {
  id: string;
  name: string;
  email: string;
  registration: string;
  course: string;
  status: string;
  phone?: string | null;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  workload: number;
  description?: string | null;
}

interface Activity {
  id: string;
  title: string;
  status: string;
  description?: string | null;
  subject_id?: string | null;
  due_date?: string | null;
}

interface Grade {
  id: string;
  student_id: string;
  subject_id: string;
  grade: number;
  evaluation: string;
  created_at: string;
}

const emptyStudentForm = {
  name: '',
  email: '',
  registration: '',
  course: '',
  status: 'Ativo',
  phone: '',
};

const emptySubjectForm = {
  name: '',
  code: '',
  workload: '60',
  description: '',
};

const emptyActivityForm = {
  title: '',
  status: 'Pendente',
  description: '',
  subject_id: '',
  due_date: '',
};

const activityStatuses = [
  'Pendente',
  'Em andamento',
  'Concluída',
];

/* =========================================
   DASHBOARD
========================================= */

export function Dashboard() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [totalActivities, setTotalActivities] = useState(0);
  const [average, setAverage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError('');

      const [
        studentsResult,
        subjectsResult,
        activitiesResult,
        gradesResult,
      ] = await Promise.all([
        supabase
          .from('students')
          .select('id', { count: 'exact', head: true }),

        supabase
          .from('subjects')
          .select('id', { count: 'exact', head: true }),

        supabase
          .from('activities')
          .select('id', { count: 'exact', head: true }),

        supabase
          .from('grades')
          .select('grade'),
      ]);

      const errors = [
        studentsResult.error,
        subjectsResult.error,
        activitiesResult.error,
        gradesResult.error,
      ].filter(Boolean);

      if (errors.length > 0) {
        setError(
          'Não foi possível carregar todos os indicadores. Verifique a conexão com o banco de dados.',
        );
      }

      setTotalStudents(studentsResult.count ?? 0);
      setTotalSubjects(subjectsResult.count ?? 0);
      setTotalActivities(activitiesResult.count ?? 0);

      const grades = gradesResult.data ?? [];

      if (!gradesResult.error && grades.length > 0) {
        const sum = grades.reduce(
          (total, item) => total + Number(item.grade),
          0,
        );

        setAverage(sum / grades.length);
      } else {
        setAverage(null);
      }

      setLoading(false);
    }

    loadDashboard();
  }, []);

  function formatAverage(value: number | null) {
    if (value === null) return '—';

    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <div>
          <span className="section-tag">VISÃO GERAL</span>
          <h2>Bem-vindo ao EduManager!</h2>
          <p>
            Acompanhe e gerencie as informações acadêmicas
            em um só lugar.
          </p>
        </div>

        <div className="welcome-decoration">
          <BookOpen size={55} />
        </div>
      </div>

      <div className="dashboard-section-title">
        <div>
          <h2>Resumo acadêmico</h2>
          <p>Indicadores atualizados diretamente do banco de dados.</p>
        </div>
      </div>

      {error && (
        <div className="student-message student-error">
          {error}
        </div>
      )}

      <div className="stats-grid">
        <StatCard
          title="Total de alunos"
          value={loading ? '...' : String(totalStudents)}
          description="Alunos cadastrados"
          icon={Users}
          color="#4773df"
        />

        <StatCard
          title="Disciplinas"
          value={loading ? '...' : String(totalSubjects)}
          description="Disciplinas cadastradas"
          icon={BookOpen}
          color="#16a078"
        />

        <StatCard
          title="Atividades"
          value={loading ? '...' : String(totalActivities)}
          description="Atividades registradas"
          icon={ClipboardList}
          color="#d18a32"
        />

        <StatCard
          title="Média acadêmica"
          value={loading ? '...' : formatAverage(average)}
          description="Média das notas registradas"
          icon={ChartNoAxesCombined}
          color="#8b65d6"
        />
      </div>

      <div className="dashboard-bottom-grid">
        <PerformanceChart />
        <RecentActivities />
      </div>
    </div>
  );
}

/* =========================================
   GESTÃO DE ALUNOS
========================================= */

export function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyStudentForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadStudents() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('students')
      .select('id, name, email, registration, course, status, phone')
      .order('name', { ascending: true });

    if (error) {
      setError('Não foi possível carregar os alunos: ' + error.message);
      setStudents([]);
    } else {
      setStudents((data ?? []) as Student[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function updateStudentField(
    field: keyof typeof emptyStudentForm,
    value: string,
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openNewForm() {
    setEditingId(null);
    setForm(emptyStudentForm);
    setError('');
    setSuccess('');
    setShowForm(true);
  }

  function openEditForm(student: Student) {
    setEditingId(student.id);

    setForm({
      name: student.name ?? '',
      email: student.email ?? '',
      registration: student.registration ?? '',
      course: student.course ?? '',
      status: student.status ?? 'Ativo',
      phone: student.phone ?? '',
    });

    setError('');
    setSuccess('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyStudentForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.registration.trim() ||
      !form.course.trim()
    ) {
      setError('Preencha nome, e-mail, matrícula e curso.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const studentData = {
      name: form.name.trim(),
      email: form.email.trim(),
      registration: form.registration.trim(),
      course: form.course.trim(),
      status: form.status,
      phone: form.phone.trim() || null,
    };

    const result = editingId
      ? await supabase.from('students').update(studentData).eq('id', editingId)
      : await supabase.from('students').insert(studentData);

    if (result.error) {
      setError(
        `${editingId ? 'Erro ao atualizar' : 'Erro ao cadastrar'} aluno: ${result.error.message}`,
      );
      setSaving(false);
      return;
    }

    const wasEditing = Boolean(editingId);

    await loadStudents();
    closeForm();

    setSuccess(
      wasEditing
        ? 'Aluno atualizado com sucesso!'
        : 'Aluno cadastrado com sucesso!',
    );

    setSaving(false);
  }

  async function handleDelete(student: Student) {
    const confirmed = window.confirm(
      `Deseja realmente excluir o aluno ${student.name}?`,
    );

    if (!confirmed) return;

    setError('');
    setSuccess('');

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', student.id);

    if (error) {
      setError('Erro ao excluir aluno: ' + error.message);
      return;
    }

    setStudents((current) =>
      current.filter((item) => item.id !== student.id),
    );

    setSuccess('Aluno excluído com sucesso!');
  }

  const filteredStudents = students.filter((student) => {
    const term = search.toLowerCase();

    return (
      student.name.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term) ||
      student.registration.toLowerCase().includes(term) ||
      student.course.toLowerCase().includes(term) ||
      student.status.toLowerCase().includes(term)
    );
  });

  return (
    <div className="students-page">
      <div className="students-heading">
        <div>
          <span className="section-tag">EDUMANAGER</span>
          <h2>Gestão de Alunos</h2>
          <p>Cadastre, consulte e gerencie os alunos.</p>
        </div>

        <button className="student-primary-button" onClick={openNewForm}>
          <Plus size={18} />
          Adicionar aluno
        </button>
      </div>

      <div className="students-summary">
        <div className="students-summary-icon">
          <Users size={24} />
        </div>
        <div>
          <span>Total de alunos cadastrados</span>
          <strong>{students.length}</strong>
        </div>
      </div>

      {success && (
        <div className="student-message student-success">{success}</div>
      )}

      {error && (
        <div className="student-message student-error">{error}</div>
      )}

      <div className="students-toolbar">
        <div className="student-search">
          <Search size={19} />
          <input
            type="search"
            placeholder="Pesquisar por nome, matrícula, curso ou e-mail..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="students-table-card">
        <div className="students-table-heading">
          <div>
            <h3>Alunos cadastrados</h3>
            <p>Registros armazenados no banco de dados.</p>
          </div>
          <span className="students-count">
            {filteredStudents.length} registro(s)
          </span>
        </div>

        {loading ? (
          <div className="students-empty">Carregando alunos...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="students-empty">
            <Users size={38} />
            <h3>Nenhum aluno encontrado</h3>
            <p>
              {search
                ? 'Tente pesquisar com outro termo.'
                : 'Comece adicionando o primeiro aluno ao sistema.'}
            </p>
            {!search && (
              <button className="student-primary-button" onClick={openNewForm}>
                <Plus size={18} />
                Cadastrar primeiro aluno
              </button>
            )}
          </div>
        ) : (
          <div className="students-table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Matrícula</th>
                  <th>Curso</th>
                  <th>E-mail</th>
                  <th>Status</th>
                  <th className="student-actions-column">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-name-cell">
                        <div className="student-avatar">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <strong>{student.name}</strong>
                      </div>
                    </td>
                    <td>{student.registration}</td>
                    <td>{student.course}</td>
                    <td>{student.email}</td>
                    <td>{student.status}</td>
                    <td>
                      <div className="student-actions">
                        <button
                          className="student-icon-button"
                          title="Editar aluno"
                          onClick={() => openEditForm(student)}
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          className="student-icon-button student-delete-button"
                          title="Excluir aluno"
                          onClick={() => handleDelete(student)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="student-modal-overlay">
          <div className="student-modal">
            <div className="student-modal-heading">
              <div>
                <span className="section-tag">CADASTRO ACADÊMICO</span>
                <h3>{editingId ? 'Editar aluno' : 'Novo aluno'}</h3>
                <p>Preencha os dados do aluno abaixo.</p>
              </div>
              <button
                className="student-close-button"
                onClick={closeForm}
                type="button"
                aria-label="Fechar formulário"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="student-name">Nome completo</label>
              <input
                id="student-name"
                type="text"
                placeholder="Digite o nome do aluno"
                value={form.name}
                onChange={(event) => updateStudentField('name', event.target.value)}
                required
              />

              <label htmlFor="student-registration">Matrícula</label>
              <input
                id="student-registration"
                type="text"
                placeholder="Digite a matrícula"
                value={form.registration}
                onChange={(event) => updateStudentField('registration', event.target.value)}
                required
              />

              <label htmlFor="student-email">E-mail</label>
              <input
                id="student-email"
                type="email"
                placeholder="aluno@email.com"
                value={form.email}
                onChange={(event) => updateStudentField('email', event.target.value)}
                required
              />

              <label htmlFor="student-course">Curso</label>
              <input
                id="student-course"
                type="text"
                placeholder="Digite o curso"
                value={form.course}
                onChange={(event) => updateStudentField('course', event.target.value)}
                required
              />

              <label htmlFor="student-status">Status</label>
              <select
                id="student-status"
                value={form.status}
                onChange={(event) => updateStudentField('status', event.target.value)}
                required
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>

              <label htmlFor="student-phone">Telefone (opcional)</label>
              <input
                id="student-phone"
                type="tel"
                placeholder="(00) 00000-0000"
                value={form.phone}
                onChange={(event) => updateStudentField('phone', event.target.value)}
              />

              {error && (
                <div className="student-message student-error">{error}</div>
              )}

              <div className="student-modal-actions">
                <button
                  type="button"
                  className="student-cancel-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="student-primary-button"
                  disabled={saving}
                >
                  <Save size={17} />
                  {saving
                    ? 'Salvando...'
                    : editingId
                      ? 'Salvar alterações'
                      : 'Cadastrar aluno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================
   GESTÃO DE DISCIPLINAS
========================================= */

export function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptySubjectForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadSubjects() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('subjects')
      .select('id, name, code, workload, description')
      .order('name', { ascending: true });

    if (error) {
      setError('Não foi possível carregar as disciplinas: ' + error.message);
      setSubjects([]);
    } else {
      setSubjects((data ?? []) as Subject[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadSubjects();
  }, []);

  function updateSubjectField(
    field: keyof typeof emptySubjectForm,
    value: string,
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openNewForm() {
    setEditingId(null);
    setForm(emptySubjectForm);
    setError('');
    setSuccess('');
    setShowForm(true);
  }

  function openEditForm(subject: Subject) {
    setEditingId(subject.id);
    setForm({
      name: subject.name ?? '',
      code: subject.code ?? '',
      workload: String(subject.workload ?? 60),
      description: subject.description ?? '',
    });
    setError('');
    setSuccess('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptySubjectForm);
  }

  async function handleSubjectSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const workloadNumber = Number(form.workload);

    if (
      !form.name.trim() ||
      !form.code.trim() ||
      !Number.isInteger(workloadNumber) ||
      workloadNumber <= 0
    ) {
      setError('Preencha nome, código e uma carga horária inteira válida.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const subjectData = {
      name: form.name.trim(),
      code: form.code.trim(),
      workload: workloadNumber,
      description: form.description.trim() || null,
    };

    const result = editingId
      ? await supabase.from('subjects').update(subjectData).eq('id', editingId)
      : await supabase.from('subjects').insert(subjectData);

    if (result.error) {
      setError(
        `${editingId ? 'Erro ao atualizar' : 'Erro ao cadastrar'} disciplina: ${result.error.message}`,
      );
      setSaving(false);
      return;
    }

    const wasEditing = Boolean(editingId);
    await loadSubjects();
    closeForm();

    setSuccess(
      wasEditing
        ? 'Disciplina atualizada com sucesso!'
        : 'Disciplina cadastrada com sucesso!',
    );

    setSaving(false);
  }

  async function handleSubjectDelete(subject: Subject) {
    const confirmed = window.confirm(
      `Deseja realmente excluir a disciplina ${subject.name}?`,
    );

    if (!confirmed) return;

    setError('');
    setSuccess('');

    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', subject.id);

    if (error) {
      setError('Erro ao excluir disciplina: ' + error.message);
      return;
    }

    setSubjects((current) =>
      current.filter((item) => item.id !== subject.id),
    );
    setSuccess('Disciplina excluída com sucesso!');
  }

  const filteredSubjects = subjects.filter((subject) => {
    const term = search.toLowerCase();

    return (
      subject.name.toLowerCase().includes(term) ||
      subject.code.toLowerCase().includes(term) ||
      String(subject.workload).includes(term) ||
      (subject.description ?? '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="students-page">
      <div className="students-heading">
        <div>
          <span className="section-tag">EDUMANAGER</span>
          <h2>Gestão de Disciplinas</h2>
          <p>Cadastre, consulte e organize as disciplinas acadêmicas.</p>
        </div>
        <button className="student-primary-button" onClick={openNewForm}>
          <Plus size={18} />
          Adicionar disciplina
        </button>
      </div>

      <div className="students-summary">
        <div className="students-summary-icon">
          <BookOpen size={24} />
        </div>
        <div>
          <span>Total de disciplinas cadastradas</span>
          <strong>{subjects.length}</strong>
        </div>
      </div>

      {success && (
        <div className="student-message student-success">{success}</div>
      )}
      {error && (
        <div className="student-message student-error">{error}</div>
      )}

      <div className="students-toolbar">
        <div className="student-search">
          <Search size={19} />
          <input
            type="search"
            placeholder="Pesquisar por nome, código ou carga horária..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="students-table-card">
        <div className="students-table-heading">
          <div>
            <h3>Disciplinas cadastradas</h3>
            <p>Registros armazenados no banco de dados.</p>
          </div>
          <span className="students-count">
            {filteredSubjects.length} registro(s)
          </span>
        </div>

        {loading ? (
          <div className="students-empty">Carregando disciplinas...</div>
        ) : filteredSubjects.length === 0 ? (
          <div className="students-empty">
            <BookOpen size={38} />
            <h3>Nenhuma disciplina encontrada</h3>
            <p>
              {search
                ? 'Tente pesquisar com outro termo.'
                : 'Comece adicionando a primeira disciplina.'}
            </p>
            {!search && (
              <button className="student-primary-button" onClick={openNewForm}>
                <Plus size={18} />
                Cadastrar primeira disciplina
              </button>
            )}
          </div>
        ) : (
          <div className="students-table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Disciplina</th>
                  <th>Código</th>
                  <th>Carga horária</th>
                  <th>Descrição</th>
                  <th className="student-actions-column">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map((subject) => (
                  <tr key={subject.id}>
                    <td>
                      <div className="student-name-cell">
                        <div className="student-avatar">
                          <BookOpen size={17} />
                        </div>
                        <strong>{subject.name}</strong>
                      </div>
                    </td>
                    <td>{subject.code}</td>
                    <td>{subject.workload} horas</td>
                    <td>{subject.description || '—'}</td>
                    <td>
                      <div className="student-actions">
                        <button
                          className="student-icon-button"
                          title="Editar disciplina"
                          onClick={() => openEditForm(subject)}
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          className="student-icon-button student-delete-button"
                          title="Excluir disciplina"
                          onClick={() => handleSubjectDelete(subject)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="student-modal-overlay">
          <div className="student-modal">
            <div className="student-modal-heading">
              <div>
                <span className="section-tag">CADASTRO ACADÊMICO</span>
                <h3>{editingId ? 'Editar disciplina' : 'Nova disciplina'}</h3>
                <p>Preencha os dados da disciplina abaixo.</p>
              </div>
              <button
                className="student-close-button"
                onClick={closeForm}
                type="button"
                aria-label="Fechar formulário"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubjectSubmit}>
              <label htmlFor="subject-name">Nome da disciplina</label>
              <input
                id="subject-name"
                type="text"
                placeholder="Ex.: Desenvolvimento Web"
                value={form.name}
                onChange={(event) => updateSubjectField('name', event.target.value)}
                required
              />

              <label htmlFor="subject-code">Código</label>
              <input
                id="subject-code"
                type="text"
                placeholder="Ex.: DEV001"
                value={form.code}
                onChange={(event) => updateSubjectField('code', event.target.value)}
                required
              />

              <label htmlFor="subject-workload">Carga horária (horas)</label>
              <input
                id="subject-workload"
                type="number"
                min="1"
                step="1"
                value={form.workload}
                onChange={(event) => updateSubjectField('workload', event.target.value)}
                required
              />

              <label htmlFor="subject-description">Descrição (opcional)</label>
              <textarea
                id="subject-description"
                placeholder="Descreva brevemente a disciplina..."
                value={form.description}
                onChange={(event) => updateSubjectField('description', event.target.value)}
                rows={4}
              />

              {error && (
                <div className="student-message student-error">{error}</div>
              )}

              <div className="student-modal-actions">
                <button
                  type="button"
                  className="student-cancel-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="student-primary-button"
                  disabled={saving}
                >
                  <Save size={17} />
                  {saving
                    ? 'Salvando...'
                    : editingId
                      ? 'Salvar alterações'
                      : 'Cadastrar disciplina'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================
   GESTÃO DE ATIVIDADES
========================================= */

export function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyActivityForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadActivities() {
    setLoading(true);
    setError('');

    const [activityResult, subjectResult] = await Promise.all([
      supabase
        .from('activities')
        .select('id, title, status, description, subject_id, due_date')
        .order('created_at', { ascending: false }),
      supabase
        .from('subjects')
        .select('id, name, code, workload, description')
        .order('name', { ascending: true }),
    ]);

    if (activityResult.error) {
      setError(
        'Não foi possível carregar as atividades: ' +
          activityResult.error.message,
      );
      setActivities([]);
    } else {
      setActivities((activityResult.data ?? []) as Activity[]);
    }

    if (subjectResult.error) {
      setError(
        'Não foi possível carregar as disciplinas: ' +
          subjectResult.error.message,
      );
      setSubjects([]);
    } else {
      setSubjects((subjectResult.data ?? []) as Subject[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadActivities();
  }, []);

  function updateField(
    field: keyof typeof emptyActivityForm,
    value: string,
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openNewForm() {
    setEditingId(null);
    setForm(emptyActivityForm);
    setError('');
    setSuccess('');
    setShowForm(true);
  }

  function openEditForm(activity: Activity) {
    setEditingId(activity.id);
    setForm({
      title: activity.title ?? '',
      status: activity.status ?? 'Pendente',
      description: activity.description ?? '',
      subject_id: activity.subject_id ?? '',
      due_date: activity.due_date ?? '',
    });
    setError('');
    setSuccess('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyActivityForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError('Informe o título da atividade.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const activityData = {
      title: form.title.trim(),
      status: form.status,
      description: form.description.trim() || null,
      subject_id: form.subject_id || null,
      due_date: form.due_date || null,
    };

    const result = editingId
      ? await supabase
          .from('activities')
          .update(activityData)
          .eq('id', editingId)
      : await supabase
          .from('activities')
          .insert(activityData);

    if (result.error) {
      setError(
        `${editingId ? 'Erro ao atualizar' : 'Erro ao cadastrar'} atividade: ${result.error.message}`,
      );
      setSaving(false);
      return;
    }

    const wasEditing = Boolean(editingId);

    await loadActivities();
    closeForm();

    setSuccess(
      wasEditing
        ? 'Atividade atualizada com sucesso!'
        : 'Atividade cadastrada com sucesso!',
    );

    setSaving(false);
  }

  async function handleDelete(activity: Activity) {
    const confirmed = window.confirm(
      `Deseja realmente excluir a atividade "${activity.title}"?`,
    );

    if (!confirmed) return;

    setError('');
    setSuccess('');

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activity.id);

    if (error) {
      setError('Erro ao excluir atividade: ' + error.message);
      return;
    }

    setActivities((current) =>
      current.filter((item) => item.id !== activity.id),
    );

    setSuccess('Atividade excluída com sucesso!');
  }

  async function toggleComplete(activity: Activity) {
    const newStatus =
      activity.status === 'Concluída' ? 'Pendente' : 'Concluída';

    const { error } = await supabase
      .from('activities')
      .update({ status: newStatus })
      .eq('id', activity.id);

    if (error) {
      setError('Não foi possível atualizar o status: ' + error.message);
      return;
    }

    setActivities((current) =>
      current.map((item) =>
        item.id === activity.id
          ? { ...item, status: newStatus }
          : item,
      ),
    );

    setSuccess('Status da atividade atualizado!');
  }

  function getSubjectName(subjectId?: string | null) {
    if (!subjectId) return 'Sem disciplina associada';

    return (
      subjects.find((subject) => subject.id === subjectId)?.name ??
      'Disciplina não encontrada'
    );
  }

  function formatDate(date?: string | null) {
    if (!date) return 'Sem prazo definido';

    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  const filteredActivities = activities.filter((activity) => {
    const term = search.toLowerCase();

    const matchesSearch =
      activity.title.toLowerCase().includes(term) ||
      (activity.description ?? '').toLowerCase().includes(term) ||
      getSubjectName(activity.subject_id).toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === 'Todos' || activity.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = activities.filter(
    (activity) => activity.status === 'Pendente',
  ).length;

  const progressCount = activities.filter(
    (activity) => activity.status === 'Em andamento',
  ).length;

  const completedCount = activities.filter(
    (activity) => activity.status === 'Concluída',
  ).length;

  return (
    <div className="students-page">
      <div className="students-heading">
        <div>
          <span className="section-tag">EDUMANAGER</span>
          <h2>Gestão de Atividades</h2>
          <p>Organize tarefas, acompanhe prazos e controle suas atividades.</p>
        </div>

        <button className="student-primary-button" onClick={openNewForm}>
          <Plus size={18} />
          Nova atividade
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Pendentes"
          value={String(pendingCount)}
          description="Aguardando realização"
          icon={Clock}
          color="#d18a32"
        />
        <StatCard
          title="Em andamento"
          value={String(progressCount)}
          description="Atividades em execução"
          icon={ClipboardList}
          color="#4773df"
        />
        <StatCard
          title="Concluídas"
          value={String(completedCount)}
          description="Atividades finalizadas"
          icon={CheckCircle2}
          color="#16a078"
        />
      </div>

      {success && (
        <div className="student-message student-success">{success}</div>
      )}

      {error && (
        <div className="student-message student-error">{error}</div>
      )}

      <div className="students-toolbar">
        <div className="student-search">
          <Search size={19} />
          <input
            type="search"
            placeholder="Pesquisar atividade ou disciplina..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filtrar atividades por status"
        >
          <option value="Todos">Todos os status</option>
          {activityStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="students-table-card">
        <div className="students-table-heading">
          <div>
            <h3>Atividades cadastradas</h3>
            <p>Registros armazenados no banco de dados.</p>
          </div>
          <span className="students-count">
            {filteredActivities.length} registro(s)
          </span>
        </div>

        {loading ? (
          <div className="students-empty">Carregando atividades...</div>
        ) : filteredActivities.length === 0 ? (
          <div className="students-empty">
            <ClipboardList size={38} />
            <h3>Nenhuma atividade encontrada</h3>
            <p>
              {search || statusFilter !== 'Todos'
                ? 'Tente alterar os filtros de pesquisa.'
                : 'Cadastre sua primeira atividade para começar.'}
            </p>
            {!search && statusFilter === 'Todos' && (
              <button className="student-primary-button" onClick={openNewForm}>
                <Plus size={18} />
                Cadastrar primeira atividade
              </button>
            )}
          </div>
        ) : (
          <div className="students-table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Atividade</th>
                  <th>Disciplina</th>
                  <th>Prazo</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((activity) => (
                  <tr key={activity.id}>
                    <td>
                      <div className="student-name-cell">
                        <div className="student-avatar">
                          <ClipboardList size={17} />
                        </div>
                        <div>
                          <strong>{activity.title}</strong>
                          {activity.description && (
                            <p className="activity-description">
                              {activity.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{getSubjectName(activity.subject_id)}</td>
                    <td>
                      <span className="activity-date">
                        <CalendarDays size={15} />
                        {formatDate(activity.due_date)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`activity-status activity-status-${activity.status
                          .toLowerCase()
                          .replaceAll(' ', '-')}`}
                      >
                        {activity.status}
                      </span>
                    </td>
                    <td>
                      <div className="student-actions">
                        <button
                          className="student-icon-button"
                          title={
                            activity.status === 'Concluída'
                              ? 'Reabrir atividade'
                              : 'Concluir atividade'
                          }
                          onClick={() => toggleComplete(activity)}
                        >
                          <CheckCircle2 size={17} />
                        </button>
                        <button
                          className="student-icon-button"
                          title="Editar atividade"
                          onClick={() => openEditForm(activity)}
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          className="student-icon-button student-delete-button"
                          title="Excluir atividade"
                          onClick={() => handleDelete(activity)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="student-modal-overlay">
          <div className="student-modal">
            <div className="student-modal-heading">
              <div>
                <span className="section-tag">ORGANIZAÇÃO ACADÊMICA</span>
                <h3>{editingId ? 'Editar atividade' : 'Nova atividade'}</h3>
                <p>Informe os detalhes da atividade.</p>
              </div>
              <button
                className="student-close-button"
                onClick={closeForm}
                type="button"
                aria-label="Fechar formulário"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="activity-title">Título da atividade</label>
              <input
                id="activity-title"
                type="text"
                placeholder="Ex.: Trabalho de Desenvolvimento Web"
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                required
              />

              <label htmlFor="activity-subject">Disciplina</label>
              <select
                id="activity-subject"
                value={form.subject_id}
                onChange={(event) => updateField('subject_id', event.target.value)}
              >
                <option value="">Nenhuma disciplina</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>

              <label htmlFor="activity-description">Descrição</label>
              <textarea
                id="activity-description"
                rows={4}
                placeholder="Descreva os detalhes da atividade..."
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
              />

              <label htmlFor="activity-due-date">Data de entrega</label>
              <input
                id="activity-due-date"
                type="date"
                value={form.due_date}
                onChange={(event) => updateField('due_date', event.target.value)}
              />

              <label htmlFor="activity-status">Status</label>
              <select
                id="activity-status"
                value={form.status}
                onChange={(event) => updateField('status', event.target.value)}
              >
                {activityStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              {error && (
                <div className="student-message student-error">{error}</div>
              )}

              <div className="student-modal-actions">
                <button
                  type="button"
                  className="student-cancel-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="student-primary-button"
                  disabled={saving}
                >
                  <Save size={17} />
                  {saving
                    ? 'Salvando...'
                    : editingId
                      ? 'Salvar alterações'
                      : 'Cadastrar atividade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================
   DESEMPENHO ACADÊMICO
========================================= */

export function Performance() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const emptyForm = {
    student_id: '',
    subject_id: '',
    grade: '',
    evaluation: '',
  };

  const [form, setForm] = useState(emptyForm);

  async function loadData() {
    setLoading(true);
    setError('');

    const [gradeResult, studentResult, subjectResult] =
      await Promise.all([
        supabase
          .from('grades')
          .select('id, student_id, subject_id, grade, evaluation, created_at')
          .order('created_at', { ascending: false }),

        supabase
          .from('students')
          .select('id, name, email, registration, course, status, phone')
          .order('name', { ascending: true }),

        supabase
          .from('subjects')
          .select('id, name, code, workload, description')
          .order('name', { ascending: true }),
      ]);

    if (gradeResult.error) {
      setError('Erro ao carregar notas: ' + gradeResult.error.message);
      setGrades([]);
    } else {
      setGrades((gradeResult.data ?? []) as Grade[]);
    }

    if (studentResult.error) {
      setError('Erro ao carregar alunos: ' + studentResult.error.message);
      setStudents([]);
    } else {
      setStudents((studentResult.data ?? []) as Student[]);
    }

    if (subjectResult.error) {
      setError(
        'Erro ao carregar disciplinas: ' + subjectResult.error.message,
      );
      setSubjects([]);
    } else {
      setSubjects((subjectResult.data ?? []) as Subject[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function openNewForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
    setShowForm(true);
  }

  function openEditForm(item: Grade) {
    setEditingId(item.id);
    setForm({
      student_id: item.student_id,
      subject_id: item.subject_id,
      grade: String(item.grade),
      evaluation: item.evaluation,
    });
    setError('');
    setSuccess('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const gradeNumber = Number(form.grade);

    if (!form.student_id || !form.subject_id || !form.evaluation.trim()) {
      setError('Preencha todos os campos.');
      return;
    }

    if (
      form.grade.trim() === '' ||
      !Number.isFinite(gradeNumber) ||
      gradeNumber < 0 ||
      gradeNumber > 10
    ) {
      setError('Informe uma nota válida entre 0 e 10.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const gradeData = {
      student_id: form.student_id,
      subject_id: form.subject_id,
      grade: gradeNumber,
      evaluation: form.evaluation.trim(),
    };

    const result = editingId
      ? await supabase
          .from('grades')
          .update(gradeData)
          .eq('id', editingId)
      : await supabase
          .from('grades')
          .insert(gradeData);

    if (result.error) {
      setError(
        `${editingId ? 'Erro ao atualizar' : 'Erro ao cadastrar'} nota: ${result.error.message}`,
      );
      setSaving(false);
      return;
    }

    const wasEditing = Boolean(editingId);

    await loadData();
    closeForm();

    setSuccess(
      wasEditing
        ? 'Nota atualizada com sucesso!'
        : 'Nota cadastrada com sucesso!',
    );

    setSaving(false);
  }

  async function handleDelete(item: Grade) {
    const student = students.find(
      (student) => student.id === item.student_id,
    );

    const confirmed = window.confirm(
      `Deseja realmente excluir a nota de ${student?.name ?? 'este aluno'}?`,
    );

    if (!confirmed) return;

    setError('');
    setSuccess('');

    const { error } = await supabase
      .from('grades')
      .delete()
      .eq('id', item.id);

    if (error) {
      setError('Erro ao excluir nota: ' + error.message);
      return;
    }

    setGrades((current) =>
      current.filter((grade) => grade.id !== item.id),
    );

    setSuccess('Nota excluída com sucesso!');
  }

  function getStudentName(studentId: string) {
    return (
      students.find((student) => student.id === studentId)?.name ??
      'Aluno não encontrado'
    );
  }

  function getSubjectName(subjectId: string) {
    return (
      subjects.find((subject) => subject.id === subjectId)?.name ??
      'Disciplina não encontrada'
    );
  }

  function getAverage(items: Grade[]) {
    if (items.length === 0) return 0;

    return (
      items.reduce((total, item) => total + Number(item.grade), 0) /
      items.length
    );
  }

  const average = getAverage(grades);

  const approvedCount = grades.filter(
    (item) => Number(item.grade) >= 7,
  ).length;

  const filteredGrades = grades.filter((item) => {
    const term = search.toLowerCase();

    return (
      getStudentName(item.student_id).toLowerCase().includes(term) ||
      getSubjectName(item.subject_id).toLowerCase().includes(term) ||
      item.evaluation.toLowerCase().includes(term)
    );
  });

  const formatGrade = (value: number) =>
    Number(value).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="students-page">
      <div className="students-heading">
        <div>
          <span className="section-tag">EDUMANAGER</span>
          <h2>Desempenho Acadêmico</h2>
          <p>Registre notas e acompanhe os resultados acadêmicos.</p>
        </div>

        <button
          className="student-primary-button"
          onClick={openNewForm}
          disabled={students.length === 0 || subjects.length === 0}
        >
          <Plus size={18} />
          Registrar nota
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Notas registradas"
          value={String(grades.length)}
          description="Total de avaliações"
          icon={ClipboardList}
          color="#4773df"
        />

        <StatCard
          title="Média geral"
          value={formatGrade(average)}
          description="Média das notas registradas"
          icon={ChartNoAxesCombined}
          color="#8b65d6"
        />

        <StatCard
          title="Notas a partir de 7"
          value={String(approvedCount)}
          description="Referência de desempenho"
          icon={CheckCircle2}
          color="#16a078"
        />
      </div>

      {success && (
        <div className="student-message student-success">{success}</div>
      )}

      {error && (
        <div className="student-message student-error">{error}</div>
      )}

      {!loading && students.length === 0 && (
        <div className="student-message student-error">
          Cadastre pelo menos um aluno antes de registrar notas.
        </div>
      )}

      {!loading && subjects.length === 0 && (
        <div className="student-message student-error">
          Cadastre pelo menos uma disciplina antes de registrar notas.
        </div>
      )}

      <div className="students-toolbar">
        <div className="student-search">
          <Search size={19} />
          <input
            type="search"
            placeholder="Pesquisar por aluno, disciplina ou avaliação..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="students-table-card">
        <div className="students-table-heading">
          <div>
            <h3>Notas cadastradas</h3>
            <p>Registros armazenados no banco de dados.</p>
          </div>

          <span className="students-count">
            {filteredGrades.length} registro(s)
          </span>
        </div>

        {loading ? (
          <div className="students-empty">Carregando notas...</div>
        ) : filteredGrades.length === 0 ? (
          <div className="students-empty">
            <ChartNoAxesCombined size={38} />
            <h3>Nenhuma nota encontrada</h3>
            <p>
              {search
                ? 'Tente pesquisar com outro termo.'
                : 'Registre a primeira avaliação para acompanhar o desempenho.'}
            </p>
          </div>
        ) : (
          <div className="students-table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Disciplina</th>
                  <th>Avaliação</th>
                  <th>Nota</th>
                  <th>Resultado</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredGrades.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{getStudentName(item.student_id)}</strong>
                    </td>
                    <td>{getSubjectName(item.subject_id)}</td>
                    <td>{item.evaluation}</td>
                    <td>
                      <strong>{formatGrade(Number(item.grade))}</strong>
                    </td>
                    <td>
                      <span
                        className={`activity-status ${
                          Number(item.grade) >= 7
                            ? 'activity-status-concluída'
                            : 'activity-status-pendente'
                        }`}
                      >
                        {Number(item.grade) >= 7
                          ? 'Atingiu a média'
                          : 'Abaixo da média'}
                      </span>
                    </td>
                    <td>
                      <div className="student-actions">
                        <button
                          className="student-icon-button"
                          title="Editar nota"
                          onClick={() => openEditForm(item)}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="student-icon-button student-delete-button"
                          title="Excluir nota"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="student-modal-overlay">
          <div className="student-modal">
            <div className="student-modal-heading">
              <div>
                <span className="section-tag">REGISTRO ACADÊMICO</span>
                <h3>{editingId ? 'Editar nota' : 'Nova nota'}</h3>
                <p>Informe o aluno, a disciplina e a avaliação.</p>
              </div>

              <button
                className="student-close-button"
                onClick={closeForm}
                type="button"
                aria-label="Fechar formulário"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="grade-student">Aluno</label>
              <select
                id="grade-student"
                value={form.student_id}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    student_id: event.target.value,
                  }))
                }
                required
              >
                <option value="">Selecione um aluno</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} — {student.registration}
                  </option>
                ))}
              </select>

              <label htmlFor="grade-subject">Disciplina</label>
              <select
                id="grade-subject"
                value={form.subject_id}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    subject_id: event.target.value,
                  }))
                }
                required
              >
                <option value="">Selecione uma disciplina</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} — {subject.code}
                  </option>
                ))}
              </select>

              <label htmlFor="grade-evaluation">Avaliação</label>
              <input
                id="grade-evaluation"
                type="text"
                placeholder="Ex.: Prova 1, Trabalho, Projeto..."
                value={form.evaluation}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    evaluation: event.target.value,
                  }))
                }
                required
              />

              <label htmlFor="grade-value">Nota (0 a 10)</label>
              <input
                id="grade-value"
                type="number"
                min="0"
                max="10"
                step="0.01"
                placeholder="Ex.: 8.50"
                value={form.grade}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    grade: event.target.value,
                  }))
                }
                required
              />

              {error && (
                <div className="student-message student-error">{error}</div>
              )}

              <div className="student-modal-actions">
                <button
                  type="button"
                  className="student-cancel-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="student-primary-button"
                  disabled={saving}
                >
                  <Save size={17} />
                  {saving
                    ? 'Salvando...'
                    : editingId
                      ? 'Salvar alterações'
                      : 'Registrar nota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


/* =========================================
   SOBRE O EDUMANAGER
========================================= */

export function About() {
  const features = [
    {
      icon: Users,
      title: 'Gestão de alunos',
      description:
        'Cadastro, consulta, edição e organização das informações dos alunos.',
    },
    {
      icon: BookOpen,
      title: 'Gestão de disciplinas',
      description:
        'Organização das disciplinas, códigos e respectivas cargas horárias.',
    },
    {
      icon: ClipboardList,
      title: 'Controle de atividades',
      description:
        'Registro de tarefas, acompanhamento de prazos e controle de status.',
    },
    {
      icon: ChartNoAxesCombined,
      title: 'Desempenho acadêmico',
      description:
        'Registro de notas e acompanhamento das médias acadêmicas.',
    },
  ];

  const technologies = [
    'React',
    'TypeScript',
    'Vite',
    'Supabase',
    'PostgreSQL',
    'Recharts',
  ];

  return (
    <div className="about-page">
      <section className="about-hero">
        <span className="section-tag">CONHEÇA O SISTEMA</span>

        <div className="about-hero-icon">
          <BookOpen size={38} />
        </div>

        <h2>Sobre o EduManager</h2>

        <p>
          Uma plataforma de gerenciamento acadêmico desenvolvida
          para centralizar informações, facilitar a organização
          e acompanhar o desempenho educacional.
        </p>
      </section>

      <section className="about-content">
        <div className="about-section-heading">
          <span className="section-tag">NOSSA PROPOSTA</span>

          <h3>Organização acadêmica em um só lugar</h3>

          <p>
            O EduManager reúne ferramentas para administrar alunos,
            disciplinas, atividades e notas em uma única aplicação.
            Os dados são armazenados no banco de dados e podem ser
            consultados após o acesso à plataforma.
          </p>
        </div>

        <div className="about-features">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                className="about-feature-card"
                key={feature.title}
              >
                <div className="about-feature-icon">
                  <Icon size={23} />
                </div>

                <h4>{feature.title}</h4>

                <p>{feature.description}</p>
              </article>
            );
          })}
        </div>

        <section className="about-technologies">
          <span className="section-tag">DESENVOLVIMENTO</span>

          <h3>Tecnologias utilizadas</h3>

          <p>
            O projeto utiliza tecnologias modernas para construir
            uma aplicação web organizada, interativa e integrada
            a um banco de dados.
          </p>

          <div className="about-tech-list">
            {technologies.map((technology) => (
              <span key={technology}>{technology}</span>
            ))}
          </div>
        </section>

        <section className="about-purpose">
          <div>
            <span className="section-tag">EDUMANAGER</span>

            <h3>Gestão mais simples e organizada</h3>

            <p>
              O objetivo do projeto é demonstrar como o desenvolvimento
              web pode contribuir para a organização de informações
              acadêmicas, oferecendo uma interface intuitiva e recursos
              integrados.
            </p>
          </div>

          <BookOpen size={42} />
        </section>
      </section>
    </div>
  );
}

