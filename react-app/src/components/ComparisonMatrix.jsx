export default function ComparisonMatrix({ tiersData }) {
  if (!tiersData || !tiersData.cost || !tiersData.balanced || !tiersData.performance) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading comparison...</div>;
  }

  const tiers = ['cost', 'balanced', 'performance'];
  const titles = { cost: 'Cost-Efficient', balanced: 'Balanced', performance: 'High-Performance' };
  const colors = { cost: 'var(--cyan)', balanced: 'var(--blue)', performance: 'var(--magenta)' };

  const getRating = (tier, category) => {
    const data = tiersData[tier];
    if (!data) return 1;
    const svcs = data.aws_services?.map(s => s.name.toLowerCase()) || [];
    const hasECS = svcs.some(s => s.includes('ecs'));
    const hasCache = svcs.some(s => s.includes('elasticache'));
    const hasSQS = svcs.some(s => s.includes('sqs'));
    const hasOpenSearch = svcs.some(s => s.includes('opensearch'));
    const hasCloudFront = svcs.some(s => s.includes('cloudfront'));

    let score = 3;

    switch(category) {
      case 'scalability':
        score = tier === 'cost' ? 2 : (tier === 'balanced' ? 4 : 5);
        if (hasECS) score = Math.max(score, 4);
        break;
      case 'latency':
        score = tier === 'cost' ? 3 : (tier === 'balanced' ? 4 : 5);
        if (hasCache) score = Math.max(score, 4);
        if (hasCloudFront) score = Math.min(score + 1, 5);
        break;
      case 'reliability':
        score = tier === 'cost' ? 2 : (tier === 'balanced' ? 3 : 5);
        if (hasSQS) score = Math.min(score + 1, 5);
        break;
      case 'complexity':
        // higher score means MORE complex (which is typically worse)
        score = 1;
        if (hasECS) score++;
        if (hasCache) score++;
        if (hasSQS) score++;
        if (hasOpenSearch) score += 2;
        score = Math.min(score, 5);
        // let's invert complexity so 5 dots means "Very simple" or we can just say "Complexity" and more dots = more complex
        break;
    }
    return score;
  };

  const renderDots = (score, color) => {
    return (
      <div className="rating-dots">
        {[1, 2, 3, 4, 5].map(n => (
          <span key={n} className="rdot" style={{
            backgroundColor: n <= score ? color : 'rgba(255,255,255,0.1)',
            boxShadow: n <= score ? `0 0 8px ${color}` : 'none'
          }}></span>
        ))}
      </div>
    );
  };

  return (
    <div className="cmp-matrix-wrap">
      <table className="cmp-matrix">
        <thead>
          <tr>
            <th>Parameter</th>
            {tiers.map(t => (
              <th key={t} style={{ color: colors[t] }}>{titles[t]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Monthly Cost</td>
            {tiers.map(t => (
              <td key={t} className="cval-cost">{tiersData[t]?.cost_breakdown?.monthly_estimate || '—'}</td>
            ))}
          </tr>
          <tr>
            <td>Service Count</td>
            {tiers.map(t => (
              <td key={t}>{tiersData[t]?.aws_services?.length || 0}</td>
            ))}
          </tr>
          <tr>
            <td>Scalability</td>
            {tiers.map(t => (
              <td key={t}>{renderDots(getRating(t, 'scalability'), colors[t])}</td>
            ))}
          </tr>
          <tr>
            <td>Low Latency</td>
            {tiers.map(t => (
              <td key={t}>{renderDots(getRating(t, 'latency'), colors[t])}</td>
            ))}
          </tr>
          <tr>
            <td>Reliability</td>
            {tiers.map(t => (
              <td key={t}>{renderDots(getRating(t, 'reliability'), colors[t])}</td>
            ))}
          </tr>
          <tr>
            <td>Complexity (Higher = Harder)</td>
            {tiers.map(t => (
              <td key={t}>{renderDots(getRating(t, 'complexity'), colors[t])}</td>
            ))}
          </tr>
          <tr>
            <td style={{ borderBottom: 'none' }}>Best For</td>
            <td style={{ borderBottom: 'none', color: 'var(--muted2)' }}>MVPs, Startups, Predictable low traffic</td>
            <td style={{ borderBottom: 'none', color: 'var(--muted2)' }}>Growing Products, Standard web apps</td>
            <td style={{ borderBottom: 'none', color: 'var(--muted2)' }}>Enterprise, High-traffic scenarios</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
