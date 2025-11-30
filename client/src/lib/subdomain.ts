// Subdomain detection utilities for admin.privescreen.com routing

export type AppMode = 'main' | 'admin';

// Hostnames that indicate admin subdomain
const ADMIN_HOSTNAMES = [
  'admin.privescreen.com',
  'admin.localhost',
  'localhost:5173', // For local dev with specific port
];

// Check if current hostname is admin subdomain
export function isAdminSubdomain(): boolean {
  if (typeof window === 'undefined') return false;

  const hostname = window.location.hostname;
  const host = window.location.host; // includes port

  // Check if it's the admin subdomain
  if (hostname.startsWith('admin.')) return true;

  // Check against known admin hostnames
  if (ADMIN_HOSTNAMES.includes(host) || ADMIN_HOSTNAMES.includes(hostname)) return true;

  // For local development: check URL param ?mode=admin
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('mode') === 'admin') return true;

  return false;
}

// Get current app mode based on subdomain
export function getAppMode(): AppMode {
  return isAdminSubdomain() ? 'admin' : 'main';
}

// Get the correct URL for cross-subdomain navigation
export function getAdminUrl(path: string = '/'): string {
  if (typeof window === 'undefined') return path;

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${window.location.origin}${path}?mode=admin`;
  }

  // Production: redirect to admin subdomain
  const baseDomain = hostname.replace(/^(admin\.)?/, '');
  return `${protocol}//admin.${baseDomain}${path}`;
}

// Get the main app URL from admin subdomain
export function getMainUrl(path: string = '/'): string {
  if (typeof window === 'undefined') return path;

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${window.location.origin}${path}`;
  }

  // Production: redirect to main domain
  const baseDomain = hostname.replace(/^admin\./, '');
  return `${protocol}//${baseDomain}${path}`;
}
