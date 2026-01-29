import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { login, register: registerUser } = useAuth();

  const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as { error?: string; message?: string } | undefined;
      return data?.error || data?.message || error.message || 'Something went wrong';
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Something went wrong';
  };
  
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
    reset: resetLogin
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    formState: { errors: signupErrors, isSubmitting: isRegisterSubmitting },
    reset: resetSignup
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setSubmitError(null);
    try {
      await login(data);
      resetLogin();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setSubmitError(null);
    try {
      const { confirmPassword, ...payload } = data;
      await registerUser(payload);
      resetSignup();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setSubmitError(null);
    resetLogin();
    resetSignup();
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 transform hover:shadow-2xl">
      {/* Header / Toggle */}
      <div className="flex">
        <button
          onClick={() => !isLogin && toggleMode()}
          className={`flex-1 py-4 text-center font-semibold transition-colors duration-200 ${
            isLogin
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => isLogin && toggleMode()}
          className={`flex-1 py-4 text-center font-semibold transition-colors duration-200 ${
            !isLogin
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          Register
        </button>
      </div>

      <div className="p-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            {isLogin
              ? 'Enter your credentials to access your account'
              : 'Sign up to get started with our service'}
          </p>
        </div>

        {isLogin ? (
          <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                {...registerLogin('email')}
                type="email"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
                  loginErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 focus:bg-white'
                }`}
                placeholder="you@example.com"
              />
              {loginErrors.email && (
                <p className="mt-1 text-xs text-red-500">{loginErrors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                {...registerLogin('password')}
                type="password"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
                  loginErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 focus:bg-white'
                }`}
                placeholder="••••••••"
              />
              {loginErrors.password && (
                <p className="mt-1 text-xs text-red-500">{loginErrors.password.message}</p>
              )}
            </div>


            {submitError && (
              <p className="text-sm text-red-600">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={isLoginSubmitting}
              className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30 ${
                isLoginSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 active:scale-[0.98]'
              }`}
            >
              {isLoginSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitSignup(onRegisterSubmit)} className="space-y-5">
  

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                {...registerSignup('email')}
                type="email"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
                  signupErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 focus:bg-white'
                }`}
                placeholder="you@example.com"
              />
              {signupErrors.email && (
                <p className="mt-1 text-xs text-red-500">{signupErrors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                {...registerSignup('password')}
                type="password"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
                  signupErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 focus:bg-white'
                }`}
                placeholder="••••••••"
              />
              {signupErrors.password && (
                <p className="mt-1 text-xs text-red-500">{signupErrors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                {...registerSignup('confirmPassword')}
                type="password"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${
                  signupErrors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 focus:bg-white'
                }`}
                placeholder="••••••••"
              />
              {signupErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{signupErrors.confirmPassword.message}</p>
              )}
            </div>

            {submitError && (
              <p className="text-sm text-red-600">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={isRegisterSubmitting}
              className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30 ${
                isRegisterSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 active:scale-[0.98]'
              }`}
            >
              {isRegisterSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
