import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  authError: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Simple deterministic hash — NOT cryptographic, but prevents plain-text
 * password storage in localStorage. For production, use a real auth provider.
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit int
  }
  return hash.toString(36);
}

const MIN_PASSWORD_LENGTH = 6;

function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('fuelflow_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('fuelflow_user');
      }
    }
  }, []);

  const clearError = () => setAuthError(null);

  const login = async (email: string, password: string) => {
    setAuthError(null);

    // Basic validation
    if (!email || !password) {
      setAuthError('Email and password are required.');
      throw new Error('Email and password are required.');
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setAuthError(passwordError);
      throw new Error(passwordError);
    }

    // Check if account exists in localStorage
    const storedAccounts = localStorage.getItem('fuelflow_accounts');
    const accounts: Record<string, { name: string; passwordHash: string }> =
      storedAccounts ? JSON.parse(storedAccounts) : {};

    const account = accounts[email.toLowerCase()];
    if (!account) {
      setAuthError('No account found with this email. Please sign up first.');
      throw new Error('Account not found.');
    }

    const inputHash = simpleHash(password);
    if (account.passwordHash !== inputHash) {
      setAuthError('Incorrect password. Please try again.');
      throw new Error('Incorrect password.');
    }

    const loggedInUser = { id: simpleHash(email), email: email.toLowerCase(), name: account.name };
    setUser(loggedInUser);
    localStorage.setItem('fuelflow_user', JSON.stringify(loggedInUser));
  };

  const signup = async (email: string, name: string, password: string) => {
    setAuthError(null);

    if (!email || !name || !password) {
      setAuthError('All fields are required.');
      throw new Error('All fields are required.');
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setAuthError(passwordError);
      throw new Error(passwordError);
    }

    // Check if account already exists
    const storedAccounts = localStorage.getItem('fuelflow_accounts');
    const accounts: Record<string, { name: string; passwordHash: string }> =
      storedAccounts ? JSON.parse(storedAccounts) : {};

    if (accounts[email.toLowerCase()]) {
      setAuthError('An account with this email already exists. Please log in.');
      throw new Error('Account already exists.');
    }

    // Store hashed password
    accounts[email.toLowerCase()] = { name, passwordHash: simpleHash(password) };
    localStorage.setItem('fuelflow_accounts', JSON.stringify(accounts));

    const newUser = { id: simpleHash(email), email: email.toLowerCase(), name };
    setUser(newUser);
    localStorage.setItem('fuelflow_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setAuthError(null);
    localStorage.removeItem('fuelflow_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, authError, clearError }}>
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
