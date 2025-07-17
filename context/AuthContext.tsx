import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '@/database/database';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  signup: (name: string, email: string, password: string, phone: string, dateOfBirth: string, country: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // In a real app, you'd check for stored tokens/session
      // For now, we'll just set loading to false
      setIsLoading(false);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const validUser = await database.validateUser(email, password);
      
      if (validUser) {
        const userData: User = {
          id: validUser.id.toString(),
          name: validUser.name,
          email: validUser.email,
          role: validUser.role as 'customer' | 'admin',
          avatar: validUser.avatar || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
        };
        
        setUser(userData);
        
        // Record login
        await database.recordLogin(validUser.id, '127.0.0.1', 'Mobile App');
        
        return { success: true, user: userData };
      } else {
        return { success: false, message: 'Invalid email or password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const signup = async (name: string, email: string, password: string, phone: string, dateOfBirth: string, country: string) => {
    try {
      const userId = await database.createUser({
        name,
        email,
        password,
        phone,
        dateOfBirth,
        country,
        role: 'customer'
      });

      if (userId) {
        const userData: User = {
          id: userId.toString(),
          name,
          email,
          role: 'customer',
          avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
        };
        
        setUser(userData);
        return { success: true, user: userData };
      } else {
        return { success: false, message: 'Failed to create account' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Signup failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
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