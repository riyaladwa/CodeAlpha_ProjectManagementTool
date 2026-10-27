import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Initialize auth on application mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('taskflow_token');
        if (token) {
          const { data } = await api.get('/auth/me');
          if (data.success && data.user) {
            setUser(data.user);
            await fetchWorkspaces();
          }
        }
      } catch (err) {
        console.warn('Session check failed or expired:', err.userMessage || err.message);
        localStorage.removeItem('taskflow_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Fetch workspaces for current user
  const fetchWorkspaces = async () => {
    try {
      const { data } = await api.get('/workspaces');
      if (data.success && data.workspaces) {
        setWorkspaces(data.workspaces);

        // Select previously stored active workspace or first available
        const savedWsId = localStorage.getItem('taskflow_active_workspace_id');
        let matched = data.workspaces.find((w) => w._id === savedWsId);
        if (!matched && data.workspaces.length > 0) {
          matched = data.workspaces[0];
        }

        if (matched) {
          setCurrentWorkspace(matched);
          localStorage.setItem('taskflow_active_workspace_id', matched._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch workspaces:', err);
    }
  };

  // Login handler
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem('taskflow_token', data.token);
        setUser(data.user);
        await fetchWorkspaces();
        toast.success(`Welcome back, ${data.user.name}!`);
        return { success: true };
      }
    } catch (error) {
      const msg = error.userMessage || 'Login failed. Please check your credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Register handler
  const register = async (name, email, password, title) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password, title });
      if (data.success) {
        localStorage.setItem('taskflow_token', data.token);
        setUser(data.user);
        await fetchWorkspaces();
        toast.success(`Account created! Welcome to TaskFlow AI, ${data.user.name}.`);
        return { success: true };
      }
    } catch (error) {
      const msg = error.userMessage || 'Registration failed.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Demo 1-click mode handler
  const exploreDemo = async () => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/demo');
      if (data.success) {
        localStorage.setItem('taskflow_token', data.token);
        setUser(data.user);
        await fetchWorkspaces();
        toast.success('Logged in as Demo Product Lead. Explore all features freely!');
        return { success: true };
      }
    } catch (error) {
      const msg = error.userMessage || 'Demo mode failed to initialize.';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // ignore
    } finally {
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_active_workspace_id');
      setUser(null);
      setWorkspaces([]);
      setCurrentWorkspace(null);
      toast.info('You have been logged out.');
    }
  };

  // Switch active workspace
  const switchWorkspace = (workspace) => {
    setCurrentWorkspace(workspace);
    localStorage.setItem('taskflow_active_workspace_id', workspace._id);
    toast.info(`Switched to workspace "${workspace.name}"`);
  };

  // Create new workspace
  const createWorkspace = async (name, description) => {
    try {
      const { data } = await api.post('/workspaces', { name, description });
      if (data.success) {
        await fetchWorkspaces();
        switchWorkspace(data.workspace);
        toast.success(`Workspace "${name}" created successfully!`);
        return { success: true, workspace: data.workspace };
      }
    } catch (error) {
      const msg = error.userMessage || 'Failed to create workspace.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Update profile
  const updateProfile = async (updates) => {
    try {
      const { data } = await api.patch('/auth/profile', updates);
      if (data.success) {
        setUser(data.user);
        toast.success('Profile updated successfully.');
        return { success: true, user: data.user };
      }
    } catch (error) {
      const msg = error.userMessage || 'Failed to update profile.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const { data } = await api.post('/auth/change-password', { currentPassword, newPassword });
      if (data.success) {
        toast.success('Password changed successfully.');
        return { success: true };
      }
    } catch (error) {
      const msg = error.userMessage || 'Failed to change password.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Update preferences
  const updatePreferences = async (preferences) => {
    try {
      const { data } = await api.patch('/auth/preferences', { preferences });
      if (data.success) {
        setUser((prev) => ({ ...prev, preferences: data.preferences }));
        toast.success('Preferences saved.');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.userMessage || 'Failed to update preferences.');
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspaces,
        currentWorkspace,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        exploreDemo,
        logout,
        switchWorkspace,
        createWorkspace,
        updateProfile,
        changePassword,
        updatePreferences,
        refreshUserData: fetchWorkspaces,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
