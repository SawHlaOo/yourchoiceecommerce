import { useState } from 'react';
import { Icon } from './components/ui';

export default function SearchAppBar() {
  const [search, setSearch] = useState('');
  return <header className="rounded-xl bg-blue-600 p-3 text-white"><div className="flex items-center gap-3"><button type="button" aria-label="Open menu" className="rounded-lg p-2 hover:bg-blue-500"><Icon name="menu" /></button><span className="hidden font-bold sm:block">ShopInMgSaw</span><label className="relative ml-auto block w-full max-w-xs"><Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search…" aria-label="search" className="w-full rounded-lg bg-blue-500 py-2 pl-10 pr-3 text-white placeholder:text-blue-100 outline-none" /></label></div></header>;
}
