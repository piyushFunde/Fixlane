import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarTint(userId: string): { bg: string; text: string } {
  const lastChar = userId.slice(-1).toLowerCase();
  if (lastChar === '0' || lastChar === '1') return { bg: '#DCE9F7', text: '#24476F' };
  if (lastChar === '2' || lastChar === '3') return { bg: '#F6E1EA', text: '#7A2A4C' };
  if (lastChar === '4' || lastChar === '5') return { bg: '#E3F1ED', text: '#0B5A4A' };
  if (lastChar === '6' || lastChar === '7') return { bg: '#FBEFCF', text: '#6B4600' };
  return { bg: '#E8E4F4', text: '#453A78' };
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
