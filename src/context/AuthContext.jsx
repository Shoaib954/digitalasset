/* ============================================
   DigiAsset — Auth Context
   Manages authentication state globally
   ============================================ */
import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getProfile, updateProfile as updateProfileApi } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

// Custom hook to access auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking token

  // On mount: check if token exists and load user profile
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('digiasset_token');
      if (token) {
        try {
          const res = await getProfile();
          setUser(res.data.user || res.data);
        } catch {
          // Token invalid or expired — clear it
          localStorage.removeItem('digiasset_token');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  // Login with email and password
  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('digiasset_token', token);
    setUser(userData);
    toast.success('Welcome back!');
    return userData;
  };

  // Register a new user
  const register = async (userData) => {
    const res = await registerUser(userData);
    const { token, user: newUser } = res.data;
    localStorage.setItem('digiasset_token', token);
    setUser(newUser);
    toast.success('Account created successfully!');
    return newUser;
  };

  // Logout — clear everything
  const logout = () => {
    localStorage.removeItem('digiasset_token');
    setUser(null);
    toast.info('Logged out');
  };

  // Update user profile
  const updateUserProfile = async (data) => {
    const res = await updateProfileApi(data);
    const updated = res.data.user || res.data;
    setUser(updated);
    toast.success('Profile updated');
    return updated;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile: updateUserProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
