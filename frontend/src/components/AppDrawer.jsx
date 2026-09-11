import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { productApi } from '../api/productApi';
import { useApp } from '../appContext';
import { Icon } from './ui';

function NavItem({ icon, children, onClick }) {
  return <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"><Icon name={icon} size={19} /><span>{children}</span></button>;
}

export default function AppDrawer() {
  const { openDrawer, setOpenDrawer, user, setUser } = useApp();
  const navigate = useNavigate();
  const isAuthenticated = Boolean(user);
  const wishlist = useQuery({ queryKey: ['wishlist'], queryFn: productApi.listWishlist, enabled: isAuthenticated, select: (response) => response?.data ?? [] });
  const close = () => setOpenDrawer(false);
  const go = (path, options) => { close(); navigate(path, options); };
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); go('/'); };

  return (
    <>
      {openDrawer ? <button type="button" aria-label="Close navigation" className="fixed inset-0 z-40 bg-slate-950/40" onClick={close} /> : null}
      <aside aria-label="Navigation menu" className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white p-4 shadow-xl transition-transform dark:bg-slate-900 ${openDrawer ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-6 flex items-center justify-between"><span className="text-lg font-bold">Menu</span><button type="button" onClick={close} aria-label="Close navigation" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><Icon name="close" /></button></div>
        <nav className="space-y-1">
          <NavItem icon="home" onClick={() => go('/', { state: { resetHome: true } })}>Home</NavItem>
          {isAuthenticated ? <NavItem icon="user" onClick={() => go(`/profile/${user.id}`)}>Profile</NavItem> : <NavItem icon="login" onClick={() => go('/login')}>Login</NavItem>}
          {user?.role === 'ADMIN' ? <NavItem icon="shield" onClick={() => go('/admin')}>Admin</NavItem> : null}
          <NavItem icon="heart" onClick={() => go(isAuthenticated ? '/wishlist' : '/register')}>Wishlist{isAuthenticated && wishlist.data?.length ? ` (${wishlist.data.length})` : ''}</NavItem>
          {!isAuthenticated ? <NavItem icon="userPlus" onClick={() => go('/register')}>Register</NavItem> : null}
          {isAuthenticated ? <><div className="my-4 border-t" /><NavItem icon="logout" onClick={handleLogout}>Logout</NavItem></> : null}
        </nav>
      </aside>
    </>
  );
}
