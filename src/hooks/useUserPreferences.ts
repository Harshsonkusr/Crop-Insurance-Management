import { useState, useEffect } from 'react';
import api from '../lib/api';

interface UserPreferences {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  language: string;
  notifications: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await api.get('/preferences');
      setPreferences(response.data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      // Set defaults if fetch fails
      setPreferences({
        sidebarOpen: true,
        theme: 'light',
        language: 'en',
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    try {
      const response = await api.put('/preferences', updates);
      setPreferences(response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  const updateSidebarState = async (sidebarOpen: boolean) => {
    return updatePreferences({ sidebarOpen });
  };

  return {
    preferences,
    loading,
    updatePreferences,
    updateSidebarState,
    refreshPreferences: fetchPreferences,
  };
};

