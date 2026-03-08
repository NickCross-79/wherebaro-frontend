export const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  const [year, month, day] = dateString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getRelativeTime = (dateString) => {
  if (!dateString) return 'Unknown';

  const [year, month, day] = dateString.split('-');
  const reviewDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);
  const today = new Date();

  reviewDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - reviewDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
};

/**
 * Format a countdown from now until the given date.
 * @param {Date} date - Target date
 * @param {string} [expiredText='Arriving Soon'] - Text to show when diff <= 0
 * @returns {string}
 */
export const formatTimeRemaining = (date, expiredText = 'Arriving Soon') => {
  if (!date) return 'Unknown';
  const now = new Date();
  const diff = date - now;

  if (diff <= 0) return expiredText;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else {
    return `${minutes}m ${seconds}s`;
  }
};

/**
 * Parse location string into name and planet components
 * Handles formats: "Name (Planet)" or "Name, Planet"
 */
export const parseLocation = (location) => {
  if (!location) return null;
  const trimmed = String(location).trim();
  if (!trimmed) return null;

  // Try parentheses format: "Name (Planet)"
  const parenMatch = trimmed.match(/^(.*?)\s*\((.*?)\)\s*$/);
  if (parenMatch) {
    return { name: parenMatch[1].trim(), planet: parenMatch[2].trim() };
  }

  // Try comma format: "Name, Planet"
  const commaParts = trimmed.split(',').map((part) => part.trim()).filter(Boolean);
  if (commaParts.length >= 2) {
    return { name: commaParts[0], planet: commaParts[1] };
  }

  // Default: just the name
  return { name: trimmed, planet: '' };
};
