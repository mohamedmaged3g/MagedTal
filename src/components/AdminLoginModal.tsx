import React, { useState } from 'react';
import { Lock, ShieldCheck, X } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (password: string) => Promise<void>;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password.trim()) {
      setError('يرجى إدخال كلمة مرور الإدارة.');
      return;
    }

    setSubmitting(true);
    try {
      await onLogin(password);
      setPassword('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'تعذر تسجيل الدخول، حاول مرة أخرى.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 dark:bg-black/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-login-title"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </span>
            <div>
              <h2
                id="admin-login-title"
                className="text-sm font-bold text-slate-900 dark:text-slate-100"
              >
                دخول بوابة إدارة الورشة
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                منطقة محمية لإدارة أوامر الشغل ورسائل العملاء
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق نافذة تسجيل الدخول"
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="admin-password-input"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              كلمة مرور الإدارة
            </label>
            <input
              id="admin-password-input"
              type="password"
              autoFocus
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة مرور لوحة التحكم"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-950"
            />
          </div>

          <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
            <span>
              يتم التحقق عبر الخادم مع جلسة آمنة، ويمكنك تغيير كلمة المرور في أي وقت عبر متغير{' '}
              <code className="font-mono text-slate-800 dark:text-slate-200">
                ADMIN_PASSWORD
              </code>{' '}
              في إعدادات Vercel.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors"
            >
              {submitting ? 'جاري التحقق...' : 'دخول لوحة الإدارة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
