import React, { useEffect, useState } from 'react';
import { AlertTriangle, Eye, EyeOff, ShieldCheck, X } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  usingDefaultPassword?: boolean;
  passwordSource?: 'dashboard' | 'env' | 'default';
  onClose: () => void;
  onLogin: (password: string) => Promise<void>;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  usingDefaultPassword,
  passwordSource,
  onClose,
  onLogin,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setShowPassword(false);
      setCapsLockOn(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const hasArabicChars = /[\u0600-\u06FF]/.test(password);

  const handleKeyCheck = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === 'function') {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

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
            <img
              src="/assets/aistudio/image_3de2cff6.png"
              alt="شعار ماجدتال"
              className="w-10 h-10 rounded-lg bg-white p-0.5 object-contain border border-slate-200 dark:border-slate-700 shrink-0"
            />
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
            <div className="p-3 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg leading-relaxed">
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
            <div className="relative">
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                dir="ltr"
                autoComplete="current-password"
                autoFocus
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={handleKeyCheck}
                onKeyUp={handleKeyCheck}
                placeholder="أدخل كلمة مرور لوحة التحكم"
                className="w-full pl-3.5 pr-10 py-2.5 text-sm text-right bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-950"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                className="absolute inset-y-0 right-2 flex items-center px-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {(hasArabicChars || capsLockOn) && (
              <div className="mt-2 space-y-1">
                {hasArabicChars && (
                  <p className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      لوحة المفاتيح تكتب باللغة العربية حالياً — تأكد من التحويل للغة الإنجليزية إذا كانت كلمة المرور بحروف أو أرقام إنجليزية.
                    </span>
                  </p>
                )}
                {capsLockOn && (
                  <p className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>مفتاح الأحرف الكبيرة (Caps Lock) مفعل حالياً.</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
            <span>
              {passwordSource === 'dashboard' ? (
                <>
                  يتم التحقق باستخدام كلمة المرور التي قمت بتعيينها من داخل{' '}
                  <strong>لوحة المدير &larr; الأمان وكلمة المرور</strong>.
                </>
              ) : usingDefaultPassword === false ? (
                <>
                  كلمة المرور المفعّلة حالياً مأخوذة من متغير{' '}
                  <code className="font-mono text-slate-800 dark:text-slate-200">
                    ADMIN_PASSWORD
                  </code>{' '}
                  ويمكنك تغييرها بسهولة بعد الدخول من قسم{' '}
                  <strong>الأمان وكلمة المرور</strong> داخل لوحة المدير.
                </>
              ) : (
                <>
                  يتم التحقق عبر الخادم مع جلسة آمنة، ويمكنك تغيير كلمة المرور في أي وقت مباشرة من داخل{' '}
                  <strong>لوحة المدير &larr; الأمان وكلمة المرور</strong>.
                </>
              )}
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
