import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router';
import { authApi } from '../api/authApi';
import { useApp } from '../appContext';
import { Alert, Button, Card, Field } from '../components/ui';

export default function Login() {
  const { setUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const onSubmit = async (values) => {
    try {
      const response = await authApi.login(values);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      navigate(location.state?.from?.pathname || '/');
    } catch (err) { setError(err.message || 'Unable to sign in'); }
  };
  return <div className="mx-auto max-w-md py-8"><Card className="p-6 sm:p-8">
    <h1 className="text-3xl font-bold">Welcome back</h1>
    <p className="mt-2 text-slate-600 dark:text-slate-400">Sign in to continue your shopping experience.</p>
    {error ? <Alert severity="error" className="mt-4">{error}</Alert> : null}
    <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Field label="Username" autoComplete="username" {...register('username', { required: 'Username is required' })} error={errors.username?.message} />
      <Field label="Password" type="password" autoComplete="current-password" {...register('password', { required: 'Password is required' })} error={errors.password?.message} />
      <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in'}</Button>
    </form>
  </Card></div>;
}
