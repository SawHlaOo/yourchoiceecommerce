import { Link } from 'react-router';
import { Button } from '../components/ui';
export default function NotFound() { return <div className="mx-auto max-w-md py-16 text-center"><h1 className="text-8xl font-black text-blue-600">404</h1><h2 className="mt-4 text-2xl font-bold">This page seems to be missing.</h2><p className="my-3 text-slate-500">The route you requested could not be found.</p><Button as={Link} to="/">Go home</Button></div>; }
