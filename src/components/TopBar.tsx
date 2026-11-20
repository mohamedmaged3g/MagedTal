import React from 'react';
import { Menu, Plus } from 'lucide-react';
import { WORKSHOP_TOOLS } from '../data/tools.ts';
import type { ToolId } from '../types.ts';
import type { ActiveTab } from './Sidebar.tsx';

interface TopBarProps {
  activeTab: ActiveTab;
  activeToolId: ToolId;
  onOpenMobileMenu: () => void;
  onNewOrder: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  activeToolId,
  onOpenMobileMenu,
  onNewOrder,
}) => {
  const currentTool = WORKSHOP_TOOLS.find((t) => t.id === activeToolId);

  let sectionTitle = 'نظرة عامة';
  let detailTitle: string | null = null;

  if (activeTab === 'workspace') {
    sectionTitle = 'برامج الورشة المدمجة';
    detailTitle = currentTool?.name ?? null;
  } else if (activeTab === 'facebook') {
    sectionTitle = 'رسائل عملاء فيسبوك';
    detailTitle = 'صندوق الوارد والربط المباشر';
  } else if (activeTab === 'orders') {
    sectionTitle = 'أوامر الشغل والمتابعة';
    detailTitle = 'جدول الإنتاج والمقاسات';
  } else if (activeTab === 'pricing') {
    sectionTitle = 'أسعار المتر والحاسبة';
    detailTitle = 'تسعير أنواع الألومنيوم وUPVC والمطابخ';
  } else if (activeTab === 'security') {
    sectionTitle = 'الأمان وكلمة المرور';
    detailTitle = 'التحكم في كلمة مرور المدير';
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-8 shrink-0">
      {/* Zone 1 & 2: Mobile menu button + Breadcrumb Trail */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="فتح القائمة"
          className="lg:hidden p-2 -mr-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav
          aria-label="مسار الصفحة"
          className="flex items-center gap-2 text-sm min-w-0 truncate"
        >
          <span className="font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0">
            الورشة المركزية
          </span>
          <span className="text-slate-400 dark:text-slate-500 shrink-0" aria-hidden="true">
            /
          </span>
          <span className="text-slate-600 dark:text-slate-300 whitespace-nowrap shrink-0">
            {sectionTitle}
          </span>
          {detailTitle && (
            <>
              <span
                className="text-slate-400 dark:text-slate-500 hidden sm:inline shrink-0"
                aria-hidden="true"
              >
                /
              </span>
              <span className="text-slate-900 dark:text-slate-100 font-medium truncate hidden sm:inline">
                {detailTitle}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Zone 3: Single Primary Action */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onNewOrder}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>أمر شغل جديد</span>
        </button>
      </div>
    </header>
  );
};
