import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'eyecare_users';
const CURRENT_USER_KEY = 'eyecare_current_user';
const INITIALIZED_KEY = 'eyecare_initialized';

// Default doctor user
const DEFAULT_DOCTOR: User = {
  id: 'default-doctor-001',
  email: 'doctor@clinic.com',
  name: 'Dr. Ophthalmologist',
  role: 'doctor',
  createdAt: new Date().toISOString(),
};
const DEFAULT_DOCTOR_PASSWORD = 'password';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize default doctor on first load
    initializeDefaultUsers();
    
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const initializeDefaultUsers = () => {
    const initialized = localStorage.getItem(INITIALIZED_KEY);
    if (!initialized) {
      const users = getUsers();
      
      // Add default doctor if not exists
      if (!users.find(u => u.email === DEFAULT_DOCTOR.email)) {
        users.push(DEFAULT_DOCTOR);
        saveUsers(users);
        localStorage.setItem(`eyecare_pwd_${DEFAULT_DOCTOR.email}`, DEFAULT_DOCTOR_PASSWORD);
      }
      
      localStorage.setItem(INITIALIZED_KEY, 'true');
    }
  };

  const getUsers = (): User[] => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = getUsers();
    // Simple password check using stored hash (in real app, use proper auth)
    const passwordKey = `eyecare_pwd_${email}`;
    const storedPassword = localStorage.getItem(passwordKey);
    
    if (storedPassword !== password) {
      return false;
    }

    const foundUser = users.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    const users = getUsers();
    
    if (users.find(u => u.email === email)) {
      return false;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      role: 'technician',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);
    
    // Store password
    localStorage.setItem(`eyecare_pwd_${email}`, password);
    
    setUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
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
