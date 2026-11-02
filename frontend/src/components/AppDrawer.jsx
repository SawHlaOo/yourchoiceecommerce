import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { productApi } from '../api/productApi';
import { useApp } from '../appContext';
import { Icon } from './ui';

function NavItem({ icon, children, onClick }) {
  return <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-300"><Icon name={icon} size={19} /><span>{children}</span></button>;
}

export default function AppDrawer() {
  const { openDrawer, setOpenDrawer, user, setUser } = useApp();
  const navigate = useNavigate();
  const isAuthenticated = Boolean(user);
  const wishlist = useQuery({ queryKey: ['wishlist'], queryFn: productApi.listWishlist, enabled: isAuthenticated, select: (response) => response?.data ?? [] });
  const close = () => setOpenDrawer(false);
  const go = (path, options) => { close(); navigate(path, options); };
  const openWishlist = () => {
    if (isAuthenticated) {
      go('/wishlist');
    } else {
      go('/wishlist-access');
    }
  };
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); go('/'); };

  return (
    <>
      {openDrawer ? <button type="button" aria-label="Close navigation" className="fixed inset-0 z-40 bg-slate-950/40" onClick={close} /> : null}
      <aside aria-label="Navigation menu" className={`fixed inset-y-0 left-0 z-50 w-80 transform border-r border-slate-200/80 bg-white p-5 shadow-2xl transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 ${openDrawer ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-8 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600 dark:text-blue-400">Your Choice</p><span className="text-xl font-black">Menu</span></div><button type="button" onClick={close} aria-label="Close navigation" className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"><Icon name="close" /></button></div>
        <nav className="space-y-1">
          <NavItem icon="home" onClick={() => go('/', { state: { resetHome: true } })}>Home</NavItem>
          {isAuthenticated ? <NavItem icon="user" onClick={() => go(`/profile/${user.id}`)}>Profile</NavItem> : <NavItem icon="login" onClick={() => go('/login')}>Sign in</NavItem>}
          {user?.role === 'ADMIN' ? <NavItem icon="shield" onClick={() => go('/admin')}>Admin</NavItem> : null}
          <NavItem icon="heart" onClick={openWishlist}>Wishlist{isAuthenticated && wishlist.data?.length ? ` (${wishlist.data.length})` : ''}</NavItem>
          {!isAuthenticated ? <NavItem icon="userPlus" onClick={() => go('/register')}>Sign up</NavItem> : null}
          {isAuthenticated ? <><div className="my-4 border-t" /><NavItem icon="logout" onClick={handleLogout}>Logout</NavItem></> : null}
        </nav>
      </aside>
    </>
  );
}
