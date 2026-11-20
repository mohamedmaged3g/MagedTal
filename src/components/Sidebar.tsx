import React from 'react';
import {
  Box,
  Calculator,
  ClipboardList,
  ExternalLink,
  KeyRound,
  LayoutDashboard,
  Layers,
  LogOut,
  MessageSquare,
  Moon,
  Ruler,
  Store,
  Sun,
  Tag,
  X,
} from 'lucide-react';
import { FACEBOOK_PAGE_URL, WORKSHOP_TOOLS } from '../data/tools.ts';
import type { ToolId } from '../types.ts';
import { PWAInstallButton } from './PWAInstallButton.tsx';

export type ActiveTab =
  | 'overview'
  | 'workspace'
  | 'facebook'
  | 'orders'
  | 'pricing'
  | 'security';

interface SidebarProps {
  activeTab: ActiveTab;
  activeToolId: ToolId;
  unreadInquiriesCount: number;
  activeOrdersCount: number;
  mobileOpen: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: (nextTheme: 'light' | 'dark') => void;
  onReturnToWebsite: () => void;
  onLogout: () => void;
  onCloseMobile: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenTool: (toolId: ToolId) => void;
}

export function getToolIcon(toolId: ToolId): React.ReactNode {
  switch (toolId) {
    case 'kitchen-3d-studio':
      return <Box className="w-4 h-4 shrink-0" />;
    case 'takhseem-pro':
      return <Ruler className="w-4 h-4 shrink-0" />;
    case 'kitchen-workshop':
      return <Layers className="w-4 h-4 shrink-0" />;
    case 'workshop-manager':
      return <Calculator className="w-4 h-4 shrink-0" />;
    case 'shop-manager':
      return <Store className="w-4 h-4 shrink-0" />;
  }
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  activeToolId,
  unreadInquiriesCount,
  activeOrdersCount,
  mobileOpen,
  theme,
  onToggleTheme,
  onReturnToWebsite,
  onLogout,
  onCloseMobile,
  onSelectTab,
  onOpenTool,
}) => {
  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    {
      id: 'overview',
      label: 'نظرة عامة',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'workspace',
      label: 'برامج الورشة المدمجة',
      icon: <Layers className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'facebook',
      label: 'رسائل عملاء فيسبوك',
      icon: <MessageSquare className="w-4 h-4 shrink-0" />,
      count: unreadInquiriesCount,
    },
    {
      id: 'orders',
      label: 'أوامر الشغل والمتابعة',
      icon: <ClipboardList className="w-4 h-4 shrink-0" />,
      count: activeOrdersCount,
    },
    {
      id: 'pricing',
      label: 'أسعار المتر والحاسبة',
      icon: <Tag className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'security',
      label: 'الأمان وكلمة المرور',
      icon: <KeyRound className="w-4 h-4 shrink-0" />,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <button
          type="button"
          onClick={() => {
            onSelectTab('overview');
            onCloseMobile();
          }}
          className="flex items-center gap-3 text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md"
        >
          <img
            src="/assets/aistudio/image_3de2cff6.png"
            alt="شعار ماجدتال"
            className="w-9 h-9 rounded-lg bg-white p-0.5 object-contain border border-slate-200 dark:border-slate-700 shrink-0"
          />
          <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
            ورشة ماجدتال المركزية
          </span>
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="إغلاق القائمة"
          className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        <div>
          <p className="px-3 mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            الأقسام الرئيسية
          </p>
          <nav className="space-y-1" aria-label="التنقل الرئيسي">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </span>
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span
                      className={`font-mono tabular-nums text-xs ${
                        isActive
                          ? 'text-slate-300 dark:text-slate-600'
                          : 'text-blue-700 dark:text-blue-400 font-semibold'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 5 Deployed Programs Quick Launch */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="px-3 mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            البرامج المتصلة (5)
          </p>
          <div className="space-y-1">
            {WORKSHOP_TOOLS.map((tool) => {
              const isToolSelected =
                activeTab === 'workspace' && activeToolId === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    onOpenTool(tool.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    isToolSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {getToolIcon(tool.id)}
                    <span className="truncate">{tool.shortName}</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                    فتح
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Theme Toggle & Facebook Page Link Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5 shrink-0">
        <div
          className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg"
          role="group"
          aria-label="مظهر الواجهة"
        >
          <button
            type="button"
            onClick={() => onToggleTheme('light')}
            aria-pressed={theme === 'light'}
            className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              theme === 'light'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5 shrink-0" />
            <span>فاتح</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleTheme('dark')}
            aria-pressed={theme === 'dark'}
            className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              theme === 'dark'
                ? 'bg-slate-900 text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5 shrink-0" />
            <span>داكن</span>
          </button>
        </div>

        <PWAInstallButton />

        <button
          type="button"
          onClick={() => {
            onReturnToWebsite();
            onCloseMobile();
          }}
          className="flex items-center justify-center w-full px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
        >
          عرض الموقع الرئيسي
        </button>

        <a
          href={FACEBOOK_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-3 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors whitespace-nowrap"
        >
          <span className="truncate">صفحة فيسبوك التسويقية</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
        </a>

        <button
          type="button"
          onClick={() => {
            onLogout();
            onCloseMobile();
          }}
          className="flex items-center justify-center gap-1.5 w-full px-3 py-2 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors whitespace-nowrap"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-[264px] shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/70"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative w-[280px] max-w-[85vw] h-full z-10">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
