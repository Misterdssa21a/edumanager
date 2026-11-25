
import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { supabase } from '../services/supabase';

interface Grade {
  grade: number;
  subject_id: string;
}

interface Subject {
  id: string;
  name: string;
}

interface PerformanceData {
  subject: string;
  average: number;
}

export default function PerformanceChart() {
  const [data, setData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPerformance() {
      setLoading(true);
      setError('');

      const [gradesResult, subjectsResult] = await Promise.all([
        supabase
          .from('grades')
          .select('grade, subject_id'),

        supabase
          .from('subjects')
          .select('id, name')
          .order('name', { ascending: true }),
      ]);

      if (gradesResult.error || subjectsResult.error) {
        setError('Não foi possível carregar os dados do gráfico.');
        setData([]);
        setLoading(false);
        return;
      }

      const grades = (gradesResult.data ?? []) as Grade[];
      const subjects = (subjectsResult.data ?? []) as Subject[];

      const calculatedData = subjects
        .map((subject) => {
          const subjectGrades = grades.filter(
            (item) => item.subject_id === subject.id,
          );

          if (subjectGrades.length === 0) {
            return null;
          }

          const sum = subjectGrades.reduce(
            (total, item) => total + Number(item.grade),
            0,
          );

          return {
            subject: subject.name,
            average: Number((sum / subjectGrades.length).toFixed(2)),
          };
        })
        .filter((item): item is PerformanceData => item !== null);

      setData(calculatedData);
      setLoading(false);
    }

    loadPerformance();
  }, []);

  return (
    <section className="dashboard-panel chart-panel">
      <div className="panel-heading">
        <div>
          <h3>Desempenho acadêmico</h3>
          <p>Média real das notas por disciplina</p>
        </div>

        <span className="panel-badge">Supabase</span>
      </div>

      <div className="chart-container">
        {loading ? (
          <div className="students-empty">
            Carregando desempenho acadêmico...
          </div>
        ) : error ? (
          <div className="students-empty">
            {error}
          </div>
        ) : data.length === 0 ? (
          <div className="students-empty">
            <p>Nenhuma nota cadastrada para gerar o gráfico.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#edf0f5"
              />

              <XAxis
                dataKey="subject"
                tick={{ fill: '#7b8798', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                domain={[0, 10]}
                tick={{ fill: '#7b8798', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                formatter={(value) => [
                  `${Number(value).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}/10`,
                  'Média',
                ]}
                contentStyle={{
                  borderRadius: '10px',
                  border: '1px solid #e9edf4',
                  fontSize: '12px',
                }}
              />

              <Bar
                dataKey="average"
                name="Média"
                fill="#4568df"
                radius={[5, 5, 0, 0]}
                maxBarSize={42}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
