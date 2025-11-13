// API Base URL configuration
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''
const isDevelopment = import.meta.env.DEV

// Helper function to build API URL
export const apiUrl = (path: string): string => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  // In development, use relative path (Vite proxy will handle it)
  // In production, use VITE_BACKEND_URL if set, otherwise relative path
  if (isDevelopment) {
    // Development: use relative path for Vite proxy
    return `/${cleanPath}`
  }
  
  // Production: use BACKEND_URL if set
  if (BACKEND_URL) {
    // Remove trailing slash from BACKEND_URL if present
    const baseUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL
    return `${baseUrl}/${cleanPath}`
  }
  
  // Fallback to relative path
  return `/${cleanPath}`
}
