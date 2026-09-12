import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../appContext';
import { Button, Card, Icon } from '../components/ui';

export default function WishlistAccess() {
  const { user } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/wishlist', { replace: true });
  }, [navigate, user]);

  if (user) return null;

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-10">
      <Card className="w-full max-w-xl overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-10 text-center text-white sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
            <Icon name="heartFilled" size={32} />
          </div>
          <h1 className="mt-5 text-3xl font-black sm:text-4xl">Your wishlist is waiting</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-blue-100 sm:text-base">
            Save products you love and come back to them anytime. Sign in or create an account to start building your wishlist.
          </p>
        </div>
        <div className="space-y-4 px-6 py-7 sm:px-10 sm:py-8">
          <Button className="w-full" onClick={() => navigate('/login', { state: { from: { pathname: '/wishlist' } } })}>Sign in to continue</Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/register')}>Create a free account</Button>
          <button type="button" className="w-full pt-2 text-center text-sm font-semibold text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400" onClick={() => navigate('/')}>
            Continue shopping
          </button>
        </div>
      </Card>
    </div>
  );
}
