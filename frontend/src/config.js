/**
 * Global configuration settings for DeepGuard frontend.
 * Uses 127.0.0.1 by default to ensure maximum compatibility with Safari and modern browsers
 * without IPv4/IPv6 localhost resolution failures.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const FALLBACK_API_URL = 'http://localhost:8000';
