import { Outlet } from 'react-router';
import Header from './components/Header';
import AppDrawer from './components/AppDrawer';

export default function App() {
  return (
    <>
      <Header />
      <AppDrawer />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </>
  );
}
