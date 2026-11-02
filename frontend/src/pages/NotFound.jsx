import { Link } from 'react-router';
import { Button } from '../components/ui';
export default function NotFound() { return <div className="mx-auto max-w-md py-20 text-center"><p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-blue-600">Page not found</p><h1 className="text-8xl font-black tracking-tighter text-blue-600">404</h1><h2 className="mt-4 text-2xl font-black">This page seems to be missing.</h2><p className="my-3 text-slate-500">The route you requested could not be found.</p><Button as={Link} to="/">Go home</Button></div>; }
