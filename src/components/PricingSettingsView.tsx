import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Plus,
  RotateCcw,
  Save,
  Tag,
  Trash2,
} from 'lucide-react';
import type { EstimatorOption, EstimatorPricingConfig } from '../types.ts';

interface PricingSettingsViewProps {
  pricingConfig: EstimatorPricingConfig;
  onSavePricing: (next: EstimatorPricingConfig) => Promise<void>;
  onResetPricing: () => Promise<void>;
}

const UNIT_OPTIONS = [
  'أمتار طولية (علوي + سفلي)',
  'المساحة الإجمالية بالمتر المربع (م²)',
  'العدد (وحدة / قطعة)',
];

const FORM_INTEREST_OPTIONS = [
  'مطبخ كلادينج / ألوميتال',
  'شبابيك وأبواب ألومنيوم',
  'شبابيك وأبواب UPVC',
  'تجهيز واجهة أو شقة كاملة',
  'تصميم مطبخ 3D ومقايسة',
];

function formatRateRange(min: number, max: number): string {
  const safeMin = Math.max(0, Math.round(min));
  const safeMax = Math.max(safeMin, Math.round(max));
  if (safeMin === safeMax) {
    return `${safeMin.toLocaleString('en-US')} ج.م`;
  }
  return `${safeMin.toLocaleString('en-US')} – ${safeMax.toLocaleString('en-US')} ج.م`;
}

