import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  LogOut,
  MapPin,
  Phone,
  Save,
  Search,
  User,
  X,
} from 'lucide-react';
import { getProfileTypeLabel } from '../data/tools.ts';
import type { CustomerProfile, UserQuoteRecord } from '../types.ts';

interface CustomerAccountModalProps {
  isOpen: boolean;
  profile: CustomerProfile | null;
  quotes: UserQuoteRecord[];
  onClose: () => void;
  onSaveProfile: (patch: {
    displayName: string;
    phone: string;
    city: string;
  }) => Promise<void>;
  onSignOut: () => Promise<void>;
  onTrackReferenceCode: (referenceCode: string) => void;
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  profile,
  quotes,
  onClose,
  onSaveProfile,
  onSignOut,
  onTrackReferenceCode,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile && isOpen) {
      setDisplayName(profile.displayName || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
      setSavedNotice(false);
      setError(null);
    }
  }, [profile, isOpen]);

  if (!isOpen || !profile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedNotice(false);
    const cleanName = displayName.trim();
    if (!cleanName) {
      setError('يرجى إدخال الاسم.');
      return;
    }

    setSaving(true);
    try {
      await onSaveProfile({
        displayName: cleanName,
        phone: phone.trim(),
        city: city.trim(),
      });
      setSavedNotice(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'تعذر حفظ بيانات الحساب، حاول مرة أخرى.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 dark:bg-black/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-account-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {profile.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile.displayName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
            ) : (
              <span className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </span>
            )}
            <div className="min-w-0">
              <h2
                id="customer-account-title"
                className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate"
              >
                {profile.displayName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                {profile.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق نافذة الحساب"
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Profile Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                بيانات التواصل السريعة
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                تُستخدم لتعبئة نموذج طلب المقايسة تلقائياً وتسهيل تواصل الورشة معك.
              </p>
            </div>

            {error && (
              <div className="p-2.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg">
                {error}
              </div>
            )}

            {savedNotice && (
              <div className="flex items-center gap-2 p-2.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>تم حفظ بياناتك بنجاح.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label
                  htmlFor="acct-display-name"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  الاسم الكامل
                </label>
                <input
                  id="acct-display-name"
                  type="text"
                  required
                  maxLength={120}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label
                  htmlFor="acct-phone"
                  className="flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>رقم الهاتف / واتساب</span>
                </label>
                <input
                  id="acct-phone"
                  type="tel"
                  dir="ltr"
                  maxLength={32}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2 text-xs text-right font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label
                  htmlFor="acct-city"
                  className="flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  <MapPin className="w-3 h-3" />
                  <span>المدينة / المنطقة</span>
                </label>
                <input
                  id="acct-city"
                  type="text"
                  maxLength={100}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="مثال: القاهرة الجديدة / أكتوبر"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'جاري الحفظ...' : 'حفظ بيانات الحساب'}</span>
              </button>
            </div>
          </form>

          {/* Saved Customer Quotes History */}
          <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  طلبات المقايسة المسجّلة بحسابك ({quotes.length})
                </h3>
              </div>
            </div>

            {quotes.length === 0 ? (
              <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                لم ترسل أي طلب مقايسة بعد. عند إرسال أي طلب من الموقع سيظهر هنا تلقائياً برقم المتابعة الخاص به.
              </div>
            ) : (
              <div className="space-y-2.5">
                {quotes.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400">
                        {item.referenceCode}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {new Date(item.createdAtMs).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {item.projectInterest} · {getProfileTypeLabel(item.profileType)}
                      {item.profileSystem ? ` (${item.profileSystem})` : ''}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                    <div className="pt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          onTrackReferenceCode(item.referenceCode);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400 hover:underline"
                      >
                        <Search className="w-3 h-3" />
                        <span>متابعة حالة الطلب</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={async () => {
              await onSignOut();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-900 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
