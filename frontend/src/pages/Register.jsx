import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { authApi } from '../api/authApi';
import { useApp } from '../appContext';
import { Alert, Button, Card, Field } from '../components/ui';

export default function Register() {
  const { setUser } = useApp();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const onSubmit = async (values) => {
    try {
      const response = await authApi.register({ ...values, role: 'USER' });
      localStorage.setItem('token', response.token || '');
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      navigate('/');
    } catch (err) { setError(err.message || 'Unable to create account'); }
  };
  return <div className="mx-auto max-w-md py-8"><Card className="p-6 sm:p-8">
    <h1 className="text-3xl font-bold">Create an account</h1>
    <p className="mt-2 text-slate-600 dark:text-slate-400">Join Digitalshop to grab the best offers.</p>
    {error ? <Alert severity="error" className="mt-4">{error}</Alert> : null}
    <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Field label="Name" autoComplete="name" {...register('name', { required: 'Name is required' })} error={errors.name?.message} />
      <Field label="Username" autoComplete="username" {...register('username', { required: 'Username is required', minLength: { value: 3, message: 'Username must be at least 3 characters' } })} error={errors.username?.message} />
      <Field label="Email" type="email" autoComplete="email" {...register('email', { required: 'Email is required' })} error={errors.email?.message} />
      <Field label="Password" type="password" autoComplete="new-password" {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })} error={errors.password?.message} />
      <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Creating…' : 'Create account'}</Button>
    </form>
  </Card></div>;
}
