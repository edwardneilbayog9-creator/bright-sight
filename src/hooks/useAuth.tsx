import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { useDatabase } from '@/lib/db';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'brightsight_current_user_id';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isReady, userRepository } = useDatabase();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isReady || !userRepository) return;

    // Restore user session from sessionStorage
    const storedUserId = sessionStorage.getItem(CURRENT_USER_KEY);
    if (storedUserId) {
      const foundUser = userRepository.findById(storedUserId);
      if (foundUser) {
        setUser(foundUser);
      } else {
        // User no longer exists, clear session
        sessionStorage.removeItem(CURRENT_USER_KEY);
      }
    }
    setIsLoading(false);
  }, [isReady, userRepository]);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!userRepository) return false;

    const isValid = userRepository.validatePassword(email, password);
    if (!isValid) return false;

    const foundUser = userRepository.findByEmail(email);
    if (foundUser) {
      setUser(foundUser);
      sessionStorage.setItem(CURRENT_USER_KEY, foundUser.id);
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    if (!userRepository) return false;

    // Check if user already exists
    const existing = userRepository.findByEmail(email);
    if (existing) return false;

    try {
      const newUser = userRepository.create(
        {
          email,
          name,
          role: 'technician',
        },
        password
      );

      setUser(newUser);
      sessionStorage.setItem(CURRENT_USER_KEY, newUser.id);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(CURRENT_USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
