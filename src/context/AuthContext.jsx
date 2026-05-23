import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      const loginTime = localStorage.getItem('loginTime');
      
      if (token) {
        try {
          const res = await api.get('/auth/me');
          const userData = res.data;
          
          if (loginTime && userData.role !== 'ADMIN') {
            const hoursElapsed = (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60);
            if (hoursElapsed >= 3) {
              logout();
              setLoading(false);
              return;
            }
          }
          
          setUser(userData);
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('loginTime');
        }
      }
      setLoading(false);
    };
    checkUser();

    // Background check every minute to handle auto-logout if the tab stays open
    const interval = setInterval(() => {
      const loginTime = localStorage.getItem('loginTime');
      if (loginTime && user && user.role !== 'ADMIN') {
        const hoursElapsed = (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60);
        if (hoursElapsed >= 3) {
          logout();
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);

  const completeAuth = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('loginTime', Date.now().toString());
    setUser(userData);
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) {
      completeAuth(res.data.user, res.data.token);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loginTime');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, completeAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