export const PricingSettingsView: React.FC<PricingSettingsViewProps> = ({
  pricingConfig,
  onSavePricing,
  onResetPricing,
}) => {
  const [items, setItems] = useState<EstimatorOption[]>(() =>
    pricingConfig.items.map((item) => ({ ...item }))
  );
  const [premiumIncreasePercent, setPremiumIncreasePercent] = useState<number>(
    pricingConfig.premiumIncreasePercent
  );
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setItems(pricingConfig.items.map((item) => ({ ...item })));
    setPremiumIncreasePercent(pricingConfig.premiumIncreasePercent);
  }, [pricingConfig]);

  const hasChanges =
    premiumIncreasePercent !== pricingConfig.premiumIncreasePercent ||
    JSON.stringify(items) !== JSON.stringify(pricingConfig.items);

  const updateItem = (
    index: number,
    patch: Partial<EstimatorOption>
  ) => {
    setSuccessMessage(null);
    setError(null);
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item))
    );
  };

  const handleAddType = () => {
    setSuccessMessage(null);
    setError(null);
    const nextItem: EstimatorOption = {
      id: `custom_${Date.now()}`,
      label: 'نوع جديد (ألومنيوم / UPVC)',
      formInterest: 'شبابيك وأبواب ألومنيوم',
      unitLabel: 'المساحة الإجمالية بالمتر المربع (م²)',
      minRate: 4000,
      maxRate: 5000,
      defaultQty: 6,
      minQty: 1,
      maxQty: 40,
    };
    setItems((prev) => [...prev, nextItem]);
  };

  const handleDeleteType = (index: number) => {
    if (items.length <= 1) return;
    setSuccessMessage(null);
    setError(null);
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleFixSinglePrice = (index: number) => {
    const target = items[index];
    if (!target) return;
    updateItem(index, { maxRate: target.minRate });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (items.length === 0) {
      setError('يجب وجود نوع واحد على الأقل.');
      return;
    }

    for (const item of items) {
      if (!item.label.trim()) {
        setError('يرجى إدخال اسم واضح لكل نوع قبل الحفظ.');
        return;
      }
      if (!Number.isFinite(item.minRate) || item.minRate < 0) {
        setError(`يرجى إدخال سعر متر صحيح للنوع: ${item.label}`);
        return;
      }
      if (!Number.isFinite(item.maxRate) || item.maxRate < item.minRate) {
        setError(
          `الحد الأقصى لسعر المتر يجب أن يكون أكبر من أو يساوي الحد الأدنى للنوع: ${item.label}`
        );
        return;
      }
    }

    setSaving(true);
    try {
      await onSavePricing({
        items: items.map((item) => ({
          ...item,
          label: item.label.trim(),
          unitLabel: item.unitLabel.trim() || UNIT_OPTIONS[1],
          formInterest: item.formInterest.trim() || item.label.trim(),
          minRate: Math.max(0, Math.round(item.minRate)),
          maxRate: Math.max(
            Math.max(0, Math.round(item.minRate)),
            Math.round(item.maxRate)
          ),
        })),
        premiumIncreasePercent: Math.min(
          100,
          Math.max(0, Math.round(premiumIncreasePercent))
        ),
      });
      setSuccessMessage(
        'تم حفظ أسعار المتر بنجاح وتحديث حاسبة التكلفة في الموقع الرئيسي فوراً.'
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'تعذر حفظ الأسعار، حاول مرة أخرى.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmReset = async () => {
    setResetting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await onResetPricing();
      setConfirmReset(false);
      setSuccessMessage('تمت استعادة الأسعار الافتراضية بنجاح.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'تعذر استعادة الأسعار الافتراضية.'
      );
    } finally {
      setResetting(false);
    }
  };

  const premiumMultiplier = 1 + Math.max(0, premiumIncreasePercent) / 100;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-xs font-mono">
            <Tag className="w-3.5 h-3.5" />
            <span>إعدادات تسعير حاسبة الموقع</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            تحديد سعر المتر لكل نوع
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            عدّل سعر المتر (أو النطاق السعري من – إلى) لكل نوع من المطابخ وشبابيك الألومنيوم وقطاعات UPVC. أي تغيير يتم حفظه يظهر مباشرة للعملاء في حاسبة التكلفة.
          </p>
          {pricingConfig.updatedAt && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              آخر تحديث:{' '}
              <span className="font-mono">
                {new Date(pricingConfig.updatedAt).toLocaleString('ar-EG')}
              </span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAddType}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة نوع جديد</span>
          </button>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة الافتراضي</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-lg px-2.5 py-1.5">
              <span className="text-[11px] font-medium text-amber-900 dark:text-amber-200">
                تأكيد الاستعادة؟
              </span>
              <button
                type="button"
                disabled={resetting}
                onClick={handleConfirmReset}
                className="px-2 py-1 text-[11px] font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md disabled:opacity-50"
              >
                {resetting ? '...' : 'نعم'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                إلغاء
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !hasChanges}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'جاري الحفظ...' : 'حفظ الأسعار'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Alerts */}
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-2.5 p-3.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Premium Accessories Increase Percentage */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-0.5 max-w-xl">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            نسبة الزيادة لمستوى الإكسسوارات الممتاز (سوفت كلوز)
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            عندما يختار العميل في الحاسبة مستوى «ممتاز سوفت كلوز»، تُضاف هذه النسبة تلقائياً على سعر المتر الأساسي لكل نوع.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <label
            htmlFor="premium-increase-percent"
            className="text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            نسبة الزيادة (%)
          </label>
          <input
            id="premium-increase-percent"
            type="number"
            min={0}
            max={100}
            step={1}
            dir="ltr"
            value={premiumIncreasePercent}
            onChange={(e) => {
              setSuccessMessage(null);
              setError(null);
              const val = Number(e.target.value);
              setPremiumIncreasePercent(
                Number.isFinite(val) ? Math.min(100, Math.max(0, val)) : 0
              );
            }}
            className="w-24 px-3 py-2 text-sm font-mono font-semibold tabular-nums text-center bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            +{premiumIncreasePercent}%
          </span>
        </div>
      </div>

      {/* Meter Pricing Items List */}
      <div className="space-y-4">
        {items.map((item, idx) => {
          const hasRangeError = item.maxRate < item.minRate;
          const premiumMin = Math.round(item.minRate * premiumMultiplier);
          const premiumMax = Math.round(item.maxRate * premiumMultiplier);
          const sampleMinTotal =
            Math.round((item.defaultQty * item.minRate) / 100) * 100;
          const sampleMaxTotal =
            Math.round((item.defaultQty * item.maxRate) / 100) * 100;

          return (
            <div
              key={item.id}
              className={`bg-white dark:bg-slate-900 border rounded-xl p-5 space-y-4 transition-colors ${
                hasRangeError
                  ? 'border-red-300 dark:border-red-800'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
                  <span className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <label className="sr-only" htmlFor={`label-${item.id}`}>
                      اسم النوع
                    </label>
                    <input
                      id={`label-${item.id}`}
                      type="text"
                      required
                      value={item.label}
                      onChange={(e) => updateItem(idx, { label: e.target.value })}
                      placeholder="اسم النوع (مثال: مطبخ كلادينج ألومنيوم)"
                      className="w-full px-3 py-1.5 text-sm font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteType(idx)}
                    aria-label={`حذف ${item.label}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div>
                  <label
                    htmlFor={`minRate-${item.id}`}
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    سعر المتر الأدنى (ج.م)
                  </label>
                  <input
                    id={`minRate-${item.id}`}
                    type="number"
                    min={0}
                    step={50}
                    dir="ltr"
                    value={item.minRate}
                    onChange={(e) =>
                      updateItem(idx, {
                        minRate: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className="w-full px-3 py-2 text-sm font-mono font-semibold tabular-nums bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label
                      htmlFor={`maxRate-${item.id}`}
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      سعر المتر الأقصى (ج.م)
                    </label>
                    {item.minRate !== item.maxRate && (
                      <button
                        type="button"
                        onClick={() => handleFixSinglePrice(idx)}
                        className="text-[11px] font-medium text-blue-700 dark:text-blue-400 hover:underline"
                      >
                        تثبيت سعر واحد
                      </button>
                    )}
                  </div>
                  <input
                    id={`maxRate-${item.id}`}
                    type="number"
                    min={0}
                    step={50}
                    dir="ltr"
                    value={item.maxRate}
                    onChange={(e) =>
                      updateItem(idx, {
                        maxRate: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className={`w-full px-3 py-2 text-sm font-mono font-semibold tabular-nums bg-slate-50 dark:bg-slate-950 border text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      hasRangeError
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                  {hasRangeError && (
                    <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                      يجب أن يكون السعر الأقصى ≥ السعر الأدنى
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`unit-${item.id}`}
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    وحدة القياس
                  </label>
                  <select
                    id={`unit-${item.id}`}
                    value={
                      UNIT_OPTIONS.includes(item.unitLabel)
                        ? item.unitLabel
                        : UNIT_OPTIONS[1]
                    }
                    onChange={(e) =>
                      updateItem(idx, { unitLabel: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {UNIT_OPTIONS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor={`interest-${item.id}`}
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    الربط مع نموذج المقايسة
                  </label>
                  <select
                    id={`interest-${item.id}`}
                    value={
                      FORM_INTEREST_OPTIONS.includes(item.formInterest)
                        ? item.formInterest
                        : FORM_INTEREST_OPTIONS[0]
                    }
                    onChange={(e) =>
                      updateItem(idx, { formInterest: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {FORM_INTEREST_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live Price Preview Strip */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-slate-950/60 -mx-5 -mb-5 px-5 py-3 rounded-b-xl">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
                  <span className="text-slate-600 dark:text-slate-400">
                    سعر المتر القياسي:{' '}
                    <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                      {formatRateRange(item.minRate, item.maxRate)}
                    </strong>
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    سعر المتر الممتاز (+{premiumIncreasePercent}%):{' '}
                    <strong className="font-mono tabular-nums text-blue-700 dark:text-blue-400">
                      {formatRateRange(premiumMin, premiumMax)}
                    </strong>
                  </span>
                </div>
                <span className="text-slate-500 dark:text-slate-400">
                  معاينة لـ{' '}
                  <span className="font-mono font-semibold">{item.defaultQty}</span>{' '}
                  م:{' '}
                  <strong className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                    {formatRateRange(sampleMinTotal, sampleMaxTotal)}
                  </strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Save Reminder on Changes */}
      {hasChanges && (
        <div className="sticky bottom-4 z-20 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 rounded-xl px-5 py-3.5 shadow-lg flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs sm:text-sm font-medium">
            يوجد تعديلات غير محفوظة على أسعار المتر.
          </span>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'جاري الحفظ...' : 'حفظ وتحديث الحاسبة الآن'}</span>
          </button>
        </div>
      )}
    </form>
  );
};
