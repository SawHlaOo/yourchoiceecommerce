import { useEffect, useState } from 'react';
import { authApi } from '../api/authApi';
import { Alert, Card, Icon, Spinner } from '../components/ui';

export default function Profile() {
  const [user, setUser] = useState(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { authApi.verify().then((response) => setUser(response.user ?? response)).catch((err) => setError(err.message || 'Unable to load profile')).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;
  return <div className="mx-auto max-w-2xl py-8"><Card className="p-6 sm:p-8"><div className="flex flex-col items-center gap-4 sm:flex-row">
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white"><Icon name="user" size={34} /></div>
    <div><h1 className="text-3xl font-bold">{user?.name || 'Your profile'}</h1><p className="text-slate-500">{user?.email || user?.username}</p><p className="mt-1">{user?.role || 'USER'}</p></div>
  </div>{error ? <Alert severity="error" className="mt-6">{error}</Alert> : null}</Card></div>;
}
