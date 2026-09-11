import { useState } from 'react';
import { Icon } from './ui';

export default function BasicMenu() {
  const [open, setOpen] = useState(false);
  return <div className="relative"><button type="button" aria-expanded={open} aria-label="Open menu" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setOpen(!open)}><Icon name="menu" /></button>{open ? <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border bg-white p-2 shadow-lg dark:bg-slate-900"><button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setOpen(false)}>Profile</button><button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setOpen(false)}>My account</button><button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setOpen(false)}>Logout</button></div> : null}</div>;
}
