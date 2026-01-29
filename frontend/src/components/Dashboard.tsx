import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const displayName = user?.email ?? 'Unknown user';
  const role = user?.role ?? 'Unknown role';

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h2>
      <p className="text-gray-500 mb-6 text-sm">This is a temporary placeholder.</p>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">User</span>
          <span className="font-medium text-gray-800">{displayName}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Role</span>
          <span className="font-medium text-gray-800">{role}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void logout()}
        className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all duration-200"
      >
        Log Out
      </button>
    </div>
  );
}
