import React from 'react';
import {
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  Plus,
} from 'lucide-react';
import {
  FACEBOOK_PAGE_ID,
  FACEBOOK_PAGE_URL,
  ORDER_STAGES,
  WORKSHOP_TOOLS,
} from '../data/tools.ts';
import type {
  FacebookInquiry,
  FacebookStatusResponse,
  ToolId,
  WorkshopOrder,
} from '../types.ts';
import { getToolIcon, type ActiveTab } from './Sidebar.tsx';

interface OverviewViewProps {
  orders: WorkshopOrder[];
  inquiries: FacebookInquiry[];
  fbStatus: FacebookStatusResponse | null;
  onOpenTool: (toolId: ToolId) => void;
  onSelectTab: (tab: ActiveTab) => void;
  onNewOrder: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  orders,
  inquiries,
  fbStatus,
  onOpenTool,
  onSelectTab,
  onNewOrder,
}) => {
  const activeOrders = orders.filter((o) => o.stage !== 'delivery');
  const unreadInquiries = inquiries.filter((i) => i.status === 'new');
  const totalContractValue = orders.reduce((acc, o) => acc + (o.totalCost || 0), 0);

  return (
    <div className="space-y-8">
      {/* KPI Strip */}
      <section aria-label="ملخص الورشة">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">إجمالي أوامر الشغل</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {orders.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">مسجلة في النظام المركزي</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">أوامر قيد التنفيذ</p>
            <p className="mt-2 text-2xl font-bold text-blue-700 font-mono tabular-nums">
              {activeOrders.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">تصميم · تخصيم · تصنيع</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">رسائل فيسبوك الجديدة</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {unreadInquiries.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              من أصل <span className="font-mono tabular-nums">{inquiries.length}</span> محادثة مسجلة
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">إجمالي قيمة الأعمال</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {totalContractValue.toLocaleString('en-US')}{' '}
              <span className="text-sm font-sans font-medium text-slate-500">ج.م</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">تقديرات العقود النشطة</p>
          </div>
        </div>
      </section>

      {/* 5 Programs Unified Grid */}
      <section aria-label="برامج الورشة المتصلة">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              منظومة برامج الورشة المتصلة
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              افتح أي برنامج مباشرة داخل مساحة العمل المركزية أو في نافذة مستقلة لمتابعة نفس المشروع.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('workspace')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0"
          >
            <span>فتح مساحة العمل المدمجة</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {WORKSHOP_TOOLS.map((tool) => (
            <div
              key={tool.id}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between transition-colors hover:border-slate-300"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                  <span>{tool.stageLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[11px] text-slate-400 truncate">
                    {tool.englishName}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                    {getToolIcon(tool.id)}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 truncate">
                    {tool.name}
                  </h2>
                </div>

                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onOpenTool(tool.id)}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  فتح داخل المنصة
                </button>

                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <span>نافذة مستقلة</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}

          {/* 6th Card: Facebook Marketing & Customer Inbox */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between transition-colors hover:border-slate-300">
            <div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                <span>التسويق وخدمة العملاء</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[11px] text-slate-400">
                  ID: {fbStatus?.pageId || FACEBOOK_PAGE_ID}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-slate-900 truncate">
                  رسائل صفحة فيسبوك التسويقية
                </h2>
              </div>

              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                {fbStatus?.graphApiConfigured
                  ? 'الربط المباشر عبر Meta Graph API مفعّل لاستقبال رسائل العملاء والرد عليها وتحويلها لأوامر شغل.'
                  : 'استقبل استفسارات عملاء صفحة فيسبوك عبر Webhook أو سجلها يدوياً وحولها مباشرة إلى أوامر شغل بالورشة.'}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onSelectTab('facebook')}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                إدارة رسائل العملاء
              </button>

              <a
                href={fbStatus?.pageUrl || FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <span>زيارة الصفحة</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Split Recent Orders & Recent Facebook Inquiries */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <h2 className="text-sm font-bold text-slate-900">أحدث أوامر الشغل</h2>
            <button
              type="button"
              onClick={() => onSelectTab('orders')}
              className="text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap"
            >
              عرض الكل
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-medium text-slate-800">
                لا توجد أوامر شغل مسجلة بعد
              </p>
              <p className="text-xs text-slate-500 mt-1">
                سجل أول أمر شغل لربط العميل بالتصميم والتخصيم والتسعير في مكان واحد.
              </p>
              <button
                type="button"
                onClick={onNewOrder}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة أول أمر شغل</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.slice(0, 5).map((order) => {
                const stageInfo = ORDER_STAGES.find((s) => s.id === order.stage);
                return (
                  <div
                    key={order.id}
                    className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 truncate">
                        <span className="font-mono text-xs text-slate-500">
                          {order.code}
                        </span>
                        <span className="truncate">{order.clientName}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {order.projectType} · {stageInfo?.label}
                      </p>
                    </div>
                    <div className="text-left shrink-0">
                      <p className="text-xs font-mono tabular-nums font-semibold text-slate-900">
                        {order.totalCost.toLocaleString('en-US')} ج.م
                      </p>
                      <button
                        type="button"
                        onClick={() => onOpenTool(order.activeToolId)}
                        className="text-[11px] font-medium text-blue-700 hover:underline mt-0.5"
                      >
                        فتح البرنامج
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Facebook Messages */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <h2 className="text-sm font-bold text-slate-900">أحدث استفسارات فيسبوك</h2>
            <button
              type="button"
              onClick={() => onSelectTab('facebook')}
              className="text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap"
            >
              فتح صندوق الرسائل
            </button>
          </div>

          {inquiries.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-medium text-slate-800">
                صندوق رسائل فيسبوك فارغ حالياً
              </p>
              <p className="text-xs text-slate-500 mt-1">
                يمكنك ربط Webhook الصفحة لاستقبال رسائل ماسنجر تلقائياً أو تسجيل استفسارات العملاء يدوياً.
              </p>
              <button
                type="button"
                onClick={() => onSelectTab('facebook')}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <span>إعداد صندوق رسائل فيسبوك</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {inquiries.slice(0, 5).map((inq) => {
                const lastMsg = inq.messages[inq.messages.length - 1];
                return (
                  <div
                    key={inq.id}
                    className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 truncate">
                        <span className="truncate">{inq.customerName}</span>
                        <span className="text-xs font-normal text-slate-400">·</span>
                        <span className="text-xs font-normal text-slate-500">
                          {inq.status === 'new'
                            ? 'جديد'
                            : inq.status === 'replied'
                            ? 'تم الرد'
                            : 'تم التحويل لأمر شغل'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 truncate">
                        {lastMsg ? lastMsg.text : inq.projectInterest}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectTab('facebook')}
                      className="text-xs font-medium text-blue-700 hover:underline whitespace-nowrap shrink-0"
                    >
                      عرض المحادثة
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
