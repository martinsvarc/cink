import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if user can perform a specific action
 * ADMIN OVERRIDE: Admins can do everything, no exceptions
 */
export function canPerformAction(user: { role: string }, action: string): boolean {
  // Admin override - admins can do EVERYTHING
  if (user.role === 'admin') {
    return true;
  }
  
  // Other role checks for non-admins
  switch (action) {
    case 'submit_payment':
      return user.role === 'chatter';
    case 'approve_payment':
      return user.role === 'admin'; // Only admins can approve
    case 'manage_users':
      return user.role === 'admin';
    case 'view_analytics':
      return ['admin', 'chatter'].includes(user.role);
    case 'manage_models':
      return user.role === 'admin';
    case 'manage_clients':
      return ['admin', 'chatter'].includes(user.role);
    default:
      return false;
  }
}
