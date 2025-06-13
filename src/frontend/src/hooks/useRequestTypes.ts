import { useState, useEffect } from 'react';
import axios from 'axios';

export function useRequestTypes() {
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get<string[]>(`${process.env.REACT_APP_API_URL}/api/requests/types`)
      .then(res => setTypes(res.data))
      .catch(err => setError('Failed to fetch request types'))
      .finally(() => setLoading(false));
  }, []);

  return { types, loading, error };
}
