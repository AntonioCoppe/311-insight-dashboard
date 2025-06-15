import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import App from '../App';
import MapPage from './MapPage';
import StatisticsPage from './StatisticsPage';
import AboutPage from './AboutPage';

const pages: Record<string, JSX.Element> = {
  '/': <App />,
  '/map': <MapPage />,
  '/statistics': <StatisticsPage />,
  '/about': <AboutPage />,
};

export default function PageCache() {
  const location = useLocation();
  const [loaded, setLoaded] = useState<string[]>([]);

  useEffect(() => {
    if (!loaded.includes(location.pathname) && pages[location.pathname]) {
      setLoaded(prev => [...prev, location.pathname]);
    }
  }, [location.pathname, loaded]);

  useEffect(() => {
    const remaining = Object.keys(pages).filter(p => !loaded.includes(p));
    if (!remaining.length) return;
    const timer = setTimeout(() => {
      setLoaded(prev => [...prev, remaining[0]]);
    }, 300);
    return () => clearTimeout(timer);
  }, [loaded]);

  return (
    <>
      {Object.entries(pages).map(([path, element]) =>
        loaded.includes(path) ? (
          <div key={path} style={{ display: path === location.pathname ? 'block' : 'none' }}>
            {element}
          </div>
        ) : null
      )}
    </>
  );
}
