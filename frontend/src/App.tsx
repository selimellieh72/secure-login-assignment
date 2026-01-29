import AuthForm from './components/AuthForm';
import { useEffect } from 'react';
import Dashboard from './components/Dashboard.tsx';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    document.title = 'Secure Login Portal';
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2 drop-shadow-sm">
          Secure Login Portal
        </h1>
        <p className="text-gray-500 font-medium">Authentication System</p>
      </div>
      
      <main
        className="w-full flex items-center justify-center"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <div className="text-gray-500 font-medium" role="status" aria-live="polite">
            Loading...
          </div>
        ) : isAuthenticated ? (
          <Dashboard />
        ) : (
          <AuthForm />
        )}
      </main>
      
      <footer className="mt-12 text-gray-400 text-sm" role="contentinfo">
        &copy; {new Date().getFullYear()} Secure Login System. All rights reserved.
      </footer>
    </div>
  )
}

export default App
