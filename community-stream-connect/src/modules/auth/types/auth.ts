/**
 * Auth Module Types
 * Tipos y interfaces para el sistema de autenticación
 */

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  provider: 'google' | 'facebook' | 'apple' | 'email';
  createdAt: Date;
  lastLogin: Date;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
  signIn: (provider: 'google' | 'facebook' | 'apple') => Promise<void>;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
