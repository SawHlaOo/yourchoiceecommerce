import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router';
import { productApi } from '../api/productApi';
import { useApp } from '../appContext';
import { Button, Icon } from './ui';

export default function Header() {
  const { mode, setMode, setOpenDrawer, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const wishlist = useQuery({ queryKey: ['wishlist'], queryFn: productApi.listWishlist, enabled: Boolean(user), select: (response) => response?.data ?? [] });
  const isAdmin = user?.role === 'ADMIN';
  const openWishlist = () => {
    if (user) {
      navigate('/wishlist');
    } else {
      navigate('/wishlist-access');
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-white/95 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <button type="button" aria-label="Open navigation" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setOpenDrawer(true)}><Icon name="menu" /></button>
        <button type="button" onClick={() => navigate('/', { state: { resetHome: true } })} className="mr-auto text-left text-lg font-extrabold tracking-tight text-blue-600 dark:text-blue-400">Your Choice</button>
        <nav className="hidden items-center gap-1 sm:flex">
          {user ? <Button variant="ghost" onClick={() => navigate(`/profile/${user.id}`)}>Profile</Button> : <><Button variant="ghost" onClick={() => navigate('/login')}>Sign in</Button><Button variant="ghost" onClick={() => navigate('/register')}>Sign up</Button></>}
          {isAdmin && location.pathname !== '/admin' ? <Button variant="ghost" onClick={() => navigate('/admin')}>Admin</Button> : null}
          <Button variant="ghost" onClick={openWishlist}><Icon name="heart" size={17} />Wishlist{user && wishlist.data?.length ? ` (${wishlist.data.length})` : ''}</Button>
        </nav>
        <nav className="flex items-center gap-0.5 sm:hidden" aria-label="Quick navigation">
          <button type="button" aria-label={user ? 'Open profile' : 'Open login'} className="rounded-lg p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-600 active:scale-90 dark:text-slate-300 dark:hover:bg-slate-800" onClick={() => navigate(user ? `/profile/${user.id}` : '/login')}><Icon name="user" size={18} /></button>
          {isAdmin ? <button type="button" aria-label="Open admin dashboard" className="rounded-lg p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-600 active:scale-90 dark:text-slate-300 dark:hover:bg-slate-800" onClick={() => navigate('/admin')}><Icon name="shield" size={18} /></button> : null}
          <button type="button" aria-label="Open wishlist" className="relative rounded-lg p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-600 active:scale-90 dark:text-slate-300 dark:hover:bg-slate-800" onClick={openWishlist}><Icon name="heart" size={18} />{user && wishlist.data?.length ? <span className="absolute right-0.5 top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-blue-600 px-0.5 text-[9px] font-bold text-white">{wishlist.data.length}</span> : null}</button>
        </nav>
        <button type="button" aria-label="Toggle color theme" className="rounded-lg p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-600 active:scale-90 dark:text-slate-300 dark:hover:bg-slate-800" onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}><Icon name={mode === 'dark' ? 'sun' : 'moon'} /></button>
      </div>
    </header>
  );
}
