export const formatTimeAgo = (date) => {
  if (!date) return 'Never run';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  
  const units = [
    { name: 'y', seconds: 31536000 },
    { name: 'mo', seconds: 2592000 },
    { name: 'd', seconds: 86400 },
    { name: 'h', seconds: 3600 },
    { name: 'm', seconds: 60 },
  ];

  for (const unit of units) {
    const quotient = Math.floor(diffInSeconds / unit.seconds);
    if (quotient >= 1) {
      return `${quotient}${unit.name} ago`;
    }
  }
  return 'Just now';
};