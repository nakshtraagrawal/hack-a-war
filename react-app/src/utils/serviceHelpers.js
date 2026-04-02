export function getServiceBadgeClass(name) {
  const n = name.toLowerCase();
  if (n.includes('cognito')) return 'sc';
  if (n.includes('lambda')) return 'sb2';
  if (n.includes('s3')) return 'sg';
  if (n.includes('dynamodb')) return 'sm';
  if (n.includes('ecs')) return 'sb2';
  if (n.includes('elasticache')) return 'sc';
  if (n.includes('sqs')) return 'sg';
  if (n.includes('opensearch')) return 'sm';
  if (n.includes('cloudfront')) return 'sgrn';
  if (n.includes('api gateway')) return 'sgrn';
  return 'sc';
}

export function getServiceIcon(name) {
  const n = name.toLowerCase();
  if (n.includes('cognito')) return '🔐';
  if (n.includes('lambda')) return 'λ';
  if (n.includes('s3')) return '🪣';
  if (n.includes('dynamodb')) return '🗃';
  if (n.includes('ecs')) return '🐳';
  if (n.includes('elasticache')) return '⚡';
  if (n.includes('sqs')) return '📬';
  if (n.includes('opensearch')) return '🔍';
  if (n.includes('cloudfront')) return '🌐';
  if (n.includes('api gateway')) return '⚙️';
  return '☁️';
}

export function parseCostNum(str) {
  if (!str) return 0;
  const m = (str.match(/[\d,]+/) || [])[0];
  return m ? parseInt(m.replace(/,/g, '')) : 0;
}
