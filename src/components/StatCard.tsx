
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: StatCardProps) {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <span>{title}</span>
        <div className="stat-icon" style={{ backgroundColor: `${color}18`, color }}>
          <Icon size={21} />
        </div>
      </div>

      <strong className="stat-value">{value}</strong>
      <p className="stat-description">{description}</p>
    </article>
  );
}
