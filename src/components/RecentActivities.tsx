
import { useEffect, useState } from 'react';
import { CalendarDays, Clock, CheckCircle2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface Activity {
  id: string;
  title: string;
  status: string;
  subject_id: string | null;
  due_date: string | null;
  created_at?: string | null;
}

interface Subject {
  id: string;
  name: string;
}

interface RecentActivity {
  id: string;
  title: string;
  subject: string;
  date: string;
  status: string;
}

function formatDate(date: string | null | undefined) {
  if (!date) return 'Sem data definida';

  const parsedDate = new Date(
    date.length === 10 ? `${date}T00:00:00` : date
  );

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Sem data definida';
  }

  return parsedDate.toLocaleDateString('pt-BR');
}

function getStatusClass(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes('conclu')) return 'completed';
  if (normalized.includes('pendente')) return 'pending';

  return 'progress';
}

export default function RecentActivities() {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadActivities() {
      setLoading(true);
      setError('');

      const [activitiesResult, subjectsResult] = await Promise.all([
        supabase
          .from('activities')
          .select('id, title, status, subject_id, due_date, created_at')
          .order('created_at', { ascending: false })
          .limit(5),

        supabase
          .from('subjects')
          .select('id, name'),
      ]);

      if (activitiesResult.error) {
        setError('Não foi possível carregar as atividades.');
        setLoading(false);
        return;
      }

      if (subjectsResult.error) {
        setError('Não foi possível carregar as disciplinas.');
        setLoading(false);
        return;
      }

      const subjects = subjectsResult.data as Subject[];

      const formattedActivities = (
        activitiesResult.data as Activity[]
      ).map((activity) => {
        const subject = subjects.find(
          (item) => item.id === activity.subject_id
        );

        return {
          id: activity.id,
          title: activity.title,
          subject: subject?.name || 'Sem disciplina vinculada',
          date: formatDate(activity.due_date || activity.created_at),
          status: activity.status || 'Pendente',
        };
      });

      setActivities(formattedActivities);
      setLoading(false);
    }

    loadActivities();
  }, []);

  return (
    <section className="dashboard-panel activities-panel">
      <div className="panel-heading">
        <div>
          <h3>Atividades recentes</h3>
          <p>Acompanhamento de atividades acadêmicas</p>
        </div>
      </div>

      <div className="activity-list">
        {loading && (
          <p>Carregando atividades...</p>
        )}

        {!loading && error && (
          <p>{error}</p>
        )}

        {!loading && !error && activities.length === 0 && (
          <p>Nenhuma atividade cadastrada ainda.</p>
        )}

        {!loading && !error && activities.map((activity) => (
          <article className="activity-item" key={activity.id}>
            <div className="activity-icon">
              <CalendarDays size={19} />
            </div>

            <div className="activity-info">
              <strong>{activity.title}</strong>
              <span>{activity.subject}</span>

              <small>
                <Clock size={13} />
                {activity.date}
              </small>
            </div>

            <span
              className={`activity-status ${getStatusClass(activity.status)}`}
            >
              {getStatusClass(activity.status) === 'completed' && (
                <CheckCircle2 size={13} />
              )}
              {activity.status}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
