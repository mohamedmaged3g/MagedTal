import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import type { AuthSessionStatus, CustomerProfile } from '../types.ts';

interface SecuritySettingsViewProps {
  authStatus: AuthSessionStatus | null;
  googleProfile: CustomerProfile | null;
  onChangePassword: (payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;
  onResetPasswordToEnv: (currentPassword: string) => Promise<void>;
}

function evaluatePasswordStrength(password: string): {
  label: string;
  barWidth: string;
  colorClass: string;
} {
  if (!password) {
    return { label: '', barWidth: 'w-0', colorClass: 'bg-slate-300' };
  }
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 2) {
    return { label: 'ضعيفة', barWidth: 'w-1/3', colorClass: 'bg-red-500' };
  }
  if (score === 3) {
    return { label: 'متوسطة', barWidth: 'w-2/3', colorClass: 'bg-amber-500' };
  }
  return { label: 'قوية', barWidth: 'w-full', colorClass: 'bg-emerald-600' };
}

export const SecuritySettingsView: React.FC<SecuritySettingsViewProps> = ({
  authStatus,
  googleProfile,
  onChangePassword,
  onResetPasswordToEnv,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Inline reset confirmation state
  const [showResetBox, setShowResetBox] = useState(false);
  const [resetCurrentPassword, setResetCurrentPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const strength = evaluatePasswordStrength(newPassword);
  const hasArabicChars = /[\u0600-\u06FF]/.test(
    `${currentPassword}${newPassword}${confirmPassword}`
  );
  const passwordsMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  const passwordSourceLabel =
    authStatus?.passwordSource === 'dashboard'
      ? 'مُعيّنة مباشرة من لوحة المدير'
      : authStatus?.passwordSource === 'env'
      ? 'متغير البيئة (ADMIN_PASSWORD)'
      : 'كلمة المرور الافتراضية للنظام';

  const handleKeyCheck = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === 'function') {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword.trim()) {
      setError('يرجى إدخال كلمة المرور الحالية.');
      return;
    }
    if (newPassword.trim().length < 6) {
      setError('كلمة المرور الجديدة يجب أن تكون 6 أحرف أو أرقام على الأقل.');
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      setError('تأكيد كلمة المرور الجديدة غير متطابق.');
      return;
    }
    if (currentPassword.trim() === newPassword.trim()) {
      setError('يرجى اختيار كلمة مرور مختلفة عن الحالية.');
      return;
    }

    setSubmitting(true);
    try {
      await onChangePassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(
        'تم تحديث كلمة مرور المدير بنجاح وتجديد جلستك الحالية. سيتم استخدام كلمة المرور الجديدة في عمليات الدخول القادمة.'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'تعذر تحديث كلمة المرور، حاول مرة أخرى.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!resetCurrentPassword.trim()) {
      setError('يرجى إدخال كلمة المرور الحالية لتأكيد الاستعادة.');
      return;
    }

    setResetting(true);
    try {
      await onResetPasswordToEnv(resetCurrentPassword.trim());
      setResetCurrentPassword('');
      setShowResetBox(false);
      setSuccess(
        'تمت استعادة التحقق عبر كلمة مرور إعدادات البيئة (ADMIN_PASSWORD) بنجاح.'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'تعذر استعادة إعدادات كلمة المرور.'
      );
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-xs font-mono">
          <KeyRound className="w-3.5 h-3.5" />
          <span>إعدادات الأمان وصلاحيات الدخول</span>
        </div>
        <h1 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
          التحكم في كلمة مرور المدير
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          يمكنك تغيير كلمة مرور لوحة الإدارة مباشرة من هنا؛ يتم حفظها مشفّرة (Salted Scrypt) وإلغاء جميع الجلسات القديمة تلقائياً مع إبقاء جلستك الحالية نشطة.
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              مصدر كلمة المرور الفعّال حالياً
            </p>
            <p className="mt-1 text-xs font-bold text-slate-900 dark:text-slate-100">
              {passwordSourceLabel}
            </p>
            {authStatus?.passwordUpdatedAt && (
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                آخر تغيير:{' '}
                <span className="font-mono">
                  {new Date(authStatus.passwordUpdatedAt).toLocaleString('ar-EG')}
                </span>
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              حالة تسجيل الدخول بحساب جوجل للعملاء
            </p>
            <p className="mt-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              مفعّل عبر Firebase Authentication
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {googleProfile
                ? `متصل حالياً: ${googleProfile.email}`
                : 'يمكن للعملاء التسجيل وحفظ طلبات المقايسة بحساب جوجل'}
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2.5 p-3.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Change Password Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 space-y-5"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-700 dark:text-blue-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            تغيير كلمة مرور لوحة المدير
          </h2>
        </div>

        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label
              htmlFor="sec-current-password"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              كلمة المرور الحالية
            </label>
            <div className="relative">
              <input
                id="sec-current-password"
                type={showCurrent ? 'text' : 'password'}
                dir="ltr"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={handleKeyCheck}
                onKeyUp={handleKeyCheck}
                placeholder="أدخل كلمة المرور الحالية"
                className="w-full pl-3.5 pr-10 py-2.5 text-sm text-right bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((prev) => !prev)}
                aria-label={showCurrent ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                className="absolute inset-y-0 right-2 flex items-center px-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="sec-new-password"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                كلمة المرور الجديدة (6 أحرف على الأقل)
              </label>
              {strength.label && (
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  القوة: {strength.label}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id="sec-new-password"
                type={showNew ? 'text' : 'password'}
                dir="ltr"
                autoComplete="new-password"
                required
                minLength={6}
                maxLength={128}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={handleKeyCheck}
                onKeyUp={handleKeyCheck}
                placeholder="أدخل كلمة المرور الجديدة"
                className="w-full pl-3.5 pr-10 py-2.5 text-sm text-right bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={() => setShowNew((prev) => !prev)}
                aria-label={showNew ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                className="absolute inset-y-0 right-2 flex items-center px-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPassword && (
              <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-200 ${strength.barWidth} ${strength.colorClass}`}
                />
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label
              htmlFor="sec-confirm-password"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              تأكيد كلمة المرور الجديدة
            </label>
            <div className="relative">
              <input
                id="sec-confirm-password"
                type={showConfirm ? 'text' : 'password'}
                dir="ltr"
                autoComplete="new-password"
                required
                minLength={6}
                maxLength={128}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={handleKeyCheck}
                onKeyUp={handleKeyCheck}
                placeholder="أعد كتابة كلمة المرور الجديدة"
                className={`w-full pl-3.5 pr-10 py-2.5 text-sm text-right bg-slate-50 dark:bg-slate-950 border text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  passwordsMismatch
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                aria-label={showConfirm ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                className="absolute inset-y-0 right-2 flex items-center px-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordsMismatch && (
              <p className="mt-1 text-[11px] font-medium text-red-600 dark:text-red-400">
                كلمتا المرور غير متطابقتين.
              </p>
            )}
          </div>

          {(hasArabicChars || capsLockOn) && (
            <div className="space-y-1">
              {hasArabicChars && (
                <p className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    يوجد حروف عربية في كلمة المرور — تأكد من لغة لوحة المفاتيح قبل الحفظ.
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

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
          <button
            type="submit"
            disabled={submitting || passwordsMismatch}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{submitting ? 'جاري التحديث...' : 'حفظ كلمة المرور الجديدة'}</span>
          </button>
        </div>
      </form>

      {/* Optional Reset Back to Environment Password */}
      {authStatus?.passwordSource === 'dashboard' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                العودة إلى كلمة مرور متغير البيئة (ADMIN_PASSWORD)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                إلغاء كلمة المرور المخصصة من لوحة المدير والرجوع لاستخدام إعدادات الخادم الافتراضية.
              </p>
            </div>
            {!showResetBox && (
              <button
                type="button"
                onClick={() => setShowResetBox(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>استعادة كلمة مرور البيئة</span>
              </button>
            )}
          </div>

          {showResetBox && (
            <form
              onSubmit={handleResetSubmit}
              className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-end gap-3"
            >
              <div className="flex-1 min-w-[220px]">
                <label
                  htmlFor="reset-current-password"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  أدخل كلمة المرور الحالية للتأكيد
                </label>
                <input
                  id="reset-current-password"
                  type="password"
                  dir="ltr"
                  required
                  value={resetCurrentPassword}
                  onChange={(e) => setResetCurrentPassword(e.target.value)}
                  placeholder="كلمة المرور الحالية"
                  className="w-full px-3 py-2 text-sm text-right bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <button
                type="submit"
                disabled={resetting}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg transition-colors"
              >
                {resetting ? 'جاري الاستعادة...' : 'تأكيد الاستعادة'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetBox(false);
                  setResetCurrentPassword('');
                }}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                إلغاء
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
