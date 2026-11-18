import React, { useState } from 'react';
import {
  ExternalLink,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import {
  ORDER_STAGES,
  PROFILE_TYPES,
  WORKSHOP_TOOLS,
  getProfileTypeLabel,
} from '../data/tools.ts';
import type {
  OrderStage,
  ProfileCategory,
  ToolId,
  WorkshopOrder,
} from '../types.ts';

interface OrdersViewProps {
  orders: WorkshopOrder[];
  onNewOrder: () => void;
  onEditOrder: (order: WorkshopOrder) => void;
  onUpdateStage: (orderId: string, stage: OrderStage) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
  onOpenTool: (toolId: ToolId) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onNewOrder,
  onEditOrder,
  onUpdateStage,
  onDeleteOrder,
  onOpenTool,
}) => {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | OrderStage>('all');
  const [profileFilter, setProfileFilter] = useState<'all' | ProfileCategory>('all');

  const resolveOrderProfile = (order: WorkshopOrder): ProfileCategory =>
    order.profileType ||
    (/upvc|يو\s*بي\s*في\s*سي/i.test(order.projectType) ? 'upvc' : 'aluminum');

  const filtered = orders.filter((order) => {
    const orderProfile = resolveOrderProfile(order);
    const matchesProfile =
      profileFilter === 'all' ? true : orderProfile === profileFilter;
    const matchesStage =
      stageFilter === 'all' ? true : order.stage === stageFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      order.clientName.toLowerCase().includes(q) ||
      order.code.toLowerCase().includes(q) ||
      order.projectType.toLowerCase().includes(q) ||
      (order.profileSystem || '').toLowerCase().includes(q) ||
      getProfileTypeLabel(orderProfile).toLowerCase().includes(q) ||
      order.clientPhone.includes(q);
    return matchesProfile && matchesStage && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              أوامر الشغل ومتابعة الإنتاج
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              تتبع كل عميل من التصميم ثلاثي الأبعاد والتخصيم وحتى حساب التكلفة والتسليم.
            </p>
          </div>

          <button
            type="button"
            onClick={onNewOrder}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>أمر شغل جديد</span>
          </button>
        </div>

        {/* Search, Profile Filter & Stage Filter */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث باسم العميل أو الكود أو القطاع..."
                className="w-full pr-9 pl-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-950"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 ml-2 shrink-0">
                القطاع:
              </span>
              <button
                type="button"
                onClick={() => setProfileFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  profileFilter === 'all'
                    ? 'bg-blue-700 dark:bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                الكل
              </button>
              {PROFILE_TYPES.map((pt) => (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => setProfileFilter(pt.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    profileFilter === pt.id
                      ? 'bg-blue-700 dark:bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => setStageFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                stageFilter === 'all'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              كل المراحل ({orders.length})
            </button>
            {ORDER_STAGES.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStageFilter(st.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  stageFilter === st.id
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {orders.length === 0
                ? 'لا توجد أوامر شغل مسجلة حتى الآن'
                : 'لا توجد نتائج مطابقة للبحث'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {orders.length === 0
                ? 'أنشئ أول أمر شغل أو حول رسالة عميل من صفحة الفيسبوك لمتابعة التنفيذ.'
                : 'جرب تغيير كلمات البحث أو تصنيف المرحلة.'}
            </p>
            {orders.length === 0 && (
              <button
                type="button"
                onClick={onNewOrder}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>تسجيل أول أمر شغل</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <th className="py-3 px-4 whitespace-nowrap">الكود</th>
                  <th className="py-3 px-4 whitespace-nowrap">العميل</th>
                  <th className="py-3 px-4 whitespace-nowrap">نوع القطاع</th>
                  <th className="py-3 px-4 whitespace-nowrap">العمل والمقاسات</th>
                  <th className="py-3 px-4 whitespace-nowrap">المرحلة</th>
                  <th className="py-3 px-4 whitespace-nowrap">الإجمالي / المتبقي</th>
                  <th className="py-3 px-4 whitespace-nowrap">البرنامج المختص</th>
                  <th className="py-3 px-4 whitespace-nowrap text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filtered.map((order) => {
                  const orderProfile = resolveOrderProfile(order);
                  const tool = WORKSHOP_TOOLS.find(
                    (t) => t.id === order.activeToolId
                  );
                  const remaining = Math.max(
                    0,
                    (order.totalCost || 0) - (order.paidDeposit || 0)
                  );
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono tabular-nums text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {order.code}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {order.clientName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                          {order.clientPhone || 'بدون هاتف'} ·{' '}
                          <span className="font-sans">
                            {order.source === 'facebook'
                              ? 'فيسبوك'
                              : order.source === 'shop'
                              ? 'المحل'
                              : 'مباشر'}
                          </span>
                        </p>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-xs font-semibold">
                        <span
                          className={
                            orderProfile === 'upvc'
                              ? 'text-blue-700 dark:text-blue-400 font-mono'
                              : 'text-slate-700 dark:text-slate-300'
                          }
                        >
                          {getProfileTypeLabel(orderProfile)}
                        </span>
                        {order.profileSystem && (
                          <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                            {order.profileSystem}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {order.projectType}
                        </p>
                        {order.dimensionsNote && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {order.dimensionsNote}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <select
                          value={order.stage}
                          onChange={(e) =>
                            onUpdateStage(order.id, e.target.value as OrderStage)
                          }
                          aria-label={`تغيير مرحلة ${order.code}`}
                          className="px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          {ORDER_STAGES.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-4 font-mono tabular-nums text-xs whitespace-nowrap">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {order.totalCost.toLocaleString('en-US')} ج.م
                        </p>
                        <p className="text-slate-500 dark:text-slate-400">
                          متبقي: {remaining.toLocaleString('en-US')}
                        </p>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {tool && (
                          <button
                            type="button"
                            onClick={() => onOpenTool(tool.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-md transition-colors"
                          >
                            <span>{tool.shortName}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-left">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditOrder(order)}
                            title="تعديل"
                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteOrder(order.id)}
                            title="حذف"
                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-md"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
