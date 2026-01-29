import { useEffect, useMemo, useRef, useState } from 'react';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useIdleTimeout } from '../hooks/useIdleTimeout';

const WARNING_IDLE_MS = 2 * 60 * 1000;
const MODAL_IDLE_MS = 3 * 60 * 1000;
const LOGOUT_IDLE_MS = 5 * 60 * 1000;
const WARNING_COUNTDOWN_MS = 60 * 1000;
const MODAL_COUNTDOWN_MS = 30 * 1000;

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [isPinging, setIsPinging] = useState(false);
  const logoutTriggeredRef = useRef(false);

  const displayName = user?.email ?? 'Unknown user';
  const role = user?.role ?? 'Unknown role';
  const { idleMs, resetActivity } = useIdleTimeout();
  const showWarning = idleMs >= WARNING_IDLE_MS && idleMs < MODAL_IDLE_MS;
  const showModal = idleMs >= MODAL_IDLE_MS && idleMs < LOGOUT_IDLE_MS;
  const warningCountdownMs = useMemo(
    () => Math.max(0, WARNING_IDLE_MS + WARNING_COUNTDOWN_MS - idleMs),
    [idleMs],
  );
  const modalCountdownMs = useMemo(
    () => Math.max(0, MODAL_IDLE_MS + MODAL_COUNTDOWN_MS - idleMs),
    [idleMs],
  );

  useEffect(() => {
    if (idleMs >= LOGOUT_IDLE_MS && !logoutTriggeredRef.current) {
      logoutTriggeredRef.current = true;
      void logout();
    } else if (idleMs < LOGOUT_IDLE_MS) {
      logoutTriggeredRef.current = false;
    }
  }, [idleMs, logout]);

  const handleExtend = async () => {
    if (isPinging) return;
    setIsPinging(true);
    try {
      await authApi.ping();
      resetActivity();
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <>
      {showWarning && (
        <div className="w-full max-w-md mb-4 bg-amber-100 border border-amber-300 text-amber-900 px-4 py-3 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Session warning</span>
            <span>{Math.ceil(warningCountdownMs / 1000)}s</span>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Session expiring</h3>
            <p className="text-sm text-gray-600 mb-4">
              You have been idle. Extend your session to stay signed in.
            </p>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span>Extend within</span>
              <span className="font-semibold text-gray-900">
                {Math.ceil(modalCountdownMs / 1000)}s
              </span>
            </div>
            <button
              type="button"
              onClick={() => void handleExtend()}
              disabled={isPinging}
              className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 ${
                isPinging ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700 active:scale-[0.98]'
              }`}
            >
              {isPinging ? 'Extending...' : 'Extend Session'}
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h2>

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
    </>
  );
}
