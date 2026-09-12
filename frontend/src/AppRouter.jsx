import { createBrowserRouter, RouterProvider, useLocation } from 'react-router';
import { lazy, Suspense } from 'react';
import { Spinner } from './components/ui';
import App from './App';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

const Admin = lazy(() => import('./pages/Admin'));
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const ProductCardDetail = lazy(() => import('./pages/ProductCardDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Register = lazy(() => import('./pages/Register'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const WishlistAccess = lazy(() => import('./pages/WishlistAccess'));

function page(Component, key) {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Spinner label="Loading page" /></div>}>
      <Component key={key} />
    </Suspense>
  );
}

function HomeRoute() {
  const location = useLocation();
  return page(Home, location.key);
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <HomeRoute /> },
      { path: 'login', element: page(Login) },
      { path: 'register', element: page(Register) },
      { path: 'wishlist-access', element: page(WishlistAccess) },
      { path: 'product-card/:id', element: page(ProductCardDetail) },
      { path: 'product/:type/:id', element: page(ProductCardDetail) },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'profile/:id', element: page(Profile) },
          { path: 'wishlist', element: page(Wishlist) },
          {
            path: 'admin',
            element: <ProtectedRoute requiredRole="ADMIN" />,
            children: [{ index: true, element: page(Admin) }]
          }
        ]
      }
    ]
  }
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
