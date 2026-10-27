import confetti from 'canvas-confetti';

/**
 * Format date string into human-readable format
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return 'No date';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Invalid date';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
};

/**
 * Check if a date is overdue
 */
export const isOverdue = (dateInput, isCompleted = false) => {
  if (!dateInput || isCompleted) return false;
  const date = new Date(dateInput);
  const now = new Date();
  // set now to start of day
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return date < startOfToday;
};

/**
 * Check if a date is today
 */
export const isDueToday = (dateInput) => {
  if (!dateInput) return false;
  const date = new Date(dateInput);
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

/**
 * Generate user avatar fallback initials
 */
export const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

/**
 * Get distinct background color for avatar by name hash
 */
export const getAvatarColor = (name = '') => {
  const colors = [
    'bg-zinc-800 text-white',
    'bg-zinc-600 text-white',
    'bg-indigo-500 text-white',
    'bg-sky-500 text-white',
    'bg-violet-500 text-white',
    'bg-amber-500 text-white',
    'bg-rose-500 text-white',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Status meta (label, badge styles)
 */
export const STATUS_META = {
  todo: {
    label: 'To Do',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  in_review: {
    label: 'In Review',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
  },
  completed: {
    label: 'Completed',
    color: 'bg-zinc-100 text-zinc-900 border-zinc-300',
    dot: 'bg-[#18181B]',
  },
};

/**
 * Priority meta (label, badge styles)
 */
export const PRIORITY_META = {
  low: {
    label: 'Low',
    color: 'bg-slate-100 text-slate-600 border-slate-200',
    badgeBg: 'bg-slate-100 text-slate-600',
  },
  medium: {
    label: 'Medium',
    color: 'bg-sky-50 text-sky-700 border-sky-200',
    badgeBg: 'bg-sky-100 text-sky-700',
  },
  high: {
    label: 'High',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeBg: 'bg-amber-100 text-amber-800',
  },
  urgent: {
    label: 'Urgent',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeBg: 'bg-rose-100 text-rose-800 font-semibold',
  },
};

/**
 * Trigger celebratory confetti burst
 */
export const triggerConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#18181B', '#71717A', '#3F3F46', '#2563EB', '#D97706'],
  });
};
