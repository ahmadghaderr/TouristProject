export interface Stat {
  label: string;
  value: string | number;
  className?: string;
}

interface SummaryStatsProps {
  stats: Stat[];
}

const SummaryStats = ({ stats }: SummaryStatsProps) => (
  <div className="summary-stats">
    {stats.map((stat) => (
      <div className="stat" key={stat.label}>
        <span className="stat-label">{stat.label}</span>
        <span className={`stat-value ${stat.className ?? ""}`.trim()}>{stat.value}</span>
      </div>
    ))}
  </div>
);

export default SummaryStats;
