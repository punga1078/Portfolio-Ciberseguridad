import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    // Evitar trackear rutas del dashboard para no inflar métricas propias
    if (location.pathname.startsWith('/dashboard')) return;

    const trackVisit = async () => {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: location.pathname })
        });
      } catch (error) {
        console.error('Analytics ping failed', error);
      }
    };

    trackVisit();
  }, [location]);

  return null;
}
