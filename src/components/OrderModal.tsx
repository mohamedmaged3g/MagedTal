import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ORDER_STAGES, WORKSHOP_TOOLS } from '../data/tools.ts';
import type { OrderSource, OrderStage, ToolId, WorkshopOrder } from '../types.ts';

interface OrderModalProps {
  isOpen: boolean;
  initialOrder?: WorkshopOrder | null;
  prefill?: {
    clientName?: string;
    clientPhone?: string;
    source?: OrderSource;
    projectType?: string;
    dimensionsNote?: string;
    linkedInquiryId?: string;
  } | null;
  onClose: () => void;
  onSave: (payload: {
    id?: string;
    clientName: string;
    clientPhone: string;
    source: OrderSource;
    projectType: string;
    dimensionsNote: string;
    stage: OrderStage;
    activeToolId: ToolId;
    totalCost: number;
    paidDeposit: number;
    linkedInquiryId?: string;
  }) => Promise<void>;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  initialOrder,
  prefill,
  onClose,
  onSave,
}) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [source, setSource] = useState<OrderSource>('direct');
  const [projectType, setProjectType] = useState('مطبخ ألومنيوم');
  const [dimensionsNote, setDimensionsNote] = useState('');
  const [stage, setStage] = useState<OrderStage>('design_3d');
  const [activeToolId, setActiveToolId] = useState<ToolId>('kitchen-3d-studio');
  const [totalCost, setTotalCost] = useState('0');
  const [paidDeposit, setPaidDeposit] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (initialOrder) {
      setClientName(initialOrder.clientName);
      setClientPhone(initialOrder.clientPhone);
      setSource(initialOrder.source);
      setProjectType(initialOrder.projectType);
      setDimensionsNote(initialOrder.dimensionsNote);
      setStage(initialOrder.stage);
      setActiveToolId(initialOrder.activeToolId);
      setTotalCost(String(initialOrder.totalCost));
      setPaidDeposit(String(initialOrder.paidDeposit));
    } else if (prefill) {
      setClientName(prefill.clientName || '');
      setClientPhone(prefill.clientPhone || '');
      setSource(prefill.source || 'facebook');
      setProjectType(prefill.projectType || 'مطبخ ألومنيوم');
      setDimensionsNote(prefill.dimensionsNote || '');
      setStage('design_3d');
      setActiveToolId('kitchen-3d-studio');
      setTotalCost('0');
      setPaidDeposit('0');
    } else {
      setClientName('');
      setClientPhone('');
      setSource('direct');
      setProjectType('مطبخ ألومنيوم');
      setDimensionsNote('');
      setStage('design_3d');
      setActiveToolId('kitchen-3d-studio');
      setTotalCost('0');
      setPaidDeposit('0');
    }
  }, [isOpen, initialOrder, prefill]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setError('يرجى إدخال اسم العميل');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSave({
        id: initialOrder?.id,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        source,
        projectType: projectType.trim() || 'مطبخ ألومنيوم',
        dimensionsNote: dimensionsNote.trim(),
        stage,
        activeToolId,
        totalCost: Number(totalCost) || 0,
        paidDeposit: Number(paidDeposit) || 0,
        linkedInquiryId: initialOrder?.linkedInquiryId ?? prefill?.linkedInquiryId,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر حفظ أمر الشغل');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-title"
    >
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 id="order-modal-title" className="text-base font-bold text-slate-900">
            {initialOrder ? `تعديل أمر شغل ${initialOrder.code}` : 'تسجيل أمر شغل جديد'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                اسم العميل *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="مثال: أحمد محمود"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                رقم الهاتف / واتساب
              </label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="01000000000"
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                نوع العمل
              </label>
              <input
                type="text"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                placeholder="مطبخ ألوميتال / شبابيك قطاع خاص..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                مصدر العميل
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as OrderSource)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="facebook">صفحة فيسبوك</option>
                <option value="shop">زيارة المحل</option>
                <option value="direct">عميل مباشر / هاتف</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                المرحلة الحالية
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as OrderStage)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {ORDER_STAGES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                البرنامج المرتبط بالتنفيذ
              </label>
              <select
                value={activeToolId}
                onChange={(e) => setActiveToolId(e.target.value as ToolId)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {WORKSHOP_TOOLS.map((tool) => (
                  <option key={tool.id} value={tool.id}>
                    {tool.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                التكلفة الإجمالية المقدرة (ج.م)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                العربون المدفوع (ج.م)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={paidDeposit}
                onChange={(e) => setPaidDeposit(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              المقاسات والملاحظات الفنية (القطاع، اللون، الزجاج)
            </label>
            <textarea
              rows={3}
              value={dimensionsNote}
              onChange={(e) => setDimensionsNote(e.target.value)}
              placeholder="مثال: مطبخ 3.20 × 2.40 متر كلادينج أبيض × أسود، قطاع PS صغير للشبابيك..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-lg transition-colors"
            >
              {submitting ? 'جاري الحفظ...' : initialOrder ? 'حفظ التعديلات' : 'إنشاء أمر الشغل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
