import { Outlet } from 'react-router';
import Header from './components/Header';
import AppDrawer from './components/AppDrawer';

const socialLinks = [
  { label: 'YouTube', href: import.meta.env.VITE_YOUTUBE_URL?.trim() || 'https://www.youtube.com/', icon: '▶' },
  { label: 'TikTok', href: import.meta.env.VITE_TIKTOK_URL?.trim() || 'https://www.tiktok.com/', icon: '♪' },
  { label: 'Instagram', href: import.meta.env.VITE_INSTAGRAM_URL?.trim() || 'https://www.instagram.com/', icon: '◎' },
  { label: 'Facebook', href: import.meta.env.VITE_FACEBOOK_URL?.trim() || 'https://www.facebook.com/', icon: 'f' },
];

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <AppDrawer />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white/80 py-6 dark:border-slate-700 dark:bg-slate-900/80">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:px-6 lg:flex-row lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-medium">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-slate-700 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-300" aria-label={link.label}>
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{link.icon}</span>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
