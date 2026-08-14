import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserSettings } from '../services/settings';
import { configureTMDB, getTMDBRegion } from '../services/tmdb';

const LANG_MAP = { en: 'en-US', ja: 'ja-JP', es: 'es-ES', fr: 'fr-FR', hi: 'hi-IN' };

export default function useUserSettings() {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) {
      configureTMDB({});
      setSettings(null);
      setLoading(false);
      return;
    }
    getUserSettings(currentUser.uid)
      .then(data => {
        setSettings(data);
        configureTMDB({
          region: data.watchProviderRegion || 'IN',
          language: LANG_MAP[data.preferredContentLanguage] || LANG_MAP[data.preferredLanguage] || 'en-US',
        });
      })
      .finally(() => setLoading(false));
  }, [currentUser?.uid]);

  return {
    settings,
    loading,
    watchProviderRegion: settings?.watchProviderRegion || getTMDBRegion(),
  };
}
