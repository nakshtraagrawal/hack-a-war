import { Link } from 'react-router-dom';

export default function TierCard({ tier, data, isLoading }) {
  const titles = {
    cost: 'Cost-Efficient',
    balanced: 'Balanced',
    performance: 'High-Performance'
  };
  const colors = {
    cost: 'var(--cyan)',
    balanced: 'var(--blue)',
    performance: 'var(--magenta)'
  };
  const color = colors[tier] || 'var(--cyan)';

  if (isLoading) {
    return (
      <div className="tier-card skeleton">
        <div className="tc-header">
           <div className="tc-title" style={{ color: 'var(--muted)' }}>{titles[tier]}</div>
           <div className="shimmer-line short"></div>
        </div>
        <div className="tc-body">
           <div className="shimmer-line"></div>
           <div className="shimmer-line"></div>
           <div className="shimmer-line" style={{ width: '60%' }}></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const cost = data.cost_breakdown?.monthly_estimate || '—';
  const services = data.aws_services?.length || 0;
  const strategy = data.architecture_overview?.strategy || data.scale_analysis || '';

  return (
    <div className="tier-card" style={{ borderColor: color, transform: 'translateY(0)', opacity: 1, animation: 'fu 0.5s ease both' }}>
      <div className="tc-header">
        <div className="tc-title" style={{ color }}>{titles[tier]}</div>
        <div className="tc-cost">{cost}</div>
      </div>
      <div className="tc-body">
        <div className="tc-stat">
           <span style={{ color }}>{services}</span> AWS Services
        </div>
        <div className="tc-desc">{strategy.substring(0, 110)}{strategy.length > 110 ? '...' : ''}</div>
      </div>
      <Link to={`/result?tier=${tier}`} className="tc-btn" style={{ color, borderColor: `rgba(0,0,0,0.2)` }}>
        View Details →
      </Link>
    </div>
  );
}
