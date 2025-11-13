// API Base URL configuration
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:1234'

// Helper function to build API URL
export const apiUrl = (path: string): string => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  // Use BACKEND_URL if set, otherwise fallback
  if (BACKEND_URL) {
    // Remove trailing slash from BACKEND_URL if present
    const baseUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL
    return `${baseUrl}/${cleanPath}`
  }
  
  // Fallback to relative path
  return `/${cleanPath}`
}
